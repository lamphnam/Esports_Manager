import teams from './generated/legacyTeams.json';
import {getEditionById,getPlayerById,computeCardOvr} from './cardCatalog';
import {ENABLE_REAL_CLUB_NAMES} from './featureFlags';
import {calculateTeamRatings} from '../lib/simulator';
import {TeamSnapshot,Role} from '../types';

export const LEGACY_TEAMS=teams;
export const ROLES:Role[]=['TOP','JUNGLE','MID','BOT','SUPPORT'];
export function historicalTeam(teamId:string,year:number):TeamSnapshot {
 const team=teams.find(t=>t.id===teamId);
 const lineup=team?.rosters[String(year) as keyof typeof team.rosters];
 if(!team||!lineup)throw new Error('Unknown historical roster');
 const roster:TeamSnapshot['roster']=ROLES.map(role=>{
   const edition=getEditionById((lineup as Record<Role,string[]>)[role][0])!,player=getPlayerById(edition.playerId)!;
   return {role,displayName:player.displayName,ovr:computeCardOvr(edition.baseStats),effectiveStats:{...edition.baseStats},archetype:player.playstyle};
 });
 return {teamName:ENABLE_REAL_CLUB_NAMES?`${team.name} ${year}`: `${team.teamAlias} ${year}`,logoKey:'gold_star',teamOvr:Math.round(roster.reduce((n,p)=>n+p.ovr,0)/5),ratings:calculateTeamRatings(roster),synergyBonus:Math.min(8,new Set(roster.map(p=>p.archetype)).size),roster};
}
