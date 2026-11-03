import { describe,expect,it } from 'vitest';
import { EDITIONS_CATALOG, computeCardOvr, getEffectiveCardStats } from '../../data/cardCatalog';
import { getTrainingCost } from '../economyEngine';
import { simulatePhase,simulateSeries } from '../simulator';
import { getTacticRosterFit,PHASE_TACTICS } from '../tacticsMatrix';
import { defaultTactics,sampleTeam } from './fixtures';
import * as engine from '../simulator';

describe('audit regressions',()=>{
  it('P1-6 exposes incremental games rather than resolving future games',()=>{
    expect('simulateNextGame' in engine).toBe(true);
    const team=sampleTeam();
    for(const format of ['BO3','BO5'] as const){
      const games=[];let decisions=0;
      while(!engine.seriesFinished(format,games)){
        const tactics=games.length?engine.recommendTactics(team,'BALANCED'):defaultTactics;
        const game=engine.simulateNextGame(42,format,team,team,games,tactics,{archetype:'BALANCED'});
        expect(game!.gameIndex).toBe(games.length+1);
        decisions+=games.length?1:3;games.push(game!);
      }
      expect(decisions).toBeLessThanOrEqual(format==='BO3'?5:7);
      expect(engine.simulateNextGame(42,format,team,team,games,defaultTactics,{archetype:'BALANCED'})).toBeNull();
    }
  });
  it('P1-2 TRADE_MAP averages both mental stats',()=>{
    const team=sampleTeam();team.ratings.macro=80;
    team.roster.forEach(p=>p.effectiveStats.mental=80);
    expect(getTacticRosterFit('TRADE_MAP',team)).toBe(4);
  });
  it('P1-3 tactic fit always stays in [-5,5]',()=>{
    const team=sampleTeam();
    for(let stat=0;stat<=100;stat++){
      team.roster.forEach(p=>{for(const key of Object.keys(p.effectiveStats) as (keyof typeof p.effectiveStats)[])p.effectiveStats[key]=stat;});
      team.ratings={lane:stat,macro:stat,teamfight:stat};
      for(const tactic of Object.values(PHASE_TACTICS).flat())expect(Math.abs(getTacticRosterFit(tactic,team))).toBeLessThanOrEqual(5);
    }
  });
  it('P1-4 opponent synergy is clamped and actually affects power',()=>{
    const player=sampleTeam(),opponent=sampleTeam();
    const base=simulatePhase(42,1,'EARLY',player,{...opponent,synergyBonus:0},'SAFE_FARM',{archetype:'BALANCED'});
    const changed=simulatePhase(42,1,'EARLY',player,{...opponent,synergyBonus:99},'SAFE_FARM',{archetype:'BALANCED'});
    expect(changed.opponentPhasePower-base.opponentPhasePower).toBe(8);
  });
  it('P1-5 tier 1 applies exactly 10% training discount',()=>{
    const price=getTrainingCost as (level:number,tier:number)=>number;
    expect(price(1,1)).toBe(90);expect(price(3,1)).toBe(198);expect(price(10,1)).toBe(0);
  });
  it('P1-11 largest counterfactual gap across all games is shown first; no +0% optimal claim',()=>{
    const team=sampleTeam(5);
    for(let seed=0;seed<30;seed++){
      const result=simulateSeries('test',seed,'BO5',team,team,[defaultTactics],{archetype:'BALANCED'});
      const gaps=result.counterfactual.map(c=>Math.abs(c.probabilityDiffPercent));
      expect(gaps[0]).toBe(Math.max(...gaps));
      expect(result.counterfactual.every(c=>!c.explanation.includes('(+0%'))).toBe(true);
      for(const cf of result.counterfactual) expect(cf.explanation).toContain(cf.probabilityDiffPercent>0?'tăng':cf.probabilityDiffPercent<0?'giảm':'tương đương');
    }
  });
  it('P1-12 displayed OVR equals effective stat-derived OVR after training',()=>{
    for(const edition of EDITIONS_CATALOG){
      const result=getEffectiveCardStats({instanceId:'test',editionId:edition.id,playerId:edition.playerId,level:4,trainedStats:{macro:6},acquiredAt:1,acquiredFrom:'test'},edition);
      expect(result.ovr).toBe(computeCardOvr(result.stats));
    }
  });
});
