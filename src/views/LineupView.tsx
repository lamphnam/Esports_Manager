import { ArrowLeftRight, Check } from 'lucide-react';
import React, { useState } from 'react';
import { PlayerCard, ROLE_LABELS } from '../components/PlayerCard';
import { useGame } from '../context/GameContext';
import { getEditionById, getPlayerById } from '../data/cardCatalog';
import { AudioSynth } from '../lib/audioSynth';
import { Role } from '../types';

export const LineupView: React.FC = () => {
  const { club, ownedCards, equipCard, getOwnedCardWithDetails, getTeamSnapshot } = useGame();
  const [selectedRole, setSelectedRole] = useState<Role>('TOP');

  const teamSnapshot = getTeamSnapshot();
  const roles: Role[] = ['TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'];

  // Filter bench cards for the selected role
  const benchCards = ownedCards.filter((c) => {
    const edition = getEditionById(c.editionId);
    const player = edition ? getPlayerById(edition.playerId) : null;
    return player?.primaryRole === selectedRole || player?.secondaryRole === selectedRole;
  });

  const activeCardId = club?.lineup[selectedRole];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Title & Team Power Rating Cluster */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
            Đội Hình Thi Đấu (Lineup & Synergy)
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Bố trí 5 vị trí then chốt, cân đối các chất tướng và kích hoạt chỉ số gắn kết chiến thuật
          </p>
        </div>

        {/* Combat Ratings Metric Cluster */}
        <div className="flex items-center gap-3 bg-[#111827] border border-slate-700 p-3 rounded-lg text-xs">
          <div className="text-center px-3 border-r border-slate-700">
            <span className="text-[11px] text-slate-300 block uppercase font-semibold">TỔNG SỨC MẠNH</span>
            <span className="text-lg font-mono-nums font-black text-[#FFB800]">
              OVR {teamSnapshot.teamOvr}
            </span>
          </div>

          <div className="text-center px-3 border-r border-slate-700">
            <span className="text-[11px] text-slate-300 block uppercase font-semibold">ĐI ĐƯỜNG</span>
            <span className="text-base font-mono-nums font-bold text-white">
              {teamSnapshot.ratings.lane}
            </span>
          </div>

          <div className="text-center px-3 border-r border-slate-700">
            <span className="text-[11px] text-slate-300 block uppercase font-semibold">MACRO</span>
            <span className="text-base font-mono-nums font-bold text-white">
              {teamSnapshot.ratings.macro}
            </span>
          </div>

          <div className="text-center px-3">
            <span className="text-[11px] text-slate-300 block uppercase font-semibold">GIAO TRANH</span>
            <span className="text-base font-mono-nums font-bold text-white">
              {teamSnapshot.ratings.teamfight}
            </span>
          </div>
        </div>
      </div>

      {/* 5 Active Role Slots */}
      <div>
        <h2 className="text-sm font-display font-bold text-slate-200 uppercase tracking-wider mb-3">
          5 Vị Trí Ra Sân Chính Thức (Nhấp vào thẻ để thay người)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 lg:gap-4">
          {roles.map((r) => {
            const cardId = club?.lineup[r];
            const details = cardId ? getOwnedCardWithDetails(cardId) : null;
            const isSelected = selectedRole === r;

            return (
              <div
                key={r}
                onClick={() => {
                  AudioSynth.playClick();
                  setSelectedRole(r);
                }}
                className={`relative rounded-lg p-1 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-[#FFB800] bg-amber-500/10' : 'hover:bg-slate-800/40'
                }`}
              >
                {details ? (
                  <PlayerCard
                    edition={details.edition}
                    player={details.player}
                    ownedCard={details.owned}
                    isEquipped={true}
                    compact={false}
                    showActions={false}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-700 p-6 flex flex-col items-center justify-center min-h-[260px] bg-[#111827] text-center">
                    <span className="text-xs font-bold text-slate-400 mb-1">{r}</span>
                    <span className="text-xs text-slate-300">Trống</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bench / Card Selection Drawer for Selected Role */}
      <div className="mt-8 p-6 rounded-xl bg-[#111827] border border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-[#FFB800]" />
              <span>Tuyển Thủ Đảm Nhiệm Vị Trí: {ROLE_LABELS[selectedRole].name}</span>
            </h3>
            <span className="text-sm text-slate-300">
              Có {benchCards.length} thẻ tuyển thủ trong kho có thể thi đấu ở vị trí này
            </span>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-1.5">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => {
                  AudioSynth.playClick();
                  setSelectedRole(r);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors cursor-pointer ${
                  selectedRole === r
                    ? 'bg-[#FFB800] text-slate-950 border-[#FFB800]'
                    : 'bg-[#090D16] text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {benchCards.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Chưa có thẻ tuyển thủ dự bị nào cho vị trí này. Hãy mở thêm gói thẻ tại Cửa Hàng Pack hoặc ký hợp đồng tại Thị Trường Chuyển Nhượng!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {benchCards.map((card) => {
              const details = getOwnedCardWithDetails(card.instanceId);
              if (!details) return null;
              const isCurrentlyEquipped = activeCardId === card.instanceId;

              return (
                <div key={card.instanceId} className="flex flex-col gap-2">
                  <PlayerCard
                    edition={details.edition}
                    player={details.player}
                    ownedCard={details.owned}
                    isEquipped={isCurrentlyEquipped}
                    compact={true}
                    showActions={false}
                  />

                  {isCurrentlyEquipped ? (
                    <div className="w-full py-2 text-center text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 rounded flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đang Ra Sân</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => equipCard(selectedRole, card.instanceId)}
                      className="w-full py-2 text-center text-xs font-bold text-slate-950 bg-[#FFB800] hover:bg-amber-400 rounded shadow transition-colors cursor-pointer"
                    >
                      Đổi Vào Sân
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
