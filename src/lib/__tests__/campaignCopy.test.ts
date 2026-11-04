import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CHAPTERS } from '../../data/campaignData';
import { CHAPTER_COPY, OPPONENT_ORIGIN_LABELS } from '../../data/campaignCopy';
import { EDITIONS_CATALOG } from '../../data/cardCatalog';
import { campaignOpponentSeed, legacyOpponent } from '../../data/legacyOpponents';
import { chaptersForSeason, COMPETITIONS, FIRST_CAREER_YEAR, NEW_SEASON_START_CHAPTER, nextSeasonClub, stageOf } from '../../data/season';
import { VERIFIED_2026_EDITIONS } from '../../data/verified2026';
import { validateSave } from '../saveState';
import { sampleSave } from './fixtures';

// Gameplay contract frozen on 04/11/2026: copy work must not move ids, codes, formats or rewards.
const FROZEN: Record<number, { code: string; format: string; credits: number; materials?: number; packs?: string[]; reputation: number }> = {
  1: { code: 'CH_01_FIVE_STRANGERS', format: 'BO1', credits: 500, packs: ['WELCOME'], reputation: 25 },
  2: { code: 'CH_02_CAMPUS_KINGS', format: 'BO3', credits: 600, materials: 2, packs: ['SCOUT'], reputation: 50 },
  3: { code: 'CH_03_ROAD_TO_VCS', format: 'BO3', credits: 800, materials: 4, packs: ['ELITE'], reputation: 100 },
  4: { code: 'CH_04_PRO_DEBUT', format: 'BO3', credits: 1200, materials: 6, packs: ['ELITE'], reputation: 150 },
  5: { code: 'CH_05_VIETNAM_CROWN', format: 'BO5', credits: 2000, materials: 10, packs: ['ELITE', 'CHAMPION'], reputation: 300 },
  6: { code: 'CH_06_PACIFIC_RIVALS', format: 'BO5', credits: 2200, packs: ['CHAMPION'], reputation: 400 },
  7: { code: 'CH_07_FIRST_STAND', format: 'BO5', credits: 2500, packs: ['CHAMPION'], reputation: 500 },
  8: { code: 'CH_08_MIDSEASON_MASTERS', format: 'BO5', credits: 3000, packs: ['CHAMPION'], reputation: 600 },
  9: { code: 'CH_09_LAST_TICKET', format: 'BO5', credits: 3500, packs: ['CHAMPION'], reputation: 750 },
  10: { code: 'CH_10_AGAINST_THE_WORLD', format: 'BO5', credits: 4000, packs: ['CHAMPION'], reputation: 900 },
  11: { code: 'CH_11_SWISS_SURVIVAL', format: 'BO5', credits: 5000, packs: ['CHAMPION', 'CHAMPION'], reputation: 1200 },
  12: { code: 'CH_12_WRITE_YOUR_LEGACY', format: 'BO5', credits: 10000, packs: ['CHAMPION', 'CHAMPION'], reputation: 2500 },
};

/** Everything a player can read about a chapter, in every season. */
const visibleText = (chapter: (typeof CAMPAIGN_CHAPTERS)[number]) =>
  [chapter.title, chapter.subtitle, chapter.description, chapter.storyEpilogue, chapter.adaptationNote, stageOf(chapter.id)!.label].join(' | ');

