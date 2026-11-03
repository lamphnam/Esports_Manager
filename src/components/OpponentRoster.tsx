import React from 'react';
import { Chapter, Role } from '../types';
import { RoleBadge } from './ui';

interface Props {
  opponent: Chapter['opponent'];
  defaultOpen?: boolean;
}

const ROLE_ORDER: Role[] = ['TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'];

/**
 * Who the opponent fields: role, name and OVR of each player. Native <details> keeps it keyboard and
 * screen-reader friendly and lets long lists collapse on small screens.
 */
export const OpponentRoster: React.FC<Props> = ({ opponent, defaultOpen = false }) => {
  const players = [...(opponent.snapshot?.roster ?? opponent.rosterPreview)].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
  );
  const bonus = opponent.snapshot?.difficultyBonus ?? 0;

  return (
    <details open={defaultOpen} className="group rounded-lg border border-line bg-bg">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-label font-semibold text-fg-muted hover:text-fg [&::-webkit-details-marker]:hidden">
        <span>Đội hình đối thủ ({players.length} tuyển thủ)</span>
        <span aria-hidden="true" className="text-fg-subtle transition-transform group-open:rotate-180">▾</span>
      </summary>
      <ul className="space-y-1 border-t border-line px-3 py-2">
        {players.map((player) => (
          <li key={player.role} className="flex min-w-0 items-center gap-2">
            <span className="w-16 shrink-0"><RoleBadge role={player.role} /></span>
            <span className="min-w-0 flex-1 text-label font-semibold text-fg [overflow-wrap:anywhere]" title={player.displayName}>
              {player.displayName}
            </span>
            <span className="shrink-0 font-mono-nums text-label font-bold text-fg" aria-label={`OVR ${player.ovr}`}>
              {player.ovr}
              <span className="ml-1 text-caption font-normal text-fg-subtle">OVR</span>
            </span>
          </li>
        ))}
      </ul>
      {bonus > 0 && (
        <p className="border-t border-line px-3 py-2 text-caption text-fg-subtle">
          Chỉ số đội hình lịch sử này được cân chỉnh +{bonus} để phù hợp độ khó chương.
        </p>
      )}
    </details>
  );
};
