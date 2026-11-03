import {describe,it,expect} from 'vitest';
import editions from '../../data/generated/legacyEditions.json';
import manifest from '../../data/generated/legacyManifest.json';
import {CURRENT_EDITIONS} from '../../data/currentCatalog';
import {PLAYERS_CATALOG,computeCardOvr} from '../../data/cardCatalog';
import {mapLegacyRating,deriveRating,playerSlug} from '../legacyRatings';
import {openPackInstance,generateNpcTransferOffers} from '../economyEngine';
import {getEditionById} from '../../data/cardCatalog';
import {WORLD_CHAMPIONSHIP_DEMO_SCENARIO as scenario} from '../../data/campaignData';
import {calculateTeamRatings} from '../simulator';
import {VERIFIED_2026_EDITIONS,VERIFIED_2026_ROSTER} from '../../data/verified2026';
import {legacyOpponent} from '../../data/legacyOpponents';

describe('legacy data',()=>{
 it('G4 uses only sourced medium+ records and the common derived-rating mapping',()=>{
  expect(VERIFIED_2026_ROSTER).toHaveLength(5);
  for(const row of VERIFIED_2026_ROSTER){expect(row.source.length).toBeGreaterThanOrEqual(2);expect(row.retrievedAt).toBe('2026-11-03');expect(row.confidence).toBe('medium');}
  for(const ed of VERIFIED_2026_EDITIONS){expect(ed.baseOvr).toBe(mapLegacyRating(ed.provenance!.rawRating));expect(computeCardOvr(ed.baseStats)).toBe(ed.baseOvr);}
 });
 it('G2 opponents are deterministic historical snapshots, with APAC-only LCP opponents',()=>{
  for(let seed=0;seed<100;seed++)for(const chapter of [6,7,8,9,10,11,12]){
   const opponent=legacyOpponent(chapter,seed);
   expect(opponent).toEqual(legacyOpponent(chapter,seed));
   expect(opponent.snapshot!.ratings).toEqual(calculateTeamRatings(opponent.snapshot!.roster));
  }
 });
 it('G2 market offers are daily legacy offers with a real expiry',()=>{
  const generate=generateNpcTransferOffers as unknown as (day:string)=>ReturnType<typeof generateNpcTransferOffers>;
  const offers=generate('2026-11-03');
  expect(offers).toHaveLength(6);expect(generate('2026-11-03')).toEqual(offers);
  for(const offer of offers){expect(getEditionById(offer.editionId)!.editionCode).toBe('LEGACY');expect((offer as typeof offer&{expiresAt?:number}).expiresAt).toBe(Date.parse('2026-11-04T00:00:00+07:00'));}
 });
 it('G1 demo declares derived ratings and actual 2024 rosters',()=>{
  expect(scenario.playerTeam.ratings).toEqual(calculateTeamRatings(scenario.playerTeam.roster));
  expect(scenario.opponentTeam.ratings).toEqual(calculateTeamRatings(scenario.opponentTeam.roster));
  expect(scenario.playerTeam.roster.map(p=>p.displayName)).toEqual(['Zeus','Oner','Faker','Gumayusi','Keria']);
 });
 it('649 editions / 374 identities and documented rarity distribution',()=>{
  expect(editions).toHaveLength(649);expect(manifest.identities).toBe(374);
  expect(manifest.distribution).toEqual({COMMON:81,RARE:365,EPIC:166,LEGENDARY:37});
  expect(new Set(PLAYERS_CATALOG.map(p=>playerSlug(p.displayName))).size).toBe(PLAYERS_CATALOG.length);
  expect(CURRENT_EDITIONS.find(e=>e.id==='ed_raven_acad')).toBeDefined();
 });
 it('mapping is monotone; all effective OVRs match stats and have provenance',()=>{
  for(let r=76;r<98;r+=.1)expect(mapLegacyRating(r+.1)).toBeGreaterThanOrEqual(mapLegacyRating(r));
  for(const edition of editions){expect(computeCardOvr(edition.baseStats)).toBe(edition.baseOvr);expect(edition.provenance.datasetVersion).toBe(manifest.datasetVersion);}
  expect(deriveRating('test','team',2026,'MID')).toBe(deriveRating('test','team',2026,'MID'));
 });
 it('DEC-2 LEGACY never enters any current pack (10k draws/family)',()=>{
  for(const family of ['WELCOME','SCOUT','ELITE','CHAMPION'] as const)for(let seed=0;seed<10000;seed++)expect(openPackInstance(family,seed%8,seed).edition.editionCode).not.toBe('LEGACY');
 });
});
