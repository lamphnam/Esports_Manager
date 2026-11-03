import { PlayerStats, Role } from '../types';
import { murmurHash3,SeededRng } from './seededRng';

export function playerSlug(name:string):string {
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
}
export function mapLegacyRating(rating:number):number {
  if(!Number.isFinite(rating))throw new Error('Invalid rating');
  const r=Math.max(76,Math.min(98,rating));
  if(r<=80)return Math.round(55+(r-76)*14/4);
  if(r<=86)return Math.max(70,Math.round(70+(r-81)*9/5));
  if(r<=91)return Math.max(80,Math.round(80+(r-87)*9/4));
  return Math.max(90,Math.round(90+(r-92)));
}
// Used only when no licensed source rating exists. This is game balance, not a performance claim.
export function deriveRating(player:string,team:string,year:number,role:Role):number {
  const rng=new SeededRng(murmurHash3(`${player}|${team}|${year}|${role}`));
  const tier=rng.weightedChoice([[76,80],[81,86],[87,91],[92,98]],[13,56,25,6]);
  return rng.nextInt(tier[0],tier[1]);
}
export function legacyStats(playerId:string,year:number,role:Role,ovr:number):PlayerStats {
  const shapes:Record<Role,number[]>={TOP:[3,-1,-2,0,0],JUNGLE:[1,3,0,-1,-2],MID:[3,2,-2,0,1],BOT:[4,-2,-1,1,0],SUPPORT:[-4,3,4,0,-1]};
  const rng=new SeededRng(murmurHash3(`${playerId}|${year}`));
  let values=shapes[role].map(offset=>Math.max(0,Math.min(99,ovr+offset+rng.nextInt(-2,2))));
  for(let i=0;i<200;i++){
    const delta=ovr-Math.round(values[0]*.3+values[1]*.25+values[2]*.2+values[3]*.15+values[4]*.1);
    if(!delta)break;
    const index=values.findIndex(v=>v+Math.sign(delta)>=0&&v+Math.sign(delta)<=99);
    if(index<0)break;
    values[index]+=Math.sign(delta);
  }
  return {mechanics:values[0],macro:values[1],teamwork:values[2],mental:values[3],championPool:values[4]};
}
