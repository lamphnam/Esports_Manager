import {emptySave,GameSave} from '../saveState';
import { EDITIONS_CATALOG, getEffectiveCardStats, getPlayerById } from '../../data/cardCatalog';
import { Chapter, TeamSnapshot } from '../../types';
import { calculateTeamRatings } from '../simulator';

export const defaultTactics = { early: 'SAFE_FARM', mid: 'CONTEST_OBJECTIVE', late: 'FORCE_TEAMFIGHT' } as const;
export function sampleTeam(rareCount = 0, epicCount = 0): TeamSnapshot {
  const starters = ['ed_raven_acad', 'ed_vex_acad', 'ed_kairo_acad', 'ed_nova_acad', 'ed_mint_acad'];
  const roster: TeamSnapshot['roster'] = starters.map((id, i) => {
    let edition = EDITIONS_CATALOG.find(e => e.id === id)!;
    const role = getPlayerById(edition.playerId)!.primaryRole;
    if (i < rareCount) edition = EDITIONS_CATALOG.find(e => e.rarity === 'RARE' && getPlayerById(e.playerId)!.primaryRole === role)!;
    if (i < epicCount) edition = EDITIONS_CATALOG.find(e => e.rarity === 'EPIC' && getPlayerById(e.playerId)!.primaryRole === role)!;
    const player = getPlayerById(edition.playerId)!;
    const {stats, ovr} = getEffectiveCardStats({instanceId:id, editionId:edition.id, playerId:player.id, level:1, trainedStats:{}, acquiredAt:0, acquiredFrom:'test'}, edition);
    return {role, displayName:player.displayName, ovr, effectiveStats:stats, archetype:player.playstyle};
  });
  return {teamName:'Fixture', logoKey:'gold_star', roster, teamOvr:Math.round(roster.reduce((n,p)=>n+p.ovr,0)/5), synergyBonus:new Set(roster.map(p=>p.archetype)).size, ratings:calculateTeamRatings(roster)};
}

// Mirrors the existing MatchCenter snapshot; keep balance measurements on the UI inputs.
export function chapterOpponent(chapter: Chapter): TeamSnapshot {
  if(chapter.opponent.snapshot)return chapter.opponent.snapshot;
  return {teamName:chapter.opponent.name, logoKey:chapter.opponent.logoKey, teamOvr:chapter.opponent.ovr, synergyBonus:3,
    ratings:{lane:chapter.opponent.ovr, macro:chapter.opponent.ovr, teamfight:chapter.opponent.ovr},
    roster:chapter.opponent.rosterPreview.map(p=>({...p, archetype:'Flexible', effectiveStats:{mechanics:p.ovr,macro:p.ovr,teamwork:p.ovr,mental:p.ovr,championPool:p.ovr}}))};
}

export function sampleSave():GameSave {
  const cards=EDITIONS_CATALOG.filter(e=>e.editionCode==='ACADEMY').slice(0,5).map((e,i)=>({instanceId:`fixture-${i}`,editionId:e.id,playerId:e.playerId,level:1,trainedStats:{},acquiredAt:1,acquiredFrom:'test'}));
  return {...emptySave(),ownedCards:cards,club:{id:'club-test',name:'CLB Việt Nam',logoKey:'gold_star',homeRegion:'Vietnam',reputation:0,careerYear:2026,currentChapterId:1,completedChapterIds:[],recoveryCode:'',wallet:{credits:500,trainingMaterials:0,scoutTickets:0},scoutPityMisses:0,packs:[],lineup:{TOP:cards[0].instanceId,JUNGLE:cards[1].instanceId,MID:cards[2].instanceId,BOT:cards[3].instanceId,SUPPORT:cards[4].instanceId},facilities:{TRAINING_CENTER:0,SCOUT_OFFICE:0,STRATEGY_LAB:0},createdAt:1}};
}
