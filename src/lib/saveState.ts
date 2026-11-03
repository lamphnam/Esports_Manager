import { getEditionById } from '../data/cardCatalog';
import { ClubState, CurrencyLedgerEntry, OwnedCard, TransferOffer } from '../types';

export interface GameSave {
  version: 1;
  club: ClubState | null;
  ownedCards: OwnedCard[];
  ledger: CurrencyLedgerEntry[];
  transferOffers: TransferOffer[];
}
export const SAVE_KEY = 'apac_rising_save_v3';
export const emptySave = (): GameSave => ({version:1,club:null,ownedCards:[],ledger:[],transferOffers:[]});
export function saveReducer(state: GameSave, patch: Partial<GameSave>): GameSave {
  return {...state,...patch,version:1};
}

const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=(x:unknown,max=300):x is string=>typeof x==='string'&&x.length<=max;
const integer=(x:unknown,min=0,max=Number.MAX_SAFE_INTEGER):x is number=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=min&&x<=max;
const roles=['TOP','JUNGLE','MID','BOT','SUPPORT'];
const families=['WELCOME','SCOUT','ELITE','CHAMPION'];
const stats=['mechanics','macro','teamwork','mental','championPool'];

// Recovery is user-controlled input. Reject broken references and unbounded arrays before replacing a save.
export function validateSave(value: unknown): GameSave {
  if(!record(value)||value.version!==1) throw new Error('Phiên bản save không được hỗ trợ.');
  const {club,ownedCards,ledger,transferOffers}=value;
  if(!record(club)||!Array.isArray(ownedCards)||ownedCards.length>10000||!Array.isArray(ledger)||ledger.length>10000||!Array.isArray(transferOffers)||transferOffers.length>100) throw new Error('Cấu trúc save không hợp lệ.');
  if(!text(club.id)||!text(club.name,100)||!text(club.logoKey)||!text(club.homeRegion)||!text(club.recoveryCode,100)||!integer(club.createdAt)||!integer(club.reputation)||!integer(club.careerYear,2020,9999)||!integer(club.currentChapterId,1,12)||!integer(club.scoutPityMisses,0,7)) throw new Error('Thông tin CLB không hợp lệ.');
  if(!record(club.wallet)||!['credits','trainingMaterials','scoutTickets'].every(k=>integer((club.wallet as Record<string,unknown>)[k]))) throw new Error('Ví không hợp lệ.');
  if(!Array.isArray(club.completedChapterIds)||!club.completedChapterIds.every(v=>integer(v,1,12))||new Set(club.completedChapterIds).size!==club.completedChapterIds.length) throw new Error('Tiến trình không hợp lệ.');
  if(!record(club.facilities)||!['TRAINING_CENTER','SCOUT_OFFICE','STRATEGY_LAB'].every(k=>integer((club.facilities as Record<string,unknown>)[k],0,3))) throw new Error('Cơ sở vật chất không hợp lệ.');
  const ids=new Set<string>();
  for(const card of ownedCards) {
    if(!record(card)||!text(card.instanceId)||ids.has(card.instanceId)||!text(card.editionId)||!text(card.playerId)||getEditionById(card.editionId)?.playerId!==card.playerId||!integer(card.level,1,10)||!integer(card.acquiredAt)||!text(card.acquiredFrom)||!record(card.trainedStats)||!Object.entries(card.trainedStats).every(([k,v])=>stats.includes(k)&&integer(v,0,18))) throw new Error('Thẻ trong save không hợp lệ.');
    ids.add(card.instanceId);
  }
  if(!record(club.lineup)||!roles.every(r=>club.lineup && (club.lineup as Record<string,unknown>)[r]===null || record(club.lineup)&&typeof club.lineup[r]==='string'&&ids.has(club.lineup[r] as string))) throw new Error('Đội hình chứa thẻ không tồn tại.');
  if(!Array.isArray(club.packs)||club.packs.length>10000||!club.packs.every(p=>record(p)&&text(p.id)&&families.includes(String(p.family))&&text(p.obtainedReason)&&integer(p.obtainedAt))) throw new Error('Kho pack không hợp lệ.');
  for(const entry of ledger) if(!record(entry)||!text(entry.id)||!text(entry.reason)||!['MILESTONE','PACK_BUY','TRAINING','TRANSFER','FACILITY','SPONSOR'].includes(String(entry.sourceType))||!integer(entry.timestamp)||!['deltaCredits','deltaMaterials','deltaTickets'].every(k=>integer(entry[k],-1e12))) throw new Error('Ledger không hợp lệ.');
  for(const offer of transferOffers) if(!record(offer)||!text(offer.id)||!text(offer.editionId)||!getEditionById(offer.editionId)||!integer(offer.priceCredits)||!integer(offer.expiresInSeconds)||!text(offer.sourceClub)) throw new Error('Thị trường không hợp lệ.');
  return structuredClone(value) as unknown as GameSave;
}
