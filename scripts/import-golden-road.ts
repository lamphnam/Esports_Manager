import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {CURRENT_PLAYERS} from '../src/data/currentCatalog';
import {ratingOverrides} from '../src/data/ratingOverrides';
import {legacyStats,mapLegacyRating,playerSlug} from '../src/lib/legacyRatings';
import {PlayerIdentity,PlayerCardEdition,Role} from '../src/types';

type RawTeam={id:string;name:string;region:string;rosters:Record<string,Record<string,[string,number][]>>};
const sourcePath='docs/ref/golden_road/data.js';
const source=readFileSync(sourcePath,'utf8');
// Build-time only, as authorized in the work order. Never import reference code in the app.
const raw=new Function(`${source}\nreturn GAME_TEAMS;`)() as RawTeam[];
const checksum=createHash('sha256').update(source).digest('hex');
const datasetVersion=`golden-road-${checksum.slice(0,12)}`;
const importedAt='2026-11-03T00:00:00.000Z';
const roleMap:Record<string,Role>={TOP:'TOP',JNG:'JUNGLE',MID:'MID',ADC:'BOT',SUP:'SUPPORT'};
const bySlug=new Map(CURRENT_PLAYERS.map(p=>[playerSlug(p.displayName),p]));
const identities=new Map<string,PlayerIdentity>();
const history=new Map<string,{year:number;role:Role}[]>();
const editions:PlayerCardEdition[]=[];
const teams:{id:string;name:string;teamAlias:string;region:string;rosters:Record<string,Record<Role,string[]>>}[]=[];
for(const [index,team] of raw.entries()){
  const output={id:team.id,name:team.name,teamAlias:`Historic Club ${index+1}`,region:team.region,rosters:{} as Record<string,Record<Role,string[]>>};
  for(const [year,roster] of Object.entries(team.rosters)){
    const slots={} as Record<Role,string[]>;
    for(const [rawRole,candidates] of Object.entries(roster)){
      const role=roleMap[rawRole];if(!role)throw new Error(`Unknown role: ${rawRole}`);
      slots[role]=[];
      for(const [name,rawRating] of candidates){
        if(!Number.isFinite(rawRating)||rawRating<76||rawRating>98)throw new Error('Rating outside source range');
        const slug=playerSlug(name), existing=bySlug.get(slug),playerId=existing?.id||`legacy_${slug}`;
        if(!identities.has(playerId))identities.set(playerId,existing||{id:playerId,displayName:name,primaryRole:role,region:team.region,biography:'Hồ sơ mô phỏng từ dữ liệu lịch sử; chỉ số dùng để cân bằng trò chơi.',playstyle:role==='SUPPORT'?'Shotcaller':role==='BOT'?'Late Carry':role==='JUNGLE'?'Playmaker':'Flexible',weakness:'Hiệu quả phụ thuộc đội hình và chiến thuật.',avatarSeed:slug});
        history.set(playerId,[...(history.get(playerId)||[]),{year:Number(year),role}]);
        const key=`${team.id}|${year}|${role}|${slug}`,override=ratingOverrides[key];
        const rating=override?.rating??rawRating,baseOvr=mapLegacyRating(rating);
        const id=`legacy_${team.id}_${year}_${role.toLowerCase()}_${slug}`;
        editions.push({id,playerId,role,teamId:team.id,editionYear:Number(year),editionCode:'LEGACY',rarity:baseOvr<70?'COMMON':baseOvr<80?'RARE':baseOvr<90?'EPIC':'LEGENDARY',baseOvr,baseStats:legacyStats(playerId,Number(year),role,baseOvr),traits:['Hồ sơ lịch sử','Chỉ số mô phỏng'],provenance:{ratingSource:'adjusted',rawRating,ratingNote:override?`${override.note}; remapped for game balance`:'Licensed Golden Road rating remapped monotonically to APAC OVR; not an objective ranking.',datasetVersion,importedAt,source:'https://goldenroadlol.com/',confidence:'medium'}});
        slots[role].push(id);
      }
    }
    if(Object.keys(slots).length!==5)throw new Error('Incomplete roster');
    output.rosters[year]=slots;
  }
  teams.push(output);
}
for(const [id,player] of identities){
  if(bySlug.has(playerSlug(player.displayName)))continue;
  const entries=history.get(id)!.sort((a,b)=>b.year-a.year),primary=entries[0].role,secondary=entries.find(e=>e.role!==primary)?.role;
  player.primaryRole=primary;if(secondary)player.secondaryRole=secondary;
}
mkdirSync('src/data/generated',{recursive:true});
for(const [filename,value] of Object.entries({legacyEditions:editions,legacyPlayers:[...identities.values()],legacyTeams:teams}))writeFileSync(`src/data/generated/${filename}.json`,JSON.stringify(value,null,2)+'\n');
const distribution=Object.fromEntries(['COMMON','RARE','EPIC','LEGENDARY'].map(r=>[r,editions.filter(e=>e.rarity===r).length]));
const manifest={datasetVersion,importedAt,sourcePath,sourceSha256:checksum,teams:teams.length,teamYears:teams.reduce((n,t)=>n+Object.keys(t.rosters).length,0),editions:editions.length,identities:identities.size,distribution,outputSha256:createHash('sha256').update(JSON.stringify(editions,null,2)+'\n').digest('hex')};
writeFileSync('src/data/generated/legacyManifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
