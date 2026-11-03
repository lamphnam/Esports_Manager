import type {GameSave} from './saveState';

// Backup bookkeeping lives under its own key so an exported Recovery Code never embeds a stale counter.
export const BACKUP_META_KEY='apac_backup_meta';
export const DIRTY_THRESHOLD=4;
export const NUDGE_INTERVAL_MS=10*60*1000;

export interface BackupMeta{lastBackupAt:number|null;scoreAtBackup:number;lastNudgeAt:number|null}
export const emptyBackupMeta=():BackupMeta=>({lastBackupAt:null,scoreAtBackup:0,lastNudgeAt:null});

// Monotone measure of progress worth protecting: chapters, cards, card levels, facility tiers.
export function progressScore(save:Pick<GameSave,'club'|'ownedCards'>):number{
  const {club,ownedCards}=save;
  if(!club)return 0;
  const levels=ownedCards.reduce((sum,card)=>sum+Math.max(0,card.level-1),0);
  const tiers=Object.values(club.facilities).reduce((sum,tier)=>sum+tier,0);
  return club.completedChapterIds.length*5+ownedCards.length*2+levels+tiers*3;
}

export const unsavedChanges=(meta:BackupMeta,score:number)=>Math.max(0,score-meta.scoreAtBackup);
export const isDirty=(meta:BackupMeta,score:number)=>unsavedChanges(meta,score)>=DIRTY_THRESHOLD;

// Nudge only when progress just increased, enough is unsaved, and the last nudge is old enough.
export function shouldNudge(meta:BackupMeta,previousScore:number,score:number,now:number):boolean{
  return score>previousScore&&isDirty(meta,score)&&(meta.lastNudgeAt===null||now-meta.lastNudgeAt>=NUDGE_INTERVAL_MS);
}
export const withBackup=(meta:BackupMeta,score:number,now:number):BackupMeta=>({...meta,lastBackupAt:now,scoreAtBackup:score});
export const withNudge=(meta:BackupMeta,now:number):BackupMeta=>({...meta,lastNudgeAt:now});

const count=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
const stamp=(value:unknown)=>value===null||count(value);
function defaultStorage():Pick<Storage,'getItem'|'setItem'>|undefined{
  try{return globalThis.localStorage;}catch{return undefined;}
}

export function readBackupMeta(storage=defaultStorage()):BackupMeta{
  try{
    const raw=storage?.getItem(BACKUP_META_KEY);
    if(!raw)return emptyBackupMeta();
    const value=JSON.parse(raw) as Record<string,unknown>;
    if(value&&typeof value==='object'&&stamp(value.lastBackupAt)&&count(value.scoreAtBackup)&&stamp(value.lastNudgeAt))
      return {lastBackupAt:value.lastBackupAt as number|null,scoreAtBackup:value.scoreAtBackup as number,lastNudgeAt:value.lastNudgeAt as number|null};
  }catch{}
  return emptyBackupMeta();
}

export function writeBackupMeta(meta:BackupMeta,storage=defaultStorage()):void{
  try{storage?.setItem(BACKUP_META_KEY,JSON.stringify(meta));}catch{}
}
