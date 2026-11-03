import { describe, expect, it } from 'vitest';
import matrix from '../../../docs/config/tactics.matrix.json';
import balance from '../../../docs/config/balance.initial.json';
import { CAMPAIGN_CHAPTERS } from '../../data/campaignData';
import { MatchPhase, SeriesFormat } from '../../types';
import { openPackInstance, PACK_DEFINITIONS } from '../economyEngine';
import { computeSubSeed, SeededRng } from '../seededRng';
import { simulateGame, simulateSeries } from '../simulator';
import { DECISION_FIT_MATRIX, PHASE_TACTICS } from '../tacticsMatrix';
import { chapterOpponent, defaultTactics, sampleTeam } from './fixtures';

describe('spec invariants', () => {
  it('matrix equals the spec and satisfies all four constraints', () => {
    for (const phase of ['EARLY','MID','LATE'] as MatchPhase[]) {
      const tactics = PHASE_TACTICS[phase];
      const rows = tactics.map(t => Object.values(DECISION_FIT_MATRIX[t]));
      tactics.forEach(t=>expect(DECISION_FIT_MATRIX[t]).toEqual((matrix.decisionFit[phase] as Record<string,unknown>)[t]));
      rows.forEach((row,i) => {
        row.forEach(v=>{expect(v).toBeGreaterThanOrEqual(-6);expect(v).toBeLessThanOrEqual(6);});
        expect(row.some((v,c)=>v===Math.max(...rows.map(r=>r[c])))).toBe(true);
        rows.forEach((other,j)=>{if(i!==j) expect(row.some((v,c)=>v>other[c])).toBe(true);});
      });
      const means=rows.map(r=>r.reduce((a,b)=>a+b,0)/r.length);
      expect(Math.max(...means)-Math.min(...means)).toBeLessThanOrEqual(1.5);
    }
  });
  it('pack odds and pity configuration still match v2.2', () => {
    for(const family of ['WELCOME','SCOUT','ELITE','CHAMPION'] as const) {
      for(const rarity of ['COMMON','RARE','EPIC','LEGENDARY'] as const) expect(PACK_DEFINITIONS[family].rarityWeights[rarity]).toBe(balance.packs[family][rarity]);
    }
    expect(PACK_DEFINITIONS.SCOUT.pityLimit).toBe(8);
  });
  it('10k seeds / 100k Scout openings: seven misses max, forced eighth and natural resets', () => {
    let maxMisses=0, naturalReset=0, seventhMiss=0;
    for(let seed=0;seed<10000;seed++) {
      let misses=0;
      for(let i=0;i<10;i++) {
        const draw=openPackInstance('SCOUT',misses,computeSubSeed(seed,i,'PACK',0));
        const epicPlus=['EPIC','LEGENDARY'].includes(draw.edition.rarity);
        if(misses===7) {expect(epicPlus).toBe(true);expect(draw.wasPityTriggered).toBe(true);}
        if(epicPlus) {expect(draw.newPityMisses).toBe(0);if(!draw.wasPityTriggered)naturalReset++;}
        if(draw.edition.rarity==='COMMON') expect(draw.edition.baseOvr).toBeGreaterThanOrEqual(62);
        if(misses===6&&!epicPlus)seventhMiss++;
        misses=draw.newPityMisses;maxMisses=Math.max(maxMisses,misses);
      }
    }
    expect(maxMisses).toBe(7);expect(naturalReset).toBeGreaterThan(0);expect(seventhMiss).toBeGreaterThan(0);
  });
  it('EARLY decisions leave MID/LATE unchanged and same seed repeats 1000 times', () => {
    const player=sampleTeam(), opponent=chapterOpponent(CAMPAIGN_CHAPTERS[0]);
    for(let seed=0;seed<1000;seed++) {
      const first=simulateGame(seed,1,player,opponent,defaultTactics,{archetype:'EARLY_AGGRO'});
      expect(simulateGame(seed,1,player,opponent,defaultTactics,{archetype:'EARLY_AGGRO'})).toEqual(first);
      const altered=simulateGame(seed,1,player,opponent,{...defaultTactics,early:'GANK_TOP'},{archetype:'EARLY_AGGRO'});
      expect(altered.phases.slice(1)).toEqual(first.phases.slice(1));
    }
  });
  it('5000 series per format: bounded probabilities, finite powers and correct termination', () => {
    const player=sampleTeam();
    for(const format of ['BO1','BO3','BO5'] as SeriesFormat[]) for(let seed=0;seed<5000;seed++) {
      const chapter=CAMPAIGN_CHAPTERS[seed%12];
      const result=simulateSeries('test',seed,format,player,chapterOpponent(chapter),[defaultTactics],{archetype:chapter.opponent.archetype});
      expect(Math.max(result.playerWins,result.opponentWins)).toBe(format==='BO1'?1:format==='BO3'?2:3);
      for(const game of result.games) for(const phase of game.phases) {
        expect(phase.winProbability>=0.08&&phase.winProbability<=0.92).toBe(true);
        expect(Number.isFinite(phase.playerPhasePower)&&Number.isFinite(phase.opponentPhasePower)).toBe(true);
      }
    }
  });
  it('Mulberry32 golden vector', () => {
    const rng=new SeededRng(1);
    expect(Array.from({length:3},()=>rng.next())).toEqual([0.6270739405881613,0.002735721180215478,0.5274470399599522]);
  });
});
