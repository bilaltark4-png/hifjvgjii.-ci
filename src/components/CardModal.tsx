import React, { useRef, useState, useEffect } from 'react';
import { Quote } from '../data/quotes';
import { X, Download, Share2, Sparkles, Check } from 'lucide-react';

interface CardModalProps {
  quote: Quote;
  onClose: () => void;
  onToast: (msg: string) => void;
}

type AspectRatio = 'story' | 'square' | 'post';
type ThemeId = 'midnight' | 'vintage' | 'charcoal' | 'mist';

interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgGradStart: string;
  bgGradEnd: string;
  textColor: string;
  accentColor: string;
  borderCol: string;
  subColor: string;
  stars: boolean;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'midnight',
    name: 'عتمة ونبيذ',
    bgGradStart: '#3d1329',
    bgGradEnd: '#13050d',
    textColor: '#fdfbf7',
    accentColor: '#f0dcaa',
    borderCol: '#8f6f4d',
    subColor: '#c9a26a',
    stars: true
  },
  {
    id: 'vintage',
    name: 'ورق عتيق',
    bgGradStart: '#2d241e',
    bgGradEnd: '#19130f',
    textColor: '#f7f1e5',
    accentColor: '#e0b57c',
    borderCol: '#7c5a3d',
    subColor: '#a68a6d',
    stars: false
  },
  {
    id: 'charcoal',
    name: 'رماد وورد',
    bgGradStart: '#241a22',
    bgGradEnd: '#0f0a0e',
    textColor: '#fbeff3',
    accentColor: '#e58aa6',
    borderCol: '#68404f',
    subColor: '#bfa0ac',
    stars: true
  },
  {
    id: 'mist',
    name: 'ضباب الحنين',
    bgGradStart: '#1d222d',
    bgGradEnd: '#0c0f14',
    textColor: '#f0f4f8',
    accentColor: '#9ec5e8',
    borderCol: '#455a71',
    subColor: '#8a9fae',
    stars: true
  }
];

