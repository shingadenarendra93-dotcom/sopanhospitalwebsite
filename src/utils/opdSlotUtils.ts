import { Appointment, OpdAuditLog, OpdAuditActionType } from '../types';
import { INITIAL_APPOINTMENTS } from '../data/mockData';
import { saveAuditLogToFirestore } from '../lib/firebase';

export const TOTAL_OPD_DAILY_SLOTS = 50;
const STORAGE_KEY = 'sopan_hospital_opd_appointments';
const MANUAL_OVERRIDE_KEY = 'sopan_hospital_opd_manual_override';
const CAPACITY_STORAGE_KEY = 'sopan_hospital_opd_custom_capacity';
const ADMIN_SESSION_KEY = 'sopan_hospital_admin_session';
const AUDIT_LOG_STORAGE_KEY = 'sopan_hospital_opd_audit_logs';

export interface AdminUserSession {
  username: string;
  role: string;
  email: string;
  loginTime: string;
}

export interface OpdSlotStats {
  totalSlots: number;
  bookedCount: number;
  remainingSlots: number;
  percentageBooked: number;
  percentageRemaining: number;
  isFull: boolean;
  statusLabel: string;
  statusColor: 'emerald' | 'amber' | 'orange' | 'rose';
  nextSlotNumber: number;
}

/**
 * Get stored admin audit logs
 */
export function getAdminAuditLogs(): OpdAuditLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored admin audit logs
 */
export function clearAdminAuditLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUDIT_LOG_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('sopan_audit_log_added', { detail: { cleared: true } }));
  } catch (err) {
    console.error('Failed to clear audit logs:', err);
  }
}

/**
 * Adds an audit log entry for admin actions (approvals, rejections, counter resets)
 */
export function addAdminAuditLog(entry: {
  action: OpdAuditActionType;
  adminName?: string;
  adminEmail?: string;
  adminRole?: string;
  appointmentId?: string;
  patientName?: string;
  patientPhone?: string;
  tokenNumber?: string;
  date?: string;
  timeSlot?: string;
  rejectionReason?: string;
  details: string;
}): OpdAuditLog {
  const session = getAdminSession();
  const now = new Date();
  const displayTime = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const newLog: OpdAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action: entry.action,
    timestamp: now.toISOString(),
    displayTime,
    adminName: entry.adminName || session?.username || 'OPD Desk Administrator',
    adminEmail: entry.adminEmail || session?.email || 'admin@sopanhospital.com',
    adminRole: entry.adminRole || session?.role || 'Hospital Administrator',
    appointmentId: entry.appointmentId,
    patientName: entry.patientName,
    patientPhone: entry.patientPhone,
    tokenNumber: entry.tokenNumber,
    date: entry.date,
    timeSlot: entry.timeSlot,
    rejectionReason: entry.rejectionReason,
    details: entry.details
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = getAdminAuditLogs();
      const updated = [newLog, ...existing].slice(0, 100);
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sopan_audit_log_added', { detail: { log: newLog } }));
    } catch (err) {
      console.warn('Failed to save audit log to localStorage:', err);
    }
  }

  // Also persist to Firestore
  try {
    saveAuditLogToFirestore({
      action: newLog.action,
      adminName: newLog.adminName,
      adminEmail: newLog.adminEmail,
      adminRole: newLog.adminRole,
      details: newLog.details,
      appointmentId: newLog.appointmentId,
      patientName: newLog.patientName,
      patientPhone: newLog.patientPhone,
      tokenNumber: newLog.tokenNumber,
      rejectionReason: newLog.rejectionReason,
      timestamp: newLog.timestamp,
      displayTime: newLog.displayTime
    }).catch(() => {});
  } catch {
    // ignore
  }

  return newLog;
}

/**
 * Get current configured daily OPD capacity (default 50, expandable by admin).
 */
