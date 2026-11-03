import { Coins, Package, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { AudioSynth } from '../lib/audioSynth';
import { PACK_DEFINITIONS, PackDrawResult } from '../lib/economyEngine';
import { PackFamily } from '../types';

interface PacksViewProps {
  onOpenPackSuccess: (result: PackDrawResult) => void;
}

export const PacksView: React.FC<PacksViewProps> = ({ onOpenPackSuccess }) => {
  const { club, openPack, buyPackWithCredits } = useGame();
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'STORE'>('INVENTORY');

  const packsInInventory = club?.packs || [];
  const scoutMisses = club?.scoutPityMisses || 0;

  const handleOpen = (family: PackFamily) => {
    const res = openPack(family);
    if (res) {
      onOpenPackSuccess(res);
    }
  };

  const handleBuy = (family: PackFamily) => {
    const success = buyPackWithCredits(family);
    if (success) {
      setActiveTab('INVENTORY');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
            Khu Vực Gói Thẻ Tuyển Thủ (Packs)
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Mở gói thẻ để chiêu mộ những siêu sao VCS, LCP và Huyền Thoại Thế Giới
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-surface border border-line rounded-lg">
          <button
            onClick={() => {
              AudioSynth.playClick();
              setActiveTab('INVENTORY');
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
              activeTab === 'INVENTORY'
                ? 'bg-gold text-bg shadow'
                : 'text-fg-muted hover:text-white'
            }`}
          >
            Túi Đồ ({packsInInventory.length})
          </button>

          <button
            onClick={() => {
              AudioSynth.playClick();
              setActiveTab('STORE');
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
              activeTab === 'STORE'
                ? 'bg-gold text-bg shadow'
                : 'text-fg-muted hover:text-white'
            }`}
          >
            Cửa Hàng Pack
          </button>
        </div>
      </div>

      <p className="text-label text-fg-muted">
        Tuyển thủ yêu thích: <strong className="text-fg">Chovy</strong> và các thẻ <strong className="text-fg">Gen.G</strong> có cơ hội xuất hiện cao hơn trong cùng độ hiếm. Tỷ lệ độ hiếm ở bảng dưới và cơ chế bảo hiểm không thay đổi.
      </p>

      {/* Pity Status Banner */}
      <div className="p-4 rounded-xl bg-surface border border-line flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-gold/15 text-gold border border-gold/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white ">
              Bảo Hiểm May Mắn (Pity Guarantee v2.2)
            </h4>
            <p className="text-sm text-fg-muted mt-0.5">
              Gói Trinh Sát (Scout): Hiện tại đã mở{' '}
              <strong className="text-gold font-mono-nums">{scoutMisses}</strong> / 8 lần không có Sử Thi+. Lần thứ 8 chắc chắn 100% nhận thẻ Sử Thi (Epic) hoặc Huyền Thoại!
            </p>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-xs text-fg-subtle block font-semibold">Tiến Độ Bảo Hiểm</span>
          <span className="font-mono-nums font-extrabold text-base text-gold">
            {scoutMisses} / 7
          </span>
        </div>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-4">
          {packsInInventory.length === 0 ? (
            <div className="py-20 text-center rounded-xl bg-surface border border-dashed border-line">
              <Package className="w-12 h-12 text-fg-subtle mx-auto mb-3" />
              <h3 className="text-lg font-display font-bold text-fg">
                Bạn chưa có gói thẻ nào trong túi đồ
              </h3>
              <p className="text-sm text-fg-subtle mt-1 max-w-md mx-auto">
                Hoàn thành các cột mốc trong Chiến Dịch hoặc ghé thăm Cửa Hàng Pack để mua gói trinh sát tài năng.
              </p>
              <button
                onClick={() => setActiveTab('STORE')}
                className="mt-4 px-5 py-2.5 bg-gold hover:brightness-110 text-bg font-bold text-xs rounded-lg shadow cursor-pointer"
              >
                Ghé Thăm Cửa Hàng
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packsInInventory.map((pack) => {
                const def = PACK_DEFINITIONS[pack.family];
                return (
                  <div
                    key={pack.id}
                    className="p-5 rounded-xl bg-surface border border-line shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-gold block mb-1">
                        {pack.family}
                      </span>
                      <h3 className="font-display font-bold text-lg text-white mb-2">
                        {def.name}
                      </h3>
                      <p className="text-xs text-fg-muted leading-relaxed mb-4">
                        {def.description}
                      </p>

                      <div className="p-3 rounded-lg bg-bg border border-line text-xs text-fg space-y-1.5 mb-4">
                        <div className="flex justify-between">
                          <span>Thường (Common):</span>
                          <strong className="font-mono-nums">{def.rarityWeights.COMMON}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Hiếm (Rare):</span>
                          <strong className="font-mono-nums text-info">{def.rarityWeights.RARE}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Sử Thi (Epic):</span>
                          <strong className="font-mono-nums text-danger">{def.rarityWeights.EPIC}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Huyền Thoại (Legendary):</span>
                          <strong className="font-mono-nums text-gold">{def.rarityWeights.LEGENDARY}%</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpen(pack.family)}
                      className="w-full py-3 bg-gold hover:brightness-110 text-bg font-display font-extrabold text-xs rounded-lg shadow cursor-pointer transition-all"
                    >
                      Mở Gói Ngay ➔
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STORE TAB */}
      {activeTab === 'STORE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['SCOUT', 'ELITE', 'CHAMPION'] as PackFamily[]).map((family) => {
            const def = PACK_DEFINITIONS[family];
            const canAfford = (club?.wallet.credits || 0) >= def.priceCredits;

            return (
              <div
                key={family}
                className="p-6 rounded-xl bg-surface border border-line flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gold ">
                      {family} PACK
                    </span>
                    <div className="flex items-center gap-1 font-mono-nums font-bold text-gold text-sm">
                      <Coins className="w-4 h-4" />
                      <span>{def.priceCredits.toLocaleString()}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-xl text-white mb-2">
                    {def.name}
                  </h3>
                  <p className="text-sm text-fg-muted leading-relaxed mb-4">
                    {def.description}
                  </p>

                  <div className="p-3.5 rounded-lg bg-bg border border-line text-xs text-fg space-y-1.5 mb-4">
                    <span className="text-xs text-fg-subtle block font-bold mb-1">
                      Tỷ Lệ Mở Thẻ
                    </span>
                    <div className="flex justify-between">
                      <span>Thường (Common):</span>
                      <span className="font-mono-nums text-fg-muted">{def.rarityWeights.COMMON}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hiếm (Rare):</span>
                      <span className="font-mono-nums text-info font-semibold">{def.rarityWeights.RARE}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sử Thi (Epic):</span>
                      <span className="font-mono-nums text-danger font-semibold">{def.rarityWeights.EPIC}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Huyền Thoại (Legendary):</span>
                      <span className="font-mono-nums text-gold font-bold">
                        {def.rarityWeights.LEGENDARY}%
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(family)}
                  disabled={!canAfford}
                  className={`w-full py-3 font-display font-extrabold text-xs rounded-lg transition-all ${
                    canAfford
                      ? 'bg-gold hover:brightness-110 text-bg shadow cursor-pointer'
                      : 'bg-elevated text-fg-subtle cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Mua & Thêm Vào Túi' : 'Không Đủ Credits'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
