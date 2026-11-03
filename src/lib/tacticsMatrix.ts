import {
  EarlyTactic,
  LateTactic,
  MatchPhase,
  MidTactic,
  OpponentArchetype,
  TacticCode,
  TeamSnapshot,
} from '../types';

export interface TacticMeta {
  code: TacticCode;
  phase: MatchPhase;
  name: string;
  description: string;
  focusStats: string;
  recommendedAgainst: string;
}

export const TACTIC_METADATA: Record<TacticCode, TacticMeta> = {
  // Early Tactics
  GANK_TOP: {
    code: 'GANK_TOP',
    phase: 'EARLY',
    name: 'Gank Đường Trên (Top)',
    description: 'Dồn tài nguyên cho Top ép lane, khai thác sơ hở đối thủ farm thụ động.',
    focusStats: 'Kỹ Năng Rừng & Top cao',
    recommendedAgainst: 'Khắc chế Late Scaling / Split Pressure',
  },
  PLAY_MID: {
    code: 'PLAY_MID',
    phase: 'EARLY',
    name: 'Kiểm Soát Đường Giữa (Mid)',
    description: 'Chiếm quyền kiểm soát trung tâm bản đồ và sông để vô hiệu hóa ăn mục tiêu sớm.',
    focusStats: 'Macro & Kỹ Năng Đường Giữa cao',
    recommendedAgainst: 'Khắc chế Objective Control',
  },
  SAFE_FARM: {
    code: 'SAFE_FARM',
    phase: 'EARLY',
    name: 'Phòng Ngự Farm An Toàn',
    description: 'Đánh chậm, kiểm soát tầm nhìn, hóa giải hoàn toàn các pha gank sớm vũ bão.',
    focusStats: 'Tâm Lý & Macro Xạ Thủ/Hỗ Trợ cao',
    recommendedAgainst: 'Khắc chế Early Aggro',
  },

  // Mid Tactics
  CONTEST_OBJECTIVE: {
    code: 'CONTEST_OBJECTIVE',
    phase: 'MID',
    name: 'Tranh Chấp Sứ Giả / Rồng',
    description: 'Tập trung 5 người trừng phạt các đội hình đẩy lẻ phân tán trên bản đồ.',
    focusStats: 'Teamwork & Macro toàn đội',
    recommendedAgainst: 'Khắc chế Split Pressure / Early Aggro',
  },
  SPLIT_PUSH: {
    code: 'SPLIT_PUSH',
    phase: 'MID',
    name: 'Đẩy Lẻ Cánh (Split Push)',
    description: 'Kéo giãn đội hình đối thủ, phá hủy công trình khi họ bận kiểm soát mục tiêu lớn.',
    focusStats: 'Kỹ Năng Đơn Đấu Top & Xạ Thủ',
    recommendedAgainst: 'Khắc chế Objective Control',
  },
  TRADE_MAP: {
    code: 'TRADE_MAP',
    phase: 'MID',
    name: 'Đổi Tài Nguyên Thông Minh',
    description: 'Bỏ mục tiêu tranh chấp rủi ro để cướp rừng, lấy trụ cánh và giữ nhịp tăng tiến.',
    focusStats: 'Macro & Khả Năng Đọc Tình Huống',
    recommendedAgainst: 'Khắc chế Late Scaling / Split Pressure',
  },

  // Late Tactics
  FORCE_TEAMFIGHT: {
    code: 'FORCE_TEAMFIGHT',
    phase: 'LATE',
    name: 'Ép Giao Tranh Tổng 5v5',
    description: 'Tận dụng góc hẹp ở hang Baron ép giao tranh quyết định trước khi đối thủ đẩy lẻ.',
    focusStats: 'Teamwork & Kỹ Năng Tổng Hợp',
    recommendedAgainst: 'Khắc chế Split Pressure / Early Aggro',
  },
  PROTECT_CARRY: {
    code: 'PROTECT_CARRY',
    phase: 'LATE',
    name: 'Bảo Kê Chủ Lực (Hyper-Carry)',
    description: 'Đội hình bo tròn quanh Xạ Thủ / Pháp Sư, hóa giải mọi đợt tấn công từ xa.',
    focusStats: 'Tâm Lý Xạ Thủ & Teamwork Hỗ Trợ',
    recommendedAgainst: 'Khắc chế Late Scaling / Early Aggro',
  },
  PICK_OFF: {
    code: 'PICK_OFF',
    phase: 'LATE',
    name: 'Bắt Lẻ Kiểm Soát Tầm Nhìn',
    description: 'Bẫy bụi gai góc tối, tiêu diệt mục tiêu đi lạc và đánh sập thế trận kiểm soát.',
    focusStats: 'Macro Sát Thủ & Kỹ Năng Độc Lập',
    recommendedAgainst: 'Khắc chế Objective Control',
  },
};

/**
 * Exact decisionFit matrix from docs/MATCH_SIMULATOR.md §6 (±6 points)
 */
export const DECISION_FIT_MATRIX: Record<
  TacticCode,
  Record<OpponentArchetype, number>
