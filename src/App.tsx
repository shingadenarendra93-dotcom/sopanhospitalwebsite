import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { VRBrainViewer } from './components/VRBrainViewer';
import { DiseaseArticles } from './components/DiseaseArticles';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { PatientPortal } from './components/PatientPortal';
import { RemoteMonitoring } from './components/RemoteMonitoring';
import { CaseStudyDatabase } from './components/CaseStudyDatabase';
import { StaffPayroll } from './components/StaffPayroll';
import { GoogleReviews } from './components/GoogleReviews';
import { PatientSuccessStories } from './components/PatientSuccessStories';
import { WhatsAppContactModal } from './components/WhatsAppContactModal';
import { Footer } from './components/Footer';
import { 
  MessageCircle, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('vr-brain');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [whatsAppDefaultTemplate, setWhatsAppDefaultTemplate] = useState<string>('stroke-emergency');
  const [isEmergencyCallModalOpen, setIsEmergencyCallModalOpen] = useState<boolean>(false);

  const handleOpenWhatsApp = (template = 'stroke-emergency') => {
    setWhatsAppDefaultTemplate(template);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] text-[#27231E] flex flex-col font-sans antialiased selection:bg-[#8E5B3E] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWhatsApp={() => handleOpenWhatsApp('stroke-emergency')}
        onOpenEmergencyCall={() => setIsEmergencyCallModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero Banner (Always visible or contextual) */}
        <HeroBanner
          onNavigate={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          onOpenWhatsApp={() => handleOpenWhatsApp('book-appointment')}
        />

        {/* Dynamic Section Navigation / Sub-tabs */}
        <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'stories', label: 'Patient Success Stories' },
            { id: 'appointments', label: 'Book OPD Appointment' },
            { id: 'reviews', label: 'Google Reviews (4.9★)' },
            { id: 'vr-brain', label: '3D/VR Brain Anatomy' },
            { id: 'diseases', label: 'Diseases & Caregiver Hub' },
            { id: 'patient-portal', label: 'Patient Medical Portal' },
            { id: 'remote-monitoring', label: 'Remote Monitoring (RPM)' },
            { id: 'case-studies', label: 'Case Study Database' },
            { id: 'staff-payroll', label: 'Staff Payroll System' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#342E28] text-white shadow-xs'
                  : 'text-[#635E56] hover:text-[#27231E] hover:bg-[#EFE9DF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher Container */}
        <div className="transition-opacity duration-200">
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
          {activeTab === 'appointments' && <AppointmentScheduler />}
          {activeTab === 'patient-portal' && <PatientPortal />}
          {activeTab === 'remote-monitoring' && <RemoteMonitoring />}
          {activeTab === 'case-studies' && <CaseStudyDatabase />}
          {activeTab === 'staff-payroll' && <StaffPayroll />}
          {activeTab === 'reviews' && <GoogleReviews />}
        </div>
      </main>

      {/* Persistent Floating WhatsApp Help Desk Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          id="btn-floating-whatsapp"
          onClick={() => handleOpenWhatsApp('stroke-emergency')}
          className="group relative px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-700/40 flex items-center gap-2.5 transition-all transform hover:scale-105"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full" />
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="text-xs font-bold hidden sm:inline pr-1">
            WhatsApp: 9405545521
          </span>
        </button>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppContactModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        defaultTemplate={whatsAppDefaultTemplate}
      />

      {/* Emergency Stroke Call Modal */}
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

      {/* Footer */}
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
