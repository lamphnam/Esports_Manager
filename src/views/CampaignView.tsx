import { CheckCircle2, Lock, Play, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CAMPAIGN_CHAPTERS } from '../data/campaignData';
import { AudioSynth } from '../lib/audioSynth';

interface CampaignViewProps {
  onStartMatch: (chapterId: number) => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({ onStartMatch }) => {
  const { club } = useGame();
  const [selectedAct, setSelectedAct] = useState<1 | 2 | 3>(1);

  const currentChapterId = club?.currentChapterId || 1;
  const completedIds = club?.completedChapterIds || [];

  const actChapters = CAMPAIGN_CHAPTERS.filter((c) => c.act === selectedAct);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Header and Act Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white">
            Chiến Dịch Sự Nghiệp (Career Campaign)
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Hành trình 3 Hồi / 12 Chương: Từ giải phong trào sinh viên tới ngai vàng VCS, LCP và Chung Kết Thế Giới
          </p>
        </div>

        {/* Act Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-[#111827] border border-slate-700 rounded-lg">
          <button
            onClick={() => {
              AudioSynth.playClick();
              setSelectedAct(1);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
              selectedAct === 1
                ? 'bg-[#FFB800] text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
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
                ? 'bg-[#FFB800] text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
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
                ? 'bg-[#FFB800] text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Hồi 3: LCP & Worlds
          </button>
        </div>
      </div>

      {/* Chapter Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {actChapters.map((chapter) => {
          const isCompleted = completedIds.includes(chapter.id);
          const isCurrent = chapter.id === currentChapterId;
          const isLocked = chapter.id > currentChapterId && !isCompleted;

          return (
            <div
              key={chapter.id}
              className={`rounded-xl p-5 border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-[#111827] border-[#FFB800] shadow-lg'
                  : isCompleted
                  ? 'bg-[#111827]/90 border-slate-700'
                  : 'bg-[#090D16] border-slate-800 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Chương {chapter.id} · {chapter.format}
                  </span>

                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã Vượt Qua</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#FFB800]">
                      <Sparkles className="w-4 h-4" />
                      <span>Đang Mở</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                      <Lock className="w-4 h-4" />
                      <span>Chưa Mở</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-display font-bold text-white mb-1">
                  {chapter.title}
                </h3>
                <span className="text-xs text-[#FFB800] font-semibold block mb-2.5">
                  {chapter.subtitle}
                </span>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {chapter.description}
                </p>

                {/* Opponent Preview Box */}
                <div className="p-3.5 rounded-lg bg-[#090D16] border border-slate-800 mb-4 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Đối thủ:</span>
                    <strong className="text-white text-sm">{chapter.opponent.name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Sức mạnh OVR:</span>
                    <span className="font-mono-nums font-bold text-rose-400 text-sm">
                      {chapter.opponent.ovr}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Lối chơi:</span>
                    <span className="text-blue-400 font-semibold">
                      {chapter.opponent.archetype}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800/80 text-slate-300 flex flex-wrap gap-1.5">
                    {chapter.opponent.rosterPreview.map((p, idx) => (
                      <React.Fragment key={p.role}>
                        {idx > 0 && <span aria-hidden="true" className="text-slate-600">·</span>}
                        <span>{p.displayName}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Reward Preview */}
                <div className="text-xs text-emerald-400 font-semibold">
                  🎁 Thưởng: +{chapter.milestoneRewards.credits} Credits{' '}
                  {chapter.milestoneRewards.packs &&
                    `+ ${chapter.milestoneRewards.packs.join(', ')} Pack`}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                {isLocked ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-900 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed"
                  >
                    Hoàn thành chương trước để mở khóa
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      AudioSynth.playClick();
                      onStartMatch(chapter.id);
                    }}
                    className={`w-full py-2.5 font-display font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#FFB800] hover:bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
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
      </div>
    </div>
  );
};
