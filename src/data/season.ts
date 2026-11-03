import {Chapter,ClubState} from '../types';
import {CAMPAIGN_CHAPTERS} from './campaignData';
import {campaignOpponentSeed,legacyOpponent} from './legacyOpponents';

/** Season 1 is careerYear 2026; every later year is a new season. */
export const FIRST_CAREER_YEAR=2026;
export const seasonOf=(careerYear:number)=>Math.max(1,careerYear-FIRST_CAREER_YEAR+1);

/** After a Worlds title the club starts again at chapter 3 (the pro run); campus chapters stay done. */
export const NEW_SEASON_START_CHAPTER=3;
export const NEW_SEASON_COMPLETED=[1,2];
export const NEW_SEASON_STIPEND=1000;

/** The same chapter with an opponent retuned for the season. Rewards and formats do not change. */
export function opponentForSeason(chapter:Chapter,season:number):Chapter['opponent'] {
 if(season<=1||chapter.id<NEW_SEASON_START_CHAPTER)return chapter.opponent;
 // Historical rosters need far smaller bonuses than the fictional early-career rivals would.
 return legacyOpponent(chapter.id,campaignOpponentSeed(chapter.id,season),season);
}

const cache=new Map<number,Chapter[]>();
export function chaptersForSeason(season:number):Chapter[] {
 if(season<=1)return CAMPAIGN_CHAPTERS;
 let chapters=cache.get(season);
 if(!chapters){chapters=CAMPAIGN_CHAPTERS.map(chapter=>({...chapter,opponent:opponentForSeason(chapter,season)}));cache.set(season,chapters);}
 return chapters;
}

export interface Competition{id:string;name:string;blurb:string;stages:{chapterId:number;label:string}[]}
/** The season grouped into brackets. Each stage is one chapter (one series). */
export const COMPETITIONS:Competition[]=[
 {id:'campus',name:'Giải Sinh Viên',blurb:'Campus District: từ giao hữu tới chung kết trường.',stages:[{chapterId:1,label:'Giao hữu khởi động'},{chapterId:2,label:'Chung kết Campus'}]},
 {id:'road',name:'Road to VCS',blurb:'Vòng loại để bước vào giải chuyên nghiệp.',stages:[{chapterId:3,label:'Vòng loại chuyên nghiệp'}]},
 {id:'vcs',name:'VCS',blurb:'Giải chuyên nghiệp Việt Nam.',stages:[{chapterId:4,label:'Vòng bảng'},{chapterId:5,label:'Chung kết VCS'}]},
 {id:'lcp',name:'LCP',blurb:'Đấu trường APAC theo từng split.',stages:[{chapterId:6,label:'Vòng bảng LCP'},{chapterId:9,label:'Chung kết LCP'}]},
 {id:'firststand',name:'First Stand',blurb:'Sự kiện quốc tế đầu mùa.',stages:[{chapterId:7,label:'Vòng loại trực tiếp'}]},
 {id:'msi',name:'MSI',blurb:'Sự kiện quốc tế giữa mùa.',stages:[{chapterId:8,label:'Vòng loại trực tiếp'}]},
 {id:'worlds',name:'Chung Kết Thế Giới (Worlds)',blurb:'Đỉnh cao mùa giải: vòng bảng, bán kết và chung kết.',stages:[{chapterId:10,label:'Vòng bảng (Swiss)'},{chapterId:11,label:'Bán kết'},{chapterId:12,label:'Chung kết'}]},
];

/** The bracket and stage a chapter belongs to (for headings). */
export function stageOf(chapterId:number):{competition:Competition;label:string;index:number}|undefined {
 for(const competition of COMPETITIONS){
  const index=competition.stages.findIndex(stage=>stage.chapterId===chapterId);
  if(index>=0)return {competition,label:competition.stages[index].label,index};
 }
 return undefined;
}

/** The club one year later, or null while the Worlds title (chapter 12) has not been won. Pure: does not touch the input. */
export function nextSeasonClub(club:ClubState):ClubState|null {
 if(!club.completedChapterIds.includes(12))return null;
 return {...club,careerYear:club.careerYear+1,currentChapterId:NEW_SEASON_START_CHAPTER,completedChapterIds:[...NEW_SEASON_COMPLETED],
  wallet:{...club.wallet,credits:club.wallet.credits+NEW_SEASON_STIPEND}};
}
