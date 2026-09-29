import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'hero' | 'compact' | 'settings';
  onToast?: (msg: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
  onToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async () => {
    if (isInstalled) {
      if (onToast) onToast('التطبيق مثبت بالفعل على جهازك ✦');
      setModalOpen(true);
      return;
    }

    if (isInstallable) {
      const outcome = await install();
      if (outcome && onToast) {
        onToast('تم تثبيت التطبيق بنجاح! ✦');
      }
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#c9a26a]/70 bg-gradient-to-r from-[#3d1329] to-[#2a0e1b] text-xs font-bold text-[#f0dcaa] hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer ${className}`}
          title="تثبيت التطبيق على جهازك"
        >
          <Download className="w-3.5 h-3.5 text-[#c9a26a] animate-bounce" />
          <span>تثبيت التطبيق</span>
        </button>
      )}

      {variant === 'hero' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2a0e1b] border border-[#8f6f4d]/60 text-xs text-[#c9a26a] hover:bg-[#3a1626] transition shadow-xs cursor-pointer ${className}`}
          title="تثبيت التطبيق"
        >
          <Download className="w-3.5 h-3.5 text-[#e58aa6]" />
          <span>{isInstalled ? 'التطبيق مثبت' : 'تثبيت'}</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleClick}
          className={`w-10 h-10 rounded-full border border-[#8f6f4d] bg-[#2a0e1b] text-[#f0dcaa] flex items-center justify-center hover:bg-[#3a1626] active:scale-95 transition shadow-sm cursor-pointer ${className}`}
          title="تثبيت التطبيق على جهازك"
          aria-label="تثبيت التطبيق"
        >
          <Download className="w-4 h-4 text-[#c9a26a]" />
        </button>
      )}

      {variant === 'settings' && (
        <button
          onClick={handleClick}
          className={`w-full p-3 rounded-2xl bg-gradient-to-r from-[#2a0e1b] to-[#1c0913] border border-[#8f6f4d]/50 hover:border-[#c9a26a] flex items-center justify-between transition cursor-pointer text-right ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-full bg-[#3d1329] text-[#f0dcaa]">
              <Download className="w-4 h-4 text-[#c9a26a]" />
            </span>
            <div>
              <p className="text-xs font-bold text-[#f0dcaa]">تثبيت التطبيق على الهاتف</p>
              <p className="text-[11px] text-[#b9a394]">
                {isInstalled ? 'التطبيق مثبت على جهازك' : 'تشغيل كتطبيق شاشة كاملة وسريع'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#c9a26a] px-3 py-1 rounded-full bg-[#14040e] border border-[#8f6f4d]/40">
            {isInstalled ? 'مثبت ✦' : 'تثبيت الآن'}
          </span>
        </button>
      )}

      <PWAInstallModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isIOS={isIOS}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstall={install}
      />
    </>
  );
};
