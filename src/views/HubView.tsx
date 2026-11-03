import {
  ArrowRight,
  Coins,
  Globe2,
  Package,
  Play,
  Zap,
} from 'lucide-react';
import React from 'react';
import { PlayerCard } from '../components/PlayerCard';
import { useGame } from '../context/GameContext';
import { CAMPAIGN_CHAPTERS } from '../data/campaignData';
import { AudioSynth } from '../lib/audioSynth';
import { Role } from '../types';

interface HubViewProps {
  onStartMatch: (chapterId: number) => void;
  onNavigateTab: (tab: string) => void;
  onOpenWorldDemo: () => void;
  onOpenPackDirect: () => void;
}

export const HubView: React.FC<HubViewProps> = ({
  onStartMatch,
  onNavigateTab,
  onOpenWorldDemo,
}) => {
  const { club, getTeamSnapshot, getOwnedCardWithDetails } = useGame();
  const teamSnapshot = getTeamSnapshot();

  const currentChapter =
    CAMPAIGN_CHAPTERS.find((c) => c.id === club?.currentChapterId) ||
    CAMPAIGN_CHAPTERS[0];

  const roles: Role[] = ['TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero Campaign Spotlight Banner - Crisp Industrial */}
      <div className="relative overflow-hidden rounded-xl bg-[#111827] border border-slate-700 p-6 lg:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFB800]">
              <span>Mục Tiêu Chiến Dịch · Hồi {currentChapter.act}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300 font-medium normal-case">
                {currentChapter.subtitle}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
              {currentChapter.title}
            </h1>

            <p className="text-sm lg:text-base text-slate-200 leading-relaxed">
              {currentChapter.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-slate-300">
              <div>
                Đối thủ:{' '}
                <strong className="text-white">
                  {currentChapter.opponent.name} (OVR {currentChapter.opponent.ovr})
                </strong>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                Thể thức: <strong className="text-[#FFB800]">{currentChapter.format}</strong>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                Thưởng:{' '}
                <strong className="text-emerald-400 font-mono-nums">
                  +{currentChapter.milestoneRewards.credits} Credits
                </strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => {
                AudioSynth.playClick();
                onStartMatch(currentChapter.id);
              }}
              className="px-8 py-4 bg-[#FFB800] hover:bg-amber-400 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Thi Đấu Ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick World Championship Demo Card (Spec v2.2 P1 requirement) */}
      <div className="p-5 rounded-xl bg-[#0D1322] border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-amber-500/15 text-[#FFB800] border border-amber-500/40 flex items-center justify-center shrink-0">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-white text-lg">
                Chung Kết Thế Giới (Bản Trình Diễn)
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#FFB800] text-slate-950 rounded">
                DEMO BO5
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-0.5">
              Trải nghiệm trận Chung kết Thế giới trong ~3 phút với đội hình siêu sao VCS & APAC (Kiaya, SofM, Maple, Artemis, Bie) đại chiến Siêu Đội Hình LCK!
            </p>
          </div>
        </div>

        <button
          onClick={onOpenWorldDemo}
          className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-500 text-white font-display font-bold text-xs uppercase tracking-wider rounded-lg shadow shrink-0 cursor-pointer transition-all"
        >
          Thử Nghiệm Ngay ➔
        </button>
      </div>

      {/* Starting 5 Lineup Roster Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-white">
              Đội Hình Chính (5 Tuyển Thủ)
            </h2>
            <p className="text-sm text-slate-300 mt-0.5">
              Tổng Sức Mạnh Đội Tuyển:{' '}
              <strong className="text-[#FFB800] font-mono-nums">
                OVR {teamSnapshot.teamOvr}
              </strong>{' '}
              · Điểm Gắn Kết:{' '}
              <strong className="text-emerald-400 font-mono-nums">
                +{teamSnapshot.synergyBonus}
              </strong>
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('lineup')}
            className="text-sm font-semibold text-[#FFB800] hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Quản Lý Đội Hình</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 lg:gap-4">
          {roles.map((role) => {
            const cardId = club?.lineup[role];
            const details = cardId ? getOwnedCardWithDetails(cardId) : null;

            if (!details) {
              return (
                <div
                  key={role}
                  className="rounded-lg border border-dashed border-slate-700 p-4 flex flex-col items-center justify-center min-h-[220px] bg-[#111827] text-center"
                >
                  <span className="text-xs font-bold text-slate-400 mb-1">{role}</span>
                  <span className="text-xs text-slate-300">Vị trí trống</span>
                </div>
              );
            }

            return (
              <PlayerCard
                key={role}
                edition={details.edition}
                player={details.player}
                ownedCard={details.owned}
                isEquipped={true}
                compact={false}
                onClick={() => onNavigateTab('lineup')}
                showActions={false}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Packs Inventory */}
        <div
          onClick={() => onNavigateTab('packs')}
          className="p-5 rounded-xl bg-[#111827] hover:bg-[#172033] border border-slate-700 cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#2563EB]/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-base">Kho Gói Thẻ</h4>
              <p className="text-xs text-slate-300">
                {club?.packs.length ? `${club.packs.length} gói sẵn sàng mở` : 'Chiêu mộ thêm tuyển thủ mới'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Training */}
        <div
          onClick={() => onNavigateTab('training')}
          className="p-5 rounded-xl bg-[#111827] hover:bg-[#172033] border border-slate-700 cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#FFB800]/20 text-[#FFB800] border border-amber-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-base">Phòng Huấn Luyện</h4>
              <p className="text-xs text-slate-300">Nâng cấp chỉ số cá nhân tuyển thủ</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Transfer Market */}
        <div
          onClick={() => onNavigateTab('transfers')}
          className="p-5 rounded-xl bg-[#111827] hover:bg-[#172033] border border-slate-700 cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-base">Thị Trường Chuyển Nhượng</h4>
              <p className="text-xs text-slate-300">Ký hợp đồng trực tiếp tuyển thủ VCS & LCP</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
