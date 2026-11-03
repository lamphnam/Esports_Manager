import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import {WORLD_CHAMPIONSHIP_DEMO_SCENARIO as scenario} from '../data/demoScenario';
import {GameSimulationResult,MatchPhase,TacticCode} from '../types';
import {recommendTactics,seriesFinished,simulateNextGame,summarizeSeries} from '../lib/simulator';
import {PHASE_TACTICS,TACTIC_METADATA} from '../lib/tacticsMatrix';
import {ARCHETYPE_LABELS} from '../lib/labels';
import {useDialog} from '../lib/useDialog';

const phases:MatchPhase[]=['EARLY','MID','LATE'];
// Intentionally owns only ephemeral component state. No career context or persistence access.
export function WorldDemoModal({onClose}:{onClose:()=>void}){
 const dialog=useDialog(onClose),seed=useRef(Date.now());
 const [games,setGames]=useState<GameSimulationResult[]>([]),[stage,setStage]=useState<'CHOICE'|'REPLAY'|'RESULT'>('CHOICE');
 const [focus,setFocus]=useState<MatchPhase>('MID'),[phaseIndex,setPhaseIndex]=useState(0),[fast,setFast]=useState(false);
 const [choices,setChoices]=useState<Record<MatchPhase,TacticCode>>({EARLY:'SAFE_FARM',MID:'CONTEST_OBJECTIVE',LATE:'FORCE_TEAMFIGHT'});
 const [decisions,setDecisions]=useState(0);
 const policy={archetype:scenario.opponentArchetype};
 const advance=()=>{
  if(seriesFinished('BO5',games))setStage('RESULT');
  else{
   const auto=recommendTactics(scenario.playerTeam,scenario.opponentArchetype);
   setChoices({EARLY:auto.early,MID:auto.mid,LATE:auto.late});setStage('CHOICE');
  }
 };
 useEffect(()=>{
  if(stage!=='REPLAY')return;
  const timer=setTimeout(()=>{if(phaseIndex<2)setPhaseIndex(i=>i+1);else advance();},fast?300:6000);
  return()=>clearTimeout(timer);
 },[stage,phaseIndex,games,fast]);
 const start=()=>{
  const next=simulateNextGame(seed.current,'BO5',scenario.playerTeam,scenario.opponentTeam,games,{early:choices.EARLY,mid:choices.MID,late:choices.LATE},policy);
  if(!next)return;
  setDecisions(n=>n+(games.length?1:3));setGames([...games,next]);setPhaseIndex(0);setStage('REPLAY');
 };
 const visible=stage==='REPLAY'?games.slice(0,-1):games;
 const playerWins=visible.filter(g=>g.winner==='PLAYER').length;
 const result=stage==='RESULT'?summarizeSeries('world-demo',seed.current,'BO5',scenario.playerTeam,scenario.opponentTeam,games,policy):null;
 return <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
  <div ref={dialog} role="dialog" aria-modal="true" aria-label="Demo Chung Kết Thế Giới" tabIndex={-1} className="w-full max-w-4xl max-h-[90dvh] overflow-y-auto bg-[#111827] border border-amber-600 rounded-xl p-5 space-y-5">
   <header className="flex items-start justify-between gap-3"><div><span className="text-xs text-amber-300">DEMO BO5 · Không ghi vào sự nghiệp</span><h2 className="font-display text-2xl font-bold">{scenario.title}</h2><p className="text-sm text-slate-300">{scenario.subtitle}</p></div><button aria-label="Đóng demo" className="min-h-11 min-w-11" onClick={onClose}><X/></button></header>
   <p className="text-sm text-slate-300">{scenario.description}</p>
   <div className="grid sm:grid-cols-2 gap-4">{[scenario.playerTeam,scenario.opponentTeam].map(team=><section key={team.teamName} className="bg-slate-950 rounded-lg p-4 text-sm space-y-2"><h3 className="font-bold text-amber-300">{team.teamName} · OVR {team.teamOvr}</h3>{team.roster.map(p=><div key={p.role} className="flex justify-between"><span>{p.role} · {p.displayName}</span><span>{p.ovr}</span></div>)}<p className="text-xs text-slate-400">Lane {team.ratings.lane} · Macro {team.ratings.macro} · Teamfight {team.ratings.teamfight} · Synergy +{team.synergyBonus}</p></section>)}</div>
   <p className="font-mono text-amber-300" data-testid="demo-score">{playerWins} - {visible.length-playerWins} · {decisions}/7 quyết định</p>
   {stage==='CHOICE'&&<section className="space-y-3">
    <p>{games.length?'FOCUS_1: một pha can thiệp; hai pha còn lại dùng gợi ý đã chọn sẵn.':'Ván đầu: chọn chiến thuật cả ba pha.'}</p>
    {games.length>0&&<div className="flex flex-wrap gap-2">{phases.map(phase=><button key={phase} aria-pressed={focus===phase} className="min-h-11 px-3 border rounded" onClick={()=>setFocus(phase)}>Can thiệp {phase}</button>)}</div>}
    {phases.map(phase=><fieldset key={phase} disabled={games.length>0&&phase!==focus} className="border border-slate-700 p-3 rounded-lg disabled:opacity-60"><legend>{phase}{games.length>0&&phase!==focus?' · Tự động':''}</legend><div className="grid sm:grid-cols-3 gap-2">{PHASE_TACTICS[phase].map(tactic=><button key={tactic} aria-pressed={choices[phase]===tactic} className={`min-h-11 px-3 py-2 rounded border text-sm ${choices[phase]===tactic?'border-amber-400 text-amber-200':'border-slate-600'}`} onClick={()=>setChoices({...choices,[phase]:tactic})}>{TACTIC_METADATA[tactic].name}</button>)}</div></fieldset>)}
    <button className="min-h-11 px-5 rounded bg-amber-400 text-slate-950 font-bold" onClick={start}>Bắt Đầu Ván {games.length+1}</button>
   </section>}
   {stage==='REPLAY'&&<section className="space-y-3">
    {games.at(-1)!.phases.slice(0,phaseIndex+1).map(phase=><div key={phase.phase} className="bg-slate-950 p-3 rounded text-sm space-y-1"><h3 className="text-cyan-300">Ván {games.length} · {phase.phase} · {Math.round(phase.winProbability*100)}%</h3><p>{phase.wasOffScript?'Lệch bài':'Đúng bài'}: {ARCHETYPE_LABELS[phase.opponentArchetypeActual]} · {TACTIC_METADATA[phase.opponentTactic].name}</p><p>{phase.keyMoment}</p>{phase.events.map(e=><p className="text-xs text-slate-400" key={e}>{e}</p>)}</div>)}
    <button className="min-h-11 px-3 border rounded mr-3" onClick={()=>setFast(value=>!value)}>Tốc Độ: {fast?'Nhanh':'Thường'}</button><button className="min-h-11 px-3 border rounded" onClick={advance}>Bỏ Qua Diễn Biến Ván</button>
   </section>}
   {result&&<section className="space-y-3"><h3 className="text-xl text-amber-300">Kết Quả Demo: {result.playerWins} - {result.opponentWins}</h3><p className="text-sm">{result.counterfactual[0].explanation}</p><p className="text-sm">{result.coachingAdvice}</p><button className="min-h-11 px-4 bg-slate-700 rounded" onClick={onClose}>Kết Thúc Demo</button></section>}
   <p className="text-xs text-slate-400">Mô phỏng hư cấu, không phải sản phẩm chính thức của Riot/Acer. {scenario.adaptationNote}</p>
  </div>
 </div>;
}
