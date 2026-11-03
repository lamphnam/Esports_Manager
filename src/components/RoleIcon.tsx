import {Role} from '../types';

/*
 * Position icons. When the PNG files exist in src/assets/roles (top, jungle, mid, bot, support; wiki names like Top_icon.png also work) they are bundled
 * with the game and used; otherwise the hand-drawn SVG below is the fallback, so the build never depends on them.
 * Each added file needs an `asset_license` row (docs/CONTEST_AND_RIGHTS.md section 5).
 */
const FILES=import.meta.glob('../assets/roles/*.png',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
// Accepts both our names (top.png) and the wiki's own (Top_icon.png, Middle_icon.png, Bottom_icon.png).
const PATTERN:Record<Role,RegExp>={TOP:/^top/i,JUNGLE:/^jungle/i,MID:/^(mid|middle)/i,BOT:/^(bot|bottom|adc)/i,SUPPORT:/^support/i};
const fileFor=(role:Role)=>Object.entries(FILES).find(([path])=>PATTERN[role].test(path.split('/').pop()!))?.[1];
const paths:Record<Role,string>={TOP:'M3 17 8 6l4 7 4-7 5 11H3Z',JUNGLE:'m4 18 4-12 4 12M8 12h4m1 6 4-12 4 12',MID:'m12 3 8 9-8 9-8-9 8-9Zm0 5v8',BOT:'M4 12h16m-6-6 6 6-6 6M4 6v12',SUPPORT:'m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6l8-3Zm0 5v8m-4-4h8'};

export function RoleIcon({role,size=18}:{role:Role;size?:number}){
 const src=fileFor(role);
 if(src)return <img src={src} alt="" aria-hidden="true" width={size} height={size} draggable={false} className="shrink-0 object-contain"/>;
 return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[role]}/></svg>;
}
