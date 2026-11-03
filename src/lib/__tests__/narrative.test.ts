import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CHAPTERS } from '../../data/campaignData';
import { keyMomentTone, lineTone, phaseTone } from '../../components/PhaseLog';
import { simulateGame, simulatePhase } from '../simulator';
import { chapterOpponent, defaultTactics, sampleTeam } from './fixtures';

describe('game log agrees with the game result', () => {
  const player = sampleTeam(1);
  const opponent = chapterOpponent(CAMPAIGN_CHAPTERS[2]);
  const policy = { archetype: 'EARLY_AGGRO' as const };

  it('final log line points the same way as the winner, for every seed', () => {
    const seen = { playerWonLateLostGame: 0, playerLostLateWonGame: 0 };
    for (let seed = 1; seed <= 3000; seed++) {
      const game = simulateGame(seed, 1, player, opponent, defaultTactics, policy);
      const late = game.phases[2];
      const text = late.events.join(' ');
      if (game.winner === 'PLAYER') expect(text, `seed ${seed}`).toContain('Nexus đối phương');
      else {
        expect(text, `seed ${seed}`).not.toContain('Nexus đối phương');
        expect(text, `seed ${seed}`).toMatch(/Nhà Chính của bạn|căn cứ/);
      }
      if (late.winner === 'PLAYER' && game.winner === 'OPPONENT') seen.playerWonLateLostGame++;
      if (late.winner === 'OPPONENT' && game.winner === 'PLAYER') seen.playerLostLateWonGame++;
    }
    // Both swing cases must actually occur in the sample, otherwise this test proves nothing.
    expect(seen.playerWonLateLostGame).toBeGreaterThan(0);
    expect(seen.playerLostLateWonGame).toBeGreaterThan(0);
  });

  it('only rewrites commentary: phase winner, probability and gold match the raw phase draw', () => {
    for (let seed = 1; seed <= 500; seed++) {
      const game = simulateGame(seed, 1, player, opponent, defaultTactics, policy);
      const raw = simulatePhase(seed, 1, 'LATE', player, opponent, defaultTactics.late, policy);
      const late = game.phases[2];
      expect(late.winner).toBe(raw.winner);
      expect(late.winProbability).toBe(raw.winProbability);
      expect(late.goldDelta).toBe(raw.goldDelta);
      expect(late.opponentArchetypeActual).toBe(raw.opponentArchetypeActual);
    }
  });

  it('colours favourable lines green and unfavourable lines red, ending on the game result', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 3000; seed++) {
      const game = simulateGame(seed, 1, player, opponent, defaultTactics, policy);
      for (const phase of game.phases) {
        expect(phaseTone(phase)).toBe(phase.winner === 'PLAYER' ? 'good' : 'bad');
        phase.events.forEach((_, index) => {
          const last = index === phase.events.length - 1;
          const swing = phase.phase === 'LATE' && phase.winner !== game.winner;
          const expected = swing && last ? (game.winner === 'PLAYER' ? 'good' : 'bad') : phaseTone(phase);
          expect(lineTone(phase, index, game.winner)).toBe(expected);
        });
        if (phase.phase === 'LATE') {
          // the closing line and key moment always agree with who won the game
          const closing = lineTone(phase, phase.events.length - 1, game.winner);
          expect(closing).toBe(game.winner === 'PLAYER' ? 'good' : 'bad');
          expect(keyMomentTone(phase, game.winner)).toBe(closing);
          seen.add(`${phase.winner}-${game.winner}`);
        }
      }
    }
    expect(seen.size).toBe(4); // all four phase/game combinations were exercised
  });
});
