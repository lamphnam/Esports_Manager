import editions from '../../data/generated/legacyEditions.json';
import {LEGACY_TEAMS,ROLES,historicalTeam} from '../../data/legacyPool';
import {getEditionById,getPlayerById,computeCardOvr} from '../../data/cardCatalog';
import {SeededRng,murmurHash3} from '../seededRng';
import {calculateTeamRatings,GameTactics,recommendTactics,simulateSeries} from '../simulator';
import {OpponentArchetype,Role,SeriesFormat,TeamSnapshot} from '../../types';

export type RerollScope='REGION'|'CLUB'|'YEAR';
export interface DraftOffer{region:string;teamId:string;year:number;editionIds:string[]}
export interface DraftSession{seed:number;step:number;slots:Partial<Record<Role,string>>;used:Record<RerollScope,boolean>;offer:DraftOffer|null}
const teamMap=new Map(LEGACY_TEAMS.map(team=>[team.id,team]));
const pool=editions as unknown as (typeof editions[number]&{role:Role})[];

function availableOffers(session:DraftSession):DraftOffer[]{
 const usedPlayers=new Set(Object.values(session.slots).map(id=>getEditionById(id!)!.playerId));
 const groups=new Map<string,DraftOffer>();
 for(const edition of pool){
  if(session.slots[edition.role]||usedPlayers.has(edition.playerId))continue;
  const key=`${edition.teamId}|${edition.editionYear}`,team=teamMap.get(edition.teamId)!;
  if(!groups.has(key))groups.set(key,{region:team.region,teamId:team.id,year:edition.editionYear,editionIds:[]});
  groups.get(key)!.editionIds.push(edition.id);
 }
 return [...groups.values()];
}
function selectOffer(session:DraftSession,scope:RerollScope):DraftOffer|null{
 let offers=availableOffers(session);
 if(scope==='CLUB'&&session.offer)offers=offers.filter(o=>o.region===session.offer!.region);
 if(scope==='YEAR'&&session.offer)offers=offers.filter(o=>o.teamId===session.offer!.teamId);
 if(!offers.length)return null;
 const alternatives=offers.filter(o=>scope==='REGION'?o.region!==session.offer?.region:scope==='CLUB'?o.teamId!==session.offer?.teamId:o.year!==session.offer?.year);
 if(alternatives.length)offers=alternatives;
 const rng=new SeededRng(murmurHash3(`${session.seed}|${session.step}|${scope}|${JSON.stringify(session.used)}`));
 const regions=[...new Set(offers.map(o=>o.region))],region=rng.choice(regions);
 const clubs=[...new Set(offers.filter(o=>o.region===region).map(o=>o.teamId))],club=rng.choice(clubs);
 return rng.choice(offers.filter(o=>o.teamId===club));
}
export function createDraft(seed:number):DraftSession{
 if(!Number.isSafeInteger(seed)||seed<0)throw new Error('Invalid draft seed');
 const session:DraftSession={seed,step:0,slots:{},used:{REGION:false,CLUB:false,YEAR:false},offer:null};
 return {...session,offer:selectOffer(session,'REGION')};
}
export function rerollDraft(session:DraftSession,scope:RerollScope):DraftSession{
 if(session.used[scope]||!session.offer||draftComplete(session))return session;
 const next={...session,step:session.step+1,used:{...session.used,[scope]:true}};
 return {...next,offer:selectOffer(next,scope)||session.offer};
}
export function draftComplete(session:DraftSession):boolean{
 const players=new Set<string>();
 for(const role of ROLES){const id=session.slots[role],ed=id?getEditionById(id):null;if(!ed||ed.editionCode!=='LEGACY'||ed.role!==role||players.has(ed.playerId))return false;players.add(ed.playerId);}
 return true;
}
export function pickDraftCard(session:DraftSession,editionId:string):DraftSession{
 if(!session.offer?.editionIds.includes(editionId))return session;
 const edition=getEditionById(editionId)!;if(!edition.role||session.slots[edition.role])return session;
 if(Object.values(session.slots).some(id=>getEditionById(id!)!.playerId===edition.playerId))return session;
 const next={...session,step:session.step+1,slots:{...session.slots,[edition.role]:editionId}};
 return {...next,offer:draftComplete(next)?null:selectOffer({...next,offer:null},'REGION')};
}
export function draftSnapshot(session:DraftSession):TeamSnapshot{
 if(!draftComplete(session))throw new Error('Draft must have five unique players');
 const roster:TeamSnapshot['roster']=ROLES.map(role=>{
  const edition=getEditionById(session.slots[role]!)!,player=getPlayerById(edition.playerId)!;
  return {role,displayName:player.displayName,ovr:computeCardOvr(edition.baseStats),effectiveStats:{...edition.baseStats},archetype:player.playstyle};
 });
 return {teamName:'Đội Tuyển Của Bạn',logoKey:'gold_star',roster,teamOvr:Math.round(roster.reduce((n,p)=>n+p.ovr,0)/5),ratings:calculateTeamRatings(roster),synergyBonus:Math.min(8,new Set(roster.map(p=>p.archetype)).size)};
}
export interface BracketMatch{round:number;teamA:string;teamB:string;winner:string;score:string;hasUser:boolean;userWon:boolean}
export interface CircuitStage{name:string;format:SeriesFormat;matches:BracketMatch[];champion:string;userWins:number;isOfficialFormat:false;adaptationNote:string;rulesBasisYear:number;realWorldReferenceUrl:string}
export function simulateDraftCircuit(session:DraftSession,opening?:GameTactics):CircuitStage[]{
 const user=draftSnapshot(session),rng=new SeededRng(murmurHash3(`${session.seed}|circuit`));
 const archetypes:OpponentArchetype[]=['EARLY_AGGRO','OBJECTIVE_CONTROL','LATE_SCALING','SPLIT_PRESSURE','BALANCED'];
 return ['Split 1','First Stand','Split 2','MSI','Split 3','Worlds'].map((name,stageIndex)=>{
  const format:SeriesFormat=stageIndex%2===0?'BO3':'BO5';
  const drawn=new Set<string>();let teams=[user];
  while(teams.length<8){const team=rng.choice(LEGACY_TEAMS),year=Number(rng.choice(Object.keys(team.rosters))),key=`${team.id}|${year}`;if(drawn.has(key))continue;drawn.add(key);teams.push(historicalTeam(team.id,year));}
  const matches:BracketMatch[]=[];let userWins=0;
  for(let round=1;teams.length>1;round++){
   const advancing:TeamSnapshot[]=[];
   for(let i=0;i<teams.length;i+=2){
    const a=teams[i],b=teams[i+1],policy={archetype:rng.choice(archetypes)},auto=recommendTactics(a,policy.archetype),first=a===user&&opening?opening:auto;
    const tactics=Array.from({length:format==='BO3'?3:5},(_,g)=>g?{...auto,mid:first.mid}:first);
    const result=simulateSeries(`draft-${stageIndex}-${round}-${i}`,rng.nextInt(0,0x7fffffff),format,a,b,tactics,policy);
    const winner=result.winner==='PLAYER'?a:b,hasUser=a===user||b===user,userWon=winner===user;
    matches.push({round,teamA:a.teamName,teamB:b.teamName,winner:winner.teamName,score:`${result.playerWins}-${result.opponentWins}`,hasUser,userWon});
    if(userWon)userWins++;advancing.push(winner);
   }
   teams=advancing;
  }
  return {name,format,matches,champion:teams[0].teamName,userWins,isOfficialFormat:false,adaptationNote:'Bracket 8 đội loại trực tiếp hư cấu; không phải thể thức giải thật.',rulesBasisYear:2027,realWorldReferenceUrl:'https://lolesports.com/'};
 });
}
