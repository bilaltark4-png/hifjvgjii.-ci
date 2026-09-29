import React from 'react';
import { X, Download, Share2, PlusSquare, CheckCircle2, Smartphone, Monitor } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  isInstallable,
  isInstalled,
  onInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#240c1a] border border-[#8f6f4d] rounded-3xl p-5 shadow-2xl text-[#f4eadc] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#55273e]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[#3d1329] text-[#f0dcaa]">
              <Download className="w-5 h-5 text-[#c9a26a]" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#f0dcaa]">تثبيت تطبيق حروف الوجع</h2>
              <p className="text-[11px] text-[#b9a394]">على شاشة هاتفك أو حاسوبك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#8f6f4d]/40 flex items-center justify-center text-[#b9a394] hover:text-[#f0dcaa] hover:bg-[#3d1329] transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-3.5">
          {/* App Preview Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#170610] border border-[#8f6f4d]/30">
            <img
              src="/pwa-192x192.png"
              alt="حروف الوجع"
              className="w-12 h-12 rounded-xl object-cover border border-[#c9a26a]/40 shadow-sm"
              onError={(e) => {
                // fallback to svg if png fails in preview
                (e.target as HTMLImageElement).src = '/icon.svg';
              }}
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#f0dcaa]">حروف الوجع</h3>
              <p className="text-[11px] text-[#b9a394]">عبارات حزينة ومؤثرة • تطوير هشام وشيماء</p>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#c9a26a]">
                <span>سريع</span>
                <span>•</span>
                <span>يعمل بدون إنترنت</span>
                <span>•</span>
                <span>حجم خفيف</span>
              </div>
            </div>
          </div>

          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-[#142319] border border-emerald-500/40 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-300">التطبيق مثبت بالفعل على جهازك!</p>
              <p className="text-xs text-[#b9a394] mt-1">
                يمكنك فتحه مباشرة من الشاشة الرئيسية في أي وقت وبدون متصفح.
              </p>
            </div>
          ) : isInstallable ? (
            /* Direct One-Click Install for Android / Chrome / Edge */
            <div className="space-y-3">
              <p className="text-xs text-[#b9a394] leading-relaxed">
                اضغط على الزر أدناه لتثبيت التطبيق مباشرة كبرنامج مستقل على جهازك مع تجربة شاشة كاملة وسرعة فائقة.
              </p>
              <button
                onClick={async () => {
                  const success = await onInstall();
                  if (success) {
                    onClose();
                  }
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#f0dcaa] via-[#e5c58a] to-[#c9a26a] text-[#2a1408] font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#2a1408]" />
                <span>تثبيت التطبيق الآن</span>
              </button>
            </div>
          ) : isIOS ? (
            /* Guided iOS Safari Flow */
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f0dcaa]">
                <Smartphone className="w-4 h-4 text-[#c9a26a]" />
                <span>طريقة التثبيت على أجهزة iPhone و iPad:</span>
              </div>
              <ol className="text-xs text-[#b9a394] space-y-2 pr-1">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3d1329] border border-[#8f6f4d] text-[#f0dcaa] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    اضغط على أيقونة <strong className="text-[#f0dcaa]">المشاركة</strong> <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-[#e58aa6]" /> في شريط متصفح سفاري (Safari).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3d1329] border border-[#8f6f4d] text-[#f0dcaa] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    مرر لأسفل واختر <strong className="text-[#f0dcaa]">"إضافة إلى الشاشة الرئيسية"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-[#c9a26a]" /> (Add to Home Screen).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3d1329] border border-[#8f6f4d] text-[#f0dcaa] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    اضغط على <strong className="text-[#f0dcaa]">"إضافة" (Add)</strong> في الزاوية العلوية لتثبيت التطبيق فوراً.
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            /* Desktop / Other Browsers instructions */
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f0dcaa]">
                <Monitor className="w-4 h-4 text-[#c9a26a]" />
                <span>التثبيت من المتصفح:</span>
              </div>
              <p className="text-xs text-[#b9a394] leading-relaxed">
                اضغط على أيقونة <strong className="text-[#f0dcaa]">التثبيت (⊕ أو السهم)</strong> الموجودة في شريط عنوان المتصفح بالأعلى، أو من قائمة المتصفح (⋮) ثم اختر <strong className="text-[#f0dcaa]">"تثبيت التطبيق"</strong>.
              </p>
              <button
                onClick={async () => {
                  await onInstall();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#f0dcaa] to-[#c9a26a] text-[#2a1408] font-bold text-xs flex items-center justify-center gap-2 hover:brightness-105 active:scale-98 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#2a1408]" />
                <span>محاولة التثبيت المباشر</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#55273e] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#3d1329] text-xs font-bold text-[#f0dcaa] hover:bg-[#4d1834] transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
