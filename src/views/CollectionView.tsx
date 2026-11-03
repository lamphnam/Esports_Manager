import { X } from 'lucide-react';
import React, { useState } from 'react';
import { PlayerCard } from '../components/PlayerCard';
import { useGame } from '../context/GameContext';
import { getEditionById, getPlayerById } from '../data/cardCatalog';
import { AudioSynth } from '../lib/audioSynth';
import {useDialog} from '../lib/useDialog';

export const CollectionView: React.FC = () => {
  const { ownedCards, getOwnedCardWithDetails, club } = useGame();
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [inspectCardId, setInspectCardId] = useState<string | null>(null);
  const inspection=useDialog(()=>setInspectCardId(null),!!inspectCardId);

  // Filter owned cards
  const filteredCards = ownedCards.filter((c) => {
    const edition = getEditionById(c.editionId);
    const player = edition ? getPlayerById(edition.playerId) : null;
    if (!edition || !player) return false;

    if (selectedRole !== 'ALL' && player.primaryRole !== selectedRole) return false;
    if (selectedRarity !== 'ALL' && edition.rarity !== selectedRarity) return false;
    return true;
  });

  const inspectedDetails = inspectCardId ? getOwnedCardWithDetails(inspectCardId) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
            Bộ Sưu Tập Tuyển Thủ ({ownedCards.length} Thẻ)
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Toàn bộ các phiên bản thẻ tuyển thủ VCS, LCP và Huyền Thoại Thế Giới thuộc quyền sở hữu của câu lạc bộ
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#111827] border border-slate-700 rounded-lg text-xs">
            {['ALL', 'TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  AudioSynth.playClick();
                  setSelectedRole(r);
                }}
                className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                  selectedRole === r
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'Tất cả' : r}
              </button>
            ))}
          </div>

          {/* Rarity Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#111827] border border-slate-700 rounded-lg text-xs">
            {['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'].map((rarity) => (
              <button
                key={rarity}
                onClick={() => {
                  AudioSynth.playClick();
                  setSelectedRarity(rarity);
                }}
                className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                  selectedRarity === rarity
                    ? 'bg-[#FFB800] text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {rarity === 'ALL'
                  ? 'Mọi Phẩm'
                  : rarity === 'COMMON'
                  ? 'Thường'
                  : rarity === 'RARE'
                  ? 'Hiếm'
                  : rarity === 'EPIC'
                  ? 'Sử Thi'
                  : 'Huyền Thoại'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredCards.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Không tìm thấy thẻ nào phù hợp với bộ lọc đã chọn.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCards.map((card) => {
            const details = getOwnedCardWithDetails(card.instanceId);
            if (!details) return null;
            const isEquipped = Object.values(club?.lineup || {}).includes(card.instanceId);

            return (
              <PlayerCard
                key={card.instanceId}
                edition={details.edition}
                player={details.player}
                ownedCard={details.owned}
                isEquipped={isEquipped}
                compact={true}
                onClick={() => setInspectCardId(card.instanceId)}
                showActions={false}
              />
            );
          })}
        </div>
      )}

      {/* Detailed Card Inspection Modal */}
      {inspectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div ref={inspection} role="dialog" aria-modal="true" aria-label="Chi Tiết Thẻ" tabIndex={-1} className="relative w-full max-w-lg max-h-[90dvh] bg-[#111827] border border-slate-700 rounded-xl shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-[#FFB800] uppercase">
                  {inspectedDetails.player.primaryRole} · {inspectedDetails.edition.editionCode}
                </span>
                <h3 className="text-2xl font-display font-bold text-white mt-0.5">
                  {inspectedDetails.player.displayName}
                </h3>
                <span className="text-xs text-slate-300">{inspectedDetails.player.region}</span>
              </div>
              <button
                aria-label="Đóng chi tiết thẻ"
                onClick={() => setInspectCardId(null)}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-sm">
              <p className="text-slate-200 leading-relaxed bg-[#090D16] p-3.5 rounded-lg border border-slate-800">
                {inspectedDetails.player.biography}
              </p>

              {/* 5 Stats Breakdown */}
              <div className="space-y-2.5 p-3.5 bg-[#090D16] rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase block">
                  Bảng Chỉ Số Chi Tiết (Cấp {inspectedDetails.owned.level}/10)
                </span>

                <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-200">
                  <div className="flex justify-between p-2 bg-[#111827] border border-slate-800 rounded">
                    <span>Kỹ Năng (Mechanics)</span>
                    <strong className="font-mono-nums text-[#FFB800]">
                      {inspectedDetails.effectiveStats.mechanics}
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-[#111827] border border-slate-800 rounded">
                    <span>Chiến Thuật (Macro)</span>
                    <strong className="font-mono-nums text-blue-400">
                      {inspectedDetails.effectiveStats.macro}
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-[#111827] border border-slate-800 rounded">
                    <span>Đồng Đội (Teamwork)</span>
                    <strong className="font-mono-nums text-emerald-400">
                      {inspectedDetails.effectiveStats.teamwork}
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-[#111827] border border-slate-800 rounded">
                    <span>Tâm Lý (Mental)</span>
                    <strong className="font-mono-nums text-teal-400">
                      {inspectedDetails.effectiveStats.mental}
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-[#111827] border border-slate-800 rounded col-span-2">
                    <span>Bể Tướng (Champion Pool)</span>
                    <strong className="font-mono-nums text-rose-400">
                      {inspectedDetails.effectiveStats.championPool}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Archetype & Traits */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800">
                  <span className="text-slate-400 block uppercase font-semibold mb-0.5">Phong Cách Đấu</span>
                  <span className="font-bold text-white">{inspectedDetails.player.playstyle}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800">
                  <span className="text-slate-400 block uppercase font-semibold mb-0.5">Điểm Cần Lưu Ý</span>
                  <span className="font-medium text-rose-300 line-clamp-2">
                    {inspectedDetails.player.weakness}
                  </span>
                </div>
              </div>

              {/* Trait Tags - Clean Unboxed Metadata per Zero-Pill Rule */}
              <div>
                <span className="text-xs text-slate-400 block uppercase font-semibold mb-1">Đặc Tính Tuyển Thủ</span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#FFB800] font-semibold">
                  {inspectedDetails.edition.traits.map((t, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span aria-hidden="true" className="text-slate-500">·</span>}
                      <span>{t}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-400 pt-3 border-t border-slate-800">
                Nguồn gốc: {inspectedDetails.owned.acquiredFrom} · Sở hữu ngày:{' '}
                {new Date(inspectedDetails.owned.acquiredAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
