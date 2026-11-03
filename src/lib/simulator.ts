import {
  CounterfactualComparison,
  GameSimulationResult,
  MatchPhase,
  MatchSimulationResult,
  OpponentArchetype,
  PhaseOutcome,
  Role,
  SeriesFormat,
  TacticCode,
  TeamSnapshot,
} from '../types';
import { computeSubSeed, getPhaseRng, SeededRng } from './seededRng';
import { ARCHETYPE_LABELS } from './labels';
import {
  DECISION_FIT_MATRIX,
  getDecisionFit,
  getTacticRosterFit,
  PHASE_TACTICS,
  TACTIC_METADATA,
} from './tacticsMatrix';

export interface OpponentDecisionPolicy {
  archetype: OpponentArchetype;
  offScriptChance?: number; // default 0.2
}

/**
 * Sigmoid probability curve clamped between [0.08, 0.92]
 */
export function sigmoid(diff: number, scale: number = 18): number {
  const raw = 1 / (1 + Math.exp(-diff / scale));
  return Math.max(0.08, Math.min(0.92, raw));
}

/**
 * Derives team combat ratings from roster stats
 */
export function calculateTeamRatings(roster: TeamSnapshot['roster']): {
  lane: number;
  macro: number;
  teamfight: number;
} {
  let laneSum = 0;
  let macroSum = 0;
  let tfSum = 0;

  for (const p of roster) {
    const s = p.effectiveStats;
    laneSum += 0.6 * s.mechanics + 0.25 * s.mental + 0.15 * s.macro;
    macroSum += 0.6 * s.macro + 0.25 * s.teamwork + 0.15 * s.mental;
    tfSum += 0.4 * s.mechanics + 0.4 * s.teamwork + 0.2 * s.mental;
  }

  const count = Math.max(1, roster.length);
  return {
    lane: Math.round(laneSum / count),
    macro: Math.round(macroSum / count),
    teamfight: Math.round(tfSum / count),
  };
}

/**
 * Determine opponent tactic based on archetype & phase
 */
function getOpponentTacticForArchetype(
  phase: MatchPhase,
  archetype: OpponentArchetype,
  rng: SeededRng
): TacticCode {
  if (phase === 'EARLY') {
    switch (archetype) {
      case 'EARLY_AGGRO':
        return 'GANK_TOP';
      case 'OBJECTIVE_CONTROL':
        return 'PLAY_MID';
      case 'LATE_SCALING':
        return 'SAFE_FARM';
      case 'SPLIT_PRESSURE':
        return rng.next() > 0.5 ? 'GANK_TOP' : 'PLAY_MID';
      case 'BALANCED':
      default:
        return rng.choice(['GANK_TOP', 'PLAY_MID', 'SAFE_FARM']);
    }
  } else if (phase === 'MID') {
    switch (archetype) {
      case 'EARLY_AGGRO':
        return 'CONTEST_OBJECTIVE';
      case 'OBJECTIVE_CONTROL':
        return 'CONTEST_OBJECTIVE';
      case 'LATE_SCALING':
        return 'TRADE_MAP';
      case 'SPLIT_PRESSURE':
        return 'SPLIT_PUSH';
      case 'BALANCED':
      default:
        return rng.choice(['CONTEST_OBJECTIVE', 'SPLIT_PUSH', 'TRADE_MAP']);
    }
  } else {
    // LATE
    switch (archetype) {
      case 'EARLY_AGGRO':
        return 'FORCE_TEAMFIGHT';
      case 'OBJECTIVE_CONTROL':
        return 'PICK_OFF';
      case 'LATE_SCALING':
        return 'PROTECT_CARRY';
      case 'SPLIT_PRESSURE':
        return 'PICK_OFF';
      case 'BALANCED':
      default:
        return rng.choice(['FORCE_TEAMFIGHT', 'PROTECT_CARRY', 'PICK_OFF']);
    }
  }
}

/**
 * Simulates a single game phase (EARLY, MID, LATE)
 * Uses sub-seed isolation so changing earlier phases never changes later random draws!
 */
