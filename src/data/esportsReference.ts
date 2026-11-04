import {PlayerCardEdition} from '../types';

/*
 * Real-world reference layer (snapshot 04/11/2026). Pure metadata: nothing here feeds the simulator, the economy or
 * the save, so adding to it never needs a migration. Unknown or unannounced values are `null`, never filled from memory.
 * Source of the records: UpdatePack 04/11/2026 (removed from the repo after import); `checked` says who read the page.
 */
export type ProvenanceKind='verified_real_world'|'secondary_confirmed'|'fictional_campaign'|'historical_roster'|'game_derived'|'pending';

export interface ReferenceSource{id:string;publisher:string;asOf:string;url:string;authority:'official'|'secondary';checked:'read_2026-11-04'|'from_updatepack'}
export const REFERENCE_SOURCES:ReferenceSource[]=[
 {id:'RIOT_WORLDS_2026',publisher:'Riot Games / LoL Esports',asOf:'2026-10-05',url:'https://lolesports.com/en-GB/news/worlds-2026-primer',authority:'official',checked:'read_2026-11-04'},
 {id:'RIOT_2026_HANDBOOK',publisher:'Riot Games / LoL Esports',asOf:'2026',url:'https://lolesports.com/en-US/season/115547545029543948/handbook',authority:'official',checked:'from_updatepack'},
 {id:'RIOT_LCP_2027',publisher:'Riot Games / LoL Esports',asOf:'2026-09-21',url:'https://lolesports.com/en-SG/lolesports/news/a-more-open-lcp-ecosystem-in-2027',authority:'official',checked:'from_updatepack'},
 {id:'RIOT_TSW_ROSTER',publisher:'Riot Games / LoL Esports',asOf:'2026-11-04',url:'https://lolesports.com/en-US/teams/team-secret-whales',authority:'official',checked:'from_updatepack'},
 {id:'SHEEP_TSW_ROLES',publisher:'Sheep Esports',asOf:'2026-11-04',url:'https://www.sheepesports.com/en/lol/teams/Team%20Secret%20Whales',authority:'secondary',checked:'from_updatepack'},
 {id:'LIQUIPEDIA_FST_FINAL',publisher:'Liquipedia',asOf:'2026-03-22',url:'https://liquipedia.net/leagueoflegends/Match%3AID_FST26KnOut_R02-M001',authority:'secondary',checked:'from_updatepack'},
 {id:'LIQUIPEDIA_MSI_FINAL',publisher:'Liquipedia',asOf:'2026-07-12',url:'https://liquipedia.net/leagueoflegends/Match%3AID_MSI26Brakt_R05-M001',authority:'secondary',checked:'from_updatepack'},
 {id:'RFT_VCS_2026',publisher:'RFT.GG',asOf:'2026-10-11',url:'https://rft.gg/event/vcs-2026-finals/matches',authority:'secondary',checked:'from_updatepack'},
 {id:'HAIPHONG_VCS_2026',publisher:'Báo Hải Phòng',asOf:'2026-10-12',url:'https://news.baohaiphong.vn/games-on-hai-phong-2026-successfully-wraps-up-555601.html',authority:'secondary',checked:'from_updatepack'},
];

