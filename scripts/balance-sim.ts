import { CAMPAIGN_CHAPTERS } from '../src/data/campaignData';
import { simulateSeries } from '../src/lib/simulator';
import { chapterOpponent, defaultTactics, sampleTeam } from '../src/lib/__tests__/fixtures';

const runs=4000;
console.log(`Fixed seeds 0..${runs-1}; ${runs} series/cell; default tactics SAFE_FARM / CONTEST_OBJECTIVE / FORCE_TEAMFIGHT`);
const teams=[sampleTeam(),sampleTeam(1),sampleTeam(5)];
console.log('Chapter | Format | Starter | +1 Rare (Welcome fixture, TOP) | All Rare');
for(const chapter of CAMPAIGN_CHAPTERS) {
  const rates=teams.map(team=>{
    let wins=0;
    for(let seed=0;seed<runs;seed++) if(simulateSeries('balance',seed,chapter.format,team,chapterOpponent(chapter),[defaultTactics],{archetype:chapter.opponent.archetype}).winner==='PLAYER') wins++;
    return `${(100*wins/runs).toFixed(2)}%`;
  });
  console.log(`${chapter.id} | ${chapter.format} | ${rates.join(' | ')}`);
}
console.log('DEC-5 acceptance (default tactics, 4000 series/cell):');
const targets=[[65,72],[50,60],[45,55],[45,55],[45,55]];
const targetTeams=[sampleTeam(),sampleTeam(1),sampleTeam(2),sampleTeam(3),sampleTeam(5,1)];
for(let i=0;i<5;i++){
  const chapter=CAMPAIGN_CHAPTERS[i];let wins=0;
  for(let seed=0;seed<runs;seed++) if(simulateSeries('target',seed,chapter.format,targetTeams[i],chapterOpponent(chapter),[defaultTactics],{archetype:chapter.opponent.archetype}).winner==='PLAYER')wins++;
  const rate=100*wins/runs, [min,max]=targets[i];
  console.log(`Ch${i+1}: ${rate.toFixed(2)}% target ${min}-${max}% ${rate>=min&&rate<=max?'PASS':'FAIL'}`);
  if(rate<min||rate>max)process.exitCode=1;
}
