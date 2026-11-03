import {sampleTeam,defaultTactics} from '../src/lib/__tests__/fixtures';
import {recommendTactics,simulateSeries} from '../src/lib/simulator';
import {PHASE_TACTICS} from '../src/lib/tacticsMatrix';
import {SeededRng} from '../src/lib/seededRng';
import {OpponentArchetype,TeamSnapshot} from '../src/types';
function uniform(power:number):TeamSnapshot{
 const t=sampleTeam();t.synergyBonus=0;t.teamOvr=power;t.ratings={lane:power,macro:power,teamfight:power};
 t.roster.forEach(p=>{p.ovr=power;p.effectiveStats={mechanics:power,macro:power,teamwork:power,mental:power,championPool:power};});return t;
}
const player=uniform(65),opponent=uniform(65),strong=uniform(75),archetypes:OpponentArchetype[]=['EARLY_AGGRO','OBJECTIVE_CONTROL','LATE_SCALING','SPLIT_PRESSURE','BALANCED'];
let stronger=0,optimal=0,random=0,fixed=0;const times:number[]=[];
for(let seed=0;seed<10000;seed++){
 const policy={archetype:archetypes[seed%5]},rng=new SeededRng(seed);
 const randomTactics={early:rng.choice(PHASE_TACTICS.EARLY),mid:rng.choice(PHASE_TACTICS.MID),late:rng.choice(PHASE_TACTICS.LATE)};
 if(simulateSeries('bench',seed,'BO1',strong,opponent,[defaultTactics],policy).winner==='PLAYER')stronger++;
 if(simulateSeries('bench',seed,'BO1',player,opponent,[recommendTactics(player,policy.archetype)],policy).winner==='PLAYER')optimal++;
 if(simulateSeries('bench',seed,'BO1',player,opponent,[randomTactics],policy).winner==='PLAYER')random++;
 if(simulateSeries('bench',seed,'BO1',player,opponent,[defaultTactics],policy).winner==='PLAYER')fixed++;
 if(seed<1000){const before=performance.now();simulateSeries('p95',seed,'BO5',player,opponent,[defaultTactics],policy);times.push(performance.now()-before);}
}
times.sort((a,b)=>a-b);
console.log(JSON.stringify({seeds:10000,fixture:'uniform 65, no synergy; archetype cycles; offScript default 0.2; BO1',plus10WinRate:stronger/100,adaptive:optimal/100,random:random/100,fixed:fixed/100,adaptiveMinusRandom:(optimal-random)/100,BO5p95ms:times[949],targets:{plus10:'60-75% (prototype target)',adaptiveGap:'>=5pp (prototype target)'},note:'Diagnostic, not a replacement for the DEC-5 campaign acceptance. Targets not all met; Draft submission gate stays off.'},null,2));
