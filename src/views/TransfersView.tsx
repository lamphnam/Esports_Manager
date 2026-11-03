import { Coins } from 'lucide-react';
import React from 'react';
import { PlayerCard } from '../components/PlayerCard';
import { useGame } from '../context/GameContext';
import { getEditionById, getPlayerById } from '../data/cardCatalog';

export const TransfersView: React.FC = () => {
  const { transferOffers, club, buyTransferOffer } = useGame();

  const handleBuy = (offerId: string) => {
    buyTransferOffer(offerId);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
            Thị Trường Chuyển Nhượng Tuyển Thủ (Transfer Market)
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Tuyển mộ thẻ Legacy trong mô phỏng. Sáu đề nghị xoay theo ngày Việt Nam, không phản ánh hợp đồng thật.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111827] border border-slate-700 px-3.5 py-2 rounded-lg text-sm">
          <span className="text-slate-300">Ngân quỹ:</span>
          <span className="font-mono-nums font-bold text-[#FFB800]">
            {club?.wallet.credits.toLocaleString()} Credits
          </span>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {transferOffers.map((offer) => {
          const edition = getEditionById(offer.editionId);
          const player = edition ? getPlayerById(edition.playerId) : null;
          if (!edition || !player) return null;

          const canAfford = (club?.wallet.credits || 0) >= offer.priceCredits;

          return (
            <div
              key={offer.id}
              className="p-5 rounded-xl bg-[#111827] border border-slate-700 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-[#FFB800] uppercase">{offer.sourceClub}</span>
                  <span className="text-slate-300 text-xs">Hết hạn: {offer.expiresAt ? new Date(offer.expiresAt).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}) : 'Đã hết hạn'}</span>
                </div>

                <div className="mb-4">
                  <PlayerCard
                    edition={edition}
                    player={player}
                    compact={false}
                    showActions={false}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-semibold">
                    Phí Chuyển Nhượng
                  </span>
                  <div className="flex items-center gap-1 font-mono-nums font-extrabold text-[#FFB800] text-base">
                    <Coins className="w-4 h-4" />
                    <span>{offer.priceCredits.toLocaleString()} Credits</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(offer.id)}
                  disabled={!canAfford || !offer.expiresAt || offer.expiresAt<=Date.now()}
                  className={`px-5 py-2.5 font-display font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    canAfford
                      ? 'bg-[#FFB800] hover:bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Ký Hợp Đồng' : 'Không Đủ Vốn'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
