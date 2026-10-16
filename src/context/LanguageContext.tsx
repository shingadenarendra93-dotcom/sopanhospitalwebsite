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
    'nav.vr_brain': '3D/VR Brain & CT',
    'nav.diseases': 'Diseases & Care',
    'nav.monitoring': 'Remote RPM',
    'nav.case_studies': 'Case Studies',
    'nav.payroll': 'Staff System',

    // Hero Banner
    'hero.badge': 'NABH Accredited Super-Speciality Neuro Hospital',
    'hero.title': 'Advanced Clinical Neurology, Stroke Care & Neurosurgery in Nashik',
    'hero.subtitle': 'Under the visionary leadership of Dr. Sanjay Sopan Varade (MD, DM Neuro), offering 24/7 Acute Ischemic Stroke thrombolysis, 32-slice CT emergency diagnostics, Video-EEG telemetry, Parkinson DBS tuning, and comprehensive neuro-rehabilitation.',
    'hero.cta.book': 'Schedule OPD (₹1,500)',
    'hero.cta.symptom': 'Symptom Checker',
    'hero.cta.stories': 'Patient Success Stories',
    'hero.cta.news': 'Latest Neuro News',
    'hero.cta.whatsapp': 'WhatsApp: 9405545521',
    'hero.cta.call': 'Emergency Stroke Call',
    'hero.intake': "Today's OPD Patient Intake:",
    'hero.slots_available': 'Slots Available',
    'hero.descending_note': '(Descending Live Quota)',
    'hero.rating': '4.96 Rating • 740+ Reviews',
    'hero.director_title': 'Director & Chief Consultant Neurologist',
    'hero.default_portrait': 'Default Verified Portrait',
    'hero.consultation_fee': 'Consultation Fee:',
    'hero.experience': 'Experience:',
    'hero.emergency_hotline': 'Stroke Emergency Hotline:',
    'hero.opd_hours': 'OPD Timings:',
    'hero.opd_hours_val': 'Mon - Sat: 10:00 AM - 6:00 PM',
    'hero.book_token': 'Book Token',
    'hero.map_btn': 'Map 📍',

    // Appointment Scheduler
    'apt.title': 'Book OPD Consultation with Dr. Sanjay Sopan Varade',
    'apt.subtitle': 'Premier Neurologist in Nashik • Consultation Fee: ₹1,500 • Instant Token Confirmation',
    'apt.intake_title': "Today's OPD Patient Intake & Live Quota",
    'apt.step1': 'Select Slot & Visit Type',
    'apt.step2': 'Patient Details',
    'apt.step3': 'Confirmation Slip',
    'apt.in_person': 'In-Person Hospital OPD',
    'apt.video': 'Tele-Neurology Video Consultation',
    'apt.select_date': 'Select Appointment Date',
    'apt.select_time': 'Select Time Slot',
    'apt.morning': 'Morning Session (10:00 AM - 01:30 PM)',
    'apt.afternoon': 'Afternoon Session (02:30 PM - 06:00 PM)',
    'apt.patient_details': 'Patient Information',
    'apt.full_name': 'Patient Full Name',
    'apt.phone': 'Mobile Phone Number',
    'apt.age': 'Age (Years)',
    'apt.gender': 'Gender',
    'apt.male': 'Male',
    'apt.female': 'Female',
    'apt.other': 'Other',
    'apt.symptoms': 'Chief Complaints / Symptoms (e.g. Headache, Seizures, Stroke, Tremors)',
    'apt.confirm_btn': 'Confirm OPD Appointment (₹1,500)',
    'apt.fee_notice': 'Consultation fee payable at hospital reception: ₹1,500',
    'apt.confirmed_title': 'OPD Appointment Confirmed!',
    'apt.token_no': 'Token Number:',
    'apt.download_receipt': 'Download Slip',
    'apt.print_receipt': 'Print Slip',
    'apt.back_home': 'Back to Schedule',
    'apt.search_doctor': 'Search by doctor or specialty...',
    'apt.all_departments': 'All Departments',

    // Symptom Checker
    'sym.title': 'Neurological Symptom Checker',
    'sym.subtitle': 'Preliminary clinical triage based on Dr. Sanjay Sopan Varade’s stroke & neurological care protocols',
    'sym.select_prompt': 'Select your primary symptoms or warning signs:',
    'sym.headache': 'Severe Headache / Migraine',
    'sym.stroke': 'Sudden Weakness / Stroke (Face/Arm/Speech)',
    'sym.seizures': 'Seizures / Epilepsy Fits',
    'sym.dizziness': 'Vertigo / Dizziness & Balance Loss',
    'sym.numbness': 'Numbness / Tingling in Limbs',
    'sym.tremor': 'Tremors / Involuntary Movements (Parkinson’s)',
    'sym.memory': 'Memory Loss / Cognitive Decline',
    'sym.sleep': 'Sleep Disturbances / Insomnia',
    'sym.spine': 'Neck / Lower Back & Nerve Pain',
    'sym.fast_alert': 'BE-FAST WARNING: If you observe Face drooping, Arm weakness, or Speech slurring, rush to Sopan Hospital immediately or dial the emergency hotline.',
    'sym.book_now': 'Book OPD Consultation with Dr. Varade',
    'sym.chat_ai': 'Ask AI Clinical Navigator',

    // Hospital Location & Maps
    'loc.title': 'Hospital Location & Google Maps',
    'loc.subtitle': 'Centrally situated at Mumbai Naka, Nashik for rapid 24/7 acute neuro emergency access',
    'loc.address_title': 'Official Hospital Address:',
    'loc.address_text': 'Sopan Hospital & Neurology Institute, Mumbai Naka, Nashik, Maharashtra 422002',
    'loc.open_maps': 'Open in Google Maps',
    'loc.directions': 'Get Directions',
    'loc.ambulance': '24/7 Emergency Ambulance Entrance',
    'loc.landmarks': 'Landmark: Near Mumbai Naka Signal, Mumbai-Agra Highway Junction',

    // Stories & Reviews & Gallery & News
    'stories.title': 'Patient Success Stories & Testimonials',
    'stories.subtitle': 'Inspiring real-life neurological recoveries and clinical triumphs at Sopan Hospital',
    'news.title': 'Latest Neurology Research & News',
    'news.subtitle': 'Curated medical breakthroughs in stroke care, epilepsy, Parkinson’s, and neuro-imaging worldwide',
    'gallery.title': 'Hospital Occasion & Events Gallery',
    'gallery.subtitle': 'Photographic highlights from World Stroke Day, health awareness camps, and academic symposia',
    'reviews.title': 'Verified Google Patient Reviews (4.9★)',
    'reviews.subtitle': 'Authentic feedback and experiences from thousands of treated patients across Maharashtra',

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

    // Footer
    'footer.about': 'Super-Speciality Neuroscience Hospital led by Dr. Sanjay Sopan Varade (MD, DM Neuro, 35+ Yrs Exp). Equipped with 32-Slice CT, 24/7 Stroke Thrombolysis, and Neuro-ICU.',
    'footer.portals': 'Patient & Clinical Portals',
    'footer.community': 'Patient Community & Care',
    'footer.contact': 'Hospital Location & Contact',
    'footer.copyright': 'All rights reserved. Sopan Hospital & Neurology Institute, Nashik.',

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
    'nav.location': 'हॉस्पिटल स्थान व नकाशे',
    'nav.reviews': 'रुग्ण अभिप्राय (४.९★)',
    'nav.feedback': 'रुग्ण अनुभव नोंदवा',
    'nav.portal': 'रुग्ण पोर्टल',
    'nav.vr_brain': '३D / ३२-स्लाइस सीटी मेंदू',
    'nav.diseases': 'आजारांविषयी माहिती',
    'nav.monitoring': 'रिमोट मॉनिटरिंग',
    'nav.case_studies': 'केस स्टडीज',
    'nav.payroll': 'कर्मचारी प्रणाली',

    // Hero Banner
    'hero.badge': 'एनएबीएच (NABH) मान्यताप्राप्त सुपर-स्पेशालिटी न्यूरो रुग्णालय',
    'hero.title': 'नाशिकमधील प्रगत क्लिनिकल न्यूरोलॉजी, स्ट्रोक उपचार व मेंदूविकार केंद्र',
    'hero.subtitle': 'डॉ. संजय सोपान वराडे (MD, DM Neuro) यांच्या मार्गदर्शनाखाली २४/७ पक्षाघात (स्ट्रोक) थ्रोम्बोलिसिस, ३२-स्लाइस सीटी स्कॅन, व्हिडिओ-ईईजी, पार्किन्सन्स तपासणी आणि सर्वसमावेशक न्यूरो पुनर्वसन सुविधा उपलब्ध.',
    'hero.cta.book': 'ओपीडी अपॉइंटमेंट घ्या (₹१,५००)',
    'hero.cta.symptom': 'लक्षणे तपासा (AI)',
    'hero.cta.stories': 'रुग्ण यशोगाथा',
    'hero.cta.news': 'ताज्या न्यूरो बातम्या',
    'hero.cta.whatsapp': 'व्हॉट्सॲप: ९४०५५४५५२१',
    'hero.cta.call': 'स्ट्रोक आपत्कालीन कॉल',
    'hero.intake': 'आजचे ओपीडी रुग्ण प्रवेश:',
    'hero.slots_available': 'स्लॉट उपलब्ध',
    'hero.descending_note': '(थेट उतरता कोटा)',
    'hero.rating': '४.९६ रेटिंग • ७४०+ अभिप्राय',
    'hero.director_title': 'संचालक व मुख्य सल्लागार न्यूरोलॉजिस्ट',
    'hero.default_portrait': 'सत्यापित अधिकृत छायाचित्र',
    'hero.consultation_fee': 'तपासणी फी:',
    'hero.experience': 'अनुभव:',
    'hero.emergency_hotline': 'स्ट्रोक आपत्कालीन हेल्पलाईन:',
    'hero.opd_hours': 'ओपीडी वेळ:',
    'hero.opd_hours_val': 'सोम - शनि: सकाळी १०:०० ते संध्याकाळी ६:००',
    'hero.book_token': 'टोकन घ्या',
    'hero.map_btn': 'नकाशा 📍',

    // Appointment Scheduler
    'apt.title': 'डॉ. संजय सोपान वराडे यांच्यासोबत ओपीडी सल्लामसलत बुक करा',
    'apt.subtitle': 'नाशिकमधील अग्रगण्य न्यूरोलॉजिस्ट • ओपीडी फी: ₹१,५०० • त्वरित टोकन कन्फर्मेशन',
    'apt.intake_title': 'आजचे ओपीडी रुग्ण प्रवेश प्रमाण (थेट स्लॉट काउंटर)',
    'apt.step1': 'वेळ स्लॉट व भेटीचा प्रकार',
    'apt.step2': 'रुग्णाची माहिती',
    'apt.step3': 'नोंदणी पावती',
    'apt.in_person': 'हॉस्पिटलमध्ये प्रत्यक्ष ओपीडी',
    'apt.video': 'टेलि-न्यूरोलॉजी व्हिडिओ सल्लामसलत',
    'apt.select_date': 'अपॉइंटमेंटची तारीख निवडा',
    'apt.select_time': 'सोयीची वेळ निवडा',
    'apt.morning': 'सकाळ सत्र (१०:०० AM - ०१:३० PM)',
    'apt.afternoon': 'दुपार सत्र (०२:३० PM - ०६:०० PM)',
    'apt.patient_details': 'रुग्णाची सविस्तर माहिती',
    'apt.full_name': 'रुग्णाचे पूर्ण नाव',
    'apt.phone': 'मोबाईल नंबर',
    'apt.age': 'वय (वर्षे)',
    'apt.gender': 'लिंग',
    'apt.male': 'पुरुष',
    'apt.female': 'महिला',
    'apt.other': 'इतर',
    'apt.symptoms': 'मुख्य तक्रारी / लक्षणे (उदा. डोकेदुखी, चक्कर, पक्षाघात, झटके, थरथर)',
    'apt.confirm_btn': 'ओपीडी अपॉइंटमेंट पक्की करा (₹१,५००)',
    'apt.fee_notice': 'हॉस्पिटल काउंटरवर देय तपासणी फी: ₹१,५००',
    'apt.confirmed_title': 'अपॉइंटमेंट यशस्वीरित्या नोंदवली गेली!',
    'apt.token_no': 'टोकन क्रमांक:',
    'apt.download_receipt': 'पावती डाउनलोड करा',
    'apt.print_receipt': 'पावती प्रिंट करा',
    'apt.back_home': 'अपॉइंटमेंट यादीकडे परत जा',
    'apt.search_doctor': 'डॉक्टर किंवा विभाग शोधा...',
    'apt.all_departments': 'सर्व विभाग',

    // Symptom Checker
    'sym.title': 'न्यूरोलॉजिकल लक्षण तपासणी सहाय्यक',
    'sym.subtitle': 'डॉ. संजय सोपान वराडे (MD, DM Neuro) यांच्या क्लिनिकल प्रोटोकॉलवर आधारित प्राथमिक तपासणी',
    'sym.select_prompt': 'आपली मुख्य लक्षणे किंवा धोक्याचे संकेत निवडा:',
    'sym.headache': 'तीव्र डोकेदुखी / मायग्रेन',
    'sym.stroke': 'एका बाजूला अचानक अशक्तपणा / पक्षाघात (स्ट्रोक)',
    'sym.seizures': 'झटके / फिट्स (मिरगी / एपिलेप्सी)',
    'sym.dizziness': 'चक्कर येणे / तोल जाणे (व्हर्टिगो)',
    'sym.numbness': 'हातापायांना मुंग्या येणे / बधीरपणा',
    'sym.tremor': 'हात थरथरणे / कंपवात (पार्किन्सन्स)',
    'sym.memory': 'स्मृतीभ्रंश / विस्मरण (अल्झायमर्स)',
    'sym.sleep': 'झोपेचे विकार / अनिद्रा',
    'sym.spine': 'मान, पाठ किंवा मणक्यातील मज्जातंतू वेदना',
    'sym.fast_alert': 'तातडीचा इशारा (BE-FAST): जर अचानक चेहऱ्यावर वाक आले, हात उचलता येत नसेल किंवा बोलण्यात अडखळत असाल, तर त्वरित २४/७ स्ट्रोक आपत्कालीन हेल्पलाईनवर कॉल करा!',
    'sym.book_now': 'डॉ. संजय वराडे यांच्याशी सल्लामसलत बुक करा',
    'sym.chat_ai': 'सोपान एआय सहाय्यकाशी बोला',

    // Hospital Location & Maps
    'loc.title': 'हॉस्पिटल स्थान व गुगल मॅप्स',
    'loc.subtitle': 'तातडीच्या रुग्णवाहिका प्रवेशासाठी मुंबई नाका, नाशिक येथे सुसज्ज केंद्र',
    'loc.address_title': 'अधिकृत हॉस्पिटल पत्ता:',
    'loc.address_text': 'सोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट, मुंबई नाका, नाशिक, महाराष्ट्र ४२२००२',
    'loc.open_maps': 'गुगल मॅप्सवर उघडा',
    'loc.directions': 'मार्गदर्शन (Directions) मिळवा',
    'loc.ambulance': '२४/७ आपत्कालीन रुग्णवाहिका प्रवेशद्वार',
    'loc.landmarks': 'लँडमार्क: मुंबई नाका सिग्नल जवळ, मुंबई-आग्रा महामार्ग जंक्शन',

    // Stories & Reviews & Gallery & News
    'stories.title': 'रुग्ण यशोगाथा व अनुभव',
    'stories.subtitle': 'सोपान हॉस्पिटलमध्ये पक्षाघात (स्ट्रोक) आणि मेंदूविकारांवर यशस्वी मात केलेल्या रुग्णांचे अनुभव',
    'news.title': 'जागतिक न्यूरोलॉजी संशोधन व बातम्या',
    'news.subtitle': 'पक्षाघात, अल्झायमर्स, एपिलेप्सी आणि मेंदूविकार उपचारांमधील अद्ययावत वैद्यकीय संशोधन',
    'gallery.title': 'हॉस्पिटल कार्यक्रम व छायाचित्रे',
    'gallery.subtitle': 'जागतिक स्ट्रोक दिन, रुग्ण जनजागृती शिबिरे आणि विशेष उपक्रमांची छायाचित्रे',
    'reviews.title': 'गुगलवरील सत्यापित रुग्ण अभिप्राय (४.९★)',
    'reviews.subtitle': 'नाशिक आणि संपूर्ण महाराष्ट्रातील रुग्णांचा डॉ. संजय वराडे यांच्यावरील अढळ विश्वास',

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

    // Footer
    'footer.about': 'डॉ. संजय सोपान वराडे (MD, DM Neuro, ३५+ वर्षे अनुभव) यांच्या नेतृत्वाखाली उत्तर महाराष्ट्रातील अग्रगण्य सुपर-स्पेशालिटी न्यूरो रुग्णालय. ३२-स्लाइस सीटी, २४/७ स्ट्रोक थ्रोम्बोलिसिस आणि न्यूरो-आयसीयू सुविधा.',
    'footer.portals': 'रुग्ण व वैद्यकीय सेवा',
    'footer.community': 'रुग्ण समूह व माहिती',
    'footer.contact': 'हॉस्पिटल पत्ता व संपर्क',
    'footer.copyright': 'सर्व हक्क सुरक्षित. सोपान हॉस्पिटल आणि न्यूरोलॉजी इन्स्टिट्यूट, नाशिक.',

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
