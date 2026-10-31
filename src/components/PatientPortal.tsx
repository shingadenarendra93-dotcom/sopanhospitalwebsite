import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Pill, 
  Activity, 
  HeartHandshake, 
  Download, 
  Printer, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Shield, 
  Eye, 
  Phone, 
  Layers, 
  X, 
  Bell, 
  ClipboardCheck, 
  Check, 
  MapPin, 
  CalendarCheck, 
  ArrowRight, 
  ExternalLink, 
  Smartphone, 
  Sparkles,
  Lock,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  EyeOff,
  Video,
  Mail,
  MessageCircle,
  Users,
  TrendingDown,
  Stethoscope,
  Edit3
} from 'lucide-react';
import { 
  PatientProfile, 
  DiagnosticReport, 
  Prescription, 
  PatientVitalsLog,
  Appointment,
  ReminderSettings
} from '../types';
import { 
  INITIAL_PATIENT, 
  INITIAL_REPORTS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_VITALS_LOGS,
  INITIAL_APPOINTMENTS
} from '../data/mockData';
import { loadOpdAppointments, saveOpdAppointments, formatFriendlyDate, getNextDateString } from '../utils/opdSlotUtils';
import { AppointmentReminderModal } from './AppointmentReminderModal';
import { AppointmentSlipModal } from './AppointmentSlipModal';
import { generateTokenSlipPdf } from '../utils/pdfGenerator';
import { 
  subscribeToPatientAppointments, 
  normalizeIndianPhoneNumber, 
  getStoredVerifiedPatientPhone, 
  setStoredVerifiedPatientPhone, 
  getStoredPatientSessionToken,
  setStoredPatientSessionToken,
  logoutPatient 
} from '../lib/firebase';

