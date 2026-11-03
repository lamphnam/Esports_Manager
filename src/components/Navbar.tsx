import {
  Coins,
  Flame,
  Globe2,
  KeyRound,
  Menu,
  Package,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { AudioSynth } from '../lib/audioSynth';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenRecoveryModal: () => void;
  onOpenWorldDemo: () => void;
}

const NAV_LINKS = [
  { id: 'hub', label: 'Tổng Quan' },
  { id: 'campaign', label: 'Chiến Dịch' },
  { id: 'lineup', label: 'Đội Hình' },
  { id: 'collection', label: 'Bộ Sưu Tập' },
  { id: 'packs', label: 'Mở Pack' },
  { id: 'training', label: 'Huấn Luyện' },
  { id: 'transfers', label: 'Chuyển Nhượng' },
  { id: 'facilities', label: 'Cơ Sở CLB' },
];

const DEMO_LABEL = 'Chung Kết Thế Giới (Demo)';

/*
 * Layout by width:
 *  < md     logo, wallet, backup, menu button (full list + secondary actions in the menu sheet)
 *  >= md    top bar + a tab strip row under it (local horizontal scroll only if it cannot fit)
 * The tab strip is never inlined into the top bar: the content column is capped at max-w-7xl, so on
 * very wide screens an inline list would squeeze the wallet instead of gaining room.
 */
export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenRecoveryModal,
  onOpenWorldDemo,
}) => {
  const { club, backup } = useGame();
  const [muted, setMuted] = useState(AudioSynth.isMuted());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleToggleMute = () => {
    const isNowMuted = AudioSynth.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) AudioSynth.playClick();
  };

  const select = (id: string) => {
    AudioSynth.playClick();
    setMenuOpen(false);
    onSelectTab(id);
  };

  const openDemo = () => {
    AudioSynth.playClick();
    setMenuOpen(false);
    onOpenWorldDemo();
  };

  const tabClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-label font-semibold transition-colors cursor-pointer ${
      active ? 'text-gold bg-gold/10' : 'text-fg-muted hover:text-fg hover:bg-elevated'
    }`;

  const links = (
    <>
      {NAV_LINKS.map((link) => (
        <button
          key={link.id}
          type="button"
          onClick={() => select(link.id)}
          aria-current={currentTab === link.id ? 'page' : undefined}
          className={tabClass(currentTab === link.id)}
        >
          {link.label}
        </button>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-2 px-4 py-2 lg:px-8">
        <button
          type="button"
          onClick={() => select('hub')}
          className="group flex shrink-0 items-center gap-2"
          aria-label="APAC Rising: về Tổng Quan"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-bg">
            <Trophy className="h-4 w-4 stroke-[2.5]" />
          </span>
          <span className="hidden whitespace-nowrap font-display text-heading font-extrabold tracking-wide text-fg sm:inline">
            APAC RISING
          </span>
        </button>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          {club && (
            <div className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg border border-line bg-surface px-2.5 text-label">
              <span className="flex items-center gap-1.5 font-mono-nums font-bold text-gold" title="Ngân quỹ Credits" aria-label={`Credits: ${club.wallet.credits.toLocaleString()}`}>
                <Coins className="h-4 w-4 shrink-0" />
                <span>{club.wallet.credits.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono-nums font-semibold text-info" title="Gói thẻ chưa mở" aria-label={`Gói thẻ chưa mở: ${club.packs.length}`}>
                <Package className="h-4 w-4 shrink-0" />
                <span>{club.packs.length}</span>
              </span>
              <span className="hidden items-center gap-1.5 font-mono-nums font-semibold text-success md:flex" title="Điểm danh tiếng câu lạc bộ" aria-label={`Danh tiếng: ${club.reputation}`}>
                <Flame className="h-4 w-4 shrink-0" />
                <span>{club.reputation}</span>
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={openDemo}
            className="btn btn-primary hidden shrink-0 sm:inline-flex"
            title="Thử sức với trận Chung Kết Thế Giới (Bản Trình Diễn)"
            aria-label={DEMO_LABEL}
          >
            <Globe2 className="h-4 w-4" />
            <span className="hidden lg:inline whitespace-nowrap">Chung Kết TG (Demo)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioSynth.playClick();
              onOpenRecoveryModal();
            }}
            className="btn btn-secondary relative shrink-0"
            title="Mã sao lưu / khôi phục dữ liệu"
            aria-label={backup.dirty ? 'Sao lưu: có tiến trình chưa sao lưu' : 'Sao lưu và khôi phục dữ liệu'}
          >
            <KeyRound className="h-4 w-4" />
            <span className="hidden whitespace-nowrap xl:inline">Sao lưu</span>
            {backup.dirty && <span aria-hidden="true" className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-bg bg-gold" />}
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className="btn btn-secondary hidden shrink-0 sm:inline-flex"
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            aria-pressed={muted}
          >
            {muted ? <VolumeX className="h-4 w-4 text-danger" /> : <Volume2 className="h-4 w-4 text-gold" />}
          </button>

          <button
            ref={menuButton}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="btn btn-secondary shrink-0 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <nav aria-label="Điều hướng chính (thanh tab)" className="hidden border-t border-line md:block">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5 lg:px-8">{links}</div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-surface px-4 py-3 md:hidden">
          <nav aria-label="Điều hướng chính (menu)" className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => select(link.id)}
                aria-current={currentTab === link.id ? 'page' : undefined}
                className={`rounded-lg border px-3 text-left text-label font-semibold ${
                  currentTab === link.id ? 'border-gold/50 bg-gold/10 text-gold' : 'border-line bg-elevated text-fg'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            <button type="button" onClick={openDemo} className="btn btn-primary flex-1">
              <Globe2 className="h-4 w-4" />
              <span>{DEMO_LABEL}</span>
            </button>
            <button type="button" onClick={handleToggleMute} className="btn btn-secondary flex-1" aria-pressed={muted}>
              {muted ? <VolumeX className="h-4 w-4 text-danger" /> : <Volume2 className="h-4 w-4 text-gold" />}
              <span>{muted ? 'Bật âm thanh' : 'Tắt âm thanh'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
