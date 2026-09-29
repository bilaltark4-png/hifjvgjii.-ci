import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  INITIAL_QUOTES,
  Quote
} from './data/quotes';
import {
  Heart,
  Copy,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Sliders,
  Search,
  PenLine,
  ChevronRight,
  ChevronLeft,
  CloudRain,
  Music,
  RotateCw,
  Image as ImageIcon,
  Moon,
  Infinity as InfinityIcon
} from 'lucide-react';
import { CardModal } from './components/CardModal';
import { BrowseModal } from './components/BrowseModal';
import { AddQuoteModal } from './components/AddQuoteModal';
import { SettingsModal } from './components/SettingsModal';
import { ambientSound } from './utils/ambientAudio';
import { generateInfiniteQuote, generateBatchQuotes, PRECOMPUTED_2000_QUOTES } from './utils/infiniteQuotes';
import { MelancholyParticles } from './components/MelancholyParticles';
import { PWAInstallButton } from './components/PWAInstallButton';
import luxuryRomanticBg from './assets/images/romantic_luxury_bg_1790691139779.jpg';

export default function App() {
  // Quotes State - Guaranteed 2,000+ quotes library
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem('sq_custom_quotes');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed, ...PRECOMPUTED_2000_QUOTES];
      }
    } catch (_) {}
    return PRECOMPUTED_2000_QUOTES;
  });

  // Favorites State
  const [favs, setFavs] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sq_favs') || '[]');
    } catch (_) {
      return [];
    }
  });

  // UI State
  const [category, setCategory] = useState<string>('الكل');
  const [favView, setFavView] = useState<boolean>(false);
  const [currentQuote, setCurrentQuote] = useState<Quote>(quotes[0]);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Appearance & Audio State
  const [fontSize, setFontSize] = useState<string>(() => {
    return localStorage.getItem('sq_fs') || '1.45rem';
  });
  const [fontFamily, setFontFamily] = useState<'Tajawal' | 'Amiri' | 'Cairo'>(() => {
    return (localStorage.getItem('sq_font') as any) || 'Tajawal';
  });
  const [extraDark, setExtraDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sq_extra_dark') === 'true';
    } catch (_) {
      return false;
    }
  });
  const [infiniteMode, setInfiniteMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sq_infinite');
      return saved !== null ? saved === 'true' : true;
    } catch (_) {
      return true;
    }
  });
  const [showNightPrompt, setShowNightPrompt] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85);

  // Ambient Rain State
  const [ambientActive, setAmbientActive] = useState<boolean>(false);

  // Auto Slideshow State
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoDuration, setAutoDuration] = useState<number>(8);
  const autoTimerRef = useRef<any>(null);
  const pulseTimerRef = useRef<any>(null);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<'none' | 'card' | 'browse' | 'add' | 'settings'>('none');
  const [selectedForCard, setSelectedForCard] = useState<Quote | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    quotes.forEach((q) => set.add(q.c));
    return ['الكل', ...Array.from(set)];
  }, [quotes]);

  // Active pool of quotes
  const pool = useMemo(() => {
    if (favView) {
      return quotes.filter((q) => favs.includes(q.id));
    }
    if (category === 'الكل') {
      return quotes;
    }
    return quotes.filter((q) => q.c === category);
  }, [quotes, category, favView, favs]);

  // Initialize random quote
  useEffect(() => {
    if (pool.length > 0) {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setCurrentQuote(rand);
      setHistory([rand.id]);
      setHistoryIdx(0);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sq_favs', JSON.stringify(favs));
    } catch (_) {}
  }, [favs]);

  // Save appearance to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sq_fs', fontSize);
      localStorage.setItem('sq_font', fontFamily);
    } catch (_) {}
  }, [fontSize, fontFamily]);

  // Night hours detection (8:00 PM to 6:00 AM)
  useEffect(() => {
    const hour = new Date().getHours();
    const isNightTime = hour >= 20 || hour < 6;
    const isDismissed = sessionStorage.getItem('sq_night_dismissed') === 'true';

    if (isNightTime && !extraDark && !isDismissed) {
      setShowNightPrompt(true);
    }
  }, [extraDark]);

  // Synchronize document body class and persistence
  useEffect(() => {
    if (extraDark) {
      document.body.classList.add('extra-dark');
    } else {
      document.body.classList.remove('extra-dark');
    }
    try {
      localStorage.setItem('sq_extra_dark', String(extraDark));
    } catch (_) {}
  }, [extraDark]);

  const handleToggleExtraDark = () => {
    const nextVal = !extraDark;
    setExtraDark(nextVal);
    setShowNightPrompt(false);
    showToast(nextVal ? 'تم تفعيل الوضع المظلم الإضافي 🌙' : 'تم العودة إلى الوضع القياسي');
  };

  const handleEnableExtraDarkFromPrompt = () => {
    setExtraDark(true);
    setShowNightPrompt(false);
    showToast('تم تفعيل الوضع المظلم الإضافي لراحة عينيك 🌙');
  };

  const handleDismissNightPrompt = () => {
    setShowNightPrompt(false);
    try {
      sessionStorage.setItem('sq_night_dismissed', 'true');
    } catch (_) {}
  };

  // Auto Slideshow handler
  useEffect(() => {
    if (isAutoPlaying) {
      autoTimerRef.current = setInterval(() => {
        handleNextQuote(true);
      }, autoDuration * 1000);
    } else {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    }
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [isAutoPlaying, autoDuration, pool, currentQuote]);

  // Toast utility
  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 2200);
  };

  // Change quote smoothly with automatic pulse effect
  const changeQuote = (q: Quote) => {
    setIsFading(true);
    stopSpeech();

    // Cancel any pending timer and reset pulse state
    if (pulseTimerRef.current) {
      clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
    setIsPulsing(false);

    // Re-trigger animate-card-pulse on next frame so repeated clicks always animate
    requestAnimationFrame(() => {
      setIsPulsing(true);
      // Guarantee removal after animation duration (550ms) to allow next triggers
      pulseTimerRef.current = setTimeout(() => {
        setIsPulsing(false);
        pulseTimerRef.current = null;
      }, 550);
    });

    setTimeout(() => {
      setCurrentQuote(q);
      setIsFading(false);
    }, 220);
  };

  // Next quote (with infinite generator support)
  const handleNextQuote = (isAuto = false) => {
    // If browsing favorites, loop through saved favorites
    if (favView) {
      if (pool.length === 0) {
        showToast('لا توجد عبارات محفوظة بعد');
        return;
      }
      let nextQ: Quote;
      if (pool.length === 1) {
        nextQ = pool[0];
      } else {
        do {
          nextQ = pool[Math.floor(Math.random() * pool.length)];
        } while (nextQ.id === currentQuote?.id);
      }
      changeQuote(nextQ);
      setHistory((prev) => [...prev.slice(0, historyIdx + 1), nextQ.id]);
      setHistoryIdx((prev) => prev + 1);
      return;
    }

    // In Infinite Mode (or 50% procedural mix): Generate brand new unique quote endlessly!
    if (infiniteMode || Math.random() > 0.5) {
      const generated = generateInfiniteQuote(category !== 'الكل' ? category : undefined);
      setQuotes((prev) => [generated, ...prev]);
      changeQuote(generated);
      setHistory((prev) => [...prev.slice(0, historyIdx + 1), generated.id]);
      setHistoryIdx((prev) => prev + 1);
      return;
    }

    if (pool.length === 0) {
      const generated = generateInfiniteQuote(category !== 'الكل' ? category : undefined);
      setQuotes((prev) => [generated, ...prev]);
      changeQuote(generated);
      return;
    }

    let nextQ: Quote;
    if (pool.length === 1) {
      nextQ = pool[0];
    } else {
      do {
        nextQ = pool[Math.floor(Math.random() * pool.length)];
      } while (nextQ.id === currentQuote?.id);
    }

    changeQuote(nextQ);
    setHistory((prev) => [...prev.slice(0, historyIdx + 1), nextQ.id]);
    setHistoryIdx((prev) => prev + 1);

    if (!isAuto && isAutoPlaying) {
      // Keep running
    }
  };

  // Generate single limitless quote immediately
  const handleGenerateInfiniteSingle = () => {
    const generated = generateInfiniteQuote(category !== 'الكل' ? category : undefined);
    setQuotes((prev) => [generated, ...prev]);
    changeQuote(generated);
    setHistory((prev) => [...prev.slice(0, historyIdx + 1), generated.id]);
    setHistoryIdx((prev) => prev + 1);
    showToast('تم توليد عبارة حصرية لا نهائية ✦');
  };

  // Batch generate 10 quotes for library
  const handleGenerateBatch = () => {
    const batch = generateBatchQuotes(10, category !== 'الكل' ? category : undefined);
    setQuotes((prev) => [...batch, ...prev]);
    showToast('تمت إضافة 10 عبارات حصرية للمكتبة ♾️');
  };

  // Previous quote
  const handlePrevQuote = () => {
    if (historyIdx > 0) {
      const prevId = history[historyIdx - 1];
      const target = quotes.find((q) => q.id === prevId);
      if (target) {
        setHistoryIdx((prev) => prev - 1);
        changeQuote(target);
      }
    } else {
      showToast('أنت في بداية السجل');
    }
  };

  // Toggle favorite
  const handleToggleFav = (id?: number) => {
    const targetId = id !== undefined ? id : currentQuote?.id;
    if (targetId === undefined) return;

    if (favs.includes(targetId)) {
      setFavs((prev) => prev.filter((item) => item !== targetId));
      showToast('أُزيلت من المحفوظة');
    } else {
      setFavs((prev) => [...prev, targetId]);
      showToast('تم الحفظ في المفضلة');
    }
  };

  // Copy quote
  const handleCopy = async () => {
    if (!currentQuote) return;
    try {
      await navigator.clipboard.writeText(currentQuote.t);
      showToast('تم نسخ العبارة إلى الحافظة');
    } catch (_) {
      showToast('تعذر النسخ');
    }
  };

  // Share quote
  const handleShare = async () => {
    if (!currentQuote) return;
    const textToShare = `"${currentQuote.t}"\n- من تطبيق حروف الوجع`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'عبارات حزينة - حروف الوجع',
          text: textToShare
        });
        return;
      } catch (e: any) {
        if (e.name === 'AbortError') return;
      }
    }
    // Fallback to WhatsApp
    window.open('https://wa.me/?text=' + encodeURIComponent(textToShare), '_blank', 'noopener');
  };

  // Text to Speech
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      showToast('الاستماع غير مدعوم في متصفحك');
      return;
    }
    if (isMuted) {
      showToast('الصوت مكتوم');
      return;
    }
    if (isPlayingSpeech) {
      stopSpeech();
      return;
    }

    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(currentQuote.t);
    utterance.lang = 'ar-SA';
    utterance.rate = speechRate;

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    setIsPlayingSpeech(true);
    window.speechSynthesis.speak(utterance);
  };

  // Ambient Rain toggle
  const handleToggleAmbient = () => {
    const isNowPlaying = ambientSound.toggle();
    setAmbientActive(isNowPlaying);
    showToast(isNowPlaying ? 'تم تشغيل صوت المطر الهادئ' : 'تم إيقاف صوت المطر');
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSpeech();
      if (ambientActive) {
        ambientSound.stop();
        setAmbientActive(false);
      }
      showToast('تم كتم الصوت');
    } else {
      showToast('تم تشغيل الصوت');
    }
  };

  // Add custom quote
  const handleAddCustomQuote = (newQ: Quote) => {
    setQuotes((prev) => {
      const updated = [newQ, ...prev];
      const customOnly = updated.filter((q) => q.isCustom);
      try {
        localStorage.setItem('sq_custom_quotes', JSON.stringify(customOnly));
      } catch (_) {}
      return updated;
    });
    changeQuote(newQ);
  };

  // Toggle favorite view
  const handleToggleFavView = () => {
    if (!favView && favs.length === 0) {
      showToast('لا توجد عبارات محفوظة بعد');
      return;
    }
    const nextFavView = !favView;
    setFavView(nextFavView);
    if (nextFavView) {
      const savedQuotes = quotes.filter((q) => favs.includes(q.id));
      if (savedQuotes.length > 0) {
        changeQuote(savedQuotes[0]);
      }
    }
  };

  const isCurrentFav = currentQuote ? favs.includes(currentQuote.id) : false;

  const fontClass =
    fontFamily === 'Amiri' ? 'font-amiri' : fontFamily === 'Cairo' ? 'font-cairo' : 'font-tajawal';

  return (
    <div className="relative min-h-screen text-[#f4eadc] flex flex-col justify-between selection:bg-[#c9a26a]/30 selection:text-[#f0dcaa] overflow-hidden">
      {/* Romantic Luxury Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={luxuryRomanticBg}
          alt=""
          className={`w-full h-full object-cover transition-all duration-1000 scale-105 ${
            extraDark
              ? 'opacity-40 brightness-75 contrast-125 sepia-[0.1]'
              : 'opacity-75 brightness-95 contrast-115 sepia-[0.12]'
          }`}
        />
        {/* Warm Velvet Wine, Royal Crimson & Bordeaux Gradient Layer */}
        <div
          className={`absolute inset-0 transition-colors duration-1000 ${
            extraDark
              ? 'bg-gradient-to-b from-[#14030d]/92 via-[#0a0207]/88 to-[#030002]/96'
              : 'bg-gradient-to-b from-[#28091a]/75 via-[#1a0511]/65 to-[#0e0208]/85'
          }`}
        />
        {/* Warm Candlelit Amber & Champagne Gold Chandelier Aura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_-10%,rgba(248,220,165,0.24),rgba(218,165,85,0.1)_45%,transparent_80%)]" />
        
        {/* Romantic Warm Ruby Hearth & Rose Glow (Center Subtle Warmth) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(168,36,78,0.14),transparent_65%)]" />

        {/* Floating Romantic Rose Quartz & Warm Amber Glowing Orbs */}
        <div
          className="absolute top-1/6 -left-20 w-96 h-96 rounded-full bg-[#e87299]/15 blur-[100px] pointer-events-none animate-pulse"
          style={{ animationDuration: '7s' }}
        />
        <div
          className="absolute top-1/2 -right-24 w-[420px] h-[420px] rounded-full bg-[#f0bd67]/16 blur-[110px] pointer-events-none animate-pulse"
          style={{ animationDuration: '9s' }}
        />
        <div
          className="absolute -bottom-20 left-1/4 w-[500px] h-[320px] rounded-full bg-[#9e1c44]/16 blur-[120px] pointer-events-none animate-pulse"
          style={{ animationDuration: '11s' }}
        />
      </div>

      {/* Melancholy Mystery Floating CSS Particles */}
      <MelancholyParticles extraDark={extraDark} />

      {/* Decorative Night Stars */}
      <span className="star select-none fixed top-16 left-4 text-[#e2c285] text-xl opacity-40 animate-twinkle pointer-events-none z-10">
        ✦
      </span>
      <span className="star select-none fixed top-44 right-6 text-[#f6e6b8] text-sm opacity-35 animate-twinkle-delay-1 pointer-events-none z-10">
        ✦
      </span>
      <span className="star select-none fixed bottom-48 left-8 text-[#e2c285] text-base opacity-35 animate-twinkle-delay-2 pointer-events-none z-10">
        ✧
      </span>
      <span className="star select-none fixed bottom-16 right-7 text-[#f6e6b8] text-lg opacity-45 animate-twinkle pointer-events-none z-10">
        ✦
      </span>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto px-4 pt-[calc(14px+env(safe-area-inset-top,0px))] pb-[calc(24px+env(safe-area-inset-bottom,0px))] flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-1.5 pb-3.5 border-b border-[#4a2536]">
          <div className="flex items-center gap-1.5">
            {/* Settings & Appearance */}
            <button
              onClick={() => setActiveModal('settings')}
              className="w-10 h-10 rounded-full border border-[#8f6f4d] bg-[#2a0e1b] text-[#f0dcaa] flex items-center justify-center hover:bg-[#3a1626] active:scale-95 transition shadow-sm"
              title="الإعدادات وحجم الخط"
              aria-label="الإعدادات وحجم الخط"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Ambient Rain Sound Toggle */}
            <button
              onClick={handleToggleAmbient}
              className={`w-10 h-10 rounded-full border border-[#8f6f4d] flex items-center justify-center transition shadow-sm ${
                ambientActive
                  ? 'bg-gradient-to-br from-[#c9a26a] to-[#8f6f4d] text-[#1c0913]'
                  : 'bg-[#2a0e1b] text-[#f0dcaa] hover:bg-[#3a1626]'
              }`}
              title={ambientActive ? 'إيقاف صوت المطر' : 'تشغيل صوت المطر الهادئ'}
              aria-label="صوت المطر"
            >
              <CloudRain className={`w-4 h-4 ${ambientActive ? 'animate-pulse' : ''}`} />
            </button>

            {/* Sound Mute/Unmute */}
            <button
              onClick={handleToggleMute}
              className="w-10 h-10 rounded-full border border-[#8f6f4d] bg-[#2a0e1b] text-[#f0dcaa] flex items-center justify-center hover:bg-[#3a1626] active:scale-95 transition shadow-sm"
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              aria-label="كتم الصوت"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Extra Dark Midnight Mode Toggle */}
            <button
              onClick={handleToggleExtraDark}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition shadow-sm ${
                extraDark
                  ? 'bg-gradient-to-br from-[#c9a26a] to-[#8f6f4d] text-[#1c0913] border-[#c9a26a]'
                  : 'border-[#8f6f4d] bg-[#2a0e1b] text-[#f0dcaa] hover:bg-[#3a1626]'
              }`}
              title={extraDark ? 'إلغاء الوضع المظلم الإضافي' : 'تفعيل الوضع المظلم الإضافي (الليلي)'}
              aria-label="الوضع المظلم الإضافي"
            >
              <Moon className={`w-4 h-4 ${extraDark ? 'fill-current' : ''}`} />
            </button>

            {/* Favorites Button with Badge */}
            <button
              onClick={handleToggleFavView}
              className={`w-10 h-10 rounded-full border border-[#8f6f4d] flex items-center justify-center relative transition shadow-sm ${
                favView
                  ? 'bg-[#3d1329] text-[#e58aa6] border-[#e58aa6]'
                  : 'bg-[#2a0e1b] text-[#f0dcaa] hover:bg-[#3a1626]'
              }`}
              title="المحفوظة"
              aria-label="المحفوظة"
            >
              <Heart className={`w-4 h-4 ${favView || favs.length > 0 ? 'fill-current' : ''}`} />
              {favs.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#e58aa6] text-[#2a0e1b] text-[10px] font-bold flex items-center justify-center px-1 shadow">
                  {favs.length}
                </span>
              )}
            </button>
          </div>

          {/* Right Brand info & Install Button */}
          <div className="flex items-center gap-2">
            <PWAInstallButton variant="header" onToast={showToast} />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#f0dcaa] tracking-wide hidden sm:inline">حروف الوجع</span>
              <div className="w-9 h-9 rounded-full border-[1.5px] border-[#c9a26a] bg-[#2a0e1b] text-[#f0dcaa] flex items-center justify-center shadow-inner font-serif text-lg">
                ✦
              </div>
            </div>
          </div>
        </header>

        {/* Night Detection Suggestion Banner */}
        {showNightPrompt && !extraDark && (
          <div className="mt-3 p-3 rounded-2xl bg-[#14040e]/95 border border-[#8f6f4d] shadow-xl flex items-center justify-between gap-2.5 animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-2 rounded-full bg-[#270b1b] text-[#f0dcaa] border border-[#c9a26a]/40 shadow-inner shrink-0">
                <Moon className="w-4 h-4 text-[#f0dcaa]" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#f0dcaa] flex items-center gap-1">
                  <span>حلّ وقت الليل</span>
                  <span>🌙</span>
                </p>
                <p className="text-[11px] text-[#b9a394] truncate">
                  هل ترغب بتفعيل الوضع المظلم الإضافي لراحة عينيك؟
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleEnableExtraDarkFromPrompt}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#f0dcaa] to-[#c9a26a] text-[#2a1408] text-xs font-bold shadow hover:brightness-105 active:scale-95 transition cursor-pointer"
              >
                تفعيل
              </button>
              <button
                onClick={handleDismissNightPrompt}
                className="px-2 py-1.5 rounded-xl text-[#b9a394] hover:text-[#f0dcaa] text-xs transition cursor-pointer"
                title="تجاهل"
              >
                لاحقاً
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="text-center py-4">
          <div className="inline-flex items-center gap-1.5 border border-[#8f6f4d] bg-[#2a0e1b]/80 backdrop-blur-xs rounded-full px-3.5 py-1 text-xs text-[#f0dcaa] shadow-xs">
            <span>✧</span>
            <span>أكثر من {quotes.length.toLocaleString('ar-EG')} عبارة تلامس الروح</span>
            <span>✧</span>
          </div>
          <h1 className="text-2xl font-black text-[#f0dcaa] mt-2 tracking-tight">عبارات حزينة</h1>
          <p className="text-xs text-[#b9a394] mt-1 font-light">
            عبارات تلامس الروح حين يعجز اللسان عن الكلام
          </p>

          {/* Quick Shortcuts: Browse Library, Add Quote & Install */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-3">
            <button
              onClick={() => setActiveModal('browse')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2a0e1b] border border-[#c9a26a]/60 text-xs text-[#f0dcaa] hover:bg-[#3a1626] transition shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#c9a26a]" />
              <span className="font-semibold">مكتبة الـ {quotes.length.toLocaleString('ar-EG')} عبارة</span>
            </button>
            <button
              onClick={() => setActiveModal('add')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2a0e1b] border border-[#8f6f4d]/60 text-xs text-[#c9a26a] hover:bg-[#3a1626] transition shadow-xs cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>أضف عبارتك</span>
            </button>
            <PWAInstallButton variant="hero" onToast={showToast} />
          </div>
        </section>

        {/* Category Chips Bar */}
        <div className="flex gap-2 overflow-x-auto py-2.5 px-0.5 no-scrollbar shrink-0" role="group" aria-label="التصنيفات">
          {categories.map((cat) => {
            const isSelected = !favView && category === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setFavView(false);
                  // pick a quote from new category
                  const newPool = cat === 'الكل' ? quotes : quotes.filter((q) => q.c === cat);
                  if (newPool.length > 0) {
                    const rand = newPool[Math.floor(Math.random() * newPool.length)];
                    changeQuote(rand);
                  }
                }}
                className={`flex-none px-4 py-1.5 rounded-2xl text-xs transition border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#f0dcaa] to-[#c9a26a] text-[#2a1408] border-[#f0dcaa] font-bold shadow-md'
                    : 'bg-[#2a0e1b] text-[#f4eadc] border-[#8f6f4d]/60 hover:bg-[#3a1626]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* The Quote Card */}
        <main className="mt-3 relative">
          <article
            onAnimationEnd={() => setIsPulsing(false)}
            className={`relative border rounded-[28px] pt-11 pb-5 px-6 min-h-[300px] flex flex-col justify-between transition duration-300 backdrop-blur-md ${
              extraDark
                ? 'bg-gradient-to-b from-[#16040f]/90 via-[#0e020a]/85 to-[#060104]/95 border-[#734b35]/60 shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
                : 'bg-gradient-to-b from-[#3a1325]/85 via-[#2b0d1c]/80 to-[#1f0814]/90 border-[#c9a26a]/40 shadow-[0_20px_50px_rgba(20,5,15,0.7)]'
            } ${isPulsing ? 'animate-card-pulse' : ''}`}
          >
            {/* Top Center Tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2a0e1b] border border-[#8f6f4d] rounded-full px-4 py-1 text-xs text-[#f0dcaa] shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <span>✦</span>
              <span>{favView ? 'المحفوظة' : currentQuote?.c || 'وجع القلب'}</span>
              <span>✦</span>
            </div>

            {/* Previous/Next Navigation Overlays on Desktop/Tablet hover */}
            <div className="flex items-center justify-between w-full opacity-60 hover:opacity-100 transition absolute top-5 left-0 right-0 px-4 pointer-events-none">
              <button
                onClick={handlePrevQuote}
                className="pointer-events-auto p-1 text-[#b9a394] hover:text-[#f0dcaa] transition"
                title="العبارة السابقة"
                aria-label="العبارة السابقة"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleNextQuote(false)}
                className="pointer-events-auto p-1 text-[#b9a394] hover:text-[#f0dcaa] transition"
                title="العبارة التالية"
                aria-label="العبارة التالية"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Central Quote Text */}
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4 px-1">
              <div
                className={`transition-all duration-300 transform leading-relaxed select-text ${fontClass} ${
                  isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
                style={{ fontSize }}
              >
                "{currentQuote?.t}"
              </div>
              {currentQuote?.author && (
                <span className="mt-3 text-xs text-[#c9a26a] font-normal">
                  — {currentQuote.author}
                </span>
              )}
            </div>

            {/* Card Footer Info */}
            <div className="flex items-center justify-between border-t border-[#553040] pt-3 text-xs text-[#b9a394]">
              <span>العبارة رقم {currentQuote ? currentQuote.id : 1}</span>
              <span className="border border-[#6a4653] rounded-full px-3 py-0.5 text-[11px] text-[#f0dcaa]">
                {currentQuote?.c}
              </span>
            </div>
          </article>
        </main>

        {/* Primary Action: New Quote & Limitless Stream */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleNextQuote(false)}
            className="flex-1 border-0 rounded-full py-3.5 px-6 text-base font-bold text-[#2a1408] bg-gradient-to-r from-[#f6e6b8] via-[#e5c58a] to-[#c9a26a] cursor-pointer flex justify-center items-center gap-2.5 shadow-[0_8px_24px_rgba(201,162,106,0.25)] hover:brightness-105 active:scale-98 transition"
          >
            <RotateCw className="w-5 h-5 text-[#2a1408]" />
            <span>عبارة جديدة</span>
          </button>

          {/* Instant Limitless Quote Generator */}
          <button
            onClick={handleGenerateInfiniteSingle}
            className="px-4 py-3.5 rounded-full border border-[#c9a26a]/80 bg-[#2a0e1b]/90 text-[#f0dcaa] hover:bg-[#3d1329] active:scale-95 transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            title="توليد عبارة حصرية لا نهائية فوراً"
          >
            <InfinityIcon className="w-5 h-5 text-[#e58aa6]" />
            <span className="text-xs font-bold whitespace-nowrap">لا نهائي ✦</span>
          </button>
        </div>

        {/* Limitless Mode Status Pill */}
        <div className="flex items-center justify-between px-3 pt-2 text-[11px] text-[#b9a394]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>توليد عبارات لا نهائي مستمر</span>
          </span>
          <button
            onClick={() => {
              const nextMode = !infiniteMode;
              setInfiniteMode(nextMode);
              showToast(nextMode ? 'تم تفعيل التدفق اللانهائي ♾️' : 'تم إيقاف التدفق اللانهائي');
            }}
            className="text-[#c9a26a] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <InfinityIcon className="w-3.5 h-3.5 text-[#e58aa6]" />
            <span>{infiniteMode ? 'التدفق اللانهائي: مفعّل' : 'التدفق اللانهائي: متوقف'}</span>
          </button>
        </div>

        {/* Quick Action Buttons Grid (5 actions + Card Designer) */}
        <div className="grid grid-cols-6 gap-1.5 mt-3.5">
          {/* Save / Favorite */}
          <button
            onClick={() => handleToggleFav()}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl border border-[#8f6f4d] bg-[#2a0e1b] transition active:scale-95 ${
              isCurrentFav ? 'text-[#e58aa6] border-[#e58aa6] bg-[#3d1329]' : 'text-[#f0dcaa] hover:bg-[#3a1626]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isCurrentFav ? 'fill-current text-[#e58aa6]' : ''}`} />
            <span className="text-[11px] font-medium">{isCurrentFav ? 'محفوظة' : 'حفظ'}</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl border border-[#8f6f4d] bg-[#2a0e1b] text-[#f0dcaa] hover:bg-[#3a1626] active:scale-95 transition"
          >
            <Copy className="w-4 h-4" />
            <span className="text-[11px] font-medium">نسخ</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl border border-[#8f6f4d] bg-[#2a0e1b] text-[#f0dcaa] hover:bg-[#3a1626] active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[11px] font-medium">مشاركة</span>
          </button>

          {/* Text-to-Speech Speak */}
          <button
            onClick={handleSpeak}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl border border-[#8f6f4d] transition active:scale-95 ${
              isPlayingSpeech
                ? 'bg-gradient-to-r from-[#f0dcaa] to-[#c9a26a] text-[#2a1408] border-[#f0dcaa] font-bold'
                : 'bg-[#2a0e1b] text-[#f0dcaa] hover:bg-[#3a1626]'
            }`}
          >
            {isPlayingSpeech ? (
              <Pause className="w-4 h-4 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span className="text-[11px] font-medium">{isPlayingSpeech ? 'إيقاف' : 'استماع'}</span>
          </button>

          {/* Card Designer */}
          <button
            onClick={() => {
              setSelectedForCard(currentQuote);
              setActiveModal('card');
            }}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl border border-[#8f6f4d] bg-[#2a0e1b] text-[#f0dcaa] hover:bg-[#3a1626] active:scale-95 transition"
          >
            <ImageIcon className="w-4 h-4 text-[#c9a26a]" />
            <span className="text-[11px] font-medium">بطاقة</span>
          </button>

          {/* Auto slideshow */}
          <button
            onClick={() => {
              setIsAutoPlaying(!isAutoPlaying);
              showToast(!isAutoPlaying ? `تشغيل تلقائي كل ${autoDuration} ثوانٍ` : 'أُوقف التشغيل التلقائي');
            }}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl border border-[#8f6f4d] transition active:scale-95 ${
              isAutoPlaying
                ? 'bg-gradient-to-r from-[#f0dcaa] to-[#c9a26a] text-[#2a1408] border-[#f0dcaa] font-bold'
                : 'bg-[#2a0e1b] text-[#f0dcaa] hover:bg-[#3a1626]'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-[11px] font-medium">تلقائي</span>
          </button>
        </div>

        {/* Developers Branding & Credits Footer */}
        <footer className="mt-5 pt-3.5 border-t border-[#4a2536]/60 text-center pb-2">
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-[#200a16]/80 border border-[#8f6f4d]/40 shadow-xs backdrop-blur-xs">
            <span className="text-[11px] text-[#b9a394]">تطوير وإشراف المطورين:</span>
            <span className="text-xs font-bold text-[#f0dcaa] tracking-wide flex items-center gap-1.5">
              <span>هشام</span>
              <span className="text-[#c9a26a]">✦</span>
              <span>شيماء</span>
            </span>
          </div>
          <p className="text-[10px] text-[#b9a394]/60 mt-1.5">
            جميع الحقوق محفوظة © {new Date().getFullYear()} — حروف الوجع
          </p>
        </footer>
      </div>

      {/* Floating Toast Notification */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-gradient-to-r from-[#f6e6b8] to-[#c9a26a] text-[#2a1408] font-bold text-xs py-2 px-6 rounded-full shadow-2xl transition-all duration-300 z-50 whitespace-nowrap ${
          toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        role="status"
        aria-live="polite"
      >
        {toastMsg}
      </div>

      {/* Modals */}
      {activeModal === 'card' && selectedForCard && (
        <CardModal
          quote={selectedForCard}
          onClose={() => {
            setActiveModal('none');
            setSelectedForCard(null);
          }}
          onToast={showToast}
        />
      )}

      {activeModal === 'browse' && (
        <BrowseModal
          quotes={quotes}
          favs={favs}
          onToggleFav={handleToggleFav}
          onSelectQuote={(q) => changeQuote(q)}
          onClose={() => setActiveModal('none')}
          onToast={showToast}
          onOpenCardDesigner={(q) => {
            setSelectedForCard(q);
            setActiveModal('card');
          }}
          onGenerateMore={handleGenerateBatch}
        />
      )}

      {activeModal === 'add' && (
        <AddQuoteModal
          onAdd={handleAddCustomQuote}
          onClose={() => setActiveModal('none')}
          onToast={showToast}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          fontFamily={fontFamily}
          onChangeFontFamily={setFontFamily}
          autoDuration={autoDuration}
          onChangeAutoDuration={setAutoDuration}
          ambientActive={ambientActive}
          onToggleAmbient={handleToggleAmbient}
          extraDark={extraDark}
          onToggleExtraDark={handleToggleExtraDark}
          speechRate={speechRate}
          onChangeSpeechRate={setSpeechRate}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
