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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
            Khu Vực Gói Thẻ Tuyển Thủ (Packs)
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Mở gói thẻ để chiêu mộ những siêu sao VCS, LCP và Huyền Thoại Thế Giới
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-[#111827] border border-slate-700 rounded-lg">
          <button
            onClick={() => {
              AudioSynth.playClick();
              setActiveTab('INVENTORY');
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
              activeTab === 'INVENTORY'
                ? 'bg-[#FFB800] text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
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
                ? 'bg-[#FFB800] text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Cửa Hàng Pack
          </button>
        </div>
      </div>

      {/* Pity Status Banner */}
      <div className="p-4 rounded-xl bg-[#111827] border border-slate-700 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#FFB800]/15 text-[#FFB800] border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Bảo Hiểm May Mắn (Pity Guarantee v2.2)
            </h4>
            <p className="text-sm text-slate-300 mt-0.5">
              Gói Trinh Sát (Scout): Hiện tại đã mở{' '}
              <strong className="text-[#FFB800] font-mono-nums">{scoutMisses}</strong> / 8 lần không có Sử Thi+. Lần thứ 8 chắc chắn 100% nhận thẻ Sử Thi (Epic) hoặc Huyền Thoại!
            </p>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-xs text-slate-400 block uppercase font-semibold">Tiến Độ Bảo Hiểm</span>
          <span className="font-mono-nums font-extrabold text-base text-[#FFB800]">
            {scoutMisses} / 7
          </span>
        </div>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-4">
          {packsInInventory.length === 0 ? (
            <div className="py-20 text-center rounded-xl bg-[#111827] border border-dashed border-slate-700">
              <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-display font-bold text-slate-200">
                Bạn chưa có gói thẻ nào trong túi đồ
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Hoàn thành các cột mốc trong Chiến Dịch hoặc ghé thăm Cửa Hàng Pack để mua gói trinh sát tài năng.
              </p>
              <button
                onClick={() => setActiveTab('STORE')}
                className="mt-4 px-5 py-2.5 bg-[#FFB800] hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow cursor-pointer"
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
                    className="p-5 rounded-xl bg-[#111827] border border-slate-700 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#FFB800] uppercase tracking-wider block mb-1">
                        {pack.family}
                      </span>
                      <h3 className="font-display font-bold text-lg text-white mb-2">
                        {def.name}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {def.description}
                      </p>

                      <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800 text-xs text-slate-200 space-y-1.5 mb-4">
                        <div className="flex justify-between">
                          <span>Thường (Common):</span>
                          <strong className="font-mono-nums">{def.rarityWeights.COMMON}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Hiếm (Rare):</span>
                          <strong className="font-mono-nums text-blue-400">{def.rarityWeights.RARE}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Sử Thi (Epic):</span>
                          <strong className="font-mono-nums text-rose-400">{def.rarityWeights.EPIC}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Huyền Thoại (Legendary):</span>
                          <strong className="font-mono-nums text-[#FFB800]">{def.rarityWeights.LEGENDARY}%</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpen(pack.family)}
                      className="w-full py-3 bg-[#FFB800] hover:bg-amber-400 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider rounded-lg shadow cursor-pointer transition-all"
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
                className="p-6 rounded-xl bg-[#111827] border border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#FFB800] uppercase tracking-wider">
                      {family} PACK
                    </span>
                    <div className="flex items-center gap-1 font-mono-nums font-bold text-[#FFB800] text-sm">
                      <Coins className="w-4 h-4" />
                      <span>{def.priceCredits.toLocaleString()}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-xl text-white mb-2">
                    {def.name}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {def.description}
                  </p>

                  <div className="p-3.5 rounded-lg bg-[#090D16] border border-slate-800 text-xs text-slate-200 space-y-1.5 mb-4">
                    <span className="text-xs text-slate-400 uppercase block font-bold mb-1">
                      Tỷ Lệ Mở Thẻ
                    </span>
                    <div className="flex justify-between">
                      <span>Thường (Common):</span>
                      <span className="font-mono-nums text-slate-300">{def.rarityWeights.COMMON}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hiếm (Rare):</span>
                      <span className="font-mono-nums text-blue-400 font-semibold">{def.rarityWeights.RARE}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sử Thi (Epic):</span>
                      <span className="font-mono-nums text-rose-400 font-semibold">{def.rarityWeights.EPIC}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Huyền Thoại (Legendary):</span>
                      <span className="font-mono-nums text-[#FFB800] font-bold">
                        {def.rarityWeights.LEGENDARY}%
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(family)}
                  disabled={!canAfford}
                  className={`w-full py-3 font-display font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all ${
                    canAfford
                      ? 'bg-[#FFB800] hover:bg-amber-400 text-slate-950 shadow cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
