import { getEditionById } from '../data/cardCatalog';
import { ClubState, CurrencyLedgerEntry, OwnedCard, TransferOffer, CareerMatchSave } from '../types';

export interface GameSave {
  version: 1;
  club: ClubState | null;
  ownedCards: OwnedCard[];
  ledger: CurrencyLedgerEntry[];
  transferOffers: TransferOffer[];
  ledgerArchive?: {credits:number;materials:number;tickets:number;count:number};
  marketDay?:string;
  purchasedOfferIds?:string[];
  draftRewards?:{claimedSeeds:number[];day:string;count:number};
  activeMatch?:CareerMatchSave|null;
  pendingReveal?:{instanceId:string;wasPityTriggered:boolean}|null;
}
export const SAVE_KEY = 'apac_rising_save_v3';
export const emptySave = (): GameSave => ({version:1,club:null,ownedCards:[],ledger:[],transferOffers:[],ledgerArchive:undefined,marketDay:undefined,purchasedOfferIds:undefined,draftRewards:undefined,activeMatch:null,pendingReveal:null});
export function saveReducer(state: GameSave, patch: Partial<GameSave>): GameSave {
  const next:GameSave={...state,...patch,version:1};
  if(next.ledger.length>500){
    const retired=next.ledger.slice(500);
    const archive={...(next.ledgerArchive||{credits:0,materials:0,tickets:0,count:0})};
    for(const entry of retired){archive.credits+=entry.deltaCredits;archive.materials+=entry.deltaMaterials;archive.tickets+=entry.deltaTickets;archive.count++;}
    next.ledgerArchive=archive;next.ledger=next.ledger.slice(0,500);
  }
  return next;
}

const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=(x:unknown,max=300):x is string=>typeof x==='string'&&x.length<=max;
const integer=(x:unknown,min=0,max=Number.MAX_SAFE_INTEGER):x is number=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=min&&x<=max;
const roles=['TOP','JUNGLE','MID','BOT','SUPPORT'];
const families=['WELCOME','SCOUT','ELITE','CHAMPION'];
const stats=['mechanics','macro','teamwork','mental','championPool'];
const tacticCodes=['GANK_TOP','PLAY_MID','SAFE_FARM','CONTEST_OBJECTIVE','SPLIT_PUSH','TRADE_MAP','FORCE_TEAMFIGHT','PROTECT_CARRY','PICK_OFF'];
const finite=(x:unknown,min=-200,max=200)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
function validTeam(team:unknown):boolean{
  if(!record(team)||!text(team.teamName)||!text(team.logoKey)||!integer(team.teamOvr,0,100)||!finite(team.synergyBonus,-8,8)||!record(team.ratings)||!['lane','macro','teamfight'].every(key=>finite((team.ratings as Record<string,unknown>)[key],0,100))||!Array.isArray(team.roster)||team.roster.length!==5)return false;
  return team.roster.every(player=>record(player)&&roles.includes(String(player.role))&&text(player.displayName)&&finite(player.ovr,0,100)&&record(player.effectiveStats)&&stats.every(key=>finite((player.effectiveStats as Record<string,unknown>)[key],0,100)));
}
function validResult(result:unknown):boolean{
  if(!record(result)||!text(result.matchId)||!integer(result.seed)||!['BO1','BO3','BO5'].includes(String(result.seriesFormat))||!integer(result.playerWins,0,3)||!integer(result.opponentWins,0,3)||!['PLAYER','OPPONENT'].includes(String(result.winner))||!record(result.breakdown)||!['rosterDiff','synergyAdvantage','tacticSuitability','decisionQuality'].every(key=>finite((result.breakdown as Record<string,unknown>)[key]))||!text(result.coachingAdvice,1500)||!Array.isArray(result.counterfactual)||result.counterfactual.length>30||!result.counterfactual.every(c=>record(c)&&text(c.explanation,1500))||!Array.isArray(result.games)||result.games.length<1||result.games.length>5)return false;
  return result.games.every(game=>record(game)&&integer(game.gameIndex,1,5)&&text(game.mvpName)&&roles.includes(String(game.mvpRole))&&['PLAYER','OPPONENT'].includes(String(game.winner))&&integer(game.gameDurationMinutes,0,200)&&integer(game.killsPlayer,0,100)&&integer(game.killsOpponent,0,100)&&Array.isArray(game.phases)&&game.phases.length===3&&game.phases.every(phase=>record(phase)&&['EARLY','MID','LATE'].includes(String(phase.phase))&&tacticCodes.includes(String(phase.playerTactic))&&tacticCodes.includes(String(phase.opponentTactic))&&text(phase.opponentArchetypeActual)&&finite(phase.winProbability,.08,.92)&&finite(phase.goldDelta,-10000,10000)&&text(phase.keyMoment,1500)&&Array.isArray(phase.events)&&phase.events.length<=15&&phase.events.every(event=>text(event,1500))));
}

