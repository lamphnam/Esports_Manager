import { Coins, Zap } from 'lucide-react';
import React, { useState } from 'react';
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
  const cost = getTrainingCost(currentLevel);
  const canAfford = (club?.wallet.credits || 0) >= cost;
  const isMaxLevel = currentLevel >= 10;

  const handleTrain = () => {
    if (!selectedCardId || isMaxLevel || !canAfford) return;
    trainCard(selectedCardId, selectedStat);
  };

  const statOptions: { key: keyof PlayerStats; label: string; desc: string }[] = [
    { key: 'mechanics', label: 'Kỹ Năng (Mechanics)', desc: 'Tăng cường phản xạ tay, đi đường áp đảo và solo kill' },
    { key: 'macro', label: 'Chiến Thuật (Macro)', desc: 'Cải thiện tầm nhìn sông, kiểm soát lính và tranh cướp bùa lợi' },
    { key: 'teamwork', label: 'Đồng Đội (Teamwork)', desc: 'Gắn kết đội hình trong các pha giao tranh tổng 5v5' },
    { key: 'mental', label: 'Tâm Lý (Mental)', desc: 'Bản lĩnh vững vàng khi bị dẫn trước hoặc tranh trừng phạt' },
    { key: 'championPool', label: 'Bể Tướng (Champion Pool)', desc: 'Thích ứng linh hoạt với nhiều đội hình trong loạt trận BO5' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
          Trung Tâm Huấn Luyện (Training Center)
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Rèn luyện và phát triển chỉ số cá nhân của các tuyển thủ từ cấp 1 đến cấp 10
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Card Selection list */}
        <div className="lg:col-span-1 p-4 rounded-xl bg-[#111827] border border-slate-700 space-y-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-2">
            Chọn Tuyển Thủ Cần Huấn Luyện
          </span>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {ownedCards.map((card) => {
              const details = getOwnedCardWithDetails(card.instanceId);
              if (!details) return null;
              const isSelected = card.instanceId === selectedCardId;

              return (
                <div
                  key={card.instanceId}
                  onClick={() => {
                    AudioSynth.playClick();
                    setSelectedCardId(card.instanceId);
                  }}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FFB800] bg-slate-800/90 ring-1 ring-[#FFB800]'
                      : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-slate-800 border border-slate-700 text-[#FFB800] font-bold flex items-center justify-center text-xs">
                      {details.player.primaryRole}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        {details.player.displayName}
                      </h4>
                      <span className="text-xs text-slate-300">
                        Cấp {card.level}/10 · {details.edition.rarity}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono-nums font-bold text-sm text-[#FFB800]">
                      OVR {details.effectiveOvr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Upgrade Workbench */}
        {selectedDetails && (
          <div className="lg:col-span-2 p-6 rounded-xl bg-[#111827] border border-slate-700 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-[#2563EB] text-white rounded">
                      {selectedDetails.player.primaryRole}
                    </span>
                    <h2 className="text-2xl font-display font-bold text-white">
                      {selectedDetails.player.displayName}
                    </h2>
                  </div>
                  <span className="text-sm text-slate-300 mt-1 block">
                    Tiến trình đào tạo: Cấp {currentLevel} / 10
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block uppercase font-semibold">Sức Mạnh Hiện Tại</span>
                  <span className="text-2xl font-mono-nums font-black text-[#FFB800]">
                    OVR {selectedDetails.effectiveOvr}
                  </span>
                </div>
              </div>

              {/* Stat Chooser */}
              <div className="mt-5 space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Chọn Kỹ Năng Đào Tạo Chuyên Sâu (+2 Điểm):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {statOptions.map((opt) => {
                    const isSelected = selectedStat === opt.key;
                    const currentVal = selectedDetails.effectiveStats[opt.key];
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          AudioSynth.playClick();
                          setSelectedStat(opt.key);
                        }}
                        className={`p-3.5 text-left rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#FFB800] bg-slate-800/90 ring-1 ring-[#FFB800]'
                            : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-white">{opt.label}</span>
                          <span className="font-mono-nums font-bold text-sm text-[#FFB800]">
                            {currentVal} ➔ {currentVal + 2}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 rounded-lg bg-[#090D16] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Chi phí huấn luyện:</span>
                <div className="flex items-center gap-1.5 font-mono-nums font-extrabold text-[#FFB800] text-lg">
                  <Coins className="w-4 h-4" />
                  <span>{isMaxLevel ? 'Tối Đa' : `${cost.toLocaleString()} Credits`}</span>
                </div>
              </div>

              <button
                onClick={handleTrain}
                disabled={isMaxLevel || !canAfford}
                className={`w-full sm:w-auto px-8 py-3.5 font-display font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                  isMaxLevel
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : canAfford
                    ? 'bg-[#FFB800] hover:bg-amber-400 text-slate-950 shadow cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {isMaxLevel
                    ? 'Đã Đạt Cấp 10 Tối Đa'
                    : canAfford
                    ? `Nâng Cấp Lên Cấp ${currentLevel + 1}`
                    : 'Không Đủ Credits'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
