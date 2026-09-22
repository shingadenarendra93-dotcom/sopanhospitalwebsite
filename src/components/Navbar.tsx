import React, { useState } from 'react';
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
  Stethoscope
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'symptom-checker', label: 'Symptom Checker', icon: <Stethoscope className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'stories', label: 'Success Stories', icon: <Sparkles className="w-4 h-4 text-[#8E5B3E]" /> },
    { id: 'news', label: 'Neuro News', icon: <Newspaper className="w-4 h-4 text-[#456254]" /> },
    { id: 'appointments', label: 'Book OPD (₹1,500)', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews (4.9★)', icon: <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> },
    { id: 'vr-brain', label: '3D/VR Brain', icon: <Glasses className="w-4 h-4" /> },
    { id: 'diseases', label: 'Diseases & Care', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'patient-portal', label: 'Patient Portal', icon: <User className="w-4 h-4" /> },
    { id: 'remote-monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> },
    { id: 'case-studies', label: 'Case Studies', icon: <Database className="w-4 h-4" /> },
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
            24/7 COMPREHENSIVE STROKE RAPID RESPONSE • MUMBAI NAKA, NASHIK • HOTLINE: 0253 2317364
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenEmergencyCall}
            className="hover:underline flex items-center gap-1 text-white font-semibold"
          >
            <Phone className="w-3.5 h-3.5" />
            Hotline: 0253 2317364
          </button>

          <button
            onClick={onOpenWhatsApp}
            className="hidden md:flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-lg text-white font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp: 9405545521
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
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#383129] to-[#201C17] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform border border-[#4E443A]">
              <Activity className="w-6 h-6 text-[#D8B48D]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-[#27231E]">
                  SOPAN HOSPITAL
                </span>
                <span className="hidden sm:inline text-[10px] bg-[#EFE9DF] text-[#7A5338] font-semibold px-2 py-0.5 rounded-full border border-[#DFD6C8]">
                  NEUROLOGY INSTITUTE
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#7A5338] tracking-wide">
                Chief Neurologist: Dr. Sanjay Sopan Varade (MD, DM Neuro, 35+ Yrs Exp) • OPD ₹1,500
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
            <button
              onClick={onOpenWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-[#456254] hover:bg-[#374E43] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>

            <button
              onClick={() => handleNavClick('appointments')}
              className="px-4 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              Book OPD (₹1,500)
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="xl:hidden flex items-center gap-2">
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
        <div className="xl:hidden border-t border-[#E6E0D4] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-2 shadow-xl">
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
              WhatsApp (9405545521)
            </button>
            <button
              onClick={() => handleNavClick('appointments')}
              className="flex-1 py-2.5 rounded-xl bg-[#8E5B3E] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book OPD (₹1,500)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
