import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
    <div className={`inline-flex items-center h-9 bg-white border border-[#D8CFC2] rounded-xl p-0.5 shadow-2xs shrink-0 select-none ${className}`}>
      <div className="pl-2 pr-1.5 text-[#8E5B3E] flex items-center">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
            language === 'en'
              ? 'bg-[#342E28] text-white shadow-2xs'
              : 'text-[#635E56] hover:text-[#27231E] hover:bg-[#FAF7F2]'
          }`}
          title="Switch to English"
        >
          EN
        </button>

        <button
          type="button"
          onClick={() => setLanguage('mr')}
          className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
            language === 'mr'
              ? 'bg-[#8E5B3E] text-white shadow-2xs'
              : 'text-[#635E56] hover:text-[#27231E] hover:bg-[#FAF7F2]'
          }`}
          title="मराठीमध्ये बदला (Switch to Marathi)"
        >
          मराठी
        </button>
      </div>
    </div>
  );
};