describe('campaign copy (P0, 04/11/2026)', () => {
  it('keeps ids, codes, formats and rewards frozen', () => {
    expect(CAMPAIGN_CHAPTERS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const chapter of CAMPAIGN_CHAPTERS) {
      const frozen = FROZEN[chapter.id];
      expect(chapter.code).toBe(frozen.code);
      expect(chapter.format).toBe(frozen.format);
      expect(chapter.milestoneRewards).toEqual({ credits: frozen.credits, ...(frozen.materials ? { materials: frozen.materials } : {}), ...(frozen.packs ? { packs: frozen.packs } : {}), reputation: frozen.reputation });
    }
    expect(FIRST_CAREER_YEAR).toBe(2026);
    expect(NEW_SEASON_START_CHAPTER).toBe(3);
  });

  it('chapter 10 is a BO5 fictional quarterfinal, never Swiss; chapters 11 and 12 are the semifinal and final', () => {
    const [ch10, ch11, ch12] = [10, 11, 12].map((id) => CAMPAIGN_CHAPTERS[id - 1]);
    expect(ch10.format).toBe('BO5');
    expect(ch10.subtitle).toBe('Chapter 10 · Tứ Kết Worlds (BO5 giả lập)');
    expect(stageOf(10)!.label).toMatch(/Tứ kết/);
    expect(ch11.subtitle).toMatch(/Bán Kết Worlds/);
    expect(ch12.subtitle).toMatch(/Chung Kết Worlds/);
    expect(stageOf(11)!.label).toBe('Bán kết');
    expect(stageOf(12)!.label).toBe('Chung kết');
    // Names a player sees never call a BO5 chapter Swiss (`code` is an internal id and is frozen). Prose may mention Swiss
    // only to say the game leaves it out.
    const worlds = COMPETITIONS.find((c) => c.id === 'worlds')!;
    for (const season of [1, 2, 3]) {
      for (const chapter of chaptersForSeason(season)) {
        expect([chapter.title, chapter.subtitle, stageOf(chapter.id)!.label].join(' '), `season ${season} chapter ${chapter.id}`).not.toMatch(/swiss/i);
        for (const sentence of visibleText(chapter).split(/[.!|]/).filter((t) => /swiss/i.test(t))) expect(sentence, `chapter ${chapter.id}`).toMatch(/lược bỏ|không có/);
      }
    }
    expect(`${worlds.name} ${worlds.blurb} ${worlds.stages.map((s) => s.label).join(' ')}`).toMatch(/Play-In và Swiss, game lược bỏ/);
    expect(worlds.stages.map((s) => s.label).join(' ').toLowerCase()).not.toContain('swiss');
    expect(worlds.stages.map((s) => s.chapterId)).toEqual([10, 11, 12]);
  });

  it('chapter 5 does not promise a real LCP berth nor present GAM as the 2026 VCS champion', () => {
    const ch5 = CAMPAIGN_CHAPTERS[4];
    for (const season of [1, 2]) {
      const text = visibleText(chaptersForSeason(season)[4]);
      expect(text).not.toMatch(/vé chính thức|LCP 2027|nhà vua|đại diện Việt Nam bước ra/i);
    }
    expect(ch5.description).toMatch(/giả lập/);
    expect(ch5.storyEpilogue).toMatch(/chiến dịch/);
    expect(ch5.opponent.name).toBe('GAM Esports');
    expect(ch5.opponentOrigin).toBe('LEGACY_ALLSTAR');
    expect(ch5.opponent.description).toMatch(/All-Star giả lập/);
    expect(ch5.opponent.description).toMatch(/không phải .*nhà vô địch VCS 2026/);
    // The only place allowed to name 2027 is the adaptation note, and only to say it is not simulated.
    expect(ch5.adaptationNote).toMatch(/không mô phỏng/);
    for (const chapter of CAMPAIGN_CHAPTERS) expect(chapter.isOfficialFormat).toBe(false);
  });

  it('chapters 6-12 each have their own subtitle, description and epilogue (no shared generic line)', () => {
    const late = CAMPAIGN_CHAPTERS.filter((c) => c.id >= 6);
    expect(late).toHaveLength(7);
    for (const field of ['subtitle', 'description', 'storyEpilogue'] as const) {
      expect(new Set(late.map((c) => c[field])).size, field).toBe(7);
      for (const chapter of late) expect(chapter[field].length, `${field} ${chapter.id}`).toBeGreaterThan(30);
    }
    for (const chapter of CAMPAIGN_CHAPTERS) {
      expect(chapter.subtitle).toMatch(new RegExp(`^Chapter ${chapter.id} · `));
      expect(CHAPTER_COPY[chapter.id]).toBeDefined();
    }
    // The old runtime override strings must be gone.
    for (const chapter of late) {
      expect(chapter.description).not.toBe('Đội hình lịch sử gặp nhau trong nhánh loại trực tiếp hư cấu.');
      expect(chapter.storyEpilogue).not.toBe('Tiến tới chặng tiếp theo của hành trình mô phỏng.');
      expect(chapter.subtitle).not.toMatch(/Loại trực tiếp hư cấu$/);
    }
  });

  it('story copy for chapters 3-12 never hardcodes an opponent, so seasons 2+ stay truthful', () => {
    for (const season of [1, 2, 3, 6]) {
      for (const chapter of chaptersForSeason(season).filter((c) => c.id >= 3)) {
        const team = chapter.opponent.name.replace(/ \d{4}$/, '');
        const story = [chapter.subtitle, chapter.description, chapter.storyEpilogue].join(' ');
        // Chapter 12 is the one fixed boss and may be named in its description.
        if (chapter.id !== 12) expect(story, `season ${season} chapter ${chapter.id} names ${team}`).not.toContain(team);
      }
    }
    for (const id of [3, 4, 5]) {
      const story = `${CHAPTER_COPY[id].description} ${CHAPTER_COPY[id].storyEpilogue}`;
      expect(story).not.toMatch(/CERBERUS|Vikings|GAM/);
    }
  });

  it('labels the opponent as fictional, All-Star or Legacy, and never as a 2026 roster', () => {
    const origins = CAMPAIGN_CHAPTERS.map((c) => c.opponentOrigin);
    expect(origins).toEqual(['FICTIONAL_ROSTER', 'FICTIONAL_ROSTER', 'FICTIONAL_ROSTER', 'FICTIONAL_ROSTER', 'LEGACY_ALLSTAR', ...Array(7).fill('LEGACY_ROSTER')]);
    // From season 2 chapters 3-12 are seeded Legacy team-years.
    for (const chapter of chaptersForSeason(2)) expect(chapter.opponentOrigin).toBe(chapter.id >= 3 ? 'LEGACY_ROSTER' : 'FICTIONAL_ROSTER');
    for (const label of Object.values(OPPONENT_ORIGIN_LABELS)) expect(label).not.toMatch(/mùa 2026 chính thức/i);
    expect(OPPONENT_ORIGIN_LABELS.LEGACY_ROSTER).toMatch(/không phải roster mùa 2026/);
    // Legacy opponents carry the team-year in their name and their own disclaimer.
    for (const chapter of CAMPAIGN_CHAPTERS.filter((c) => c.id >= 6)) {
      expect(chapter.opponent.name).toMatch(/ \d{4}$/);
      expect(chapter.opponent.description).toMatch(/Legacy|lịch sử/);
    }
    expect(CAMPAIGN_CHAPTERS[11].opponent.isFinalBoss).toBe(true);
    expect(CAMPAIGN_CHAPTERS[11].opponent.name.startsWith('Gen.G')).toBe(true);
  });

  it('opponent selection is untouched: chapters 6-12 equal the seeded Legacy pick', () => {
    for (const chapter of CAMPAIGN_CHAPTERS.filter((c) => c.id >= 6)) {
      expect(chapter.opponent).toEqual(legacyOpponent(chapter.id, campaignOpponentSeed(chapter.id)));
    }
  });

  it('real-world reference metadata is honest and complete', () => {
    for (const chapter of CAMPAIGN_CHAPTERS) {
      expect(chapter.rulesBasisYear).toBe(2026); // career year, not the unpublished 2027 format
      expect(chapter.realWorldReferenceUrl).toMatch(/^https:\/\/lolesports\.com\//);
      expect(chapter.adaptationNote.length).toBeGreaterThan(20);
    }
    for (const chapter of CAMPAIGN_CHAPTERS.filter((c) => c.id >= 3)) expect(chapter.adaptationNote).toMatch(/giả lập|Giả lập/);
    for (const id of [7, 8]) expect(CAMPAIGN_CHAPTERS[id - 1].adaptationNote).toMatch(/giản lược/);
  });
});

describe('provenance and save compatibility', () => {
  it('edition ids are unique and every imported (Legacy / 2026) edition has a rating source', () => {
    const ids = EDITIONS_CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(EDITIONS_CATALOG.length).toBeGreaterThanOrEqual(649 + 30);
    const imported = EDITIONS_CATALOG.filter((e) => e.provenance);
    expect(imported.length).toBeGreaterThanOrEqual(649 + 5);
    for (const edition of imported) expect(edition.provenance!.ratingSource, edition.id).toBeTruthy();
  });

  it('2026 cards are derived ratings with sources, and make no performance claim', () => {
    expect(VERIFIED_2026_EDITIONS).toHaveLength(5);
    for (const edition of VERIFIED_2026_EDITIONS) {
      expect(edition.id).toMatch(/^champion_2026_/);
      expect(edition.provenance!.ratingSource).toBe('derived');
      expect(edition.provenance!.source).toMatch(/lolesports\.com.*sheepesports\.com/);
      expect(edition.provenance!.ratingNote).toMatch(/No real performance claim/);
    }
    // No unverified Worlds 2026 champion or First Stand / MSI card was invented.
    expect(EDITIONS_CATALOG.some((e) => /champion_2026_(?!pun|hizto|dire|eddie|bie)/.test(e.id))).toBe(false);
  });

  it('a fresh and an old save still validate, and chapter copy is never persisted', () => {
    const save = sampleSave();
    expect(() => validateSave(save)).not.toThrow();
    const json = JSON.stringify(save);
    expect(json).not.toContain('opponentOrigin');
    expect(json).not.toContain('Tứ Kết Worlds');
    const club = save.club!;
    expect(club.careerYear).toBe(2026);
    // Finishing Worlds still rolls the season exactly as before.
    const done = { ...club, currentChapterId: 12, completedChapterIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
    const next = nextSeasonClub(done)!;
    expect(next.currentChapterId).toBe(NEW_SEASON_START_CHAPTER);
    expect(next.completedChapterIds).toEqual([1, 2]);
    expect(() => validateSave({ ...save, club: next })).not.toThrow();
  });
});