> = {
  // Early Phase
  GANK_TOP: {
    EARLY_AGGRO: -2,
    OBJECTIVE_CONTROL: 0,
    LATE_SCALING: 4,
    SPLIT_PRESSURE: 2,
    BALANCED: 0,
  },
  PLAY_MID: {
    EARLY_AGGRO: 0,
    OBJECTIVE_CONTROL: 4,
    LATE_SCALING: 2,
    SPLIT_PRESSURE: -2,
    BALANCED: 1,
  },
  SAFE_FARM: {
    EARLY_AGGRO: 4,
    OBJECTIVE_CONTROL: -2,
    LATE_SCALING: -2,
    SPLIT_PRESSURE: 2,
    BALANCED: 1,
  },

  // Mid Phase
  CONTEST_OBJECTIVE: {
    EARLY_AGGRO: 2,
    OBJECTIVE_CONTROL: -2,
    LATE_SCALING: 0,
    SPLIT_PRESSURE: 4,
    BALANCED: 1,
  },
  SPLIT_PUSH: {
    EARLY_AGGRO: -2,
    OBJECTIVE_CONTROL: 4,
    LATE_SCALING: 2,
    SPLIT_PRESSURE: -2,
    BALANCED: 0,
  },
  TRADE_MAP: {
    EARLY_AGGRO: 0,
    OBJECTIVE_CONTROL: 0,
    LATE_SCALING: 4,
    SPLIT_PRESSURE: 2,
    BALANCED: 1,
  },

  // Late Phase
  FORCE_TEAMFIGHT: {
    EARLY_AGGRO: 2,
    OBJECTIVE_CONTROL: 0,
    LATE_SCALING: -2,
    SPLIT_PRESSURE: 4,
    BALANCED: 1,
  },
  PROTECT_CARRY: {
    EARLY_AGGRO: 2,
    OBJECTIVE_CONTROL: -2,
    LATE_SCALING: 4,
    SPLIT_PRESSURE: 0,
    BALANCED: 1,
  },
  PICK_OFF: {
    EARLY_AGGRO: -2,
    OBJECTIVE_CONTROL: 4,
    LATE_SCALING: 0,
    SPLIT_PRESSURE: 2,
    BALANCED: 0,
  },
};

export const PHASE_TACTICS: Record<MatchPhase, TacticCode[]> = {
  EARLY: ['GANK_TOP', 'PLAY_MID', 'SAFE_FARM'],
  MID: ['CONTEST_OBJECTIVE', 'SPLIT_PUSH', 'TRADE_MAP'],
  LATE: ['FORCE_TEAMFIGHT', 'PROTECT_CARRY', 'PICK_OFF'],
};

/**
 * Computes decision fit bonus based on player tactic and opponent's actual phase archetype
 */
export function getDecisionFit(tactic: TacticCode, opponentActualArchetype: OpponentArchetype): number {
  return DECISION_FIT_MATRIX[tactic]?.[opponentActualArchetype] ?? 0;
}

/**
 * Computes tactic fit with the player's current roster attributes [-5, 5]
 */
export function getTacticRosterFit(tactic: TacticCode, snapshot: TeamSnapshot): number {
  return Math.max(-5, Math.min(5, rawTacticRosterFit(tactic, snapshot)));
}

function rawTacticRosterFit(tactic: TacticCode, snapshot: TeamSnapshot): number {
  const top = snapshot.roster.find((p) => p.role === 'TOP');
  const jg = snapshot.roster.find((p) => p.role === 'JUNGLE');
  const mid = snapshot.roster.find((p) => p.role === 'MID');
  const bot = snapshot.roster.find((p) => p.role === 'BOT');
  const sup = snapshot.roster.find((p) => p.role === 'SUPPORT');

  switch (tactic) {
    case 'GANK_TOP': {
      const jgMech = jg?.effectiveStats.mechanics ?? 60;
      const topMech = top?.effectiveStats.mechanics ?? 60;
      const avg = (jgMech + topMech) / 2;
      return Math.round(((avg - 65) / 20) * 5);
    }
    case 'PLAY_MID': {
      const midMacro = mid?.effectiveStats.macro ?? 60;
      const midMech = mid?.effectiveStats.mechanics ?? 60;
      const avg = (midMacro + midMech) / 2;
      return Math.round(((avg - 65) / 20) * 5);
    }
    case 'SAFE_FARM': {
      const botMental = bot?.effectiveStats.mental ?? 60;
      const supTeamwork = sup?.effectiveStats.teamwork ?? 60;
      const avg = (botMental + supTeamwork) / 2;
      return Math.round(((avg - 65) / 20) * 5);
    }
    case 'CONTEST_OBJECTIVE': {
      const teamMacro = snapshot.ratings.macro;
      return Math.round(((teamMacro - 65) / 20) * 5);
    }
    case 'SPLIT_PUSH': {
      const topMech = top?.effectiveStats.mechanics ?? 60;
      const botMech = bot?.effectiveStats.mechanics ?? 60;
      const avg = (topMech + botMech) / 2;
      return Math.round(((avg - 65) / 20) * 5);
    }
    case 'TRADE_MAP': {
      const teamMacro = snapshot.ratings.macro;
      const teamMental = ((top?.effectiveStats.mental ?? 60) + (bot?.effectiveStats.mental ?? 60)) / 2;
      return Math.round((((teamMacro + teamMental) / 2 - 65) / 20) * 5);
    }
    case 'FORCE_TEAMFIGHT': {
      const teamfight = snapshot.ratings.teamfight;
      return Math.round(((teamfight - 65) / 20) * 5);
    }
    case 'PROTECT_CARRY': {
      const botMech = bot?.effectiveStats.mechanics ?? 60;
      const supTeam = sup?.effectiveStats.teamwork ?? 60;
      const avg = (botMech * 0.6 + supTeam * 0.4);
      return Math.round(((avg - 65) / 20) * 5);
    }
    case 'PICK_OFF': {
      const midMech = mid?.effectiveStats.mechanics ?? 60;
      const jgMacro = jg?.effectiveStats.macro ?? 60;
      const avg = (midMech + jgMacro) / 2;
      return Math.round(((avg - 65) / 20) * 5);
    }
    default:
      return 0;
  }
}
