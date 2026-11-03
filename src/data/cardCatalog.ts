import {CURRENT_PLAYERS,CURRENT_EDITIONS} from './currentCatalog';
import {OwnedCard,PlayerCardEdition,PlayerIdentity,PlayerStats} from '../types';
import legacyPlayers from './generated/legacyPlayers.json';
import legacyEditions from './generated/legacyEditions.json';
import {VERIFIED_2026_PLAYERS,VERIFIED_2026_EDITIONS} from './verified2026';
const currentIds=new Set(CURRENT_PLAYERS.map(player=>player.id));
export const PLAYERS_CATALOG:PlayerIdentity[]= [...new Map([...CURRENT_PLAYERS,...legacyPlayers as PlayerIdentity[],...VERIFIED_2026_PLAYERS].map(player=>[player.id,player])).values()];
export const EDITIONS_CATALOG:PlayerCardEdition[]= [...CURRENT_EDITIONS,...legacyEditions as PlayerCardEdition[],...VERIFIED_2026_EDITIONS];

export function getPlayerById(playerId: string): PlayerIdentity | undefined {
  return PLAYERS_CATALOG.find((p) => p.id === playerId);
}

export function getEditionById(editionId: string): PlayerCardEdition | undefined {
  return EDITIONS_CATALOG.find((e) => e.id === editionId);
}

export function computeCardOvr(stats: PlayerStats): number {
  return Math.round(
    stats.mechanics * 0.3 +
      stats.macro * 0.25 +
      stats.teamwork * 0.2 +
      stats.mental * 0.15 +
      stats.championPool * 0.1
  );
}

export function getEffectiveCardStats(
  ownedCard: OwnedCard,
  edition: PlayerCardEdition
): { stats: PlayerStats; ovr: number } {
  const trained = ownedCard.trainedStats || {};
  const stats: PlayerStats = {
    mechanics: Math.min(99, edition.baseStats.mechanics + (trained.mechanics || 0)),
    macro: Math.min(99, edition.baseStats.macro + (trained.macro || 0)),
    teamwork: Math.min(99, edition.baseStats.teamwork + (trained.teamwork || 0)),
    mental: Math.min(99, edition.baseStats.mental + (trained.mental || 0)),
    championPool: Math.min(99, edition.baseStats.championPool + (trained.championPool || 0)),
  };

  const ovr = computeCardOvr(stats);

  return { stats, ovr };
}
