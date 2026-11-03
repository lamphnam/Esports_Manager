import {useEffect,useRef} from 'react';
import {GameSimulationResult} from '../types';
import {TACTIC_METADATA} from '../lib/tacticsMatrix';
import {ARCHETYPE_LABELS} from '../lib/labels';

interface GameRecapProps {
  game:GameSimulationResult;
  playerTeamName:string;
  opponentTeamName:string;
  playerWins:number;
  opponentWins:number;
  onNext:()=>void;
  nextLabel:string;
}

export function GameRecap({game,playerTeamName,opponentTeamName,playerWins,opponentWins,onNext,nextLabel}:GameRecapProps){
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{heading.current?.focus();},[game.gameIndex]);
  const won=game.winner==='PLAYER';
  return <section data-testid="game-recap" aria-label={`Kết quả ván ${game.gameIndex}`} className="space-y-4 pt-5">
    <div className={`p-4 rounded-xl border ${won?'border-emerald-700 bg-emerald-950/30':'border-rose-700 bg-rose-950/30'}`}>
      <h3 ref={heading} tabIndex={-1} data-testid="game-verdict" className={`font-display text-2xl font-bold ${won?'text-emerald-300':'text-rose-300'}`}>
        {won?'Thắng Ván':'Thua Ván'} {game.gameIndex}
      </h3>
      <p className="mt-2 text-sm">{playerTeamName} <strong>{game.killsPlayer} – {game.killsOpponent}</strong> {opponentTeamName}</p>
      <p className="text-sm text-slate-300">Thời lượng: {game.gameDurationMinutes} phút · MVP: {game.mvpName}</p>
      <p className="mt-3 text-sm">Tỷ số chuỗi: <strong data-testid="game-series-score" className="font-mono text-amber-300">{playerWins} - {opponentWins}</strong></p>
    </div>
    <p className="text-sm text-slate-300">Bạn có thể dừng lại đọc diễn biến. Ván tiếp theo chỉ bắt đầu khi bạn tiếp tục và xác nhận chiến thuật.</p>
    {game.phases.map(phase=><details open key={phase.phase} className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm">
      <summary className="cursor-pointer min-h-11 py-2 font-semibold text-cyan-300">{phase.phase} · {phase.winner==='PLAYER'?'Chiếm lợi thế':'Bị đối thủ ép'} · {TACTIC_METADATA[phase.playerTactic].name}</summary>
      <div className="mt-3 space-y-2">
        <p className="text-slate-300">Đối thủ {phase.wasOffScript?'lệch bài':'đúng bài'}: {ARCHETYPE_LABELS[phase.opponentArchetypeActual]} · {TACTIC_METADATA[phase.opponentTactic].name}</p>
        <p className="text-slate-400">Xác suất thắng pha: {Math.round(phase.winProbability*100)}% · Chênh lệch vàng: {phase.goldDelta>0?'+':''}{phase.goldDelta.toLocaleString()}</p>
        {phase.events.map((event,index)=><p key={index} className="text-xs text-slate-300">{event}</p>)}
        <p className="text-cyan-200">{phase.keyMoment}</p>
      </div>
    </details>)}
    <div className="pt-3 border-t border-slate-700">
      <button data-testid="game-next" className="min-h-11 w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-400 text-slate-950 font-bold" onClick={onNext}>{nextLabel}</button>
    </div>
  </section>;
}
