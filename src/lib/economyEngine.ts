import {
  EDITIONS_CATALOG,
  getEditionById,
  getPlayerById,
} from '../data/cardCatalog';
import {
  EditionCode,
  OwnedCard,
  PackDefinition,
  PackFamily,
  PlayerCardEdition,
  PlayerStats,
  Rarity,
  Role,
  TransferOffer,
} from '../types';
import { SeededRng } from './seededRng';

export const PACK_DEFINITIONS: Record<PackFamily, PackDefinition> = {
  WELCOME: {
    family: 'WELCOME',
    name: 'Gói Tân Binh (Welcome Pack)',
    description: 'Dành riêng cho tân binh câu lạc bộ. Bảo đảm 100% nhận được thẻ tuyển thủ từ bậc Hiếm (Rare) trở lên.',
    priceCredits: 0,
    rarityWeights: {
      COMMON: 0,
      RARE: 80,
      EPIC: 18,
      LEGENDARY: 2,
    },
    pityLimit: 1,
  },
  SCOUT: {
    family: 'SCOUT',
    name: 'Gói Trinh Sát (Scout Pack)',
    description: 'Tìm kiếm tài năng từ các cyber game và giải phong trào. Bảo đảm có ít nhất 1 thẻ Epic+ sau tối đa 8 lần mở.',
    priceCredits: 800,
    rarityWeights: {
      COMMON: 55,
      RARE: 35,
      EPIC: 9,
      LEGENDARY: 1,
    },
    pityLimit: 8,
    minCommonOvr: 62,
  },
  ELITE: {
    family: 'ELITE',
    name: 'Gói Tinh Anh (Elite Pack)',
    description: 'Gói thẻ chất lượng cao nhận từ các cột mốc chiến dịch lớn. Không có thẻ Thường, cơ hội cao nhận Epic & Legendary.',
    priceCredits: 2000,
    rarityWeights: {
      COMMON: 0,
      RARE: 55,
      EPIC: 40,
      LEGENDARY: 5,
    },
    pityLimit: 5,
  },
  CHAMPION: {
    family: 'CHAMPION',
    name: 'Gói Nhà Vô Địch (Champion Pack)',
    description: 'Chỉ dành cho các danh hiệu vô địch danh giá. Chỉ xuất hiện thẻ Sử Thi (Epic) và Huyền Thoại (Legendary).',
    priceCredits: 5000,
    rarityWeights: {
      COMMON: 0,
      RARE: 0,
      EPIC: 85,
      LEGENDARY: 15,
    },
    pityLimit: 3,
  },
};

export interface PackDrawResult {
  ownedCard: OwnedCard;
  edition: PlayerCardEdition;
  wasPityTriggered: boolean;
  newPityMisses: number;
}

/**
 * Executes a pack opening following v2.2 pity rules:
 * - misses: count of consecutive non-Epic+ opens for the pack family
 * - If misses === 7 (about to do 8th open), force Epic+ (Common/Rare weight = 0)
 * - If result is Epic or Legendary, misses resets to 0
 * - Scout Commons have baseOvr >= 62
 */
export function openPackInstance(
  family: PackFamily,
  currentPityMisses: number,
  rngSeed: number = Date.now()
): PackDrawResult {
  const packDef = PACK_DEFINITIONS[family];
  const rng = new SeededRng(rngSeed);

  let wasPityTriggered = false;
  let weights = { ...packDef.rarityWeights };

  // For Scout pack: pity rule (8th open forces Epic+)
  if (family === 'SCOUT' && currentPityMisses >= packDef.pityLimit - 1) {
    wasPityTriggered = true;
    weights.COMMON = 0;
    weights.RARE = 0;
    // Normalize Epic/Legendary ratio (9 : 1)
    weights.EPIC = 90;
    weights.LEGENDARY = 10;
  }

  // Draw rarity
  const rarities: Rarity[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  const weightValues = [
    weights.COMMON,
    weights.RARE,
    weights.EPIC,
    weights.LEGENDARY,
  ];

  const chosenRarity = rng.weightedChoice(rarities, weightValues);

  // Filter pool by chosen rarity and criteria
  let eligibleEditions = EDITIONS_CATALOG.filter(
    (e) => e.rarity === chosenRarity
  );

  if (chosenRarity === 'COMMON' && packDef.minCommonOvr) {
    const minOvr = packDef.minCommonOvr;
    const filtered = eligibleEditions.filter((e) => e.baseOvr >= minOvr);
    if (filtered.length > 0) {
      eligibleEditions = filtered;
    }
  }

  if (eligibleEditions.length === 0) {
    eligibleEditions = EDITIONS_CATALOG;
  }

  const chosenEdition = rng.choice(eligibleEditions);

  // Update pity counter
  let newPityMisses = currentPityMisses;
  if (family === 'SCOUT') {
    if (chosenRarity === 'EPIC' || chosenRarity === 'LEGENDARY') {
      newPityMisses = 0;
    } else {
      newPityMisses = currentPityMisses + 1;
    }
  }

  const instanceId = `card_${Date.now()}_${rng.nextInt(1000, 9999)}`;
  const ownedCard: OwnedCard = {
    instanceId,
    editionId: chosenEdition.id,
    playerId: chosenEdition.playerId,
    level: 1,
    trainedStats: {},
    acquiredAt: Date.now(),
    acquiredFrom: packDef.name,
  };

  return {
    ownedCard,
    edition: chosenEdition,
    wasPityTriggered,
    newPityMisses,
  };
}

/**
 * Calculates credit cost for training card
 */
export function getTrainingCost(currentLevel: number): number {
  if (currentLevel >= 10) return 0;
  return 100 + (currentLevel - 1) * 60; // 100, 160, 220, 280, 340, 400, 460, 520, 580
}

/**
 * Generates 6 rotating NPC transfer offers
 */
export function generateNpcTransferOffers(seed: number = Date.now()): TransferOffer[] {
  const rng = new SeededRng(seed);
  // Exclude starter academy editions
  const proEditions = EDITIONS_CATALOG.filter((e) => e.editionCode !== 'ACADEMY');
  const shuffled = [...proEditions].sort(() => rng.next() - 0.5);
  const selected = shuffled.slice(0, 6);

  const clubs = [
    'Saigon Cyber Club',
    'Hanoi Academy',
    'Da Nang Storm',
    'Mekong Wave',
    'Pacific Scouting',
    'Free Agent Market',
  ];

  return selected.map((ed, idx) => {
    let basePrice = 1200;
    if (ed.rarity === 'RARE') basePrice = 1600 + (ed.baseOvr - 70) * 150;
    if (ed.rarity === 'EPIC') basePrice = 3500 + (ed.baseOvr - 83) * 300;
    if (ed.rarity === 'LEGENDARY') basePrice = 8000 + (ed.baseOvr - 91) * 600;

    return {
      id: `offer_${seed}_${idx}`,
      editionId: ed.id,
      priceCredits: Math.round(basePrice),
      expiresInSeconds: 3600 * (idx + 2),
      sourceClub: clubs[idx % clubs.length],
    };
  });
}
