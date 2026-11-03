import { Coins, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { RarityBadge, RoleBadge } from '../components/ui';
import { RoleIcon } from '../components/RoleIcon';
import { ROLE_LABELS } from '../components/ui';
import { useGame } from '../context/GameContext';
import { AudioSynth } from '../lib/audioSynth';
import { getTrainingCost } from '../lib/economyEngine';
import { PlayerStats } from '../types';

export const TrainingView: React.FC = () => {
  const { ownedCards, club, trainCard, getOwnedCardWithDetails } = useGame();
  const [selectedCardId, setSelectedCardId] = useState<string>(
    ownedCards[0]?.instanceId || ''
  );
  const [selectedStat, setSelectedStat] = useState<keyof PlayerStats>('mechanics');

  const selectedDetails = selectedCardId ? getOwnedCardWithDetails(selectedCardId) : null;
  const currentLevel = selectedDetails?.owned.level || 1;
  const cost = getTrainingCost(currentLevel, club?.facilities.TRAINING_CENTER);
  const canAfford = (club?.wallet.credits || 0) >= cost;
  const isMaxLevel = currentLevel >= 10;
  const isStatFull = (selectedDetails?.effectiveStats[selectedStat] || 0) >= 99;

  const handleTrain = () => {
    if (!selectedCardId || isMaxLevel || !canAfford) return;
    trainCard(selectedCardId, selectedStat);
  };

  const statOptions: { key: keyof PlayerStats; label: string; desc: string }[] = [
    { key: 'mechanics', label: 'Kỹ Năng (Mechanics)', desc: 'Tăng cường phản xạ tay, đi đường áp đảo và solo kill' },
    { key: 'macro', label: 'Chiến Thuật (Macro)', desc: 'Cải thiện tầm nhìn sông, kiểm soát lính và tranh cướp bùa lợi' },
    { key: 'teamwork', label: 'Đồng Đội (Teamwork)', desc: 'Gắn kết đội hình trong các pha giao tranh tổng 5v5' },
    { key: 'mental', label: 'Tâm Lý (Mental)', desc: 'Bản lĩnh vững vàng khi bị dẫn trước hoặc tranh trừng phạt' },
  ];

  const actionLabel = isStatFull
    ? 'Chỉ Số Đã Đầy (99)'
    : isMaxLevel
    ? 'Đã Đạt Cấp 10 Tối Đa'
    : canAfford
    ? `Nâng Cấp Lên Cấp ${currentLevel + 1}`
    : 'Không Đủ Credits';

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <div className="border-b border-line pb-4">
        <h1 className="text-title font-display font-extrabold text-fg">
          Trung Tâm Huấn Luyện <span className="text-fg-muted">(Training Center)</span>
        </h1>
        <p className="mt-1 text-body text-fg-muted">
          Rèn luyện và phát triển chỉ số cá nhân của các tuyển thủ từ cấp 1 đến cấp 10
        </p>
        <p className="mt-1 text-caption text-fg-subtle">
          Vật liệu: {club?.wallet.trainingMaterials || 0} · Vé trinh sát: {club?.wallet.scoutTickets || 0}. Chi phí hiện tại chỉ dùng Credits.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Left: card selection list */}
        <section className="panel space-y-3" aria-labelledby="training-roster">
          <h2 id="training-roster" className="label-text">Chọn tuyển thủ cần huấn luyện</h2>

          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {ownedCards.map((card) => {
              const details = getOwnedCardWithDetails(card.instanceId);
              if (!details) return null;
              const isSelected = card.instanceId === selectedCardId;
              const role = details.edition.role || details.player.primaryRole;

              return (
                <button
                  key={card.instanceId}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    AudioSynth.playClick();
                    setSelectedCardId(card.instanceId);
                  }}
                  className="option flex w-full items-center gap-3 p-3 text-left"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated text-fg-muted"
                    title={ROLE_LABELS[role].full}
                    aria-label={ROLE_LABELS[role].full}
                  >
                    <RoleIcon role={role} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-card font-display font-bold text-fg [overflow-wrap:anywhere]" title={details.player.displayName}>
                      {details.player.displayName}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-fg-muted">
                      <span>{ROLE_LABELS[role].name}</span>
                      <span aria-hidden="true">·</span>
                      <span>Cấp {card.level}/10</span>
                      <span aria-hidden="true">·</span>
                      <RarityBadge rarity={details.edition.rarity} />
                    </span>
                  </span>
                  <span className="shrink-0 text-right" aria-label={`OVR ${details.effectiveOvr}`}>
                    <span className="block font-mono-nums text-heading font-bold leading-none text-fg">{details.effectiveOvr}</span>
                    <span className="text-caption text-fg-subtle">OVR</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: upgrade workbench */}
        {selectedDetails && (
          <section className="panel flex flex-col gap-6" aria-labelledby="training-workbench">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-line pb-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 id="training-workbench" className="text-heading font-display font-bold text-fg [overflow-wrap:anywhere]">
                    {selectedDetails.player.displayName}
                  </h2>
                  <RoleBadge role={selectedDetails.edition.role || selectedDetails.player.primaryRole} />
                </div>
                <p className="mt-1 text-label text-fg-muted">Tiến trình đào tạo: Cấp {currentLevel} / 10</p>
              </div>

              <div className="text-right" aria-label={`Sức mạnh hiện tại OVR ${selectedDetails.effectiveOvr}`}>
                <span className="label-text block">Sức mạnh hiện tại</span>
                <span className="font-mono-nums text-title font-bold leading-none text-gold">{selectedDetails.effectiveOvr}</span>
                <span className="ml-1 text-caption text-fg-subtle">OVR</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="label-text">Chọn kỹ năng đào tạo chuyên sâu (+2 điểm)</h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {statOptions.map((opt) => {
                  const isSelected = selectedStat === opt.key;
                  const currentVal = selectedDetails.effectiveStats[opt.key];
                  const next = Math.min(99, currentVal + 2);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={currentVal >= 99}
                      aria-pressed={isSelected}
                      onClick={() => {
                        AudioSynth.playClick();
                        setSelectedStat(opt.key);
                      }}
                      className="option flex flex-col gap-1.5 p-3.5 text-left disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0 text-body font-bold text-fg">{opt.label}</span>
                        <span className="shrink-0 whitespace-nowrap font-mono-nums text-label font-bold text-gold">
                          {currentVal} → {next}
                          {currentVal >= 99 ? ' (Đầy)' : ''}
                        </span>
                      </span>
                      <span className="text-caption text-fg-muted">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cost and action are one area. */}
            <div className="panel-inset flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="label-text block">Chi phí huấn luyện</span>
                <div className="mt-0.5 flex items-center gap-1.5 font-mono-nums text-heading font-bold text-gold">
                  <Coins className="h-4 w-4 shrink-0" />
                  <span>{isMaxLevel ? 'Tối đa' : `${cost.toLocaleString()} Credits`}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTrain}
                disabled={isMaxLevel || isStatFull || !canAfford}
                className="btn btn-primary btn-lg w-full sm:w-auto"
              >
                <Zap className="h-4 w-4 shrink-0 fill-current" />
                <span>{actionLabel}</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
