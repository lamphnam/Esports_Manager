import { describe, expect, it } from 'vitest';
import { EDITIONS_CATALOG } from '../../data/cardCatalog';
import { CAMPAIGN_CHAPTERS } from '../../data/campaignData';
import { CURRENT_EDITIONS } from '../../data/currentCatalog';
import { editionDisclosure, factById, REFERENCE_FACTS, REFERENCE_SOURCES, WORLDS_REAL_VS_GAME } from '../../data/esportsReference';
import { COMPETITIONS } from '../../data/season';
import { VERIFIED_2026_EDITIONS } from '../../data/verified2026';

describe('esports reference layer (04/11/2026)', () => {
  it('every fact cites registered sources; ids are unique', () => {
    const sources = new Set(REFERENCE_SOURCES.map((s) => s.id));
    expect(sources.size).toBe(REFERENCE_SOURCES.length);
    expect(new Set(REFERENCE_FACTS.map((f) => f.id)).size).toBe(REFERENCE_FACTS.length);
    for (const fact of REFERENCE_FACTS) {
      expect(fact.sourceIds.length, fact.id).toBeGreaterThan(0);
      for (const id of fact.sourceIds) expect(sources.has(id), `${fact.id} -> ${id}`).toBe(true);
      expect(fact.asOf, fact.id).toMatch(/^\d{4}(-\d{2}-\d{2})?$/);
    }
    for (const source of REFERENCE_SOURCES) expect(source.url).toMatch(/^https:\/\//);
  });

  it('unannounced or future values stay null (Worlds 2026 champion, LCP 2027 slots)', () => {
    const champion = factById('worlds-2026-champion')!;
    expect(champion.status).toBe('pending');
    expect(champion.value.champion).toBeNull();
    const lcp = factById('lcp-2027-qualification')!;
    expect(lcp.status).toBe('pending');
    expect(lcp.value.slotsPerLeague).toBeNull();
    expect(lcp.value.bracket).toBeNull();
    for (const fact of REFERENCE_FACTS.filter((f) => f.status === 'pending')) expect(Object.values(fact.value).some((v) => v === null), fact.id).toBe(true);
  });

  it('secondary sources are never labelled as Riot-verified', () => {
    for (const fact of REFERENCE_FACTS) {
      const authorities = fact.sourceIds.map((id) => REFERENCE_SOURCES.find((s) => s.id === id)!.authority);
      if (fact.status === 'verified_real_world') expect(authorities.every((a) => a === 'official'), fact.id).toBe(true);
    }
    expect(factById('vcs-2026-finals')!.status).toBe('secondary_confirmed');
    expect(factById('vcs-2026-finals')!.value.winner).toBe('Saigon MVK Academy');
  });

  it('real Worlds format differs from the game shortcut: game has no Swiss/Play-In and plays BO5 from the quarterfinal', () => {
    expect(factById('worlds-2026-format')!.value.swissSeries).toBe('BO1/BO3');
    expect(WORLDS_REAL_VS_GAME.real.some((s) => /Swiss/.test(s))).toBe(true);
    const worlds = COMPETITIONS.find((c) => c.id === 'worlds')!;
    expect(worlds.stages.map((s) => s.chapterId)).toEqual(Object.keys(WORLDS_REAL_VS_GAME.game).map(Number));
    for (const id of [10, 11, 12]) {
      expect(CAMPAIGN_CHAPTERS[id - 1].format).toBe('BO5');
      expect(CAMPAIGN_CHAPTERS[id - 1].subtitle).toContain(WORLDS_REAL_VS_GAME.game[id as 10 | 11 | 12].split(' (')[0].replace('Tứ kết', 'Tứ Kết').replace('Bán kết', 'Bán Kết').replace('Chung kết', 'Chung Kết'));
    }
    expect(Object.values(WORLDS_REAL_VS_GAME.game).join(' ')).not.toMatch(/Swiss|Play-In/);
  });

  it('card disclosures: Legacy is historical, 2026 TSW is game-derived with the verified title, current cards claim nothing', () => {
    for (const edition of EDITIONS_CATALOG.filter((e) => e.provenance && !e.id.startsWith('champion_2026_'))) {
      const d = editionDisclosure(edition)!;
      expect(d.kind, edition.id).toBe('historical_roster');
      expect(d.label).toMatch(/không phải mùa 2026/);
      expect(d.ratingLabel).toMatch(/không phải đánh giá thành tích thật/);
    }
    for (const edition of VERIFIED_2026_EDITIONS) {
      const d = editionDisclosure(edition)!;
      expect(d.kind).toBe('game_derived');
      expect(d.factIds).toEqual(['tsw-2026-roster', 'lcp-2026-champion']);
      for (const id of d.factIds) expect(factById(id)).toBeDefined();
    }
    for (const edition of CURRENT_EDITIONS) expect(editionDisclosure(edition), edition.id).toBeNull();
  });

  it('no title-based edition was invented: the catalog still holds exactly the five 2026 cards', () => {
    expect(EDITIONS_CATALOG.filter((e) => e.editionYear === 2026 && e.provenance).map((e) => e.id).sort()).toEqual(
      ['champion_2026_bie', 'champion_2026_dire', 'champion_2026_eddie', 'champion_2026_hizto', 'champion_2026_pun'],
    );
    expect(EDITIONS_CATALOG.some((e) => /blg|hle|first_stand|msi|worlds_2026/i.test(e.id) && e.editionYear === 2026)).toBe(false);
  });
});