export function getOpdCapacity(): number {
  if (typeof window === 'undefined') return TOTAL_OPD_DAILY_SLOTS;
  try {
    const raw = localStorage.getItem(CAPACITY_STORAGE_KEY);
    if (!raw) return TOTAL_OPD_DAILY_SLOTS;
    const parsed = parseInt(raw, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : TOTAL_OPD_DAILY_SLOTS;
  } catch {
    return TOTAL_OPD_DAILY_SLOTS;
  }
}

/**
 * Set custom daily OPD capacity (e.g. 60, 75, 100).
 */
export function setOpdCapacity(capacity: number): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = Math.max(10, Math.min(200, capacity));
    localStorage.setItem(CAPACITY_STORAGE_KEY, String(sanitized));
    addAdminAuditLog({
      action: 'OPD_CAPACITY_EXTENDED',
      details: `Daily OPD patient intake quota updated to ${sanitized} slots/day.`
    });
    window.dispatchEvent(new CustomEvent('sopan_opd_quota_updated', { 
      detail: { customCapacity: sanitized } 
    }));
  } catch (err) {
    console.error('Failed to set OPD custom capacity:', err);
  }
}

/**
 * Resets the patient OPD counter:
 * Sets offset so booked counter is strictly 0, restoring 100% full capacity.
 */
export function resetOpdCounter(clearAppointments = false): void {
  if (typeof window === 'undefined') return;
  try {
    if (clearAppointments) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.removeItem(MANUAL_OVERRIDE_KEY);
    } else {
      const current = loadOpdAppointments();
      const bookedCount = current.filter(a => a.status === 'Confirmed' || a.status === 'Completed').length;
      localStorage.setItem(MANUAL_OVERRIDE_KEY, String(-bookedCount));
    }
    addAdminAuditLog({
      action: 'OPD_COUNTER_RESET',
      details: 'Patient OPD daily counter reset to 0 booked. Full available slot capacity restored (50/50 slots free).'
    });
    window.dispatchEvent(new CustomEvent('sopan_opd_quota_updated', { 
      detail: { resetCounter: true } 
    }));
  } catch (err) {
    console.error('Failed to reset OPD counter:', err);
  }
}

/**
 * Check if hospital admin is currently logged in.
 */
export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return Boolean(session && session.username);
  } catch {
    return false;
  }
}

/**
 * Get active admin session details.
 */
export function getAdminSession(): AdminUserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Set or clear admin session.
 */
export function setAdminSession(session: AdminUserSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      addAdminAuditLog({
        action: 'ADMIN_LOGIN',
        adminName: session.username,
        adminEmail: session.email,
        adminRole: session.role,
        details: `Administrator logged into OPD triage management console (${session.username} - ${session.email}).`
      });
    } else {
      const prevSession = getAdminSession();
      if (prevSession) {
        addAdminAuditLog({
          action: 'ADMIN_LOGOUT',
          adminName: prevSession.username,
          adminEmail: prevSession.email,
          adminRole: prevSession.role,
          details: `Administrator logged out safely (${prevSession.username}).`
        });
      }
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    window.dispatchEvent(new CustomEvent('sopan_admin_session_changed', { detail: { session } }));
  } catch (err) {
    console.error('Failed to set admin session:', err);
  }
}

/**
 * Updates appointment status (Accept as Confirmed or Reject as Cancelled).
 * Automatically produces formal audit log entries.
 */
export function updateAppointmentStatus(
  appointmentId: string,
  newStatus: 'Confirmed' | 'Cancelled' | 'Pending',
  rejectionReason?: string,
  adminName = 'Dr. Sanjay Varade Clinic Desk'
): Appointment[] {
  const current = loadOpdAppointments();
  let targetApt: Appointment | undefined;

  const updated = current.map(apt => {
    if (apt.id === appointmentId) {
      targetApt = {
        ...apt,
        status: newStatus,
        rejectionReason: newStatus === 'Cancelled' ? (rejectionReason || 'Cancelled by OPD Administration') : undefined,
        adminActionAt: new Date().toISOString(),
        adminActionBy: adminName
      };
      return targetApt;
    }
    return apt;
  });

  saveOpdAppointments(updated);

  // Proper Audit Logging for Approving or Rejecting
  if (targetApt) {
    if (newStatus === 'Confirmed') {
      addAdminAuditLog({
        action: 'APPOINTMENT_APPROVED',
        adminName,
        appointmentId: targetApt.id,
        patientName: targetApt.patientName,
        patientPhone: targetApt.patientPhone,
        tokenNumber: targetApt.tokenNumber,
        date: targetApt.date,
        timeSlot: targetApt.timeSlot,
        details: `Approved & confirmed OPD consultation for patient "${targetApt.patientName}" (Token: ${targetApt.tokenNumber}, Slot Date: ${targetApt.date} at ${targetApt.timeSlot}).`
      });
    } else if (newStatus === 'Cancelled') {
      const reason = rejectionReason || 'Cancelled by OPD Administration';
      addAdminAuditLog({
        action: 'APPOINTMENT_REJECTED',
        adminName,
        appointmentId: targetApt.id,
        patientName: targetApt.patientName,
        patientPhone: targetApt.patientPhone,
        tokenNumber: targetApt.tokenNumber,
        date: targetApt.date,
        timeSlot: targetApt.timeSlot,
        rejectionReason: reason,
        details: `Rejected OPD booking for patient "${targetApt.patientName}" (Token: ${targetApt.tokenNumber}). Reason: "${reason}". 1 OPD slot freed back to live quota.`
      });
    }
  }

  return updated;
}

