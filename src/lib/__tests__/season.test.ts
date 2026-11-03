import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CHAPTERS } from '../../data/campaignData';
import { MAX_DIFFICULTY_BONUS, MAX_TEAM_OVR, targetOvr } from '../../data/legacyOpponents';
import { chaptersForSeason, COMPETITIONS, NEW_SEASON_STIPEND, nextSeasonClub, seasonOf, stageOf } from '../../data/season';
import { validateSave } from '../saveState';
import { sampleSave } from './fixtures';

describe('seasons', () => {
  it('maps career years to seasons', () => {
    expect(seasonOf(2026)).toBe(1);
    expect(seasonOf(2027)).toBe(2);
    expect(seasonOf(1999)).toBe(1);
  });

  it('every chapter belongs to exactly one bracket stage, in a valid order', () => {
    const ids = COMPETITIONS.flatMap((c) => c.stages.map((s) => s.chapterId)).sort((a, b) => a - b);
    expect(ids).toEqual(CAMPAIGN_CHAPTERS.map((c) => c.id));
    for (const chapter of CAMPAIGN_CHAPTERS) expect(stageOf(chapter.id)?.label).toBeTruthy();
  });

  it('season 1 is the unchanged campaign; later seasons retune chapters 3-12 with distinct, stronger teams', () => {
    expect(chaptersForSeason(1)).toBe(CAMPAIGN_CHAPTERS);
    for (const season of [2, 3, 5]) {
      const chapters = chaptersForSeason(season);
      expect(chaptersForSeason(season)).toBe(chapters); // cached and deterministic
      const pro = chapters.filter((c) => c.id >= 3);
      expect(new Set(pro.map((c) => c.opponent.name.replace(/ \d{4}$/, ''))).size).toBe(pro.length);
      for (const chapter of pro) {
        const target = targetOvr(chapter.id, season);
        expect(target).toBeLessThanOrEqual(MAX_TEAM_OVR);
        expect(chapter.opponent.ovr).toBeGreaterThanOrEqual(target - 3);
        expect(chapter.opponent.ovr).toBeGreaterThan(CAMPAIGN_CHAPTERS[chapter.id - 1].opponent.ovr);
        expect(chapter.opponent.difficultyBonus ?? 0).toBeLessThanOrEqual(MAX_DIFFICULTY_BONUS);
        expect(chapter.milestoneRewards).toEqual(CAMPAIGN_CHAPTERS[chapter.id - 1].milestoneRewards);
        expect(chapter.format).toBe(CAMPAIGN_CHAPTERS[chapter.id - 1].format);
      }
      // campus chapters are skipped from season 2, so they keep their original opponents
      expect(chapters[0].opponent).toBe(CAMPAIGN_CHAPTERS[0].opponent);
    }
    expect(targetOvr(12, 9)).toBe(MAX_TEAM_OVR); // difficulty saturates instead of exceeding the stat ceiling
  });

  it('the next season needs the Worlds title, keeps cards and wallet, and re-opens the pro run', () => {
    const save = sampleSave();
    const club = save.club!;
    expect(nextSeasonClub({ ...club, completedChapterIds: [1, 2, 3] })).toBeNull();
    const done = { ...club, currentChapterId: 12, completedChapterIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], reputation: 4000 };
    const before = structuredClone(done);
    const next = nextSeasonClub(done)!;
    expect(done).toEqual(before); // input untouched
    expect(next.careerYear).toBe(club.careerYear + 1);
    expect(next.currentChapterId).toBe(3);
    expect(next.completedChapterIds).toEqual([1, 2]);
    expect(next.wallet.credits).toBe(club.wallet.credits + NEW_SEASON_STIPEND);
    expect(next.reputation).toBe(4000);
    expect(next.lineup).toEqual(club.lineup);
    expect(() => validateSave({ ...save, club: next })).not.toThrow();
    // season 1 chapters can be cleared again for rewards in the new season (guard is per season)
    expect(next.completedChapterIds.includes(3)).toBe(false);
  });

  it('Gen.G is the final boss of every season and appears nowhere else', () => {
    for (const season of [1, 2, 3, 4]) {
      const chapters = chaptersForSeason(season);
      const boss = chapters.find((c) => c.id === 12)!;
      expect(boss.opponent.name.startsWith('Gen.G')).toBe(true);
      expect(boss.opponent.isFinalBoss).toBe(true);
      for (const chapter of chapters.filter((c) => c.id !== 12)) {
        expect(chapter.opponent.name.startsWith('Gen.G'), `season ${season} chapter ${chapter.id}`).toBe(false);
        expect(chapter.opponent.isFinalBoss).toBeFalsy();
      }
    }
  });
});
