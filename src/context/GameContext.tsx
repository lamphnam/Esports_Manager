import React, { createContext, useContext, useEffect, useState } from 'react';
import { CAMPAIGN_CHAPTERS } from '../data/campaignData';
import {
  EDITIONS_CATALOG,
  getEditionById,
  getEffectiveCardStats,
  getPlayerById,
  PLAYERS_CATALOG,
} from '../data/cardCatalog';
import { AudioSynth } from '../lib/audioSynth';
import {
  getTrainingCost,
  openPackInstance,
  PACK_DEFINITIONS,
  PackDrawResult,
} from '../lib/economyEngine';
import { calculateTeamRatings } from '../lib/simulator';
import {
  ClubState,
  CurrencyLedgerEntry,
  Lineup,
  OwnedCard,
  PackFamily,
  PackInstance,
  PlayerStats,
  Role,
  TeamSnapshot,
  TransferOffer,
} from '../types';

const SAVE_KEY = 'apac_rising_save_v2';
const LEDGER_KEY = 'apac_rising_ledger_v2';
const CARDS_KEY = 'apac_rising_cards_v2';

interface GameContextType {
  club: ClubState | null;
  ownedCards: OwnedCard[];
  ledger: CurrencyLedgerEntry[];
  transferOffers: TransferOffer[];
  isLoading: boolean;
  isOnboarded: boolean;
  createClub: (name: string, logoKey: string) => void;
  equipCard: (role: Role, cardInstanceId: string) => boolean;
  trainCard: (cardInstanceId: string, statKey: keyof PlayerStats) => boolean;
  openPack: (family: PackFamily) => PackDrawResult | null;
  buyPackWithCredits: (family: PackFamily) => boolean;
  buyTransferOffer: (offerId: string) => boolean;
  upgradeFacility: (code: string) => boolean;
  claimChapterReward: (chapterId: number) => boolean;
  getTeamSnapshot: () => TeamSnapshot;
  getOwnedCardWithDetails: (instanceId: string) => {
    owned: OwnedCard;
    edition: (typeof EDITIONS_CATALOG)[0];
    player: (typeof PLAYERS_CATALOG)[0];
    effectiveStats: PlayerStats;
    effectiveOvr: number;
  } | null;
  resetGame: () => void;
  restoreFromRecoveryCode: (code: string) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [club, setClub] = useState<ClubState | null>(null);
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);
  const [ledger, setLedger] = useState<CurrencyLedgerEntry[]>([]);
  const [transferOffers, setTransferOffers] = useState<TransferOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage
  useEffect(() => {
    try {
      const savedClub = localStorage.getItem(SAVE_KEY);
      const savedCards = localStorage.getItem(CARDS_KEY);
      const savedLedger = localStorage.getItem(LEDGER_KEY);

      if (savedClub && savedCards) {
        setClub(JSON.parse(savedClub));
        setOwnedCards(JSON.parse(savedCards));
        if (savedLedger) setLedger(JSON.parse(savedLedger));
      }
    } catch (e) {
      console.error('Failed to load save state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save changes
  useEffect(() => {
    if (!isLoading && club) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(club));
        localStorage.setItem(CARDS_KEY, JSON.stringify(ownedCards));
        localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
      } catch (e) {
        console.error('Failed to persist game state:', e);
      }
    }
  }, [club, ownedCards, ledger, isLoading]);

  // Initial transfer offers
  useEffect(() => {
    if (transferOffers.length === 0) {
      const proEditions = EDITIONS_CATALOG.filter((e) => e.editionCode !== 'ACADEMY');
      const selected = proEditions.slice(0, 6);
      const offers: TransferOffer[] = selected.map((ed, idx) => ({
        id: `offer_${idx}`,
        editionId: ed.id,
        priceCredits: ed.rarity === 'LEGENDARY' ? 8000 : ed.rarity === 'EPIC' ? 3500 : 1600,
        expiresInSeconds: 3600 * 24,
        sourceClub: ['Saigon Cyber Club', 'Hanoi Academy', 'Da Nang Storm', 'Mekong Wave', 'Free Agent'][
          idx % 5
        ],
      }));
      setTransferOffers(offers);
    }
  }, [transferOffers.length]);

  /**
   * Initialize a new club with 5 starters
   */
  const createClub = (name: string, logoKey: string) => {
    const starterEditions = [
      'ed_raven_acad', // TOP
      'ed_vex_acad', // JUNGLE
      'ed_kairo_acad', // MID
      'ed_nova_acad', // BOT
      'ed_mint_acad', // SUPPORT
    ];

    const initialCards: OwnedCard[] = starterEditions.map((edId, index) => {
      const ed = getEditionById(edId)!;
      return {
        instanceId: `starter_${index}_${Date.now()}`,
        editionId: ed.id,
        playerId: ed.playerId,
        level: 1,
        trainedStats: {},
        acquiredAt: Date.now(),
        acquiredFrom: 'Khởi đầu Học Viện (Campus)',
        isLocked: true,
      };
    });

    const initialLineup: Lineup = {
      TOP: initialCards[0].instanceId,
      JUNGLE: initialCards[1].instanceId,
      MID: initialCards[2].instanceId,
      BOT: initialCards[3].instanceId,
      SUPPORT: initialCards[4].instanceId,
    };

    const recoveryCode = `AR-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newClub: ClubState = {
      id: `club_${Date.now()}`,
      name: name.trim() || 'Saigon Phoenix',
      logoKey: logoKey || 'gold_star',
      homeRegion: 'Vietnam',
      reputation: 0,
      careerYear: 2026,
      currentChapterId: 1,
      completedChapterIds: [],
      recoveryCode,
      wallet: {
        credits: 500, // starting wallet
        trainingMaterials: 0,
        scoutTickets: 0,
      },
      scoutPityMisses: 0,
      packs: [],
      lineup: initialLineup,
      facilities: {
        TRAINING_CENTER: 0,
        SCOUT_OFFICE: 0,
        STRATEGY_LAB: 0,
      },
      createdAt: Date.now(),
    };

    setOwnedCards(initialCards);
    setClub(newClub);
    setLedger([
      {
        id: `ledger_init_${Date.now()}`,
        timestamp: Date.now(),
        deltaCredits: 500,
        deltaMaterials: 0,
        deltaTickets: 0,
        reason: 'Khởi tạo ngân quỹ câu lạc bộ',
        sourceType: 'SPONSOR',
      },
    ]);

    AudioSynth.playVictory();
  };

  /**
   * Equip a card into a role slot
   */
  const equipCard = (role: Role, cardInstanceId: string): boolean => {
    if (!club) return false;
    const card = ownedCards.find((c) => c.instanceId === cardInstanceId);
    if (!card) return false;

    const edition = getEditionById(card.editionId);
    const player = edition ? getPlayerById(edition.playerId) : null;
    if (!player) return false;

    // Check role eligibility
    if (player.primaryRole !== role && player.secondaryRole !== role) {
      return false;
    }

    const newLineup: Lineup = { ...club.lineup, [role]: cardInstanceId };
    setClub({ ...club, lineup: newLineup });
    AudioSynth.playClick();
    return true;
  };

  /**
   * Train card stat (+1 stat)
   */
  const trainCard = (cardInstanceId: string, statKey: keyof PlayerStats): boolean => {
    if (!club) return false;
    const card = ownedCards.find((c) => c.instanceId === cardInstanceId);
    if (!card) return false;

    if (card.level >= 10) return false;
    const cost = getTrainingCost(card.level);
    if (club.wallet.credits < cost) return false;

    const currentStatBonus = card.trainedStats[statKey] || 0;
    const updatedCards = ownedCards.map((c) => {
      if (c.instanceId === cardInstanceId) {
        return {
          ...c,
          level: c.level + 1,
          trainedStats: {
            ...c.trainedStats,
            [statKey]: currentStatBonus + 2,
          },
        };
      }
      return c;
    });

    const newCredits = club.wallet.credits - cost;
    setOwnedCards(updatedCards);
    setClub({
      ...club,
      wallet: {
        ...club.wallet,
        credits: newCredits,
      },
    });

    setLedger((prev) => [
      {
        id: `ledger_train_${Date.now()}`,
        timestamp: Date.now(),
        deltaCredits: -cost,
        deltaMaterials: 0,
        deltaTickets: 0,
        reason: `Huấn luyện kỹ năng cho tuyển thủ (Cấp ${card.level + 1})`,
        sourceType: 'TRAINING',
      },
      ...prev,
    ]);

    AudioSynth.playCardReveal('RARE');
    return true;
  };

  /**
   * Opens an available pack instance from inventory
   */
  const openPack = (family: PackFamily): PackDrawResult | null => {
    if (!club) return null;
    const packIndex = club.packs.findIndex((p) => p.family === family);
    if (packIndex === -1) return null;

    const result = openPackInstance(family, club.scoutPityMisses);

    // Consume pack from inventory
    const updatedPacks = [...club.packs];
    updatedPacks.splice(packIndex, 1);

    setOwnedCards((prev) => [result.ownedCard, ...prev]);
    setClub({
      ...club,
      packs: updatedPacks,
      scoutPityMisses: result.newPityMisses,
    });

    AudioSynth.playCardReveal(result.edition.rarity);
    return result;
  };

  /**
   * Purchase a pack using credits
   */
  const buyPackWithCredits = (family: PackFamily): boolean => {
    if (!club) return false;
    const packDef = PACK_DEFINITIONS[family];
    if (club.wallet.credits < packDef.priceCredits) return false;

    const newCredits = club.wallet.credits - packDef.priceCredits;
    const newPack: PackInstance = {
      id: `pack_${Date.now()}`,
      family,
      obtainedReason: 'Mua từ Cửa Hàng Pack',
      obtainedAt: Date.now(),
    };

    setClub({
      ...club,
      wallet: {
        ...club.wallet,
        credits: newCredits,
      },
      packs: [...club.packs, newPack],
    });

    setLedger((prev) => [
      {
        id: `ledger_buy_pack_${Date.now()}`,
        timestamp: Date.now(),
        deltaCredits: -packDef.priceCredits,
        deltaMaterials: 0,
        deltaTickets: 0,
        reason: `Mua ${packDef.name}`,
        sourceType: 'PACK_BUY',
      },
      ...prev,
    ]);

    AudioSynth.playClick();
    return true;
  };

  /**
   * Buy transfer offer from NPC market
   */
  const buyTransferOffer = (offerId: string): boolean => {
    if (!club) return false;
    const offer = transferOffers.find((o) => o.id === offerId);
    if (!offer) return false;

    if (club.wallet.credits < offer.priceCredits) return false;

    const edition = getEditionById(offer.editionId);
    if (!edition) return false;

    const newCard: OwnedCard = {
      instanceId: `card_transfer_${Date.now()}`,
      editionId: edition.id,
      playerId: edition.playerId,
      level: 1,
      trainedStats: {},
      acquiredAt: Date.now(),
      acquiredFrom: `Thị trường chuyển nhượng (${offer.sourceClub})`,
    };

    setOwnedCards((prev) => [newCard, ...prev]);
    setClub({
      ...club,
      wallet: {
        ...club.wallet,
        credits: club.wallet.credits - offer.priceCredits,
      },
    });

    // Remove bought offer
    setTransferOffers((prev) => prev.filter((o) => o.id !== offerId));

    setLedger((prev) => [
      {
        id: `ledger_transfer_${Date.now()}`,
        timestamp: Date.now(),
        deltaCredits: -offer.priceCredits,
        deltaMaterials: 0,
        deltaTickets: 0,
        reason: `Ký hợp đồng chuyển nhượng tuyển thủ (${edition.rarity})`,
        sourceType: 'TRANSFER',
      },
      ...prev,
    ]);

    AudioSynth.playCardReveal(edition.rarity);
    return true;
  };

  /**
   * Upgrade club facility
   */
  const upgradeFacility = (code: string): boolean => {
    if (!club) return false;
    const currentTier = club.facilities[code] || 0;
    if (currentTier >= 3) return false;

    const costs = [1000, 2500, 5000];
    const cost = costs[currentTier];
    if (club.wallet.credits < cost) return false;

    setClub({
      ...club,
      wallet: {
        ...club.wallet,
        credits: club.wallet.credits - cost,
      },
      facilities: {
        ...club.facilities,
        [code]: currentTier + 1,
      },
    });

    setLedger((prev) => [
      {
        id: `ledger_facility_${Date.now()}`,
        timestamp: Date.now(),
        deltaCredits: -cost,
        deltaMaterials: 0,
        deltaTickets: 0,
        reason: `Nâng cấp cơ sở vật chất ${code} lên Cấp ${currentTier + 1}`,
        sourceType: 'FACILITY',
      },
      ...prev,
    ]);

    AudioSynth.playVictory();
    return true;
  };

  /**
   * Claim chapter first-clear rewards
   */
  const claimChapterReward = (chapterId: number): boolean => {
    if (!club) return false;
    if (club.completedChapterIds.includes(chapterId)) return false;

    const chapter = CAMPAIGN_CHAPTERS.find((c) => c.id === chapterId);
    if (!chapter) return false;

    const rew = chapter.milestoneRewards;
    const packsToAdd: PackInstance[] = (rew.packs || []).map((family, idx) => ({
      id: `pack_reward_${chapterId}_${idx}_${Date.now()}`,
      family,
      obtainedReason: `Phần thưởng ${chapter.title}`,
      obtainedAt: Date.now(),
    }));

    const nextChapterId = Math.min(12, Math.max(club.currentChapterId, chapterId + 1));

    setClub({
      ...club,
      currentChapterId: nextChapterId,
      completedChapterIds: [...club.completedChapterIds, chapterId],
      reputation: club.reputation + rew.reputation,
      wallet: {
        ...club.wallet,
        credits: club.wallet.credits + rew.credits,
        trainingMaterials: club.wallet.trainingMaterials + (rew.materials || 0),
        scoutTickets: club.wallet.scoutTickets + (rew.tickets || 0),
      },
      packs: [...club.packs, ...packsToAdd],
    });

    setLedger((prev) => [
      {
        id: `ledger_ch_${chapterId}_${Date.now()}`,
        timestamp: Date.now(),
        deltaCredits: rew.credits,
        deltaMaterials: rew.materials || 0,
        deltaTickets: rew.tickets || 0,
        reason: `Hoàn thành ${chapter.subtitle}: ${chapter.title}`,
        sourceType: 'MILESTONE',
      },
      ...prev,
    ]);

    AudioSynth.playVictory();
    return true;
  };

  /**
   * Assembles the active 5-player team snapshot
   */
  const getTeamSnapshot = (): TeamSnapshot => {
    if (!club) {
      return {
        teamName: 'Đội Chưa Thành Lập',
        logoKey: 'gold_star',
        teamOvr: 60,
        synergyBonus: 0,
        roster: [],
        ratings: { lane: 60, macro: 60, teamfight: 60 },
      };
    }

    const roles: Role[] = ['TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'];
    const roster: TeamSnapshot['roster'] = [];

    let totalOvr = 0;
    for (const r of roles) {
      const cardId = club.lineup[r];
      const card = cardId ? ownedCards.find((c) => c.instanceId === cardId) : null;
      const edition = card ? getEditionById(card.editionId) : null;
      const player = edition ? getPlayerById(edition.playerId) : null;

      if (card && edition && player) {
        const { stats, ovr } = getEffectiveCardStats(card, edition);
        totalOvr += ovr;
        roster.push({
          role: r,
          displayName: player.displayName,
          ovr,
          effectiveStats: stats,
          archetype: player.playstyle,
          isStarter: card.isLocked,
        });
      } else {
        // Fallback placeholder
        roster.push({
          role: r,
          displayName: `Tân Binh ${r}`,
          ovr: 50,
          effectiveStats: { mechanics: 50, macro: 50, teamwork: 50, mental: 50, championPool: 50 },
          archetype: 'Flexible',
        });
        totalOvr += 50;
      }
    }

    const teamOvr = Math.round(totalOvr / 5);
    const ratings = calculateTeamRatings(roster);

    // Synergy calculation: diversity of archetypes + facility level bonus
    const archetypes = new Set(roster.map((p) => p.archetype));
    let synergy = Math.min(8, archetypes.size + (club.facilities.STRATEGY_LAB || 0));

    return {
      teamName: club.name,
      logoKey: club.logoKey,
      teamOvr,
      synergyBonus: synergy,
      roster,
      ratings,
    };
  };

  const getOwnedCardWithDetails = (instanceId: string) => {
    const owned = ownedCards.find((c) => c.instanceId === instanceId);
    if (!owned) return null;
    const edition = getEditionById(owned.editionId);
    if (!edition) return null;
    const player = getPlayerById(edition.playerId);
    if (!player) return null;
    const { stats, ovr } = getEffectiveCardStats(owned, edition);

    return {
      owned,
      edition,
      player,
      effectiveStats: stats,
      effectiveOvr: ovr,
    };
  };

  const resetGame = () => {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(CARDS_KEY);
      localStorage.removeItem(LEDGER_KEY);
      setClub(null);
      setOwnedCards([]);
      setLedger([]);
    } catch {}
  };

  const restoreFromRecoveryCode = (code: string): boolean => {
    // For demo/offline mode, valid format verification
    if (code && code.startsWith('AR-')) {
      // Create mock restore or alert
      return true;
    }
    return false;
  };

  return (
    <GameContext.Provider
      value={{
        club,
        ownedCards,
        ledger,
        transferOffers,
        isLoading,
        isOnboarded: !!club,
        createClub,
        equipCard,
        trainCard,
        openPack,
        buyPackWithCredits,
        buyTransferOffer,
        upgradeFacility,
        claimChapterReward,
        getTeamSnapshot,
        getOwnedCardWithDetails,
        resetGame,
        restoreFromRecoveryCode,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
