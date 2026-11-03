import React, { useEffect, useState } from 'react';
import { MatchCenterModal } from './components/MatchCenterModal';
import { Navbar } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { PackOpeningModal } from './components/PackOpeningModal';
import { RecoveryModal } from './components/RecoveryModal';
import { WorldDemoModal } from './components/WorldDemoModal';
import {LegacyDraftModal} from './components/LegacyDraftModal';
import {FEATURE_GOLDEN_ROAD} from './data/featureFlags';
import { GameProvider, useGame } from './context/GameContext';
import { CAMPAIGN_CHAPTERS } from './data/campaignData';
import { PackDrawResult } from './lib/economyEngine';
import {getEditionById} from './data/cardCatalog';
import { CampaignView } from './views/CampaignView';
import { CollectionView } from './views/CollectionView';
import { FacilitiesView } from './views/FacilitiesView';
import { HubView } from './views/HubView';
import { LineupView } from './views/LineupView';
import { PacksView } from './views/PacksView';
import { TrainingView } from './views/TrainingView';
import { TransfersView } from './views/TransfersView';

function MainApp() {
  const { club, createClub, claimChapterReward, openPack, isLoading, storageBlocked, claimDraftReward, activeMatch, saveActiveMatch, pendingReveal,clearPackReveal,ownedCards,backup } = useGame();

  const [currentTab, setCurrentTab] = useState('hub');
  const [activeMatchChapterId, setActiveMatchChapterId] = useState<number | null>(null);
  const [openedPackResult, setOpenedPackResult] = useState<PackDrawResult | null>(null);
  const [showWorldDemo, setShowWorldDemo] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [pendingWelcome, setPendingWelcome] = useState(false);
  const [showDraft,setShowDraft]=useState(false);

  useEffect(() => {
    if ((pendingWelcome || club?.completedChapterIds.includes(1)) && club?.packs.some(p => p.family === 'WELCOME')) {
      const result = openPack('WELCOME');
      if (result) { setOpenedPackResult(result); setPendingWelcome(false); }
    }
  }, [pendingWelcome, club?.packs]);
  useEffect(()=>{if(!isLoading&&activeMatch)setActiveMatchChapterId(activeMatch.chapterId);},[isLoading,activeMatch?.chapterId]);
  useEffect(()=>{
    if(!pendingReveal)return;
    const owned=ownedCards.find(card=>card.instanceId===pendingReveal.instanceId),edition=owned?getEditionById(owned.editionId):null;
    if(owned&&edition)setOpenedPackResult({ownedCard:owned,edition,wasPityTriggered:pendingReveal.wasPityTriggered,newPityMisses:club?.scoutPityMisses || 0});
  },[pendingReveal?.instanceId,isLoading]);

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
    saveActiveMatch(null);
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
      {backup.nudge && <div role="status" className="p-3 bg-slate-900 border-b border-amber-500/60 text-slate-100 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">Tiến trình mới chưa được sao lưu. Save nằm trên thiết bị này và có thể mất khi trình duyệt xóa dữ liệu.<button className="underline min-h-11 text-amber-300" onClick={() => { backup.dismissNudge(); setShowRecoveryModal(true); }}>Sao lưu ngay</button><button className="min-h-11 text-slate-300" onClick={backup.dismissNudge}>Để sau</button></div>}
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
      <footer className="px-4 py-5 border-t border-slate-800 text-xs text-slate-400 space-y-2">
        <p>Trò chơi mô phỏng sự nghiệp esports, sử dụng quy tắc và chỉ số giải trí. Lịch, thể thức và điều kiện tham dự được giản lược; không phản ánh đầy đủ hệ thống thi đấu chính thức. Đây không phải sản phẩm chính thức của Riot/Acer.</p>
        <p>Dữ liệu rating lịch sử tham khảo Golden Road, được dùng và điều chỉnh theo quyền chủ dự án đã có. Mã nguồn, giao diện và tài sản hình ảnh được phát triển độc lập. Save lưu trên thiết bị; hãy xuất Recovery Code sau khi chơi.</p>
      </footer>

      {/* Modals & Dialogs */}
      {activeMatchChapter && (
        <MatchCenterModal
          chapter={activeMatchChapter}
          onClose={() => {saveActiveMatch(null);setActiveMatchChapterId(null);}}
          onVictoryClaim={handleVictoryClaim}
        />
      )}

      {openedPackResult && (
        <PackOpeningModal
          packResult={openedPackResult}
          onClose={() => {clearPackReveal();setOpenedPackResult(null);}}
        />
      )}

      {showWorldDemo && <WorldDemoModal onClose={() => setShowWorldDemo(false)} />}
      {FEATURE_GOLDEN_ROAD && <button className="min-h-11 px-4 text-amber-300" onClick={()=>setShowDraft(true)}>Golden Road Draft</button>}
      {FEATURE_GOLDEN_ROAD && showDraft && <LegacyDraftModal onClose={()=>setShowDraft(false)} onClaim={claimDraftReward}/>}

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
