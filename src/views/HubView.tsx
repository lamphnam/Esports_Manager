import {
  ArrowRight,
  Coins,
  Globe2,
  Package,
  Play,
  Zap,
} from 'lucide-react';
import React from 'react';
import { OpponentRoster } from '../components/OpponentRoster';
import { PlayerCard } from '../components/PlayerCard';
import { ROLE_LABELS } from '../components/ui';
import { useGame } from '../context/GameContext';
import { chaptersForSeason } from '../data/season';
import { SeasonBracket, SeasonSummary } from '../components/SeasonBracket';
import { AudioSynth } from '../lib/audioSynth';
import { Role } from '../types';

interface HubViewProps {
  onStartMatch: (chapterId: number) => void;
  onNavigateTab: (tab: string) => void;
  onOpenWorldDemo: () => void;
  onOpenPackDirect: () => void;
}

interface ShortcutProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const Shortcut: React.FC<ShortcutProps> = ({ icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="panel flex w-full items-center gap-3 text-left transition-colors hover:bg-elevated"
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated text-gold">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-card font-display font-bold text-fg">{title}</span>
      <span className="block text-caption text-fg-muted">{description}</span>
    </span>
    <ArrowRight className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
  </button>
);

export const HubView: React.FC<HubViewProps> = ({
  onStartMatch,
  onNavigateTab,
  onOpenWorldDemo,
}) => {
  const { club, getTeamSnapshot, getOwnedCardWithDetails, claimSponsorship, ledger, ownedCards, season, seasonComplete, startNextSeason } = useGame();
  const chapters = chaptersForSeason(season);
  const teamSnapshot = getTeamSnapshot();

  const currentChapter =
    chapters.find((c) => c.id === club?.currentChapterId) ||
    chapters[0];

  const roles: Role[] = ['TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'];
  const alreadyCleared = !!club?.completedChapterIds.includes(currentChapter.id);
  const sponsorDisabled =
    (club?.wallet.credits || 0) >= 100 ||
    ledger.some((e) => e.id === `sponsor_${new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)}`);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 lg:px-8">
      {/* 1. Campaign objective and the primary action (or the season summary once the Worlds are won) */}
      {seasonComplete ? (
        <SeasonSummary
          year={club?.careerYear ?? 2026}
          reputation={club?.reputation ?? 0}
          teamOvr={teamSnapshot.teamOvr}
          cards={ownedCards.length}
          onNextSeason={() => { AudioSynth.playClick(); startNextSeason(); }}
        />
      ) : (
      <section className="panel !p-5 lg:!p-7" aria-labelledby="campaign-objective">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 max-w-2xl space-y-3">
            <p className="label-text">
              <span className="text-gold">Mục tiêu chiến dịch</span> · Hồi {currentChapter.act} · {currentChapter.subtitle}
            </p>
            <h1 id="campaign-objective" className="text-title lg:text-[2.25rem] font-display font-extrabold leading-tight text-fg">
              {currentChapter.title}
            </h1>
            <p className="text-body text-fg-muted">{currentChapter.description}</p>

            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 pt-1 text-label sm:grid-cols-[auto_auto_auto] sm:justify-start">
              <div>
                <dt className="text-fg-subtle">Đối thủ</dt>
                <dd className="font-semibold text-fg">
                  {currentChapter.opponent.name} <span className="font-mono-nums text-fg-muted">(OVR {currentChapter.opponent.ovr})</span>
                </dd>
              </div>
              <div>
                <dt className="text-fg-subtle">Thể thức</dt>
                <dd className="font-semibold text-fg">{currentChapter.format}</dd>
              </div>
              <div>
                <dt className="text-fg-subtle">Thưởng</dt>
                <dd className="font-mono-nums font-semibold text-success">
                  {alreadyCleared ? 'Giao hữu: không thưởng' : `+${currentChapter.milestoneRewards.credits} Credits`}
                </dd>
              </div>
            </dl>
            <div className="max-w-md pt-1">
              <OpponentRoster opponent={currentChapter.opponent} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              AudioSynth.playClick();
              onStartMatch(currentChapter.id);
            }}
            className="btn btn-primary btn-lg w-full shrink-0 lg:w-auto lg:min-w-48"
          >
            <Play className="h-5 w-5 shrink-0 fill-current" />
            <span>Thi Đấu Ngay</span>
          </button>
        </div>
      </section>
      )}

      {/* The season as brackets, so the whole run is visible, not only the next match */}
      <section className="space-y-3" aria-labelledby="season-journey">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="season-journey" className="text-heading font-display font-bold text-fg">
            Hành trình mùa {club?.careerYear ?? 2026}
          </h2>
          <button type="button" className="btn btn-ghost !px-2 text-gold hover:text-gold" onClick={() => onNavigateTab('campaign')}>
            <span>Xem chi tiết</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <SeasonBracket
          compact
          chapters={chapters}
          completedIds={club?.completedChapterIds ?? []}
          currentChapterId={club?.currentChapterId ?? 1}
          onStart={onStartMatch}
        />
      </section>

      {/* 2. Main roster */}
      <section className="space-y-4" aria-labelledby="main-roster">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h2 id="main-roster" className="text-heading font-display font-bold text-fg">
              Đội Hình Chính (5 Tuyển Thủ)
            </h2>
            <p className="mt-0.5 text-label text-fg-muted">
              Tổng sức mạnh <span className="font-mono-nums font-semibold text-gold">OVR {teamSnapshot.teamOvr}</span>
              {' · '}Điểm gắn kết <span className="font-mono-nums font-semibold text-success">+{teamSnapshot.synergyBonus}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('lineup')}
            className="btn btn-ghost !px-2 text-gold hover:text-gold"
          >
            <span>Quản Lý Đội Hình</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {roles.map((role) => {
            const cardId = club?.lineup[role];
            const details = cardId ? getOwnedCardWithDetails(cardId) : null;

            if (!details) {
              return (
                <div
                  key={role}
                  className="panel flex min-h-[200px] flex-col items-center justify-center border-dashed text-center"
                >
                  <span className="label-text mb-1" title={ROLE_LABELS[role].full}>{ROLE_LABELS[role].name}</span>
                  <span className="text-caption text-fg-muted">Vị trí trống</span>
                </div>
              );
            }

            return (
              <PlayerCard
                key={role}
                edition={details.edition}
                player={details.player}
                ownedCard={details.owned}
                isEquipped={false}
                compact={false}
                onClick={() => onNavigateTab('lineup')}
                showActions={false}
              />
            );
          })}
        </div>
      </section>

      {/* 3. Secondary activities and resources */}
      <section className="space-y-3" aria-labelledby="more-activities">
        <h2 id="more-activities" className="label-text">Hoạt động khác</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Shortcut
            icon={<Package className="h-5 w-5" />}
            title="Kho Gói Thẻ"
            description={club?.packs.length ? `${club.packs.length} gói sẵn sàng mở` : 'Chiêu mộ thêm tuyển thủ mới'}
            onClick={() => onNavigateTab('packs')}
          />
          <Shortcut
            icon={<Zap className="h-5 w-5" />}
            title="Phòng Huấn Luyện"
            description="Nâng cấp chỉ số cá nhân tuyển thủ"
            onClick={() => onNavigateTab('training')}
          />
          <Shortcut
            icon={<Coins className="h-5 w-5" />}
            title="Thị Trường Chuyển Nhượng"
            description="Ký hợp đồng trực tiếp tuyển thủ VCS & LCP"
            onClick={() => onNavigateTab('transfers')}
          />
          <Shortcut
            icon={<Globe2 className="h-5 w-5" />}
            title="Chung Kết Thế Giới (Demo BO5)"
            description="T1 2024 đối đầu Bilibili Gaming 2024, khoảng 3 phút. Tiến trình sự nghiệp được giữ riêng."
            onClick={onOpenWorldDemo}
          />
        </div>

        <div className="panel-inset flex flex-col gap-2 p-3 text-label text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0">
            Giao hữu và thử lại luôn miễn phí. Khi còn dưới 100 Credits, nhận tài trợ phục hồi 100 Credits, tối đa một lần mỗi ngày (giờ Việt Nam).
          </p>
          <button
            type="button"
            className="btn btn-secondary shrink-0"
            onClick={claimSponsorship}
            disabled={sponsorDisabled}
          >
            Nhận Tài Trợ Phục Hồi
          </button>
        </div>
      </section>
    </div>
  );
};
