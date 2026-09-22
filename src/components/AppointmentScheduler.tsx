import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Video, 
  CheckCircle, 
  MapPin, 
  Star, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  ShieldCheck, 
  AlertCircle,
  Phone,
  Mail,
  ChevronRight,
  X,
  Bell,
  Send,
  MessageCircle,
  Check,
  Sparkles
} from 'lucide-react';
import { Doctor, Appointment, DepartmentType, ReminderSettings } from '../types';
import { DOCTORS, INITIAL_APPOINTMENTS } from '../data/mockData';
import { AppointmentReminderModal } from './AppointmentReminderModal';
import { downloadIcsFile, formatAppointmentReminderMessage } from '../utils/calendarUtils';

interface AppointmentSchedulerProps {
  initialDoctorId?: string;
  initialDiseaseContext?: string;
  initialSymptoms?: string;
  autoOpenBooking?: boolean;
  onAppointmentBooked?: (newApt: Appointment) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  initialDoctorId,
  initialDiseaseContext,
  initialSymptoms,
  autoOpenBooking,
  onAppointmentBooked
}) => {
  const [doctorsList] = useState<Doctor[]>(DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType>('All');
  const [searchDoctor, setSearchDoctor] = useState<string>('');

  useEffect(() => {
    // Ensure default doctor photo by clearing any custom overrides
    if (localStorage.getItem('sopan_dr_custom_photo')) {
      localStorage.removeItem('sopan_dr_custom_photo');
    }
  }, []);
  
  // Booking Wizard Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(1); // 1: Slot & Type, 2: Patient Info, 3: Confirmed Slip

  // Form Fields
  const [visitType, setVisitType] = useState<'In-Person Hospital OPD' | 'Tele-Neurology Video Consultation'>('In-Person Hospital OPD');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-25');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number>(45);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>(
    initialSymptoms || (initialDiseaseContext ? `Consultation for ${initialDiseaseContext}` : '')
  );
  const [lastConfirmedAppointment, setLastConfirmedAppointment] = useState<Appointment | null>(null);

  // Remind Me Feature State
  const [optInWhatsappReminder, setOptInWhatsappReminder] = useState<boolean>(true);
  const [optInEmailReminder, setOptInEmailReminder] = useState<boolean>(true);
  const [reminderLeadTime, setReminderLeadTime] = useState<24 | 48 | 2 | 1>(24);
  const [selectedAppointmentForReminder, setSelectedAppointmentForReminder] = useState<Appointment | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialSymptoms) {
      setSymptoms(initialSymptoms);
      const doc = doctorsList.find(d => d.id === (initialDoctorId || 'doc-sanjay-varade')) || doctorsList[0];
      if (doc) {
        setSelectedDoctor(doc);
        setSelectedTimeSlot(doc.timeSlots[0] || '11:00 AM');
        setIsBookingModalOpen(true);
        setBookingStep(2);
      }
    }
  }, [initialSymptoms, initialDoctorId, doctorsList]);

  const departments: DepartmentType[] = [
    'All',
    'Comprehensive Stroke Center',
    'Epilepsy & EEG Monitoring',
    'Movement Disorders & Parkinson’s',
    'Neuro-Oncology & Brain Tumors',
    'Spine & Peripheral Nerve',
    'Pediatric Neurology'
  ];

  const filteredDoctors = doctorsList.filter(doc => {
    const matchesDept = selectedDepartment === 'All' || doc.department === selectedDepartment;
    const matchesSearch = doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
                          doc.qualifications.toLowerCase().includes(searchDoctor.toLowerCase()) ||
                          doc.bio.toLowerCase().includes(searchDoctor.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const startBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedTimeSlot(doctor.timeSlots[0] || '10:00 AM');
    setBookingStep(1);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    const deptPrefixMap: Record<string, string> = {
      'Comprehensive Stroke Center': 'STRK',
      'Epilepsy & EEG Monitoring': 'EPI',
      'Movement Disorders & Parkinson’s': 'MVD',
      'Neuro-Oncology & Brain Tumors': 'ONCO',
      'Spine & Peripheral Nerve': 'SPINE',
      'Pediatric Neurology': 'PED',
    };

    const prefix = deptPrefixMap[selectedDoctor.department] || 'NEURO';
    const token = `${prefix}-${Math.floor(10 + Math.random() * 90)}`;

    const scheduledTimeText = reminderLeadTime === 48 
      ? '48 Hours Prior' 
      : reminderLeadTime === 2 
        ? '2 Hours Prior' 
        : reminderLeadTime === 1 
          ? 'Morning of Visit (8:00 AM)' 
          : '24 Hours Prior';

    const reminderSettings: ReminderSettings = {
      whatsapp: optInWhatsappReminder,
      email: optInEmailReminder,
      leadTimeHours: reminderLeadTime,
      whatsappNumber: patientPhone || '+91 98000 00000',
      emailAddress: patientEmail || 'patient@example.com',
      status: (optInWhatsappReminder || optInEmailReminder) ? 'Active' : 'Scheduled',
      scheduledTimeText,
      confirmedAt: new Date().toISOString().split('T')[0]
    };

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientName: patientName || 'Patient',
      patientAge: Number(patientAge),
      patientGender,
      patientPhone: patientPhone || '+91 98000 00000',
      patientEmail: patientEmail || 'patient@example.com',
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.department,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      visitType,
      symptoms: symptoms || 'Routine neurological follow-up',
      status: 'Confirmed',
      tokenNumber: token,
      createdAt: new Date().toISOString().split('T')[0],
      reminderSettings
    };

    setAppointments(prev => [newAppointment, ...prev]);
    setLastConfirmedAppointment(newAppointment);
    if (onAppointmentBooked) {
      onAppointmentBooked(newAppointment);
    }
    setBookingStep(3); // Show confirmation receipt slip
  };

  const handleSaveReminderSettings = (appointmentId: string, updatedSettings: ReminderSettings) => {
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, reminderSettings: updatedSettings } : a));
    if (lastConfirmedAppointment && lastConfirmedAppointment.id === appointmentId) {
      setLastConfirmedAppointment(prev => prev ? { ...prev, reminderSettings: updatedSettings } : null);
    }
    const channels = [
      updatedSettings.whatsapp ? 'WhatsApp' : '',
      updatedSettings.email ? 'Email' : ''
    ].filter(Boolean).join(' & ') || 'None';
    setReminderToast(`Remind Me preferences updated (${channels})!`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  const handleOpenReminderModal = (apt: Appointment) => {
    setSelectedAppointmentForReminder(apt);
    setIsReminderModalOpen(true);
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] text-[#7A5338] text-xs font-semibold mb-2 border border-[#DFD6C8]">
            <Calendar className="w-3.5 h-3.5 text-[#8E5B3E]" />
            Outpatient & Tele-Neurology Scheduling
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#27231E] tracking-tight">
            Schedule Doctor Appointment & Tele-Consultation
          </h2>
          <p className="text-[#635E56] text-sm mt-1 max-w-2xl leading-relaxed">
            Book guaranteed OPD consultations with Chief Consultant Neurologist <strong className="text-[#27231E] font-semibold">Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong> at Sopan Hospital & Neurology Institute, Shrihari Kute Marg, Mumbai Naka, Nashik (Hotline: 0253 2317364) with consultation fee <strong className="text-[#8E5B3E]">₹1,500</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <div className="bg-white border border-[#E6E0D4] p-3.5 rounded-2xl text-xs w-full sm:w-auto flex items-center gap-3 shadow-xs">
            <ShieldCheck className="w-6 h-6 text-[#456254] shrink-0" />
            <div>
              <div className="font-bold text-[#27231E]">Zero Wait Time Guarantee</div>
              <div className="text-[#7A746B] text-[11px]">Direct priority digital token generation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Department filter bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto scrollbar-none">
            {departments.map(dept => (
              <button
                key={dept}
                id={`filter-dept-${dept.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedDepartment === dept
                    ? 'bg-[#342E28] text-white shadow-xs'
                    : 'bg-white text-[#635E56] hover:bg-[#F7F4EE] border border-[#E6E0D4]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#8C8478] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-doctor-input"
              value={searchDoctor}
              onChange={e => setSearchDoctor(e.target.value)}
              placeholder="Search doctor by name or specialty..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E6E0D4] rounded-xl text-xs text-[#27231E] placeholder-[#9C9488] focus:outline-none focus:ring-2 focus:ring-[#8E5B3E] focus:border-[#8E5B3E] shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <div
            key={doctor.id}
            id={`doctor-card-${doctor.id}`}
            className="bg-white border border-[#E6E0D4] rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={doctor.avatarUrl || '/DSC_0050.JPG'}
                  alt={doctor.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('doctor-photo.png')) {
                      target.src = '/doctor-photo.png';
                    }
                  }}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#DFD6C8] shrink-0 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{doctor.rating}</span>
                    <span className="text-[#968E82] font-normal">({doctor.reviewCount} reviews)</span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#27231E] leading-snug">{doctor.name}</h3>
                  <div className="text-xs text-[#7A5338] font-medium">{doctor.qualifications}</div>
                  <div className="text-[11px] text-[#867E73]">{doctor.designation}</div>
                </div>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE3D6] text-xs space-y-2 mb-4">
                <div className="flex items-center justify-between text-[#635E56]">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[#8E5B3E]" />
                    Specialty:
                  </span>
                  <span className="font-semibold text-[#27231E]">{doctor.department}</span>
                </div>
                <div className="flex items-center justify-between text-[#635E56]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#456254]" />
                    Experience:
                  </span>
                  <span className="font-semibold text-[#27231E]">{doctor.experienceYears}+ Years</span>
                </div>
                <div className="flex items-center justify-between text-[#635E56]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8E5B3E]" />
                    OPD Days:
                  </span>
                  <span className="font-semibold text-[#27231E] text-[11px]">
                    {doctor.availableDays.map(d => d.slice(0, 3)).join(', ')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#635E56] mb-4 line-clamp-2 leading-relaxed">
                {doctor.bio}
              </p>
            </div>

            <div className="pt-3 border-t border-[#EFE9DF] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#8C8478] uppercase font-semibold">Consultation Fee</div>
                <div className="text-lg font-serif font-bold text-[#27231E]">₹{doctor.opdFee}</div>
              </div>

              <button
                id={`btn-book-${doctor.id}`}
                onClick={() => startBooking(doctor)}
                className="px-4 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                Book Appointment
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booked Appointments Status List */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EAE3D6] pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#8E5B3E]" />
            <h3 className="font-serif font-bold text-base text-[#27231E]">Active Booked Appointments ({appointments.length})</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#7A746B]">Live Hospital OPD Token System</span>
          </div>
        </div>

        {reminderToast && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{reminderToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setReminderToast(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="divide-y divide-[#EAE3D6]">
          {appointments.map(apt => (
            <div key={apt.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EFE9DF] border border-[#DFD6C8] flex flex-col items-center justify-center text-[#7A5338] font-bold shrink-0">
                  <span className="text-[10px] uppercase font-mono text-[#8E5B3E]">TOKEN</span>
                  <span className="text-xs font-black text-[#27231E]">{apt.tokenNumber}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-sm text-[#27231E]">{apt.patientName}</h4>
                    <span className="text-xs text-[#7A746B]">({apt.patientAge}y, {apt.patientGender})</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      apt.status === 'Confirmed' ? 'bg-[#E3ECE6] text-[#3D5B4C]' : 'bg-[#FBEBEB] text-[#9E3939]'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#635E56] mt-0.5">
                    Consulting with <span className="font-semibold text-[#27231E]">{apt.doctorName}</span> ({apt.department})
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A746B] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8C8478]" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#8C8478]" />
                      {apt.timeSlot}
                    </span>
                    <span className="flex items-center gap-1 text-[#7A5338] font-medium">
                      {apt.visitType === 'Tele-Neurology Video Consultation' ? (
                        <>
                          <Video className="w-3 h-3 text-[#8E5B3E]" />
                          Tele-Neurology Video
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3 text-[#8E5B3E]" />
                          In-Person Hospital OPD
                        </>
                      )}
                    </span>
                  </div>

                  {/* Remind Me Status Badge */}
                  <div className="mt-2 flex items-center gap-2">
                    {apt.reminderSettings && (apt.reminderSettings.whatsapp || apt.reminderSettings.email) ? (
                      <button
                        type="button"
                        onClick={() => handleOpenReminderModal(apt)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                        title="Click to manage automated reminder settings"
                      >
                        <Bell className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>
                          Remind Me: {[apt.reminderSettings.whatsapp ? 'WhatsApp' : '', apt.reminderSettings.email ? 'Email' : ''].filter(Boolean).join(' & ')}
                        </span>
                        <span className="text-emerald-700 font-normal">({apt.reminderSettings.leadTimeHours}h before)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenReminderModal(apt)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
                        title="Opt-in for WhatsApp & Email reminders"
                      >
                        <Bell className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Remind Me: Not configured (Click to opt-in)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenReminderModal(apt)}
                  className="text-xs text-[#8E5B3E] hover:text-[#784A31] px-3.5 py-1.5 rounded-xl bg-[#FAF2EB] hover:bg-[#F3E5D8] border border-[#E4CEBC] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Configure automated WhatsApp & Email reminders"
                >
                  <Bell className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  Remind Me
                </button>
                {apt.status === 'Confirmed' && (
                  <button
                    onClick={() => cancelAppointment(apt.id)}
                    className="text-xs text-[#9E3939] hover:text-[#7D2828] px-3 py-1.5 rounded-xl border border-[#E9C8C8] hover:bg-[#FBEBEB] transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    setLastConfirmedAppointment(apt);
                    setBookingStep(3);
                    setIsBookingModalOpen(true);
                  }}
                  className="text-xs text-[#342E28] hover:text-black px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F7F4EE] border border-[#E6E0D4] font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  View Slip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Wizard Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {bookingStep === 3 ? 'Appointment Confirmation Slip' : 'Book Neurological Consultation'}
                </h3>
                {selectedDoctor && bookingStep !== 3 && (
                  <p className="text-xs text-slate-500">
                    With {selectedDoctor.name} • {selectedDoctor.department}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Step 1: Mode, Date & Time Slots */}
              {bookingStep === 1 && selectedDoctor && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Consultation Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setVisitType('In-Person Hospital OPD')}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                          visitType === 'In-Person Hospital OPD'
                            ? 'bg-cyan-50/70 border-cyan-600 ring-2 ring-cyan-600/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-cyan-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">In-Person OPD</div>
                          <div className="text-[11px] text-slate-500">Sopan Hospital, Shrihari Kute Marg, Mumbai Naka Nashik</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisitType('Tele-Neurology Video Consultation')}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                          visitType === 'Tele-Neurology Video Consultation'
                            ? 'bg-cyan-50/70 border-cyan-600 ring-2 ring-cyan-600/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Video className="w-4 h-4 text-cyan-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Tele-Neurology Video</div>
                          <div className="text-[11px] text-slate-500">HD Encrypted Doctor Video Link</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min="2026-09-20"
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedDoctor.timeSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            selectedTimeSlot === slot
                              ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      Next: Patient Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Patient Demographics Form */}
              {bookingStep === 2 && (
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        placeholder="e.g. Ramesh Kulkarni"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Age & Gender *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          required
                          min={1}
                          max={110}
                          value={patientAge}
                          onChange={e => setPatientAge(Number(e.target.value))}
                          className="w-20 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-cyan-500"
                        />
                        <select
                          value={patientGender}
                          onChange={e => setPatientGender(e.target.value as any)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Phone (WhatsApp Notifications) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={e => setPatientPhone(e.target.value)}
                        placeholder="+91 98234 56789"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={patientEmail}
                        onChange={e => setPatientEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Neurological Symptoms / Reason for Visit
                    </label>
                    <textarea
                      rows={3}
                      value={symptoms}
                      onChange={e => setSymptoms(e.target.value)}
                      placeholder="Describe tremors, seizures, headache frequency, post-stroke recovery status, etc."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Remind Me Notification Preferences */}
                  <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E6E0D4] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#8E5B3E]/10 text-[#8E5B3E] flex items-center justify-center">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#27231E]">Automated 'Remind Me' Alerts</h4>
                          <p className="text-[11px] text-[#6E675D]">Opt-in for timely appointment & token notifications</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-[#8E5B3E]/10 text-[#8E5B3E] px-2 py-0.5 rounded-full">
                        Free Automated Service
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[#EAE3D6] bg-white cursor-pointer select-none hover:bg-emerald-50/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={optInWhatsappReminder}
                          onChange={e => setOptInWhatsappReminder(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#27231E] flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            WhatsApp Reminder
                          </span>
                          <p className="text-[10px] text-[#7A7265] mt-0.5">
                            Sends OPD token pass & location alert to {patientPhone || 'mobile'}
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[#EAE3D6] bg-white cursor-pointer select-none hover:bg-amber-50/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={optInEmailReminder}
                          onChange={e => setOptInEmailReminder(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#27231E] flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-amber-600" />
                            Email Reminder (.ics)
                          </span>
                          <p className="text-[10px] text-[#7A7265] mt-0.5">
                            Calendar file & pre-consultation checklist to {patientEmail || 'email'}
                          </p>
                        </div>
                      </label>
                    </div>

                    {(optInWhatsappReminder || optInEmailReminder) && (
                      <div className="pt-2 border-t border-[#EAE3D6]">
                        <label className="block text-[11px] font-semibold text-[#6E675D] mb-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8E5B3E]" />
                          Notify me:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                          {[
                            { hours: 24 as const, label: '24h Prior' },
                            { hours: 48 as const, label: '48h Prior' },
                            { hours: 2 as const, label: '2h Prior' },
                            { hours: 1 as const, label: 'Morning of visit' }
                          ].map(opt => (
                            <button
                              key={opt.hours}
                              type="button"
                              onClick={() => setReminderLeadTime(opt.hours)}
                              className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                                reminderLeadTime === opt.hours
                                  ? 'bg-[#8E5B3E] text-white border-[#8E5B3E] font-bold'
                                  : 'bg-white text-[#6E675D] border-[#EAE3D6] hover:bg-[#FAF7F2]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-cyan-50/60 p-3 rounded-xl border border-cyan-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-cyan-900">Total Consultation Fee</div>
                      <div className="text-[11px] text-cyan-700">Payable at hospital desk or online post-video</div>
                    </div>
                    <span className="text-base font-bold text-cyan-950">₹{selectedDoctor?.opdFee}</span>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Back to Time Slots
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm & Generate Booking Pass
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Formal Hospital Appointment Slip */}
              {bookingStep === 3 && lastConfirmedAppointment && (
                <div className="space-y-5">
                  <div className="border-2 border-dashed border-cyan-600/40 rounded-2xl p-6 bg-gradient-to-b from-cyan-50/40 to-white relative">
                    {/* Hospital Watermark Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                      <div>
                        <div className="text-xs font-black tracking-wider text-cyan-800 uppercase">
                          SOPAN HOSPITAL & NEUROLOGY INSTITUTE
                        </div>
                        <div className="text-[10px] text-slate-600">
                          Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka Nashik - 422001
                        </div>
                        <div className="text-[10px] text-rose-600 font-semibold">
                          24/7 Stroke Hotline: 0253 2317364
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded-lg">
                          TOKEN: {lastConfirmedAppointment.tokenNumber}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Patient Name</span>
                        <span className="font-bold text-slate-900 text-sm">{lastConfirmedAppointment.patientName}</span>
                        <span className="text-slate-500 block text-[11px]">
                          {lastConfirmedAppointment.patientAge} Yrs • {lastConfirmedAppointment.patientGender}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Consulting Specialist</span>
                        <span className="font-bold text-slate-900 text-sm">{lastConfirmedAppointment.doctorName}</span>
                        <span className="text-cyan-700 block text-[11px] font-medium">{lastConfirmedAppointment.department}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Appointment Date</span>
                        <span className="font-semibold text-slate-800">{lastConfirmedAppointment.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Allocated Slot</span>
                        <span className="font-semibold text-slate-800">{lastConfirmedAppointment.timeSlot}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Consultation Type</span>
                        <span className="font-semibold text-slate-800">{lastConfirmedAppointment.visitType}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-100 mb-4">
                      <span className="font-semibold text-slate-800">Reason for visit:</span> {lastConfirmedAppointment.symptoms}
                    </div>

                    {/* Barcode representation */}
                    <div className="flex flex-col items-center justify-center pt-2">
                      <div className="font-mono text-xl tracking-[0.35em] text-slate-800 select-none">
                        ||| | |||| || | ||| |||| | ||
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-1">
                        REF: {lastConfirmedAppointment.id.toUpperCase()} • REPORT 15 MIN BEFORE SLOT
                      </span>
                    </div>
                  </div>

                  {/* Automated Remind Me Status Card & Instant Actions */}
                  <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#27231E]">Automated 'Remind Me' Service</h4>
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6E675D]">
                            Scheduled alert: {lastConfirmedAppointment.reminderSettings?.scheduledTimeText || '24 Hours Prior'} via {[
                              lastConfirmedAppointment.reminderSettings?.whatsapp ? 'WhatsApp' : '',
                              lastConfirmedAppointment.reminderSettings?.email ? 'Email' : ''
                            ].filter(Boolean).join(' & ') || 'WhatsApp'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenReminderModal(lastConfirmedAppointment)}
                        className="text-xs text-[#8E5B3E] hover:underline font-semibold"
                      >
                        Customize
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const msg = formatAppointmentReminderMessage(lastConfirmedAppointment);
                          const cleanNumber = (lastConfirmedAppointment.reminderSettings?.whatsappNumber || lastConfirmedAppointment.patientPhone).replace(/[^\d]/g, '');
                          const url = `https://wa.me/${cleanNumber.length === 10 ? '91' + cleanNumber : cleanNumber || '919422011223'}?text=${encodeURIComponent(msg)}`;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Send Token to WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadIcsFile(lastConfirmedAppointment)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D8CFC2] text-xs font-semibold text-[#27231E] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#8E5B3E]" />
                        Add to Calendar (.ics)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Booking Pass
                    </button>
                    <button
                      onClick={() => setIsBookingModalOpen(false)}
                      className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remind Me Configuration Modal */}
      <AppointmentReminderModal
        appointment={selectedAppointmentForReminder}
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setSelectedAppointmentForReminder(null);
        }}
        onSaveReminder={handleSaveReminderSettings}
      />
    </div>
  );
};
