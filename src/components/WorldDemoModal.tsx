import {
  Activity,
  FastForward,
  Flame,
  Globe2,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { WORLD_CHAMPIONSHIP_DEMO_SCENARIO } from '../data/campaignData';
import { AudioSynth } from '../lib/audioSynth';
import { simulateSeries } from '../lib/simulator';
import { PHASE_TACTICS, TACTIC_METADATA } from '../lib/tacticsMatrix';
import { EarlyTactic, LateTactic, MatchSimulationResult, MidTactic } from '../types';

interface WorldDemoModalProps {
  onClose: () => void;
}

export const WorldDemoModal: React.FC<WorldDemoModalProps> = ({ onClose }) => {
  const scenario = WORLD_CHAMPIONSHIP_DEMO_SCENARIO;

  const [selectedEarly, setSelectedEarly] = useState<EarlyTactic>('SAFE_FARM');
  const [selectedMid, setSelectedMid] = useState<MidTactic>('CONTEST_OBJECTIVE');
  const [selectedLate, setSelectedLate] = useState<LateTactic>('FORCE_TEAMFIGHT');

  const [state, setState] = useState<'PREVIEW' | 'PLAYING' | 'RESOLVED'>('PREVIEW');
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [simulationResult, setSimulationResult] = useState<MatchSimulationResult | null>(null);
  const [isFastMode, setIsFastMode] = useState(false);

  useEffect(() => {
    if (state !== 'PLAYING' || !simulationResult) return;

    const delay = isFastMode ? 300 : 1200;
    const timer = setTimeout(() => {
      AudioSynth.playPhaseBeat();
      if (currentPhaseIndex < 2) {
        setCurrentPhaseIndex((p) => p + 1);
      } else {
        if (activeGameIndex < simulationResult.games.length - 1) {
          setActiveGameIndex((g) => g + 1);
          setCurrentPhaseIndex(0);
        } else {
          setState('RESOLVED');
          if (simulationResult.winner === 'PLAYER') {
            AudioSynth.playVictory();
          } else {
            AudioSynth.playDefeat();
          }
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [state, activeGameIndex, currentPhaseIndex, simulationResult, isFastMode]);

  const handleStart = () => {
    AudioSynth.playClick();
    const seed = Date.now();
    const result = simulateSeries(
      `demo_worlds_${seed}`,
      seed,
      'BO5',
      scenario.playerTeam,
      scenario.opponentTeam,
      [
        {
          early: selectedEarly,
          mid: selectedMid,
          late: selectedLate,
        },
      ],
      { archetype: scenario.opponentArchetype, offScriptChance: 0.2 }
    );

    setSimulationResult(result);
    setActiveGameIndex(0);
    setCurrentPhaseIndex(0);
    setState('PLAYING');
  };

  const handleSkip = () => {
    setIsFastMode(true);
    if (!simulationResult) {
      handleStart();
    }
    if (simulationResult) {
      setActiveGameIndex(simulationResult.games.length - 1);
      setCurrentPhaseIndex(2);
      setState('RESOLVED');
      if (simulationResult.winner === 'PLAYER') {
        AudioSynth.playVictory();
      } else {
        AudioSynth.playDefeat();
      }
    }
  };

  const isPlayerWon = simulationResult?.winner === 'PLAYER';
  const currentGame = simulationResult?.games[activeGameIndex];
  const currentPhaseOutcome = currentGame?.phases[currentPhaseIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#111827] border-2 border-amber-500/50 rounded-2xl shadow-2xl p-5 lg:p-7 overflow-hidden my-6">
        {/* Decorative Worlds Crown Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 text-xs font-mono font-black bg-amber-500 text-slate-950 rounded">
              DEMO · BO5
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg lg:text-xl font-display font-extrabold text-white tracking-tight">
                  {scenario.title}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded-full">
                  Không ảnh hưởng Career
                </span>
              </div>
              <span className="text-xs text-slate-400">{scenario.subtitle}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage 1: Preview */}
        {state === 'PREVIEW' && (
          <div className="space-y-6 pt-5">
            <p className="text-xs text-slate-300 leading-relaxed bg-amber-950/20 p-3 rounded-lg border border-amber-500/20">
              {scenario.description}
            </p>

            {/* Roster Matchup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-display font-bold text-cyan-400 text-sm">
                    {scenario.playerTeam.teamName} (OVR 89)
                  </h3>
                  <span className="text-xs text-slate-400">Đội hình trình diễn</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {scenario.playerTeam.roster.map((p) => (
                    <div
                      key={p.role}
                      className="flex justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/80"
                    >
                      <span className="text-cyan-300 font-bold w-12">{p.role}</span>
                      <span className="text-slate-200">{p.displayName}</span>
                      <span className="font-mono-nums font-bold text-cyan-400">{p.ovr}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-display font-bold text-rose-400 text-sm">
                    {scenario.opponentTeam.teamName} (OVR 92)
                  </h3>
                  <span className="text-xs text-rose-300 font-semibold">LCK Titan</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {scenario.opponentTeam.roster.map((p) => (
                    <div
                      key={p.role}
                      className="flex justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/80"
                    >
                      <span className="text-rose-300 font-bold w-12">{p.role}</span>
                      <span className="text-slate-200">{p.displayName}</span>
                      <span className="font-mono-nums font-bold text-rose-400">{p.ovr}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Strategy Chooser */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Chọn Chiến Thuật Cho Ván Đấu:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[11px] text-cyan-400 block font-semibold mb-1">ĐẦU TRẬN</span>
                  <select
                    value={selectedEarly}
                    onChange={(e) => setSelectedEarly(e.target.value as EarlyTactic)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2 rounded-lg"
                  >
                    {PHASE_TACTICS.EARLY.map((c) => (
                      <option key={c} value={c}>
                        {TACTIC_METADATA[c].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-cyan-400 block font-semibold mb-1">GIỮA TRẬN</span>
                  <select
                    value={selectedMid}
                    onChange={(e) => setSelectedMid(e.target.value as MidTactic)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2 rounded-lg"
                  >
                    {PHASE_TACTICS.MID.map((c) => (
                      <option key={c} value={c}>
                        {TACTIC_METADATA[c].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-cyan-400 block font-semibold mb-1">CUỐI TRẬN</span>
                  <select
                    value={selectedLate}
                    onChange={(e) => setSelectedLate(e.target.value as LateTactic)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2 rounded-lg"
                  >
                    {PHASE_TACTICS.LATE.map((c) => (
                      <option key={c} value={c}>
                        {TACTIC_METADATA[c].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Mô phỏng chân thực chuỗi BO5 đỉnh cao trong ~3 phút
              </span>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Bắt Đầu Trận Chung Kết</span>
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Playing */}
        {state === 'PLAYING' && simulationResult && (
          <div className="space-y-6 pt-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-left">
                <h4 className="font-display font-bold text-white text-sm">
                  {scenario.playerTeam.teamName}
                </h4>
                <span className="text-xs text-cyan-400 font-mono">
                  Mạng: {currentGame?.killsPlayer}
                </span>
              </div>

              <div className="text-center px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">
                  Ván {activeGameIndex + 1} / 5 (BO5)
                </span>
                <span className="text-3xl font-mono-nums font-black text-amber-400">
                  {simulationResult.playerWins} - {simulationResult.opponentWins}
                </span>
              </div>

              <div className="text-right">
                <h4 className="font-display font-bold text-white text-sm">
                  {scenario.opponentTeam.teamName}
                </h4>
                <span className="text-xs text-rose-400 font-mono">
                  Mạng: {currentGame?.killsOpponent}
                </span>
              </div>
            </div>

            {currentPhaseOutcome && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-300 uppercase">
                    Pha {currentPhaseOutcome.phase}:{' '}
                    {TACTIC_METADATA[currentPhaseOutcome.playerTactic].name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      currentPhaseOutcome.winner === 'PLAYER'
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-rose-950 text-rose-300'
                    }`}
                  >
                    {currentPhaseOutcome.winner === 'PLAYER' ? 'Thắng Lợi' : 'Bị Đối Phương Ép'}
                  </span>
                </div>

                <div className="space-y-1 text-xs font-mono text-slate-300 bg-slate-950/80 p-3 rounded">
                  {currentPhaseOutcome.events.map((e, idx) => (
                    <div key={idx}>• {e}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setIsFastMode(!isFastMode)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{isFastMode ? 'Tốc độ: 3x' : 'Tua Nhanh'}</span>
              </button>

              <button
                onClick={handleSkip}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
              >
                Xem Kết Quả Ngay ➔
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Resolved */}
        {state === 'RESOLVED' && simulationResult && (
          <div className="space-y-6 pt-5">
            <div
              className={`p-6 rounded-2xl border text-center ${
                isPlayerWon
                  ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-[#111827] border-amber-500/60'
                  : 'bg-gradient-to-b from-rose-950/40 via-slate-900 to-[#111827] border-rose-500/60'
              }`}
            >
              <Trophy
                className={`w-12 h-12 mx-auto mb-2 ${
                  isPlayerWon ? 'text-amber-400' : 'text-slate-600'
                }`}
              />
              <h3 className="text-3xl font-display font-extrabold text-white">
                {simulationResult.playerWins} - {simulationResult.opponentWins}
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                {isPlayerWon
                  ? 'Đỉnh cao vinh quang! Đội tuyển trình diễn đã xuất sắc nâng cao chiếc Cúp Thế Giới!'
                  : 'Trận chiến nghẹt thở đến ván 5. Siêu cường Hàn Quốc đã tận dụng xuất sắc từng sai lầm nhỏ nhất.'}
              </p>
            </div>

            {/* Counterfactual Insight */}
            {simulationResult.counterfactual.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="font-semibold text-amber-300 block mb-1">
                  💡 Phân tích chiến thuật (Counterfactual Simulation):
                </span>
                <p className="text-slate-300">{simulationResult.counterfactual[0].explanation}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Đây là kịch bản trình diễn mô phỏng. Tiến trình sự nghiệp chính không thay đổi.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setState('PREVIEW')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chơi Lại Trận Demo</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
