import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { backupAdvice, detectStorageContext } from '../lib/environment';
import { useDialog } from '../lib/useDialog';

export function RecoveryModal({onClose}:{onClose:()=>void}) {
  const {club,resetGame,exportRecoveryCode,restoreFromRecoveryCode,backup}=useGame();
  const advice=backupAdvice(detectStorageContext());
  const [code,setCode]=useState(''), [input,setInput]=useState(''), [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false), [confirmReset,setConfirmReset]=useState(false);
  const field=useRef<HTMLTextAreaElement>(null);
  const dialog=useDialog(onClose);
  useEffect(()=>{
    let active=true;
    if(club) exportRecoveryCode().then(value=>{if(active)setCode(value);}).catch(()=>{if(active)setStatus('Không tạo được mã. Trình duyệt cần hỗ trợ CompressionStream.');});
    return()=>{active=false;};
  },[club]);
  const copy=async()=>{
    try {await navigator.clipboard.writeText(code);setStatus('Đã Sao Chép');backup.markBackedUp();}
    catch {
      field.current?.focus();field.current?.select();
      let copied=false;try{copied=document.execCommand('copy');}catch{}
      if(copied)backup.markBackedUp();
      setStatus(copied?'Đã Sao Chép':'Không thể sao chép tự động. Mã đã được chọn; hãy dùng Sao chép hoặc Ctrl+C.');
    }
  };
  const restore=async()=>{
    setBusy(true);setStatus('Đang kiểm tra mã...');
    const restored=await restoreFromRecoveryCode(input);
    setBusy(false);
    if(restored)onClose();else setStatus('Mã không hợp lệ, bị hỏng hoặc phiên bản chưa hỗ trợ. Save hiện tại được giữ nguyên.');
  };
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-bg/90 p-4">
    <div ref={dialog} role="dialog" aria-modal="true" aria-label="Sao Lưu & Khôi Phục Dữ Liệu" tabIndex={-1} className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-line bg-surface p-5 text-fg space-y-4">
      <div className="flex justify-between items-center"><h2 className="font-bold">Sao Lưu & Khôi Phục Dữ Liệu</h2><button className="min-w-11 min-h-11" aria-label="Đóng khôi phục" onClick={onClose}><X/></button></div>
      <p className="text-sm text-fg-muted">Recovery Code chứa bản save tại thời điểm sao lưu. Hãy tạo bản sao mới sau khi chơi; mã cũ chỉ khôi phục tiến trình cũ. Đây không phải tài khoản server.</p>
      {club && <p role="status" className={`text-sm ${backup.dirty?'text-gold':'text-fg-muted'}`}>{backup.lastBackupAt?`Sao lưu gần nhất: ${new Date(backup.lastBackupAt).toLocaleString('vi-VN')}. `:'Chưa sao lưu lần nào trên thiết bị này. '}{backup.dirty?'Có tiến trình mới chưa được sao lưu.':'Chưa có thay đổi đáng kể kể từ lần sao lưu.'}</p>}
      {advice.map(line=><p key={line} className="text-xs text-fg-muted">{line}</p>)}
      {club && <><label className="block text-sm">Bản save hiện tại<textarea ref={field} aria-label="Recovery Code hiện tại" className="mt-2 w-full h-28 bg-bg p-3 font-mono text-xs break-all select-text" readOnly value={code} onCopy={()=>backup.markBackedUp()}/></label><button className="min-h-11 px-4 rounded bg-info/10" disabled={!code} onClick={copy}>Sao Chép</button></>}
      <label className="block text-sm">Nhập mã đã lưu<textarea aria-label="Nhập Recovery Code" className="mt-2 w-full h-28 bg-bg p-3 font-mono text-xs select-text" value={input} onChange={e=>setInput(e.target.value)} maxLength={500001}/></label>
      <p className="text-xs text-fg-muted">Khôi phục sẽ thay thế tiến trình trên thiết bị này bằng bản save trong mã.</p>
      <button className="min-h-11 px-4 rounded bg-info disabled:opacity-50" disabled={busy||!input.trim()} onClick={restore}>Khôi Phục Save</button>
      <p role="status" className="text-sm text-gold">{status}</p>
      {club && <div className="border-t border-line pt-3">{confirmReset?<><p>Xóa tiến trình và tạo CLB mới?</p><button className="min-h-11 px-3 text-danger" onClick={()=>{resetGame();onClose();}}>Xác Nhận Xóa</button><button className="min-h-11 px-3" onClick={()=>setConfirmReset(false)}>Hủy Bỏ</button></>:<button className="min-h-11 text-danger" onClick={()=>setConfirmReset(true)}>Chơi Lại Từ Đầu (Reset Save)</button>}</div>}
    </div>
  </div>;
}