export interface ReferenceFact{id:string;status:ProvenanceKind;asOf:string;summary:string;sourceIds:string[];/** null = not published / not known yet */value:Record<string,string|number|boolean|null>}
export const REFERENCE_FACTS:ReferenceFact[]=[
 {id:'lcp-2026-champion',status:'verified_real_world',asOf:'2026-09-21',summary:'Team Secret Whales vô địch cả ba split LCP 2026.',sourceIds:['RIOT_LCP_2027'],value:{team:'Team Secret Whales',splits:3}},
 {id:'tsw-2026-roster',status:'secondary_confirmed',asOf:'2026-11-04',summary:'Team Secret Whales: Pun (TOP), Hizto (JUNGLE), Dire (MID), Eddie (BOT), Bie (SUPPORT). Riot xác nhận thành viên, Sheep Esports xác nhận vai trò.',sourceIds:['RIOT_TSW_ROSTER','SHEEP_TSW_ROLES'],value:{members:5}},
 {id:'vcs-2026-finals',status:'secondary_confirmed',asOf:'2026-10-11',summary:'VCS Finals 2026: Saigon MVK Academy thắng Saigon Warriors 3-0. GAM không phải nhà vô địch.',sourceIds:['RFT_VCS_2026','HAIPHONG_VCS_2026'],value:{winner:'Saigon MVK Academy',score:'3-0'}},
 {id:'first-stand-2026-final',status:'secondary_confirmed',asOf:'2026-03-22',summary:'First Stand 2026: Bilibili Gaming thắng G2 Esports 3-1.',sourceIds:['LIQUIPEDIA_FST_FINAL'],value:{winner:'Bilibili Gaming',score:'3-1'}},
 {id:'msi-2026-final',status:'secondary_confirmed',asOf:'2026-07-12',summary:'MSI 2026: Hanwha Life Esports thắng Bilibili Gaming 3-2.',sourceIds:['LIQUIPEDIA_MSI_FINAL'],value:{winner:'Hanwha Life Esports',score:'3-2'}},
 {id:'worlds-2026-format',status:'verified_real_world',asOf:'2026-10-05',summary:'Worlds 2026: Play-In BO5 loại kép 4 đội; Swiss BO1/BO3, 5 vòng, 3 thắng đi tiếp / 3 thua bị loại; Knockout BO5 (tứ kết, bán kết, chung kết).',sourceIds:['RIOT_WORLDS_2026'],value:{playIn:'BO5 double elimination',swissRoundsMax:5,swissSeries:'BO1/BO3',knockoutSeries:'BO5'}},
 {id:'worlds-2026-champion',status:'pending',asOf:'2026-11-04',summary:'Chung kết Worlds 2026 diễn ra 14/11/2026 giờ Mỹ (15/11 giờ Việt Nam); chưa có nhà vô địch.',sourceIds:['RIOT_WORLDS_2026'],value:{champion:null}},
 {id:'lcp-2027-qualification',status:'pending',asOf:'2026-09-21',summary:'Từ 2027 các đội VCS/PCS/LJL bắt đầu mỗi split ở giải nội địa, đội mạnh vào LCP; số suất và bracket chưa công bố.',sourceIds:['RIOT_LCP_2027'],value:{slotsPerLeague:null,bracket:null}},
];

export const factById=(id:string)=>REFERENCE_FACTS.find(fact=>fact.id===id);

/** Real-world Worlds 2026 stages next to what the game actually plays (Ch10-12). Not an engine config. */
export const WORLDS_REAL_VS_GAME={
 real:['Play-In (BO5)','Swiss (BO1/BO3)','Tứ kết (BO5)','Bán kết (BO5)','Chung kết (BO5)'],
 game:{10:'Tứ kết (BO5 giả lập)',11:'Bán kết (BO5 giả lập)',12:'Chung kết (BO5 giả lập)'},
} as const;

export interface EditionDisclosure{kind:ProvenanceKind;label:string;ratingLabel:string;factIds:string[];asOf?:string}
const RATING_LABEL='Chỉ số do game suy ra để cân bằng, không phải đánh giá thành tích thật.';

/**
 * What a card may truthfully say about itself. Cards without import provenance (the 30 hand-written current editions)
 * make no claim, so they return null. 2026 Team Secret Whales cards carry the verified LCP title as metadata only: no new
 * edition, id or rating is created for a title.
 */
export function editionDisclosure(edition:PlayerCardEdition):EditionDisclosure|null {
 const p=edition.provenance;
 if(!p)return null;
 if(edition.id.startsWith('champion_2026_'))return {kind:'game_derived',label:'Roster mùa 2026 (Team Secret Whales)',ratingLabel:RATING_LABEL,factIds:['tsw-2026-roster','lcp-2026-champion'],asOf:'2026-11-04'};
 return {kind:'historical_roster',label:`Roster lịch sử ${edition.editionYear}, không phải mùa 2026`,ratingLabel:RATING_LABEL,factIds:[]};
}
