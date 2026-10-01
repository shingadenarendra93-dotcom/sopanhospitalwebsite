import React, { useState, useEffect } from 'react';
import { SopanLogo } from './SopanLogo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { OpdAdminPortalModal } from './OpdAdminPortalModal';
import { isAdminLoggedIn } from '../utils/opdSlotUtils';
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
  Globe,
  Sliders
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
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [adminActive, setAdminActive] = useState<boolean>(() => isAdminLoggedIn());

  useEffect(() => {
    const checkAdmin = () => setAdminActive(isAdminLoggedIn());
    window.addEventListener('sopan_admin_session_changed', checkAdmin);
    return () => window.removeEventListener('sopan_admin_session_changed', checkAdmin);
  }, []);

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
      <div className="bg-gradient-to-r from-[#8B3A3A] via-[#7D3232] to-[#6E2B2B] text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="tracking-wide truncate">
            {t('emergency.banner')} {t('emergency.location')}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
          <button
            onClick={onOpenEmergencyCall}
            className="hover:underline flex items-center gap-1.5 text-white"
            title="Call 24/7 Stroke Emergency Hotline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">0253 2317364</span>
            <span className="sm:hidden">Call</span>
          </button>

          <span className="text-white/40">|</span>

          <button
            onClick={onOpenWhatsApp}
            className="hover:underline flex items-center gap-1.5 text-white"
            title="WhatsApp Stroke Emergency Desk"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp: 9405545521</span>
            <span className="sm:hidden">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2 gap-4">
          {/* Hospital Brand & Logo */}
          <div 
            onClick={() => handleNavClick('stories')}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="p-1 rounded-2xl bg-white border border-[#E6E0D4] shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
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
              <p className="text-[11px] font-medium text-[#7A5338] tracking-wide line-clamp-1">
                {t('doctor.title')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden 2xl:flex items-center gap-1">
            {navItems.slice(0, 6).map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`h-9 px-3 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
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

          {/* Action Buttons: Unified Alignment and Consistent Heights */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Google Firebase Auth Sign In / Profile */}
            {user ? (
              <div className="h-9 flex items-center gap-2 bg-[#FAF7F2] border border-[#D8CFC2] px-3 rounded-xl shadow-2xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-[#8E5B3E]/30"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#8E5B3E] text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-[#27231E] max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0] || 'Patient'}
                </span>
                <button
                  onClick={() => logOut()}
                  title="Sign Out of Firebase"
                  className="p-0.5 text-[#8E867A] hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={authLoading}
                className="h-9 px-3.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D8CFC2] text-xs font-semibold text-[#27231E] shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
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

            {/* Language Switcher Button */}
            <LanguageSwitcher />

            {/* OPD Admin Desk Button */}
            <button
              id="btn-nav-opd-admin"
              onClick={() => setAdminModalOpen(true)}
              className="h-9 px-3 rounded-xl bg-[#27231E] hover:bg-[#3E3832] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              title="Hospital OPD Administration: Reset counter, extend capacity, accept/reject appointments"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline">OPD Admin</span>
              {adminActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              onClick={onOpenWhatsApp}
              className="h-9 px-3.5 rounded-xl bg-[#456254] hover:bg-[#374E43] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              {t('whatsapp.btn')}
            </button>

            <button
              onClick={() => handleNavClick('appointments')}
              className="h-9 px-4 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <Calendar className="w-4 h-4" />
              {t('book.opd')}
            </button>
          </div>

          {/* Mobile Actions: Language + WhatsApp + Menu Hamburger */}
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            <LanguageSwitcher />

            <button
              onClick={() => setAdminModalOpen(true)}
              className="h-9 w-9 rounded-xl bg-[#27231E] text-cyan-400 flex items-center justify-center shrink-0 shadow-2xs"
              title="Open OPD Desk Administration"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenWhatsApp}
              className="h-9 w-9 rounded-xl bg-[#EFECE6] text-[#456254] border border-[#DDD6C9] flex items-center justify-center shrink-0"
              title="Open WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 rounded-xl bg-[#EFE9DF] text-[#27231E] hover:bg-[#E4DCCE] flex items-center justify-center shrink-0"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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

          {/* OPD Admin Button in Mobile Drawer */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAdminModalOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>OPD Desk Admin Portal</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
                Reset / Extend Quota
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#E6E0D4] flex gap-2">
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

      {/* OPD Admin Portal Modal */}
      <OpdAdminPortalModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </header>
  );
};