export function simulatePhase(
  masterSeed: number,
  gameIndex: number,
  phase: MatchPhase,
  playerSnapshot: TeamSnapshot,
  opponentSnapshot: TeamSnapshot,
  playerTactic: TacticCode,
  opponentPolicy: OpponentDecisionPolicy
): PhaseOutcome {
  // 1. Setup isolated PRNGs for this exact phase
  const tacticRng = getPhaseRng(masterSeed, gameIndex, phase, 1);
  const outcomeRng = getPhaseRng(masterSeed, gameIndex, phase, 2);
  const eventRng = getPhaseRng(masterSeed, gameIndex, phase, 3);

  // 2. Opponent script / off-script resolution
  const offScriptRoll = tacticRng.next();
  const offScriptThreshold = opponentPolicy.offScriptChance ?? 0.2;
  const wasOffScript = offScriptRoll < offScriptThreshold;

  let actualOpponentArchetype = opponentPolicy.archetype;
  if (wasOffScript) {
    const archetypes: OpponentArchetype[] = [
      'EARLY_AGGRO',
      'OBJECTIVE_CONTROL',
      'LATE_SCALING',
      'SPLIT_PRESSURE',
      'BALANCED',
    ];
    actualOpponentArchetype = tacticRng.choice(
      archetypes.filter((a) => a !== opponentPolicy.archetype)
    );
  }

  const opponentTactic = getOpponentTacticForArchetype(
    phase,
    actualOpponentArchetype,
    tacticRng
  );

  // 3. Attribute base power for phase
  let playerBase = 0;
  let opponentBase = 0;
  if (phase === 'EARLY') {
    playerBase = playerSnapshot.ratings.lane;
    opponentBase = opponentSnapshot.ratings.lane;
  } else if (phase === 'MID') {
    playerBase = playerSnapshot.ratings.macro;
    opponentBase = opponentSnapshot.ratings.macro;
  } else {
    playerBase = playerSnapshot.ratings.teamfight;
    opponentBase = opponentSnapshot.ratings.teamfight;
  }

  // 4. Modifiers
  const decisionFitBonus = getDecisionFit(playerTactic, actualOpponentArchetype);
  const tacticFitBonus = getTacticRosterFit(playerTactic, playerSnapshot);
  const synergyBonus = Math.max(-8, Math.min(8, playerSnapshot.synergyBonus));
  const formBonus = outcomeRng.nextInt(-2, 2);

  const playerPower =
    playerBase + decisionFitBonus + tacticFitBonus + synergyBonus + formBonus;
  const opponentPower = opponentBase + Math.max(-8, Math.min(8, opponentSnapshot.synergyBonus)) + eventRng.nextInt(-2, 2);

  const diff = playerPower - opponentPower;
  const winProbability = sigmoid(diff);

  // 5. Draw winner under isolated outcome seed
  const roll = outcomeRng.next();
  const playerWon = roll < winProbability;

  // 6. Generate narrative commentary
  const events: string[] = [];
  let keyMoment = '';
  let goldDelta = 0;

  if (phase === 'EARLY') {
    if (playerWon) {
      goldDelta = outcomeRng.nextInt(800, 2200);
      events.push(`[03:15] Đường trên cắm mắt chuẩn, né pha gank rình rập từ đối thủ.`);
      events.push(`[06:40] Chiến Công Đầu! Người đi rừng can thiệp xuất sắc đem về mạng hạ gục quý giá.`);
      events.push(`[09:20] Kiểm soát thành công Cua Kì Cục và phong tỏa sông, tích lũy +${goldDelta} vàng.`);
      keyMoment = `Áp dụng chiến thuật ${TACTIC_METADATA[playerTactic].name} thành công rực rỡ, chiếm trọn thế chủ động đầu trận.`;
    } else {
      goldDelta = -outcomeRng.nextInt(600, 1800);
      events.push(`[04:10] Đối thủ tổ chức băng trụ bất ngờ khiến tuyến đường gặp khó.`);
      events.push(`[08:30] Mất quyền kiểm soát Cua Kì Cục, bị đối phương dẫn trước ${Math.abs(goldDelta)} vàng.`);
      keyMoment = `Đối thủ phản ứng nhạy bén, khai thác điểm sơ hở trong giai đoạn đi đường.`;
    }
  } else if (phase === 'MID') {
    if (playerWon) {
      goldDelta = outcomeRng.nextInt(1200, 3200);
      events.push(`[14:15] Tranh chấp hang Sứ Giả thành công, thả húc đổ gục Trụ 1 đường giữa!`);
      events.push(`[19:40] Giao tranh thắng lợi tại hang Rồng Nguyên Tố, giành bùa lợi Rồng thứ 2.`);
      events.push(`[22:00] Đội hình mở rộng tầm nhìn sâu vào phần rừng đối phương (+${goldDelta} vàng).`);
      keyMoment = `Khâu di chuyển Macro và phối hợp chiến thuật ${TACTIC_METADATA[playerTactic].name} tạo bước ngoặt lớn giữa trận.`;
    } else {
      goldDelta = -outcomeRng.nextInt(1000, 2800);
      events.push(`[15:20] Đối thủ ăn trộm Sứ Giả Khe Nứt thành công khi đội hình phân tán.`);
      events.push(`[20:10] Thua thiệt tầm nhìn dẫn tới mất Rồng, cách biệt ${Math.abs(goldDelta)} vàng.`);
      keyMoment = `Bị đối phương kéo giãn đội hình và kiểm soát các mục tiêu lớn trên bản đồ.`;
    }
  } else {
    // LATE
    if (playerWon) {
      goldDelta = outcomeRng.nextInt(2500, 5000);
      events.push(`[26:30] Bẫy Baron thần sầu! Bắt lẻ thành công chủ lực đối phương.`);
      events.push(`[28:10] Quét Sạch (ACE)! Tiến thẳng vào đường giữa dọn sạch lính.`);
      events.push(`[29:45] Phá hủy Nhà Chính Nexus đối phương!`);
      keyMoment = `Pha giao tranh quyết định chuẩn mực, chủ lực được bảo vệ tuyệt đối để dứt điểm ván đấu.`;
    } else {
      goldDelta = -outcomeRng.nextInt(2000, 4500);
      events.push(`[27:00] Mất mục tiêu Baron sau pha trừng phạt 50/50 nghẹt thở.`);
      events.push(`[29:15] Đối phương tràn vào căn cứ với bùa lợi Baron đầy uy lực.`);
      keyMoment = `Không thể chống đỡ trước đợt tấn công tổng lực của đối thủ về cuối trận.`;
    }
  }

  return {
    phase,
    playerTactic,
    opponentTactic,
    opponentArchetypeExpected: opponentPolicy.archetype,
    opponentArchetypeActual: actualOpponentArchetype,
    wasOffScript,
    playerPhasePower: playerPower,
    opponentPhasePower: opponentPower,
    decisionFitBonus,
    tacticFitBonus,
    synergyBonus,
    formBonus,
    winProbability,
    winner: playerWon ? 'PLAYER' : 'OPPONENT',
    goldDelta,
    events,
    keyMoment,
  };
}

