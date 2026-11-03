import React from 'react';
import { GameSimulationResult, MatchPhase, Role, SeriesFormat } from '../types';
import minimap from '../assets/map/summoners-rift-minimap.png';
import { roleIconSrc } from './RoleIcon';
import { ROLE_LABELS, RoleBadge } from './ui';

export interface Fielder {
  role: Role;
  displayName: string;
  ovr: number;
}

const ROLES: Role[] = ['TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'];
const inRoleOrder = (players: Fielder[]) => [...players].sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role));
const initials = (name: string) => name.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2).toUpperCase() || '??';
// Same OVR bands as the card rarities (Common < 70, Rare 70-79, Epic 80-89, Legendary 90+).
const tier = (ovr: number) => (ovr >= 90 ? 'legendary' : ovr >= 80 ? 'epic' : ovr >= 70 ? 'rare' : 'common');

/* ---------------------------------------------------------------- roster cards */

const FielderCard: React.FC<{ player: Fielder; side: 'player' | 'opponent' }> = ({ player, side }) => (
  <li
    className={`card-rarity card-rarity-${tier(player.ovr)} flex min-w-0 items-center gap-3 rounded-lg border border-line bg-surface p-2 sm:flex-col sm:gap-1.5 sm:px-2 sm:py-3 sm:text-center`}
  >
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-display text-card font-extrabold sm:h-12 sm:w-12 ${
        side === 'player' ? 'border-info/50 bg-info/10 text-info' : 'border-danger/50 bg-danger/10 text-danger'
      }`}
    >
      {initials(player.displayName)}
    </span>
    <span className="flex min-w-0 flex-1 flex-col sm:items-center">
      <span className="w-full text-label font-bold text-fg [overflow-wrap:anywhere]" title={player.displayName}>
        {player.displayName}
      </span>
      <span className="mt-0.5 flex items-center gap-2 sm:flex-col sm:gap-1">
        <RoleBadge role={player.role} />
      </span>
    </span>
    <span className="shrink-0 text-right sm:text-center" aria-label={`OVR ${player.ovr}`}>
      <span className="block font-mono-nums text-heading font-bold leading-none text-fg">{player.ovr}</span>
      <span className="text-caption text-fg-subtle">OVR</span>
    </span>
  </li>
);

interface TeamRowProps {
  side: 'player' | 'opponent';
  label: string;
  name: string;
  ovr: number;
  players: Fielder[];
  ratings?: { lane: number; macro: number; teamfight: number };
  note?: string;
}

const TeamRow: React.FC<TeamRowProps> = ({ side, label, name, ovr, players, ratings, note }) => (
  <section aria-label={`${label}: ${name}`} className="min-w-0">
    <div className="mb-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <div className="min-w-0">
        <span className={`label-text ${side === 'player' ? 'text-info' : 'text-danger'}`}>{label}</span>
        <h3 className="font-display text-card font-bold text-fg [overflow-wrap:anywhere]">{name}</h3>
      </div>
      <div className="text-right">
        <span className="font-mono-nums text-title font-extrabold leading-none text-fg">{ovr}</span>
        <span className="ml-1 text-caption text-fg-subtle">OVR</span>
        {ratings && (
          <p className="text-caption text-fg-subtle">
            Đi đường {ratings.lane} · Macro {ratings.macro} · Giao tranh {ratings.teamfight}
          </p>
        )}
      </div>
    </div>
    <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-5 sm:gap-2">
      {inRoleOrder(players).map((player) => (
        <FielderCard key={player.role} player={player} side={side} />
      ))}
    </ul>
    {note && <p className="mt-2 text-caption text-fg-subtle">{note}</p>}
  </section>
);

interface VersusProps {
  opponent: Omit<TeamRowProps, 'side' | 'label'>;
  you: Omit<TeamRowProps, 'side' | 'label'>;
  opponentLabel?: string;
}

/** Opponent on top, VS, your team underneath: both line-ups visible before the match. */
export const VersusRosters: React.FC<VersusProps> = ({ opponent, you, opponentLabel = 'Đối thủ' }) => (
  <div className="space-y-3">
    <TeamRow side="opponent" label={opponentLabel} {...opponent} />
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-line" />
      <span className="font-display text-heading font-extrabold tracking-widest text-gold">VS</span>
      <span className="h-px flex-1 bg-line" />
    </div>
    <TeamRow side="player" label="Đội của bạn" {...you} />
  </div>
);

/* ---------------------------------------------------------------- series tracker */

const BEST_OF: Record<SeriesFormat, number> = { BO1: 1, BO3: 3, BO5: 5 };

interface TrackerProps {
  format: SeriesFormat;
  /** games that are finished and visible (replay of the current game not included) */
  finished: GameSimulationResult[];
  /** index of the game being played, if any */
  currentIndex?: number;
}

export const SeriesTracker: React.FC<TrackerProps> = ({ format, finished, currentIndex }) => {
  const slots = BEST_OF[format];
  const wins = finished.filter((g) => g.winner === 'PLAYER').length;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-card font-bold text-fg">Best of {slots}</span>
        <span className="font-mono-nums text-heading font-extrabold text-gold" aria-label={`Tỷ số chuỗi ${wins} - ${finished.length - wins}`}>
          {wins} <span className="text-fg-subtle">-</span> {finished.length - wins}
        </span>
      </div>
      <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${slots}, minmax(0, 1fr))` }} aria-label="Các ván của chuỗi">
        {Array.from({ length: slots }, (_, index) => {
          const game = finished[index];
          const current = !game && index === currentIndex;
          const state = game ? (game.winner === 'PLAYER' ? 'won' : 'lost') : current ? 'live' : 'todo';
          const style =
            state === 'won' ? 'border-success/50 bg-success/10 text-success'
            : state === 'lost' ? 'border-danger/50 bg-danger/10 text-danger'
            : state === 'live' ? 'border-info/60 bg-info/10 text-info'
            : 'border-line bg-bg text-fg-subtle';
          const mark = state === 'won' ? '✓' : state === 'lost' ? '✗' : state === 'live' ? '…' : '·';
          const word = state === 'won' ? 'thắng' : state === 'lost' ? 'thua' : state === 'live' ? 'đang diễn ra' : 'chưa đấu';
          return (
            <li key={index} className={`flex min-h-11 flex-col items-center justify-center rounded-lg border py-1 ${style}`} aria-label={`Ván ${index + 1}: ${word}`}>
              <span className="text-caption font-semibold">M{index + 1}</span>
              <span aria-hidden="true" className="text-card font-bold leading-none">{mark}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

/* ---------------------------------------------------------------- lane map */

// Coordinates follow the 512x512 minimap image: blue base bottom-left, red base top-right.
type Point = [number, number];
const MAP_SIZE = 512;
const LANES: Record<'TOP' | 'MID' | 'BOT', Point[]> = {
  TOP: [[95, 400], [55, 345], [55, 80], [100, 52], [335, 52]],
  MID: [[145, 368], [368, 145]],
  BOT: [[120, 448], [440, 448], [458, 425], [458, 190]],
};
const JUNGLE_OWN: Point[] = [[115, 285], [195, 345]];
const JUNGLE_FOE: Point[] = [[320, 230], [395, 172]];

function along(path: Point[], t: number): Point {
  const lengths = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  let remaining = Math.max(0, Math.min(1, t)) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const k = lengths[i] === 0 ? 0 : remaining / lengths[i];
      return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k];
    }
    remaining -= lengths[i];
  }
  return path[0];
}

const clamp = (value: number) => Math.max(0.08, Math.min(0.92, value));

/** Where one fielder stands: lane position follows which side is pressing in this phase. */
export function tokenPosition(role: Role, side: 'player' | 'opponent', phase: MatchPhase, playerWinsPhase: boolean): Point {
  const push = (phase === 'EARLY' ? 0.5 : phase === 'MID' ? 0.8 : 1) * (playerWinsPhase ? 1 : -1);
  const own = clamp(0.4 + 0.18 * push);
  const foe = clamp(0.6 + 0.18 * push);
  const t = side === 'player' ? own : foe;
  if (role === 'JUNGLE') {
    if (phase === 'EARLY') return along(side === 'player' ? JUNGLE_OWN : JUNGLE_FOE, side === 'player' ? 0.45 : 0.55);
    return along(LANES.MID, clamp(t + (side === 'player' ? -0.07 : 0.07)));
  }
  if (role === 'SUPPORT') {
    const [x, y] = along(LANES.BOT, clamp(t + (side === 'player' ? -0.06 : 0.06)));
    return [x, y - 22];
  }
  return along(LANES[role], t);
}

interface MapProps {
  player: Fielder[];
  opponent: Fielder[];
  phase: MatchPhase;
  playerWinsPhase: boolean;
}

/** Summoner's Rift minimap with each fielder shown by the position icon; tokens slide as the phase result changes. */
export const LaneMap: React.FC<MapProps> = ({ player, opponent, phase, playerWinsPhase }) => {
  const summary = `Bản đồ pha ${phase}: ${playerWinsPhase ? 'đội bạn đang chiếm ưu thế' : 'đối thủ đang chiếm ưu thế'}.`;
  const token = (p: Fielder, side: 'player' | 'opponent') => {
    const [x, y] = tokenPosition(p.role, side, phase, playerWinsPhase);
    const colour = side === 'player' ? 'var(--color-info)' : 'var(--color-danger)';
    const icon = roleIconSrc(p.role);
    return (
      <g key={`${side}-${p.role}`} style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 1100ms ease-in-out' }}>
        <title>{`${p.displayName} (${p.role}) OVR ${p.ovr}`}</title>
        <circle r="25" fill="var(--color-bg)" fillOpacity="0.88" stroke={colour} strokeWidth="4.5" />
        {icon ? (
          <image href={icon} x="-16" y="-16" width="32" height="32" />
        ) : (
          <text textAnchor="middle" dy="5" fontSize="15" fontWeight="700" fill="var(--color-fg)">{ROLE_LABELS[p.role].name}</text>
        )}
      </g>
    );
  };
  return (
    <svg viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`} role="img" aria-label={summary} className="h-auto w-full rounded-xl border border-line bg-bg">
      <image href={minimap} x="0" y="0" width={MAP_SIZE} height={MAP_SIZE} />
      {opponent.map((p) => token(p, 'opponent'))}
      {player.map((p) => token(p, 'player'))}
    </svg>
  );
};
