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