export const CardModal: React.FC<CardModalProps> = ({ quote, onClose, onToast }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [theme, setTheme] = useState<ThemeId>('midnight');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('square');
  const [fontFamily, setFontFamily] = useState<'Amiri' | 'Tajawal'>('Tajawal');
  const [showWatermark, setShowWatermark] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    drawCanvas();
  }, [quote, theme, aspectRatio, fontFamily, showWatermark]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1080;
    let height = 1080;

    if (aspectRatio === 'story') {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === 'post') {
      width = 1080;
      height = 1350;
    }

    canvas.width = width;
    canvas.height = height;

    const t = THEMES.find((item) => item.id === theme) || THEMES[0];

    // Background Gradient
    const grad = ctx.createRadialGradient(
      width / 2,
      height * 0.35,
      100,
      width / 2,
      height / 2,
      height * 0.8
    );
    grad.addColorStop(0, t.bgGradStart);
    grad.addColorStop(1, t.bgGradEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Stars / Dust
    if (t.stars) {
      ctx.fillStyle = t.accentColor;
      const starCount = 35;
      for (let i = 0; i < starCount; i++) {
        const x = (Math.sin(i * 99 + 1) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 33 + 2) * 0.5 + 0.5) * height;
        const radius = (i % 3 === 0 ? 2.5 : 1.5);
        ctx.globalAlpha = (i % 4 === 0 ? 0.6 : 0.25);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    // Outer Decorative Border Frame
    const margin = width * 0.07;
    ctx.strokeStyle = t.borderCol;
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Inner Corner accents
    const cornerSize = 24;
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 3;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(margin - 6, margin + cornerSize);
    ctx.lineTo(margin - 6, margin - 6);
    ctx.lineTo(margin + cornerSize, margin - 6);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(width - margin + 6, margin + cornerSize);
    ctx.lineTo(width - margin + 6, margin - 6);
    ctx.lineTo(width - margin - cornerSize, margin - 6);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(margin - 6, height - margin - cornerSize);
    ctx.lineTo(margin - 6, height - margin + 6);
    ctx.lineTo(margin + cornerSize, height - margin + 6);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(width - margin + 6, height - margin - cornerSize);
    ctx.lineTo(width - margin + 6, height - margin + 6);
    ctx.lineTo(width - margin - cornerSize, height - margin + 6);
    ctx.stroke();

    // Top Tag: Category Pill
    const tagY = margin + (aspectRatio === 'story' ? 140 : 80);
    ctx.textAlign = 'center';
    ctx.font = `600 ${aspectRatio === 'story' ? '32px' : '26px'} Tajawal, sans-serif`;
    ctx.fillStyle = t.accentColor;
    ctx.fillText(`✦ ${quote.c} ✦`, width / 2, tagY);

    // Decorative top ornament line
    ctx.strokeStyle = t.borderCol;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, tagY + 28);
    ctx.lineTo(width / 2 + 120, tagY + 28);
    ctx.stroke();

    // Quote Content Text (Multi-line Arabic wrapping with good line spacing)
    ctx.direction = 'rtl';
    const fontSize = aspectRatio === 'story' ? 52 : (aspectRatio === 'post' ? 48 : 46);
    const lineHeight = fontSize * 1.85;
    ctx.font = `500 ${fontSize}px '${fontFamily}', 'Tajawal', serif`;
    ctx.fillStyle = t.textColor;

    const maxTextWidth = width - margin * 2.8;
    const words = quote.t.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const totalTextHeight = lines.length * lineHeight;
    let startY = (height - totalTextHeight) / 2 + fontSize * 0.4;

    // Opening quotation mark ornament
    ctx.fillStyle = t.accentColor;
    ctx.globalAlpha = 0.35;
    ctx.font = `bold ${fontSize * 1.6}px Amiri, serif`;
    ctx.fillText('“', width / 2, startY - 45);
    ctx.globalAlpha = 1.0;

    // Draw Quote Lines
    ctx.font = `500 ${fontSize}px '${fontFamily}', 'Tajawal', serif`;
    ctx.fillStyle = t.textColor;
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });

    // Bottom Watermark & Branding
    if (showWatermark) {
      const bottomY = height - margin - (aspectRatio === 'story' ? 100 : 65);
      
      // Divider
      ctx.strokeStyle = t.borderCol;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 80, bottomY - 35);
      ctx.lineTo(width / 2 + 80, bottomY - 35);
      ctx.stroke();

      ctx.fillStyle = t.subColor;
      ctx.font = `400 24px 'Tajawal', sans-serif`;
      ctx.fillText('حروف الوجع ✧ كلمـات تلامس القلب', width / 2, bottomY);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    try {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `sad-quote-${quote.id}-${Date.now()}.png`;
      link.href = url;
      link.click();
      onToast('تم تحميل بطاقة العبارة بنجاح');
    } catch (e) {
      onToast('تعذّر تنزيل الصورة');
    } finally {
      setIsExporting(false);
    }
  };

  const shareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          onToast('تعذر معالجة الصورة');
          return;
        }
        const file = new File([blob], `sad-quote-${quote.id}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'حروف الوجع',
            text: quote.t,
            files: [file]
          });
          onToast('تمت مشاركة البطاقة');
        } else {
          downloadImage();
        }
      }, 'image/png');
    } catch (_) {
      downloadImage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#240c1a] border border-[#8f6f4d]/60 rounded-3xl p-5 shadow-2xl max-h-[95vh] flex flex-col text-[#f4eadc]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#55273e]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[#3d1329] text-[#f0dcaa]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#f0dcaa]">تصميم بطاقة العبارة</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#8f6f4d]/40 flex items-center justify-center text-[#b9a394] hover:text-[#f0dcaa] hover:bg-[#3d1329] transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable controls and preview */}
        <div className="overflow-y-auto py-3 space-y-4 pr-1 pl-1">
          {/* Canvas Live Preview */}
          <div className="flex justify-center items-center bg-[#15060f] p-3 rounded-2xl border border-[#4a2536] shadow-inner">
            <canvas
              ref={canvasRef}
              className={`max-h-[290px] w-auto rounded-lg shadow-xl object-contain border border-[#8f6f4d]/30 ${
                aspectRatio === 'story' ? 'aspect-[9/16]' : aspectRatio === 'post' ? 'aspect-[4/5]' : 'aspect-square'
              }`}
            />
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#c9a26a] mb-1.5">الألوان والخلفية</label>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition ${
                    theme === th.id
                      ? 'border-[#f0dcaa] bg-[#3e142b] text-[#f0dcaa] shadow-md'
                      : 'border-[#4a2536] bg-[#220a16] text-[#b9a394] hover:border-[#8f6f4d]'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-1 border border-white/20"
                    style={{ background: `linear-gradient(135deg, ${th.bgGradStart}, ${th.accentColor})` }}
                  />
                  {th.name}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio and Font */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#c9a26a] mb-1.5">مقاس البطاقة</label>
              <div className="flex rounded-xl bg-[#1b0813] border border-[#4a2536] p-1 gap-1">
                <button
                  onClick={() => setAspectRatio('square')}
                  className={`flex-1 py-1.5 text-xs rounded-lg transition ${
                    aspectRatio === 'square' ? 'bg-[#3e142b] text-[#f0dcaa] font-bold' : 'text-[#b9a394]'
                  }`}
                >
                  مربع 1:1
                </button>
                <button
                  onClick={() => setAspectRatio('post')}
                  className={`flex-1 py-1.5 text-xs rounded-lg transition ${
                    aspectRatio === 'post' ? 'bg-[#3e142b] text-[#f0dcaa] font-bold' : 'text-[#b9a394]'
                  }`}
                >
                  بوست 4:5
                </button>
                <button
                  onClick={() => setAspectRatio('story')}
                  className={`flex-1 py-1.5 text-xs rounded-lg transition ${
                    aspectRatio === 'story' ? 'bg-[#3e142b] text-[#f0dcaa] font-bold' : 'text-[#b9a394]'
                  }`}
                >
                  ستوري 9:16
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c9a26a] mb-1.5">الخط العربي</label>
              <div className="flex rounded-xl bg-[#1b0813] border border-[#4a2536] p-1 gap-1">
                <button
                  onClick={() => setFontFamily('Tajawal')}
                  className={`flex-1 py-1.5 text-xs rounded-lg transition font-tajawal ${
                    fontFamily === 'Tajawal' ? 'bg-[#3e142b] text-[#f0dcaa] font-bold' : 'text-[#b9a394]'
                  }`}
                >
                  تجاول
                </button>
                <button
                  onClick={() => setFontFamily('Amiri')}
                  className={`flex-1 py-1.5 text-xs rounded-lg transition font-amiri ${
                    fontFamily === 'Amiri' ? 'bg-[#3e142b] text-[#f0dcaa] font-bold' : 'text-[#b9a394]'
                  }`}
                >
                  أميري (شعري)
                </button>
              </div>
            </div>
          </div>

          {/* Watermark toggle */}
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs text-[#b9a394]">إظهار اسم التطبيق والشعار</span>
            <button
              onClick={() => setShowWatermark(!showWatermark)}
              className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                showWatermark ? 'bg-[#c9a26a] justify-end' : 'bg-[#3e142b] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-3 border-t border-[#55273e] mt-auto">
          <button
            onClick={downloadImage}
            disabled={isExporting}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#f6e6b8] to-[#c9a26a] text-[#2a1408] font-bold flex items-center justify-center gap-2 hover:brightness-105 active:scale-98 transition shadow-lg text-sm"
          >
            <Download className="w-4 h-4" />
            تحميل الصورة
          </button>
          <button
            onClick={shareImage}
            className="py-3 px-4 rounded-2xl bg-[#3d1329] border border-[#8f6f4d] text-[#f0dcaa] font-semibold flex items-center justify-center gap-2 hover:bg-[#4d1934] active:scale-98 transition text-sm"
          >
            <Share2 className="w-4 h-4" />
            مشاركة
          </button>
        </div>
      </div>
    </div>
  );
};
