import {
  Coins,
  Flame,
  Globe2,
  KeyRound,
  Package,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { AudioSynth } from '../lib/audioSynth';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenRecoveryModal: () => void;
  onOpenWorldDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenRecoveryModal,
  onOpenWorldDemo,
}) => {
  const { club } = useGame();
  const [muted, setMuted] = useState(AudioSynth.isMuted());

  const navLinks = [
    { id: 'hub', label: 'Tổng Quan' },
    { id: 'campaign', label: 'Chiến Dịch' },
    { id: 'lineup', label: 'Đội Hình' },
    { id: 'collection', label: 'Bộ Sưu Tập' },
    { id: 'packs', label: 'Mở Pack' },
    { id: 'training', label: 'Huấn Luyện' },
    { id: 'transfers', label: 'Chuyển Nhượng' },
    { id: 'facilities', label: 'Cơ Sở CLB' },
  ];

  const handleToggleMute = () => {
    const isNowMuted = AudioSynth.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) AudioSynth.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-0">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => onSelectTab('hub')}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap min-w-0 group"
        >
          <div className="w-8 h-8 rounded bg-[#FFB800] flex items-center justify-center text-slate-950 shadow-sm group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="hidden sm:inline text-xl font-display font-extrabold tracking-wider text-white">
            APAC RISING
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-300 overflow-x-auto py-1">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  AudioSynth.playClick();
                  onSelectTab(link.id);
                }}
                className={`transition-colors whitespace-nowrap shrink-0 pb-1 text-sm font-semibold tracking-tight cursor-pointer ${
                  isActive
                    ? 'text-[#FFB800] border-b-2 border-[#FFB800]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Wallet cluster & Primary Action */}
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          {club && (
            <div className="flex items-center gap-2 bg-[#111827] border border-slate-700 px-2 py-1.5 rounded text-xs min-w-0">
              <div
                className="flex items-center gap-1.5 text-[#FFB800] font-mono-nums font-bold text-sm"
                title="Ngân quỹ Credits"
              >
                <Coins className="w-4 h-4 text-[#FFB800]" />
                <span>{club.wallet.credits.toLocaleString()}</span>
              </div>

              <div
                className="flex items-center gap-1.5 text-blue-300 font-mono-nums font-semibold text-sm"
                title="Gói thẻ chưa mở"
              >
                <Package className="w-4 h-4 text-blue-400" />
                <span>{club.packs.length}</span>
              </div>

              <div
                className="hidden sm:flex items-center gap-1.5 text-emerald-300 font-mono-nums font-semibold text-sm"
                title="Điểm danh tiếng câu lạc bộ"
              >
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>{club.reputation}</span>
              </div>
            </div>
          )}

          {/* Quick World Championship Demo Button */}
          <button
            onClick={() => {
              AudioSynth.playClick();
              onOpenWorldDemo();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-[#FFB800] hover:bg-amber-400 rounded transition-all whitespace-nowrap shrink-0 cursor-pointer"
            title="Thử sức với trận Chung Kết Thế Giới (Bản Trình Diễn)"
          >
            <Globe2 className="w-4 h-4" />
            <span>Chung Kết TG (Demo)</span>
          </button>

          {/* Recovery Code Trigger */}
          <button
            onClick={() => {
              AudioSynth.playClick();
              onOpenRecoveryModal();
            }}
            className="p-2 min-w-11 min-h-11 text-slate-300 hover:text-white bg-[#111827] hover:bg-slate-800 border border-slate-700 rounded transition-colors cursor-pointer"
            title="Mã sao lưu / khôi phục dữ liệu"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 min-w-11 min-h-11 text-slate-300 hover:text-white bg-[#111827] hover:bg-slate-800 border border-slate-700 rounded transition-colors cursor-pointer"
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#FFB800]" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav strip for small screens */}
      <div className="flex xl:hidden items-center gap-5 text-sm font-medium text-slate-300 overflow-x-auto pt-2.5 pb-1 border-t border-slate-800 mt-2.5">
        {navLinks.map((link) => {
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => {
                AudioSynth.playClick();
                onSelectTab(link.id);
              }}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 text-xs font-semibold cursor-pointer ${
                isActive
                  ? 'text-[#FFB800] border-b-2 border-[#FFB800]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
