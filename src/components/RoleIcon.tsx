import {Role} from '../types';
export function RoleIcon({role}:{role:Role}){
 const paths:Record<Role,string>={TOP:'M3 17 8 6l4 7 4-7 5 11H3Z',JUNGLE:'m4 18 4-12 4 12M8 12h4m1 6 4-12 4 12',MID:'m12 3 8 9-8 9-8-9 8-9Zm0 5v8',BOT:'M4 12h16m-6-6 6 6-6 6M4 6v12',SUPPORT:'m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6l8-3Zm0 5v8m-4-4h8'};
 return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[role]}/></svg>;
}
