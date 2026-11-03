import { describe, expect, it } from 'vitest';
import {
  BACKUP_META_KEY,
  DIRTY_THRESHOLD,
  NUDGE_INTERVAL_MS,
  emptyBackupMeta,
  isDirty,
  progressScore,
  readBackupMeta,
  shouldNudge,
  unsavedChanges,
  withBackup,
  withNudge,
  writeBackupMeta,
} from '../backupMeta';
import { backupAdvice, detectStorageContext } from '../environment';
import { compactSave, decodeSave, encodeSave } from '../recoveryCode';
import { saveReducer, validateSave } from '../saveState';
import { sampleSave } from './fixtures';

function fakeStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(BACKUP_META_KEY, initial);
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
  };
}

describe('DEC-12 backup tracking', () => {
  it('scores progress monotonically and ignores a missing club', () => {
    const save = sampleSave();
    const base = progressScore(save);
    expect(progressScore({ club: null, ownedCards: [] })).toBe(0);
    save.club!.completedChapterIds = [1];
    expect(progressScore(save)).toBe(base + 5);
    save.ownedCards[0].level = 4;
    expect(progressScore(save)).toBe(base + 5 + 3);
    save.club!.facilities.STRATEGY_LAB = 2;
    expect(progressScore(save)).toBe(base + 5 + 3 + 6);
  });

  it('is clean right after a backup and dirty once enough progress is unsaved', () => {
    const save = sampleSave();
    const meta = withBackup(emptyBackupMeta(), progressScore(save), 1000);
    expect(unsavedChanges(meta, progressScore(save))).toBe(0);
    expect(isDirty(meta, progressScore(save))).toBe(false);
    expect(isDirty(meta, progressScore(save) + DIRTY_THRESHOLD - 1)).toBe(false);
    expect(isDirty(meta, progressScore(save) + DIRTY_THRESHOLD)).toBe(true);
    // A lower score (for example after a restore of an older code) never produces negative changes.
    expect(unsavedChanges(meta, 0)).toBe(0);
  });

  it('nudges only on a score increase, when dirty, and not more than once per interval', () => {
    const meta = emptyBackupMeta();
    expect(shouldNudge(meta, 0, DIRTY_THRESHOLD, 0)).toBe(true);
    expect(shouldNudge(meta, DIRTY_THRESHOLD, DIRTY_THRESHOLD, 0)).toBe(false);
    expect(shouldNudge(meta, 0, DIRTY_THRESHOLD - 1, 0)).toBe(false);
    const nudged = withNudge(meta, 1_000);
    expect(shouldNudge(nudged, 0, 20, 1_000 + NUDGE_INTERVAL_MS - 1)).toBe(false);
    expect(shouldNudge(nudged, 0, 20, 1_000 + NUDGE_INTERVAL_MS)).toBe(true);
    // Backing up clears the dirty state, so the same score no longer nudges.
    expect(shouldNudge(withBackup(nudged, 20, 5_000), 10, 20, 9_999_999)).toBe(false);
  });

  it('persists meta and survives corrupted or hostile stored values', () => {
    const storage = fakeStorage();
    const meta = withBackup(emptyBackupMeta(), 12, 3000);
    writeBackupMeta(meta, storage);
    expect(readBackupMeta(storage)).toEqual(meta);
    for (const bad of ['{', 'null', '[]', '{"lastBackupAt":"x","scoreAtBackup":1,"lastNudgeAt":null}', '{"lastBackupAt":null,"scoreAtBackup":-5,"lastNudgeAt":null}']) {
      expect(readBackupMeta(fakeStorage(bad))).toEqual(emptyBackupMeta());
    }
    const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(readBackupMeta(throwing)).toEqual(emptyBackupMeta());
    expect(() => writeBackupMeta(meta, throwing)).not.toThrow();
  });
});

describe('DEC-12 storage context advice', () => {
  const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const iosChrome = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1';
  const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
  const safari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
  const top = {};

  it('detects embedding from window.self vs window.top, even when access throws', () => {
    expect(detectStorageContext({ self: top, top }, { userAgent: chrome }).embedded).toBe(false);
    expect(detectStorageContext({ self: {}, top }, { userAgent: chrome }).embedded).toBe(true);
    const hostile = { get self(): unknown { throw new Error('cross-origin'); }, top };
    expect(detectStorageContext(hostile, { userAgent: chrome }).embedded).toBe(true);
  });

  it('flags Apple WebKit browsers only', () => {
    expect(detectStorageContext({ self: top, top }, { userAgent: iphone }).appleWebKit).toBe(true);
    expect(detectStorageContext({ self: top, top }, { userAgent: iosChrome }).appleWebKit).toBe(true);
    expect(detectStorageContext({ self: top, top }, { userAgent: safari }).appleWebKit).toBe(true);
    expect(detectStorageContext({ self: top, top }, { userAgent: safari.replace('Macintosh; Intel Mac OS X 10_15_7', 'Macintosh'), maxTouchPoints: 5 }).appleWebKit).toBe(true);
    expect(detectStorageContext({ self: top, top }, { userAgent: chrome }).appleWebKit).toBe(false);
  });

  it('gives advice only for the contexts that need it', () => {
    expect(backupAdvice({ embedded: false, appleWebKit: false })).toEqual([]);
    expect(backupAdvice({ embedded: true, appleWebKit: false })).toHaveLength(1);
    expect(backupAdvice({ embedded: true, appleWebKit: true })).toHaveLength(2);
  });
});

describe('DEC-12 compact Recovery Code', () => {
  const withLedger = () => {
    const save = sampleSave();
    const ledger = Array.from({ length: 400 }, (_, i) => ({ id: `id-${i}`, timestamp: 1_793_000_000_000 + i, deltaCredits: 3, deltaMaterials: 1, deltaTickets: 0, reason: 'Thưởng mốc chapter', sourceType: 'MILESTONE' as const }));
    return saveReducer(save, { ledger });
  };

  it('folds the hot ledger into the archive without changing wallet or totals', () => {
    const save = withLedger();
    const before = structuredClone(save);
    const compact = compactSave(save);
    expect(save).toEqual(before);
    expect(compact.ledger).toEqual([]);
    expect(compact.club!.wallet).toEqual(save.club!.wallet);
    expect(compact.ledgerArchive!.credits).toBe((save.ledgerArchive?.credits || 0) + 400 * 3);
    expect(compact.ledgerArchive!.materials).toBe((save.ledgerArchive?.materials || 0) + 400);
    expect(compact.ledgerArchive!.count).toBe((save.ledgerArchive?.count || 0) + 400);
    expect(() => validateSave(compact)).not.toThrow();
  });

  it('produces a shorter code that restores the same progress', async () => {
    const save = withLedger();
    const full = await encodeSave(save);
    const short = await encodeSave(save, { compact: true });
    expect(short.length).toBeLessThan(full.length);
    const restored = await decodeSave(short);
    expect(restored.club).toEqual(save.club);
    expect(restored.ownedCards).toEqual(save.ownedCards);
    expect(restored.ledger).toEqual([]);
    expect(restored.ledgerArchive!.count).toBe(400 + (save.ledgerArchive?.count || 0));
    // The default (non-compact) export is unchanged.
    expect(await decodeSave(full)).toEqual(save);
  });
});
