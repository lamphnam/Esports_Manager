import { X } from 'lucide-react';
import React, { useState } from 'react';
import { PlayerCard } from '../components/PlayerCard';
import { PageHeader, SegmentedControl } from '../components/ui';
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
      <PageHeader
        title={`Bộ Sưu Tập Tuyển Thủ (${ownedCards.length} Thẻ)`}
        subtitle="Toàn bộ các phiên bản thẻ tuyển thủ VCS, LCP và Huyền Thoại Thế Giới thuộc quyền sở hữu của câu lạc bộ"
      >
        <div className="flex flex-col gap-2 md:items-end">
          <SegmentedControl
            label="Lọc theo vị trí"
            value={selectedRole}
            onChange={(r) => { AudioSynth.playClick(); setSelectedRole(r); }}
            options={['ALL', 'TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'].map((r) => ({ value: r, label: r === 'ALL' ? 'Tất cả' : r }))}
          />
          <SegmentedControl
            label="Lọc theo độ hiếm"
            value={selectedRarity}
            onChange={(rarity) => { AudioSynth.playClick(); setSelectedRarity(rarity); }}
            options={[
              { value: 'ALL', label: 'Mọi Phẩm' },
              { value: 'COMMON', label: 'Thường' },
              { value: 'RARE', label: 'Hiếm' },
              { value: 'EPIC', label: 'Sử Thi' },
              { value: 'LEGENDARY', label: 'Huyền Thoại' },
            ]}
          />
        </div>
      </PageHeader>

      {/* Grid of Cards */}
      {filteredCards.length === 0 ? (
        <div className="py-20 text-center text-fg-subtle text-sm">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-md p-4">
          <div ref={inspection} role="dialog" aria-modal="true" aria-label="Chi Tiết Thẻ" tabIndex={-1} className="relative w-full max-w-lg max-h-[90dvh] bg-surface border border-line rounded-xl shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-line">
              <div>
                <span className="text-xs font-mono font-bold text-gold ">
                  {inspectedDetails.player.primaryRole} · {inspectedDetails.edition.editionCode}
                </span>
                <h3 className="text-2xl font-display font-bold text-white mt-0.5">
                  {inspectedDetails.player.displayName}
                </h3>
                <span className="text-xs text-fg-muted">{inspectedDetails.player.region}</span>
              </div>
              <button
                aria-label="Đóng chi tiết thẻ"
                onClick={() => setInspectCardId(null)}
                className="p-1.5 text-fg-muted hover:text-white bg-elevated border border-line rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-sm">
              <p className="text-fg leading-relaxed bg-bg p-3.5 rounded-lg border border-line">
                {inspectedDetails.player.biography}
              </p>

              {/* 5 Stats Breakdown */}
              <div className="space-y-2.5 p-3.5 bg-bg rounded-lg border border-line">
                <span className="text-xs font-bold text-fg-muted block">
                  Bảng Chỉ Số Chi Tiết (Cấp {inspectedDetails.owned.level}/10)
                </span>

                <div className="grid grid-cols-2 gap-2.5 text-xs text-fg">
                  <div className="flex justify-between p-2 bg-surface border border-line rounded">
                    <span>Kỹ Năng (Mechanics)</span>
                    <strong className="font-mono-nums text-gold">
                      {inspectedDetails.effectiveStats.mechanics}
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-surface border border-line rounded">
                    <span>Chiến Thuật (Macro)</span>
                    <strong className="font-mono-nums text-info">
                      {inspectedDetails.effectiveStats.macro}
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-surface border border-line rounded">
                    <span>Đồng Đội (Teamwork)</span>
                    <strong className="font-mono-nums text-success">
                      {inspectedDetails.effectiveStats.teamwork}
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-surface border border-line rounded">
                    <span>Tâm Lý (Mental)</span>
                    <strong className="font-mono-nums text-success">
                      {inspectedDetails.effectiveStats.mental}
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-surface border border-line rounded col-span-2">
                    <span>Bể Tướng (Champion Pool)</span>
                    <strong className="font-mono-nums text-danger">
                      {inspectedDetails.effectiveStats.championPool}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Archetype & Traits */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-bg border border-line">
                  <span className="text-fg-subtle block font-semibold mb-0.5">Phong Cách Đấu</span>
                  <span className="font-bold text-white">{inspectedDetails.player.playstyle}</span>
                </div>
                <div className="p-3 rounded-lg bg-bg border border-line">
                  <span className="text-fg-subtle block font-semibold mb-0.5">Điểm Cần Lưu Ý</span>
                  <span className="font-medium text-danger line-clamp-2">
                    {inspectedDetails.player.weakness}
                  </span>
                </div>
              </div>

              {/* Trait Tags - Clean Unboxed Metadata per Zero-Pill Rule */}
              <div>
                <span className="text-xs text-fg-subtle block font-semibold mb-1">Đặc Tính Tuyển Thủ</span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gold font-semibold">
                  {inspectedDetails.edition.traits.map((t, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span aria-hidden="true" className="text-fg-subtle">·</span>}
                      <span>{t}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="text-xs text-fg-subtle pt-3 border-t border-line">
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
