import { Shield, Sparkles, Swords, Trophy, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { getEditionById } from '../data/cardCatalog';
import { AudioSynth } from '../lib/audioSynth';
import { PlayerCard } from './PlayerCard';

interface OnboardingModalProps {
  onComplete: (clubName: string, logoKey: string) => void;
  onRecover: () => void;
}

const LOGO_PRESETS = [
  { id: 'gold_star', label: 'Ngôi Sao Vàng', icon: Trophy, color: 'bg-[#FFB800] text-slate-950' },
  { id: 'cyber_shield', label: 'Khiên Điện Tử', icon: Shield, color: 'bg-[#2563EB] text-white' },
  { id: 'lightning_crest', label: 'Tia Sấm Sét', icon: Zap, color: 'bg-emerald-600 text-white' },
  { id: 'phoenix_blade', label: 'Lưỡi Kiếm Lửa', icon: Swords, color: 'bg-rose-600 text-white' },
];

const STARTER_EDITION_IDS = [
  'ed_raven_acad',
  'ed_vex_acad',
  'ed_kairo_acad',
  'ed_nova_acad',
  'ed_mint_acad',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onRecover }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [clubName, setClubName] = useState('Saigon Rising Esports');
  const [selectedLogo, setSelectedLogo] = useState('gold_star');

  const starterEditions = STARTER_EDITION_IDS.map((id) => getEditionById(id)!);

  const handleStartGame = () => {
    AudioSynth.playClick();
    onComplete(clubName, selectedLogo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#111827] border border-slate-700 rounded-xl shadow-2xl p-6 lg:p-8 overflow-hidden my-8">
        <button className="min-h-11 text-cyan-300 underline mb-3" onClick={onRecover}>Nhập Recovery Code</button>
        {step === 1 ? (
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFB800]">
                Khởi Đầu Sự Nghiệp · Mùa Giải 2026
              </span>
              <h1 className="mt-3 text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
                Thành Lập Câu Lạc Bộ Của Bạn
              </h1>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                Dẫn dắt dàn tuyển thủ trẻ Việt Nam (Hiro02, Draktharr, Aress, Eddie, Elio) từ giải đấu phong trào tới ngai vàng VCS, LCP và Chung Kết Thế Giới.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">
                  Tên Câu Lạc Bộ (CLB)
                </label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-3 bg-[#090D16] border border-slate-700 focus:border-[#FFB800] rounded-lg text-white text-base font-medium focus:outline-none transition-colors"
                  placeholder="Nhập tên CLB của bạn..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">
                  Biểu Trưng Đội Tuyển
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LOGO_PRESETS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedLogo === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          AudioSynth.playClick();
                          setSelectedLogo(p.id);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#FFB800] bg-slate-800/90 ring-1 ring-[#FFB800]'
                            : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded ${p.color} flex items-center justify-center shadow mb-2`}
                        >
                          <Icon className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  AudioSynth.playClick();
                  setStep(2);
                }}
                className="w-full py-3.5 mt-4 bg-[#FFB800] hover:bg-amber-400 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
              >
                Tiếp Tục: Điểm Danh 5 Tuyển Thủ Khởi Đầu
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center max-w-xl mx-auto mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Đội Hình Học Viện Khởi Đầu (OVR 58 - 63)</span>
              </div>
              <h2 className="mt-2 text-2xl lg:text-3xl font-display font-extrabold text-white">
                Chào Mừng Đến Với {clubName}!
              </h2>
              <p className="mt-1.5 text-sm text-slate-300">
                5 tuyển thủ trẻ tài năng của VCS sẵn sàng ra sân trong trận đấu giao hữu đầu tiên.
              </p>
            </div>

            {/* 5 Starter Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 my-6">
              {starterEditions.map((edition) => (
                <PlayerCard
                  key={edition.id}
                  edition={edition}
                  isEquipped={true}
                  compact={true}
                  showActions={false}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-800">
              <div className="text-sm text-slate-300">
                <p>
                  🎁 <span className="text-white font-semibold">Phần thưởng chiến thắng:</span> 1 Gói Thẻ Tân Binh (Welcome Pack) bảo đảm tuyển thủ bậc Hiếm (Rare+) trở lên!
                </p>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#FFB800] hover:bg-amber-400 text-slate-950 font-display font-extrabold text-sm tracking-wider uppercase rounded-lg shadow-md transition-all cursor-pointer"
              >
                Bắt Đầu Trận Đấu Đầu Tiên ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
