import {GameSave,saveReducer} from '../saveState';
import {DraftSession,draftComplete} from './engine';
import {SeededRng,murmurHash3} from '../seededRng';
import {getEditionById} from '../../data/cardCatalog';

export function rewardDraft(save:GameSave,draft:DraftSession,day:string,now:number,instanceId:string):GameSave {
 if(!save.club||!draftComplete(draft))return save;
 const previous=save.draftRewards||{claimedSeeds:[],day,count:0},count=previous.day===day?previous.count:0;
 if(previous.claimedSeeds.includes(draft.seed)||count>=2||previous.claimedSeeds.length>=10000)return save;
 const rng=new SeededRng(murmurHash3(`${draft.seed}|reward`)),edition=getEditionById(rng.choice(Object.values(draft.slots))!)!;
 return saveReducer(save,{club:{...save.club,wallet:{...save.club.wallet,credits:save.club.wallet.credits+50}},
  ownedCards:[{instanceId,editionId:edition.id,playerId:edition.playerId,level:1,trainedStats:{},acquiredAt:now,acquiredFrom:'Golden Road Draft'},...save.ownedCards],
  ledger:[{id:`draft_${draft.seed}`,timestamp:now,deltaCredits:50,deltaMaterials:0,deltaTickets:0,reason:'Thưởng Golden Road Draft',sourceType:'MILESTONE'},...save.ledger],
  draftRewards:{claimedSeeds:[...previous.claimedSeeds,draft.seed],day,count:count+1}});
}
