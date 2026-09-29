import React from 'react';
import { X, Sliders, Type, Clock, Volume2, Music, Moon, Code } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  fontSize: string;
  onChangeFontSize: (size: string) => void;
  fontFamily: 'Tajawal' | 'Amiri' | 'Cairo';
  onChangeFontFamily: (font: 'Tajawal' | 'Amiri' | 'Cairo') => void;
  autoDuration: number;
  onChangeAutoDuration: (dur: number) => void;
  ambientActive: boolean;
  onToggleAmbient: () => void;
  extraDark: boolean;
  onToggleExtraDark: () => void;
  speechRate: number;
  onChangeSpeechRate: (rate: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  fontSize,
  onChangeFontSize,
  fontFamily,
  onChangeFontFamily,
  autoDuration,
  onChangeAutoDuration,
  ambientActive,
  onToggleAmbient,
  extraDark,
  onToggleExtraDark,
  speechRate,
  onChangeSpeechRate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#240c1a] border border-[#8f6f4d]/60 rounded-3xl p-5 shadow-2xl text-[#f4eadc]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#55273e]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[#3d1329] text-[#f0dcaa]">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#f0dcaa]">الإعدادات والمظهر</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#8f6f4d]/40 flex items-center justify-center text-[#b9a394] hover:text-[#f0dcaa] hover:bg-[#3d1329] transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 space-y-4 text-sm">
          {/* Font Family */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#c9a26a]">
              <Type className="w-4 h-4" />
              <span>نوع الخط العربي</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChangeFontFamily('Tajawal')}
                className={`py-2 px-1 rounded-xl text-center border font-tajawal transition ${
                  fontFamily === 'Tajawal'
                    ? 'border-[#f0dcaa] bg-[#3e142b] text-[#f0dcaa] font-bold shadow-md'
                    : 'border-[#4a2536] bg-[#1a0812] text-[#b9a394]'
                }`}
              >
                تجاول (حديث)
              </button>
              <button
                onClick={() => onChangeFontFamily('Amiri')}
                className={`py-2 px-1 rounded-xl text-center border font-amiri text-base transition ${
                  fontFamily === 'Amiri'
                    ? 'border-[#f0dcaa] bg-[#3e142b] text-[#f0dcaa] font-bold shadow-md'
                    : 'border-[#4a2536] bg-[#1a0812] text-[#b9a394]'
                }`}
              >
                أميري (شعري)
              </button>
              <button
                onClick={() => onChangeFontFamily('Cairo')}
                className={`py-2 px-1 rounded-xl text-center border font-cairo transition ${
                  fontFamily === 'Cairo'
                    ? 'border-[#f0dcaa] bg-[#3e142b] text-[#f0dcaa] font-bold shadow-md'
                    : 'border-[#4a2536] bg-[#1a0812] text-[#b9a394]'
                }`}
              >
                كايرو (أنيق)
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#c9a26a]">
              <Type className="w-4 h-4" />
              <span>حجم خط العبارة</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'متوسط', val: '1.25rem' },
                { label: 'كبير', val: '1.45rem' },
                { label: 'كبير جداً', val: '1.75rem' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => onChangeFontSize(item.val)}
                  className={`py-2 px-1 rounded-xl text-center border transition text-xs ${
                    fontSize === item.val
                      ? 'border-[#f0dcaa] bg-[#3e142b] text-[#f0dcaa] font-bold'
                      : 'border-[#4a2536] bg-[#1a0812] text-[#b9a394]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Slide Duration */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#c9a26a]">
              <Clock className="w-4 h-4" />
              <span>سرعة التبديل التلقائي</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '5 ثوانٍ', val: 5 },
                { label: '8 ثوانٍ', val: 8 },
                { label: '12 ثانية', val: 12 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => onChangeAutoDuration(item.val)}
                  className={`py-2 px-1 rounded-xl text-center border transition text-xs ${
                    autoDuration === item.val
                      ? 'border-[#f0dcaa] bg-[#3e142b] text-[#f0dcaa] font-bold'
                      : 'border-[#4a2536] bg-[#1a0812] text-[#b9a394]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extra Dark Midnight Mode */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1b0813] border border-[#4a2536]">
            <div className="flex items-center gap-2.5">
              <span className={`p-1.5 rounded-full transition ${extraDark ? 'bg-[#c9a26a] text-[#1c0913]' : 'bg-[#3d1329] text-[#c9a26a]'}`}>
                <Moon className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#f4eadc]">الوضع المظلم الإضافي (الليلي)</p>
                <p className="text-[11px] text-[#b9a394]">ألوان أكثر حلكة وهدوءاً لراحة العين أثناء السهر</p>
              </div>
            </div>
            <button
              onClick={onToggleExtraDark}
              className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                extraDark ? 'bg-[#c9a26a] justify-end' : 'bg-[#3e142b] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Ambient Rain Sound */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1b0813] border border-[#4a2536]">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-full bg-[#3d1329] text-[#c9a26a]">
                <Music className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#f4eadc]">مؤثر المطر الهادئ</p>
                <p className="text-[11px] text-[#b9a394]">صوت مطر ورنين خافت لأجواء حزينة</p>
              </div>
            </div>
            <button
              onClick={onToggleAmbient}
              className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                ambientActive ? 'bg-[#c9a26a] justify-end' : 'bg-[#3e142b] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* TTS voice rate */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#c9a26a]">
              <Volume2 className="w-4 h-4" />
              <span>سرعة القراءة الصوتية</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeSpeechRate(0.85)}
                className={`py-2 px-1 rounded-xl text-center border transition text-xs ${
                  speechRate === 0.85
                    ? 'border-[#f0dcaa] bg-[#3e142b] text-[#f0dcaa] font-bold'
                    : 'border-[#4a2536] bg-[#1a0812] text-[#b9a394]'
                }`}
              >
                هادئ وحزين (0.85x)
              </button>
              <button
                onClick={() => onChangeSpeechRate(1.0)}
                className={`py-2 px-1 rounded-xl text-center border transition text-xs ${
                  speechRate === 1.0
                    ? 'border-[#f0dcaa] bg-[#3e142b] text-[#f0dcaa] font-bold'
                    : 'border-[#4a2536] bg-[#1a0812] text-[#b9a394]'
                }`}
              >
                طبيعي (1.0x)
              </button>
            </div>
          </div>

          {/* PWA Install Option */}
          <PWAInstallButton variant="settings" />

          {/* Developers Information Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2a0e1b] to-[#1c0913] border border-[#8f6f4d]/50 shadow-inner">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-1.5 rounded-full bg-[#3d1329] text-[#c9a26a]">
                <Code className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#f0dcaa]">فريق التطوير والإشراف</p>
                <p className="text-[11px] text-[#b9a394]">هذا التطبيق تحت إدارة وتطوير</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 py-2 px-3 rounded-xl bg-[#14040e]/90 border border-[#8f6f4d]/40">
              <span className="text-xs font-bold text-[#f0dcaa] tracking-wide">هشام</span>
              <span className="text-xs text-[#c9a26a]">✦</span>
              <span className="text-xs font-bold text-[#f0dcaa] tracking-wide">شيماء</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#55273e]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-[#3d1329] border border-[#8f6f4d] text-[#f0dcaa] font-bold text-sm hover:bg-[#4d1934] transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
