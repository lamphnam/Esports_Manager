import {useState} from 'react';
import {X} from 'lucide-react';
import {createDraft,DraftSession,draftComplete,pickDraftCard,rerollDraft,simulateDraftCircuit,CircuitStage,RerollScope} from '../lib/legacyDraft/engine';
import {draftShareImage} from '../lib/legacyDraft/share';
import {getEditionById,getPlayerById} from '../data/cardCatalog';
import {LEGACY_TEAMS,ROLES} from '../data/legacyPool';
import {ENABLE_REAL_CLUB_NAMES} from '../data/featureFlags';
import {useDialog} from '../lib/useDialog';

export function LegacyDraftModal({onClose,onClaim}:{onClose:()=>void;onClaim:(draft:DraftSession)=>boolean}){
 const dialog=useDialog(onClose),[draft,setDraft]=useState(()=>createDraft(Date.now()));
 const [stages,setStages]=useState<CircuitStage[]|null>(null),[message,setMessage]=useState('');
 const team=LEGACY_TEAMS.find(t=>t.id===draft.offer?.teamId);
 const saveImage=()=>{if(!stages)return;const anchor=document.createElement('a');anchor.download=`apac-draft-${draft.seed}.png`;anchor.href=draftShareImage(draft,stages);anchor.click();};
 const labels:Record<RerollScope,string>={REGION:'Đổi Khu Vực',CLUB:'Đổi CLB',YEAR:'Đổi Năm'};
 return <div className="fixed inset-0 z-50 bg-bg/90 flex items-center justify-center p-4">
  <div ref={dialog} role="dialog" aria-modal="true" aria-label="Golden Road Draft" tabIndex={-1} className="w-full max-w-4xl max-h-[90dvh] overflow-y-auto bg-surface border border-gold/40 rounded-xl p-5 space-y-5">
   <div className="flex justify-between gap-3"><div><h2 className="font-display font-bold text-2xl">Golden Road Draft</h2><p className="text-xs text-fg-subtle">Bản thử nghiệm · Seed {draft.seed}</p></div><button aria-label="Đóng Draft" className="min-w-11 min-h-11" onClick={onClose}><X/></button></div>
   <p className="text-sm text-fg-muted">Lập đội năm vai trò từ các mùa thẻ lịch sử. Mỗi tuyển thủ chỉ dùng một lần; ba lượt đổi đề nghị dùng một lần cho từng phạm vi.</p>
   <div className="grid sm:grid-cols-5 gap-2">{ROLES.map(role=>{const ed=draft.slots[role]?getEditionById(draft.slots[role]!):null;return <div key={role} className="bg-bg p-3 border border-line rounded text-sm"><span className="text-gold">{role}</span><p>{ed?getPlayerById(ed.playerId)!.displayName:'Chưa chọn'}</p><p className="text-xs text-fg-subtle">{ed?`${ed.editionYear} · OVR ${ed.baseOvr}`:'Slot còn trống'}</p></div>;})}</div>
   {!draftComplete(draft)&&<section className="space-y-3">
    {draft.offer&&team?<><p className="font-bold text-info">{draft.offer.region} · {ENABLE_REAL_CLUB_NAMES?team.name:team.teamAlias} · {draft.offer.year}</p><div className="flex flex-wrap gap-2">{(['REGION','CLUB','YEAR'] as const).map(scope=><button key={scope} disabled={draft.used[scope]} className="min-h-11 px-3 rounded border border-line disabled:opacity-40" onClick={()=>setDraft(rerollDraft(draft,scope))}>{labels[scope]}{draft.used[scope]?' · Đã dùng':''}</button>)}</div><div className="grid sm:grid-cols-2 gap-2">{draft.offer.editionIds.map(id=>{const edition=getEditionById(id)!,player=getPlayerById(edition.playerId)!;return <button key={id} className="min-h-11 p-3 text-left bg-surface border border-info/40 rounded hover:border-gold/40" onClick={()=>setDraft(pickDraftCard(draft,id))}>Chọn {player.displayName} · {edition.role} · OVR {edition.baseOvr}</button>;})}</div></>:<p role="status">Không còn đề nghị hợp lệ. Hãy tạo một lượt mới.</p>}
   </section>}
   {draftComplete(draft)&&!stages&&<div className="space-y-3"><p>Đội hình hoàn chỉnh. Sáu bracket 8 đội hư cấu dùng simulator chính; BO3 cho split, BO5 cho giải toàn cầu. Tự động theo FOCUS_1 sau ván đầu.</p><button className="min-h-11 px-4 rounded bg-gold text-bg font-bold" onClick={()=>setStages(simulateDraftCircuit(draft))}>Mô Phỏng Sáu Chặng</button></div>}
   {stages&&<section className="space-y-3">{stages.map(stage=><details key={stage.name} className="bg-bg p-3 rounded border border-line"><summary>{stage.name} · {stage.format} · {stage.userWins}/3 series thắng · Hư cấu</summary><div className="space-y-2 mt-3 text-sm">{stage.matches.map((match,i)=><p key={i} className={match.hasUser?'text-gold':'text-fg-subtle'}>Vòng {match.round}: {match.teamA} {match.score} {match.teamB} · Thắng: {match.winner}</p>)}</div></details>)}<p className="text-xs text-fg-muted">Thưởng 50 Credits + một thẻ Legacy đã chọn; tối đa hai seed/ngày, mỗi seed một lần.</p><button className="min-h-11 px-4 rounded bg-info mr-3" onClick={()=>setMessage(onClaim(draft)?'Đã nhận 50 Credits và một thẻ Legacy.':'Không thể nhận: seed đã thưởng hoặc đã đủ trần ngày.')}>Nhận Thưởng Draft</button><button className="min-h-11 px-4 border rounded" onClick={saveImage}>Tải Ảnh Tổng Kết</button><p role="status">{message}</p></section>}
   <button className="min-h-11 px-4 border border-line rounded" onClick={()=>{setDraft(createDraft(Date.now()));setStages(null);setMessage('');}}>Tạo Lượt Mới</button>
   <p className="text-xs text-fg-subtle">Dữ liệu rating tham khảo Golden Road, đã được điều chỉnh cho game. Mô phỏng độc lập, không phải sản phẩm chính thức của Riot/Acer.</p>
  </div>
 </div>;
}
