import React, { useState } from 'react';
import { SopanLogo } from './SopanLogo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Activity, 
  Phone, 
  Calendar, 
  User, 
  Glasses, 
  BookOpen, 
  MessageSquare, 
  Database, 
  DollarSign, 
  Star, 
  Menu, 
  X, 
  ShieldCheck, 
  Zap,
  MessageCircle,
  Sparkles,
  Newspaper,
  Stethoscope,
  Bot,
  LogOut,
  LogIn,
  Globe
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenWhatsApp: () => void;
  onOpenEmergencyCall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenWhatsApp,
  onOpenEmergencyCall
}) => {
  const { user, signInWithGoogle, logOut } = useAuth();
  const { t, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const handleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Sign-in cancelled or failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const navItems = [
    { id: 'gemini-assistant', label: t('nav.ai_assistant'), icon: <Bot className="w-4 h-4 text-emerald-600" /> },
    { id: 'symptom-checker', label: t('nav.symptom_checker'), icon: <Stethoscope className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'stories', label: t('nav.stories'), icon: <Sparkles className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'news', label: t('nav.news'), icon: <Newspaper className="w-4 h-4 text-[#456254]" /> },
    { id: 'appointments', label: t('nav.appointments'), icon: <Calendar className="w-4 h-4" /> },
    { id: 'reviews', label: t('nav.reviews'), icon: <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> },
    { id: 'patient-feedback', label: t('nav.feedback'), icon: <MessageSquare className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'patient-portal', label: t('nav.portal'), icon: <User className="w-4 h-4" /> },
    { id: 'vr-brain', label: t('nav.vr_brain'), icon: <Glasses className="w-4 h-4" /> },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E0D4]">
      {/* 24/7 Stroke Rapid Response Top Emergency Bar */}
      <div className="bg-gradient-to-r from-[#8B3A3A] via-[#7D3232] to-[#6E2B2B] text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="tracking-wide">
            {t('emergency.banner')} {t('emergency.location')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="bg-white/10 border-white/20 text-white" />

          <button
            onClick={onOpenEmergencyCall}
            className="hover:underline flex items-center gap-1 text-white font-semibold"
          >
            <Phone className="w-3.5 h-3.5" />
            0253 2317364
          </button>

          <button
            onClick={onOpenWhatsApp}
            className="hidden md:flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-lg text-white font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Hospital Brand & Logo */}
          <div 
            onClick={() => handleNavClick('stories')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="p-1 rounded-2xl bg-white border border-[#E6E0D4] shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center">
              <SopanLogo size="md" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-[#27231E]">
                  {t('hospital.name')}
                </span>
                <span className="hidden sm:inline text-[10px] bg-[#EFE9DF] text-[#7A5338] font-semibold px-2 py-0.5 rounded-full border border-[#DFD6C8]">
                  {t('hospital.tagline')}
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#7A5338] tracking-wide">
                {t('doctor.title')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#342E28] text-white shadow-xs'
                      : 'text-[#635E56] hover:text-[#27231E] hover:bg-[#EFE9DF]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Google Firebase Auth Sign In / Profile */}
            {user ? (
              <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#D8CFC2] px-3 py-1.5 rounded-2xl shadow-2xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-[#8E5B3E]/30"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#8E5B3E] text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-[#27231E] max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || 'Patient'}
                </span>
                <button
                  onClick={() => logOut()}
                  title="Sign Out of Firebase"
                  className="p-1 text-[#8E867A] hover:text-rose-600 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={authLoading}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D8CFC2] text-xs font-semibold text-[#27231E] shadow-2xs transition-all flex items-center gap-1.5"
                title="Sign in securely with Google via Firebase Auth"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span>{authLoading ? '...' : t('google.signin')}</span>
              </button>
            )}

            <LanguageSwitcher />

            <button
              onClick={onOpenWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-[#456254] hover:bg-[#374E43] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              {t('whatsapp.btn')}
            </button>

            <button
              onClick={() => handleNavClick('appointments')}
              className="px-4 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              {t('book.opd')}
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="xl:hidden flex items-center gap-2">
            <LanguageSwitcher className="scale-90" />

            <button
              onClick={onOpenWhatsApp}
              className="sm:hidden p-2 rounded-xl bg-[#EFECE6] text-[#456254] border border-[#DDD6C9]"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#EFE9DF] text-[#27231E] hover:bg-[#E4DCCE]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E6E0D4] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between px-1 pb-2 border-b border-[#E6E0D4]">
            <span className="text-xs font-bold text-[#7A5338]">भाषा / Language:</span>
            <LanguageSwitcher variant="compact" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium text-left flex items-center gap-2.5 ${
                  activeTab === item.id
                    ? 'bg-[#342E28] text-white'
                    : 'text-[#635E56] hover:bg-[#EFE9DF]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E6E0D4] flex gap-2">
            <button
              onClick={() => {
                onOpenWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#456254] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t('whatsapp.btn')} (9405545521)
            </button>
            <button
              onClick={() => handleNavClick('appointments')}
              className="flex-1 py-2.5 rounded-xl bg-[#8E5B3E] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {t('book.opd')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
