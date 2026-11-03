import { CheckCircle2, Lock, Play, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { chaptersForSeason } from '../data/season';
import { SeasonBracket } from '../components/SeasonBracket';
import { SegmentedControl } from '../components/ui';
import { AudioSynth } from '../lib/audioSynth';
import { ARCHETYPE_LABELS } from '../lib/labels';
import { OpponentRoster } from '../components/OpponentRoster';

interface CampaignViewProps {
  onStartMatch: (chapterId: number) => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({ onStartMatch }) => {
  const { club, season } = useGame();
  const [selectedAct, setSelectedAct] = useState<1 | 2 | 3>(1);
  const [view, setView] = useState<'bracket' | 'list'>('bracket');
  const chapters = chaptersForSeason(season);

  const currentChapterId = club?.currentChapterId || 1;
  const completedIds = club?.completedChapterIds || [];

  const actChapters = chapters.filter((c) => c.act === selectedAct);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Header and Act Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
            Chiến Dịch Sự Nghiệp (Career Campaign)
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Mùa {club?.careerYear ?? 2026}: từ giải phong trào sinh viên tới ngai vàng VCS, LCP và Chung Kết Thế Giới
          </p>
          <div className="mt-3">
            <SegmentedControl
              label="Cách xem chiến dịch"
              value={view}
              onChange={(next) => { AudioSynth.playClick(); setView(next); }}
              options={[{ value: 'bracket', label: 'Bracket mùa giải' }, { value: 'list', label: 'Danh sách chương' }]}
            />
          </div>
        </div>

        {/* Act Selector */}
        {view === 'list' && <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface border border-line rounded-lg">
          <button
            onClick={() => {
              AudioSynth.playClick();
              setSelectedAct(1);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
              selectedAct === 1
                ? 'bg-gold text-bg shadow'
                : 'text-fg-muted hover:text-white'
            }`}
          >
            Hồi 1: Giải Sinh Viên
          </button>

          <button
            onClick={() => {
              AudioSynth.playClick();
              setSelectedAct(2);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
              selectedAct === 2
                ? 'bg-gold text-bg shadow'
                : 'text-fg-muted hover:text-white'
            }`}
          >
            Hồi 2: Chinh Phục VCS
          </button>

          <button
            onClick={() => {
              AudioSynth.playClick();
              setSelectedAct(3);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
              selectedAct === 3
                ? 'bg-gold text-bg shadow'
                : 'text-fg-muted hover:text-white'
            }`}
          >
            Hồi 3: LCP & Worlds
          </button>
        </div>}
      </div>

      {view === 'bracket' && (
        <SeasonBracket
          chapters={chapters}
          completedIds={completedIds}
          currentChapterId={currentChapterId}
          onStart={onStartMatch}
        />
      )}

      {/* Chapter Cards List */}
      {view === 'list' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {actChapters.map((chapter) => {
          const isCompleted = completedIds.includes(chapter.id);
          const isCurrent = chapter.id === currentChapterId;
          const isLocked = chapter.id > currentChapterId && !isCompleted;

          return (
            <div
              key={chapter.id}
              className={`rounded-xl p-5 border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-surface border-gold shadow-lg'
                  : isCompleted
                  ? 'bg-surface/90 border-line'
                  : 'bg-bg border-line opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-fg-muted">
                    Chương {chapter.id} · {chapter.format}
                  </span>

                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã Vượt Qua</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-gold">
                      <Sparkles className="w-4 h-4" />
                      <span>Đang Mở</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-fg-subtle">
                      <Lock className="w-4 h-4" />
                      <span>Chưa Mở</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-display font-bold text-white mb-1">
                  {chapter.title}
                </h3>
                <span className="text-xs text-gold font-semibold block mb-2.5">
                  {chapter.subtitle}
                </span>

                <p className="text-sm text-fg-muted leading-relaxed mb-4">
                  {chapter.description}
                </p>

                {/* Opponent Preview Box */}
                <div className="p-3.5 rounded-lg bg-bg border border-line mb-4 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-fg-subtle">Đối thủ:</span>
                    <strong className="text-white text-sm">{chapter.opponent.name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-subtle">Sức mạnh OVR:</span>
                    <span className="font-mono-nums font-bold text-danger text-sm">
                      {chapter.opponent.ovr}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-subtle">Lối chơi:</span>
                    <span className="text-info font-semibold">
                      {ARCHETYPE_LABELS[chapter.opponent.archetype]}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <OpponentRoster opponent={chapter.opponent} />
                </div>

                {/* Reward Preview */}
                <div className="text-xs text-success font-semibold">
                  {isCompleted ? 'Giao hữu: không thưởng' : `Thưởng: +${chapter.milestoneRewards.credits} Credits `}
                  {!isCompleted && chapter.milestoneRewards.packs &&
                    `+ ${chapter.milestoneRewards.packs.join(', ')} Pack`}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-line">
                {isLocked ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-surface text-fg-subtle text-xs font-bold rounded-lg cursor-not-allowed"
                  >
                    Hoàn thành chương trước để mở khóa
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      AudioSynth.playClick();
                      onStartMatch(chapter.id);
                    }}
                    className={`w-full py-2.5 font-display font-extrabold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-gold hover:brightness-110 text-bg shadow'
                        : 'bg-elevated hover:bg-line text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCompleted ? 'Thi Đấu Lại (Giao Hữu)' : 'Vào Trận Đấu'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
};