/**
 * Commentary for a LATE phase whose own result points the opposite way to the game result.
 * `lateWon` is the player's result in the LATE phase; the game result is the opposite.
 * Wording keeps the final line consistent with who actually wins the game.
 */
function reconcileLateNarrative(lateWon: boolean): { events: string[]; keyMoment: string } {
  if (lateWon) {
    return {
      events: [
        '[26:30] Bẫy Baron thần sầu! Bắt lẻ thành công chủ lực đối phương.',
        '[28:10] Quét Sạch (ACE)! Nhưng khoảng cách vàng và mục tiêu tích lũy từ đầu trận quá lớn để lật ngược.',
        '[29:30] Đối phương vẫn đẩy được vào căn cứ và phá hủy Nhà Chính của bạn.',
      ],
      keyMoment: 'Thắng giao tranh tổng cuối trận nhưng không bù nổi khoảng cách từ hai pha trước, ván đấu thuộc về đối thủ.',
    };
  }
  return {
    events: [
      '[27:00] Mất mục tiêu Baron sau pha trừng phạt 50/50 nghẹt thở.',
      '[29:15] Đối phương tràn vào căn cứ nhưng lợi thế vàng tích lũy từ đầu trận giúp đội bạn trụ vững.',
      '[29:50] Phản công thành công, phá hủy Nhà Chính Nexus đối phương!',
    ],
    keyMoment: 'Thua giao tranh tổng cuối trận nhưng lợi thế tích lũy từ hai pha trước đủ để giữ vững và dứt điểm ván đấu.',
  };
}