interface PatientPortalProps {
  onBookNewAppointment?: () => void;
  initialShowBookingForm?: boolean;
  prefillSymptoms?: string;
  prefillCondition?: string;
}

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const PatientPortal: React.FC<PatientPortalProps> = ({ 
  onBookNewAppointment,
  initialShowBookingForm = false,
  prefillSymptoms,
  prefillCondition
}) => {
  const todayStr = getTodayDateString();
  // Patient Profile Name (Explicitly created and stored per verified mobile number, independent of OPD booking name)
  const [profileName, setProfileName] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const storedPhone = getStoredVerifiedPatientPhone();
    if (!storedPhone) return '';
    const clean = storedPhone.replace(/\D/g, '').slice(-10);
    return localStorage.getItem(`sopan_patient_profile_${clean}`) || '';
  });
  const [profileNameInput, setProfileNameInput] = useState<string>('');
  const [showEditProfileNameModal, setShowEditProfileNameModal] = useState<boolean>(false);

  // Verified Patient Session State
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(() => getStoredVerifiedPatientPhone());

  // Predefined security questions
  const SECURITY_QUESTIONS = [
    "What was your childhood nickname?",
    "What is the name of your first school?",
    "In what city or town was your mother born?",
    "What was the name of your first pet?",
    "What is your favorite childhood food or dish?",
    "What was the make or model of your family's first car?"
  ];

  // Patient PIN Login & Security Question States
  const [authView, setAuthView] = useState<'login' | 'register_phone' | 'register_form' | 'create_profile_name' | 'forgot_phone' | 'forgot_answer' | 'forgot_new_pin'>('login');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [securityQuestion, setSecurityQuestion] = useState<string>(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState<string>('');
  const [retrievedQuestion, setRetrievedQuestion] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');

  // Authenticated Patient OPD Booking Form States
  const [showBookingModal, setShowBookingModal] = useState<boolean>(initialShowBookingForm || false);
  const [bookVisitType, setBookVisitType] = useState<'In-Person Hospital OPD' | 'Tele-Neurology Video Consultation'>('In-Person Hospital OPD');
  const [bookDate, setBookDate] = useState<string>(todayStr);
  const [bookTimeSlot, setBookTimeSlot] = useState<string>('11:00 AM');
  const [bookPatientName, setBookPatientName] = useState<string>('');
  const [bookPatientAge, setBookPatientAge] = useState<string>('');
  const [bookPatientGender, setBookPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bookPatientEmail, setBookPatientEmail] = useState<string>('');
  const [bookSymptoms, setBookSymptoms] = useState<string>(prefillSymptoms || '');
  const [bookOptInWhatsapp, setBookOptInWhatsapp] = useState<boolean>(true);
  const [bookOptInEmail, setBookOptInEmail] = useState<boolean>(true);
  const [bookLeadTime, setBookLeadTime] = useState<number>(24);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [opdDateQuota, setOpdDateQuota] = useState<{ total: number; booked: number; remaining: number; isFull: boolean } | null>(null);

  const [showPin, setShowPin] = useState<boolean>(false);
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutRemainingMinutes, setLockoutRemainingMinutes] = useState<number | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [portalToast, setPortalToast] = useState<string | null>(null);

  // Appointments state loaded and synchronized in real-time from Firestore for the verified patient
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [activeTab, setActiveTab] = useState<'appointments' | 'overview' | 'reports' | 'prescriptions' | 'telemetry'>('appointments');
  const [caregiverView, setCaregiverView] = useState<boolean>(false);
  const [selectedReportModal, setSelectedReportModal] = useState<DiagnosticReport | null>(null);
  const [selectedAppointmentModal, setSelectedAppointmentModal] = useState<Appointment | null>(null);
  const [selectedSlipAppointment, setSelectedSlipAppointment] = useState<Appointment | null>(null);
  const [showReminderSettingsModal, setShowReminderSettingsModal] = useState<boolean>(false);

  // Sync appointments in REAL-TIME with Firestore for the authenticated patient's mobile number
  useEffect(() => {
    if (!verifiedPhone) {
      setAppointments([]);
      return;
    }

    // Authenticated API fetch using server-signed Bearer session token
    const token = getStoredPatientSessionToken();
    if (token) {
      fetch('/api/patient-auth/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.appointments)) {
            setAppointments(data.appointments);
          } else if (data.status === 401) {
            handleLogout();
          }
        })
        .catch(err => console.warn('Authenticated fetch error:', err));
    }

    // Real-Time onSnapshot listener for the authenticated patient
    const unsubscribe = subscribeToPatientAppointments(verifiedPhone, (liveList) => {
      setAppointments(liveList);
    });

    const handleLocalSync = () => {
      const stored = getStoredVerifiedPatientPhone();
      if (stored !== verifiedPhone) {
        setVerifiedPhone(stored);
      }
    };
    window.addEventListener('sopan_patient_auth_changed', handleLocalSync);
    window.addEventListener('storage', handleLocalSync);

    return () => {
      unsubscribe();
      window.removeEventListener('sopan_patient_auth_changed', handleLocalSync);
      window.removeEventListener('storage', handleLocalSync);
    };
  }, [verifiedPhone]);

  // Listen for open booking triggers from navigation & auto pre-fill
  useEffect(() => {
    const handleOpenBooking = (e?: any) => {
      if (e?.detail?.date) {
        setBookDate(e.detail.date);
      }
      setShowBookingModal(true);
    };
    window.addEventListener('sopan_open_booking', handleOpenBooking as EventListener);
    return () => window.removeEventListener('sopan_open_booking', handleOpenBooking as EventListener);
  }, []);

  useEffect(() => {
    if (initialShowBookingForm) {
      setShowBookingModal(true);
    }
  }, [initialShowBookingForm]);


  // Fetch live OPD quota for selected booking date
  useEffect(() => {
    if (!bookDate) return;
    fetch(`/api/opd/status?date=${bookDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.adminTotalQuota !== undefined) {
          setOpdDateQuota({
            total: data.adminTotalQuota,
            booked: data.bookedCount,
            remaining: data.remainingCount,
            isFull: data.isFull
          });
        }
      })
      .catch(() => {});
  }, [bookDate]);

  // Trigger feedback toast
  const triggerToast = (msg: string) => {
    setPortalToast(msg);
    setTimeout(() => setPortalToast(null), 3500);
  };

  // 1. Patient Login (Mobile Number + 6-digit PIN)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    const phoneInfo = normalizeIndianPhoneNumber(phoneInput);
    if (!phoneInfo.isValid) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (+91).');
      return;
    }

    if (!pinInput || pinInput.length !== 6 || !/^\d{6}$/.test(pinInput)) {
      setErrorMessage('Please enter your complete 6-digit numeric PIN.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patient-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInfo.national, pin: pinInput.trim() })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setStoredPatientSessionToken(data.token);
        const resolvedPhone = data.e164 || phoneInfo.e164;
        setStoredVerifiedPatientPhone(resolvedPhone);
        const clean = resolvedPhone.replace(/\D/g, '').slice(-10);
        const localSavedName = localStorage.getItem(`sopan_patient_profile_${clean}`);
        const effectiveName = (data.patientName && data.patientName !== 'Patient') ? data.patientName : (localSavedName || '');

        setVerifiedPhone(resolvedPhone);
        setPinInput('');
        setErrorMessage(null);

        if (effectiveName) {
          setProfileName(effectiveName);
          localStorage.setItem(`sopan_patient_profile_${clean}`, effectiveName);
          setAuthView('login');
          triggerToast(`Welcome back, ${effectiveName}!`);
        } else {
          setProfileNameInput('');
          setAuthView('create_profile_name');
        }
      } else {
        if (data.isLocked) {
          setLockoutRemainingMinutes(data.remainingMinutes || 15);
          setErrorMessage(data.error || 'Account locked for 15 minutes due to 5 failed attempts.');
        } else {
          setRemainingAttempts(data.remainingAttempts ?? null);
          setErrorMessage(data.error || 'Incorrect PIN. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setErrorMessage('Failed to sign in. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Patient Registration Step 1: Check mobile number and proceed directly to PIN setup
  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    const phoneInfo = normalizeIndianPhoneNumber(phoneInput);
    if (!phoneInfo.isValid) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (+91).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patient-auth/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInfo.national })
      });
      const data = await res.json();

      if (data.isLocked) {
        setLockoutRemainingMinutes(data.remainingMinutes || 15);
        setErrorMessage(`Account temporarily locked. Please wait ${data.remainingMinutes || 15} minute(s).`);
        return;
      }

      if (data.isPinSet) {
        setErrorMessage('An account with this mobile number already exists. Please log in using your PIN, or select Forgot PIN if you need to reset it.');
        return;
      }

      // Proceed directly to Set PIN & Security Question form
      setPinInput('');
      setConfirmPinInput('');
      setSecurityAnswer('');
      setAuthView('register_form');
    } catch (err: any) {
      console.error('Check status error:', err);
      setErrorMessage('Failed to verify mobile number. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OPD Consultation Booking for Authenticated Patient
  const handleConfirmOpdBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingBooking) return;
    setBookingError(null);

    if (!bookPatientName.trim()) {
      setBookingError('Please enter the patient full name.');
      return;
    }
    if (!bookPatientAge || isNaN(Number(bookPatientAge)) || Number(bookPatientAge) <= 0) {
      setBookingError('Please enter a valid patient age.');
      return;
    }
    if (!verifiedPhone) {
      setBookingError('Session expired. Please log in again.');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const res = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: bookPatientName.trim(),
          age: Number(bookPatientAge),
          gender: bookPatientGender,
          patientPhone: verifiedPhone,
          phone: verifiedPhone,
          contactNumber: verifiedPhone,
          email: bookPatientEmail.trim() || undefined,
          date: bookDate,
          timeSlot: bookTimeSlot,
          chiefComplaint: bookSymptoms.trim() || prefillCondition || 'General OPD Consultation',
          conditionContext: prefillCondition || undefined,
          department: 'Comprehensive Stroke Center',
          doctor: 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
          visitType: bookVisitType,
          status: 'Pending',
          reminderSettings: {
            whatsapp: bookOptInWhatsapp,
            email: bookOptInEmail,
            leadTimeHours: bookLeadTime
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowBookingModal(false);
        setBookingError(null);
        window.dispatchEvent(new CustomEvent('sopan_opd_quota_changed'));
        triggerToast('OPD Appointment submitted successfully! Status: PENDING awaiting Admin approval.');
        setAppointmentFilter('all');
        if (data.appointmentId) {
          const newApt: Appointment = {
            id: data.appointmentId,
            tokenNumber: data.tokenNumber,
            slotNumber: data.slotNumber,
            date: data.assignedDate || bookDate,
            timeSlot: bookTimeSlot,
            patientName: bookPatientName.trim(),
            patientAge: Number(bookPatientAge),
            patientGender: bookPatientGender,
            patientPhone: verifiedPhone,
            patientEmail: bookPatientEmail.trim() || '',
            doctorId: 'doc-sanjay-varade',
            doctorName: 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
            department: 'Comprehensive Stroke Center',
            visitType: bookVisitType,
            status: 'Pending',
            symptoms: bookSymptoms.trim() || '',
            createdAt: new Date().toISOString()
          };
          setAppointments(prev => [newApt, ...prev.filter(a => a.id !== newApt.id)]);
        }
      } else {
        setBookingError(data.error || 'Failed to book appointment. Please try again.');
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      setBookingError('Network error while booking appointment. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // 3. Patient Registration Step 2: Set PIN, Confirm PIN, Security Question & Answer
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    if (!pinInput || pinInput.length !== 6 || !/^\d{6}$/.test(pinInput)) {
      setErrorMessage('PIN must be exactly 6 numeric digits (0-9).');
      return;
    }

    if (pinInput !== confirmPinInput) {
      setErrorMessage('PINs do not match. Please ensure both 6-digit fields are identical.');
      return;
    }

    if (!securityQuestion) {
      setErrorMessage('Please select a security question.');
      return;
    }

    if (!securityAnswer || securityAnswer.trim().length < 2) {
      setErrorMessage('Please enter an answer to your security question (at least 2 characters).');
      return;
    }

    const phoneInfo = normalizeIndianPhoneNumber(phoneInput);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patient-auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInfo.national,
          pin: pinInput.trim(),
          confirmPin: confirmPinInput.trim(),
          securityQuestion: securityQuestion.trim(),
          securityAnswer: securityAnswer.trim()
        })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setStoredPatientSessionToken(data.token);
        const resolvedPhone = data.e164 || phoneInfo.e164;
        setStoredVerifiedPatientPhone(resolvedPhone);
        setVerifiedPhone(resolvedPhone);
        setPinInput('');
        setConfirmPinInput('');
        setSecurityAnswer('');
        setProfileNameInput('');
        setErrorMessage(null);
        // Advance to STEP 4 & 5: Create Profile Name screen
        setAuthView('create_profile_name');
      } else {
        setErrorMessage(data.error || 'Failed to complete registration.');
      }
    } catch (err: any) {
      console.error('Registration Error:', err);
      setErrorMessage('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save or Update Patient Profile Name (Strictly separated from individual OPD booking name)
  const handleSaveProfileName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!profileNameInput || profileNameInput.trim().length < 2) {
      setErrorMessage('Please enter your full legal name (minimum 2 characters).');
      return;
    }

    const currentPhone = verifiedPhone || phoneInput;
    const phoneInfo = normalizeIndianPhoneNumber(currentPhone);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/patient-auth/update-profile-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInfo.national,
          patientName: profileNameInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        const clean = phoneInfo.national;
        const savedName = data.patientName || profileNameInput.trim();
        setProfileName(savedName);
        localStorage.setItem(`sopan_patient_profile_${clean}`, savedName);
        if (data.token) {
          setStoredPatientSessionToken(data.token);
        }
        setShowEditProfileNameModal(false);
        setAuthView('login');
        triggerToast(`Welcome to Sopan Hospital, ${savedName}!`);
      } else {
        setErrorMessage(data.error || 'Failed to save profile name. Please try again.');
      }
    } catch (err: any) {
      console.error('Update profile name error:', err);
      setErrorMessage('Network error while saving profile name. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Forgot PIN: Step 1 - Fetch Security Question for phone
  const handleForgotPinGetQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    const phoneInfo = normalizeIndianPhoneNumber(phoneInput);
    if (!phoneInfo.isValid) {
      setErrorMessage('Please enter your valid 10-digit registered mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patient-auth/forgot-pin/get-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInfo.national })
      });
      const data = await res.json();

      if (data.isLocked) {
        setLockoutRemainingMinutes(data.remainingMinutes || 15);
        setErrorMessage(data.error || 'Account temporarily locked.');
        return;
      }

      if (data.success && data.securityQuestion) {
        setRetrievedQuestion(data.securityQuestion);
        setSecurityAnswer('');
        setErrorMessage(null);
        setAuthView('forgot_answer');
      } else {
        setErrorMessage(data.error || 'No registered account found with a security question for this mobile number.');
      }
    } catch (err: any) {
      console.error('Forgot PIN get question error:', err);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Forgot PIN: Step 2 - Verify Security Answer
  const handleForgotPinVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    if (!securityAnswer || !securityAnswer.trim()) {
      setErrorMessage('Please enter your answer to the security question.');
      return;
    }

    const phoneInfo = normalizeIndianPhoneNumber(phoneInput);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patient-auth/forgot-pin/verify-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInfo.national,
          securityAnswer: securityAnswer.trim()
        })
      });
      const data = await res.json();

      if (data.success && data.resetToken) {
        setResetToken(data.resetToken);
        setPinInput('');
        setConfirmPinInput('');
        setErrorMessage(null);
        setRemainingAttempts(null);
        setAuthView('forgot_new_pin');
      } else {
        if (data.isLocked) {
          setLockoutRemainingMinutes(15);
          setErrorMessage(data.error || 'Account locked for 15 minutes due to 5 incorrect attempts.');
        } else {
          setRemainingAttempts(data.remainingAttempts ?? null);
          setErrorMessage(data.error || 'Incorrect answer. Please check your spelling and try again.');
        }
      }
    } catch (err: any) {
      console.error('Verify answer error:', err);
      setErrorMessage('Failed to verify answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Forgot PIN: Step 3 - Set & Confirm New 6-Digit PIN
  const handleForgotPinReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    if (!pinInput || pinInput.length !== 6 || !/^\d{6}$/.test(pinInput)) {
      setErrorMessage('New PIN must be exactly 6 numeric digits (0-9).');
      return;
    }

    if (pinInput !== confirmPinInput) {
      setErrorMessage('PINs do not match. Please ensure both 6-digit fields are identical.');
      return;
    }

    const phoneInfo = normalizeIndianPhoneNumber(phoneInput);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patient-auth/forgot-pin/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInfo.national,
          resetToken,
          newPin: pinInput.trim(),
          confirmPin: confirmPinInput.trim()
        })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setStoredPatientSessionToken(data.token);
        setStoredVerifiedPatientPhone(data.e164 || phoneInfo.e164);
        setVerifiedPhone(data.e164 || phoneInfo.e164);
        setPinInput('');
        setConfirmPinInput('');
        setResetToken('');
        setSecurityAnswer('');
        triggerToast('Your 6-digit PIN has been reset successfully! Welcome to your Patient Portal.');
      } else {
        setErrorMessage(data.error || 'Failed to reset PIN.');
      }
    } catch (err: any) {
      console.error('Reset PIN error:', err);
      setErrorMessage('Failed to reset PIN. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutPatient();
    setVerifiedPhone(null);
    setProfileName('');
    setProfileNameInput('');
    setShowEditProfileNameModal(false);
    setAuthView('login');
    setPhoneInput('');
    setPinInput('');
    setConfirmPinInput('');
    setSecurityAnswer('');
    setResetToken('');
    setErrorMessage(null);
    setLockoutRemainingMinutes(null);
    setRemainingAttempts(null);
    triggerToast('Logged out of Patient Portal.');
  };

  // Derived metrics
  const upcomingAppointments = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending');
  const pendingAppointments = appointments.filter(a => a.status === 'Pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Completed');
  const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled');
  const nextAppointment = upcomingAppointments[0];

  // Filtered appointments list
  const filteredAppointments = appointments.filter(apt => {
    if (appointmentFilter === 'pending') return apt.status === 'Pending';
    if (appointmentFilter === 'confirmed') return apt.status === 'Confirmed' || apt.status === 'Completed';
    if (appointmentFilter === 'cancelled') return apt.status === 'Cancelled';
    return true;
  });

  // Save updated reminder settings
  const handleSaveReminderSettings = (aptId: string, updatedSettings: ReminderSettings) => {
    const updated = appointments.map(a => a.id === aptId ? { ...a, reminderSettings: updatedSettings } : a);
    setAppointments(updated);
    saveOpdAppointments(updated);
  };

  // -------------------------------------------------------------
  // PATIENT OTP LOGIN PORTAL SCREEN (Rendered if not authenticated or profile name required)
  // -------------------------------------------------------------
  if (!verifiedPhone || authView === 'create_profile_name') {
    const normalizedPhoneObj = normalizeIndianPhoneNumber(phoneInput || verifiedPhone || '');

    return (
      <div className="max-w-xl mx-auto my-6 sm:my-10 space-y-6 animate-in fade-in duration-200">
        {portalToast && (
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-xl border border-cyan-500/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{portalToast}</span>
            </div>
            <button onClick={() => setPortalToast(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="bg-white border border-[#E6E0D4] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] text-[#7A5338] text-xs font-semibold border border-[#DFD6C8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8E5B3E]" />
              SOPAN HOSPITAL PATIENT PORTAL
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              {authView === 'login' && 'Patient Portal Login'}
              {authView === 'register_phone' && 'Patient Registration'}
              {authView === 'register_form' && 'Create Your 6-Digit PIN'}
              {authView === 'create_profile_name' && 'Set Patient Profile Name'}
              {authView === 'forgot_phone' && 'Forgot 6-Digit PIN'}
              {authView === 'forgot_answer' && 'Security Verification'}
              {authView === 'forgot_new_pin' && 'Set New 6-Digit PIN'}
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {authView === 'login' && 'Enter your registered mobile number and 6-digit PIN to access your appointments and token slips.'}
              {authView === 'register_phone' && 'Enter your mobile number used during OPD booking to set up your personal 6-digit PIN.'}
              {authView === 'register_form' && 'Set your 6-digit PIN and select a security question to protect and easily recover your account.'}
              {authView === 'create_profile_name' && 'Please enter your full legal name to complete your patient profile setup.'}
              {authView === 'forgot_phone' && 'Enter your registered mobile number to retrieve your security question.'}
              {authView === 'forgot_answer' && 'Answer your security question correctly to reset your 6-digit PIN.'}
              {authView === 'forgot_new_pin' && 'Create and confirm your new 6-digit PIN to restore access to your Patient Portal.'}
            </p>
          </div>

          {/* VIEW 1: PATIENT LOGIN (Mobile Number + 6-Digit PIN) */}
          {authView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Mobile Number (+91) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneInput.replace(/^\+91\s*/, '')}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="98234 56789"
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    6-Digit PIN *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('forgot_phone');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-[#8E5B3E] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot PIN?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.35em] sm:tracking-[0.5em] font-mono text-xl sm:text-2xl py-2.5 sm:py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20 text-slate-900 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {remainingAttempts !== null && remainingAttempts < 5 && (
                  <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                    {remainingAttempts} attempt(s) remaining before temporary lockout
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !phoneInput.trim() || pinInput.length !== 6}
                className="w-full py-3 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Log In to Patient Portal</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('register_phone');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-600 hover:text-[#8E5B3E] font-medium transition-colors cursor-pointer"
                >
                  First-time patient? <strong className="text-[#8E5B3E] underline">Register & Set PIN</strong>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: REGISTRATION STEP 1 - Enter Mobile Number */}
          {authView === 'register_phone' && (
            <form onSubmit={handleStartRegistration} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (+91) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneInput.replace(/^\+91\s*/, '')}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="98234 56789"
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                    autoFocus
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Enter your 10-digit mobile number to set up your personal 6-digit PIN.
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !phoneInput.trim()}
                className="w-full py-3 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking Status...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-600 hover:text-[#8E5B3E] font-medium transition-colors cursor-pointer"
                >
                  Already registered? <strong className="text-[#8E5B3E] underline">Log In with PIN</strong>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: REGISTRATION STEP 2 - Set PIN, Confirm PIN, Select Security Question & Answer */}
          {authView === 'register_form' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Setting up PIN for <strong>{normalizedPhoneObj.e164}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('register_phone');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-[#8E5B3E] hover:underline font-semibold cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Set PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Set PIN (6 Digits) *
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Enter 6-digit PIN"
                    className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm PIN *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPinInput}
                    onChange={e => setConfirmPinInput(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Re-enter 6-digit PIN"
                    className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Select Security Question */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Security Question *
                </label>
                <div className="relative">
                  <select
                    value={securityQuestion}
                    onChange={e => setSecurityQuestion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                  >
                    {SECURITY_QUESTIONS.map((q, idx) => (
                      <option key={idx} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enter Your Answer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter Your Answer *
                </label>
                <input
                  type="text"
                  required
                  value={securityAnswer}
                  onChange={e => setSecurityAnswer(e.target.value)}
                  placeholder="e.g. Sunny or St. Xavier's"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                />
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Used securely to recover your PIN if forgotten. Answers are case-insensitive and hashed.
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || pinInput.length !== 6 || confirmPinInput.length !== 6 || !securityAnswer.trim()}
                className="w-full py-3 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Registration & Set PIN</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel and return to Login
                </button>
              </div>
            </form>
          )}

          {/* VIEW: SET PATIENT PROFILE NAME (Step 4 & 5 of Registration / Missing Name Login) */}
          {authView === 'create_profile_name' && (
            <form onSubmit={handleSaveProfileName} className="space-y-4">
              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-3.5 text-xs text-cyan-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-950 block text-sm">PIN Setup Successful!</span>
                  <span className="text-cyan-800">
                    Mobile: <strong className="font-mono">{normalizedPhoneObj.e164 || verifiedPhone}</strong>. Please enter the Patient Profile Name to complete your account.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Profile Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={profileNameInput}
                    onChange={e => setProfileNameInput(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                    autoFocus
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  This sets your patient profile identity on your dashboard. When booking OPD appointments, you can still book for yourself or any family member.
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !profileNameInput.trim()}
                className="w-full py-3 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Profile &amp; Open Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 4: FORGOT PIN STEP 1 - Enter Registered Mobile Number */}
          {authView === 'forgot_phone' && (
            <form onSubmit={handleForgotPinGetQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Mobile Number (+91) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneInput.replace(/^\+91\s*/, '')}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="98234 56789"
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                    autoFocus
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Enter your mobile number to retrieve your selected security question.
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !phoneInput.trim()}
                className="w-full py-3 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Finding Account...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Security Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-600 hover:text-[#8E5B3E] font-medium cursor-pointer"
                >
                  Remembered your PIN? <strong className="text-[#8E5B3E] underline">Back to Login</strong>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 5: FORGOT PIN STEP 2 - Answer Security Question */}
          {authView === 'forgot_answer' && (
            <form onSubmit={handleForgotPinVerifyAnswer} className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Account: <strong>{normalizedPhoneObj.e164}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('forgot_phone');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-[#8E5B3E] hover:underline font-semibold cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Displayed Question */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Your Security Question:
                </span>
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {retrievedQuestion}
                </p>
              </div>

              {/* Answer input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter Your Answer *
                </label>
                <input
                  type="text"
                  required
                  value={securityAnswer}
                  onChange={e => setSecurityAnswer(e.target.value)}
                  placeholder="Enter your security answer"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                  autoFocus
                />
                {remainingAttempts !== null && remainingAttempts < 5 && (
                  <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                    {remainingAttempts} attempt(s) remaining before temporary lockout
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !securityAnswer.trim()}
                className="w-full py-3 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Answer...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify Answer & Reset PIN</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel and return to Login
                </button>
              </div>
            </form>
          )}

          {/* VIEW 6: FORGOT PIN STEP 3 - Create and Confirm New 6-Digit PIN */}
          {authView === 'forgot_new_pin' && (
            <form onSubmit={handleForgotPinReset} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 block">Security Verification Passed</span>
                    <span className="text-emerald-700">{normalizedPhoneObj.e164}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Create New 6-Digit PIN *
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Enter new 6-digit PIN"
                    className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New 6-Digit PIN *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPinInput}
                    onChange={e => setConfirmPinInput(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Re-enter new 6-digit PIN"
                    className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || pinInput.length !== 6 || confirmPinInput.length !== 6}
                className="w-full py-3 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting PIN & Logging In...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Save New PIN & Log In</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED PATIENT PORTAL SCREEN
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {portalToast && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-xl border border-cyan-500/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{portalToast}</span>
          </div>
          <button onClick={() => setPortalToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Patient Identification Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-2xl shrink-0 shadow-lg shadow-cyan-950">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {profileName || 'Patient'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileNameInput(profileName || '');
                      setShowEditProfileNameModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Edit Patient Profile Name"
                  >
                    <Edit3 className="w-3 h-3 text-cyan-400" />
                    <span>Edit Name</span>
                  </button>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/40 flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {verifiedPhone} (Verified Patient)
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-cyan-500/30">
                  {appointments.length} Total Bookings
                </span>
              </div>

              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-y-1 gap-x-4">
                <span>Total Registered Appointments: <strong className="text-white">{appointments.length}</strong></span>
                <span>Active / Pending: <strong className="text-amber-300">{pendingAppointments.length}</strong></span>
                <span>Confirmed Token Passes: <strong className="text-emerald-300">{confirmedAppointments.length}</strong></span>
              </div>

              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Real-Time Firestore Synchronization: <strong className="text-emerald-400">Live Active</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons: Book New Appointment & Log Out */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shadow-md shadow-amber-950 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>Book OPD Appointment</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Log out of Patient Portal"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* My OPD Appointments Section */}
      <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-600" />
                <span>My Booked Consultations & Token Passes</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Appointments registered with <span className="font-semibold text-slate-700">{verifiedPhone}</span>. Synchronized live with hospital database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setAppointmentFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  appointmentFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('pending')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  appointmentFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Pending Review ({pendingAppointments.length})
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('confirmed')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  appointmentFilter === 'confirmed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Confirmed Slips ({confirmedAppointments.length})
              </button>
              {cancelledAppointments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAppointmentFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    appointmentFilter === 'cancelled'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Cancelled ({cancelledAppointments.length})
                </button>
              )}
            </div>
          </div>

          {/* Appointments Grid */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {appointmentFilter === 'all'
                    ? 'No appointments found for this mobile number'
                    : `No ${appointmentFilter} appointments found`}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Bookings made on this website with <strong className="text-slate-700">{verifiedPhone}</strong> appear here instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-200" />
                <span>Book New OPD Appointment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredAppointments.map(apt => {
                const isPending = apt.status === 'Pending';
                const isConfirmed = apt.status === 'Confirmed' || apt.status === 'Completed';
                const isCancelled = apt.status === 'Cancelled';

                return (
                  <div
                    key={apt.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${
                      isPending
                        ? 'border-amber-300 ring-1 ring-amber-200/60'
                        : isConfirmed
                          ? 'border-emerald-300 ring-1 ring-emerald-200/60'
                          : 'border-rose-200'
                    }`}
                  >
                    <div>
                      {/* Status Header Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              Status: PENDING
                            </span>
                          )}
                          {isConfirmed && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Status: CONFIRMED
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Status: CANCELLED
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                          {apt.tokenNumber ? `Token: ${apt.tokenNumber}` : `Ref: ${apt.id.slice(-6)}`}
                        </span>
                      </div>

                      {/* Required Message for PENDING STATUS */}
                      {isPending && (
                        <div className="mb-3.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
                          <p className="font-bold text-amber-950 leading-snug">
                            "Your appointment has been received and is awaiting confirmation from the hospital."
                          </p>
                          <span className="text-[10px] text-amber-800 mt-1 block">
                            Our clinical desk is reviewing your slot. When confirmed, your official downloadable Token Slip will appear here immediately.
                          </span>
                        </div>
                      )}

                      {/* Patient & Doctor Demographics */}
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900">{apt.patientName}</h4>
                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          <span>Age: <strong>{apt.patientAge} Yrs</strong> ({apt.patientGender})</span>
                          <span>Phone: <strong>{apt.patientPhone}</strong></span>
                        </div>
                      </div>

                      <div className="mt-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Consultant Specialist:</span>
                          <span className="font-bold text-slate-900">{apt.doctorName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Specialty:</span>
                          <span className="text-cyan-700 font-medium">{apt.department}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-500 text-[11px]">Scheduled Date & Slot:</span>
                          <span className="font-bold text-slate-900">
                            {formatFriendlyDate(apt.date)} at {apt.timeSlot}
                          </span>
                        </div>
                        {isConfirmed && apt.tokenNumber && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                            <span className="text-slate-500 text-[11px]">Official Token Number:</span>
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                              {apt.tokenNumber}
                            </span>
                          </div>
                        )}
                        {isCancelled && apt.rejectionReason && (
                          <div className="pt-1 border-t border-rose-200 text-rose-800 text-[11px]">
                            <span className="font-semibold">Reason:</span> {apt.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons based on exact status requirement */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                      {isPending && (
                        <>
                          <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            Awaiting Hospital Approval
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedSlipAppointment(apt)}
                            className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>View Booking Details</span>
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => setSelectedSlipAppointment(apt)}
                            className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>View Ticket</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => generateTokenSlipPdf(apt)}
                            className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                            title="Download Confirmed Token Ticket PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-100" />
                            <span>Download Ticket PDF</span>
                          </button>
                        </div>
                      )}

                      {isCancelled && (
                        <button
                          type="button"
                          onClick={() => setShowBookingModal(true)}
                          className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-200" />
                          <span>Re-Book OPD Slot</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* OPD Appointment Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8E5B3E] uppercase tracking-wider block">
                  SOPAN HOSPITAL & NEUROLOGY INSTITUTE
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Book OPD Consultation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingError(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOpdBooking} className="space-y-4">
              {/* Consultation Format */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Consultation Format *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBookVisitType('In-Person Hospital OPD')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      bookVisitType === 'In-Person Hospital OPD'
                        ? 'border-[#8E5B3E] bg-[#FAF5EE] text-[#7A492B] ring-2 ring-[#8E5B3E]/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-[#8E5B3E] shrink-0" />
                    <div>
                      <div className="text-xs font-bold">In-Person OPD</div>
                      <div className="text-[10px] text-slate-500">Hospital Clinic, Mumbai Naka</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookVisitType('Tele-Neurology Video Consultation')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      bookVisitType === 'Tele-Neurology Video Consultation'
                        ? 'border-[#8E5B3E] bg-[#FAF5EE] text-[#7A492B] ring-2 ring-[#8E5B3E]/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4 text-cyan-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Video Consult</div>
                      <div className="text-[10px] text-slate-500">Tele-Neurology (Remote)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Doctor Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100/70 border border-cyan-200 flex items-center justify-center text-cyan-800 font-bold shrink-0">
                    <User className="w-5 h-5 text-cyan-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">Dr. Sanjay Sopan Varade (MD, DM Neuro)</div>
                    <div className="text-[11px] text-slate-600 truncate">Director & Chief Neurologist • Stroke Center</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-500">OPD Fee</div>
                  <div className="font-bold text-slate-900 text-sm">₹1,000</div>
                </div>
              </div>

              {/* Date & Quota Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Appointment Date *
                    </label>
                    {opdDateQuota && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                        opdDateQuota.isFull
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : opdDateQuota.remaining <= 10
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {opdDateQuota.remaining} / {opdDateQuota.total} slots left
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookDate}
                    onChange={e => setBookDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Time Slot *
                  </label>
                  <select
                    value={bookTimeSlot}
                    onChange={e => setBookTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                  >
                    <option value="10:00 AM">10:00 AM (Morning OPD)</option>
                    <option value="11:00 AM">11:00 AM (Morning OPD)</option>
                    <option value="12:00 PM">12:00 PM (Noon OPD)</option>
                    <option value="01:00 PM">01:00 PM (Afternoon OPD)</option>
                    <option value="05:00 PM">05:00 PM (Evening OPD)</option>
                    <option value="06:00 PM">06:00 PM (Evening OPD)</option>
                    <option value="07:00 PM">07:00 PM (Evening OPD)</option>
                    <option value="08:00 PM">08:00 PM (Night OPD)</option>
                  </select>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookPatientName}
                    onChange={e => setBookPatientName(e.target.value)}
                    placeholder="Enter patient full legal name"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Patient Age *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={bookPatientAge}
                      onChange={e => setBookPatientAge(e.target.value)}
                      placeholder="e.g. 54"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Gender *
                    </label>
                    <select
                      value={bookPatientGender}
                      onChange={e => setBookPatientGender(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Phone (Locked to Verified Patient Phone) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mobile Phone (Verified) *
                    </label>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Patient Identity Verified
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={verifiedPhone}
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 cursor-not-allowed select-all"
                    />
                  </div>
                </div>

                {/* Optional Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address (Optional)
                    </label>
                    <span className="text-[11px] text-slate-400">Optional</span>
                  </div>
                  <input
                    type="email"
                    value={bookPatientEmail}
                    onChange={e => setBookPatientEmail(e.target.value)}
                    placeholder="e.g. patient@example.com (optional)"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                  />
                </div>

                {/* Optional Symptoms / Reason for Visit */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Symptoms / Reason for Visit (Optional)
                    </label>
                    <span className="text-[11px] text-slate-400">Optional</span>
                  </div>
                  <textarea
                    rows={2}
                    value={bookSymptoms}
                    onChange={e => setBookSymptoms(e.target.value)}
                    placeholder="e.g. Headache, numbness in arm, tremor, or follow-up consultation"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20 resize-none"
                  />
                </div>

                {/* Reminder Preferences */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                    Automated Reminders & Dispatch
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookOptInWhatsapp}
                        onChange={e => setBookOptInWhatsapp(e.target.checked)}
                        className="w-4 h-4 rounded text-[#8E5B3E] focus:ring-[#8E5B3E]"
                      />
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        WhatsApp Confirmation
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookOptInEmail}
                        onChange={e => setBookOptInEmail(e.target.checked)}
                        className="w-4 h-4 rounded text-[#8E5B3E] focus:ring-[#8E5B3E]"
                      />
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-cyan-600" />
                        Email Updates
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Initial Status: PENDING.</strong> Your booking will be registered immediately and submitted to the hospital clinical desk. Once approved by the hospital, your official downloadable Token Slip PDF will appear right here in your portal.
                </p>
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingError(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking || !bookPatientName.trim() || !bookPatientAge}
                  className="flex-1 py-3 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-amber-950 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isSubmittingBooking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Booking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Submit OPD Slot</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Reminder Configuration Modal */}
      {showReminderSettingsModal && selectedAppointmentModal && (
        <AppointmentReminderModal
          appointment={selectedAppointmentModal}
          isOpen={showReminderSettingsModal}
          onClose={() => setShowReminderSettingsModal(false)}
          onSaveReminder={(aptId, updatedSettings) => {
            handleSaveReminderSettings(aptId, updatedSettings);
            setShowReminderSettingsModal(false);
          }}
        />
      )}

      {/* Edit Profile Name Modal */}
      {showEditProfileNameModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-600" />
                <span>Edit Patient Profile Name</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditProfileNameModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileNameInput}
                  onChange={e => setProfileNameInput(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#8E5B3E] focus:ring-2 focus:ring-[#8E5B3E]/20"
                  autoFocus
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileNameModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !profileNameInput.trim()}
                  className="px-5 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Update Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Slip Modal (Shows Pending Acknowledgement OR Confirmed Token Slip with Download PDF) */}
      <AppointmentSlipModal
        appointment={selectedSlipAppointment}
        isOpen={Boolean(selectedSlipAppointment)}
        onClose={() => setSelectedSlipAppointment(null)}
      />
    </div>
  );
};
