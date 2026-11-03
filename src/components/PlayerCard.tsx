import React from 'react';
import {
  getEffectiveCardStats,
  computeCardOvr,
  getPlayerById,
} from '../data/cardCatalog';
import { AudioSynth } from '../lib/audioSynth';
import { OwnedCard, PlayerCardEdition, PlayerIdentity } from '../types';
import { RarityBadge, RoleBadge, StatBar } from './ui';

export { RARITY_CONFIG, ROLE_LABELS } from './ui';

interface PlayerCardProps {
  edition: PlayerCardEdition;
  player?: PlayerIdentity;
  ownedCard?: OwnedCard;
  isEquipped?: boolean;
  isStarter?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onEquip?: () => void;
  showActions?: boolean;
}

/*
 * Hierarchy: name + OVR first, then role / season / rarity / roster status, attributes last and muted.
 * The card is a size container: the avatar only appears when there is room for it.
 */
export const PlayerCard: React.FC<PlayerCardProps> = ({
  edition,
  player: propPlayer,
  ownedCard,
  isEquipped = false,
  compact = false,
  onClick,
  onEquip,
  showActions = true,
}) => {
  const player = propPlayer || getPlayerById(edition.playerId);
  const role = edition.role || player?.primaryRole || 'MID';
  const name = player?.displayName || '';

  const { stats, ovr } = ownedCard
    ? getEffectiveCardStats(ownedCard, edition)
    : { stats: edition.baseStats, ovr: computeCardOvr(edition.baseStats) };

  return (
    <div
      onClick={() => {
        AudioSynth.playCardHover();
        if (onClick) onClick();
      }}
      className={`@container relative group overflow-hidden panel card-rarity card-rarity-${edition.rarity.toLowerCase()} flex w-full flex-col gap-3 cursor-pointer transition-colors hover:bg-elevated ${
        compact ? '!p-3' : '!p-3.5'
      }`}
    >
      {(edition.rarity === 'LEGENDARY' || edition.rarity === 'EPIC') && (
        <div className="holo-card-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <div className="relative z-10 flex items-start gap-3 min-w-0">
        <div
          aria-hidden="true"
          className="hidden @[11rem]:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated font-display text-card font-extrabold text-fg"
        >
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-card font-bold leading-tight text-fg [overflow-wrap:anywhere]" title={name}>
            {name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <RoleBadge role={role} />
            <span className="text-caption text-fg-muted">
              {edition.editionYear} · {edition.editionCode}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right" aria-label={`OVR ${ovr}`}>
          <div className="font-mono-nums text-heading font-bold leading-none text-fg">{ovr}</div>
          <div className="mt-0.5 text-caption text-fg-subtle">OVR</div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-1">
        <RarityBadge rarity={edition.rarity} />
        {ownedCard && ownedCard.level > 1 && (
          <span className="text-caption font-semibold text-fg-muted">Cấp {ownedCard.level}/10</span>
        )}
        {isEquipped && <span className="badge badge-success">Đang đấu</span>}
      </div>

      <div className="relative z-10 space-y-2 border-t border-line pt-3">
        <StatBar label="Kỹ Năng" value={stats.mechanics} />
        <StatBar label="Chiến Thuật" value={stats.macro} />
        <StatBar label="Đồng Đội" value={stats.teamwork} />
      </div>

      {showActions && onEquip && !isEquipped && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEquip();
          }}
          className="btn btn-primary relative z-10 w-full"
        >
          Trang Bị
        </button>
      )}
    </div>
  );
};
