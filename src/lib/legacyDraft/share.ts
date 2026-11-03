import {getEditionById,getPlayerById} from '../../data/cardCatalog';
import {CircuitStage,DraftSession} from './engine';
import {ROLES} from '../../data/legacyPool';

export function draftShareImage(session:DraftSession,stages:CircuitStage[]):string{
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
 ctx.fillStyle='#0F172A';ctx.fillRect(0,0,1080,1350);
 ctx.fillStyle='#FFB800';ctx.fillRect(48,48,12,140);ctx.font='bold 58px sans-serif';ctx.fillText('APAC RISING',90,106);
 ctx.fillStyle='#F8FAFC';ctx.font='32px sans-serif';ctx.fillText('Golden Road Draft',90,158);
 ctx.fillStyle='#94A3B8';ctx.font='24px monospace';ctx.fillText(`SEED ${session.seed} · SIMULATION`,90,204);
 stages.forEach((stage,i)=>{
  const y=262+i*82;ctx.fillStyle=i%2?'#1E293B':'#172236';ctx.fillRect(48,y,984,70);
  ctx.fillStyle='#FFB800';ctx.font='bold 27px sans-serif';ctx.fillText(stage.name,76,y+43);
  ctx.fillStyle=stage.userWins===3?'#FFB800':'#CBD5E1';ctx.font='25px sans-serif';ctx.fillText(`${stage.userWins}/3 series wins`,520,y+43);
 });
 ctx.fillStyle='#2563EB';ctx.fillRect(48,806,984,6);
 ROLES.forEach((role,i)=>{
  const ed=getEditionById(session.slots[role]!)!,player=getPlayerById(ed.playerId)!,y=876+i*60;
  ctx.fillStyle='#94A3B8';ctx.font='24px monospace';ctx.fillText(role,76,y);
  ctx.fillStyle='#F8FAFC';ctx.font='bold 27px sans-serif';ctx.fillText(`${player.displayName} · ${ed.editionYear}`,268,y);
  ctx.fillStyle='#E11D48';ctx.fillText(String(ed.baseOvr),930,y);
 });
 ctx.fillStyle='#94A3B8';ctx.font='22px sans-serif';ctx.fillText('Fictional brackets · Ratings for game balance',76,1240);
 ctx.fillText('Not an official Riot / Acer product',76,1280);
 return canvas.toDataURL('image/png');
}
