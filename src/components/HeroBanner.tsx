import React, { useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Glasses, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Phone, 
  Star, 
  Sparkles,
  Stethoscope,
  MessageCircle,
  Newspaper,
  CheckCircle2
} from 'lucide-react';

interface HeroBannerProps {
  onNavigate: (tabId: string) => void;
  onOpenWhatsApp: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onNavigate,
  onOpenWhatsApp
}) => {
  // Guarantee that the doctor photo stays default (/DSC_0050.JPG)
  useEffect(() => {
    // Purge any temporary custom photo overrides from localStorage
    if (localStorage.getItem('sopan_dr_custom_photo')) {
      localStorage.removeItem('sopan_dr_custom_photo');
      window.dispatchEvent(new Event('sopan_photo_updated'));
    }
  }, []);

  const doctorPhotoSrc = '/DSC_0050.JPG';

  return (
    <div className="space-y-6">
      {/* Primary Warm & Bright Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EC] to-[#F3EADB] border-2 border-[#EADCC8] text-[#241E17] p-6 sm:p-10 shadow-sm">
        {/* Soft warm sunlit ambient glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#E8A86B]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#456254]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDF2E2] text-[#8E5124] text-xs font-semibold border border-[#ECD3B9] shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#C26D38]" />
              NABH Accredited Super-Speciality Neuroscience Center • Mumbai Naka, Nashik
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#221B14] leading-tight">
              Compassionate Clinical Excellence in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8E5B3E] via-[#A86439] to-[#456254]">Neurology & Brain Sciences</span>
            </h1>

            <p className="text-[#52493D] text-sm sm:text-base leading-relaxed max-w-xl">
              Led by Director & Chief Consultant <strong className="text-[#221B14] font-semibold">Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong> with over <strong className="text-[#8E5B3E] font-bold">35+ Years of Experience</strong>. 
              Comprehensive acute stroke rescue, 32-Slice high-speed CT diagnostic angiography, continuous 24-hr Video-EEG, and dedicated neuro-rehabilitation delivered with warmth, precision, and dignity.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-btn-book"
                onClick={() => onNavigate('appointments')}
                className="px-6 py-3 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule OPD (₹1,500)
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                id="hero-btn-symptom-checker"
                onClick={() => onNavigate('symptom-checker')}
                className="px-5 py-3 rounded-2xl bg-[#F5ECE0] hover:bg-[#EBDFD0] text-[#7A492B] border border-[#DFD1BE] font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-[#8E5B3E]" />
                Symptom Checker
              </button>

              <button
                id="hero-btn-stories"
                onClick={() => onNavigate('stories')}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-[#FAF6F0] text-[#383025] border border-[#DACFBE] font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#8E5B3E]" />
                Patient Success Stories
              </button>

              <button
                id="hero-btn-news"
                onClick={() => onNavigate('news')}
                className="px-5 py-3 rounded-2xl bg-[#FAF5EC] hover:bg-[#F0E6D5] text-[#8E5B3E] border border-[#DACFBE] font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <Newspaper className="w-4 h-4 text-[#8E5B3E]" />
                Latest Neuro News
              </button>

              <button
                id="hero-btn-whatsapp"
                onClick={onOpenWhatsApp}
                className="px-5 py-3 rounded-2xl bg-[#456254] hover:bg-[#374E43] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: 9405545521</span>
              </button>
            </div>
          </div>

          {/* Right Hero: Doctor Profile Showcase with Photo and Warm Bright Card */}
          <div className="lg:col-span-5 bg-white/95 border border-[#E6DBCA] rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm backdrop-blur-xs">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src={doctorPhotoSrc}
                  alt="Dr. Sanjay Sopan Varade (MD, DM Neuro)"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('doctor-photo.png')) {
                      target.src = '/doctor-photo.png';
                    }
                  }}
                  className="w-22 h-22 rounded-2xl object-cover border-2 border-[#D8C7B0] shrink-0 shadow-xs"
                  title="Dr. Sanjay Sopan Varade (MD, DM Neuro) - Default Official Portrait"
                />
                <div
                  title="Official Verified Portrait"
                  className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full shadow-xs border-2 border-white"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>4.96 Rating</span>
                  <span className="text-[#8A8173] font-normal">• 740+ Reviews</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#221B14] leading-snug">
                  Dr. Sanjay Sopan Varade
                </h3>
                <div className="text-xs text-[#8E5B3E] font-semibold">MD, DM Neuro (CMC Vellore)</div>
                <div className="text-[11px] text-[#6B6254]">Director & Chief Consultant Neurologist</div>
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Default Verified Portrait</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5DAC8] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#5C5346]">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  Consultation Fee:
                </span>
                <span className="font-bold text-[#221B14] text-sm">₹1,500</span>
              </div>
              <div className="flex items-center justify-between text-[#5C5346]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#456254]" />
                  Experience:
                </span>
                <span className="font-bold text-[#221B14] bg-[#F3ECE0] px-2 py-0.5 rounded-md text-[11px]">35+ Years Expertise</span>
              </div>
              <div className="flex items-center justify-between text-[#5C5346]">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  Stroke Emergency Hotline:
                </span>
                <a href="tel:02532317364" className="font-bold text-rose-700 hover:underline">
                  0253 2317364
                </a>
              </div>
            </div>

            {/* Quick interactive shortcuts */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <button
                id="hero-quick-symptom-checker"
                onClick={() => onNavigate('symptom-checker')}
                className="p-2 rounded-xl bg-[#FAF5EE] hover:bg-[#F2E8DC] text-[#3C342A] border border-[#E5DAC8] text-left transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Activity className="w-3.5 h-3.5 text-[#8E5B3E] shrink-0" />
                <span className="font-medium text-[11px] truncate">Checker</span>
              </button>

              <button
                id="hero-quick-vr"
                onClick={() => onNavigate('vr-brain')}
                className="p-2 rounded-xl bg-white hover:bg-[#FAF6F0] text-[#3C342A] border border-[#E5DAC8] text-left transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Glasses className="w-3.5 h-3.5 text-[#8E5B3E] shrink-0" />
                <span className="font-medium text-[11px] truncate">3D Brain</span>
              </button>

              <button
                id="hero-quick-stories"
                onClick={() => onNavigate('stories')}
                className="p-2 rounded-xl bg-white hover:bg-[#FAF6F0] text-[#3C342A] border border-[#E5DAC8] text-left transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#456254] shrink-0" />
                <span className="font-medium text-[11px] truncate">Stories</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom stats ticker in warm and bright style */}
        <div className="mt-8 pt-6 border-t border-[#E5DAC8] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#7A7163] block">Door-to-Needle Time</span>
            <span className="text-lg font-serif font-bold text-[#8E5B3E]">&lt; 25 Minutes</span>
            <span className="text-[11px] text-[#867E73] block">Hyper-Acute Stroke Rescue</span>
          </div>
          <div>
            <span className="text-[#7A7163] block">Diagnostic Imaging</span>
            <span className="text-lg font-serif font-bold text-[#221B14]">32-Slice CT Scan</span>
            <span className="text-[11px] text-[#867E73] block">High-Speed Helical & Angiography</span>
          </div>
          <div>
            <span className="text-[#7A7163] block">Seizure Control Rate</span>
            <span className="text-lg font-serif font-bold text-[#456254]">88.4%</span>
            <span className="text-[11px] text-[#867E73] block">Continuous 24-hr Video-EEG</span>
          </div>
          <div>
            <span className="text-[#7A7163] block">Consultation OPD Fee</span>
            <span className="text-lg font-serif font-bold text-[#221B14]">₹1,500</span>
            <span className="text-[11px] text-[#867E73] block">35+ Years Clinical Practice</span>
          </div>
        </div>
      </div>
    </div>
  );
};

