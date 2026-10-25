import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { VRBrainViewer } from './components/VRBrainViewer';
import { DiseaseArticles } from './components/DiseaseArticles';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { GoogleReviews } from './components/GoogleReviews';
import { PatientExperienceFeedbackModalOrSection } from './components/PatientExperienceFeedback';
import { PatientSuccessStories } from './components/PatientSuccessStories';
import { LatestNeurologyNews } from './components/LatestNeurologyNews';
import { HospitalEventsGallery } from './components/HospitalEventsGallery';
import { HospitalMapLocation } from './components/HospitalMapLocation';
import { SymptomChecker } from './components/SymptomChecker';
import { OpdAdminPortalModal } from './components/OpdAdminPortalModal';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { WhatsAppContactModal } from './components/WhatsAppContactModal';
import { Footer } from './components/Footer';
import { 
  YouTubeIcon, 
  FacebookIcon, 
  openSocialPlatform 
} from './components/SocialMediaModal';
import { playSubtleClickSound } from './utils/audioFeedback';
import { 
  MessageCircle, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X,
  Stethoscope,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCrh8X94Zm7c6HK8WdnqmBJYC1WhoYb14w",
  authDomain: "sopanhospital-be933.firebaseapp.com",
  projectId: "sopanhospital-be933",
  storageBucket: "sopanhospital-be933.firebasestorage.app",
  messagingSenderId: "739498122034",
  appId: "1:739498122034:web:35f5d0cb3f91b17a37152b"
};

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const messaging = getMessaging(firebaseApp);

