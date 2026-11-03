import React from 'react';
import {
  getEffectiveCardStats,
  computeCardOvr,
  getPlayerById,
} from '../data/cardCatalog';
import { AudioSynth } from '../lib/audioSynth';
import { OwnedCard, PlayerCardEdition, PlayerIdentity, Role } from '../types';

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

export const ROLE_LABELS: Record<Role, { name: string; icon: string; color: string }> = {
  TOP: { name: 'TOP', icon: '⚔️', color: 'text-rose-300 bg-rose-950/60 border-rose-700/50' },
  JUNGLE: { name: 'JNG', icon: '🌲', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-700/50' },
  MID: { name: 'MID', icon: '⚡', color: 'text-amber-300 bg-amber-950/60 border-amber-700/50' },
  BOT: { name: 'BOT', icon: '🏹', color: 'text-blue-300 bg-blue-950/60 border-blue-700/50' },
  SUPPORT: { name: 'SUP', icon: '🛡️', color: 'text-teal-300 bg-teal-950/60 border-teal-700/50' },
};

export const RARITY_CONFIG = {
  COMMON: {
    label: 'Thường',
    border: 'border-slate-700',
    glowClass: 'card-glow-common',
    badge: 'bg-slate-800 text-slate-200 border border-slate-700',
    ovrBg: 'bg-slate-800 text-slate-100 border border-slate-600',
    accent: '#94A3B8',
  },
  RARE: {
    label: 'Hiếm',
    border: 'border-blue-500/80',
    glowClass: 'card-glow-rare',
    badge: 'bg-blue-950/90 text-blue-200 border border-blue-500/40',
    ovrBg: 'bg-blue-600 text-white',
    accent: '#2563EB',
  },
  EPIC: {
    label: 'Sử Thi',
    border: 'border-rose-500/90',
    glowClass: 'card-glow-epic',
    badge: 'bg-rose-950/90 text-rose-200 border border-rose-500/50',
    ovrBg: 'bg-rose-600 text-white',
    accent: '#E11D48',
  },
  LEGENDARY: {
    label: 'Huyền Thoại',
    border: 'border-amber-400',
    glowClass: 'card-glow-legendary',
    badge: 'bg-amber-950/90 text-amber-300 border border-amber-400/60',
    ovrBg: 'bg-[#FFB800] text-slate-950 font-black',
    accent: '#FFB800',
  },
};

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
  const rarity = RARITY_CONFIG[edition.rarity];
  const roleInfo = ROLE_LABELS[player?.primaryRole || 'MID'];

  const statsAndOvr = ownedCard
    ? getEffectiveCardStats(ownedCard, edition)
    : { stats: edition.baseStats, ovr: computeCardOvr(edition.baseStats) };

  const { stats, ovr } = statsAndOvr;

  return (
    <div
      onClick={() => {
        AudioSynth.playCardHover();
        if (onClick) onClick();
      }}
      className={`relative group rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
        rarity.glowClass
      } border ${rarity.border} ${
        compact ? 'w-full p-3' : 'w-full p-4'
      } bg-[#111827] hover:bg-[#151F32] flex flex-col justify-between`}
    >
      {/* Metallic sheen for Legendary and Epic */}
      {(edition.rarity === 'LEGENDARY' || edition.rarity === 'EPIC') && (
        <div className="holo-card-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      {/* Card Header: Role & OVR */}
      <div className="flex items-center justify-between mb-2.5 z-10">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 border ${roleInfo.color}`}
          >
            <span>{roleInfo.icon}</span>
            <span>{roleInfo.name}</span>
          </span>
          {isEquipped && (
            <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 rounded">
              Đang Đấu
            </span>
          )}
        </div>

        <div
          className={`px-2.5 py-0.5 rounded ${rarity.ovrBg} font-mono-nums font-bold text-sm shadow-sm`}
        >
          {ovr}
        </div>
      </div>

      {/* Portrait Centerpiece */}
      <div className="relative my-2 py-2.5 flex flex-col items-center justify-center z-10 border-y border-slate-800/80 bg-[#0B101B]/60 rounded">
        <div
          className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-display font-extrabold bg-slate-900 border ${rarity.border} shadow-inner relative`}
        >
          <span className="text-white tracking-wider">
            {player?.displayName.slice(0, 2).toUpperCase()}
          </span>
          {ownedCard && ownedCard.level > 1 && (
            <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 text-[10px] font-mono-nums font-bold bg-[#2563EB] text-white rounded border border-blue-300">
              Cấp {ownedCard.level}
            </span>
          )}
        </div>

        <h3
          className={`mt-2.5 font-display font-bold ${
            compact ? 'text-base' : 'text-lg'
          } text-white tracking-wide text-center leading-tight`}
        >
          {player?.displayName}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-300 text-center mt-0.5 font-medium">
          <span>{edition.editionYear}</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-400 font-semibold">{edition.editionCode}</span>
        </div>
      </div>

      {/* Stat bars - Higher contrast & clear labels */}
      <div className="space-y-2 my-2.5 text-xs z-10">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
            <span>Kỹ Năng</span>
            <span className="font-mono-nums font-semibold text-white">{stats.mechanics}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-sm h-1.5 overflow-hidden">
            <div
              className="bg-[#FFB800] h-full transition-all duration-300"
              style={{ width: `${stats.mechanics}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
            <span>Chiến Thuật</span>
            <span className="font-mono-nums font-semibold text-white">{stats.macro}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-sm h-1.5 overflow-hidden">
            <div
              className="bg-[#2563EB] h-full transition-all duration-300"
              style={{ width: `${stats.macro}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
            <span>Đồng Đội</span>
            <span className="font-mono-nums font-semibold text-white">{stats.teamwork}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-sm h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${stats.teamwork}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer: Rarity & Equip CTA */}
      <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs z-10">
        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${rarity.badge}`}>
          {rarity.label}
        </span>

        {showActions && onEquip && !isEquipped && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEquip();
            }}
            className="px-2.5 py-1 text-xs font-bold bg-[#FFB800] hover:bg-amber-400 text-slate-950 rounded transition-colors whitespace-nowrap"
          >
            Trang Bị
          </button>
        )}
      </div>
    </div>
  );
};
