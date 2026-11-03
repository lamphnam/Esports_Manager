import React, { useEffect, useState } from 'react';
import { MatchCenterModal } from './components/MatchCenterModal';
import { Navbar } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { PackOpeningModal } from './components/PackOpeningModal';
import { RecoveryModal } from './components/RecoveryModal';
import { WorldDemoModal } from './components/WorldDemoModal';
import { GameProvider, useGame } from './context/GameContext';
import { CAMPAIGN_CHAPTERS } from './data/campaignData';
import { PackDrawResult } from './lib/economyEngine';
import { CampaignView } from './views/CampaignView';
import { CollectionView } from './views/CollectionView';
import { FacilitiesView } from './views/FacilitiesView';
import { HubView } from './views/HubView';
import { LineupView } from './views/LineupView';
import { PacksView } from './views/PacksView';
import { TrainingView } from './views/TrainingView';
import { TransfersView } from './views/TransfersView';

function MainApp() {
  const { club, createClub, claimChapterReward, openPack, isLoading, storageBlocked } = useGame();

  const [currentTab, setCurrentTab] = useState('hub');
  const [activeMatchChapterId, setActiveMatchChapterId] = useState<number | null>(null);
  const [openedPackResult, setOpenedPackResult] = useState<PackDrawResult | null>(null);
  const [showWorldDemo, setShowWorldDemo] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [pendingWelcome, setPendingWelcome] = useState(false);

  useEffect(() => {
    if ((pendingWelcome || club?.completedChapterIds.includes(1)) && club?.packs.some(p => p.family === 'WELCOME')) {
      const result = openPack('WELCOME');
      if (result) { setOpenedPackResult(result); setPendingWelcome(false); }
    }
  }, [pendingWelcome, club?.packs]);

  if (isLoading) return <div role="status" className="p-6 text-slate-200">Đang tải dữ liệu...</div>;

  // If first time, display onboarding modal
  if (!club) {
    return (
      <><OnboardingModal
        onRecover={() => setShowRecoveryModal(true)}
        onComplete={(name, logo) => {
          createClub(name, logo);
          // F0 requirement: automatically launch first campus match tutorial
          setActiveMatchChapterId(1);
        }}
      />{showRecoveryModal && <RecoveryModal onClose={() => setShowRecoveryModal(false)} />}</>
    );
  }

  const activeMatchChapter = activeMatchChapterId
    ? CAMPAIGN_CHAPTERS.find((c) => c.id === activeMatchChapterId) || null
    : null;

  const handleVictoryClaim = (chapterId: number) => {
    const claimed = claimChapterReward(chapterId);
    setActiveMatchChapterId(null);

    // If Chapter 1 cleared, automatically trigger Welcome Pack opening (F0 requirement)
    if (claimed && chapterId === 1) setPendingWelcome(true);
    return claimed;
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-[#FFB800] selection:text-slate-950">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenRecoveryModal={() => setShowRecoveryModal(true)}
        onOpenWorldDemo={() => setShowWorldDemo(true)}
      />

      {/* Main Screen Router */}
      {storageBlocked && <div role="alert" className="p-3 bg-amber-950 text-amber-100 text-sm">Không thể lưu trên trình duyệt này. Hãy sao lưu Recovery Code trước khi rời trang. <button className="underline min-h-11" onClick={() => setShowRecoveryModal(true)}>Mở sao lưu</button></div>}
      <main className="flex-1 pb-16">
        {currentTab === 'hub' && (
          <HubView
            onStartMatch={(chapterId) => setActiveMatchChapterId(chapterId)}
            onNavigateTab={setCurrentTab}
            onOpenWorldDemo={() => setShowWorldDemo(true)}
            onOpenPackDirect={() => setCurrentTab('packs')}
          />
        )}

        {currentTab === 'campaign' && (
          <CampaignView onStartMatch={(chapterId) => setActiveMatchChapterId(chapterId)} />
        )}

        {currentTab === 'lineup' && <LineupView />}

        {currentTab === 'collection' && <CollectionView />}

        {currentTab === 'packs' && (
          <PacksView onOpenPackSuccess={(result) => setOpenedPackResult(result)} />
        )}

        {currentTab === 'training' && <TrainingView />}

        {currentTab === 'transfers' && <TransfersView />}

        {currentTab === 'facilities' && <FacilitiesView />}
      </main>

      {/* Modals & Dialogs */}
      {activeMatchChapter && (
        <MatchCenterModal
          chapter={activeMatchChapter}
          onClose={() => setActiveMatchChapterId(null)}
          onVictoryClaim={handleVictoryClaim}
        />
      )}

      {openedPackResult && (
        <PackOpeningModal
          packResult={openedPackResult}
          onClose={() => setOpenedPackResult(null)}
        />
      )}

      {showWorldDemo && <WorldDemoModal onClose={() => setShowWorldDemo(false)} />}

      {showRecoveryModal && (
        <RecoveryModal onClose={() => setShowRecoveryModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}