function BrainHealthAssessment({ onBookAppointment }: { onBookAppointment: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    { question: "Do you have High Blood Pressure (Hypertension)?", points: 2 },
    { question: "Do you have Diabetes?", points: 2 },
    { question: "Do you smoke or consume tobacco products?", points: 2 },
    { question: "Do you have a history of heart disease or irregular heartbeat?", points: 2 },
    { question: "Is there a family history of Stroke or Brain related issues?", points: 1 },
    { question: "Are you over the age of 55?", points: 1 },
  ];

  const handleAnswer = (points: number) => {
    setScore(score + points);
    setCurrentStep(currentStep + 1);
  };

  const resetAssessment = () => {
    setScore(0);
    setCurrentStep(0);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Brain Health & Stroke Risk Test</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Free 6-step assessment by Sopan Hospital</p>
        </div>
      </div>

      {currentStep === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold text-slate-800 mb-4">Are you at risk of a Stroke?</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
            Take this quick 1-minute assessment to understand your brain health and potential stroke risk factors. Early detection saves lives.
          </p>
          <button
            onClick={() => setCurrentStep(1)}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            Start Assessment <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {currentStep > 0 && currentStep <= questions.length && (
        <div className="py-6">
          <div className="flex justify-between items-center text-sm font-bold text-slate-400 mb-6">
            <span>Question {currentStep} of {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, idx) => (
                <div key={idx} className={`h-1.5 w-6 rounded-full ${idx < currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-10 text-center leading-snug">
            {questions[currentStep - 1].question}
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={() => handleAnswer(questions[currentStep - 1].points)}
              className="flex-1 py-4 border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 rounded-2xl text-lg font-bold text-indigo-900 transition-all hover:shadow-md cursor-pointer"
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(0)}
              className="flex-1 py-4 border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-lg font-bold text-slate-600 transition-all hover:shadow-md cursor-pointer"
            >
              No
            </button>
          </div>
        </div>
      )}

      {currentStep > questions.length && (
        <div className="text-center py-6 animate-fade-in">
          <div className="mb-6">
            {score <= 2 ? (
              <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            ) : score <= 5 ? (
              <div className="w-24 h-24 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-12 h-12" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-12 h-12" />
              </div>
            )}
            
            <h3 className="text-3xl font-black text-slate-800 mb-2">
              {score <= 2 ? "Low Risk" : score <= 5 ? "Moderate Risk" : "High Risk"}
            </h3>
            
            <p className="text-slate-600 max-w-lg mx-auto mt-4 leading-relaxed">
              {score <= 2 
                ? "Your stroke risk appears to be low. Continue maintaining a healthy lifestyle, regular exercise, and a balanced diet to keep your brain healthy." 
                : score <= 5 
                ? "You have some risk factors for stroke. We recommend scheduling a routine check-up with Dr. Sanjay Varade to discuss preventive measures." 
                : "Your assessment indicates multiple high-risk factors. It is highly recommended that you consult a Neurologist immediately for a comprehensive evaluation."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={onBookAppointment}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Stethoscope className="w-5 h-5" /> Book Consultation
            </button>
            <button
              onClick={resetAssessment}
              className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
            >
              Retake Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MainApp() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('appointments');
  const [appointmentPrefill, setAppointmentPrefill] = useState<{
    symptoms?: string;
    condition?: string;
  } | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [whatsAppDefaultTemplate, setWhatsAppDefaultTemplate] = useState<string>('stroke-emergency');
  const [isEmergencyCallModalOpen, setIsEmergencyCallModalOpen] = useState<boolean>(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'fee' | 'counter' | 'appointments' | 'logs' | 'gallery'>('fee');
  const subTabsNavRef = React.useRef<HTMLDivElement>(null);

  const scrollSubTabs = (direction: 'left' | 'right') => {
    if (subTabsNavRef.current) {
      const scrollAmount = 300;
      subTabsNavRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('sopan_dr_custom_photo')) {
      localStorage.removeItem('sopan_dr_custom_photo');
      window.dispatchEvent(new Event('sopan_photo_updated'));
    }

    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  React.useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "BIDoGB7p-2C1sPNl5hsDIOas3Ku97hK7NQ23L2KX81qHYQJl_B2pfh3Qs4n-ya_Kl1BAOKS2YuV3FD_OzSmaJn4" 
          });
          console.log("FCM Push Token:", token);
        } else {
          console.log("User denied notification permission");
        }
      } catch (error) {
        console.error("Error getting notification permission:", error);
      }
    };

    requestNotificationPermission();
  }, []);

  const handleOpenWhatsApp = (template = 'stroke-emergency') => {
    setWhatsAppDefaultTemplate(template);
    setIsWhatsAppModalOpen(true);
  };

  const handleBookFromSymptomChecker = (symptomsSummary: string, suspectedCondition?: string) => {
    setAppointmentPrefill({
      symptoms: symptomsSummary,
      condition: suspectedCondition
    });
    setActiveTab('appointments');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const subTabs = [
    { id: 'appointments', label: t('nav.appointments') },
    { id: 'symptom-checker', label: t('nav.symptom_checker') },
    { id: 'brain-health-test', label: 'Brain Risk Test' },
    { id: 'location', label: t('nav.location') },
    { id: 'stories', label: t('nav.stories') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'news', label: t('nav.news') },
    { id: 'reviews', label: t('nav.reviews') },
    { id: 'patient-feedback', label: t('nav.feedback') },
    { id: 'vr-brain', label: t('nav.vr_brain') },
    { id: 'diseases', label: t('nav.diseases') },
  ];

  return (
    <div className="min-h-screen bg-[#F6F3EE] text-[#27231E] flex flex-col font-sans antialiased selection:bg-[#8E5B3E] selection:text-white">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWhatsApp={() => handleOpenWhatsApp('stroke-emergency')}
        onOpenEmergencyCall={() => setIsEmergencyCallModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        <HeroBanner
          onNavigate={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          onOpenWhatsApp={() => handleOpenWhatsApp('book-appointment')}
        />

        <div className="relative group w-full min-w-0">
          <button
            type="button"
            onClick={() => scrollSubTabs('left')}
            className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-white text-[#342E28] border border-[#D5CDBC] shadow-md items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 cursor-pointer"
            aria-label="Scroll left options"
            title="Scroll options left"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div
            ref={subTabsNavRef}
            onWheel={(e) => {
              if (e.deltaY !== 0 && subTabsNavRef.current) {
                subTabsNavRef.current.scrollLeft += e.deltaY;
              }
            }}
            className="custom-horizontal-scrollbar overflow-x-auto flex-nowrap whitespace-nowrap scroll-smooth bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-1.5 sm:p-2 shadow-xs flex items-center gap-1 sm:gap-1.5 w-full min-w-0"
          >
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`touch-friendly-btn px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#342E28] text-white shadow-xs font-bold'
                    : 'text-[#635E56] hover:text-[#27231E] hover:bg-[#EFE9DF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollSubTabs('right')}
            className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-white text-[#342E28] border border-[#D5CDBC] shadow-md items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 cursor-pointer"
            aria-label="Scroll right options"
            title="Scroll options right"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="transition-opacity duration-200">
          {activeTab === 'brain-health-test' && (
            <BrainHealthAssessment 
              onBookAppointment={() => {
                setActiveTab('appointments');
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }} 
            />
          )}

          {activeTab === 'symptom-checker' && (
            <SymptomChecker
              onBookAppointment={handleBookFromSymptomChecker}
              onOpenWhatsApp={(customMsg) => {
                if (customMsg) {
                  const encoded = encodeURIComponent(customMsg);
                  window.open(`https://wa.me/919405545521?text=${encoded}`, '_blank');
                } else {
                  handleOpenWhatsApp('stroke-emergency');
                }
              }}
              onExploreVR={(hotspotId) => {
                setActiveTab('vr-brain');
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'location' && (
            <HospitalMapLocation
              onBookConsultation={() => {
                setActiveTab('appointments');
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              onOpenWhatsApp={() => handleOpenWhatsApp('book-appointment')}
            />
          )}

          {activeTab === 'stories' && (
            <PatientSuccessStories
              onBookAppointment={() => {
                setActiveTab('appointments');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              onOpenReviews={() => {
                setActiveTab('reviews');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              onOpenWhatsApp={() => handleOpenWhatsApp('book-appointment')}
            />
          )}

          {activeTab === 'gallery' && (
            <HospitalEventsGallery
              onBookConsultation={() => {
                setActiveTab('appointments');
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              onOpenWhatsApp={() => handleOpenWhatsApp('book-appointment')}
            />
          )}

          {activeTab === 'news' && (
            <LatestNeurologyNews
              onBookConsultation={() => {
                setActiveTab('appointments');
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              onOpenWhatsApp={() => handleOpenWhatsApp('book-appointment')}
            />
          )}

          {activeTab === 'vr-brain' && <VRBrainViewer />}

          {activeTab === 'diseases' && (
            <DiseaseArticles
              onOpenVRForArticle={() => {
                setActiveTab('vr-brain');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBookConsultationForDisease={() => {
                setActiveTab('appointments');
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentScheduler
              initialSymptoms={appointmentPrefill?.symptoms}
              initialDiseaseContext={appointmentPrefill?.condition}
            />
          )}

          {activeTab === 'reviews' && <GoogleReviews />}

          {activeTab === 'patient-feedback' && (
            <PatientExperienceFeedbackModalOrSection
              onViewGoogleReviews={() => {
                setActiveTab('reviews');
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </main>

      <OpdAdminPortalModal
        isOpen={isAdminModalOpen}
        initialTab={adminInitialTab}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        <div 
          className="flex items-center gap-2 p-1.5 rounded-full bg-[#27231E]/95 hover:bg-[#27231E] backdrop-blur-md shadow-2xl border border-white/20 transition-all select-none"
          title="Official Social Media: Dr. Sanjay Varade & Sopan Hospital"
        >
          <button
            type="button"
            id="floating-btn-youtube"
            onClick={() => {
              playSubtleClickSound();
              openSocialPlatform('youtube');
            }}
            className="w-8.5 h-8.5 rounded-full bg-white hover:bg-red-50 text-red-600 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-xs cursor-pointer group"
            title="Open Dr. Sanjay Varade YouTube Channel (@dr.sanjayvarade5339) in YouTube App"
            aria-label="YouTube Channel"
          >
            <YouTubeIcon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            type="button"
            id="floating-btn-facebook"
            onClick={() => {
              playSubtleClickSound();
              openSocialPlatform('facebook');
            }}
            className="w-8.5 h-8.5 rounded-full bg-white hover:bg-blue-50 text-[#1877F2] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-xs cursor-pointer group"
            title="Open Sopan Hospital Facebook Page (/sopanhospitalnashik) in Facebook App"
            aria-label="Facebook Page"
          >
            <FacebookIcon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <button
          id="btn-floating-whatsapp"
          onClick={() => {
            playSubtleClickSound();
            handleOpenWhatsApp('stroke-emergency');
          }}
          className="group relative px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-700/40 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 animate-subtle-pulse cursor-pointer"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full" />
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="text-xs font-bold hidden sm:inline pr-1">
            WhatsApp: 9405545521
          </span>
        </button>
      </div>

      <WhatsAppContactModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        defaultTemplate={whatsAppDefaultTemplate}
      />

      {isEmergencyCallModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-rose-600 mb-1">
                24/7 Stroke Rapid Response Protocol
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Sopan Hospital & Neurology Institute
              </h3>
              <p className="text-[11px] font-semibold text-cyan-800 mt-0.5">
                Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Chief Consultant: Dr. Sanjay Sopan Varade MD, DM Neuro
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                If the patient exhibits sudden facial droop, arm weakness, or slurred speech, 
                every minute saves 1.9 million neurons. The emergency acute stroke team is on standby 24/7.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Biplane Angiography & Thrombolysis: ACTIVE</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Door-To-Needle Target: &lt; 25 Minutes</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="tel:02532317364"
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Stroke Hotline: 0253 2317364
              </a>

              <button
                onClick={() => {
                  setIsEmergencyCallModalOpen(false);
                  handleOpenWhatsApp('stroke-emergency');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Alert Triage Team via WhatsApp (9405545521)
              </button>

              <button
                onClick={() => setIsEmergencyCallModalOpen(false)}
                className="w-full py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenWhatsApp={() => handleOpenWhatsApp('book-appointment')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
