import React, { useState, useEffect } from 'react';
import { SopanLogo } from './SopanLogo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { OpdAdminPortalModal } from './OpdAdminPortalModal';
import { isAdminLoggedIn, setAdminSession } from '../utils/opdSlotUtils';
import { useHospitalContent } from '../hooks/useHospitalContent';
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
  LogOut,
  LogIn,
  Globe,
  Sliders,
  Camera,
  MapPin
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
  const { t, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [adminActive, setAdminActive] = useState<boolean>(() => isAdminLoggedIn());
  const { content } = useHospitalContent();

  useEffect(() => {
    const checkAdmin = () => setAdminActive(isAdminLoggedIn());
    window.addEventListener('sopan_admin_session_changed', checkAdmin);
    return () => window.removeEventListener('sopan_admin_session_changed', checkAdmin);
  }, []);

  const navItems = [
    { id: 'appointments', label: t('nav.appointments'), icon: <Calendar className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'symptom-checker', label: t('nav.symptom_checker'), icon: <Stethoscope className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'location', label: t('nav.location'), icon: <MapPin className="w-4 h-4 text-rose-600" /> },
    { id: 'stories', label: t('nav.stories'), icon: <Sparkles className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'gallery', label: t('nav.gallery'), icon: <Camera className="w-4 h-4 text-amber-600" /> },
    { id: 'news', label: t('nav.news'), icon: <Newspaper className="w-4 h-4 text-[#456254]" /> },
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
            {content.emergencyBannerText}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
          <a
            href={`tel:${content.emergencyPhone}`}
            className="hover:underline flex items-center gap-1.5 text-white cursor-pointer"
            title="Call 24/7 Stroke Emergency Hotline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{content.emergencyPhoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>

          <span className="text-white/40">|</span>

          <button
            onClick={onOpenWhatsApp}
            className="hover:underline flex items-center gap-1.5 text-white cursor-pointer"
            title="WhatsApp Stroke Emergency Desk"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{content.whatsappDisplay}</span>
            <span className="sm:hidden">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 py-2 gap-3 sm:gap-6">
          {/* Hospital Brand & Logo - Clean, prominent, never squeezed or truncated */}
          <div 
            onClick={() => handleNavClick('appointments')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none group shrink-0"
            title="Sopan Hospital & Neurology Institute - Director: Dr. Sanjay Sopan Varade"
          >
            <div className="p-1 sm:p-1.5 rounded-2xl bg-white border border-[#E6E0D4] shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <SopanLogo size="md" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl lg:text-2xl font-serif font-black tracking-tight text-[#27231E] whitespace-nowrap">
                  {t('hospital.name')}
                </span>
                <span className="text-[9px] sm:text-[11px] bg-[#EFE9DF] text-[#7A5338] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-[#DFD6C8] whitespace-nowrap hidden xs:inline-block">
                  {t('hospital.tagline')}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-[#7A5338] tracking-wide whitespace-nowrap mt-0.5">
                {language === 'mr' ? 'वरिष्ठ न्यूरोलॉजिस्ट: डॉ. संजय सोपान वराडे (MD, DM Neuro)' : 'Chief Neurologist: Dr. Sanjay Sopan Varade (MD, DM Neuro)'}
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT SIDE ACTIONS: DESKTOP & TABLET VIEW (CLEAN & BALANCED) */}
          {/* ======================================================== */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* OPTION 1: OPD ADMIN BUTTON */}
            <button
              id="btn-nav-opd-admin"
              onClick={() => setAdminModalOpen(true)}
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-[#27231E] hover:bg-[#3E3832] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Hospital OPD Administration: Authenticate to manage appointments, quotas, and consultation settings"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap">{adminActive ? 'Admin Desk' : 'OPD Admin'}</span>
              {adminActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* OPTION 2: WHATSAPP BUTTON */}
            <button
              onClick={onOpenWhatsApp}
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-[#456254] hover:bg-[#374E43] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Chat directly on WhatsApp (9405545521)"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{t('whatsapp.btn')}</span>
            </button>

            {/* OPTION 3: BOOK OPD BUTTON */}
            <button
              onClick={() => handleNavClick('appointments')}
              className="h-9 px-3 sm:px-3.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              title={`Book OPD Consultation with Dr. Sanjay Sopan Varade (₹${content.consultationFee.toLocaleString('en-IN')})`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">
                {language === 'mr' ? `ओपीडी (₹${content.consultationFee.toLocaleString('en-IN')})` : `Book OPD (₹${content.consultationFee.toLocaleString('en-IN')})`}
              </span>
            </button>

            {/* Tablet Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden h-9 w-9 rounded-xl bg-[#EFE9DF] text-[#27231E] hover:bg-[#E4DCCE] flex items-center justify-center shrink-0 cursor-pointer ml-1"
              title="All Sections Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* ======================================================== */}
          {/* MOBILE HEADER BAR CONTROLS (< 640px) */}
          {/* ======================================================== */}
          <div className="sm:hidden flex items-center gap-1.5 shrink-0 ml-auto">
            <LanguageSwitcher variant="compact" />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 rounded-xl bg-[#EFE9DF] text-[#27231E] flex items-center justify-center shrink-0 cursor-pointer"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE QUICK ACTION STRIP (PROPER LOCATION ON RIGHT/FULL WIDTH, NO SIDE SCROLL) */}
      {/* ======================================================== */}
      <div className="sm:hidden px-2.5 py-1.5 bg-[#FAF7F2] border-t border-[#E6E0D4] shadow-2xs">
        <div className="grid grid-cols-3 gap-1.5">
          {/* Mobile Option 1: OPD Admin */}
          <button
            onClick={() => setAdminModalOpen(true)}
            className="touch-friendly-btn h-10 px-2 rounded-xl bg-[#27231E] text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">OPD Admin</span>
            {adminActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </button>

          {/* Mobile Option 2: WhatsApp */}
          <button
            onClick={onOpenWhatsApp}
            className="touch-friendly-btn h-10 px-2 rounded-xl bg-[#456254] text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </button>

          {/* Mobile Option 3: Book OPD */}
          <button
            onClick={() => handleNavClick('appointments')}
            className="touch-friendly-btn h-10 px-2 rounded-xl bg-[#8E5B3E] text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Book OPD</span>
          </button>
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
                Admin Access
              </span>
            </button>
            {adminActive && (
              <button
                onClick={() => {
                  setAdminSession(null);
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log Out of Administrator Session</span>
              </button>
            )}
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
        initialTab="fee"
        onClose={() => setAdminModalOpen(false)}
      />
    </header>
  );
};
