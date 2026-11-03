import { ArrowLeftRight, Check } from 'lucide-react';
import React, { useState } from 'react';
import { PlayerCard, ROLE_LABELS } from '../components/PlayerCard';
import { PageHeader, SegmentedControl } from '../components/ui';
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
      <PageHeader
        title="Đội Hình Thi Đấu (Lineup & Synergy)"
        subtitle="Bố trí 5 vị trí then chốt, cân đối các chất tướng và kích hoạt chỉ số gắn kết chiến thuật"
      >
        <dl className="panel grid grid-cols-2 gap-x-6 gap-y-3 !p-3 sm:grid-cols-4">
          {[
            { label: 'Tổng sức mạnh', value: `OVR ${teamSnapshot.teamOvr}`, strong: true },
            { label: 'Đi đường', value: teamSnapshot.ratings.lane },
            { label: 'Macro', value: teamSnapshot.ratings.macro },
            { label: 'Giao tranh', value: teamSnapshot.ratings.teamfight },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0">
              <dt className="label-text">{metric.label}</dt>
              <dd className={`font-mono-nums text-heading font-bold ${metric.strong ? 'text-gold' : 'text-fg'}`}>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      {/* 5 Active Role Slots */}
      <div>
        <h2 className="label-text mb-3">5 vị trí ra sân chính thức (nhấp vào thẻ để thay người)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 lg:gap-4">
          {roles.map((r) => {
            const cardId = club?.lineup[r];
            const details = cardId ? getOwnedCardWithDetails(cardId) : null;
            const isSelected = selectedRole === r;

            return (
              <div
                key={r}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Chọn vị trí ${ROLE_LABELS[r].full}`}
                onClick={() => {
                  AudioSynth.playClick();
                  setSelectedRole(r);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    AudioSynth.playClick();
                    setSelectedRole(r);
                  }
                }}
                className={`relative min-w-0 cursor-pointer rounded-xl p-1 transition-colors ${
                  isSelected ? 'bg-gold/10 outline outline-1 outline-gold/60' : 'hover:bg-elevated/40'
                }`}
              >
                {details ? (
                  <PlayerCard
                    edition={details.edition}
                    player={details.player}
                    ownedCard={details.owned}
                    isEquipped={false}
                    compact={false}
                    showActions={false}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-line p-6 flex flex-col items-center justify-center min-h-[260px] bg-surface text-center">
                    <span className="text-xs font-bold text-fg-subtle mb-1">{r}</span>
                    <span className="text-xs text-fg-muted">Trống</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bench / Card Selection Drawer for Selected Role */}
      <div className="panel mt-8 space-y-4 !p-4 sm:!p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
          <div>
            <h3 className="flex items-center gap-2 text-heading font-display font-bold text-fg">
              <ArrowLeftRight className="w-4 h-4 text-gold" />
              <span>Tuyển Thủ Đảm Nhiệm Vị Trí: {ROLE_LABELS[selectedRole].name}</span>
            </h3>
            <span className="text-sm text-fg-muted">
              Có {benchCards.length} thẻ tuyển thủ trong kho có thể thi đấu ở vị trí này
            </span>
          </div>

          {/* Quick Role Switcher */}
          <SegmentedControl
            label="Chọn vị trí"
            value={selectedRole}
            onChange={(r) => { AudioSynth.playClick(); setSelectedRole(r); }}
            options={roles.map((r) => ({ value: r, label: r, title: ROLE_LABELS[r].full }))}
          />
                </div>

        {benchCards.length === 0 ? (
          <div className="py-12 text-center text-sm text-fg-subtle">
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
                    <div className="w-full py-2 text-center text-xs font-bold text-success bg-success/10 border border-success/40 rounded flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đang Ra Sân</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => equipCard(selectedRole, card.instanceId)}
                      className="w-full py-2 text-center text-xs font-bold text-bg bg-gold hover:brightness-110 rounded shadow transition-colors cursor-pointer"
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
