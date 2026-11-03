/**
 * APAC Rising: Esports Manager — Domain Types
 * Based on Spec v2.2 (2026-10-27)
 */

export type Role = 'TOP' | 'JUNGLE' | 'MID' | 'BOT' | 'SUPPORT';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type EditionCode = 'ACADEMY' | 'BREAKOUT' | 'CHAMPION' | 'LEGACY';

export type PlaystyleArchetype =
  | 'Lane Dominator'
  | 'Playmaker'
  | 'Late Carry'
  | 'Shotcaller'
  | 'Clutch'
  | 'Flexible';

export type OpponentArchetype =
  | 'EARLY_AGGRO'
  | 'OBJECTIVE_CONTROL'
  | 'LATE_SCALING'
  | 'SPLIT_PRESSURE'
  | 'BALANCED';

export interface PlayerStats {
  mechanics: number; // 0 - 100
  macro: number; // 0 - 100
  teamwork: number; // 0 - 100
  mental: number; // 0 - 100
  championPool: number; // 0 - 100
}

export interface PlayerIdentity {
  id: string;
  displayName: string;
  primaryRole: Role;
  secondaryRole?: Role;
  region: string;
  biography: string;
  playstyle: PlaystyleArchetype;
  weakness: string;
  avatarSeed: string; // for consistent stylized portrait icon
}

export interface PlayerCardEdition {
  id: string;
  playerId: string;
  editionYear: number;
  editionCode: EditionCode;
  rarity: Rarity;
  baseOvr: number;
  baseStats: PlayerStats;
  traits: string[];
}

export interface OwnedCard {
  instanceId: string;
  editionId: string;
  playerId: string;
  level: number; // 1 - 10 (+1 stat per level)
  trainedStats: Partial<PlayerStats>;
  acquiredAt: number;
  acquiredFrom: string;
  isLocked?: boolean;
}

export type Lineup = Record<Role, string | null>; // Maps Role to OwnedCard instanceId

export type SeriesFormat = 'BO1' | 'BO3' | 'BO5';

export type MatchPhase = 'EARLY' | 'MID' | 'LATE';

export type EarlyTactic = 'GANK_TOP' | 'PLAY_MID' | 'SAFE_FARM';
export type MidTactic = 'CONTEST_OBJECTIVE' | 'SPLIT_PUSH' | 'TRADE_MAP';
export type LateTactic = 'FORCE_TEAMFIGHT' | 'PROTECT_CARRY' | 'PICK_OFF';
export type TacticCode = EarlyTactic | MidTactic | LateTactic;

export interface TeamSnapshot {
  teamName: string;
  logoKey: string;
  roster: {
    role: Role;
    displayName: string;
    ovr: number;
    effectiveStats: PlayerStats;
    archetype: PlaystyleArchetype;
    isStarter?: boolean;
  }[];
  teamOvr: number;
  synergyBonus: number; // [-8, 8]
  ratings: {
    lane: number;
    macro: number;
    teamfight: number;
  };
}

export interface PhaseOutcome {
  phase: MatchPhase;
  playerTactic: TacticCode;
  opponentTactic: TacticCode;
  opponentArchetypeExpected: OpponentArchetype;
  opponentArchetypeActual: OpponentArchetype;
  wasOffScript: boolean;
  playerPhasePower: number;
  opponentPhasePower: number;
  decisionFitBonus: number; // [-6, 6]
  tacticFitBonus: number; // [-5, 5]
  synergyBonus: number; // [-8, 8]
  formBonus: number; // [-2, 2]
  winProbability: number; // clamped [0.08, 0.92]
  winner: 'PLAYER' | 'OPPONENT';
  goldDelta: number;
  events: string[];
  keyMoment: string;
}

export interface GameSimulationResult {
  gameIndex: number;
  phases: PhaseOutcome[];
  winner: 'PLAYER' | 'OPPONENT';
  killsPlayer: number;
  killsOpponent: number;
  gameDurationMinutes: number;
  mvpRole: Role;
  mvpName: string;
}

export interface CounterfactualComparison {
  phase: MatchPhase;
  chosenTactic: TacticCode;
  chosenFit: number;
  alternativeTactic: TacticCode;
  alternativeFit: number;
  probabilityDiffPercent: number;
  explanation: string;
}

export interface MatchSimulationResult {
  matchId: string;
  seed: number;
  seriesFormat: SeriesFormat;
  playerWins: number;
  opponentWins: number;
  winner: 'PLAYER' | 'OPPONENT';
  games: GameSimulationResult[];
  breakdown: {
    rosterDiff: number;
    synergyAdvantage: number;
    tacticSuitability: number;
    decisionQuality: number;
  };
  counterfactual: CounterfactualComparison[];
  coachingAdvice: string;
}

export type PackFamily = 'WELCOME' | 'SCOUT' | 'ELITE' | 'CHAMPION';

export interface PackDefinition {
  family: PackFamily;
  name: string;
  description: string;
  priceCredits: number;
  rarityWeights: {
    COMMON: number;
    RARE: number;
    EPIC: number;
    LEGENDARY: number;
  };
  pityLimit: number; // 8 for Scout (at most 7 misses, 8th forced Epic+)
  minCommonOvr?: number; // 62 for Scout Common
}

export interface PackInstance {
  id: string;
  family: PackFamily;
  obtainedReason: string;
  obtainedAt: number;
}

export interface CurrencyLedgerEntry {
  id: string;
  timestamp: number;
  deltaCredits: number;
  deltaMaterials: number;
  deltaTickets: number;
  reason: string;
  sourceType: 'MILESTONE' | 'PACK_BUY' | 'TRAINING' | 'TRANSFER' | 'FACILITY' | 'SPONSOR';
}

export interface Chapter {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  act: 1 | 2 | 3;
  description: string;
  suggestedOvr: string;
  format: SeriesFormat;
  opponent: {
    name: string;
    shortTag: string;
    logoKey: string;
    ovr: number;
    archetype: OpponentArchetype;
    description: string;
    rosterPreview: {
      role: Role;
      displayName: string;
      ovr: number;
    }[];
  };
  milestoneRewards: {
    credits: number;
    materials?: number;
    tickets?: number;
    packs?: PackFamily[];
    reputation: number;
  };
  storyEpilogue: string;
}

export interface Facility {
  code: 'TRAINING_CENTER' | 'SCOUT_OFFICE' | 'STRATEGY_LAB';
  name: string;
  description: string;
  tier: number; // 0, 1, 2, 3
  upgradeCosts: number[];
  perks: string[];
}

export interface TransferOffer {
  id: string;
  editionId: string;
  priceCredits: number;
  expiresInSeconds: number;
  sourceClub: string;
}

export interface ClubState {
  id: string;
  name: string;
  logoKey: string;
  homeRegion: string;
  reputation: number;
  careerYear: number;
  currentChapterId: number;
  completedChapterIds: number[];
  recoveryCode: string;
  wallet: {
    credits: number;
    trainingMaterials: number;
    scoutTickets: number;
  };
  scoutPityMisses: number; // consecutive Scout opens without Epic+
  packs: PackInstance[];
  lineup: Lineup;
  facilities: Record<string, number>;
  createdAt: number;
}
