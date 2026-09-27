import { Appointment } from '../types';
import { INITIAL_APPOINTMENTS } from '../data/mockData';

export const TOTAL_OPD_DAILY_SLOTS = 50;
const STORAGE_KEY = 'sopan_hospital_opd_appointments';
const MANUAL_OVERRIDE_KEY = 'sopan_hospital_opd_manual_override';

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
  totalCapacity = TOTAL_OPD_DAILY_SLOTS
): OpdSlotStats {
  const manualOffset = getOpdManualOffset();
  
  // Filter confirmed or completed appointments
  const relevantAppointments = appointments.filter(a => {
    const matchesDate = targetDate ? a.date === targetDate : true;
    const isBooked = a.status === 'Confirmed' || a.status === 'Completed';
    return matchesDate && isBooked;
  });

  const rawBookedCount = relevantAppointments.length + manualOffset;
  const bookedCount = Math.max(0, Math.min(totalCapacity, rawBookedCount));
  const remainingSlots = Math.max(0, totalCapacity - bookedCount);
  const percentageBooked = Math.round((bookedCount / totalCapacity) * 100);
  const percentageRemaining = Math.max(0, 100 - percentageBooked);
  const isFull = remainingSlots <= 0;
  const nextSlotNumber = Math.min(totalCapacity, bookedCount + 1);

  let statusLabel = 'High Availability';
  let statusColor: 'emerald' | 'amber' | 'orange' | 'rose' = 'emerald';

  if (remainingSlots === 0) {
    statusLabel = 'OPD Quota Full (0 / 50 Left)';
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
    statusLabel = `Intake Open (${remainingSlots} / 50 Left)`;
    statusColor = 'emerald';
  }

  return {
    totalSlots: totalCapacity,
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