// Recovery is user-controlled input. Reject broken references and unbounded arrays before replacing a save.
export function validateSave(value: unknown): GameSave {
  if(!record(value)||value.version!==1) throw new Error('Phiên bản save không được hỗ trợ.');
  const {club,ownedCards,ledger,transferOffers}=value;
  if(value.draftRewards!==undefined && (!record(value.draftRewards)||!text(value.draftRewards.day,10)||!integer(value.draftRewards.count,0,2)||!Array.isArray(value.draftRewards.claimedSeeds)||value.draftRewards.claimedSeeds.length>10000||!value.draftRewards.claimedSeeds.every(seed=>integer(seed))))throw new Error('Lịch sử Draft không hợp lệ.');
  if(value.marketDay!==undefined && (typeof value.marketDay!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value.marketDay)))throw new Error('Ngày thị trường không hợp lệ.');
  if(value.purchasedOfferIds!==undefined && (!Array.isArray(value.purchasedOfferIds)||value.purchasedOfferIds.length>6||!value.purchasedOfferIds.every(id=>text(id))))throw new Error('Lịch sử thị trường không hợp lệ.');
  if(!record(club)||!Array.isArray(ownedCards)||ownedCards.length>10000||!Array.isArray(ledger)||ledger.length>10000||!Array.isArray(transferOffers)||transferOffers.length>100) throw new Error('Cấu trúc save không hợp lệ.');
  if(!text(club.id)||!text(club.name,100)||!text(club.logoKey)||!text(club.homeRegion)||!text(club.recoveryCode,100)||!integer(club.createdAt)||!integer(club.reputation)||!integer(club.careerYear,2020,9999)||!integer(club.currentChapterId,1,12)||!integer(club.scoutPityMisses,0,7)) throw new Error('Thông tin CLB không hợp lệ.');
  if(club.sponsorshipDay!==undefined && (typeof club.sponsorshipDay!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(club.sponsorshipDay)))throw new Error('Ngày tài trợ không hợp lệ.');
  if(!record(club.wallet)||!['credits','trainingMaterials','scoutTickets'].every(k=>integer((club.wallet as Record<string,unknown>)[k]))) throw new Error('Ví không hợp lệ.');
  if(!Array.isArray(club.completedChapterIds)||!club.completedChapterIds.every(v=>integer(v,1,12))||new Set(club.completedChapterIds).size!==club.completedChapterIds.length) throw new Error('Tiến trình không hợp lệ.');
  if(!record(club.facilities)||!['TRAINING_CENTER','SCOUT_OFFICE','STRATEGY_LAB'].every(k=>integer((club.facilities as Record<string,unknown>)[k],0,3))) throw new Error('Cơ sở vật chất không hợp lệ.');
  const ids=new Set<string>();
  for(const card of ownedCards) {
    if(!record(card)||!text(card.instanceId)||ids.has(card.instanceId)||!text(card.editionId)||!text(card.playerId)||getEditionById(card.editionId)?.playerId!==card.playerId||!integer(card.level,1,10)||!integer(card.acquiredAt)||!text(card.acquiredFrom)||!record(card.trainedStats)||!Object.entries(card.trainedStats).every(([k,v])=>stats.includes(k)&&integer(v,0,18))) throw new Error('Thẻ trong save không hợp lệ.');
    ids.add(card.instanceId);
  }
  if(!record(club.lineup)||!roles.every(r=>club.lineup && (club.lineup as Record<string,unknown>)[r]===null || record(club.lineup)&&typeof club.lineup[r]==='string'&&ids.has(club.lineup[r] as string))) throw new Error('Đội hình chứa thẻ không tồn tại.');
  if(value.pendingReveal && (!record(value.pendingReveal)||!text(value.pendingReveal.instanceId)||!ids.has(value.pendingReveal.instanceId)||typeof value.pendingReveal.wasPityTriggered!=='boolean'))throw new Error('Reveal không hợp lệ.');
  if(value.activeMatch){
    const match=value.activeMatch;
    if(!record(match)||!integer(match.chapterId,1,12)||!integer(match.seed)||!integer(match.activeGameIndex,0,4)||!integer(match.currentPhaseIndex,0,2)||!['PREVIEW','PLAYING','GAME_RECAP','RESOLVED'].includes(String(match.matchState))||!['EARLY','MID','LATE'].includes(String(match.focusPhase))||typeof match.manualAll!=='boolean')throw new Error('Tiến trình trận không hợp lệ.');
    if(!['GANK_TOP','PLAY_MID','SAFE_FARM'].includes(String(match.selectedEarly))||!['CONTEST_OBJECTIVE','SPLIT_PUSH','TRADE_MAP'].includes(String(match.selectedMid))||!['FORCE_TEAMFIGHT','PROTECT_CARRY','PICK_OFF'].includes(String(match.selectedLate)))throw new Error('Tactic lưu không hợp lệ.');
    for(const team of [match.playerSnapshot,match.opponentSnapshot])if(!validTeam(team))throw new Error('Snapshot trận không hợp lệ.');
    if(match.simulationResult!==null && !validResult(match.simulationResult))throw new Error('Kết quả lưu không hợp lệ.');
    if(match.matchState!=='PREVIEW'&&match.simulationResult===null)throw new Error('Thiếu kết quả trận đang diễn ra.');
    if(record(match.simulationResult)&&Array.isArray(match.simulationResult.games)&&(match.activeGameIndex>=match.simulationResult.games.length||match.simulationResult.seed!==match.seed))throw new Error('Vị trí replay không hợp lệ.');
  }
  if(!Array.isArray(club.packs)||club.packs.length>10000||!club.packs.every(p=>record(p)&&text(p.id)&&families.includes(String(p.family))&&text(p.obtainedReason)&&integer(p.obtainedAt))) throw new Error('Kho pack không hợp lệ.');
  for(const entry of ledger) if(!record(entry)||!text(entry.id)||!text(entry.reason)||!['MILESTONE','PACK_BUY','TRAINING','TRANSFER','FACILITY','SPONSOR'].includes(String(entry.sourceType))||!integer(entry.timestamp)||!['deltaCredits','deltaMaterials','deltaTickets'].every(k=>integer(entry[k],-1e12))) throw new Error('Ledger không hợp lệ.');
  for(const offer of transferOffers) if(!record(offer)||!text(offer.id)||!text(offer.editionId)||!getEditionById(offer.editionId)||!integer(offer.priceCredits)||!integer(offer.expiresInSeconds)||!text(offer.sourceClub)) throw new Error('Thị trường không hợp lệ.');
  if(value.ledgerArchive!==undefined && (!record(value.ledgerArchive)||!['credits','materials','tickets','count'].every(key=>integer((value.ledgerArchive as Record<string,unknown>)[key],key==='count'?0:-Number.MAX_SAFE_INTEGER))))throw new Error('Ledger archive không hợp lệ.');
  return structuredClone(value) as unknown as GameSave;
}
