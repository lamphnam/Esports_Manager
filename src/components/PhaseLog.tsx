import React from 'react';
import { PhaseOutcome } from '../types';

/*
 * Match log colouring: lines that favour the player are green, lines that favour the opponent are red.
 * A line follows the phase result; the closing line of a LATE phase that points against the game result
 * (see reconcileLateNarrative in the simulator) follows the game winner instead, so the log ends where the game ends.
 * Colour is never the only signal: each line also carries hidden text for screen readers.
 */
export type Tone = 'good' | 'bad';
type Winner = 'PLAYER' | 'OPPONENT';

export const TONE_TEXT: Record<Tone, string> = { good: 'text-success', bad: 'text-danger' };
const tone = (winner: Winner): Tone => (winner === 'PLAYER' ? 'good' : 'bad');
const swings = (phase: PhaseOutcome, gameWinner: Winner) => phase.phase === 'LATE' && phase.winner !== gameWinner;

export const phaseTone = (phase: PhaseOutcome): Tone => tone(phase.winner);

export function lineTone(phase: PhaseOutcome, index: number, gameWinner: Winner): Tone {
  const last = index === phase.events.length - 1;
  return swings(phase, gameWinner) && last ? tone(gameWinner) : tone(phase.winner);
}

export const keyMomentTone = (phase: PhaseOutcome, gameWinner: Winner): Tone =>
  swings(phase, gameWinner) ? tone(gameWinner) : tone(phase.winner);

export const goldTone = (goldDelta: number): Tone => (goldDelta >= 0 ? 'good' : 'bad');

const Hidden: React.FC<{ tone: Tone }> = ({ tone: t }) => <span className="sr-only">{t === 'good' ? 'Có lợi: ' : 'Bất lợi: '}</span>;

export const PhaseEvents: React.FC<{ phase: PhaseOutcome; gameWinner: Winner; as?: 'p' | 'div'; className?: string }> = ({ phase, gameWinner, className = '' }) => (
  <>
    {phase.events.map((event, index) => {
      const t = lineTone(phase, index, gameWinner);
      return (
        <p key={index} className={`${className} ${TONE_TEXT[t]}`}>
          <Hidden tone={t} />
          {event}
        </p>
      );
    })}
  </>
);

export const KeyMoment: React.FC<{ phase: PhaseOutcome; gameWinner: Winner; className?: string }> = ({ phase, gameWinner, className = '' }) => {
  const t = keyMomentTone(phase, gameWinner);
  return (
    <p className={`${className} font-semibold ${TONE_TEXT[t]}`}>
      <Hidden tone={t} />
      {phase.keyMoment}
    </p>
  );
};

export const GoldDelta: React.FC<{ value: number }> = ({ value }) => (
  <span className={`font-mono-nums font-semibold ${TONE_TEXT[goldTone(value)]}`}>
    {value > 0 ? '+' : ''}
    {value.toLocaleString()}
  </span>
);
