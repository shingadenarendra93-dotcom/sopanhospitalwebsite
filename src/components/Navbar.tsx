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
import { 
  YouTubeIcon, 
  FacebookIcon, 
  InstagramIcon, 
  openSocialPlatform 
} from './SocialMediaModal';

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

  const handleSocialClick = (platform: 'youtube' | 'facebook' | 'instagram') => {
    openSocialPlatform(platform);
  };

  useEffect(() => {
    const checkAdmin = () => setAdminActive(isAdminLoggedIn());
    window.addEventListener('sopan_admin_session_changed', checkAdmin);
    return () => window.removeEventListener('sopan_admin_session_changed', checkAdmin);
  }, []);

  const navItems = [
    { id: 'patient-portal', label: language === 'mr' ? 'रुग्ण पोर्टल' : 'Patient Portal', icon: <User className="w-4 h-4 text-cyan-600" /> },
    { id: 'symptom-checker', label: t('nav.symptom_checker'), icon: <Stethoscope className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'location', label: t('nav.location'), icon: <MapPin className="w-4 h-4 text-rose-600" /> },
    { id: 'stories', label: t('nav.stories'), icon: <Sparkles className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'gallery', label: t('nav.gallery'), icon: <Camera className="w-4 h-4 text-amber-600" /> },
    { id: 'news', label: t('nav.news'), icon: <Newspaper className="w-4 h-4 text-[#456254]" /> },
    { id: 'reviews', label: t('nav.reviews'), icon: <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> },
    { id: 'patient-feedback', label: t('nav.feedback'), icon: <MessageSquare className="w-4 h-4 text-[#8E5B3E]" /> },
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

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs font-semibold">
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

          <span className="text-white/40">|</span>

          {/* High-visibility YouTube & Facebook badges in Top Hotline Bar */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => handleSocialClick('youtube')}
              className="hover:scale-105 active:scale-95 transition-transform flex items-center gap-1 text-white bg-black/30 hover:bg-black/50 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold cursor-pointer border border-white/25 shadow-xs"
              title="Dr. Sanjay Varade YouTube Channel (@dr.sanjayvarade5339) - Direct to YouTube App"
            >
              <YouTubeIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">YouTube</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialClick('facebook')}
              className="hover:scale-105 active:scale-95 transition-transform flex items-center gap-1 text-white bg-black/30 hover:bg-black/50 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold cursor-pointer border border-white/25 shadow-xs"
              title="Sopan Hospital Facebook Page (/sopanhospitalnashik) - Direct to Facebook App"
            >
              <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Facebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 py-2 gap-3 sm:gap-6">
          {/* Hospital Brand & Logo - Clean, prominent, never squeezed or truncated */}
          <div 
            onClick={() => handleNavClick('appointments')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group min-w-0"
            title="Sopan Hospital & Neurology Institute - Director: Dr. Sanjay Sopan Varade"
          >
            <div className="p-1 sm:p-1.5 rounded-2xl bg-white border border-[#E6E0D4] shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <SopanLogo size="md" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-black tracking-tight text-[#27231E] whitespace-nowrap">
                  {t('hospital.name')}
                </span>
                <span className="hidden xs:inline-block text-[10px] sm:text-[11px] bg-[#EFE9DF] text-[#7A5338] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-[#DFD6C8] whitespace-nowrap shrink-0">
                  {t('hospital.tagline')}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-[#7A5338] tracking-wide mt-0.5 truncate max-w-[220px] xs:max-w-xs sm:max-w-none">
                {language === 'mr' ? 'वरिष्ठ न्यूरोलॉजिस्ट: डॉ. संजय सोपान वराडे (MD, DM Neuro)' : 'Chief Neurologist: Dr. Sanjay Sopan Varade (MD, DM Neuro)'}
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT SIDE ACTIONS: DESKTOP & TABLET VIEW (CLEAN & BALANCED) */}
          {/* ======================================================== */}
          <div className="hidden sm:flex items-center gap-1.5 md:gap-2 lg:gap-2.5 shrink-0 ml-auto">
            {/* Language Switcher - Exact fit layout on tablet and desktop */}
            <LanguageSwitcher variant="responsive" />

            {/* OPTION 1: OPD ADMIN BUTTON */}
            <button
              id="btn-nav-opd-admin"
              onClick={() => setAdminModalOpen(true)}
              className="h-8.5 sm:h-9 px-2 sm:px-2.5 md:px-3 rounded-xl bg-[#27231E] hover:bg-[#3E3832] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Hospital OPD Administration: Authenticate to manage appointments, quotas, and consultation settings"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap hidden lg:inline">{adminActive ? 'Admin Desk' : 'OPD Admin'}</span>
              <span className="whitespace-nowrap lg:hidden">Admin</span>
              {adminActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* OPTION: PATIENT PORTAL BUTTON */}
            <button
              id="btn-nav-patient-portal"
              onClick={() => handleNavClick('patient-portal')}
              className={`h-8.5 sm:h-9 px-2 sm:px-2.5 md:px-3 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'patient-portal'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white hover:bg-[#FAF7F2] text-[#27231E] border-[#E6E0D4]'
              }`}
              title="Patient Portal: View appointments, live status, and download confirmed token slips"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 shrink-0" />
              <span className="whitespace-nowrap hidden lg:inline">Patient Portal</span>
              <span className="whitespace-nowrap lg:hidden">Portal</span>
            </button>

            {/* OPTION 2: WHATSAPP BUTTON (Visible on md+ so it leaves full room for hospital name on tablet sm screens) */}
            <button
              onClick={onOpenWhatsApp}
              className="hidden md:flex h-8.5 sm:h-9 px-2 sm:px-2.5 md:px-3 rounded-xl bg-[#456254] hover:bg-[#374E43] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all items-center gap-1.5 shrink-0 cursor-pointer"
              title="Chat directly on WhatsApp (9405545521)"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap hidden lg:inline">{t('whatsapp.btn')}</span>
            </button>

            {/* Tablet Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-xl bg-[#EFE9DF] text-[#27231E] hover:bg-[#E4DCCE] active:scale-95 flex items-center justify-center shrink-0 cursor-pointer ml-0.5 sm:ml-1 transition-all"
              title="All Sections Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          {/* ======================================================== */}
          {/* MOBILE HEADER BAR CONTROLS (< 640px) */}
          {/* ======================================================== */}
          <div className="sm:hidden flex items-center gap-1.5 shrink-0 ml-auto">
            <LanguageSwitcher variant="compact" />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8.5 w-8.5 rounded-xl bg-[#EFE9DF] text-[#27231E] hover:bg-[#E4DCCE] active:scale-95 flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-2xs"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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

          {/* Mobile Option 3: Patient Portal */}
          <button
            onClick={() => handleNavClick('patient-portal')}
            className={`touch-friendly-btn h-10 px-2 rounded-xl text-[11px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'patient-portal'
                ? 'bg-slate-900 text-white'
                : 'bg-[#8E5B3E] text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="truncate">Patient Portal</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E6E0D4] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="pb-3 border-b border-[#E6E0D4]">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#7A5338]">
              <Globe className="w-4 h-4 text-[#8E5B3E]" />
              <span>भाषा निवडा / Select Language:</span>
            </div>
            <LanguageSwitcher variant="full" />
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

          {/* Mobile Social Media Direct Launcher Cards */}
          <div className="pt-2 border-t border-[#E6E0D4] space-y-2">
            <div className="text-xs font-bold text-[#7A5338]">
              <span>{language === 'mr' ? 'अधिकृत सोशल मीडिया प्लॅटफॉर्म:' : 'Official Social Channels:'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSocialClick('youtube');
                }}
                className="p-2.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-left flex items-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="Open YouTube App"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <YouTubeIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-[#27231E] truncate">YouTube</div>
                  <div className="text-[9px] text-red-600 font-semibold truncate">@dr.sanjayvarade</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSocialClick('facebook');
                }}
                className="p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-left flex items-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="Open Facebook App"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FacebookIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-[#27231E] truncate">Facebook</div>
                  <div className="text-[9px] text-[#1877F2] font-semibold truncate">sopanhospital</div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E6E0D4] flex gap-2">
            <button
              onClick={() => {
                onOpenWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#456254] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              {t('whatsapp.btn')} (9405545521)
            </button>
            <button
              onClick={() => {
                handleNavClick('patient-portal');
                window.dispatchEvent(new CustomEvent('sopan_open_booking'));
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#8E5B3E] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
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
