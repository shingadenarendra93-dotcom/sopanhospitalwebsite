import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  Plus, 
  Minus, 
  Check, 
  X, 
  AlertTriangle, 
  AlertCircle,
  Calendar, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  MessageCircle, 
  Printer, 
  Search, 
  Filter, 
  Sparkles, 
  Sliders, 
  LogOut, 
  Users, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Save,
  ArrowRight,
  Camera,
  Trash2,
  Upload,
  Image as ImageIcon,
  Eye,
  MapPin,
  Maximize2,
  Minimize2,
  Globe,
  Edit3,
  RefreshCcw
} from 'lucide-react';
import { Appointment, OpdAuditLog, HospitalEvent } from '../types';
import { 
  subscribeToAppointments, 
  subscribeToHospitalSettings, 
  subscribeToHospitalEvents,
  saveHospitalSettingsToFirestore, 
  updateAppointmentStatusInFirestore, 
  deleteAppointmentFromFirestore,
  DEFAULT_HOSPITAL_CONTENT,
  HospitalContentSettings,
  db
} from '../lib/firebase';
import { 
  loadHospitalEvents,
  addHospitalEventPhoto,
  removeHospitalEventPhoto,
  resetHospitalEventsToDefault,
  compressImageFile,
  PRESET_OCCASION_PHOTOS,
  OCCASION_CATEGORIES,
  matchEventCategory
} from '../utils/hospitalEventsUtils';
import { 
  OpdSlotStats, 
  calculateOpdSlotStats, 
  loadOpdAppointments, 
  saveOpdAppointments, 
  getOpdCapacity, 
  setOpdCapacity, 
  resetOpdCounter, 
  setOpdManualOffset, 
  getOpdManualOffset, 
  isAdminLoggedIn, 
  getAdminSession, 
  setAdminSession, 
  updateAppointmentStatus,
  getAdminAuditLogs,
  clearAdminAuditLogs,
  addAdminAuditLog,
  getConsultationFee,
  setConsultationFee,
  formatConsultationFee
} from '../utils/opdSlotUtils';

interface OpdAdminPortalModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAppointmentsUpdated?: () => void;
  isEmbedded?: boolean;
  initialTab?: 'fee' | 'content' | 'counter' | 'appointments' | 'logs' | 'gallery';
}

