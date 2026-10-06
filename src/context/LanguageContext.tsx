import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Emergency Bar
    'emergency.banner': '24/7 ACUTE STROKE & NEURO EMERGENCY HOTLINE:',
    'emergency.location': 'Mumbai Naka, Nashik • 32-Slice CT & ICU Ready',
    'hospital.name': 'SOPAN HOSPITAL',
    'hospital.tagline': 'NEUROLOGY INSTITUTE',
    'doctor.title': 'Chief Neurologist: Dr. Sanjay Sopan Varade (MD, DM Neuro, 35+ Yrs Exp) • OPD ₹1,500',
    'call.emergency': 'Emergency: 0253 2317364',
    'google.signin': 'Google Sign-in',
    'google.signout': 'Sign Out',
    'whatsapp.btn': 'WhatsApp',
    'book.opd': 'Book OPD (₹1,500)',

    // Navigation Tabs
    'nav.ai_assistant': 'Gemini AI Assistant',
    'nav.symptom_checker': 'Symptom Checker',
    'nav.stories': 'Success Stories',
    'nav.gallery': 'Occasion Photos',
    'nav.news': 'Neuro News',
    'nav.appointments': 'Book OPD (₹1,500)',
    'nav.location': 'Hospital Location & Maps',
    'nav.reviews': 'Reviews (4.9★)',
    'nav.feedback': 'Patient Feedback',
    'nav.portal': 'Patient Portal',
    'nav.vr_brain': '3D/VR Brain',
    'nav.diseases': 'Diseases & Care',
    'nav.monitoring': 'Remote RPM',
    'nav.case_studies': 'Case Studies',
    'nav.payroll': 'Staff System',

    // Hero
    'hero.badge': 'NABH Accredited Super-Speciality Neuro Hospital',
    'hero.title': 'Advanced Clinical Neurology, Stroke Care & Neurosurgery in Nashik',
    'hero.subtitle': 'Under the visionary leadership of Dr. Sanjay Sopan Varade (MD, DM Neuro), offering 24/7 Acute Ischemic Stroke thrombolysis, Video-EEG telemetry, Parkinson DBS tuning, and comprehensive neuro-rehabilitation.',
    'hero.cta.book': 'Book OPD Consultation (₹1,500)',
    'hero.cta.symptom': 'Check Symptoms with AI',
    'hero.cta.call': 'Emergency Stroke Call',

    // Chatbot
    'chat.title': 'Sopan AI Clinical Navigator',
    'chat.online': 'Online',
    'chat.subtitle': 'Dr. Sanjay Sopan Varade (MD, DM Neuro) OPD Desk',
    'chat.general_triage': 'General Triage',
    'chat.search_grounding': 'Search Grounding',
    'chat.maps_grounding': 'Maps Grounding',
    'chat.live_voice': 'Live Voice (3.8 Live)',
    'chat.end_voice': 'End Live Voice',
    'chat.quick_ask': 'Quick Ask:',
    'chat.input_placeholder': 'Type your neurological question, symptom description, or OPD inquiry...',
    'chat.send': 'Send',
    'chat.welcome': 'Hello! I am the Sopan Hospital AI Clinical & Patient Navigator for Dr. Sanjay Sopan Varade (MD, DM Neuro) at Mumbai Naka, Nashik.\n\nHow may I assist you today? You can inquire about:\n- Common symptoms (headaches, seizures, dizziness, nerve pain)\n- OPD timings & appointment booking\n- Directions to Sopan Hospital via Google Maps\n- Recent neurological research via Google Search\n- Or use your microphone for voice transcription!',

    // Floating WhatsApp
    'float.emergency': '24/7 Neuro Emergency Desk'
  },
  mr: {
    // Header & Emergency Bar
    'emergency.banner': '२४/७ तातडीची पक्षाघात (स्ट्रोक) आणि न्यूरो आपत्कालीन हेल्पलाईन:',
    'emergency.location': 'मुंबई नाका, नाशिक • ३२-स्लाइस सीटी आणि आयसीयू सज्ज',
    'hospital.name': 'सोपान हॉस्पिटल',
    'hospital.tagline': 'न्यूरोलॉजी इन्स्टिट्यूट',
    'doctor.title': 'प्रमुख न्यूरोलॉजिस्ट: डॉ. संजय सोपान वराडे (MD, DM Neuro, ३५+ वर्षे अनुभव) • ओपीडी ₹१,५००',
    'call.emergency': 'आपत्कालीन: ०२५३ २३१७३६४',
    'google.signin': 'गुगल साइन-इन',
    'google.signout': 'लॉग आउट',
    'whatsapp.btn': 'व्हॉट्सॲप',
    'book.opd': 'ओपीडी अपॉइंटमेंट (₹१,५००)',

    // Navigation Tabs
    'nav.ai_assistant': 'जेमिनी एआय सहाय्यक',
    'nav.symptom_checker': 'लक्षण तपासणी',
    'nav.stories': 'रुग्ण यशोगाथा',
    'nav.gallery': 'रुग्णालय छायाचित्रे',
    'nav.news': 'न्यूरोलॉजी बातम्या',
    'nav.appointments': 'ओपीडी बुकिंग (₹१,५००)',
    'nav.location': 'हॉस्पिटल स्थान व गुगल मॅप',
    'nav.reviews': 'रुग्ण अभिप्राय (४.९★)',
    'nav.feedback': 'रुग्ण अनुभव नोंदवा',
    'nav.portal': 'रुग्ण पोर्टल',
    'nav.vr_brain': '३D मेंदू रचना',
    'nav.diseases': 'आजारांविषयी माहिती',
    'nav.monitoring': 'रिमोट मॉनिटरिंग',
    'nav.case_studies': 'केस स्टडीज',
    'nav.payroll': 'कर्मचारी प्रणाली',

    // Hero
    'hero.badge': 'एनएबीएच (NABH) मान्यताप्राप्त सुपर-स्पेशालिटी न्यूरो रुग्णालय',
    'hero.title': 'नाशिकमधील प्रगत न्यूरोलॉजी, स्ट्रोक उपचार व मेंदूविकार केंद्र',
    'hero.subtitle': 'डॉ. संजय सोपान वराडे (MD, DM Neuro) यांच्या मार्गदर्शनाखाली २४/७ पक्षाघात (स्ट्रोक) उपचार, व्हिडिओ-ईईजी, पार्किन्सन्स तपासणी आणि सर्वसमावेशक न्यूरो पुनर्वसन सुविधा उपलब्ध.',
    'hero.cta.book': 'ओपीडी अपॉइंटमेंट बुक करा (₹१,५००)',
    'hero.cta.symptom': 'एआय सह लक्षणे तपासा',
    'hero.cta.call': 'स्ट्रोक आपत्कालीन कॉल',

    // Chatbot
    'chat.title': 'सोपान एआय क्लिनिकल सहाय्यक',
    'chat.online': 'सक्रिय',
    'chat.subtitle': 'डॉ. संजय सोपान वराडे (MD, DM Neuro) ओपीडी कक्ष, नाशिक',
    'chat.general_triage': 'सामान्य लक्षणे',
    'chat.search_grounding': 'गुगल सर्च माहिती',
    'chat.maps_grounding': 'गुगल मॅप्स मार्गदर्शन',
    'chat.live_voice': 'लाईव्ह व्हॉईस संभाषण',
    'chat.end_voice': 'व्हॉईस कॉल समाप्त करा',
    'chat.quick_ask': 'वारंवार विचारले जाणारे प्रश्न:',
    'chat.input_placeholder': 'आपली लक्षणे, प्रश्न किंवा ओपीडी चौकशी मराठीत किंवा इंग्रजीत विचारा...',
    'chat.send': 'पाठवा',
    'chat.welcome': 'नमस्कार! मी सोपान हॉस्पिटल न्यूरोलॉजी इन्स्टिट्यूटचा अधिकृत एआय सहाय्यक आहे. डॉ. संजय सोपान वराडे (MD, DM Neuro) यांच्या मार्गदर्शनाखाली मी रुग्णांना मेंदू व मज्जारज्जूच्या आजारांविषयी, ओपीडी वेळ व उपचारांबद्दल माहिती देतो.\n\nमी तुम्हाला कशी मदत करू शकेन?\n- पक्षाघात (स्ट्रोक), डोकेदुखी, फिट्स (मिरगी), चक्कर येणे यांसारखी लक्षणे\n- ओपीडी वेळ आणि अपॉइंटमेंट बुकिंग प्रक्रिया\n- मुंबई नाका नाशिक येथील पत्ता आणि मार्ग (गुगल मॅप्स)\n- नवीनतम वैद्यकीय संशोधन\n- किंवा मायक्रोफोन बटण दाबून थेट बोलून विचारू शकता!',

    // Floating WhatsApp
    'float.emergency': '२४/७ न्यूरो इमर्जन्सी डेस्क'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sopan_language_preference');
    return (saved === 'mr' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sopan_language_preference', lang);

    // If authenticated, sync language preference to Firestore profile
    if (user?.uid) {
      try {
        setDoc(doc(db, 'users', user.uid), {
          preferredLanguage: lang,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Could not save language to Firestore:', err);
      }
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'mr' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
