import { describe, expect, it } from 'vitest';
import { EDITIONS_CATALOG } from '../../data/cardCatalog';
import { decodeSave, encodeSave } from '../recoveryCode';
import { emptySave, GameSave, saveReducer, validateSave } from '../saveState';

export function sampleSave():GameSave {
  const cards=EDITIONS_CATALOG.filter(e=>e.editionCode==='ACADEMY').slice(0,5).map((e,i)=>({instanceId:`fixture-${i}`,editionId:e.id,playerId:e.playerId,level:1,trainedStats:{},acquiredAt:1,acquiredFrom:'test'}));
  return {...emptySave(),ownedCards:cards,club:{id:'club-test',name:'CLB Việt Nam',logoKey:'gold_star',homeRegion:'Vietnam',reputation:0,careerYear:2026,currentChapterId:1,completedChapterIds:[],recoveryCode:'',wallet:{credits:500,trainingMaterials:0,scoutTickets:0},scoutPityMisses:0,packs:[],lineup:{TOP:cards[0].instanceId,JUNGLE:cards[1].instanceId,MID:cards[2].instanceId,BOT:cards[3].instanceId,SUPPORT:cards[4].instanceId},facilities:{TRAINING_CENTER:0,SCOUT_OFFICE:0,STRATEGY_LAB:0},createdAt:1}};
}
describe('Recovery Code',()=>{
  it('P1-13 bounds the hot ledger and archives old balances',()=>{
    const state=sampleSave();const ledger=Array.from({length:600},(_,i)=>({id:`id-${i}`,timestamp:1,deltaCredits:1,deltaMaterials:0,deltaTickets:0,reason:'test',sourceType:'SPONSOR' as const}));
    const save=saveReducer(state,{ledger});
    expect(save.ledger.length).toBeLessThanOrEqual(500);
    expect(save.ledger.reduce((sum,e)=>sum+e.deltaCredits,0)+((save as GameSave & {ledgerArchive?:{credits:number}}).ledgerArchive?.credits||0)).toBe(600);
  });
  it('accepts real millisecond timestamps in 2026',async()=>{
    const save=sampleSave();save.club!.createdAt=1793679600000;
    expect(await decodeSave(await encodeSave(save))).toEqual(save);
  });
  it('round-trips a compressed Unicode save and does not mutate source',async()=>{
    const save=sampleSave(), before=structuredClone(save), code=await encodeSave(save);
    expect(code.startsWith('AR1.')).toBe(true);
    expect(code.length).toBeLessThan(JSON.stringify(save).length);
    expect(await decodeSave(code)).toEqual(save);expect(save).toEqual(before);
  });
  it('rejects damaged code, unknown versions, random text and oversized payloads',async()=>{
    const code=await encodeSave(sampleSave());
    for(const bad of [code.slice(0,-8)+'00000000',code.replace('AR1.','AR2.'),'AR-FAKE','x'.repeat(500001)]) await expect(decodeSave(bad)).rejects.toThrow();
    expect(()=>validateSave({...sampleSave(),version:99})).toThrow();
  });
  it('rejects malformed saves before replacement',()=>{
    const save=sampleSave();save.club!.wallet.credits=-1;expect(()=>validateSave(save)).toThrow();
    save.club!.wallet.credits=500;save.club!.lineup.TOP='missing';expect(()=>validateSave(save)).toThrow();
  });
  it('combines patches without reverting a previous update',()=>{
    const save=sampleSave();
    const a=saveReducer(save,{club:{...save.club!,wallet:{...save.club!.wallet,credits:1000}}});
    const b=saveReducer(a,{ledger:[{id:'reward',timestamp:1,deltaCredits:500,deltaMaterials:0,deltaTickets:0,reason:'test',sourceType:'MILESTONE'}]});
    expect(b.club!.wallet.credits).toBe(1000);expect(b.ledger).toHaveLength(1);expect(save.club!.wallet.credits).toBe(500);
  });
});
