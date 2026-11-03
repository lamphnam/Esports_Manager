import {PlayerCardEdition} from '../types';

/*
 * Owner's favourites. Packs still roll the rarity from the published table first; only the choice among cards of
 * that rarity is weighted, so rarity odds and pity are untouched.
 * `FAVORITE_PLAYERS` are lowercase display names; `FAVORITE_TEAM_IDS` are historical team ids (legacyTeams.json).
 */
export const FAVORITE_PLAYERS=['chovy'];
export const FAVORITE_TEAM_IDS=['geng'];
export const FAVORITE_PLAYER_WEIGHT=5;
export const FAVORITE_TEAM_WEIGHT=2;

export const isFavoritePlayer=(displayName?:string)=>!!displayName&&FAVORITE_PLAYERS.includes(displayName.toLowerCase());
export const isFavoriteTeam=(teamId?:string)=>!!teamId&&FAVORITE_TEAM_IDS.includes(teamId);
export const isFavoriteEdition=(edition:Pick<PlayerCardEdition,'teamId'>,displayName?:string)=>isFavoritePlayer(displayName)||isFavoriteTeam(edition.teamId);

/** Relative chance of a card among cards of the same rarity (1 = ordinary). The player weight wins over the team weight. */
export function favoriteWeight(edition:Pick<PlayerCardEdition,'teamId'>,displayName?:string):number {
 if(isFavoritePlayer(displayName))return FAVORITE_PLAYER_WEIGHT;
 if(isFavoriteTeam(edition.teamId))return FAVORITE_TEAM_WEIGHT;
 return 1;
}
