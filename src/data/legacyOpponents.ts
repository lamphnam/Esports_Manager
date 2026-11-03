import {LEGACY_TEAMS,historicalTeam} from './legacyPool';
import {SeededRng} from '../lib/seededRng';
import {Chapter,OpponentArchetype} from '../types';

export function legacyOpponent(chapter:number,seed:number):Chapter['opponent']{
 const pool=(chapter===6||chapter===9)?LEGACY_TEAMS.filter(t=>['VCS','PCS','LMS','LJL'].includes(t.region)):LEGACY_TEAMS;
 const rng=new SeededRng(seed),team=rng.choice(pool),year=Number(rng.choice(Object.keys(team.rosters)));
 const snapshot=historicalTeam(team.id,year);
 const archetypes:OpponentArchetype[]=['EARLY_AGGRO','OBJECTIVE_CONTROL','LATE_SCALING','SPLIT_PRESSURE','BALANCED'];
 return {snapshot,name:snapshot.teamName,shortTag:team.id.toUpperCase().slice(0,4),logoKey:snapshot.logoKey,ovr:snapshot.teamOvr,archetype:rng.choice(archetypes),description:'Đội hình Legacy trong nhánh loại trực tiếp hư cấu; không phải đội hình hay thể thức mùa hiện tại.',rosterPreview:snapshot.roster.map(p=>({role:p.role,displayName:p.displayName,ovr:p.ovr}))};
}
