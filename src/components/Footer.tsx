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
import { useHospitalContent } from '../hooks/useHospitalContent';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigate: (tabId: string) => void;
  onOpenWhatsApp: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenWhatsApp
}) => {
  const { content } = useHospitalContent();
  const { t, language } = useLanguage();
  const consultationFee = content.consultationFee;
  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E5DAC8] text-[#5C5346] text-xs mt-16 shadow-xs">
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
                  {language === 'mr' ? 'सोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट' : 'SOPAN HOSPITAL & NEUROLOGY INSTITUTE'}
                </h3>
                <p className="text-[11px] text-[#8E5B3E] font-medium">
                  {language === 'mr' ? 'एनएबीएच (NABH) मान्यताप्राप्त सुपर-स्पेशालिटी न्यूरो रुग्णालय' : (content.heroBadgeText || 'NABH Accredited Super-Speciality Neuroscience Center')}
                </p>
              </div>
            </div>

            <p className="text-[#685F51] leading-relaxed text-xs max-w-sm">
              {language === 'mr' 
                ? `डॉ. संजय सोपान वराडे (MD, DM Neuro, ३५+ वर्षे अनुभव) यांच्या नेतृत्वाखाली २४/७ हायपर-अक्यूट स्ट्रोक थ्रोम्बोलिसिस, ३२-स्लाइस सीटी इमर्जन्सी डायग्नोस्टिक्स, मिरगी आणि न्यूरो-आयसीयू उपचार उपलब्ध (ओपीडी तपासणी फी: ₹${consultationFee.toLocaleString('en-IN')}).`
                : `Dedicated to clinical excellence in hyper-acute stroke intervention, 32-slice CT emergency diagnostics, intractable epilepsy, and neuro-critical care led by ${content.directorName} (${content.directorTitle}, ${content.directorExperience} • Consultation Fee: ₹${consultationFee.toLocaleString('en-IN')}).`
              }
            </p>

            <div className="flex items-center gap-3 text-[11px] text-[#456254] font-semibold">
              <span className="flex items-center gap-1.5 bg-[#EAF0EC] px-3 py-1 rounded-full border border-[#D2DFD6]">
                <Award className="w-3.5 h-3.5 text-[#3F5E4D]" />
                {language === 'mr' ? 'एनएबीएच मान्यताप्राप्त न्यूरोसायन्स सेंटर' : 'NABH Accredited Super-Speciality Neuroscience Center'}
              </span>
            </div>
          </div>

          {/* Col 3: Key Portals */}
          <div className="space-y-3">
            <h4 className="text-[#221B14] font-serif font-bold uppercase text-[11px] tracking-wider">
              {language === 'mr' ? 'रुग्ण व वैद्यकीय सेवा' : 'Patient & Clinical Portals'}
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('appointments')} className="hover:text-[#8E5B3E] transition-colors text-left cursor-pointer">
                  {language === 'mr' ? `डॉक्टर ओपीडी अपॉइंटमेंट (₹${consultationFee.toLocaleString('en-IN')})` : `Doctor Appointment Scheduling (₹${consultationFee.toLocaleString('en-IN')})`}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('stories')} className="hover:text-[#221B14] text-[#8E5B3E] transition-colors font-semibold flex items-center gap-1 cursor-pointer">
                  <span>★</span> {language === 'mr' ? 'रुग्ण यशोगाथा' : 'Patient Success Stories'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('news')} className="hover:text-[#221B14] text-[#456254] transition-colors font-semibold flex items-center gap-1 cursor-pointer">
                  <span>📰</span> {language === 'mr' ? 'न्यूरोलॉजी संशोधन व ताज्या बातम्या' : 'Latest Neurology News & Research'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('vr-brain')} className="hover:text-[#8E5B3E] transition-colors text-left cursor-pointer">
                  {language === 'mr' ? '३D / ३२-स्लाइस सीटी मेंदू रचना' : '3D / VR Brain & 32-Slice CT Explorer'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Patient Community & Reviews */}
          <div className="space-y-3">
            <h4 className="text-[#221B14] font-serif font-bold uppercase text-[11px] tracking-wider">
              {language === 'mr' ? 'रुग्ण समूह व माहिती' : 'Patient Community & Care'}
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-[#8E5B3E] transition-colors text-left cursor-pointer">
                  {language === 'mr' ? 'हॉस्पिटल कार्यक्रम व छायाचित्रे' : 'Hospital Occasion & Events Gallery'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('patient-feedback')} className="hover:text-[#8E5B3E] transition-colors text-left cursor-pointer">
                  {language === 'mr' ? 'रुग्ण अनुभव व अभिप्राय' : 'Patient Experience & Feedback'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="hover:text-[#8E5B3E] transition-colors text-left cursor-pointer">
                  {language === 'mr' ? 'गुगल सत्यापित अभिप्राय (४.९★)' : 'Google Verified Reviews (4.9★)'}
                </button>
              </li>
              <li>
                <button onClick={onOpenWhatsApp} className="hover:text-[#324B3E] transition-colors text-[#3F5E4D] font-semibold flex items-center gap-1 cursor-pointer">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {language === 'mr' ? 'व्हॉट्सॲप हेल्प डेस्क (९४०५५४५५२१)' : (content.whatsappDisplay || 'WhatsApp Desk (9405545521)')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Emergency Contact */}
          <div className="space-y-3">
            <h4 className="text-[#221B14] font-serif font-bold uppercase text-[11px] tracking-wider">
              {language === 'mr' ? 'हॉस्पिटल पत्ता व संपर्क' : 'Hospital Address & Emergency'}
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8E5B3E] shrink-0 mt-0.5" />
                <span className="leading-relaxed text-[#4F473B]">
                  {language === 'mr' 
                    ? 'सोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट, श्रीहरी कुटे मार्ग, संदीप हॉटेल जवळ, मुंबई नाका, नाशिक - ४२२००१'
                    : (content.hospitalAddress || 'Sopan Hospital and Neurology Institute, Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001')}
                </span>
              </div>

              {/* Quick Maps Action Buttons */}
              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('location')}
                  className="w-full px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E0D5C3] text-[#27231E] font-semibold text-[11px] flex items-center justify-between transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>{language === 'mr' ? 'गुगल मॅप्सवर शोधा' : 'View Interactive Map'}</span>
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
                    <span>४.९★ अभिप्राय</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                <a href={`tel:${content.emergencyPhone || '02532317364'}`} className="font-bold text-rose-700 hover:underline transition-colors">
                  {language === 'mr' ? 'स्ट्रोक हेल्पलाईन:' : 'Stroke Hotline:'} {content.emergencyPhoneDisplay || '0253 2317364'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#456254] shrink-0" />
                <button onClick={onOpenWhatsApp} className="font-bold text-[#456254] hover:underline transition-colors flex items-center gap-1 text-left cursor-pointer">
                  {content.whatsappDisplay || 'WhatsApp: +91 94055 45521'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3F5E4D] shrink-0" />
                <span className="text-[#4F473B]">
                  {language === 'mr' ? 'प्रमुख न्यूरोलॉजिस्ट: डॉ. संजय सोपान वराडे (३५+ वर्षे अनुभव)' : 'Chief Neurologist: Dr. Sanjay Sopan Varade (35+ Yrs Exp)'}
                </span>
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
            {language === 'mr' 
              ? '© २०२६ सोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट, नाशिक. सर्व हक्क सुरक्षित.'
              : '© 2026 Sopan Hospital & Neurology Institute, Nashik. All rights reserved.'}
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span className="text-[#3F5E4D]">{language === 'mr' ? 'एनएबीएच मान्यताप्राप्त सुपर-स्पेशालिटी न्यूरो रुग्णालय' : 'NABH Accredited Super-Speciality Neuroscience Center'}</span>
            <span>•</span>
            <span>{language === 'mr' ? '२४/७ स्ट्रोक रॅपिड रिस्पॉन्स सेवा' : 'Emergency Stroke Rapid Response 24/7'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