/**
 * Simulates a full game (3 phases)
 */
export function simulateGame(
  masterSeed: number,
  gameIndex: number,
  playerSnapshot: TeamSnapshot,
  opponentSnapshot: TeamSnapshot,
  tactics: {
    early: TacticCode;
    mid: TacticCode;
    late: TacticCode;
  },
  opponentPolicy: OpponentDecisionPolicy
): GameSimulationResult {
  const p1 = simulatePhase(
    masterSeed,
    gameIndex,
    'EARLY',
    playerSnapshot,
    opponentSnapshot,
    tactics.early,
    opponentPolicy
  );
  const p2 = simulatePhase(
    masterSeed,
    gameIndex,
    'MID',
    playerSnapshot,
    opponentSnapshot,
    tactics.mid,
    opponentPolicy
  );
  const p3 = simulatePhase(
    masterSeed,
    gameIndex,
    'LATE',
    playerSnapshot,
    opponentSnapshot,
    tactics.late,
    opponentPolicy
  );

  const phases = [p1, p2, p3];
  const playerWins = phases.filter((p) => p.winner === 'PLAYER').length;
  const gameWon = playerWins >= 2;
  // The game goes to whoever takes 2 of 3 phases, so the last phase may swing against the game result.
  // Only its commentary changes (never winner, probability, gold or any RNG draw), so the log leads to the result.
  if ((p3.winner === 'PLAYER') !== gameWon) {
    phases[2] = { ...p3, ...reconcileLateNarrative(p3.winner === 'PLAYER') };
  }

  const rng = getPhaseRng(masterSeed, gameIndex, 'SUMMARY', 0);
  const killsPlayer = gameWon ? rng.nextInt(14, 26) : rng.nextInt(6, 15);
  const killsOpponent = gameWon ? rng.nextInt(5, 14) : rng.nextInt(15, 27);
  const gameDuration = rng.nextInt(26, 36);

  const winningRoster = gameWon ? playerSnapshot.roster : opponentSnapshot.roster;
  const mvpPlayer = rng.choice(winningRoster);

  return {
    gameIndex,
    phases,
    winner: gameWon ? 'PLAYER' : 'OPPONENT',
    killsPlayer,
    killsOpponent,
    gameDurationMinutes: gameDuration,
    mvpRole: mvpPlayer.role,
    mvpName: mvpPlayer.displayName,
  };
}

/**
 * Computes honest counterfactual analysis for player decisions
 * Runs the identical sub-seeds with alternative tactics to show true probability impact
 */