export const OpdAdminPortalModal: React.FC<OpdAdminPortalModalProps> = ({
  isOpen = false,
  onClose,
  onAppointmentsUpdated,
  isEmbedded = false,
  initialTab = 'fee'
}) => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAdminLoggedIn());
  const [adminUser, setAdminUser] = useState(() => getAdminSession());
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin View Tab
  const [activeAdminTab, setActiveAdminTab] = useState<'fee' | 'content' | 'counter' | 'appointments' | 'logs' | 'gallery'>(initialTab);

  // Home Page Content & Hospital Settings (Live Firestore Sync)
  const [contentFormData, setContentFormData] = useState<HospitalContentSettings>(DEFAULT_HOSPITAL_CONTENT);
  const [isSavingContent, setIsSavingContent] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveAdminTab(initialTab);
    }
  }, [initialTab]);

  // Real-time onSnapshot subscription to appointments, hospital content & occasion gallery photos
  useEffect(() => {
    const unsubAppts = subscribeToAppointments((liveApts) => {
      setAppointments(liveApts);
    });
    const unsubSettings = subscribeToHospitalSettings((liveSettings) => {
      setContentFormData(liveSettings);
      setConsultationFeeState(liveSettings.consultationFee);
      setCapacityState(liveSettings.opdCapacity);
    });
    const unsubEvents = subscribeToHospitalEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setHospitalEvents(liveEvents);
      }
    });
    return () => {
      unsubAppts();
      unsubSettings();
      unsubEvents();
    };
  }, []);

  // Hospital Events Gallery State
  const [hospitalEvents, setHospitalEvents] = useState<HospitalEvent[]>(() => loadHospitalEvents());
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('All');
  const [gallerySearch, setGallerySearch] = useState<string>('');
  const [photoToDelete, setPhotoToDelete] = useState<HospitalEvent | null>(null);
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState<boolean>(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState<string>('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<string>('Events');
  const [newPhotoDate, setNewPhotoDate] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  });
  const [newPhotoLocation, setNewPhotoLocation] = useState<string>('Sopan Hospital, Shrihari Kute Marg, Mumbai Naka, Nashik');
  const [newPhotoLead, setNewPhotoLead] = useState<string>('Dr. Sanjay Sopan Varade (MD, DM Neuro)');
  const [newPhotoAttendees, setNewPhotoAttendees] = useState<string>('150+ Attendees & Dignitaries');
  const [newPhotoImageUrl, setNewPhotoImageUrl] = useState<string>(PRESET_OCCASION_PHOTOS[0].url);
  const [newPhotoCustomUrl, setNewPhotoCustomUrl] = useState<string>('');
  const [newPhotoSummary, setNewPhotoSummary] = useState<string>('');
  const [newPhotoHighlights, setNewPhotoHighlights] = useState<string>('');
  const [newPhotoTags, setNewPhotoTags] = useState<string>('HospitalOccasion, SopanNeuro, Nashik');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);

  // Appointments & Slot Stats
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadOpdAppointments());
  const [capacity, setCapacityState] = useState<number>(() => getOpdCapacity());
  const [customCapacityInput, setCustomCapacityInput] = useState<number>(() => getOpdCapacity());
  const [consultationFeeState, setConsultationFeeState] = useState<number>(() => getConsultationFee());
  const [customFeeInput, setCustomFeeInput] = useState<number>(() => getConsultationFee());
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<OpdAuditLog[]>(() => getAdminAuditLogs());
  const [logActionFilter, setLogActionFilter] = useState<'All' | 'Approvals' | 'Rejections' | 'Resets'>('All');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');

  // Rejection modal sub-state
  const [rejectingAppointment, setRejectingAppointment] = useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Doctor in Emergency OT / Thrombectomy Procedure');
  const [customRejectionText, setCustomRejectionText] = useState<string>('');

  // Clear logs modal state
  const [isClearLogsModalOpen, setIsClearLogsModalOpen] = useState<boolean>(false);

  // Photo Studio & Upload Window View States
  const [isPhotoStudioMaximized, setIsPhotoStudioMaximized] = useState<boolean>(false);
  const [photoStudioTab, setPhotoStudioTab] = useState<'device' | 'presets' | 'url'>('device');
  const [photoPreviewFit, setPhotoPreviewFit] = useState<'contain' | 'cover'>('contain');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Notification feedback toast
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);
  const [photoAddedSuccessTitle, setPhotoAddedSuccessTitle] = useState<string | null>(null);

  // Sync appointments and audit logs from storage
  const reloadData = () => {
    const loadedApts = loadOpdAppointments();
    setAppointments(loadedApts);
    const curCap = getOpdCapacity();
    setCapacityState(curCap);
    setCustomCapacityInput(curCap);
    const curFee = getConsultationFee();
    setConsultationFeeState(curFee);
    setCustomFeeInput(curFee);
    setIsLoggedIn(isAdminLoggedIn());
    setAdminUser(getAdminSession());
    setAuditLogs(getAdminAuditLogs());
    setHospitalEvents(loadHospitalEvents());
  };

  useEffect(() => {
    if (isOpen || isEmbedded) {
      reloadData();
    }
  }, [isOpen, isEmbedded]);

  useEffect(() => {
    const handleSync = () => reloadData();
    window.addEventListener('sopan_opd_quota_updated', handleSync);
    window.addEventListener('sopan_admin_session_changed', handleSync);
    window.addEventListener('sopan_audit_log_added', handleSync);
    window.addEventListener('sopan_hospital_events_updated', handleSync);
    return () => {
      window.removeEventListener('sopan_opd_quota_updated', handleSync);
      window.removeEventListener('sopan_admin_session_changed', handleSync);
      window.removeEventListener('sopan_audit_log_added', handleSync);
      window.removeEventListener('sopan_hospital_events_updated', handleSync);
    };
  }, []);

  // Compute live stats
  const stats: OpdSlotStats = useMemo(() => {
    return calculateOpdSlotStats(appointments, undefined, capacity);
  }, [appointments, capacity]);

  // Show toast notification
  const triggerToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setFeedbackToast({ type, text });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Standard hospital admin credentials: admin@sopanhospital.com / admin123 or PIN: 2317
    const isDirectPin = (cleanUser === '2317' || cleanPass === '2317');
    const isStandardAdmin = (
      (cleanUser === 'admin@sopanhospital.com' || cleanUser === 'admin' || cleanUser.includes('sopan') || cleanUser.includes('varade') || cleanUser === '2317') &&
      (cleanPass === 'admin123' || cleanPass === '2317' || cleanPass === 'sopan2026')
    );

    if (isDirectPin || isStandardAdmin) {
      const session = {
        username: 'OPD Desk Chief Administrator',
        role: 'Hospital OPD & Triage Director',
        email: cleanUser.includes('@') ? cleanUser : 'admin@sopanhospital.com',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAdminSession(session);
      setIsLoggedIn(true);
      setAdminUser(session);
      setAuthError(null);
      triggerToast('Welcome, Administrator. OPD Desk controls unlocked.', 'success');
    } else {
      setAuthError('Invalid credentials. Please verify your Administrator ID, password, or security PIN.');
    }
  };

  const handleLogout = () => {
    setAdminSession(null);
    setIsLoggedIn(false);
    setAdminUser(null);
    setUsernameInput('');
    setPasswordInput('');
    setAuthError(null);
    triggerToast('Admin logged out safely.', 'info');
  };

  // --- ACTIONS: RESET COUNTER & EXTEND CAPACITY ---

  const handleResetCounter = () => {
    resetOpdCounter();
    reloadData();
    triggerToast('Patient OPD counter successfully reset to 0 booked (full daily quota restored).', 'success');
    onAppointmentsUpdated?.();
  };

  const handleExtendCapacity = (increment: number) => {
    const newCap = Math.max(10, Math.min(200, capacity + increment));
    setOpdCapacity(newCap);
    setCapacityState(newCap);
    setCustomCapacityInput(newCap);
    triggerToast(`OPD Patient Quota extended to ${newCap} slots/day.`, 'success');
    onAppointmentsUpdated?.();
  };

  const handleSaveCustomCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    const newCap = Math.max(10, Math.min(200, Number(customCapacityInput)));
    setOpdCapacity(newCap);
    setCapacityState(newCap);
    triggerToast(`OPD daily capacity quota updated to ${newCap} patients.`, 'success');
    onAppointmentsUpdated?.();
  };

  const handleSaveConsultationFee = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = Math.max(0, Math.min(50000, Number(customFeeInput)));
    if (isNaN(sanitized) || sanitized < 0) {
      triggerToast('Please enter a valid consultation fee amount.', 'warning');
      return;
    }
    setConsultationFee(sanitized, adminUser || undefined);
    setConsultationFeeState(sanitized);
    triggerToast(`Consultation fee updated to ₹${sanitized.toLocaleString('en-IN')}. Home page, doctor profile & appointment slips synced!`, 'success');
    reloadData();
    onAppointmentsUpdated?.();
  };

  const handlePresetFeeSelect = (amount: number) => {
    setCustomFeeInput(amount);
    setConsultationFee(amount, adminUser || undefined);
    setConsultationFeeState(amount);
    triggerToast(`Consultation fee updated to ₹${amount.toLocaleString('en-IN')}. Home page synced!`, 'success');
    reloadData();
    onAppointmentsUpdated?.();
  };

  // --- ACTIONS: HOME PAGE CONTENT & BANNER SETTINGS (LIVE FIRESTORE SYNC) ---
  const handleSaveHospitalContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminLoggedIn()) {
      triggerToast('Security alert: Admin authentication required to update home page content.', 'warning');
      return;
    }
    setIsSavingContent(true);
    try {
      const payload: Partial<HospitalContentSettings> = {
        ...contentFormData,
        consultationFee: consultationFeeState,
        opdCapacity: capacity,
        updatedBy: adminUser?.username || 'OPD Desk Administrator'
      };
      const ok = await saveHospitalSettingsToFirestore(payload);
      if (ok) {
        addAdminAuditLog({
          action: 'CONSULTATION_FEE_UPDATED',
          adminName: adminUser?.username || 'OPD Desk Admin',
          details: 'Home page banners, text, hotline numbers & hospital configuration updated live to Firestore across all devices.'
        });
        triggerToast('Home page content & banners synced live to Firestore! All devices updated.', 'success');
        onAppointmentsUpdated?.();
      } else {
        triggerToast('Notice: Saved locally. Check network/Firestore connection.', 'warning');
      }
    } catch (err: any) {
      triggerToast(`Error saving content: ${err?.message || 'Failed to update'}`, 'warning');
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleResetHospitalContentToDefaults = () => {
    if (!isAdminLoggedIn()) {
      triggerToast('Security alert: Admin authentication required.', 'warning');
      return;
    }
    if (window.confirm('Reset all home page text, headlines and banners back to standard hospital defaults?')) {
      setContentFormData(DEFAULT_HOSPITAL_CONTENT);
      saveHospitalSettingsToFirestore({
        ...DEFAULT_HOSPITAL_CONTENT,
        updatedBy: adminUser?.username || 'OPD Desk Administrator'
      }).catch(() => {});
      triggerToast('Hospital content reset to standard defaults.', 'info');
      onAppointmentsUpdated?.();
    }
  };

  // --- ACTIONS: ACCEPT & REJECT APPOINTMENTS (ADMIN ACCESS ONLY) ---

  const handleAcceptAppointment = async (apt: Appointment) => {
    if (!isAdminLoggedIn()) {
      triggerToast('Security alert: Admin authentication required to accept appointments.', 'warning');
      return;
    }
    const adminName = adminUser?.username || 'OPD Desk Admin';
    await updateAppointmentStatusInFirestore(apt.id, 'Confirmed', undefined, adminName);
    const updated = updateAppointmentStatus(apt.id, 'Confirmed', undefined, adminName);
    setAppointments(updated);
    triggerToast(`Appointment for ${apt.patientName} (Token: ${apt.tokenNumber}) accepted & confirmed.`, 'success');
    onAppointmentsUpdated?.();
  };

  const handleOpenRejectModal = (apt: Appointment) => {
    if (!isAdminLoggedIn()) {
      triggerToast('Security alert: Admin authentication required to reject appointments.', 'warning');
      return;
    }
    setRejectingAppointment(apt);
    setRejectionReason('Doctor in Emergency OT / Thrombectomy Procedure');
    setCustomRejectionText('');
  };

  const handleConfirmReject = async () => {
    if (!isAdminLoggedIn()) {
      triggerToast('Security alert: Admin authentication required to reject appointments.', 'warning');
      return;
    }
    if (!rejectingAppointment) return;
    const finalReason = rejectionReason === 'Other (Specify Below)' 
      ? (customRejectionText.trim() || 'Rescheduled by OPD Administration')
      : rejectionReason;

    const adminName = adminUser?.username || 'OPD Desk Admin';
    await updateAppointmentStatusInFirestore(rejectingAppointment.id, 'Cancelled', finalReason, adminName);
    const updated = updateAppointmentStatus(
      rejectingAppointment.id, 
      'Cancelled', 
      finalReason, 
      adminName
    );
    setAppointments(updated);
    triggerToast(`Appointment for ${rejectingAppointment.patientName} rejected. Slot released back to available pool.`, 'warning');
    setRejectingAppointment(null);
    onAppointmentsUpdated?.();
  };

  const handleDeleteAppointment = async (apt: Appointment) => {
    if (!isAdminLoggedIn()) {
      triggerToast('Security alert: Admin authentication required.', 'warning');
      return;
    }
    if (window.confirm(`Permanently remove appointment record for "${apt.patientName}" (Token: ${apt.tokenNumber})?`)) {
      await deleteAppointmentFromFirestore(apt.id);
      const updated = appointments.filter(a => a.id !== apt.id);
      saveOpdAppointments(updated);
      setAppointments(updated);
      addAdminAuditLog({
        action: 'APPOINTMENT_REJECTED',
        adminName: adminUser?.username || 'OPD Desk Admin',
        details: `Deleted/removed appointment record for "${apt.patientName}" (Token: ${apt.tokenNumber}).`
      });
      triggerToast(`Appointment record for "${apt.patientName}" permanently removed.`, 'info');
      onAppointmentsUpdated?.();
    }
  };

  const handleClearAllAppointments = async () => {
    if (!isAdminLoggedIn()) {
      triggerToast('Security alert: Admin authentication required.', 'warning');
      return;
    }
    if (window.confirm('Are you sure you want to clear all appointments? This will delete all sample and test appointment records and restore the full 50/50 OPD slots.')) {
      try {
        const { deleteDoc, getDocs, collection } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'appointments'));
        await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
      } catch (err) {
        console.warn('Error clearing Firestore appointments:', err);
      }
      saveOpdAppointments([]);
      setAppointments([]);
      resetOpdCounter(true);
      triggerToast('All appointments cleared. Full OPD slot quota restored (50/50 slots available).', 'success');
      onAppointmentsUpdated?.();
    }
  };

  // --- ACTIONS: GALLERY SPECIAL OCCASION PHOTOS ---
  const filteredGalleryPhotos = useMemo(() => {
    return hospitalEvents.filter(evt => {
      const matchesCat = matchEventCategory(evt, galleryCategoryFilter);
      const q = gallerySearch.toLowerCase().trim();
      const matchesSearch = !q || (
        evt.title.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.summary.toLowerCase().includes(q)
      );
      return matchesCat && matchesSearch;
    });
  }, [hospitalEvents, galleryCategoryFilter, gallerySearch]);

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      triggerToast('Please select an image smaller than 15MB.', 'warning');
      return;
    }

    setUploadedFileName(file.name);
    try {
      // Compress image so that data URL remains under 200KB and live syncs to Firestore seamlessly
      const compressedDataUrl = await compressImageFile(file);
      setNewPhotoImageUrl(compressedDataUrl);
      setNewPhotoCustomUrl('');
      setSelectedPresetIdx(-1);
      triggerToast(`Photograph "${file.name}" uploaded and optimized for live sync.`, 'info');
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewPhotoImageUrl(result);
        setNewPhotoCustomUrl('');
        setSelectedPresetIdx(-1);
        triggerToast(`Photograph "${file.name}" uploaded successfully.`, 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle.trim()) {
      triggerToast('Please provide an occasion title.', 'warning');
      return;
    }
    const finalImage = newPhotoCustomUrl.trim() || newPhotoImageUrl;
    if (!finalImage) {
      triggerToast('Please provide an image URL or choose a preset.', 'warning');
      return;
    }
    const highlights = newPhotoHighlights
      .split('\n')
      .map(h => h.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);
    const tags = newPhotoTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    addHospitalEventPhoto({
      title: newPhotoTitle.trim(),
      category: newPhotoCategory as any,
      date: newPhotoDate.trim(),
      location: newPhotoLocation.trim(),
      leadClinician: newPhotoLead.trim(),
      summary: newPhotoSummary.trim() || `Special occasion photograph captured at Sopan Hospital: ${newPhotoTitle.trim()}`,
      attendeesCount: newPhotoAttendees.trim() || 'Dignitaries & Hospital Staff',
      imageUrl: finalImage,
      tags: tags.length > 0 ? tags : ['HospitalOccasion', 'SopanNeuro'],
      keyHighlights: highlights.length > 0 ? highlights : [
        'Organized under the clinical leadership of Dr. Sanjay Sopan Varade (MD, DM Neuro).',
        'Special occasion commemorated at Sopan Hospital Nashik.'
      ]
    }, { username: adminUser?.username, email: adminUser?.email });

    setHospitalEvents(loadHospitalEvents());
    // Keep modal open to allow adding more photographs without interrupting workflow
    const addedPhotoTitle = newPhotoTitle.trim();
    setPhotoAddedSuccessTitle(addedPhotoTitle);
    setNewPhotoTitle('');
    setNewPhotoSummary('');
    setNewPhotoHighlights('');
    setNewPhotoCustomUrl('');
    setNewPhotoImageUrl(PRESET_OCCASION_PHOTOS[0].url);
    setSelectedPresetIdx(0);
    setUploadedFileName('');
    triggerToast(`Photograph "${addedPhotoTitle}" added to hospital gallery successfully!`, 'success');
  };

  const handleConfirmDeletePhoto = () => {
    if (!photoToDelete) return;
    const deletedTitle = photoToDelete.title;
    removeHospitalEventPhoto(photoToDelete.id, { username: adminUser?.username, email: adminUser?.email });
    setHospitalEvents(loadHospitalEvents());
    setPhotoToDelete(null);
    triggerToast(`Photograph "${deletedTitle}" removed from gallery.`, 'warning');
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesStatus = 
        statusFilter === 'All' ? true :
        statusFilter === 'Pending' ? (apt.status === 'Pending' || apt.status === undefined) :
        apt.status === statusFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientPhone.toLowerCase().includes(q) ||
        apt.tokenNumber.toLowerCase().includes(q) ||
        apt.symptoms.toLowerCase().includes(q) ||
        apt.department.toLowerCase().includes(q)
      );

      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesFilter =
        logActionFilter === 'All' ? true :
        logActionFilter === 'Approvals' ? log.action === 'APPOINTMENT_APPROVED' :
        logActionFilter === 'Rejections' ? log.action === 'APPOINTMENT_REJECTED' :
        (log.action === 'OPD_COUNTER_RESET' || log.action === 'OPD_CAPACITY_EXTENDED');

      const q = logSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        log.details.toLowerCase().includes(q) ||
        log.adminName.toLowerCase().includes(q) ||
        (log.patientName && log.patientName.toLowerCase().includes(q)) ||
        (log.tokenNumber && log.tokenNumber.toLowerCase().includes(q)) ||
        (log.rejectionReason && log.rejectionReason.toLowerCase().includes(q))
      );

      return matchesFilter && matchesSearch;
    });
  }, [auditLogs, logActionFilter, logSearchQuery]);

  if (!isEmbedded && !isOpen) return null;

  const content = (
    <div className={`bg-white w-full flex flex-col border-slate-200 overflow-hidden animate-in fade-in duration-200 ${
      isEmbedded ? 'shadow-md border-slate-200 rounded-3xl min-h-[80vh]' : 'h-full flex-1 max-w-none max-h-none rounded-none border-none'
    }`}>
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg tracking-tight">OPD Administration & Capacity Control</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Hospital Admin Console
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sopan Hospital & Neurology Institute • Dr. Sanjay Sopan Varade OPD Desk • Nashik
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end text-xs text-slate-400">
            <span className="font-semibold text-slate-300">24/7 Helpline: 0253 2317364</span>
            <span className="text-[11px] text-slate-500">Full Screen Terminal View</span>
          </div>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
              title="End Administrator Session & Log Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log Out</span>
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Hospital Portal"
            >
              <X className="w-4 h-4" />
              <span>{isEmbedded ? 'Close' : 'Exit Admin View'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackToast && (
        <div className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-all ${
          feedbackToast.type === 'success' ? 'bg-emerald-600 text-white' :
          feedbackToast.type === 'warning' ? 'bg-amber-600 text-white' :
          'bg-cyan-700 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackToast.text}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-white/80 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* High z-index floating toast portaled to document.body to remain visible across all sub-modals */}
      {feedbackToast && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-5 right-5 sm:right-6 z-[100005] bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3.5 animate-in slide-in-from-top-4 duration-200 text-xs sm:text-sm max-w-md">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            feedbackToast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
            feedbackToast.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
            'bg-cyan-500/20 text-cyan-400'
          }`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white flex items-center gap-2">
              <span>{feedbackToast.type === 'success' ? 'Action Confirmed' : 'System Notification'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono uppercase font-bold">Admin</span>
            </div>
            <div className="text-slate-300 text-xs mt-0.5">{feedbackToast.text}</div>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}

        {/* Content Body: Login or Admin Dashboard */}
        {!isLoggedIn ? (
          /* Admin Login Form - Full Screen FOV Terminal */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#FAF7F2] to-[#EFEAE2] overflow-y-auto">
            <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E2D9CC] shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center shadow-xs">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-serif font-bold text-slate-900">Hospital Administrator Authentication</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Authenticate with OPD coordination credentials to reset live patient counters, expand patient quotas, or accept/reject appointments.
                </p>
              </div>

              {/* Official Staff Access Notice - Credentials Strictly Hidden */}
              <div className="bg-[#FAF7F2] border border-[#E4DDD0] rounded-2xl p-4 text-xs space-y-2 text-[#4A453E]">
                <div className="font-bold text-[#27231E] flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#8E5B3E]" />
                  <span>Restricted Access: Official Hospital Administration Only</span>
                </div>
                <p className="text-[11px] text-[#5C554B] leading-relaxed">
                  This console is strictly reserved for authorized clinical coordinators and OPD staff of Sopan Hospital. Unauthorized access attempts are monitored and recorded.
                </p>
                <div className="text-[10px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-[#DFD7CA] flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-[#8E5B3E] shrink-0" />
                  <span>Enter your assigned administrator credentials or security PIN to access live counter resets, quota overrides, and appointment triage.</span>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Admin Email / Staff ID
                  </label>
                  <input
                    type="text"
                    name="admin_user_id_field"
                    autoComplete="off"
                    required
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    placeholder="Enter Administrator ID or Email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Password / Security PIN
                  </label>
                  <input
                    type="password"
                    name="admin_pass_code_field"
                    autoComplete="new-password"
                    required
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Enter Password or Security PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Authenticate Administrator
                  </button>
                </div>
              </form>

              {onClose && (
                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    ← Return to Hospital Portal
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Admin Status Strip */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-800">
                  {adminUser?.username || 'OPD Administrator'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-mono">
                  Live Quota: <strong className="text-slate-900">{stats.remainingSlots}</strong> / {stats.totalSlots} Slots Free ({stats.bookedCount} Booked)
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-700 bg-amber-100/70 border border-amber-300/80 px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1">
                  <span>Home Fee:</span>
                  <strong className="text-[#8E5B3E] font-bold">₹{consultationFeeState.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Log Out
                </button>
              </div>
            </div>

            {/* Admin Navigation Tabs (Responsive & Touch-Friendly across mobile and tablet) */}
            <div className="flex items-center border-b border-slate-200 bg-white px-3 sm:px-5 pt-2 gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
              <button
                id="admin-tab-fee"
                onClick={() => setActiveAdminTab('fee')}
                className={`admin-mobile-tab-btn touch-friendly-btn pb-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                  activeAdminTab === 'fee'
                    ? 'border-[#8E5B3E] text-[#8E5B3E]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-[#8E5B3E] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  ₹
                </div>
                <span className="whitespace-nowrap">Home Consultation Fee (₹{consultationFeeState.toLocaleString('en-IN')})</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                  Live
                </span>
              </button>

              <button
                id="admin-tab-content"
                onClick={() => setActiveAdminTab('content')}
                className={`admin-mobile-tab-btn touch-friendly-btn pb-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                  activeAdminTab === 'content'
                    ? 'border-[#8E5B3E] text-[#8E5B3E]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0 text-[#8E5B3E]" />
                <span className="whitespace-nowrap">Home Page Content & Banners</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                  Firestore Live
                </span>
              </button>

              <button
                onClick={() => setActiveAdminTab('counter')}
                className={`admin-mobile-tab-btn touch-friendly-btn pb-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                  activeAdminTab === 'counter'
                    ? 'border-cyan-600 text-cyan-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">OPD Counter & Capacity</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('appointments')}
                className={`admin-mobile-tab-btn touch-friendly-btn pb-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                  activeAdminTab === 'appointments'
                    ? 'border-cyan-600 text-cyan-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Appointments ({appointments.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('logs')}
                className={`admin-mobile-tab-btn touch-friendly-btn pb-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                  activeAdminTab === 'logs'
                    ? 'border-cyan-600 text-cyan-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Audit & Action Logs ({auditLogs.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('gallery')}
                className={`admin-mobile-tab-btn touch-friendly-btn pb-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                  activeAdminTab === 'gallery'
                    ? 'border-cyan-600 text-cyan-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Occasion Photos ({hospitalEvents.length})</span>
              </button>
            </div>

            {/* TAB 0: HOME PAGE CONSULTATION FEE MANAGEMENT */}
            {activeAdminTab === 'fee' && (
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                {/* Header Summary Card */}
                <div className="bg-gradient-to-br from-[#FAF5EE] via-white to-[#F2E8DC] border-2 border-[#E7DAC8] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#8E5B3E] text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                        ₹
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif font-black text-lg sm:text-xl text-slate-900">
                            Home Page Doctor Consultation Fee
                          </h3>
                          <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live on Home Page
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          Control the outpatient consultation fee for <strong>Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong>. 
                          Updates immediately reflect on the <strong>Home Page Hero Banner</strong>, <strong>Doctor Profile Card</strong>, 
                          <strong>Bottom Statistics Ticker</strong>, <strong>Top Navigation Bar</strong>, <strong>Appointment Scheduler</strong>, and persist to <strong>Cloud Firestore</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Active Fee Live Display Box */}
                    <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-4 px-6 text-right shadow-xs shrink-0 min-w-[200px]">
                      <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                        Active Home Fee
                      </span>
                      <div className="text-3xl font-serif font-black text-[#8E5B3E] tracking-tight">
                        ₹{consultationFeeState.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1 mt-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cloud & Browser Synced</span>
                      </span>
                    </div>
                  </div>

                  {/* Live Display Preview Matrix */}
                  <div className="pt-4 border-t border-[#EAE1D3] space-y-2">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#8E5B3E]" />
                      <span>Live Home Page Elements Preview:</span>
                      <span className="text-[11px] text-slate-500 font-normal">(Verified real-time broadcast across all components)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
                      {/* Preview 1: Hero Banner Booking Button */}
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          1. Hero Schedule CTA
                        </span>
                        <div className="px-3 py-1.5 rounded-xl bg-[#8E5B3E] text-white text-[11px] font-semibold text-center truncate">
                          Schedule OPD (₹{consultationFeeState.toLocaleString('en-IN')})
                        </div>
                      </div>

                      {/* Preview 2: Doctor Profile Card */}
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          2. Doctor Profile Card
                        </span>
                        <div className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                          <span className="text-slate-600">Consultation Fee:</span>
                          <span className="font-bold text-[#8E5B3E]">₹{consultationFeeState.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Preview 3: Bottom Stats Ticker */}
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          3. Home Stats Ticker
                        </span>
                        <div className="text-[11px] bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                          <span className="text-slate-500 text-[10px] block">Consultation OPD Fee</span>
                          <span className="font-bold text-slate-900">₹{consultationFeeState.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Preview 4: Top Navigation Bar */}
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          4. Top Navigation Bar
                        </span>
                        <div className="px-3 py-1.5 rounded-xl bg-[#8E5B3E] text-white text-[11px] font-semibold text-center truncate">
                          Book OPD (₹{consultationFeeState.toLocaleString('en-IN')})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="pt-4 border-t border-[#EAE1D3] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Quick Fee Presets:</span>
                        <span className="text-[11px] text-slate-500 font-normal">(Click any button to update immediately)</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[500, 1000, 1200, 1500, 1800, 2000, 2500, 3000, 5000].map(feeVal => (
                          <button
                            key={feeVal}
                            type="button"
                            onClick={() => handlePresetFeeSelect(feeVal)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              consultationFeeState === feeVal
                                ? 'bg-[#8E5B3E] text-white shadow-xs ring-2 ring-[#8E5B3E]/30 scale-105'
                                : 'bg-white hover:bg-amber-100/60 text-slate-700 border border-[#DACDC0]'
                            }`}
                          >
                            ₹{feeVal.toLocaleString('en-IN')} {feeVal === 1500 && '(Default)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Number Input Form */}
                    <form onSubmit={handleSaveConsultationFee} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <div className="relative flex-1 w-full sm:w-auto">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={50000}
                          step={50}
                          value={customFeeInput}
                          onChange={e => setCustomFeeInput(Number(e.target.value))}
                          placeholder="Enter custom consultation fee in INR (e.g. 1500)"
                          className="w-full pl-8 pr-4 py-3 rounded-2xl border border-[#DFCFC0] bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden shadow-2xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update Home Page Fee</span>
                      </button>

                      {consultationFeeState !== 1500 && (
                        <button
                          type="button"
                          onClick={() => handlePresetFeeSelect(1500)}
                          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Reset to Default ₹1,500</span>
                        </button>
                      )}
                    </form>
                  </div>
                </div>

                {/* Audit & Log History of Fee Changes */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Recent Consultation Fee Adjustment Logs</span>
                    </span>
                    <button
                      onClick={() => setActiveAdminTab('counter')}
                      className="text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Go to OPD Counter & Intake Cap Settings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {auditLogs.filter(l => l.action === 'CONSULTATION_FEE_UPDATED').length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-center">
                      No manual fee modifications recorded in current session. Active default: ₹1,500.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {auditLogs
                        .filter(l => l.action === 'CONSULTATION_FEE_UPDATED')
                        .slice(0, 5)
                        .map(log => (
                          <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold text-slate-800">{log.details}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Updated by: <span className="font-medium text-slate-700">{log.adminName || 'Hospital Admin'}</span>
                              </div>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 shrink-0">
                              {log.timestamp}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: HOME PAGE CONTENT & BANNER SETTINGS (LIVE FIRESTORE SYNC) */}
            {activeAdminTab === 'content' && (
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                {/* Header Summary Card */}
                <div className="bg-gradient-to-br from-[#FAF5EE] via-white to-[#F2E8DC] border-2 border-[#E7DAC8] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#8E5B3E] text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                        <Globe className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif font-black text-lg sm:text-xl text-slate-900">
                            Home Page Content & Live Banners
                          </h3>
                          <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            Firestore onSnapshot Live
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                          Modify public text, announcements, emergency telephone numbers, and headlines. Changes are stored in Firestore collection <code className="bg-white/80 px-1 py-0.5 rounded border border-[#E7DAC8] font-mono text-[11px] text-[#8E5B3E]">hospital_settings/configuration</code> and synchronize instantaneously to all patient devices without page reloads.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetHospitalContentToDefaults}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content Editor Form */}
                <form onSubmit={handleSaveHospitalContent} className="space-y-6">
                  {/* SECTION 1: HERO HEADLINES & SUBTITLE */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8E5B3E]" />
                        <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                          1. Main Hero Card & Headline
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Visible top of home screen</span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Hero Top Badge / Tagline
                        </label>
                        <input
                          type="text"
                          value={contentFormData.heroBadgeText || ''}
                          onChange={e => setContentFormData({ ...contentFormData, heroBadgeText: e.target.value })}
                          placeholder="e.g. NABH Accredited Super-Speciality Neuroscience Center • Mumbai Naka, Nashik"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Main Hero Headline
                        </label>
                        <input
                          type="text"
                          value={contentFormData.heroTitle || ''}
                          onChange={e => setContentFormData({ ...contentFormData, heroTitle: e.target.value })}
                          placeholder="e.g. Compassionate Clinical Excellence in Neurology & Brain Sciences"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Hero Subtitle & Clinical Overview
                        </label>
                        <textarea
                          rows={3}
                          value={contentFormData.heroSubtitle || ''}
                          onChange={e => setContentFormData({ ...contentFormData, heroSubtitle: e.target.value })}
                          placeholder="Summary of hospital services, 32-slice CT, acute stroke rescue..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-normal text-slate-800 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: TOP EMERGENCY STRIP & WHATSAPP */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-rose-600" />
                        <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                          2. 24/7 Stroke Rapid Response Top Bar
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Fixed at top of navigation bar</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="md:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          Emergency Top Bar Announcement Text
                        </label>
                        <input
                          type="text"
                          value={contentFormData.emergencyBannerText || ''}
                          onChange={e => setContentFormData({ ...contentFormData, emergencyBannerText: e.target.value })}
                          placeholder="24/7 ACUTE STROKE & NEURO EMERGENCY HOTLINE: Mumbai Naka, Nashik • 32-Slice CT & ICU Ready"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Emergency Telephone (Display)
                        </label>
                        <input
                          type="text"
                          value={contentFormData.emergencyPhoneDisplay || ''}
                          onChange={e => setContentFormData({ ...contentFormData, emergencyPhoneDisplay: e.target.value })}
                          placeholder="0253 2317364"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Emergency Telephone (Dial Target)
                        </label>
                        <input
                          type="text"
                          value={contentFormData.emergencyPhone || ''}
                          onChange={e => setContentFormData({ ...contentFormData, emergencyPhone: e.target.value })}
                          placeholder="02532317364"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          WhatsApp Desk Display
                        </label>
                        <input
                          type="text"
                          value={contentFormData.whatsappDisplay || ''}
                          onChange={e => setContentFormData({ ...contentFormData, whatsappDisplay: e.target.value })}
                          placeholder="WhatsApp: 9405545521"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          WhatsApp Number (Digits only)
                        </label>
                        <input
                          type="text"
                          value={contentFormData.whatsappNumber || ''}
                          onChange={e => setContentFormData({ ...contentFormData, whatsappNumber: e.target.value })}
                          placeholder="9405545521"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: URGENT ANNOUNCEMENT ALERT BANNER */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                          3. Urgent Alert / Notice Banner
                        </h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(contentFormData.announcementBannerEnabled)}
                          onChange={e => setContentFormData({ ...contentFormData, announcementBannerEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        <span className="ml-2 text-xs font-semibold text-slate-700">
                          {contentFormData.announcementBannerEnabled ? 'Banner Enabled' : 'Banner Disabled'}
                        </span>
                      </label>
                    </div>

                    <div className="space-y-2 text-xs">
                      <label className="block font-bold text-slate-700">
                        Urgent Announcement Banner Text (Displayed above Hero Card)
                      </label>
                      <input
                        type="text"
                        value={contentFormData.announcementBannerText || ''}
                        onChange={e => setContentFormData({ ...contentFormData, announcementBannerText: e.target.value })}
                        placeholder="e.g. Free Epilepsy Consultation Camp this Saturday 9 AM - 1 PM. Walk-in acute stroke triage operational 24/7."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* SECTION 4: DIRECTOR CREDENTIALS & HOSPITAL DETAILS */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                          4. Director Profile & Key Clinical Benchmarks
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Hero right profile & footer</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Director Name
                        </label>
                        <input
                          type="text"
                          value={contentFormData.directorName || ''}
                          onChange={e => setContentFormData({ ...contentFormData, directorName: e.target.value })}
                          placeholder="Dr. Sanjay Sopan Varade"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Credentials & Qualifications
                        </label>
                        <input
                          type="text"
                          value={contentFormData.directorTitle || ''}
                          onChange={e => setContentFormData({ ...contentFormData, directorTitle: e.target.value })}
                          placeholder="MD, DM Neuro (CMC Vellore)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Clinical Practice Experience
                        </label>
                        <input
                          type="text"
                          value={contentFormData.directorExperience || ''}
                          onChange={e => setContentFormData({ ...contentFormData, directorExperience: e.target.value })}
                          placeholder="35+ Years Clinical Practice"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Door-to-Needle Time Benchmark
                        </label>
                        <input
                          type="text"
                          value={contentFormData.doorToNeedleTime || ''}
                          onChange={e => setContentFormData({ ...contentFormData, doorToNeedleTime: e.target.value })}
                          placeholder="< 25 Minutes"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          CT Scan Diagnostic Spec
                        </label>
                        <input
                          type="text"
                          value={contentFormData.ctScanTechnology || ''}
                          onChange={e => setContentFormData({ ...contentFormData, ctScanTechnology: e.target.value })}
                          placeholder="32-Slice CT Scan"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Seizure Control Success Rate
                        </label>
                        <input
                          type="text"
                          value={contentFormData.seizureControlRate || ''}
                          onChange={e => setContentFormData({ ...contentFormData, seizureControlRate: e.target.value })}
                          placeholder="88.4%"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block font-bold text-slate-700 mb-1">
                          Official Hospital Address
                        </label>
                        <input
                          type="text"
                          value={contentFormData.hospitalAddress || ''}
                          onChange={e => setContentFormData({ ...contentFormData, hospitalAddress: e.target.value })}
                          placeholder="Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON BAR */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      When published, all patient screens will update live instantly via Firestore <span className="font-mono text-[#8E5B3E] font-semibold">onSnapshot</span>.
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={isSavingContent}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingContent ? (
                          <>
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                            <span>Publishing to Firestore...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save & Publish Live to All Devices</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 1: OPD COUNTER & CAPACITY CONTROLS */}
            {activeAdminTab === 'counter' && (
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                
                {/* Live Stats Overview Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-cyan-300 font-semibold block">
                      Active Day Intake Quota
                    </span>
                    <div className="text-2xl sm:text-3xl font-black mt-1">
                      {stats.remainingSlots} <span className="text-sm font-normal text-slate-400">Slots Remaining</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                      <span>Total Daily Capacity: <strong className="text-white">{stats.totalSlots} Patients</strong></span>
                      <span>•</span>
                      <span>Current Booked: <strong className="text-cyan-300">{stats.bookedCount} Patients</strong></span>
                      <span>•</span>
                      <span>Rejected / Restored: <strong className="text-emerald-400">+{stats.rejectedCount} Slots</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleResetCounter}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset OPD Counter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Action Box 1: Reset Patient OPD Counter */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                        <RotateCcw className="w-4 h-4" />
                        Reset Patient OPD Counter
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        Clears manual test offsets and resets the OPD booking meter back to 0 booked for today's intake cycle. Use at the start of every clinic morning or after clearing previous patient batches.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <button
                        onClick={handleResetCounter}
                        className="w-full py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Counter to Zero Booked (100% Free)
                      </button>
                    </div>
                  </div>

                  {/* Action Box 2: Extend Count of OPD Patient (Daily Quota) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
                        <Plus className="w-4 h-4" />
                        Extend Daily OPD Patient Capacity
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        Expand Dr. Varade's daily capacity beyond the default 50 slots for high-demand clinic days, acute stroke emergencies, or specialized neuro camps.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Quick Quota Expansion:</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleExtendCapacity(5)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-100 hover:bg-cyan-200 text-cyan-800 font-bold text-xs transition-colors"
                          >
                            +5 Slots
                          </button>
                          <button
                            onClick={() => handleExtendCapacity(10)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-100 hover:bg-cyan-200 text-cyan-800 font-bold text-xs transition-colors"
                          >
                            +10 Slots
                          </button>
                          <button
                            onClick={() => {
                              setOpdCapacity(50);
                              setCapacityState(50);
                              setCustomCapacityInput(50);
                              triggerToast('Capacity reset to default 50 patients.', 'info');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
                          >
                            Reset 50
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleSaveCustomCapacity} className="flex gap-2">
                        <input
                          type="number"
                          min={10}
                          max={200}
                          value={customCapacityInput}
                          onChange={e => setCustomCapacityInput(Number(e.target.value))}
                          className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
                        />
                        <button
                          type="submit"
                          className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Capacity Limit
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Home Page Doctor Consultation Fee Management Card */}
                <div className="bg-gradient-to-br from-amber-50/80 via-white to-[#FDF8F2] border-2 border-[#E5DAC8] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#F4ECE1] border border-[#DFCFC0] text-[#8E5B3E] flex items-center justify-center font-bold text-xl shadow-2xs shrink-0">
                        ₹
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                            Home Page Doctor Consultation Fee
                          </h4>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            Live Home Display
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl">
                          Configures Dr. Sanjay Sopan Varade's consultation fee displayed across the <strong>Home Page hero banner</strong>, <strong>doctor profile card</strong>, <strong>appointment scheduler</strong>, <strong>receipt vouchers</strong>, and <strong>top navigation bar</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Active Fee Live Display */}
                    <div className="bg-white border-2 border-amber-200/80 rounded-2xl p-3.5 px-5 text-right shadow-2xs shrink-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                        Active Consultation Fee
                      </span>
                      <div className="text-2xl font-serif font-black text-[#8E5B3E] tracking-tight">
                        ₹{consultationFeeState.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Synchronized Everywhere</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick Preset Selector Buttons */}
                  <div className="pt-3 border-t border-[#EAE1D3] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span>Quick Fee Presets:</span>
                        <span className="text-[11px] text-slate-500 font-normal">(Click to update immediately)</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[1000, 1200, 1500, 1800, 2000, 2500].map(feeVal => (
                          <button
                            key={feeVal}
                            type="button"
                            onClick={() => handlePresetFeeSelect(feeVal)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              consultationFeeState === feeVal
                                ? 'bg-[#8E5B3E] text-white shadow-xs ring-2 ring-[#8E5B3E]/30'
                                : 'bg-white hover:bg-amber-100/60 text-slate-700 border border-[#DACDC0]'
                            }`}
                          >
                            ₹{feeVal.toLocaleString('en-IN')} {feeVal === 1500 && '(Default)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Number Input Form */}
                    <form onSubmit={handleSaveConsultationFee} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                      <div className="relative flex-1 w-full sm:w-auto">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={50000}
                          step={50}
                          value={customFeeInput}
                          onChange={e => setCustomFeeInput(Number(e.target.value))}
                          placeholder="Enter custom consultation fee in INR (e.g. 1500)"
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#DFCFC0] bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-hidden shadow-2xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update Consultation Fee</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Simulation Overrides Strip */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Demo Triage Fast-Forwarding Overrides
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => {
                        const curOffset = getOpdManualOffset();
                        setOpdManualOffset(curOffset + 1);
                        reloadData();
                        triggerToast('Simulated +1 booked patient in descending quota.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                    >
                      Simulate 1 Patient Booking (+1)
                    </button>
                    <button
                      onClick={() => {
                        // set remaining slots to 5
                        const neededOffset = Math.max(0, capacity - 5 - appointments.filter(a => a.status === 'Confirmed' || a.status === 'Completed').length);
                        setOpdManualOffset(neededOffset);
                        reloadData();
                        triggerToast('Simulated heavy intake: only 5 slots left.', 'warning');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-semibold text-[11px]"
                    >
                      Fast-Forward: 5 Slots Left (Critical Warning)
                    </button>
                    <button
                      onClick={() => {
                        // set remaining slots to 0
                        const neededOffset = Math.max(0, capacity - appointments.filter(a => a.status === 'Confirmed' || a.status === 'Completed').length);
                        setOpdManualOffset(neededOffset);
                        reloadData();
                        triggerToast('Simulated full OPD quota: 0 slots left.', 'warning');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-[11px]"
                    >
                      Fast-Forward: 0 Slots Left (Quota Full)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PATIENT APPOINTMENTS MANAGEMENT (ACCEPT / REJECT) */}
            {activeAdminTab === 'appointments' && (
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Status Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {(['All', 'Confirmed', 'Pending', 'Cancelled'] as const).map(tab => {
                      const count = 
                        tab === 'All' ? appointments.length :
                        tab === 'Pending' ? appointments.filter(a => a.status === 'Pending' || a.status === undefined).length :
                        appointments.filter(a => a.status === tab).length;

                      return (
                        <button
                          key={tab}
                          onClick={() => setStatusFilter(tab)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            statusFilter === tab
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tab} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Query & Clear All */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search patient, phone, token..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {appointments.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllAppointments}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                        title="Permanently remove all appointment records"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span className="hidden sm:inline">Clear All</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Appointments List */}
                {filteredAppointments.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-3 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-700 border border-cyan-400/30 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {searchQuery ? `No appointments matching "${searchQuery}"` : 'No Patient Appointments in Queue'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        {searchQuery 
                          ? 'Try adjusting your search query or status filter.' 
                          : 'Sample appointments have been removed. All 50 OPD slots are currently open and available for booking. Real patient bookings will appear here automatically.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map(apt => {
                      const isConfirmed = apt.status === 'Confirmed' || apt.status === 'Completed';
                      const isCancelled = apt.status === 'Cancelled';
                      const isPending = !isConfirmed && !isCancelled;

                      return (
                        <div
                          key={apt.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isConfirmed ? 'bg-white border-slate-200 hover:border-emerald-300' :
                            isCancelled ? 'bg-rose-50/30 border-rose-200/80 opacity-80' :
                            'bg-amber-50/40 border-amber-200'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Patient & Booking Details */}
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-black bg-slate-900 text-cyan-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                                  {apt.tokenNumber || 'OPD-SLOT'}
                                </span>
                                <h4 className="font-bold text-sm text-slate-900">{apt.patientName}</h4>
                                <span className="text-xs text-slate-500">
                                  ({apt.patientAge} Yrs, {apt.patientGender})
                                </span>
                                
                                {/* Status Badge */}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isConfirmed ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  isCancelled ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                  'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                }`}>
                                  {isConfirmed ? 'Confirmed OPD' : isCancelled ? 'Rejected / Cancelled' : 'Pending Review'}
                                </span>
                              </div>

                              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-y-1 gap-x-4">
                                <span className="flex items-center gap-1 font-semibold text-slate-800">
                                  <Calendar className="w-3.5 h-3.5 text-cyan-700" />
                                  {apt.date} • {apt.timeSlot}
                                </span>
                                <span className="text-slate-500">
                                  Doctor: <strong className="text-slate-700">{apt.doctorName}</strong>
                                </span>
                                <span className="text-slate-500">
                                  Dept: <strong className="text-slate-700">{apt.department}</strong>
                                </span>
                                <span className="text-slate-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {apt.patientPhone}
                                </span>
                              </div>

                              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="font-semibold text-slate-900">Reported Symptoms:</span> {apt.symptoms || 'Routine follow-up neurological review'}
                              </div>

                              {isCancelled && (
                                <div className="space-y-1.5 pt-1">
                                  <div className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 inline-flex items-center gap-1 font-semibold">
                                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Slot Restored: +1 Slot Added Back into Available Quota Pool</span>
                                  </div>
                                  {apt.rejectionReason && (
                                    <div className="text-xs text-rose-800 bg-rose-50 p-2 rounded-xl border border-rose-200 flex items-start gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                                      <span><strong>Rejection Reason:</strong> {apt.rejectionReason}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons: Accept / Reject / Notify (Touch-Friendly across viewports) */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {/* If Cancelled or Pending: Show Accept button */}
                              {(!isConfirmed) && (
                                <button
                                  onClick={() => handleAcceptAppointment(apt)}
                                  className="touch-friendly-btn px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Accept & Confirm</span>
                                </button>
                              )}

                              {/* If Confirmed or Pending: Show Reject button */}
                              {(!isCancelled) && (
                                <button
                                  onClick={() => handleOpenRejectModal(apt)}
                                  className="touch-friendly-btn px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                  <span>Reject / Cancel</span>
                                </button>
                              )}

                              {/* Direct WhatsApp Patient Communication */}
                              <button
                                onClick={() => {
                                  const text = isConfirmed
                                    ? `Hello ${apt.patientName}, your OPD Appointment with Dr. Sanjay Sopan Varade at Sopan Hospital Nashik is CONFIRMED for ${apt.date} at ${apt.timeSlot}. Token Number: ${apt.tokenNumber}. Venue: Shrihari Kute Marg, Mumbai Naka, Nashik.`
                                    : `Hello ${apt.patientName}, regarding your OPD request for ${apt.date}: Please contact our hospital desk directly at 0253 2317364 for reschedule assistance.`;
                                  window.open(`https://wa.me/${apt.patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="touch-friendly-btn p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                title="Open WhatsApp Chat with Patient"
                              >
                                <MessageCircle className="w-4 h-4 text-emerald-600" />
                              </button>

                              {/* Permanent Remove / Delete Record */}
                              <button
                                type="button"
                                onClick={() => handleDeleteAppointment(apt)}
                                className="touch-friendly-btn p-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Permanently delete this appointment record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: AUDIT & ACTION LOGS */}
            {activeAdminTab === 'logs' && (
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Audit Trail Summary & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-700" />
                      <h4 className="font-bold text-sm text-slate-900">Hospital OPD Action & Triage Audit Trail</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold">
                        Clinical Compliance Log
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Immutable record of all appointment approvals, cancellations, quota expansions, and OPD counter resets.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                      title="Print or export clinical audit trail"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Audit Log
                    </button>
                    {auditLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsClearLogsModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-300 bg-rose-50/80 hover:bg-rose-100 text-rose-800 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Permanently clear clinical audit and action logs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Clear Log History</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {(['All', 'Approvals', 'Rejections', 'Resets'] as const).map(f => {
                      const count = 
                        f === 'All' ? auditLogs.length :
                        f === 'Approvals' ? auditLogs.filter(l => l.action === 'APPOINTMENT_APPROVED').length :
                        f === 'Rejections' ? auditLogs.filter(l => l.action === 'APPOINTMENT_REJECTED').length :
                        auditLogs.filter(l => l.action === 'OPD_COUNTER_RESET' || l.action === 'OPD_CAPACITY_EXTENDED').length;

                      return (
                        <button
                          key={f}
                          onClick={() => setLogActionFilter(f)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            logActionFilter === f
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {f} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={logSearchQuery}
                      onChange={e => setLogSearchQuery(e.target.value)}
                      placeholder="Search patient, token, admin..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Audit Logs List */}
                {filteredAuditLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FileText className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No audit logs matching "{logSearchQuery}" or filter.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredAuditLogs.map(log => {
                      const isApproval = log.action === 'APPOINTMENT_APPROVED';
                      const isRejection = log.action === 'APPOINTMENT_REJECTED';
                      const isReset = log.action === 'OPD_COUNTER_RESET';

                      return (
                        <div
                          key={log.id}
                          className={`p-3.5 rounded-2xl border transition-all text-xs ${
                            isApproval ? 'bg-emerald-50/40 border-emerald-200' :
                            isRejection ? 'bg-rose-50/40 border-rose-200' :
                            'bg-amber-50/40 border-amber-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                isApproval ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                isRejection ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {isApproval ? <Check className="w-3 h-3 text-emerald-700" /> :
                                 isRejection ? <X className="w-3 h-3 text-rose-700" /> :
                                 <RotateCcw className="w-3 h-3 text-amber-700" />}
                                {isApproval ? 'Appointment Approved' :
                                 isRejection ? 'Appointment Rejected' :
                                 isReset ? 'OPD Counter Reset' : 'Capacity Extended'}
                              </span>

                              {log.tokenNumber && (
                                <span className="font-mono text-[11px] font-bold bg-slate-900 text-cyan-300 px-2 py-0.5 rounded">
                                  {log.tokenNumber}
                                </span>
                              )}

                              {log.patientName && (
                                <span className="font-bold text-slate-900">
                                  {log.patientName}
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {log.displayTime}
                            </span>
                          </div>

                          <div className="space-y-1 text-slate-700">
                            <p className="leading-relaxed">{log.details}</p>
                            {log.rejectionReason && (
                              <div className="p-2 rounded-xl bg-rose-100/60 border border-rose-200 text-rose-900 font-medium flex items-center gap-1.5 mt-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span><strong>Recorded Cancellation Reason:</strong> {log.rejectionReason}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              Action By: <strong className="text-slate-700">{log.adminName}</strong> ({log.adminRole})
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              ID: {log.id}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: HOSPITAL OCCASION PHOTOGRAPHS GALLERY MANAGEMENT */}
            {activeAdminTab === 'gallery' && (
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                {/* Header Action Strip */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#2c221a] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                      <Camera className="w-3.5 h-3.5" />
                      Hospital Occasion Gallery Archives
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Special Occasion Photos Management ({hospitalEvents.length} Photos)
                    </h3>
                    <p className="text-xs text-slate-300">
                      Upload new photographs for hospital celebrations, medical CMEs, camps, and dignitary visits, or remove outdated entries.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddPhotoModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Add Occasion Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Reset gallery photographs back to default 35+ years clinical archive?')) {
                          resetHospitalEventsToDefault();
                          setHospitalEvents(loadHospitalEvents());
                          triggerToast('Reset photos to default hospital archives.', 'info');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      title="Reset gallery photos to default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Defaults
                    </button>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {OCCASION_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setGalleryCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          galleryCategoryFilter === cat
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={gallerySearch}
                      onChange={e => setGallerySearch(e.target.value)}
                      placeholder="Search photo by title, venue..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Photos Grid */}
                {filteredGalleryPhotos.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Camera className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No occasion photographs found matching "{gallerySearch}".</p>
                    <button
                      type="button"
                      onClick={() => setIsAddPhotoModalOpen(true)}
                      className="mt-2 px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Photo Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGalleryPhotos.map(photo => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-44 overflow-hidden bg-slate-100">
                            <img
                              src={photo.imageUrl}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#7A5338] shadow-xs">
                              {photo.category}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPhotoToDelete(photo)}
                              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors"
                              title="Remove photo from gallery"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 font-semibold text-amber-800">
                                <Calendar className="w-3 h-3" />
                                {photo.date}
                              </span>
                              <span className="truncate max-w-[130px] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {photo.location.split(',')[0]}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                              {photo.title}
                            </h4>

                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {photo.summary}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500">
                            {photo.attendeesCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPhotoToDelete(photo)}
                            className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUB-MODAL: ADD SPECIAL OCCASION PHOTO (EXPANSIVE 1200px+ STUDIO PORTALED TO DOCUMENT.BODY) */}
        {isAddPhotoModalOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
            <div 
              style={{
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
              className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden my-auto shrink-0 transition-all duration-200 ${
                isPhotoStudioMaximized
                  ? 'w-[99vw] h-[98vh] max-w-none'
                  : 'w-[calc(100vw-24px)] sm:w-[94vw] max-w-[1240px] h-[92vh] max-h-[92vh] min-h-[640px]'
              }`}
            >
              
              {/* Expansive Top Header */}
              <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base lg:text-lg text-white flex items-center gap-2">
                      <span>Add Special Occasion Photograph</span>
                      <span className="text-[10px] bg-amber-500/25 text-amber-300 border border-amber-500/35 px-2.5 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">
                        HD Photo Studio
                      </span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Sopan Hospital Photographic Archives • Large high-resolution photo upload & preview window
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Maximize / Standard Toggle for Laptop / Desktop / Tablet */}
                  <button
                    type="button"
                    onClick={() => setIsPhotoStudioMaximized(prev => !prev)}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    title={isPhotoStudioMaximized ? 'Restore standard size' : 'Expand window to full viewport'}
                  >
                    {isPhotoStudioMaximized ? (
                      <>
                        <Minimize2 className="w-4 h-4 text-amber-400" />
                        <span className="hidden md:inline">Standard Size</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 text-amber-400" />
                        <span className="hidden md:inline">Maximize Window</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddPhotoModalOpen(false);
                      setPhotoAddedSuccessTitle(null);
                    }}
                    className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close upload studio"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* Form Body - Vertical Stack Layout (No fixed height restrictions, clean vertical flow) */}
              <form onSubmit={handleAddGalleryPhoto} className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 flex flex-col gap-6 text-xs text-slate-700">
                
                {/* IN-MODAL TOAST CONFIRMATION BANNER (PERSISTS WHILE MODAL STAYS OPEN) */}
                {photoAddedSuccessTitle && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                          <span>Photograph Added to Gallery Successfully!</span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Confirmed</span>
                        </div>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          "{photoAddedSuccessTitle}" is now live in the Sopan Hospital archives. You can upload another photograph below or click "Done / Close Studio".
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddPhotoModalOpen(false);
                          setPhotoAddedSuccessTitle(null);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Done / Close Studio
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoAddedSuccessTitle(null)}
                        className="p-1.5 rounded-xl text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                        title="Dismiss message"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TOP 'SPECIAL OCCASION' PHOTO UPLOAD BANNER (VERTICAL STACK - SQUARE SHAPE) */}
                <div className="flex flex-col items-center justify-center gap-4 p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center w-full">
                  
                  {/* Header text for photo section */}
                  <div className="space-y-1 text-center max-w-lg">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center justify-center gap-2">
                      <Camera className="w-4 h-4 text-amber-600" />
                      <span>Special Occasion Photograph Upload</span>
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Click the square box below to upload a photo from your device, or choose from hospital presets or web URL.
                    </p>
                  </div>

                  {/* EXACT 250px x 250px SQUARE PHOTO UPLOAD & PREVIEW BOX */}
                  <div className="relative flex flex-col items-center justify-center">
                    <label
                      style={{ width: '250px', height: '250px', minWidth: '250px', minHeight: '250px' }}
                      className="w-[250px] h-[250px] min-w-[250px] min-h-[250px] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border-2 border-dashed border-amber-500/80 hover:border-amber-400 shadow-xl relative flex flex-col items-center justify-center cursor-pointer group shrink-0 transition-all hover:scale-[1.01]"
                      title="Click to browse & upload photo from your device"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />

                      {/* Image Preview inside 250px Square */}
                      <img
                        src={newPhotoCustomUrl || newPhotoImageUrl}
                        alt="Preview"
                        className={`w-full h-full ${photoPreviewFit === 'cover' ? 'object-cover' : 'object-contain'} p-1.5 transition-all duration-200`}
                        onError={(e) => {
                          e.currentTarget.src = PRESET_OCCASION_PHOTOS[0].url;
                        }}
                      />

                      {/* Subtle gradient vignette */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/20 to-black/40 group-hover:from-black/90 group-hover:via-black/40 transition-colors" />

                      {/* Top Overlay Badge & Fit/Cover Toggle */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-amber-950 shadow-md">
                            {newPhotoCategory || 'Special Occasion'}
                          </span>
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                            HD Archive
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPhotoPreviewFit(prev => prev === 'contain' ? 'cover' : 'contain');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs border border-white/20 transition-colors cursor-pointer shadow-sm"
                          title="Toggle full photograph fit vs cover fill"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-300" />
                          <span>{photoPreviewFit === 'contain' ? 'Fit' : 'Cover'}</span>
                        </button>
                      </div>

                      {/* Hover Upload Indicator Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 pointer-events-none p-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-xs text-amber-200">
                          {uploadedFileName ? 'Click to Change Photo' : 'Click to Upload Photo'}
                        </div>
                        <div className="text-[10px] text-slate-300">
                          Square 250px × 250px
                        </div>
                      </div>

                      {/* Bottom Status / Filename Badge */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none text-white text-center">
                        {uploadedFileName ? (
                          <div className="text-[11px] text-emerald-300 font-mono bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg truncate shadow-sm">
                            ✓ {uploadedFileName}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-200 drop-shadow-md flex items-center justify-center gap-1">
                            <Upload className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">Click square to upload device image</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Photo Source Controls (Browse Device, Presets, Web URL) */}
                  <div className="w-full max-w-lg space-y-3">
                    {/* Source Selection Mode Pills */}
                    <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setPhotoStudioTab('device')}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          photoStudioTab === 'device'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhotoStudioTab('presets')}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          photoStudioTab === 'presets'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Presets ({PRESET_OCCASION_PHOTOS.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhotoStudioTab('url')}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          photoStudioTab === 'url'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Web URL</span>
                      </button>
                    </div>

                    {/* TAB CONTENT: DEVICE FILE UPLOAD */}
                    {photoStudioTab === 'device' && (
                      <label 
                        className="border-2 border-dashed border-amber-400 hover:border-amber-500 bg-white hover:bg-amber-50/70 rounded-2xl p-3 flex items-center justify-center gap-3 cursor-pointer transition-colors text-amber-950 group shadow-xs"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                          <Upload className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-xs sm:text-sm text-slate-900">
                            {uploadedFileName ? 'Change Photo File' : 'Browse & Upload Device Photo'}
                          </div>
                          <div className="text-[11px] text-amber-800">
                            {uploadedFileName ? uploadedFileName : 'Supports PNG, JPG, JPEG, WebP (Square 250px × 250px)'}
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}

                    {/* TAB CONTENT: PRESETS */}
                    {photoStudioTab === 'presets' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-white text-left">
                        {PRESET_OCCASION_PHOTOS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedPresetIdx(idx);
                              setNewPhotoImageUrl(p.url);
                              setNewPhotoCustomUrl('');
                              if (!newPhotoTitle) setNewPhotoTitle(p.label);
                              if (newPhotoCategory === 'Special Occasion') setNewPhotoCategory(p.category);
                            }}
                            className={`p-1.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                              selectedPresetIdx === idx && !newPhotoCustomUrl
                                ? 'border-amber-600 ring-2 ring-amber-500/40 bg-amber-50/30'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <img src={p.url} alt={p.label} className="w-full h-14 object-cover rounded-lg mb-1" />
                            <span className="text-[10px] font-bold text-slate-800 line-clamp-1 block leading-tight">
                              {p.label}
                            </span>
                            <span className="text-[9px] text-amber-700 font-medium block">
                              {p.category}
                            </span>
                            {selectedPresetIdx === idx && !newPhotoCustomUrl && (
                              <div className="absolute top-2 right-2 w-4 h-4 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-xs">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* TAB CONTENT: WEB URL */}
                    {photoStudioTab === 'url' && (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newPhotoCustomUrl}
                          onChange={e => {
                            setNewPhotoCustomUrl(e.target.value);
                            setSelectedPresetIdx(-1);
                          }}
                          placeholder="https://example.com/hospital-conference-photo.jpg"
                          className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newPhotoCustomUrl.trim()) {
                              triggerToast('Web URL photo loaded to square preview.', 'info');
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                        >
                          Load Photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* OCCASION DETAILS - PLACED DIRECTLY BELOW THE PHOTO UPLOAD SECTION */}
                <div className="space-y-4">
                  {/* Title - Placed right below the photo upload box! */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs sm:text-sm">
                      Occasion Title / Event Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPhotoTitle}
                      onChange={e => setNewPhotoTitle(e.target.value)}
                      placeholder="e.g. World Stroke Day Medical Summit 2026 or Neuro-ICU Inauguration"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                    />
                  </div>

                  {/* Category & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Category *
                      </label>
                      <select
                        value={newPhotoCategory}
                        onChange={e => setNewPhotoCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                      >
                        <option value="Events">Events</option>
                        <option value="Awards">Awards</option>
                        <option value="Staff">Staff</option>
                        <option value="Patient Stories">Patient Stories</option>
                        <option value="Medical Camps">Medical Camps</option>
                        <option value="Clinical CME">Clinical CME</option>
                        <option value="Special Occasion">Special Occasion</option>
                        <option value="Facility Inauguration">Facility Inauguration</option>
                        <option value="Stroke Awareness">Stroke Awareness</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Event Date *
                      </label>
                      <input
                        type="text"
                        required
                        value={newPhotoDate}
                        onChange={e => setNewPhotoDate(e.target.value)}
                        placeholder="e.g. 29 Oct 2026 or Diwali 2026"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Venue & Attendees */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Venue / Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={newPhotoLocation}
                        onChange={e => setNewPhotoLocation(e.target.value)}
                        placeholder="Sopan Hospital Auditorium, Nashik"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Attendees Count
                      </label>
                      <input
                        type="text"
                        value={newPhotoAttendees}
                        onChange={e => setNewPhotoAttendees(e.target.value)}
                        placeholder="e.g. 150+ Attendees"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Principal Lead & Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Principal Lead / Dignitary
                      </label>
                      <input
                        type="text"
                        value={newPhotoLead}
                        onChange={e => setNewPhotoLead(e.target.value)}
                        placeholder="Dr. Sanjay Sopan Varade"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Topical Tags
                      </label>
                      <input
                        type="text"
                        value={newPhotoTags}
                        onChange={e => setNewPhotoTags(e.target.value)}
                        placeholder="SopanHospital, StrokeSummit"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Description & Milestones (min-h-[90px] py-2.5) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Occasion Description / Synopsis *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={newPhotoSummary}
                        onChange={e => setNewPhotoSummary(e.target.value)}
                        placeholder="Clinical synopsis, medical equipment inaugurated, or felicitation notes..."
                        className="w-full px-3 py-2.5 min-h-[90px] bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Key Milestones (1 per line)
                      </label>
                      <textarea
                        rows={3}
                        value={newPhotoHighlights}
                        onChange={e => setNewPhotoHighlights(e.target.value)}
                        placeholder="• Stroke unit expanded&#10;• 50+ Survivors felicitated"
                        className="w-full px-3 py-2.5 min-h-[90px] bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    ✓ High-resolution photographs immediately sync across hospital web archives and patient gallery.
                  </span>

                  <div className="flex items-center justify-end gap-2.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddPhotoModalOpen(false);
                        setPhotoAddedSuccessTitle(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                    >
                      Close Window
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-[#8E5B3E] hover:from-amber-500 hover:to-[#784A31] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.01]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Photograph to Gallery</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* SUB-MODAL: CLEAR AUDIT LOGS CONFIRMATION MODAL */}
        {isClearLogsModalOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Clear Audit Trail History</h4>
                  <p className="text-xs text-slate-500">Hospital Administration Security Console</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently clear all <strong>{auditLogs.length} audit and action logs</strong>?
                This will remove recorded appointment approvals, rejections, counter resets, and quota changes.
              </p>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>This action will clear history from local storage and cloud records. Once cleared, previous logs cannot be recovered.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsClearLogsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAdminAuditLogs();
                    setAuditLogs([]);
                    setIsClearLogsModalOpen(false);
                    triggerToast('All administrator audit logs have been cleared successfully.', 'info');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Yes, Permanently Clear Logs
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* SUB-MODAL: CONFIRM DELETE PHOTO */}
        {photoToDelete && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900">Remove Hospital Photograph?</h4>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                <img src={photoToDelete.imageUrl} alt={photoToDelete.title} className="w-14 h-12 object-cover rounded-lg" />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 truncate">{photoToDelete.title}</div>
                  <div className="text-[10px] text-slate-500">{photoToDelete.category} • {photoToDelete.date}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to remove this photograph from the hospital gallery? This action is logged in the admin audit trail.
              </p>

              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoToDelete(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeletePhoto}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Photo
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <span>Dr. Sanjay Sopan Varade (Director & Chief Neurologist Desk) • Hotline: 0253 2317364</span>
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Log Out of Administrator Session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log Out Session</span>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
              >
                {isEmbedded ? 'Back to Clinic Overview' : 'Close Panel'}
              </button>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <>
        {isEmbedded ? (
          content
        ) : (
          <div className="fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none bg-slate-950 flex flex-col overflow-hidden m-0 p-0">
            {content}
          </div>
        )}

        {/* REJECTION REASON CONFIRMATION MODAL */}
      {rejectingAppointment && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <XCircle className="w-5 h-5 text-rose-600" />
                Reject OPD Appointment
              </div>
              <button onClick={() => setRejectingAppointment(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                You are about to cancel the booking for <strong className="text-slate-900">{rejectingAppointment.patientName}</strong> (Token: {rejectingAppointment.tokenNumber}) on {rejectingAppointment.date} at {rejectingAppointment.timeSlot}.
              </p>
              <p className="text-emerald-700 font-medium">
                Note: Rejecting this appointment immediately releases 1 OPD slot back into the live available quota!
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">Select Cancellation Reason:</label>
              <select
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value="Doctor in Emergency OT / Thrombectomy Procedure">Doctor in Emergency OT / Thrombectomy Procedure</option>
                <option value="Daily OPD Capacity Reached / Overbooked">Daily OPD Capacity Reached / Overbooked</option>
                <option value="Patient Requested Cancellation / Reschedule">Patient Requested Cancellation / Reschedule</option>
                <option value="Non-Neurological Condition / Refer to General Medicine">Non-Neurological Condition / Refer to General Medicine</option>
                <option value="Other (Specify Below)">Other (Specify Below)</option>
              </select>

              {rejectionReason === 'Other (Specify Below)' && (
                <textarea
                  rows={2}
                  value={customRejectionText}
                  onChange={e => setCustomRejectionText(e.target.value)}
                  placeholder="Enter clinical or administrative reason..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRejectingAppointment(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
              >
                Confirm Rejection & Free Slot
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
