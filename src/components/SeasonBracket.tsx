import { ArrowRight, CheckCircle2, Lock, Trophy } from 'lucide-react';
import React from 'react';
import { COMPETITIONS } from '../data/season';
import { Chapter } from '../types';

interface BracketProps {
  chapters: Chapter[];
  completedIds: number[];
  currentChapterId: number;
  onStart: (chapterId: number) => void;
  /** Hub variant: no blurbs, smaller nodes. */
  compact?: boolean;
}

type Status = 'done' | 'current' | 'locked';

const STATUS_TEXT: Record<Status, string> = { done: 'Đã vượt qua', current: 'Đang diễn ra', locked: 'Chưa mở' };

/**
 * The season as brackets: one block per competition, stages left to right (top to bottom on phones).
 * A stage is one series. The current stage can be played; cleared stages can be replayed as friendlies.
 */
export const SeasonBracket: React.FC<BracketProps> = ({ chapters, completedIds, currentChapterId, onStart, compact = false }) => {
  const statusOf = (id: number): Status => (completedIds.includes(id) ? 'done' : id === currentChapterId ? 'current' : 'locked');

  return (
    <div className={`grid gap-3 ${compact ? 'lg:grid-cols-2' : 'xl:grid-cols-2'}`}>
      {COMPETITIONS.map((competition) => {
        const stages = competition.stages.map((stage) => ({ ...stage, chapter: chapters.find((c) => c.id === stage.chapterId)!, status: statusOf(stage.chapterId) }));
        const allDone = stages.every((s) => s.status === 'done');
        const active = stages.some((s) => s.status === 'current');
        const heading = `bracket-${competition.id}`;
        return (
          <section key={competition.id} aria-labelledby={heading} className={`panel min-w-0 ${active ? '!border-gold/50' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 id={heading} className="flex items-center gap-2 font-display text-card font-bold text-fg">
                  {competition.id === 'worlds' && <Trophy className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />}
                  <span className="[overflow-wrap:anywhere]">{competition.name}</span>
                </h3>
                {!compact && <p className="mt-0.5 text-caption text-fg-muted">{competition.blurb}</p>}
              </div>
              <span className={`badge ${allDone ? 'badge-success' : active ? 'badge-gold' : ''}`}>
                {allDone ? 'Hoàn thành' : active ? 'Đang diễn ra' : 'Chưa mở'}
              </span>
            </div>

            <ol className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-stretch sm:gap-0">
              {stages.map((stage, index) => {
                const { chapter, status } = stage;
                const isLocked = status === 'locked';
                const border = status === 'current' ? 'border-gold/60 bg-gold/10' : status === 'done' ? 'border-success/40 bg-success/5' : 'border-line bg-bg opacity-70';
                return (
                  <React.Fragment key={stage.chapterId}>
                    {index > 0 && (
                      <li aria-hidden="true" className="flex items-center justify-center sm:px-1">
                        <span className="h-3 w-px bg-line sm:h-px sm:w-4" />
                      </li>
                    )}
                    <li className="min-w-0 flex-1">
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => onStart(chapter.id)}
                        aria-label={`${competition.name}, ${stage.label}, chương ${chapter.id}: ${STATUS_TEXT[status]}. Đối thủ ${chapter.opponent.name}, ${chapter.format}`}
                        className={`flex h-full w-full min-w-0 flex-col gap-1 rounded-lg border p-3 text-left transition-colors enabled:hover:border-fg-subtle disabled:cursor-not-allowed ${border}`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="label-text">{stage.label}</span>
                          {status === 'done' && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />}
                          {status === 'locked' && <Lock className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />}
                          {status === 'current' && <ArrowRight className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />}
                        </span>
                        <span className="text-label font-semibold text-fg [overflow-wrap:anywhere]">
                          {chapter.opponent.name}
                          {chapter.opponent.isFinalBoss && <span className="badge badge-danger ml-2 align-middle">Trùm cuối</span>}
                        </span>
                        <span className="flex flex-wrap items-center gap-x-2 text-caption text-fg-muted">
                          <span className="font-mono-nums">{chapter.format}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-nums">OVR {chapter.opponent.ovr}</span>
                          <span aria-hidden="true">·</span>
                          <span>Chương {chapter.id}</span>
                        </span>
                        <span className={`text-caption font-semibold ${status === 'current' ? 'text-gold' : status === 'done' ? 'text-success' : 'text-fg-subtle'}`}>
                          {status === 'current' ? 'Thi đấu ngay' : status === 'done' ? 'Đấu lại (giao hữu)' : STATUS_TEXT.locked}
                        </span>
                      </button>
                    </li>
                  </React.Fragment>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
};

interface SummaryProps {
  year: number;
  reputation: number;
  teamOvr: number;
  cards: number;
  onNextSeason: () => void;
}

/** Shown on the Hub once the Worlds final is won. */
export const SeasonSummary: React.FC<SummaryProps> = ({ year, reputation, teamOvr, cards, onNextSeason }) => (
  <section className="panel !border-gold/50 !p-5 lg:!p-7" aria-labelledby="season-complete">
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
      <div className="min-w-0 max-w-2xl space-y-3">
        <p className="label-text">
          <span className="text-gold">Mùa {year} hoàn tất</span> · Chung Kết Thế Giới
        </p>
        <h1 id="season-complete" className="flex items-center gap-3 font-display text-title font-extrabold leading-tight text-fg lg:text-[2.25rem]">
          <Trophy className="h-8 w-8 shrink-0 text-gold" aria-hidden="true" />
          <span>Vô địch thế giới {year}!</span>
        </h1>
        <p className="text-body text-fg-muted">
          Câu lạc bộ của bạn đã đi từ giải sinh viên tới ngai vàng Worlds. Bước sang mùa {year + 1}: bạn giữ nguyên đội hình, thẻ và ví, nhận khoản tài trợ khởi đầu, còn các đối thủ chuyên nghiệp đã mạnh hơn.
        </p>
        <dl className="grid grid-cols-3 gap-x-6 text-label sm:max-w-md">
          <div><dt className="text-fg-subtle">Sức mạnh đội</dt><dd className="font-mono-nums font-semibold text-gold">OVR {teamOvr}</dd></div>
          <div><dt className="text-fg-subtle">Danh tiếng</dt><dd className="font-mono-nums font-semibold text-success">{reputation}</dd></div>
          <div><dt className="text-fg-subtle">Số thẻ</dt><dd className="font-mono-nums font-semibold text-fg">{cards}</dd></div>
        </dl>
      </div>
      <button type="button" onClick={onNextSeason} className="btn btn-primary btn-lg w-full shrink-0 lg:w-auto lg:min-w-56">
        <span>Bước sang mùa {year + 1}</span>
        <ArrowRight className="h-5 w-5 shrink-0" />
      </button>
    </div>
  </section>
);
