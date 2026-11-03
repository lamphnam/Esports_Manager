import { CAMPAIGN_CHAPTERS } from '../src/data/campaignData';
import { chaptersForSeason, NEW_SEASON_COMPLETED, NEW_SEASON_START_CHAPTER, NEW_SEASON_STIPEND } from '../src/data/season';
import { computeCardOvr, getEditionById, getPlayerById } from '../src/data/cardCatalog';
import { openPackInstance, PACK_DEFINITIONS } from '../src/lib/economyEngine';
import { SeededRng } from '../src/lib/seededRng';
import { calculateTeamRatings, simulateSeries } from '../src/lib/simulator';
import { chapterOpponent, defaultTactics } from '../src/lib/__tests__/fixtures';
import { OpponentArchetype, PackFamily, PlayerCardEdition, Role, TeamSnapshot } from '../src/types';

/*
 * Simulates how strong a player's lineup is when entering each chapter and how often it wins, using the real
 * reward schedule, the real pack tables/pity/pool, and the real simulator. Two spending policies:
 *   rewards: only opens the packs the campaign hands out (no credit spending, no training)
 *   engaged: also spends credits on the best pack it can afford (Champion, then Elite); still no training
 * Training, market purchases and good tactic choices are NOT modelled, so skilled players land above these rates.
 */
const PLAYERS = Number(process.env.PLAYERS || 200);
const SERIES = Number(process.env.SERIES || 40);
const SEASONS = Number(process.env.SEASONS || 3);
// The opponent archetype only matters through tactic choice (a skill), so it is rotated to keep the measure neutral.
const ARCHETYPES: OpponentArchetype[] = ['EARLY_AGGRO', 'OBJECTIVE_CONTROL', 'LATE_SCALING', 'SPLIT_PRESSURE', 'BALANCED'];
const ROLES: Role[] = ['TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'];
const STARTERS = ['ed_raven_acad', 'ed_vex_acad', 'ed_kairo_acad', 'ed_nova_acad', 'ed_mint_acad'];
const roleOf = (edition: PlayerCardEdition) => edition.role || getPlayerById(edition.playerId)!.primaryRole;

function bestLineup(cards: PlayerCardEdition[]): TeamSnapshot {
  const roster: TeamSnapshot['roster'] = ROLES.map((role) => {
    const best = cards.filter((card) => roleOf(card) === role).sort((a, b) => computeCardOvr(b.baseStats) - computeCardOvr(a.baseStats))[0];
    const player = getPlayerById(best.playerId)!;
    return { role, displayName: player.displayName, ovr: computeCardOvr(best.baseStats), effectiveStats: { ...best.baseStats }, archetype: player.playstyle };
  });
  return {
    teamName: 'Sim', logoKey: 'gold_star', roster,
    teamOvr: Math.round(roster.reduce((sum, p) => sum + p.ovr, 0) / 5),
    synergyBonus: Math.min(8, new Set(roster.map((p) => p.archetype)).size),
    ratings: calculateTeamRatings(roster),
  };
}

interface Row { season: number; chapterId: number; ovr: number; rate: number }
function playOne(playerSeed: number, engaged: boolean): Row[] {
  const rng = new SeededRng(playerSeed * 7919 + 13);
  const cards = STARTERS.map((id) => getEditionById(id)!);
  let credits = 500;
  let pity = 0;
  const open = (family: PackFamily) => {
    const draw = openPackInstance(family, pity, rng.nextInt(1, 2 ** 30));
    if (family === 'SCOUT') pity = draw.newPityMisses;
    cards.push(draw.edition);
  };
  const rows: Row[] = [];
  for (let season = 1; season <= SEASONS; season++) {
    if (season > 1) credits += NEW_SEASON_STIPEND;
    for (const chapter of chaptersForSeason(season)) {
      if (season > 1 && chapter.id < NEW_SEASON_START_CHAPTER) continue;
      const team = bestLineup(cards);
      let wins = 0;
      for (let i = 0; i < SERIES; i++) {
        if (simulateSeries('prog', playerSeed * 1000 + i, chapter.format, team, chapterOpponent(chapter), [defaultTactics], { archetype: ARCHETYPES[i % ARCHETYPES.length] }).winner === 'PLAYER') wins++;
      }
      rows.push({ season, chapterId: chapter.id, ovr: team.teamOvr, rate: (100 * wins) / SERIES });
      credits += chapter.milestoneRewards.credits;
      for (const family of chapter.milestoneRewards.packs ?? []) open(family);
      if (engaged) {
        for (const family of ['CHAMPION', 'ELITE'] as PackFamily[]) {
          while (credits >= PACK_DEFINITIONS[family].priceCredits) { credits -= PACK_DEFINITIONS[family].priceCredits; open(family); }
        }
      }
    }
  }
  return rows;
}

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
const pct = (values: number[], p: number) => [...values].sort((a, b) => a - b)[Math.floor(p * (values.length - 1))];

// Acceptance for the engaged player. Season 1 chapters 6-12 and every later-season pro chapter should stay close to a coin flip.
const BANDS: Record<number, [number, number]> = { 6: [45, 62], 7: [45, 62], 8: [45, 62], 9: [45, 62], 10: [42, 60], 11: [40, 58], 12: [38, 55] };
const bandFor = (season: number, chapterId: number): [number, number] | undefined => (season === 1 ? BANDS[chapterId] : chapterId >= 3 ? [42, 65] : undefined);
console.log(`${PLAYERS} simulated players x ${SERIES} series per chapter, ${SEASONS} seasons (default tactics, no training, no market)`);
for (const [name, engaged] of [['rewards (casual)', false], ['engaged (buys Champion/Elite packs)', true]] as const) {
  const table: Row[][] = [];
  for (let player = 1; player <= PLAYERS; player++) table.push(playOne(player, engaged));
  console.log(`
Policy: ${name}`);
  console.log('Season.Ch | format | opponent OVR (bonus) | team OVR p25/median/p75 | mean win rate');
  for (let i = 0; i < table[0].length; i++) {
    const { season, chapterId } = table[0][i];
    const chapter = chaptersForSeason(season).find((c) => c.id === chapterId)!;
    const ovrs = table.map((rows) => rows[i].ovr);
    const rate = mean(table.map((rows) => rows[i].rate));
    const opp = chapterOpponent(chapter);
    const band = bandFor(season, chapterId);
    const status = engaged && band ? (rate >= band[0] && rate <= band[1] ? ' PASS' : ' FAIL') : '';
    if (status === ' FAIL') process.exitCode = 1;
    if (season === 1 || chapterId >= 3) console.log(`${season}.${chapterId} | ${chapter.format} | ${opp.teamOvr} (${opp.difficultyBonus ?? 0}) ${opp.teamName} | ${pct(ovrs, 0.25)}/${median(ovrs)}/${pct(ovrs, 0.75)} | ${rate.toFixed(1)}%${band && engaged ? ` target ${band[0]}-${band[1]}%` : ''}${status}`);
  }
}
