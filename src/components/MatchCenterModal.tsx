import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FastForward,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { AudioSynth } from '../lib/audioSynth';
import { ARCHETYPE_LABELS } from '../lib/labels';
import {useDialog} from '../lib/useDialog';
import {GameRecap} from './GameRecap';
import { recommendTactics, seriesFinished, simulateNextGame, summarizeSeries } from '../lib/simulator';
import { PHASE_TACTICS, TACTIC_METADATA } from '../lib/tacticsMatrix';
import {
  Chapter,
  CareerMatchSave,
  EarlyTactic,
  LateTactic,
  MatchSimulationResult,
  MidTactic,
  SeriesFormat,
  TacticCode,
  TeamSnapshot,
} from '../types';

interface MatchCenterModalProps {
  chapter: Chapter;
  onClose: () => void;
  onVictoryClaim: (chapterId: number) => boolean;
}

export const MatchCenterModal: React.FC<MatchCenterModalProps> = ({
  chapter,
  onClose,
  onVictoryClaim,
}) => {
  const { club, getTeamSnapshot, activeMatch, saveActiveMatch } = useGame();
  const saved=activeMatch?.chapterId===chapter.id?activeMatch:null;
  const dialog=useDialog(onClose);
  const playerSnapshot = useRef(saved?.playerSnapshot || getTeamSnapshot()).current;
  const seedRef=useRef(saved?.seed ?? Date.now());
  const [focusPhase,setFocusPhase]=useState<'EARLY'|'MID'|'LATE'>(saved?.focusPhase || 'MID');
  const [manualAll,setManualAll]=useState(saved?.manualAll || false);

  // Create opponent snapshot from chapter
  const opponentSnapshot = useRef<TeamSnapshot>(saved?.opponentSnapshot || chapter.opponent.snapshot || {
    teamName: chapter.opponent.name,
    logoKey: chapter.opponent.logoKey,
    teamOvr: chapter.opponent.ovr,
    synergyBonus: 3,
    ratings: {
      lane: chapter.opponent.ovr,
      macro: chapter.opponent.ovr,
      teamfight: chapter.opponent.ovr,
    },
    roster: chapter.opponent.rosterPreview.map((p) => ({
      role: p.role,
      displayName: p.displayName,
      ovr: p.ovr,
      effectiveStats: {
        mechanics: p.ovr,
        macro: p.ovr,
        teamwork: p.ovr,
        mental: p.ovr,
        championPool: p.ovr,
      },
      archetype: 'Flexible',
    })),
  }).current;

  // Tactical selections for the match
  const [selectedEarly, setSelectedEarly] = useState<EarlyTactic>(saved?.selectedEarly || 'SAFE_FARM');
  const [selectedMid, setSelectedMid] = useState<MidTactic>(saved?.selectedMid || 'CONTEST_OBJECTIVE');
  const [selectedLate, setSelectedLate] = useState<LateTactic>(saved?.selectedLate || 'FORCE_TEAMFIGHT');

  // Match progression state
  const [matchState, setMatchState] = useState<CareerMatchSave['matchState']>(saved?.matchState || 'PREVIEW');
  const [activeGameIndex, setActiveGameIndex] = useState(saved?.activeGameIndex || 0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(saved?.currentPhaseIndex || 0);
  const [simulationResult, setSimulationResult] = useState<MatchSimulationResult | null>(saved?.simulationResult || null);
  const [isFastMode, setIsFastMode] = useState(false);
  const [isRewardClaimed, setIsRewardClaimed] = useState(false);
  useEffect(()=>{
    saveActiveMatch({chapterId:chapter.id,seed:seedRef.current,playerSnapshot,opponentSnapshot,matchState,activeGameIndex,currentPhaseIndex,simulationResult,selectedEarly,selectedMid,selectedLate,focusPhase,manualAll});
  },[matchState,activeGameIndex,currentPhaseIndex,simulationResult,selectedEarly,selectedMid,selectedLate,focusPhase,manualAll]);

  // Auto-step simulation timer during PLAYING
  useEffect(() => {
    if (matchState !== 'PLAYING' || !simulationResult) return;

    const currentGame = simulationResult.games[activeGameIndex];
    if (!currentGame) return;

    const delay = isFastMode ? 350 : 1400;
    const timer = setTimeout(() => {
      AudioSynth.playPhaseBeat();
      if (currentPhaseIndex < 2) {
        setCurrentPhaseIndex((prev) => prev + 1);
      } else {
        // Game finished
        if (chapter.format !== 'BO1') {
          setMatchState('GAME_RECAP');
        } else {
          setMatchState('RESOLVED');
          if (simulationResult.winner === 'PLAYER') AudioSynth.playVictory();
          else AudioSynth.playDefeat();
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [matchState, activeGameIndex, currentPhaseIndex, simulationResult, isFastMode]);

  const handleStartMatch = () => {
    AudioSynth.playClick();
    const seed = seedRef.current;
    const previous = simulationResult?.games || [];
    const game = simulateNextGame(seed, chapter.format, playerSnapshot, opponentSnapshot, previous,
      {early:selectedEarly,mid:selectedMid,late:selectedLate}, {archetype:chapter.opponent.archetype});
    if(!game)return;
    const games=[...previous,game];
    setSimulationResult(summarizeSeries(`match_${chapter.id}_${seed}`,seed,chapter.format,playerSnapshot,opponentSnapshot,games,{archetype:chapter.opponent.archetype}));
    setActiveGameIndex(games.length-1);
    setCurrentPhaseIndex(0);
    setMatchState('PLAYING');
  };

  const handleSkipToResult = () => {
    setIsFastMode(true);
    if (!simulationResult) {
      handleStartMatch();
    }
    // Skip only this game's replay; future games still require an explicit decision.
    if (simulationResult) setCurrentPhaseIndex(2);
  };

  const handleClaim = () => {
    if (isRewardClaimed) return;
    const claimed = onVictoryClaim(chapter.id);
    setIsRewardClaimed(claimed);
  };
  const isFriendly = club?.completedChapterIds.includes(chapter.id) || false;

  const isPlayerWon = simulationResult?.winner === 'PLAYER';
  const currentGame = simulationResult?.games[activeGameIndex];
  const currentPhaseOutcome = currentGame?.phases[currentPhaseIndex];
  const resetAutomaticTactics = () => {
    const auto=recommendTactics(playerSnapshot,chapter.opponent.archetype);
    setSelectedEarly(auto.early as EarlyTactic);setSelectedMid(auto.mid as MidTactic);setSelectedLate(auto.late as LateTactic);
  };
  const continueSeries = () => {
    if(!simulationResult)return;
    if(seriesFinished(chapter.format,simulationResult.games)){
      setMatchState('RESOLVED');
      if(simulationResult.winner==='PLAYER')AudioSynth.playVictory();else AudioSynth.playDefeat();
    }else{resetAutomaticTactics();setMatchState('PREVIEW');}
  };
  const finishedGames = simulationResult?.games.slice(0, activeGameIndex) || [];
  const livePlayerWins = finishedGames.filter(g => g.winner === 'PLAYER').length;
  const liveOpponentWins = finishedGames.length - livePlayerWins;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="Trung Tâm Trận Đấu" tabIndex={-1} className="relative w-full max-w-4xl max-h-[90dvh] bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-5 lg:p-7 overflow-y-auto my-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded">
              {chapter.format}
            </span>
            <div>
              <h2 className="text-lg lg:text-xl font-display font-bold text-white tracking-tight">
                {chapter.title}
              </h2>
              <span className="text-xs text-slate-400">{chapter.subtitle}</span>
            </div>
          </div>

          <button
            aria-label="Đóng trận đấu"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= STAGE 1: PRE-MATCH PREVIEW & TACTICAL CHOICES ================= */}
        {matchState === 'PREVIEW' && (
          <div className="space-y-6 pt-5">
            <div className="rounded-lg border border-cyan-900 p-3 text-sm space-y-2">
              <p>Ván {(simulationResult?.games.length || 0)+1} · {simulationResult ? 'FOCUS_1: chọn một pha can thiệp, hai pha còn lại dùng gợi ý đã hiển thị.' : 'Chọn đủ 3 pha cho ván đầu.'}</p>
              {simulationResult && <>
                <label className="flex gap-2 items-center"><input type="checkbox" checked={manualAll} onChange={e=>{setManualAll(e.target.checked);if(!e.target.checked)resetAutomaticTactics();}}/>Chơi thủ công cả 3 pha</label>
                {!manualAll && <div className="flex gap-2">{(['EARLY','MID','LATE'] as const).map(phase=><button key={phase} aria-pressed={focusPhase===phase} className={`min-h-11 px-3 border rounded ${focusPhase===phase?'border-amber-400':'border-slate-600'}`} onClick={()=>{resetAutomaticTactics();setFocusPhase(phase);}}>Can thiệp {phase}</button>)}</div>}
              </>}
            </div>
            {/* Versus Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player Side */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-bold">
                      {playerSnapshot.teamName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white">
                        {playerSnapshot.teamName}
                      </h3>
                      <span className="text-xs text-cyan-400">Đội của bạn</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Sức Mạnh (OVR)</span>
                    <span className="text-2xl font-mono-nums font-extrabold text-cyan-300">
                      {playerSnapshot.teamOvr}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">ĐI ĐƯỜNG</span>
                    <span className="font-mono-nums font-bold text-slate-200">
                      {playerSnapshot.ratings.lane}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">MACRO</span>
                    <span className="font-mono-nums font-bold text-slate-200">
                      {playerSnapshot.ratings.macro}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">GIAO TRANH</span>
                    <span className="font-mono-nums font-bold text-slate-200">
                      {playerSnapshot.ratings.teamfight}
                    </span>
                  </div>
                </div>
              </div>

              {/* Opponent Side */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center justify-center font-bold">
                      {chapter.opponent.shortTag}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white">
                        {chapter.opponent.name}
                      </h3>
                      <span className="text-xs text-rose-400 font-semibold">
                        Lối chơi: {ARCHETYPE_LABELS[chapter.opponent.archetype]}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Sức Mạnh (OVR)</span>
                    <span className="text-2xl font-mono-nums font-extrabold text-rose-300">
                      {chapter.opponent.ovr}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-300 bg-slate-900/70 p-2.5 rounded border border-slate-800">
                  <span className="font-semibold text-rose-300">Báo cáo trinh sát:</span>{' '}
                  {chapter.opponent.description}
                </div>
              </div>
            </div>

            {/* Tactical Decisions Box */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-200">
                    Chiến Lược Trận Đấu (3 Quyết Định Then Chốt)
                  </h4>
                  <span className="text-xs text-slate-400">
                    Khắc chế lối chơi đối thủ bằng cách chọn đấu pháp hợp lý theo từng giai đoạn
                  </span>
                </div>
              </div>

              {/* EARLY Phase Selection */}
              <div>
                <label className="block text-xs font-semibold text-cyan-400 mb-1.5 uppercase tracking-wider">
                  1. Đầu Trận (Early Phase)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PHASE_TACTICS.EARLY.map((code) => {
                    const meta = TACTIC_METADATA[code];
                    const isSelected = selectedEarly === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={!!simulationResult && !manualAll && focusPhase !== 'EARLY'}
                        onClick={() => {
                          AudioSynth.playClick();
                          setSelectedEarly(code as EarlyTactic);
                        }}
                        className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/50'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-200 mb-1">{meta.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-2">{meta.description}</div>
                        <div className="text-[10px] text-cyan-300 mt-2 font-medium">{meta.recommendedAgainst}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MID Phase Selection */}
              <div>
                <label className="block text-xs font-semibold text-cyan-400 mb-1.5 uppercase tracking-wider">
                  2. Giữa Trận (Mid Phase)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PHASE_TACTICS.MID.map((code) => {
                    const meta = TACTIC_METADATA[code];
                    const isSelected = selectedMid === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={!!simulationResult && !manualAll && focusPhase !== 'MID'}
                        onClick={() => {
                          AudioSynth.playClick();
                          setSelectedMid(code as MidTactic);
                        }}
                        className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/50'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-200 mb-1">{meta.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-2">{meta.description}</div>
                        <div className="text-[10px] text-cyan-300 mt-2 font-medium">{meta.recommendedAgainst}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LATE Phase Selection */}
              <div>
                <label className="block text-xs font-semibold text-cyan-400 mb-1.5 uppercase tracking-wider">
                  3. Cuối Trận (Late Phase)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PHASE_TACTICS.LATE.map((code) => {
                    const meta = TACTIC_METADATA[code];
                    const isSelected = selectedLate === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={!!simulationResult && !manualAll && focusPhase !== 'LATE'}
                        onClick={() => {
                          AudioSynth.playClick();
                          setSelectedLate(code as LateTactic);
                        }}
                        className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/50'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-200 mb-1">{meta.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-2">{meta.description}</div>
                        <div className="text-[10px] text-cyan-300 mt-2 font-medium">{meta.recommendedAgainst}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Launch CTA Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <span className="text-sm text-slate-300">
                Thể thức: <strong className="text-white">{chapter.format}</strong> · Kết quả được tính toán chuẩn xác từ chỉ số & đối sách.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleStartMatch}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-[#FFB800] hover:bg-amber-400 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Vào Trận Đấu</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: LIVE SIMULATION STAGE ================= */}
        {matchState === 'PLAYING' && simulationResult && (
          <div className="space-y-6 pt-5">
            {/* Live Scoreboard */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
                  {playerSnapshot.teamName.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-sm">
                    {playerSnapshot.teamName}
                  </h4>
                  <span className="text-xs text-cyan-400 font-mono">
                    Hạ gục: {currentPhaseIndex === 2 ? currentGame?.killsPlayer : '—'}
                  </span>
                </div>
              </div>

              <div className="text-center px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                  Ván {activeGameIndex + 1} ({chapter.format})
                </div>
                <div data-testid="live-score" className="text-2xl font-mono-nums font-black text-amber-400">
                  {livePlayerWins} - {liveOpponentWins}
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <h4 className="font-display font-bold text-white text-sm">
                    {opponentSnapshot.teamName}
                  </h4>
                  <span className="text-xs text-rose-400 font-mono">
                    Hạ gục: {currentPhaseIndex === 2 ? currentGame?.killsOpponent : '—'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-sm border border-rose-500/30">
                  {chapter.opponent.shortTag}
                </div>
              </div>
            </div>

            {/* Current Phase Card */}
            {currentPhaseOutcome && (
              <div className="p-5 rounded-xl bg-[#0D1525] border border-cyan-500/40 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-cyan-950 text-cyan-300 rounded border border-cyan-800/60 uppercase">
                      Pha: {currentPhaseOutcome.phase}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">
                      {TACTIC_METADATA[currentPhaseOutcome.playerTactic]?.name}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      currentPhaseOutcome.winner === 'PLAYER'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    {currentPhaseOutcome.winner === 'PLAYER' ? 'Chiếm Lợi Thế' : 'Bị Đối Thủ Ép'}
                  </span>
                </div>

                {/* Commentary Stream */}
                <div className="text-xs text-slate-200 space-y-1">
                  <p>{currentPhaseOutcome.wasOffScript ? 'Lệch bài: ' : 'Đúng bài: '}{ARCHETYPE_LABELS[currentPhaseOutcome.opponentArchetypeActual]} · Đối thủ: {TACTIC_METADATA[currentPhaseOutcome.opponentTactic].name}</p>
                  <p>Xác suất thắng pha: {Math.round(currentPhaseOutcome.winProbability*100)}%</p>
                  <p>{currentPhaseOutcome.keyMoment}</p>
                  {currentPhaseIndex === 2 && <p>MVP ván: {currentGame?.mvpName}</p>}
                </div>
                <div className="space-y-1.5 my-3 text-xs font-mono text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-900">
                  {currentPhaseOutcome.events.map((evt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{evt}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span>
                    Chênh lệch vàng:{' '}
                    <strong
                      className={`font-mono-nums ${
                        currentPhaseOutcome.goldDelta > 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {currentPhaseOutcome.goldDelta > 0 ? '+' : ''}
                      {currentPhaseOutcome.goldDelta.toLocaleString()} Vàng
                    </strong>
                  </span>

                  <span className="text-[11px] text-slate-400">
                    Tác động quyết định:{' '}
                    <strong className="text-cyan-300 font-mono-nums">
                      {currentPhaseOutcome.decisionFitBonus > 0 ? '+' : ''}
                      {currentPhaseOutcome.decisionFitBonus} Điểm
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* Live Controller Speed buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Đang tái hiện diễn biến trận đấu...</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFastMode(!isFastMode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                    isFastMode
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{isFastMode ? 'Tốc Độ: 3x' : 'Tua Nhanh'}</span>
                </button>

                <button
                  onClick={handleSkipToResult}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Xem Kết Quả Ngay ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {matchState==='GAME_RECAP'&&currentGame&&simulationResult&&<GameRecap game={currentGame} playerTeamName={playerSnapshot.teamName} opponentTeamName={opponentSnapshot.teamName} playerWins={simulationResult.playerWins} opponentWins={simulationResult.opponentWins} onNext={continueSeries} nextLabel={seriesFinished(chapter.format,simulationResult.games)?'Xem Tổng Kết Chuỗi':'Ván Tiếp Theo'}/>}

        {/* ================= STAGE 3: POST-MATCH BREAKDOWN & REWARD ================= */}
        {matchState === 'RESOLVED' && simulationResult && (
          <div className="space-y-6 pt-5">
            {/* Victory / Defeat Hero Banner */}
            <div
              className={`p-6 rounded-2xl border text-center ${
                isPlayerWon
                  ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-[#111827] border-emerald-500/50 shadow-emerald-500/10'
                  : 'bg-gradient-to-b from-rose-950/40 via-slate-900 to-[#111827] border-rose-500/50 shadow-rose-500/10'
              } shadow-2xl`}
            >
              <span
                className={`px-3 py-1 text-xs font-extrabold uppercase tracking-widest rounded-full ${
                  isPlayerWon
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isPlayerWon ? 'Chiến Thắng Tuyệt Đối' : 'Thất Bại Tiếc Nuối'}
              </span>

              <h3 className="mt-3 text-3xl font-display font-extrabold text-white">
                {simulationResult.playerWins} - {simulationResult.opponentWins}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {isPlayerWon
                  ? `Xuất sắc hạ gục ${opponentSnapshot.teamName} sau loạt trận kịch tính!`
                  : `Không thể vượt qua ${opponentSnapshot.teamName}. Hãy nâng cấp đội hình và thử lại!`}
              </p>
            </div>

            {/* "WHY" Breakdown - 4 Key Pillars */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Phân Tích Nguyên Nhân Thắng / Thua (Match Analytics)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">CHỈ SỐ ĐỘI HÌNH</span>
                  <span
                    className={`font-mono-nums font-bold text-sm ${
                      simulationResult.breakdown.rosterDiff >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {simulationResult.breakdown.rosterDiff >= 0 ? '+' : ''}
                    {simulationResult.breakdown.rosterDiff} OVR
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ĐIỂM GẮN KẾT</span>
                  <span className="font-mono-nums font-bold text-sm text-cyan-400">
                    +{simulationResult.breakdown.synergyAdvantage}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ĐỘ HỢP TƯỚNG</span>
                  <span
                    className={`font-mono-nums font-bold text-sm ${
                      simulationResult.breakdown.tacticSuitability >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {simulationResult.breakdown.tacticSuitability >= 0 ? '+' : ''}
                    {simulationResult.breakdown.tacticSuitability}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">NƯỚC ĐI KHẮC CHẾ</span>
                  <span
                    className={`font-mono-nums font-bold text-sm ${
                      simulationResult.breakdown.decisionQuality >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {simulationResult.breakdown.decisionQuality >= 0 ? '+' : ''}
                    {simulationResult.breakdown.decisionQuality}
                  </span>
                </div>
              </div>

              {/* Counterfactual Insight (spec v2.2) */}
              {simulationResult.counterfactual.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bài học mô phỏng chiến thuật (Counterfactual Insight):</span>
                  </div>
                  <p>{simulationResult.counterfactual[0].explanation}</p>
                </div>
              )}

              {/* Coaching Advice */}
              <div className="mt-2 text-xs text-slate-400 italic">
                <strong>Lời khuyên HLV:</strong> {simulationResult.coachingAdvice}
              </div>
            </div>

            {/* Action Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              {isPlayerWon ? (
                <>
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isFriendly ? 'Giao hữu: không thưởng' : `Phần thưởng: +${chapter.milestoneRewards.credits} Credits `}
                      {!isFriendly && chapter.milestoneRewards.packs &&
                        `+ ${chapter.milestoneRewards.packs.length} Gói Thẻ!`}
                    </span>
                  </div>

                  <button
                    onClick={isFriendly ? onClose : handleClaim}
                    disabled={isRewardClaimed}
                    className={`w-full sm:w-auto px-6 py-3 font-display font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      isRewardClaimed
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    {isFriendly ? 'Hoàn Tất Giao Hữu' : isRewardClaimed ? 'Đã Nhận Thưởng' : 'Nhận Thưởng & Hoàn Thành ➔'}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Thất bại không xóa dữ liệu đội tuyển. Hãy tinh chỉnh chiến thuật!</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        AudioSynth.playClick();
                        setSimulationResult(null);
                        seedRef.current=Date.now();
                        setMatchState('PREVIEW');
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Thử Lại Trận Đấu</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition-colors cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
