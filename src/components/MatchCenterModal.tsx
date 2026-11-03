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
import {LaneMap,SeriesTracker,VersusRosters} from './MatchVisuals';
import {stageOf} from '../data/season';
import {KeyMoment,PhaseEvents} from './PhaseLog';
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
  const stage = stageOf(chapter.id);
  const finishedGames = simulationResult?.games.slice(0, activeGameIndex) || [];
  const livePlayerWins = finishedGames.filter(g => g.winner === 'PLAYER').length;
  const liveOpponentWins = finishedGames.length - livePlayerWins;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="Trung Tâm Trận Đấu" tabIndex={-1} className="relative w-full max-w-4xl max-h-[90dvh] bg-surface border border-line rounded-2xl shadow-2xl p-5 lg:p-7 overflow-y-auto my-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-info/10 text-info border border-info/40 rounded">
              {chapter.format}
            </span>
            <div>
              <h2 className="text-lg lg:text-xl font-display font-bold text-white tracking-tight">
                {chapter.title}
              </h2>
              <span className="text-xs text-fg-subtle">
                {stage ? `${stage.competition.name} · ${stage.label} · ` : ''}{chapter.subtitle}
              </span>
            </div>
          </div>

          <button
            aria-label="Đóng trận đấu"
            onClick={onClose}
            className="p-1.5 text-fg-subtle hover:text-white bg-elevated/80 hover:bg-line rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= STAGE 1: PRE-MATCH PREVIEW & TACTICAL CHOICES ================= */}
        {matchState === 'PREVIEW' && (
          <div className="space-y-6 pt-5">
            <div className="rounded-lg border border-info/40 p-3 text-sm space-y-2">
              <p>Ván {(simulationResult?.games.length || 0)+1} · {simulationResult ? 'FOCUS_1: chọn một pha can thiệp, hai pha còn lại dùng gợi ý đã hiển thị.' : 'Chọn đủ 3 pha cho ván đầu.'}</p>
              {simulationResult && <>
                <label className="flex gap-2 items-center"><input type="checkbox" checked={manualAll} onChange={e=>{setManualAll(e.target.checked);if(!e.target.checked)resetAutomaticTactics();}}/>Chơi thủ công cả 3 pha</label>
                {!manualAll && <div className="flex gap-2">{(['EARLY','MID','LATE'] as const).map(phase=><button key={phase} aria-pressed={focusPhase===phase} className={`min-h-11 px-3 border rounded ${focusPhase===phase?'border-gold/40':'border-line'}`} onClick={()=>{resetAutomaticTactics();setFocusPhase(phase);}}>Can thiệp {phase}</button>)}</div>}
              </>}
            </div>
            {/* Both line-ups, opponent first (Worlds Mayhem style) */}
            <VersusRosters
              opponentLabel={chapter.opponent.isFinalBoss ? 'Trùm cuối' : undefined}
              opponent={{
                name: chapter.opponent.name,
                ovr: opponentSnapshot.teamOvr,
                players: opponentSnapshot.roster,
                ratings: opponentSnapshot.ratings,
                note: (chapter.opponent.difficultyBonus ?? opponentSnapshot.difficultyBonus ?? 0) > 0 ? `Chỉ số đội hình này được cân chỉnh +${(chapter.opponent.difficultyBonus ?? opponentSnapshot.difficultyBonus ?? 0)} để phù hợp độ khó.` : undefined,
              }}
              you={{
                name: playerSnapshot.teamName,
                ovr: playerSnapshot.teamOvr,
                players: playerSnapshot.roster,
                ratings: playerSnapshot.ratings,
              }}
            />
            <div className="rounded-lg border border-line bg-bg p-3 text-label text-fg-muted">
              <span className="font-semibold text-danger">Báo cáo trinh sát:</span>{' '}
              Lối chơi <strong className="text-fg">{ARCHETYPE_LABELS[chapter.opponent.archetype]}</strong>. {chapter.opponent.description}
            </div>

            {/* Tactical Decisions Box */}
            <div className="p-4 rounded-xl bg-bg border border-line space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-fg">
                    Chiến Lược Trận Đấu (3 Quyết Định Then Chốt)
                  </h4>
                  <span className="text-xs text-fg-subtle">
                    Khắc chế lối chơi đối thủ bằng cách chọn đấu pháp hợp lý theo từng giai đoạn
                  </span>
                </div>
              </div>

              {/* EARLY Phase Selection */}
              <div>
                <label className="block text-xs font-semibold text-info mb-1.5 ">
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
                            ? 'border-info/40 bg-info/10 ring-1 ring-info/40'
                            : 'border-line bg-surface/60 hover:border-line'
                        }`}
                      >
                        <div className="font-bold text-xs text-fg mb-1">{meta.name}</div>
                        <div className="text-caption text-fg-subtle line-clamp-2">{meta.description}</div>
                        <div className="text-caption text-info mt-2 font-medium">{meta.recommendedAgainst}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MID Phase Selection */}
              <div>
                <label className="block text-xs font-semibold text-info mb-1.5 ">
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
                            ? 'border-info/40 bg-info/10 ring-1 ring-info/40'
                            : 'border-line bg-surface/60 hover:border-line'
                        }`}
                      >
                        <div className="font-bold text-xs text-fg mb-1">{meta.name}</div>
                        <div className="text-caption text-fg-subtle line-clamp-2">{meta.description}</div>
                        <div className="text-caption text-info mt-2 font-medium">{meta.recommendedAgainst}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LATE Phase Selection */}
              <div>
                <label className="block text-xs font-semibold text-info mb-1.5 ">
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
                            ? 'border-info/40 bg-info/10 ring-1 ring-info/40'
                            : 'border-line bg-surface/60 hover:border-line'
                        }`}
                      >
                        <div className="font-bold text-xs text-fg mb-1">{meta.name}</div>
                        <div className="text-caption text-fg-subtle line-clamp-2">{meta.description}</div>
                        <div className="text-caption text-info mt-2 font-medium">{meta.recommendedAgainst}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Launch CTA Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <span className="text-sm text-fg-muted">
                Thể thức: <strong className="text-white">{chapter.format}</strong> · Kết quả được tính toán chuẩn xác từ chỉ số & đối sách.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleStartMatch}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-gold hover:brightness-110 text-bg font-display font-extrabold text-xs rounded-lg shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
            <div className="grid items-start gap-5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
              <div className="mx-auto w-full max-w-xs md:max-w-none">
                <LaneMap
                  player={playerSnapshot.roster}
                  opponent={opponentSnapshot.roster}
                  phase={currentPhaseOutcome?.phase ?? 'EARLY'}
                  playerWinsPhase={currentPhaseOutcome ? currentPhaseOutcome.winner === 'PLAYER' : true}
                />
              </div>
              <div className="space-y-3">
                <SeriesTracker format={chapter.format} finished={finishedGames} currentIndex={activeGameIndex} />
                <p className="text-label text-fg-muted">
                  {opponentSnapshot.teamName} <span className="text-fg-subtle">đối đầu</span> {playerSnapshot.teamName}. Mỗi ván có 3 pha; thắng 2 pha là thắng ván.
                </p>
              </div>
            </div>
            {/* Live Scoreboard */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface/80 border border-line">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/20 text-info font-bold flex items-center justify-center text-sm border border-info/40">
                  {playerSnapshot.teamName.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-sm">
                    {playerSnapshot.teamName}
                  </h4>
                  <span className="text-xs text-info font-mono">
                    Hạ gục: {currentPhaseIndex === 2 ? currentGame?.killsPlayer : '—'}
                  </span>
                </div>
              </div>

              <div className="text-center px-4 py-1.5 bg-bg rounded-xl border border-line">
                <div className="text-caption text-fg-subtle ">
                  Ván {activeGameIndex + 1} ({chapter.format})
                </div>
                <div data-testid="live-score" className="text-2xl font-mono-nums font-black text-gold">
                  {livePlayerWins} - {liveOpponentWins}
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <h4 className="font-display font-bold text-white text-sm">
                    {opponentSnapshot.teamName}
                  </h4>
                  <span className="text-xs text-danger font-mono">
                    Hạ gục: {currentPhaseIndex === 2 ? currentGame?.killsOpponent : '—'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-danger/20 text-danger font-bold flex items-center justify-center text-sm border border-danger/40">
                  {chapter.opponent.shortTag}
                </div>
              </div>
            </div>

            {/* Current Phase Card */}
            {currentPhaseOutcome && (
              <div className="p-5 rounded-xl bg-bg border border-info/40 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-info/10 text-info rounded border border-info/40 ">
                      Pha: {currentPhaseOutcome.phase}
                    </span>
                    <span className="text-xs text-fg-muted font-semibold">
                      {TACTIC_METADATA[currentPhaseOutcome.playerTactic]?.name}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      currentPhaseOutcome.winner === 'PLAYER'
                        ? 'bg-success/10 text-success border border-success/40'
                        : 'bg-danger/10 text-danger border border-danger/40'
                    }`}
                  >
                    {currentPhaseOutcome.winner === 'PLAYER' ? 'Chiếm Lợi Thế' : 'Bị Đối Thủ Ép'}
                  </span>
                </div>

                {/* Commentary Stream */}
                <div className="text-xs text-fg space-y-1">
                  <p>{currentPhaseOutcome.wasOffScript ? 'Lệch bài: ' : 'Đúng bài: '}{ARCHETYPE_LABELS[currentPhaseOutcome.opponentArchetypeActual]} · Đối thủ: {TACTIC_METADATA[currentPhaseOutcome.opponentTactic].name}</p>
                  <p>Xác suất thắng pha: {Math.round(currentPhaseOutcome.winProbability*100)}%</p>
                  <KeyMoment phase={currentPhaseOutcome} gameWinner={currentGame?.winner ?? currentPhaseOutcome.winner} />
                  {currentPhaseIndex === 2 && <p>MVP ván: {currentGame?.mvpName}</p>}
                </div>
                <div className="space-y-1.5 my-3 text-xs font-mono text-fg-muted bg-bg/70 p-3 rounded-lg border border-line">
                  <PhaseEvents phase={currentPhaseOutcome} gameWinner={currentGame?.winner ?? currentPhaseOutcome.winner} />
                </div>

                <div className="mt-3 text-xs text-fg-subtle flex items-center justify-between pt-2 border-t border-line/60">
                  <span>
                    Chênh lệch vàng:{' '}
                    <strong
                      className={`font-mono-nums ${
                        currentPhaseOutcome.goldDelta > 0
                          ? 'text-success'
                          : 'text-danger'
                      }`}
                    >
                      {currentPhaseOutcome.goldDelta > 0 ? '+' : ''}
                      {currentPhaseOutcome.goldDelta.toLocaleString()} Vàng
                    </strong>
                  </span>

                  <span className="text-caption text-fg-subtle">
                    Tác động quyết định:{' '}
                    <strong className="text-info font-mono-nums">
                      {currentPhaseOutcome.decisionFitBonus > 0 ? '+' : ''}
                      {currentPhaseOutcome.decisionFitBonus} Điểm
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* Live Controller Speed buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-fg-subtle">Đang tái hiện diễn biến trận đấu...</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFastMode(!isFastMode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                    isFastMode
                      ? 'bg-info/10 text-info border-info/40'
                      : 'bg-elevated text-fg-muted border-line hover:bg-line'
                  }`}
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{isFastMode ? 'Tốc Độ: 3x' : 'Tua Nhanh'}</span>
                </button>

                <button
                  onClick={handleSkipToResult}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-elevated hover:bg-line border border-line rounded-lg transition-colors cursor-pointer"
                >
                  Xem Kết Quả Ngay ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {matchState==='GAME_RECAP'&&simulationResult&&<div className="pt-5"><SeriesTracker format={chapter.format} finished={simulationResult.games.slice(0,activeGameIndex+1)} /></div>}
        {matchState==='GAME_RECAP'&&currentGame&&simulationResult&&<GameRecap game={currentGame} playerTeamName={playerSnapshot.teamName} opponentTeamName={opponentSnapshot.teamName} playerWins={simulationResult.playerWins} opponentWins={simulationResult.opponentWins} onNext={continueSeries} nextLabel={seriesFinished(chapter.format,simulationResult.games)?'Xem Tổng Kết Chuỗi':'Ván Tiếp Theo'}/>}

        {/* ================= STAGE 3: POST-MATCH BREAKDOWN & REWARD ================= */}
        {matchState === 'RESOLVED' && simulationResult && (
          <div className="space-y-6 pt-5">
            {/* Victory / Defeat Hero Banner */}
            <div
              className={`p-6 rounded-2xl border text-center ${
                isPlayerWon
                  ? 'bg-success/10 border-success/40'
                  : 'bg-danger/10 border-danger/40'
              } shadow-2xl`}
            >
              <span
                className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                  isPlayerWon
                    ? 'bg-success/10 text-success border border-success/40'
                    : 'bg-danger/10 text-danger border border-danger/40'
                }`}
              >
                {isPlayerWon ? 'Chiến Thắng Tuyệt Đối' : 'Thất Bại Tiếc Nuối'}
              </span>

              <h3 className="mt-3 text-3xl font-display font-extrabold text-white">
                {simulationResult.playerWins} - {simulationResult.opponentWins}
              </h3>
              <p className="mt-1 text-xs text-fg-subtle">
                {isPlayerWon
                  ? `Xuất sắc hạ gục ${opponentSnapshot.teamName} sau loạt trận kịch tính!`
                  : `Không thể vượt qua ${opponentSnapshot.teamName}. Hãy nâng cấp đội hình và thử lại!`}
              </p>
            </div>

            {/* "WHY" Breakdown - 4 Key Pillars */}
            <div className="p-4 rounded-xl bg-surface/80 border border-line">
              <h4 className="text-xs font-bold text-fg-muted mb-3">
                Phân Tích Nguyên Nhân Thắng / Thua (Match Analytics)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-bg border border-line">
                  <span className="text-caption text-fg-subtle block">CHỈ SỐ ĐỘI HÌNH</span>
                  <span
                    className={`font-mono-nums font-bold text-sm ${
                      simulationResult.breakdown.rosterDiff >= 0
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {simulationResult.breakdown.rosterDiff >= 0 ? '+' : ''}
                    {simulationResult.breakdown.rosterDiff} OVR
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-bg border border-line">
                  <span className="text-caption text-fg-subtle block">ĐIỂM GẮN KẾT</span>
                  <span className="font-mono-nums font-bold text-sm text-info">
                    +{simulationResult.breakdown.synergyAdvantage}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-bg border border-line">
                  <span className="text-caption text-fg-subtle block">ĐỘ HỢP TƯỚNG</span>
                  <span
                    className={`font-mono-nums font-bold text-sm ${
                      simulationResult.breakdown.tacticSuitability >= 0
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {simulationResult.breakdown.tacticSuitability >= 0 ? '+' : ''}
                    {simulationResult.breakdown.tacticSuitability}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-bg border border-line">
                  <span className="text-caption text-fg-subtle block">NƯỚC ĐI KHẮC CHẾ</span>
                  <span
                    className={`font-mono-nums font-bold text-sm ${
                      simulationResult.breakdown.decisionQuality >= 0
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {simulationResult.breakdown.decisionQuality >= 0 ? '+' : ''}
                    {simulationResult.breakdown.decisionQuality}
                  </span>
                </div>
              </div>

              {/* Counterfactual Insight (spec v2.2) */}
              {simulationResult.counterfactual.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-info/10 border border-info/40 text-xs text-info">
                  <div className="font-semibold text-info flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bài học mô phỏng chiến thuật (Counterfactual Insight):</span>
                  </div>
                  <p>{simulationResult.counterfactual[0].explanation}</p>
                </div>
              )}

              {/* Coaching Advice */}
              <div className="mt-2 text-xs text-fg-subtle italic">
                <strong>Lời khuyên HLV:</strong> {simulationResult.coachingAdvice}
              </div>
            </div>

            {/* Action Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-line">
              {isPlayerWon ? (
                <>
                  <div className="text-xs text-success font-semibold flex items-center gap-1.5">
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
                    className={`w-full sm:w-auto px-6 py-3 font-display font-extrabold text-xs rounded-xl transition-all cursor-pointer ${
                      isRewardClaimed
                        ? 'bg-elevated text-fg-subtle cursor-default'
                        : 'bg-success hover:brightness-110 text-bg'
                    }`}
                  >
                    {isFriendly ? 'Hoàn Tất Giao Hữu' : isRewardClaimed ? 'Đã Nhận Thưởng' : 'Nhận Thưởng & Hoàn Thành ➔'}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-xs text-danger font-semibold flex items-center gap-1.5">
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
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-elevated hover:bg-line text-fg text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Thử Lại Trận Đấu</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2.5 bg-surface hover:bg-elevated text-fg-subtle hover:text-white text-xs font-semibold rounded-xl border border-line transition-colors cursor-pointer"
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
