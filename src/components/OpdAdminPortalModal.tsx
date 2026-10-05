import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  Plus, 
  Minus, 
  Check, 
  X, 
  AlertTriangle, 
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
  Minimize2
} from 'lucide-react';
import { Appointment, OpdAuditLog, HospitalEvent } from '../types';
import { 
  loadHospitalEvents,
  addHospitalEventPhoto,
  removeHospitalEventPhoto,
  resetHospitalEventsToDefault,
  PRESET_OCCASION_PHOTOS,
  OCCASION_CATEGORIES
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
  clearAdminAuditLogs
} from '../utils/opdSlotUtils';

interface OpdAdminPortalModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAppointmentsUpdated?: () => void;
  isEmbedded?: boolean;
  initialTab?: 'counter' | 'appointments' | 'logs' | 'gallery';
}

export const OpdAdminPortalModal: React.FC<OpdAdminPortalModalProps> = ({
  isOpen = false,
  onClose,
  onAppointmentsUpdated,
  isEmbedded = false,
  initialTab = 'counter'
}) => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAdminLoggedIn());
  const [adminUser, setAdminUser] = useState(() => getAdminSession());
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin View Tab
  const [activeAdminTab, setActiveAdminTab] = useState<'counter' | 'appointments' | 'logs' | 'gallery'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveAdminTab(initialTab);
    }
  }, [initialTab]);

  // Hospital Events Gallery State
  const [hospitalEvents, setHospitalEvents] = useState<HospitalEvent[]>(() => loadHospitalEvents());
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('All');
  const [gallerySearch, setGallerySearch] = useState<string>('');
  const [photoToDelete, setPhotoToDelete] = useState<HospitalEvent | null>(null);
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState<boolean>(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState<string>('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<string>('Special Occasion');
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

  // Sync appointments and audit logs from storage
  const reloadData = () => {
    const loadedApts = loadOpdAppointments();
    setAppointments(loadedApts);
    const curCap = getOpdCapacity();
    setCapacityState(curCap);
    setCustomCapacityInput(curCap);
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

  const handleQuickDemoLogin = () => {
    const session = {
      username: 'Dr. Sanjay Varade Clinic Desk Admin',
      role: 'Chief Neurologist Clinical Coordinator',
      email: 'admin@sopanhospital.com',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAdminSession(session);
    setIsLoggedIn(true);
    setAdminUser(session);
    setAuthError(null);
    triggerToast('One-click Administrator login successful.', 'success');
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

  // --- ACTIONS: ACCEPT & REJECT APPOINTMENTS (ADMIN ACCESS ONLY) ---

  const handleAcceptAppointment = (apt: Appointment) => {
    if (!isAdminLoggedIn()) {
      triggerToast('Security alert: Admin authentication required to accept appointments.', 'warning');
      return;
    }
    const updated = updateAppointmentStatus(apt.id, 'Confirmed', undefined, adminUser?.username || 'OPD Desk Admin');
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

  const handleConfirmReject = () => {
    if (!isAdminLoggedIn()) {
      triggerToast('Security alert: Admin authentication required to reject appointments.', 'warning');
      return;
    }
    if (!rejectingAppointment) return;
    const finalReason = rejectionReason === 'Other (Specify Below)' 
      ? (customRejectionText.trim() || 'Rescheduled by OPD Administration')
      : rejectionReason;

    const updated = updateAppointmentStatus(
      rejectingAppointment.id, 
      'Cancelled', 
      finalReason, 
      adminUser?.username || 'OPD Desk Admin'
    );
    setAppointments(updated);
    triggerToast(`Appointment for ${rejectingAppointment.patientName} rejected. Slot released back to available pool.`, 'warning');
    setRejectingAppointment(null);
    onAppointmentsUpdated?.();
  };

  // --- ACTIONS: GALLERY SPECIAL OCCASION PHOTOS ---
  const filteredGalleryPhotos = useMemo(() => {
    return hospitalEvents.filter(evt => {
      const matchesCat = galleryCategoryFilter === 'All' || evt.category === galleryCategoryFilter;
      const q = gallerySearch.toLowerCase().trim();
      const matchesSearch = !q || (
        evt.title.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.summary.toLowerCase().includes(q)
      );
      return matchesCat && matchesSearch;
    });
  }, [hospitalEvents, galleryCategoryFilter, gallerySearch]);

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      triggerToast('Please select an image smaller than 15MB.', 'warning');
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setNewPhotoImageUrl(result);
      setNewPhotoCustomUrl('');
      setSelectedPresetIdx(-1);
      triggerToast(`Photograph "${file.name}" uploaded successfully.`, 'info');
    };
    reader.readAsDataURL(file);
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
    setIsAddPhotoModalOpen(false);
    setNewPhotoTitle('');
    setNewPhotoSummary('');
    setNewPhotoHighlights('');
    setNewPhotoCustomUrl('');
    triggerToast('Hospital occasion photograph added to gallery successfully!', 'success');
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

      {/* Feedback Toast */}
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
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
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

                  {/* Search Query */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search patient, phone, token..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Appointments List */}
                {filteredAppointments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Users className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No appointments found matching "{searchQuery}" or filter.</p>
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

        {/* SUB-MODAL: ADD SPECIAL OCCASION PHOTO (EXPANSIVE 1150px WIDE STUDIO, 680px MIN-HEIGHT, 92vh MAX-HEIGHT) */}
        {isAddPhotoModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div 
              style={{
                boxSizing: 'border-box',
                flexShrink: 0,
                height: 'auto',
                minHeight: '680px',
                maxHeight: '92vh',
              }}
              className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden my-auto shrink-0 transition-all duration-200 animate-in fade-in zoom-in-95 ${
                isPhotoStudioMaximized
                  ? 'w-[99vw] h-[98vh] max-w-none'
                  : 'w-[calc(100vw-24px)] sm:w-[calc(100vw-40px)] max-w-[1150px] min-h-[680px] max-h-[92vh]'
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
                    onClick={() => setIsAddPhotoModalOpen(false)}
                    className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close upload studio"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* Form Body - Balanced 2-Column Side-by-Side (md:col-span-5 and md:col-span-7) with p-5 sm:p-6 md:p-7 */}
              <form onSubmit={handleAddGalleryPhoto} className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-7 flex flex-col text-xs text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN: LIVE PHOTO CANVAS & UPLOAD STUDIO (md:col-span-5) */}
                  <div className="md:col-span-5 space-y-4">
                    
                    {/* Live Preview Canvas - h-56 sm:h-64 md:h-72 */}
                    <div className="relative w-full h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md flex items-center justify-center group">
                      <img
                        src={newPhotoCustomUrl || newPhotoImageUrl}
                        alt="Preview"
                        className={`w-full h-full ${
                          photoPreviewFit === 'contain' ? 'object-contain p-2' : 'object-cover'
                        } transition-all duration-200`}
                        onError={(e) => {
                          e.currentTarget.src = PRESET_OCCASION_PHOTOS[0].url;
                        }}
                      />
                      
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/30" />

                      {/* Top Overlay Badge & Fit Toggle */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
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
                          onClick={() => setPhotoPreviewFit(prev => prev === 'contain' ? 'cover' : 'contain')}
                          className="px-2.5 py-1 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs border border-white/20 transition-colors cursor-pointer shadow-sm"
                          title="Toggle full photograph fit vs cover fill"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-300" />
                          <span>{photoPreviewFit === 'contain' ? 'Fit (Entire Photo)' : 'Cover (Fill)'}</span>
                        </button>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 pointer-events-none text-white flex flex-col sm:flex-row sm:items-end justify-between gap-1.5">
                        <div className="space-y-0.5">
                          <div className="text-sm sm:text-base font-bold truncate drop-shadow-md">
                            {newPhotoTitle || 'Special Occasion Photograph Preview'}
                          </div>
                          <div className="text-xs text-slate-300 font-sans truncate">
                            {newPhotoDate || 'Hospital Event Archive'} • {newPhotoLocation.split(',')[0]}
                          </div>
                        </div>

                        {uploadedFileName && (
                          <div className="text-[11px] text-emerald-300 font-mono bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-xl truncate">
                            ✓ {uploadedFileName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Source Selection Mode Pills */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setPhotoStudioTab('device')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          photoStudioTab === 'device'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload From Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhotoStudioTab('presets')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          photoStudioTab === 'presets'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Curated Presets ({PRESET_OCCASION_PHOTOS.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhotoStudioTab('url')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          photoStudioTab === 'url'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Web Image URL</span>
                      </button>
                    </div>

                    {/* TAB CONTENT: DEVICE FILE UPLOAD / BROWSE DEVICE DROPZONE (min-h-[100px] p-5 w-6 h-6 icon) */}
                    {photoStudioTab === 'device' && (
                      <div className="w-full">
                        <label 
                          className="w-full min-h-[100px] p-5 border-2 border-dashed border-amber-400 hover:border-amber-500 bg-amber-50/70 hover:bg-amber-100/90 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors text-amber-950 group shadow-xs"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <Upload className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="font-bold text-sm text-slate-900">
                            {uploadedFileName ? 'Change Photo File' : 'Click to Browse Device Photo'}
                          </div>
                          <div className="text-[11px] text-amber-800">
                            {uploadedFileName ? uploadedFileName : 'PNG, JPG, JPEG, WebP from Computer / Mobile'}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* TAB CONTENT: PRESETS (COMPACT 4-COL GRID WITH CLEAR THUMBNAILS) */}
                    {photoStudioTab === 'presets' && (
                      <div className="space-y-1.5">
                        <span className="text-xs text-slate-500 font-semibold block">
                          Click any verified hospital event photograph to set as occasion cover:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-44 sm:max-h-52 overflow-y-auto p-1 border border-slate-200 rounded-2xl bg-slate-50">
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
                                  ? 'border-amber-600 ring-2 ring-amber-500/40 bg-white shadow-xs'
                                  : 'border-slate-200 bg-white/80 hover:bg-white'
                              }`}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-14 sm:h-16 object-cover rounded-lg mb-1" />
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
                      </div>
                    )}

                    {/* TAB CONTENT: WEB URL */}
                    {photoStudioTab === 'url' && (
                      <div className="space-y-2">
                        <label className="text-xs text-slate-600 font-semibold block">
                          Direct Web Image URL:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newPhotoCustomUrl}
                            onChange={e => {
                              setNewPhotoCustomUrl(e.target.value);
                              setSelectedPresetIdx(-1);
                            }}
                            placeholder="https://example.com/hospital-conference-photo.jpg"
                            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newPhotoCustomUrl.trim()) {
                                triggerToast('Web URL photo loaded to preview.', 'info');
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            Load Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: OCCASION DETAILS (md:col-span-7) */}
                  <div className="md:col-span-7 space-y-3.5">
                    {/* Title */}
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
                          <option value="Special Occasion">Special Occasion</option>
                          <option value="Stroke Awareness">Stroke Awareness</option>
                          <option value="Clinical CME">Clinical CME</option>
                          <option value="Free Medical Camp">Free Medical Camp</option>
                          <option value="Facility Inauguration">Facility Inauguration</option>
                          <option value="Survivor Meet">Survivor Meet</option>
                          <option value="Hospital Celebration">Hospital Celebration</option>
                          <option value="Doctor Felicitation">Doctor Felicitation</option>
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
                </div>

                {/* Sticky Action Footer */}
                <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    ✓ High-resolution photographs immediately sync across hospital web archives and patient gallery.
                  </span>

                  <div className="flex items-center justify-end gap-2.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsAddPhotoModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-[#8E5B3E] hover:from-amber-500 hover:to-[#784A31] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.01]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Photograph to Gallery</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-MODAL: CLEAR AUDIT LOGS CONFIRMATION MODAL */}
        {isClearLogsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
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
          </div>
        )}

        {/* SUB-MODAL: CONFIRM DELETE PHOTO */}
        {photoToDelete && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
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
          </div>
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
      {rejectingAppointment && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
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
        </div>
      )}
    </>
  );
};
