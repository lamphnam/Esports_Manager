import {LEGACY_TEAMS,historicalTeam} from './legacyPool';
import {calculateTeamRatings} from '../lib/simulator';
import {murmurHash3,SeededRng} from '../lib/seededRng';
import {Chapter,OpponentArchetype,PlayerStats,TeamSnapshot} from '../types';

/*
 * Chapters 6-12 face historical rosters. Their strength follows a difficulty curve instead of a random draw:
 * each chapter has a target team OVR, the opponent is picked among the closest team-years in the pool, and when
 * the pool has nobody strong enough (APAC regions top out near 73) a bounded `difficultyBonus` is added to every
 * roster stat. The bonus is stored on the snapshot and shown to the player.
 * Targets are calibrated with scripts/progression-sim.ts (see docs/ECONOMY.md "Độ khó Ch6–12").
 */
export const OPPONENT_TARGET_OVR:Record<number,number>={6:80,7:84,8:86,9:88,10:90,11:93,12:95};
// From season 2 the whole pro run (chapters 3-12) is retuned for a club that already won a Worlds.
export const SEASON2_TARGET_OVR:Record<number,number>={3:92,4:92,5:93,6:93,7:94,8:95,9:95,10:96,11:96,12:97};
export const SEASON_STEP=2;
export const MAX_TEAM_OVR=97;
export const targetOvr=(chapter:number,season:number)=>season<=1?OPPONENT_TARGET_OVR[chapter]:Math.min(MAX_TEAM_OVR,SEASON2_TARGET_OVR[chapter]+(season-2)*SEASON_STEP);
export const MAX_DIFFICULTY_BONUS=16;
const APAC_REGIONS=['VCS','PCS','LMS','LJL'];
const CLUSTER=1; // teams within this many OVR of the best match are interchangeable
const ARCHETYPES:OpponentArchetype[]=['EARLY_AGGRO','OBJECTIVE_CONTROL','LATE_SCALING','SPLIT_PRESSURE','BALANCED'];

export const campaignOpponentSeed=(chapter:number,season=1)=>murmurHash3(season<=1?`campaign-${chapter}-v1.1`:`campaign-${chapter}-s${season}`);

interface TeamYear{teamId:string;year:number;region:string;ovr:number}
let teamYears:TeamYear[]|null=null;
function allTeamYears():TeamYear[] {
 if(!teamYears){
  teamYears=[];
  for(const team of LEGACY_TEAMS)for(const year of Object.keys(team.rosters))
   teamYears.push({teamId:team.id,year:Number(year),region:team.region,ovr:historicalTeam(team.id,Number(year)).teamOvr});
  teamYears.sort((a,b)=>a.teamId<b.teamId?-1:a.teamId>b.teamId?1:a.year-b.year);
 }
 return teamYears;
}

export function withDifficultyBonus(snapshot:TeamSnapshot,bonus:number):TeamSnapshot {
 if(bonus<=0)return snapshot;
 const raise=(value:number)=>Math.min(99,value+bonus);
 const roster=snapshot.roster.map(player=>({...player,ovr:raise(player.ovr),effectiveStats:Object.fromEntries(Object.entries(player.effectiveStats).map(([key,value])=>[key,raise(value)])) as unknown as PlayerStats}));
 return {...snapshot,roster,teamOvr:Math.round(roster.reduce((sum,player)=>sum+player.ovr,0)/roster.length),ratings:calculateTeamRatings(roster),difficultyBonus:bonus};
}

function pick(chapter:number,seed:number,usedTeams:Set<string>,season:number):TeamYear {
 const target=targetOvr(chapter,season);
 const apac=season<=1&&chapter===6;
 const pool=allTeamYears().filter(t=>(!apac||APAC_REGIONS.includes(t.region))&&!usedTeams.has(t.teamId));
 const ranked=[...pool].sort((a,b)=>Math.abs(a.ovr-target)-Math.abs(b.ovr-target));
 const best=Math.abs(ranked[0].ovr-target);
 // Prefer the strongest real team when the pool cannot reach the target, so the difficulty bonus stays minimal.
 const nearest=ranked.filter(t=>Math.abs(Math.abs(t.ovr-target)-best)<=CLUSTER&&(t.ovr<=target||Math.abs(t.ovr-target)<=best+CLUSTER));
 return new SeededRng(seed).choice(nearest);
}

export function legacyOpponent(chapter:number,seed:number,season=1):Chapter['opponent']{
 // A team appears once per campaign: replay the earlier picks (they are deterministic) to exclude them.
 const used=new Set<string>();
 for(let earlier=season<=1?6:3;earlier<chapter;earlier++)used.add(pick(earlier,campaignOpponentSeed(earlier,season),used,season).teamId);
 const chosen=pick(chapter,seed,used,season);
 const target=targetOvr(chapter,season);
 const snapshot=withDifficultyBonus(historicalTeam(chosen.teamId,chosen.year),Math.min(MAX_DIFFICULTY_BONUS,Math.max(0,target-chosen.ovr)));
 const rng=new SeededRng(murmurHash3(`archetype-${chapter}-${seed}`));
 const bonus=snapshot.difficultyBonus;
 return {snapshot,name:snapshot.teamName,shortTag:chosen.teamId.toUpperCase().slice(0,4),logoKey:snapshot.logoKey,ovr:snapshot.teamOvr,archetype:rng.choice(ARCHETYPES),description:'Đội hình Legacy trong nhánh loại trực tiếp hư cấu; không phải đội hình hay thể thức mùa hiện tại.',difficultyBonus:bonus,rosterPreview:snapshot.roster.map(p=>({role:p.role,displayName:p.displayName,ovr:p.ovr}))};
}
