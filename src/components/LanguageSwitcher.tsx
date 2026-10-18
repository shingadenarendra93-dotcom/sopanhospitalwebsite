import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';
import { playSubtleClickSound } from '../utils/audioFeedback';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'responsive' | 'full';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '',
  variant = 'responsive'
}) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  const handleSelect = (lang: Language) => {
    if (lang !== language) {
      playSubtleClickSound();
      setLanguage(lang);
    }
  };

  const handleToggle = () => {
    playSubtleClickSound();
    toggleLanguage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleToggle();
    }
  };

  // ========================================================
  // VARIANT: FULL (For Drawer Menus, Settings, and Large Modals)
  // ========================================================
  if (variant === 'full') {
    return (
      <div 
        role="radiogroup" 
        aria-label="भाषा निवडा / Select Language"
        className={`w-full grid grid-cols-2 gap-2 select-none ${className}`}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          role="radio"
          aria-checked={language === 'en'}
          onClick={() => handleSelect('en')}
          className={`h-11 px-3 rounded-xl border flex items-center justify-between text-left transition-all duration-150 cursor-pointer active:scale-[0.98] ${
            language === 'en'
              ? 'bg-[#2E2721] text-white border-[#2E2721] shadow-xs ring-1 ring-[#2E2721]'
              : 'bg-white text-[#5C5346] border-[#D8CFC2] hover:bg-[#FAF7F2] hover:border-[#8E5B3E]/50'
          }`}
          title="Select English (EN)"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-bold tracking-tight">English</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              language === 'en' ? 'bg-white/20 text-white' : 'bg-[#EFE9DF] text-[#7A5338]'
            }`}>
              EN
            </span>
          </div>
          {language === 'en' && (
            <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
          )}
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={language === 'mr'}
          onClick={() => handleSelect('mr')}
          className={`h-11 px-3 rounded-xl border flex items-center justify-between text-left transition-all duration-150 cursor-pointer active:scale-[0.98] ${
            language === 'mr'
              ? 'bg-[#2E2721] text-white border-[#2E2721] shadow-xs ring-1 ring-[#2E2721]'
              : 'bg-white text-[#5C5346] border-[#D8CFC2] hover:bg-[#FAF7F2] hover:border-[#8E5B3E]/50'
          }`}
          title="मराठी निवडा (Select Marathi)"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-bold tracking-tight">मराठी</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              language === 'mr' ? 'bg-white/20 text-white' : 'bg-[#EFE9DF] text-[#7A5338]'
            }`}>
              MR
            </span>
          </div>
          {language === 'mr' && (
            <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
          )}
        </button>
      </div>
    );
  }

  // ========================================================
  // VARIANT: COMPACT (Optimal for Mobile Header Bar < 640px)
  // Clean pill with globe icon, EN and मराठी pills, exact fit
  // ========================================================
  if (variant === 'compact') {
    return (
      <div 
        role="radiogroup" 
        aria-label="भाषा निवडा / Select Language"
        onKeyDown={handleKeyDown}
        className={`inline-flex items-center h-8.5 bg-white/95 backdrop-blur-xs border border-[#D8CFC2] hover:border-[#8E5B3E]/40 rounded-full p-0.5 shadow-2xs shrink-0 select-none transition-colors ${className}`}
      >
        <button
          type="button"
          onClick={handleToggle}
          className="pl-2 pr-1.5 text-[#8E5B3E] hover:text-[#2E2721] flex items-center justify-center shrink-0 cursor-pointer transition-colors active:scale-90"
          title={language === 'en' ? 'मराठीमध्ये बदला (Switch to Marathi)' : 'Switch to English'}
          aria-label="Toggle language"
        >
          <Globe className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            role="radio"
            aria-checked={language === 'en'}
            onClick={() => handleSelect('en')}
            className={`h-7 px-2 rounded-full text-[11px] font-bold transition-all duration-150 inline-flex items-center justify-center leading-none cursor-pointer active:scale-95 ${
              language === 'en'
                ? 'bg-[#2E2721] text-white shadow-2xs font-extrabold'
                : 'text-[#6B6256] hover:text-[#27231E] hover:bg-[#FAF7F2]'
            }`}
            title="English"
          >
            EN
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={language === 'mr'}
            onClick={() => handleSelect('mr')}
            className={`h-7 px-2 rounded-full text-[11px] font-bold transition-all duration-150 inline-flex items-center justify-center leading-none cursor-pointer active:scale-95 tracking-tight ${
              language === 'mr'
                ? 'bg-[#2E2721] text-white shadow-2xs font-extrabold'
                : 'text-[#6B6256] hover:text-[#27231E] hover:bg-[#FAF7F2]'
            }`}
            title="मराठी"
          >
            मराठी
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // VARIANT: RESPONSIVE (Matches the exact Screenshot 154459)
  // Pill: [ 🌐  English (EN)   मराठी (MR) ]
  // Seamlessly fits tablet and desktop with active dark pill background
  // ========================================================
  return (
    <div 
      role="radiogroup" 
      aria-label="भाषा निवडा / Select Language"
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center h-8.5 md:h-9 bg-white/95 backdrop-blur-xs border border-[#D8CFC2] hover:border-[#8E5B3E]/40 rounded-full p-0.5 shadow-2xs shrink-0 select-none transition-colors ${className}`}
    >
      {/* Globe Icon */}
      <button
        type="button"
        onClick={handleToggle}
        className="pl-2 sm:pl-2.5 pr-1.5 sm:pr-2 text-[#8E5B3E] hover:text-[#2E2721] flex items-center justify-center shrink-0 cursor-pointer transition-colors active:scale-90"
        title={language === 'en' ? 'मराठीमध्ये बदला (Switch to Marathi)' : 'Switch to English'}
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Segmented Dual Switch: English (EN) and मराठी (MR) */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          type="button"
          role="radio"
          aria-checked={language === 'en'}
          onClick={() => handleSelect('en')}
          className={`h-7 md:h-7.5 px-2.5 sm:px-3 rounded-full text-xs font-bold transition-all duration-150 inline-flex items-center justify-center leading-none cursor-pointer active:scale-95 ${
            language === 'en'
              ? 'bg-[#2E2721] text-white shadow-2xs font-extrabold'
              : 'text-[#6B6256] hover:text-[#27231E] hover:bg-[#FAF7F2]'
          }`}
          title="Switch to English"
        >
          <span className="hidden sm:inline">English (EN)</span>
          <span className="sm:hidden">EN</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={language === 'mr'}
          onClick={() => handleSelect('mr')}
          className={`h-7 md:h-7.5 px-2.5 sm:px-3 rounded-full text-xs font-bold transition-all duration-150 inline-flex items-center justify-center leading-none cursor-pointer active:scale-95 tracking-tight ${
            language === 'mr'
              ? 'bg-[#2E2721] text-white shadow-2xs font-extrabold'
              : 'text-[#6B6256] hover:text-[#27231E] hover:bg-[#FAF7F2]'
          }`}
          title="मराठीमध्ये बदला (Switch to Marathi)"
        >
          <span className="hidden sm:inline">मराठी (MR)</span>
          <span className="sm:hidden">मराठी</span>
        </button>
      </div>
    </div>
  );
};
