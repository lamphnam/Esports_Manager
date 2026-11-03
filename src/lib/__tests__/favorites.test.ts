import { describe, expect, it } from 'vitest';
import { getPlayerById } from '../../data/cardCatalog';
import { favoriteWeight, FAVORITE_PLAYER_WEIGHT, FAVORITE_TEAM_WEIGHT, isFavoriteEdition } from '../../data/favorites';
import { openPackInstance, PACK_POOL, PACK_WEIGHT } from '../economyEngine';

const nameOf = (id: string) => getPlayerById(PACK_POOL.find((e) => e.id === id)!.playerId)!.displayName;

describe('favourites (Chovy, Gen.G)', () => {
  it('weights Chovy above Gen.G above everyone else, case-insensitively', () => {
    expect(favoriteWeight({ teamId: 'geng' }, 'Chovy')).toBe(FAVORITE_PLAYER_WEIGHT); // player wins over team
    expect(favoriteWeight({ teamId: 'griffin' }, 'CHOVY')).toBe(FAVORITE_PLAYER_WEIGHT);
    expect(favoriteWeight({ teamId: 'geng' }, 'Ruler')).toBe(FAVORITE_TEAM_WEIGHT);
    expect(favoriteWeight({ teamId: 't1' }, 'Faker')).toBe(1);
    expect(favoriteWeight({}, undefined)).toBe(1);
    expect(isFavoriteEdition({ teamId: 'geng' }, 'Anyone')).toBe(true);
  });

  it('the pack pool contains the favourites and their weights are applied', () => {
    const chovy = PACK_POOL.filter((e) => nameOf(e.id) === 'Chovy');
    expect(chovy.length).toBeGreaterThanOrEqual(4);
    for (const edition of chovy) expect(PACK_WEIGHT.get(edition.id)).toBe(FAVORITE_PLAYER_WEIGHT);
    expect(PACK_POOL.filter((e) => e.teamId === 'geng').length).toBeGreaterThanOrEqual(20);
  });

  it('within a rarity favourites appear as often as their weights predict; rarity odds do not move', () => {
    const draws = 40000;
    const legendary = PACK_POOL.filter((e) => e.rarity === 'LEGENDARY');
    const total = legendary.reduce((sum, e) => sum + (PACK_WEIGHT.get(e.id) ?? 1), 0);
    const chovyWeight = legendary.filter((e) => nameOf(e.id) === 'Chovy').reduce((sum, e) => sum + (PACK_WEIGHT.get(e.id) ?? 1), 0);
    const expectedShare = chovyWeight / total;
    let legendaryDraws = 0, chovyDraws = 0;
    const rarity: Record<string, number> = { EPIC: 0, LEGENDARY: 0 };
    for (let seed = 0; seed < draws; seed++) {
      const { edition } = openPackInstance('CHAMPION', 0, seed);
      rarity[edition.rarity]++;
      if (edition.rarity === 'LEGENDARY') { legendaryDraws++; if (nameOf(edition.id) === 'Chovy') chovyDraws++; }
    }
    expect(chovyDraws / legendaryDraws).toBeGreaterThan(expectedShare * 0.85);
    expect(chovyDraws / legendaryDraws).toBeLessThan(expectedShare * 1.15);
    expect(chovyDraws / legendaryDraws).toBeGreaterThan(2 * (4 / legendary.length)); // clearly above the uniform share
    expect(rarity.LEGENDARY / draws).toBeGreaterThan(0.13); // table: 15%
    expect(rarity.LEGENDARY / draws).toBeLessThan(0.17);
  });
});
