import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '',
  variant = 'compact'
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center bg-[#FAF7F2] p-1 rounded-2xl border border-[#D8CFC2] shadow-2xs ${className}`}>
      <div className="flex items-center px-1.5 text-[#7A5338]">
        <Globe className="w-3.5 h-3.5 mr-1 text-[#8E5B3E]" />
        {variant === 'full' && <span className="text-[11px] font-semibold mr-1">Language:</span>}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            language === 'en'
              ? 'bg-[#342E28] text-white shadow-2xs scale-102'
              : 'text-[#635E56] hover:text-[#27231E] hover:bg-[#EFE9DF]'
          }`}
          title="Switch to English"
        >
          English
        </button>

        <button
          onClick={() => setLanguage('mr')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            language === 'mr'
              ? 'bg-[#8E5B3E] text-white shadow-2xs scale-102'
              : 'text-[#635E56] hover:text-[#27231E] hover:bg-[#EFE9DF]'
          }`}
          title="मराठीमध्ये बदला (Switch to Marathi)"
        >
          मराठी
        </button>
      </div>
    </div>
  );
};
