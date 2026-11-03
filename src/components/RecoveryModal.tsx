import { Check, Copy, KeyRound, RefreshCw, X } from 'lucide-react';
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { AudioSynth } from '../lib/audioSynth';

interface RecoveryModalProps {
  onClose: () => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({ onClose }) => {
  const { club, resetGame } = useGame();
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleCopy = () => {
    if (!club) return;
    navigator.clipboard.writeText(club.recoveryCode).catch(() => {});
    setCopied(true);
    AudioSynth.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    resetGame();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-base text-white">
              Sao Lưu & Khôi Phục Dữ Liệu
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 my-5 text-xs text-slate-300">
          <p>
            Dữ liệu câu lạc bộ được lưu tự động trên trình duyệt. Khi chơi qua iframe của cổng bình chọn hoặc đổi thiết bị, bạn có thể dùng mã khôi phục bên dưới:
          </p>

          <div className="p-3.5 bg-slate-900 border border-cyan-500/30 rounded-xl flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">
                MÃ CỨU HỘ DUY NHẤT (RECOVERY CODE)
              </span>
              <span className="text-base font-mono-nums font-bold text-cyan-300 tracking-wider">
                {club?.recoveryCode || 'AR-UNKNOWN'}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg flex items-center gap-1.5 font-semibold text-xs cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã Sao Chép' : 'Sao Chép'}</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>• CLB: <strong className="text-slate-200">{club?.name}</strong></div>
            <div>• Mùa giải: <strong className="text-slate-200">{club?.careerYear}</strong></div>
            <div>• Danh tiếng: <strong className="text-slate-200">{club?.reputation}</strong></div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            {confirmReset ? (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 space-y-2">
                <span className="text-rose-300 font-semibold block text-xs">
                  Bạn có chắc chắn muốn xóa dữ liệu và tạo CLB mới từ đầu?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs cursor-pointer"
                  >
                    Xác Nhận Xóa
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Chơi Lại Từ Đầu (Reset Save)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
