import confetti from 'canvas-confetti';
import { ArrowRight, Check, Sparkles, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { getPlayerById } from '../data/cardCatalog';
import { AudioSynth } from '../lib/audioSynth';
import { PackDrawResult } from '../lib/economyEngine';
import { Role } from '../types';
import { PlayerCard, RARITY_CONFIG } from './PlayerCard';
import {useDialog} from '../lib/useDialog';

interface PackOpeningModalProps {
  packResult: PackDrawResult;
  onClose: () => void;
}

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
  packResult,
  onClose,
}) => {
  const { club, equipCard, getOwnedCardWithDetails } = useGame();
  const dialog=useDialog(onClose);
  const [animationStage, setAnimationStage] = useState<'SILHOUETTE' | 'BLOOM' | 'REVEALED'>('SILHOUETTE');
  const [isEquipped, setIsEquipped] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const revealed = useRef(false);
  const cancelTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const { edition, ownedCard, wasPityTriggered } = packResult;
  const player = getPlayerById(edition.playerId);
  const rarityConfig = RARITY_CONFIG[edition.rarity];

  // Current equipped card in this role for comparison
  const role = player?.primaryRole as Role;
  const currentCardId = club?.lineup[role];
  const currentEquippedDetails = currentCardId ? getOwnedCardWithDetails(currentCardId) : null;
  const ovrDelta = currentEquippedDetails
    ? edition.baseOvr - currentEquippedDetails.effectiveOvr
    : edition.baseOvr - 60;

  useEffect(() => {
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){handleSkip();return;}
    // Stage 1: Silhouette (0 - 800ms)
    const t1 = setTimeout(() => {
      if (revealed.current) return;
      setAnimationStage('BLOOM');
      AudioSynth.playCardReveal(edition.rarity);
    }, 800);

    // Stage 2: Bloom to Revealed (800ms - 2000ms)
    const t2 = setTimeout(() => {
      if (revealed.current) return;
      revealed.current = true;
      setAnimationStage('REVEALED');
      if (edition.rarity === 'LEGENDARY' || edition.rarity === 'EPIC') {
        confetti({
          disableForReducedMotion:true,
          particleCount: edition.rarity === 'LEGENDARY' ? 80 : 45,
          spread: 70,
          origin: { y: 0.6 },
          colors:
            edition.rarity === 'LEGENDARY'
              ? ['#FFB800', '#FDE047', '#FFFFFF']
              : ['#E11D48', '#2563EB', '#FFFFFF'],
        });
      }
    }, 2000);
    timers.current = [t1,t2];

    return () => {
      cancelTimers();
    };
  }, [edition.rarity]);

  const handleSkip = () => {
    if (revealed.current) return;
    revealed.current = true;
    cancelTimers();
    setAnimationStage('REVEALED');
    AudioSynth.playCardReveal(edition.rarity);
    if (edition.rarity === 'LEGENDARY' || edition.rarity === 'EPIC') {
      confetti({
        disableForReducedMotion:true,
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFB800', '#E11D48', '#2563EB'],
      });
    }
  };

  const handleEquipNow = () => {
    if (!role) return;
    const success = equipCard(role, ownedCard.instanceId);
    if (success) {
      setIsEquipped(true);
      AudioSynth.playVictory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-md p-4">
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="Mở Thẻ Tuyển Thủ" tabIndex={-1} className="relative w-full max-w-lg max-h-[90dvh] bg-surface border border-line rounded-xl shadow-2xl p-6 overflow-y-auto flex flex-col items-center">
        {/* Skip button available during reveal */}
        {animationStage !== 'REVEALED' && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 px-3 py-1.5 text-xs font-bold text-fg hover:text-white bg-elevated hover:bg-line border border-line rounded transition-colors z-20 cursor-pointer"
          >
            Bỏ qua hiệu ứng ➔
          </button>
        )}

        {/* Close Button once revealed */}
        {animationStage === 'REVEALED' && (
          <button
            aria-label="Đóng mở thẻ"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-fg-subtle hover:text-white bg-elevated border border-line rounded transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header indicator */}
        <div className="text-center mb-5">
          <span className="badge" style={{ color: rarityConfig.accent, borderColor: `${rarityConfig.accent}66` }}>
            {animationStage === 'REVEALED' ? `Bậc ${rarityConfig.label}` : 'Đang Mở Thẻ Tuyển Thủ...'}
          </span>
          {wasPityTriggered && animationStage === 'REVEALED' && (
            <div className="mt-1.5 flex items-center justify-center gap-1 text-xs text-gold font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bảo Hiểm Pity Kích Hoạt (Bảo đảm Sử Thi+)</span>
            </div>
          )}
        </div>

        {/* Center Card Stage */}
        <div className="relative min-h-[340px] w-full flex items-center justify-center my-2">
          {animationStage === 'SILHOUETTE' && (
            <div className="w-56 h-80 rounded-lg bg-bg border border-line flex flex-col items-center justify-center animate-pulse">
              <div className="w-20 h-20 rounded-lg bg-elevated mb-4" />
              <div className="w-32 h-4 bg-elevated rounded mb-2" />
              <div className="w-20 h-3 bg-elevated rounded" />
            </div>
          )}

          {animationStage === 'BLOOM' && (
            <div
              className="w-60 h-84 rounded-lg border-2 flex flex-col items-center justify-center scale-105 transition-transform duration-500 shadow-2xl"
              style={{
                boxShadow: `0 0 50px ${rarityConfig.accent}55`,
                borderColor: rarityConfig.accent,
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <Sparkles className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          {animationStage === 'REVEALED' && (
            <div className="w-64 max-w-full transform transition-all duration-300 scale-100">
              <PlayerCard
                edition={edition}
                player={player}
                ownedCard={ownedCard}
                isEquipped={isEquipped}
                showActions={false}
              />
            </div>
          )}
        </div>

        {/* Comparison and Action footer */}
        {animationStage === 'REVEALED' && (
          <div className="w-full mt-4 pt-4 border-t border-line flex flex-col gap-3">
            {currentEquippedDetails && (
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-bg border border-line rounded text-sm">
                <span className="text-fg-muted">
                  So với <strong className="text-white">{currentEquippedDetails.player.displayName}</strong> ({role}):
                </span>
                <span
                  className={`font-mono-nums font-bold ${
                    ovrDelta > 0
                      ? 'text-success'
                      : ovrDelta < 0
                      ? 'text-danger'
                      : 'text-fg-muted'
                  }`}
                >
                  {ovrDelta > 0 ? `+${ovrDelta} OVR` : `${ovrDelta} OVR`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleEquipNow}
                disabled={isEquipped}
                className={`flex-1 py-3 px-4 font-display font-extrabold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  isEquipped
                    ? 'bg-success text-bg cursor-default'
                    : 'bg-gold hover:brightness-110 text-bg shadow-md cursor-pointer'
                }`}
              >
                {isEquipped ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã Vào Đội Hình Chính</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Trang Bị Vào Đội Hình ({role})</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="py-3 px-5 bg-elevated hover:bg-line border border-line text-fg font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cất Vào Kho
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
