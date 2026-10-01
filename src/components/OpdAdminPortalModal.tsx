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
  ArrowRight
} from 'lucide-react';
import { Appointment } from '../types';
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
  updateAppointmentStatus 
} from '../utils/opdSlotUtils';

interface OpdAdminPortalModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAppointmentsUpdated?: () => void;
  isEmbedded?: boolean;
}

export const OpdAdminPortalModal: React.FC<OpdAdminPortalModalProps> = ({
  isOpen = false,
  onClose,
  onAppointmentsUpdated,
  isEmbedded = false
}) => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAdminLoggedIn());
  const [adminUser, setAdminUser] = useState(() => getAdminSession());
  const [usernameInput, setUsernameInput] = useState<string>('admin@sopanhospital.com');
  const [passwordInput, setPasswordInput] = useState<string>('admin123');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin View Tab
  const [activeAdminTab, setActiveAdminTab] = useState<'counter' | 'appointments'>('counter');

  // Appointments & Slot Stats
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadOpdAppointments());
  const [capacity, setCapacityState] = useState<number>(() => getOpdCapacity());
  const [customCapacityInput, setCustomCapacityInput] = useState<number>(() => getOpdCapacity());
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Rejection modal sub-state
  const [rejectingAppointment, setRejectingAppointment] = useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Doctor in Emergency OT / Thrombectomy Procedure');
  const [customRejectionText, setCustomRejectionText] = useState<string>('');

  // Notification feedback toast
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);

  // Sync appointments from storage
  const reloadData = () => {
    const loadedApts = loadOpdAppointments();
    setAppointments(loadedApts);
    const curCap = getOpdCapacity();
    setCapacityState(curCap);
    setCustomCapacityInput(curCap);
    setIsLoggedIn(isAdminLoggedIn());
    setAdminUser(getAdminSession());
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSync = () => reloadData();
    window.addEventListener('sopan_opd_quota_updated', handleSync);
    window.addEventListener('sopan_admin_session_changed', handleSync);
    return () => {
      window.removeEventListener('sopan_opd_quota_updated', handleSync);
      window.removeEventListener('sopan_admin_session_changed', handleSync);
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

    // Standard hospital admin credentials or PIN 2317
    if (
      (cleanUser.includes('admin') || cleanUser.includes('sopan') || cleanUser.includes('varade')) &&
      (cleanPass === 'admin123' || cleanPass === '2317' || cleanPass === 'sopan2026')
    ) {
      const session = {
        username: 'OPD Desk Chief Administrator',
        role: 'Hospital OPD & Triage Director',
        email: cleanUser,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAdminSession(session);
      setIsLoggedIn(true);
      setAdminUser(session);
      setAuthError(null);
      triggerToast('Welcome, Administrator. OPD Desk controls unlocked.', 'success');
    } else {
      setAuthError('Invalid credentials. Use demo: admin@sopanhospital.com / admin123 or PIN: 2317');
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
    triggerToast('Quick demo admin login successful.', 'success');
  };

  const handleLogout = () => {
    setAdminSession(null);
    setIsLoggedIn(false);
    setAdminUser(null);
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

  // --- ACTIONS: ACCEPT & REJECT APPOINTMENTS ---

  const handleAcceptAppointment = (apt: Appointment) => {
    const updated = updateAppointmentStatus(apt.id, 'Confirmed', undefined, adminUser?.username || 'OPD Desk Admin');
    setAppointments(updated);
    triggerToast(`Appointment for ${apt.patientName} (Token: ${apt.tokenNumber}) accepted & confirmed.`, 'success');
    onAppointmentsUpdated?.();
  };

  const handleOpenRejectModal = (apt: Appointment) => {
    setRejectingAppointment(apt);
    setRejectionReason('Doctor in Emergency OT / Thrombectomy Procedure');
    setCustomRejectionText('');
  };

  const handleConfirmReject = () => {
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

  if (!isEmbedded && !isOpen) return null;

  const content = (
    <div className={`bg-white rounded-3xl w-full flex flex-col border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 ${
      isEmbedded ? 'shadow-md border-slate-200 min-h-[640px]' : 'max-w-4xl max-h-[92vh]'
    }`}>
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg tracking-tight">OPD Administration & Capacity Control</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Hospital Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sopan Hospital & Neurology Institute • Dr. Sanjay Sopan Varade OPD Desk
            </p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
          /* Admin Login Form */
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="max-w-md mx-auto text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Hospital Staff & Administrator Log In</h4>
              <p className="text-xs text-slate-500">
                Authenticate with OPD coordination credentials to reset live patient counters, expand patient quotas, or accept/reject appointments.
              </p>
            </div>

            {authError && (
              <div className="max-w-md mx-auto p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Admin Email / Staff ID</label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="admin@sopanhospital.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password / Security PIN</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter PIN (e.g. 2317) or password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Authenticate Admin
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="w-full py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  Quick Demo Access (Director OPD Desk)
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-2">
                Demo Credentials: <span className="font-mono text-slate-600">admin@sopanhospital.com</span> / <span className="font-mono text-slate-600">admin123</span> (or PIN: <span className="font-mono text-slate-600">2317</span>)
              </div>
            </form>
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

            {/* Admin Navigation Tabs */}
            <div className="flex items-center border-b border-slate-200 bg-white px-5 pt-2 gap-2">
              <button
                onClick={() => setActiveAdminTab('counter')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  activeAdminTab === 'counter'
                    ? 'border-cyan-600 text-cyan-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                OPD Counter & Capacity Controls
              </button>

              <button
                onClick={() => setActiveAdminTab('appointments')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  activeAdminTab === 'appointments'
                    ? 'border-cyan-600 text-cyan-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Patient Appointments ({appointments.length})
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
                    <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                      <span>Total Daily Capacity: <strong className="text-white">{stats.totalSlots} Patients</strong></span>
                      <span>•</span>
                      <span>Current Booked: <strong className="text-cyan-300">{stats.bookedCount} Patients</strong></span>
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

                              {isCancelled && apt.rejectionReason && (
                                <div className="text-xs text-rose-800 bg-rose-50 p-2 rounded-xl border border-rose-200 flex items-start gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                                  <span><strong>Rejection Reason:</strong> {apt.rejectionReason}</span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons: Accept / Reject / Notify */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {/* If Cancelled or Pending: Show Accept button */}
                              {(!isConfirmed) && (
                                <button
                                  onClick={() => handleAcceptAppointment(apt)}
                                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Accept & Confirm
                                </button>
                              )}

                              {/* If Confirmed or Pending: Show Reject button */}
                              {(!isCancelled) && (
                                <button
                                  onClick={() => handleOpenRejectModal(apt)}
                                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Reject / Cancel
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
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
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
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <span>Dr. Sanjay Sopan Varade (Director & Chief Neurologist Desk) • Hotline: 0253 2317364</span>
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
    );

    return (
      <>
        {isEmbedded ? (
          content
        ) : (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
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
