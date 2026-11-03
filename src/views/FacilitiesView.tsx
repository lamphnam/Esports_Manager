import { Check, Coins, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import React from 'react';
import { useGame } from '../context/GameContext';

export const FacilitiesView: React.FC = () => {
  const { club, upgradeFacility } = useGame();

  const facilities = [
    {
      code: 'TRAINING_CENTER',
      name: 'Trung Tâm Huấn Luyện (Training Center)',
      desc: 'Nâng cấp phòng gym, máy móc gaming cao cấp và hệ thống phân tích replay giúp tăng hiệu quả rèn luyện.',
      icon: Zap,
      perks: [
        'Cấp 1: Giảm 10% chi phí credits khi huấn luyện tuyển thủ',
      ],
    },
    {
      code: 'SCOUT_OFFICE',
      name: 'Phòng Trinh Sát Tuyển Trạch (Scout Office)',
      desc: 'Mạng lưới cộng tác viên tìm kiếm tài năng trẻ tại các giải bán chuyên VCS và khu vực APAC.',
      icon: Sparkles,
      perks: [
        'Cấp 1: Hiển thị độ tin cậy của lối chơi đối thủ (Archetype Confidence)',
        'Cấp 2: Tăng tỷ lệ xuất hiện tuyển thủ bậc Hiếm (Rare) trên thị trường chuyển nhượng',
        'Cấp 3: Mở khóa các bản hợp đồng tuyển mộ siêu sao quốc tế',
      ],
    },
    {
      code: 'STRATEGY_LAB',
      name: 'Phòng Phân Tích Chiến Thuật (Strategy Lab)',
      desc: 'Ban huấn luyện và chuyên viên phân tích dữ liệu chuyên nghiệp, chuẩn bị đấu pháp khắc chế đối phương.',
      icon: ShieldCheck,
      perks: [
        'Cấp 1: +1 điểm gắn kết đội hình (Synergy) vĩnh viễn trong mọi trận đấu',
        'Cấp 2: +2 điểm gắn kết đội hình (tổng, vẫn chịu trần +8)',
        'Cấp 3: +3 điểm gắn kết đội hình (tổng, vẫn chịu trần +8)',
      ],
    },
  ];

  const costs = [1000, 2500, 5000];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="pb-4 border-b border-line">
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
          Cơ Sở Vật Chất Câu Lạc Bộ (Club Facilities)
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Nâng cấp trụ sở và cơ sở hạ tầng mang lại lợi thế chiến thuật và kinh tế lâu dài cho đội tuyển
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {facilities.filter(fac => fac.code !== 'SCOUT_OFFICE').map((fac) => {
          const currentTier = club?.facilities[fac.code] || 0;
          const isMax = currentTier >= fac.perks.length;
          const nextCost = costs[currentTier];
          const canAfford = (club?.wallet.credits || 0) >= nextCost;
          const Icon = fac.icon;

          return (
            <div
              key={fac.code}
              className="p-6 rounded-xl bg-surface border border-line flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/15 text-gold border border-gold/40 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-bg text-gold rounded border border-line">
                    Cấp {currentTier} / {Math.max(currentTier,fac.perks.length)}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white mb-2">
                  {fac.name}
                </h3>
                <p className="text-sm text-fg-muted leading-relaxed mb-4">
                  {fac.desc}
                </p>

                <div className="space-y-2 mb-6">
                  <span className="text-xs font-bold text-fg-subtle block">
                    Đặc Quyền Kích Hoạt
                  </span>
                  {fac.perks.map((perk, idx) => {
                    const isUnlocked = idx < currentTier;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                          isUnlocked
                            ? 'bg-success/10 text-success border-success/40'
                            : 'bg-bg text-fg-subtle border-line'
                        }`}
                      >
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isUnlocked ? 'text-success' : 'text-fg-subtle'
                          }`}
                        />
                        <span>{perk}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
                {!isMax && (
                  <div>
                    <span className="text-xs text-fg-subtle block font-semibold">Chi Phí Nâng Cấp</span>
                    <div className="flex items-center gap-1 font-mono-nums font-bold text-gold text-base">
                      <Coins className="w-4 h-4" />
                      <span>{nextCost.toLocaleString()} Credits</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => upgradeFacility(fac.code)}
                  disabled={isMax || !canAfford}
                  className={`w-full py-3 font-display font-extrabold text-xs rounded-lg transition-all ${
                    isMax
                      ? 'bg-elevated text-fg-subtle cursor-default'
                      : canAfford
                      ? 'bg-gold hover:brightness-110 text-bg shadow cursor-pointer'
                      : 'bg-elevated text-fg-subtle cursor-not-allowed'
                  }`}
                >
                  {isMax ? 'Đạt Cấp Tối Đa' : canAfford ? 'Nâng Cấp Cơ Sở' : 'Không Đủ Vốn'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