export function computeCounterfactuals(
  masterSeed: number,
  game: GameSimulationResult,
  playerSnapshot: TeamSnapshot,
  opponentSnapshot: TeamSnapshot,
  opponentPolicy: OpponentDecisionPolicy
): CounterfactualComparison[] {
  const comparisons: CounterfactualComparison[] = [];

  for (const phaseOutcome of game.phases) {
    const phase = phaseOutcome.phase;
    const allTactics = PHASE_TACTICS[phase];
    const alternativeTactics = allTactics.filter(
      (t) => t !== phaseOutcome.playerTactic
    );

    for (const alt of alternativeTactics) {
      // Re-run the phase with alternative tactic using the identical master seed
      const altOutcome = simulatePhase(
        masterSeed,
        game.gameIndex,
        phase,
        playerSnapshot,
        opponentSnapshot,
        alt,
        opponentPolicy
      );

      const diffPercent = Math.round(
        (altOutcome.winProbability - phaseOutcome.winProbability) * 100
      );

      const chosenMeta = TACTIC_METADATA[phaseOutcome.playerTactic];
      const altMeta = TACTIC_METADATA[alt];

      let explanation = '';
      if (diffPercent > 0) {
        explanation = `Ván ${game.gameIndex}, pha ${phase}: "${chosenMeta.name}" (${phaseOutcome.decisionFitBonus}) so với "${altMeta.name}" (${altOutcome.decisionFitBonus}); đối thủ ${ARCHETYPE_LABELS[phaseOutcome.opponentArchetypeActual]}. Đổi lựa chọn làm xác suất thắng pha tăng ${diffPercent} điểm phần trăm. Hãy đối chiếu trinh sát và đội hình trước ván tiếp theo.`;
      } else {
        explanation = `Ván ${game.gameIndex}, pha ${phase}: "${chosenMeta.name}" (${phaseOutcome.decisionFitBonus}) so với "${altMeta.name}" (${altOutcome.decisionFitBonus}); đối thủ ${ARCHETYPE_LABELS[phaseOutcome.opponentArchetypeActual]}. ${diffPercent < 0 ? `Đổi lựa chọn làm xác suất thắng pha giảm ${Math.abs(diffPercent)} điểm phần trăm.` : 'Hai lựa chọn có xác suất thắng pha gần tương đương.'} Hãy đối chiếu trinh sát và đội hình trước ván tiếp theo.`;
      }

      comparisons.push({
        phase,
        chosenTactic: phaseOutcome.playerTactic,
        chosenFit: phaseOutcome.decisionFitBonus,
        alternativeTactic: alt,
        alternativeFit: altOutcome.decisionFitBonus,
        probabilityDiffPercent: diffPercent,
        explanation,
      });
    }
  }

  return comparisons;
}

/**
 * Simulates a complete series (BO1, BO3, or BO5)
 */
export function simulateSeries(
  matchId: string,
  seed: number,
  seriesFormat: SeriesFormat,
  playerSnapshot: TeamSnapshot,
  opponentSnapshot: TeamSnapshot,
  gameTacticsList: {
    early: TacticCode;
    mid: TacticCode;
    late: TacticCode;
  }[],
  opponentPolicy: OpponentDecisionPolicy
): MatchSimulationResult {
  const winsNeeded = seriesFormat === 'BO1' ? 1 : seriesFormat === 'BO3' ? 2 : 3;
  const maxGames = seriesFormat === 'BO1' ? 1 : seriesFormat === 'BO3' ? 3 : 5;

  let playerWins = 0;
  let opponentWins = 0;
  const games: GameSimulationResult[] = [];

  for (let g = 0; g < maxGames; g++) {
    // If tactics not provided for game g, use game 0 tactics (or defaults)
    const tactics = gameTacticsList[g] || gameTacticsList[0] || {
      early: 'SAFE_FARM',
      mid: 'CONTEST_OBJECTIVE',
      late: 'FORCE_TEAMFIGHT',
    };

    const gameResult = simulateGame(
      seed,
      g + 1,
      playerSnapshot,
      opponentSnapshot,
      tactics,
      opponentPolicy
    );

    games.push(gameResult);
    if (gameResult.winner === 'PLAYER') {
      playerWins++;
    } else {
      opponentWins++;
    }

    if (playerWins >= winsNeeded || opponentWins >= winsNeeded) {
      break;
    }
  }

  return summarizeSeries(matchId, seed, seriesFormat, playerSnapshot, opponentSnapshot, games, opponentPolicy);
}

