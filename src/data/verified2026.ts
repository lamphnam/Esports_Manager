import {PlayerCardEdition,PlayerIdentity,Role} from '../types';
import {deriveRating,legacyStats,mapLegacyRating,playerSlug} from '../lib/legacyRatings';
import {CURRENT_PLAYERS} from './currentCatalog';

// Membership: Riot's live team page. Roles: Sheep Esports roster, read 03/11/2026.
// No GAM roster, Worlds slots or unverified championship results are inferred.
export const VERIFIED_2026_ROSTER:{name:string;role:Role;team:string;year:number;source:string[];confidence:'medium';retrievedAt:string}[]=[
 ['Pun','TOP'],['Hizto','JUNGLE'],['Dire','MID'],['Eddie','BOT'],['Bie','SUPPORT'],
].map(([name,role])=>({name,role:role as Role,team:'Team Secret Whales',year:2026,source:['https://lolesports.com/en-US/teams/team-secret-whales','https://www.sheepesports.com/en/lol/teams/Team%20Secret%20Whales'],confidence:'medium',retrievedAt:'2026-11-03'}));

export const VERIFIED_2026_PLAYERS:PlayerIdentity[]=VERIFIED_2026_ROSTER.map(row=>{
 const known=CURRENT_PLAYERS.find(p=>playerSlug(p.displayName)===playerSlug(row.name));
 return known||{id:`verified_${playerSlug(row.name)}`,displayName:row.name,primaryRole:row.role,region:'Vietnam',biography:'Chỉ số của phiên bản 2026 là giá trị mô phỏng, không phải đánh giá thành tích thật.',playstyle:'Flexible',weakness:'Phụ thuộc đội hình và chiến thuật trong mô phỏng.',avatarSeed:playerSlug(row.name)};
});
export const VERIFIED_2026_EDITIONS:PlayerCardEdition[]=VERIFIED_2026_ROSTER.map((row,index)=>{
 const player=VERIFIED_2026_PLAYERS[index],rating=deriveRating(player.id,row.team,row.year,row.role),baseOvr=mapLegacyRating(rating);
 return {id:`champion_2026_${playerSlug(row.name)}`,playerId:player.id,role:row.role,editionYear:2026,editionCode:'CHAMPION',rarity:baseOvr<70?'COMMON':baseOvr<80?'RARE':baseOvr<90?'EPIC':'LEGENDARY',baseOvr,baseStats:legacyStats(player.id,2026,row.role,baseOvr),traits:['Chỉ số suy ra cho mô phỏng'],provenance:{ratingSource:'derived',rawRating:rating,ratingNote:'Seeded tier weights 13/56/25/6; raw rating mapped through the same LEGACY anchors. No real performance claim.',datasetVersion:'verified-lcp-2026-11-03',importedAt:'2026-11-03T00:00:00.000Z',source:row.source.join(' | '),confidence:row.confidence}};
});
