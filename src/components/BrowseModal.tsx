import React, { useState, useMemo, useEffect } from 'react';
import { Quote } from '../data/quotes';
import { X, Search, Heart, Copy, Share2, Sparkles, ExternalLink, Infinity as InfinityIcon } from 'lucide-react';

interface BrowseModalProps {
  quotes: Quote[];
  favs: number[];
  onToggleFav: (id: number) => void;
  onSelectQuote: (quote: Quote) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
  onOpenCardDesigner: (quote: Quote) => void;
  onGenerateMore?: () => void;
}

export const BrowseModal: React.FC<BrowseModalProps> = ({
  quotes,
  favs,
  onToggleFav,
  onSelectQuote,
  onClose,
  onToast,
  onOpenCardDesigner,
  onGenerateMore,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('الكل');
  const [visibleLimit, setVisibleLimit] = useState<number>(60);

  const categories = useMemo(() => {
    const set = new Set<string>();
    quotes.forEach((q) => set.add(q.c));
    return ['الكل', ...Array.from(set)];
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchCat = selectedCat === 'الكل' || q.c === selectedCat;
      const matchSearch = searchTerm.trim() === '' || q.t.toLowerCase().includes(searchTerm.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  }, [quotes, selectedCat, searchTerm]);

  // Reset pagination on search or category switch
  useEffect(() => {
    setVisibleLimit(60);
  }, [searchTerm, selectedCat]);

  const visibleQuotes = useMemo(() => {
    return filteredQuotes.slice(0, visibleLimit);
  }, [filteredQuotes, visibleLimit]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onToast('تم نسخ العبارة');
    } catch (_) {
      onToast('تعذر النسخ');
    }
  };

  const shareText = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e: any) {
        if (e.name === 'AbortError') return;
      }
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#240c1a] border border-[#8f6f4d]/60 rounded-3xl p-5 shadow-2xl max-h-[92vh] flex flex-col text-[#f4eadc]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#55273e]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[#3d1329] text-[#f0dcaa]">
              <Search className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#f0dcaa]">مكتبة العبارات (2000+)</h2>
              <p className="text-xs text-[#b9a394]">
                {filteredQuotes.length.toLocaleString('ar-EG')} عبارة متاحة (عرض {visibleQuotes.length.toLocaleString('ar-EG')})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#8f6f4d]/40 flex items-center justify-center text-[#b9a394] hover:text-[#f0dcaa] hover:bg-[#3d1329] transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بكلمة في العبارات (مثلاً: شوق، ليل، دمع، صبر)..."
            className="w-full bg-[#170610] border border-[#8f6f4d]/40 rounded-2xl py-2.5 pr-10 pl-4 text-sm text-[#f4eadc] placeholder-[#b9a394]/60 focus:outline-none focus:border-[#f0dcaa] transition"
          />
          <Search className="w-4 h-4 text-[#c9a26a] absolute right-3.5 top-3.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-2.5 text-xs text-[#b9a394] hover:text-[#f0dcaa] bg-[#3d1329] px-2 py-0.5 rounded-full"
            >
              مسح
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar shrink-0">
          {onGenerateMore && (
            <button
              onClick={onGenerateMore}
              className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-gradient-to-r from-[#e58aa6]/30 to-[#c9a26a]/30 border border-[#e58aa6]/60 text-[#f0dcaa] hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 shrink-0 shadow-sm"
              title="توليد 10 عبارات جديدة لا نهائية"
            >
              <InfinityIcon className="w-3.5 h-3.5 text-[#e58aa6]" />
              <span>توليد 10 عبارات جديدة</span>
            </button>
          )}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition ${
                selectedCat === cat
                  ? 'bg-gradient-to-r from-[#f0dcaa] to-[#c9a26a] text-[#2a1408] border-[#f0dcaa] font-bold'
                  : 'bg-[#1b0813] text-[#b9a394] border-[#4a2536] hover:border-[#8f6f4d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quote List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pl-1 mt-1">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12 text-[#b9a394]">
              <p className="text-base font-semibold">لم نجد عبارات مطابقة لبحثك</p>
              <p className="text-xs mt-1 text-[#b9a394]/70">جرب كلمات أخرى أو اختر تصنيفاً آخر</p>
            </div>
          ) : (
            <>
              {visibleQuotes.map((q) => {
                const isFav = favs.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className="group relative p-3.5 rounded-2xl bg-gradient-to-b from-[#2e0f21] to-[#200a16] border border-[#55273e] hover:border-[#8f6f4d] transition shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#190611] text-[#c9a26a] border border-[#8f6f4d]/30 font-medium">
                        {q.c} {q.isCustom && '✦ خاص بي'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onToggleFav(q.id)}
                          className={`p-1.5 rounded-full transition ${
                            isFav
                              ? 'text-[#e58aa6] bg-[#e58aa6]/15'
                              : 'text-[#b9a394] hover:text-[#e58aa6] hover:bg-[#3d1329]'
                          }`}
                          title={isFav ? 'إزالة من المحفوظة' : 'حفظ بالمفضلة'}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => copyText(q.t)}
                          className="p-1.5 rounded-full text-[#b9a394] hover:text-[#f0dcaa] hover:bg-[#3d1329] transition"
                          title="نسخ العبارة"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => shareText(q.t)}
                          className="p-1.5 rounded-full text-[#b9a394] hover:text-[#f0dcaa] hover:bg-[#3d1329] transition"
                          title="مشاركة"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            onOpenCardDesigner(q);
                            onClose();
                          }}
                          className="p-1.5 rounded-full text-[#b9a394] hover:text-[#f0dcaa] hover:bg-[#3d1329] transition"
                          title="تصميم بطاقة صورة"
                        >
                          <Sparkles className="w-4 h-4 text-[#c9a26a]" />
                        </button>
                      </div>
                    </div>

                    <p
                      onClick={() => {
                        onSelectQuote(q);
                        onClose();
                      }}
                      className="mt-2 text-sm leading-relaxed text-[#f4eadc] cursor-pointer hover:text-[#f0dcaa] transition"
                    >
                      "{q.t}"
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#4a2536]/40 flex items-center justify-between text-[11px] text-[#b9a394]">
                      <span>رقم العبارة #{q.id}</span>
                      <button
                        onClick={() => {
                          onSelectQuote(q);
                          onClose();
                        }}
                        className="text-[#c9a26a] hover:underline flex items-center gap-1 font-medium"
                      >
                        عرض في الواجهة
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {visibleQuotes.length < filteredQuotes.length && (
                <div className="py-3 text-center">
                  <button
                    onClick={() => setVisibleLimit((prev) => prev + 60)}
                    className="px-6 py-2.5 rounded-full bg-[#3d1329] border border-[#8f6f4d] text-xs font-bold text-[#f0dcaa] hover:bg-[#4d1834] transition shadow-md active:scale-95 cursor-pointer"
                  >
                    عرض المزيد (+60 عبارة) — المتبقي {(filteredQuotes.length - visibleQuotes.length).toLocaleString('ar-EG')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
