import React, { useState } from 'react';
import { Quote } from '../data/quotes';
import { X, PenLine, PlusCircle } from 'lucide-react';

interface AddQuoteModalProps {
  onAdd: (newQuote: Quote) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

const CATEGORIES = ['فراق', 'وحدة', 'خذلان', 'شوق', 'صبر', 'عتاب', 'صمت', 'حنين', 'خواطر'];

export const AddQuoteModal: React.FC<AddQuoteModalProps> = ({ onAdd, onClose, onToast }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('خواطر');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      onToast('يرجى كتابة نص العبارة');
      return;
    }

    const newQuote: Quote = {
      id: Date.now(),
      c: category,
      t: text.trim(),
      author: author.trim() || undefined,
      isCustom: true
    };

    onAdd(newQuote);
    onToast('تمت إضافة عبارتك بنجاح');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#240c1a] border border-[#8f6f4d]/60 rounded-3xl p-5 shadow-2xl text-[#f4eadc]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#55273e]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[#3d1329] text-[#f0dcaa]">
              <PenLine className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#f0dcaa]">اكتب عبارتك الخاصة</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#8f6f4d]/40 flex items-center justify-center text-[#b9a394] hover:text-[#f0dcaa] hover:bg-[#3d1329] transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#c9a26a] mb-1.5">
              نص العبارة أو الخاطرة <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب هنا ما يفيض به قلبك من وجع أو حنين..."
              className="w-full bg-[#170610] border border-[#8f6f4d]/40 rounded-2xl p-3 text-sm text-[#f4eadc] placeholder-[#b9a394]/50 focus:outline-none focus:border-[#f0dcaa] transition resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c9a26a] mb-1.5">التصنيف</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs transition border ${
                    category === cat
                      ? 'bg-gradient-to-r from-[#f0dcaa] to-[#c9a26a] text-[#2a1408] border-[#f0dcaa] font-bold'
                      : 'bg-[#1b0813] text-[#b9a394] border-[#4a2536]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c9a26a] mb-1.5">الكاتب أو التوقيع (اختياري)</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="اسمك أو لقبك المستعار..."
              className="w-full bg-[#170610] border border-[#8f6f4d]/40 rounded-xl px-3 py-2 text-sm text-[#f4eadc] placeholder-[#b9a394]/50 focus:outline-none focus:border-[#f0dcaa] transition"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#f6e6b8] to-[#c9a26a] text-[#2a1408] font-bold flex items-center justify-center gap-2 hover:brightness-105 active:scale-98 transition shadow-lg text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              حفظ في عبارتي
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-[#3d1329] border border-[#8f6f4d] text-[#b9a394] hover:text-[#f0dcaa] font-medium text-sm transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