export type GameTactics = {early:TacticCode;mid:TacticCode;late:TacticCode};
export function seriesFinished(format:SeriesFormat, games:GameSimulationResult[]):boolean {
  const needed=format==='BO1'?1:format==='BO3'?2:3;
  return games.filter(g=>g.winner==='PLAYER').length>=needed || games.filter(g=>g.winner==='OPPONENT').length>=needed;
}
export function recommendTactics(snapshot:TeamSnapshot, archetype:OpponentArchetype):GameTactics {
  const best=(phase:MatchPhase)=>[...PHASE_TACTICS[phase]].sort((a,b)=>(getDecisionFit(b,archetype)+getTacticRosterFit(b,snapshot))-(getDecisionFit(a,archetype)+getTacticRosterFit(a,snapshot)))[0];
  return {early:best('EARLY'),mid:best('MID'),late:best('LATE')};
}
export function simulateNextGame(seed:number, format:SeriesFormat, player:TeamSnapshot, opponent:TeamSnapshot, games:GameSimulationResult[], tactics:GameTactics, policy:OpponentDecisionPolicy):GameSimulationResult|null {
  if(seriesFinished(format,games))return null;
  return simulateGame(seed,games.length+1,player,opponent,tactics,policy);
}
export function summarizeSeries(matchId:string, seed:number, seriesFormat:SeriesFormat, playerSnapshot:TeamSnapshot, opponentSnapshot:TeamSnapshot, games:GameSimulationResult[], opponentPolicy:OpponentDecisionPolicy):MatchSimulationResult {
  const playerWins=games.filter(g=>g.winner==='PLAYER').length;
  const opponentWins=games.length-playerWins;
  const seriesWinner = playerWins > opponentWins ? 'PLAYER' : 'OPPONENT';

  // Compute overall series breakdown
  const rosterDiff = Math.round(playerSnapshot.teamOvr - opponentSnapshot.teamOvr);
  const synergyAdvantage = Math.round(playerSnapshot.synergyBonus);
  const tacticSuitability = Math.round(
    games.reduce(
      (sum, g) =>
        sum + g.phases.reduce((pSum, p) => pSum + p.tacticFitBonus, 0),
      0
    ) / games.length
  );
  const decisionQuality = Math.round(
    games.reduce(
      (sum, g) =>
        sum + g.phases.reduce((pSum, p) => pSum + p.decisionFitBonus, 0),
      0
    ) / games.length
  );

  // Counterfactuals from Game 1
  const counterfactual = games.flatMap(game => computeCounterfactuals(seed,game,playerSnapshot,opponentSnapshot,opponentPolicy))
    .sort((a,b)=>Math.abs(b.probabilityDiffPercent)-Math.abs(a.probabilityDiffPercent));

  // Generate actionable coaching advice
  let coachingAdvice = '';
  if (seriesWinner === 'PLAYER') {
    coachingAdvice =
      'Chiến thắng thuyết phục! Sự phối hợp nhịp nhàng giữa chất tướng và chiến thuật khắc chế đã bẻ gãy ý đồ của đối phương.';
  } else {
    if (rosterDiff < -6) {
      coachingAdvice =
        'Chênh lệch chỉ số cá nhân khá lớn. Hãy nâng cấp thẻ qua Huấn Luyện (Training) hoặc mở Pack để bổ sung các vị trí còn thiếu.';
    } else if (decisionQuality < 0) {
      coachingAdvice =
        'Đối thủ đã đoán bắt được ý đồ chiến thuật. Hãy chú ý bảng trinh sát lối chơi (Archetype) trước trận để chọn phương án khắc chế phù hợp.';
    } else {
      coachingAdvice =
        'Trận đấu diễn ra rất giằng co ở những pha giao tranh then chốt. Cân nhắc tăng cường chỉ số Tâm Lý (Mental) hoặc rèn luyện thêm cấp độ.';
    }
  }

  return {
    matchId,
    seed,
    seriesFormat,
    playerWins,
    opponentWins,
    winner: seriesWinner,
    games,
    breakdown: {
      rosterDiff,
      synergyAdvantage,
      tacticSuitability,
      decisionQuality,
    },
    counterfactual,
    coachingAdvice,
  };
}