/**
 * Loads appointments from local storage or returns initial mock appointments.
 */
export function loadOpdAppointments(): Appointment[] {
  if (typeof window === 'undefined') return INITIAL_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

/**
 * Saves appointments list to local storage and dispatches sync event.
 */
export function saveOpdAppointments(appointments: Appointment[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    window.dispatchEvent(new CustomEvent('sopan_opd_quota_updated', { detail: { appointments } }));
  } catch (err) {
    console.error('Failed to save OPD appointments to localStorage:', err);
  }
}

/**
 * Get manual override offset if set (for demo testing fast-forwarding to 0 slots or reset).
 */
export function getOpdManualOffset(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(MANUAL_OVERRIDE_KEY);
    return val !== null ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Sets manual test offset
 */
export function setOpdManualOffset(offset: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MANUAL_OVERRIDE_KEY, String(offset));
    window.dispatchEvent(new CustomEvent('sopan_opd_quota_updated', { detail: { manualOffset: offset } }));
  } catch {
    // ignore
  }
}

/**
 * Calculate descending slots for a specified date or overall active intake.
 */
export function calculateOpdSlotStats(
  appointments: Appointment[],
  targetDate?: string,
  totalCapacity?: number
): OpdSlotStats {
  const effectiveCapacity = totalCapacity !== undefined && totalCapacity > 0 
    ? totalCapacity 
    : getOpdCapacity();
  const manualOffset = getOpdManualOffset();
  
  // Filter confirmed or completed appointments
  const relevantAppointments = appointments.filter(a => {
    const matchesDate = targetDate ? a.date === targetDate : true;
    const isBooked = a.status === 'Confirmed' || a.status === 'Completed';
    return matchesDate && isBooked;
  });

  const rawBookedCount = relevantAppointments.length + manualOffset;
  const bookedCount = Math.max(0, Math.min(effectiveCapacity, rawBookedCount));
  const remainingSlots = Math.max(0, effectiveCapacity - bookedCount);
  const percentageBooked = Math.round((bookedCount / effectiveCapacity) * 100);
  const percentageRemaining = Math.max(0, 100 - percentageBooked);
  const isFull = remainingSlots <= 0;
  const nextSlotNumber = Math.min(effectiveCapacity, bookedCount + 1);

  let statusLabel = 'High Availability';
  let statusColor: 'emerald' | 'amber' | 'orange' | 'rose' = 'emerald';

  if (remainingSlots === 0) {
    statusLabel = `OPD Quota Full (0 / ${effectiveCapacity} Left)`;
    statusColor = 'rose';
  } else if (remainingSlots <= 5) {
    statusLabel = `Critical Alert: Only ${remainingSlots} Slots Left`;
    statusColor = 'rose';
  } else if (remainingSlots <= 15) {
    statusLabel = `Filling Fast: ${remainingSlots} Slots Left`;
    statusColor = 'orange';
  } else if (remainingSlots <= 30) {
    statusLabel = `Moderate Intake (${remainingSlots} Left)`;
    statusColor = 'amber';
  } else {
    statusLabel = `Intake Open (${remainingSlots} / ${effectiveCapacity} Left)`;
    statusColor = 'emerald';
  }

  return {
    totalSlots: effectiveCapacity,
    bookedCount,
    remainingSlots,
    percentageBooked,
    percentageRemaining,
    isFull,
    statusLabel,
    statusColor,
    nextSlotNumber
  };
}
