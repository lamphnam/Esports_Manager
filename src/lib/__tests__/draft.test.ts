import {describe,it,expect} from 'vitest';
import {createDraft,rerollDraft,pickDraftCard,draftComplete,simulateDraftCircuit} from '../legacyDraft/engine';
import {rewardDraft} from '../legacyDraft/reward';
import {getEditionById} from '../../data/cardCatalog';
import {sampleSave} from './fixtures';

function finish(seed:number){let state=createDraft(seed);while(!draftComplete(state)){expect(state.offer?.editionIds.length).toBeGreaterThan(0);state=pickDraftCard(state,state.offer!.editionIds[0]);}return state;}
describe('clean-room draft',()=>{
 it('1000 seeds never deadlock with all three rerolls; identity never repeats',()=>{
  for(let seed=0;seed<1000;seed++){
   let state=createDraft(seed);
   for(const scope of ['REGION','CLUB','YEAR'] as const){state=rerollDraft(state,scope);expect(rerollDraft(state,scope)).toBe(state);}
   for(let slot=0;slot<5;slot++){expect(state.offer).not.toBeNull();const next=pickDraftCard(state,state.offer!.editionIds[0]);expect(next).not.toBe(state);state=next;}
   expect(draftComplete(state)).toBe(true);expect(state.offer).toBeNull();expect(rerollDraft(state,'REGION')).toBe(state);
   const players=Object.values(state.slots).map(id=>getEditionById(id!)!.playerId);expect(new Set(players).size).toBe(5);
  }
 });
 it('identical actions and seed repeat; invalid picks are safe',()=>{
  expect(finish(42)).toEqual(finish(42));const state=createDraft(42);expect(pickDraftCard(state,'missing')).toBe(state);
  expect(()=>createDraft(NaN)).toThrow();
 });
 it('six 8-team knockout stages use series simulator with exactly 7 matches each',()=>{
  const draft=finish(42),results=simulateDraftCircuit(draft);
  expect(results).toEqual(simulateDraftCircuit(draft));expect(results).toHaveLength(6);
  for(const stage of results){expect(stage.matches).toHaveLength(7);expect(stage.matches.filter(m=>m.round===1)).toHaveLength(4);expect(stage.matches.filter(m=>m.round===3)).toHaveLength(1);expect(stage.isOfficialFormat).toBe(false);}
 });
 it('reward once per seed and twice per VN day, including after save restore',()=>{
  const save=sampleSave(),a=rewardDraft(save,finish(1),'2026-11-03',1,'reward-1');
  expect(a.club!.wallet.credits-save.club!.wallet.credits).toBe(50);expect(a.ownedCards).toHaveLength(6);
  expect(rewardDraft(a,finish(1),'2026-11-03',1,'dup')).toBe(a);
  const b=rewardDraft(a,finish(2),'2026-11-03',1,'reward-2');expect(rewardDraft(b,finish(3),'2026-11-03',1,'cap')).toBe(b);
  const c=rewardDraft(structuredClone(b),finish(3),'2026-11-04',2,'reward-3');expect(c.ownedCards).toHaveLength(8);
  expect(rewardDraft(c,createDraft(4),'2026-11-04',2,'incomplete')).toBe(c);
 });
});
