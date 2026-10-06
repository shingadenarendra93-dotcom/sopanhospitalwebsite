import React from 'react';
import { SopanLogo } from './SopanLogo';
import { 
  Activity, 
  Phone, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  Award, 
  MessageCircle,
  ExternalLink,
  Star,
  Navigation
} from 'lucide-react';
import { 
  SOPAN_HOSPITAL_GOOGLE_MAPS_URL, 
  SOPAN_HOSPITAL_REVIEWS_URL, 
  SOPAN_HOSPITAL_DIRECTIONS_URL 
} from './HospitalMapLocation';
import { useConsultationFee } from '../hooks/useConsultationFee';

interface FooterProps {
  onNavigate: (tabId: string) => void;
  onOpenWhatsApp: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenWhatsApp
}) => {
  const consultationFee = useConsultationFee();
  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E6DEC $\to$ #E5DAC8] text-[#5C5346] text-xs mt-16 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Col 1 & 2: Hospital identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-2xl bg-white border border-[#E6E0D4] shadow-xs flex items-center justify-center">
                <SopanLogo size="sm" />
              </div>
              <div>
                <h3 className="text-[#221B14] font-serif font-bold text-base tracking-tight">
                  SOPAN HOSPITAL & NEUROLOGY INSTITUTE
                </h3>
                <p className="text-[11px] text-[#8E5B3E] font-medium">NABH Accredited Super-Speciality Neuroscience Center</p>
              </div>
            </div>

            <p className="text-[#685F51] leading-relaxed text-xs max-w-sm">
              Dedicated to clinical excellence in hyper-acute stroke intervention, 32-slice CT emergency diagnostics, 
              intractable epilepsy, and neuro-critical care led by Dr. Sanjay Sopan Varade (MD, DM Neuro, 35+ Years Experience • Consultation Fee: ₹{consultationFee.toLocaleString('en-IN')}).
            </p>

            <div className="flex items-center gap-3 text-[11px] text-[#456254] font-semibold">
              <span className="flex items-center gap-1.5 bg-[#EAF0EC] px-3 py-1 rounded-full border border-[#D2DFD6]">
                <Award className="w-3.5 h-3.5 text-[#3F5E4D]" />
                NABH Accredited Super-Speciality Neuroscience Center
              </span>
            </div>
          </div>

          {/* Col 3: Key Portals */}
          <div className="space-y-3">
            <h4 className="text-[#221B14] font-serif font-bold uppercase text-[11px] tracking-wider">Patient & Clinical Portals</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('appointments')} className="hover:text-[#8E5B3E] transition-colors text-left">
                  Doctor Appointment Scheduling (₹{consultationFee.toLocaleString('en-IN')})
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('stories')} className="hover:text-[#221B14] text-[#8E5B3E] transition-colors font-semibold flex items-center gap-1">
                  <span>★</span> Patient Success Stories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('patient-portal')} className="hover:text-[#8E5B3E] transition-colors text-left">
                  Patient Health Records & 32-Slice CT Reports
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('news')} className="hover:text-[#221B14] text-[#456254] transition-colors font-semibold flex items-center gap-1">
                  <span>📰</span> Latest Neurology News & Research
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('remote-monitoring')} className="hover:text-[#8E5B3E] transition-colors text-left">
                  Remote Monitoring & Triage
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('vr-brain')} className="hover:text-[#8E5B3E] transition-colors text-left">
                  3D / VR Brain & 32-Slice CT Explorer
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional & Academic */}
          <div className="space-y-3">
            <h4 className="text-[#221B14] font-serif font-bold uppercase text-[11px] tracking-wider">Institutional & HR</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('case-studies')} className="hover:text-[#8E5B3E] transition-colors text-left">
                  Clinical Case Study Database
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('staff-payroll')} className="hover:text-[#8E5B3E] transition-colors text-left">
                  Staff Roster & Payroll System
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="hover:text-[#8E5B3E] transition-colors text-left">
                  Google Verified Reviews (4.9★)
                </button>
              </li>
              <li>
                <button onClick={onOpenWhatsApp} className="hover:text-[#324B3E] transition-colors text-[#3F5E4D] font-semibold flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp Desk (9405545521)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Emergency Contact */}
          <div className="space-y-3">
            <h4 className="text-[#221B14] font-serif font-bold uppercase text-[11px] tracking-wider">Hospital Address & Emergency</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8E5B3E] shrink-0 mt-0.5" />
                <span className="leading-relaxed text-[#4F473B]">
                  Sopan Hospital and Neurology Institute, Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001
                </span>
              </div>

              {/* Quick Maps Action Buttons */}
              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('location')}
                  className="w-full px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E0D5C3] text-[#27231E] font-semibold text-[11px] flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>View Interactive Map</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">GPS</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <a
                    href={SOPAN_HOSPITAL_GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs text-center"
                    title="Open hospital location in Google Maps"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={SOPAN_HOSPITAL_REVIEWS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-[#E0D5C3] text-[#27231E] font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs text-center"
                    title="Read 1,420+ 4.9★ reviews on Google Maps"
                  >
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>4.9★ Reviews</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                <a href="tel:02532317364" className="font-bold text-rose-700 hover:underline transition-colors">
                  Stroke Hotline: 0253 2317364
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#456254] shrink-0" />
                <button onClick={onOpenWhatsApp} className="font-bold text-[#456254] hover:underline transition-colors flex items-center gap-1 text-left">
                  WhatsApp: +91 94055 45521
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3F5E4D] shrink-0" />
                <span className="text-[#4F473B]">Chief Neurologist: Dr. Sanjay Sopan Varade (35+ Yrs Exp)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8E5B3E] shrink-0" />
                <a href="mailto:sopanhospital@gmail.com" className="hover:underline text-[#221B14] font-medium">
                  sopanhospital@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E5DAC8] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#787063]">
          <div>
            © 2026 Sopan Hospital & Neurology Institute, Nashik. All rights reserved.
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span className="text-[#3F5E4D]">NABH Accredited Super-Speciality Neuroscience Center</span>
            <span>•</span>
            <span>Emergency Stroke Rapid Response 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
