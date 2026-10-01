import { HospitalEvent } from '../types';
import { HOSPITAL_EVENTS } from '../data/mockData';
import { addAdminAuditLog, getAdminSession } from './opdSlotUtils';
import { 
  saveHospitalEventToFirestore, 
  deleteHospitalEventFromFirestore,
  fetchHospitalEventsFromFirestore 
} from '../lib/firebase';

const STORAGE_KEY = 'sopan_hospital_events_gallery';

/**
 * Curated preset photographs for hospital special occasions
 * Admin can select one of these or enter custom URL / upload
 */
export const PRESET_OCCASION_PHOTOS = [
  {
    label: 'Neuro-Intervention Suite Inauguration',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    category: 'Facility Inauguration'
  },
  {
    label: 'World Stroke Day Medical Summit',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    category: 'Stroke Awareness'
  },
  {
    label: 'Free Parkinson’s & Geriatric Health Camp',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    category: 'Free Medical Camp'
  },
  {
    label: 'Hospital Doctors & Staff Felicitation Conclave',
    url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
    category: 'Doctor Felicitation'
  },
  {
    label: 'Pediatric Epilepsy Workshop & Video-EEG CME',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    category: 'Clinical CME'
  },
  {
    label: 'Hospital Annual Day & Patient Recovery Conclave',
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    category: 'Special Occasion'
  },
  {
    label: 'Diwali & Festival Neurological Ward Celebration',
    url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80',
    category: 'Hospital Celebration'
  },
  {
    label: 'Comprehensive Stroke Walkathon & Awareness Flag-off',
    url: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&w=1200&q=80',
    category: 'Stroke Awareness'
  }
];

export const OCCASION_CATEGORIES = [
  'All',
  'Stroke Awareness',
  'Clinical CME',
  'Free Medical Camp',
  'Facility Inauguration',
  'Survivor Meet',
  'Special Occasion',
  'Hospital Celebration',
  'Doctor Felicitation'
] as const;

/**
 * Loads hospital events and special occasion photos from local storage
 */
export function loadHospitalEvents(): HospitalEvent[] {
  if (typeof window === 'undefined') return HOSPITAL_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(HOSPITAL_EVENTS));
      return HOSPITAL_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return HOSPITAL_EVENTS;
  } catch {
    return HOSPITAL_EVENTS;
  }
}

/**
 * Saves hospital events list to local storage and dispatches sync event
 */
export function saveHospitalEvents(events: HospitalEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent('sopan_hospital_events_updated', { detail: { events } }));
  } catch (err) {
    console.error('Failed to save hospital events:', err);
  }
}

/**
 * Adds a new hospital photo for a special occasion (Admin only)
 */
export function addHospitalEventPhoto(
  data: Omit<HospitalEvent, 'id'>,
  adminOverride?: { username?: string; email?: string; role?: string }
): HospitalEvent {
  const session = getAdminSession();
  const adminName = adminOverride?.username || session?.username || 'OPD Administrator';
  const adminEmail = adminOverride?.email || session?.email || 'admin@sopanhospital.com';

  const newEvent: HospitalEvent = {
    ...data,
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    addedBy: adminName,
    addedAt: new Date().toISOString()
  };

  const current = loadHospitalEvents();
  const updated = [newEvent, ...current];
  saveHospitalEvents(updated);

  // Record proper audit log
  addAdminAuditLog({
    action: 'EVENT_PHOTO_ADDED',
    adminName,
    adminEmail,
    details: `Added new hospital special occasion photograph: "${newEvent.title}" (Category: ${newEvent.category}, Date: ${newEvent.date}, Venue: ${newEvent.location}).`
  });

  // Persist to Firestore
  try {
    saveHospitalEventToFirestore({
      id: newEvent.id,
      title: newEvent.title,
      category: newEvent.category,
      date: newEvent.date,
      location: newEvent.location,
      leadClinician: newEvent.leadClinician,
      summary: newEvent.summary,
      attendeesCount: newEvent.attendeesCount,
      imageUrl: newEvent.imageUrl,
      tags: newEvent.tags,
      keyHighlights: newEvent.keyHighlights,
      addedBy: newEvent.addedBy,
      addedAt: newEvent.addedAt
    }).catch(() => {});
  } catch {
    // Ignore offline errors
  }

  return newEvent;
}

/**
 * Removes a hospital photo from the gallery (Admin only)
 */
export function removeHospitalEventPhoto(
  eventId: string,
  adminOverride?: { username?: string; email?: string }
): boolean {
  const current = loadHospitalEvents();
  const target = current.find(e => e.id === eventId);
  if (!target) return false;

  const session = getAdminSession();
  const adminName = adminOverride?.username || session?.username || 'OPD Administrator';
  const adminEmail = adminOverride?.email || session?.email || 'admin@sopanhospital.com';

  const updated = current.filter(e => e.id !== eventId);
  saveHospitalEvents(updated);

  // Record audit log
  addAdminAuditLog({
    action: 'EVENT_PHOTO_REMOVED',
    adminName,
    adminEmail,
    details: `Removed hospital event photograph "${target.title}" (Category: ${target.category}) from public archive.`
  });

  // Delete from Firestore
  try {
    deleteHospitalEventFromFirestore(eventId).catch(() => {});
  } catch {
    // Ignore
  }

  return true;
}

/**
 * Resets gallery back to default hospital archive photographs
 */
export function resetHospitalEventsToDefault(): HospitalEvent[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(HOSPITAL_EVENTS));
    window.dispatchEvent(new CustomEvent('sopan_hospital_events_updated', { detail: { events: HOSPITAL_EVENTS } }));
  }

  const session = getAdminSession();
  addAdminAuditLog({
    action: 'EVENT_PHOTO_ADDED',
    adminName: session?.username || 'Hospital Administrator',
    details: `Reset hospital event gallery photographs to default 35+ years clinical archive (${HOSPITAL_EVENTS.length} photos).`
  });

  return HOSPITAL_EVENTS;
}

/**
 * Synchronizes hospital events with Firestore remote database
 */
export async function syncHospitalEventsWithFirestore(): Promise<HospitalEvent[]> {
  try {
    const remote = await fetchHospitalEventsFromFirestore();
    if (remote && remote.length > 0) {
      const local = loadHospitalEvents();
      // Merge unique by ID
      const remoteMap = new Map<string, HospitalEvent>();
      remote.forEach((r: any) => remoteMap.set(r.id, r));
      local.forEach(l => {
        if (!remoteMap.has(l.id)) {
          remoteMap.set(l.id, l);
        }
      });
      const merged = Array.from(remoteMap.values());
      saveHospitalEvents(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Sync with Firestore error:', err);
  }
  return loadHospitalEvents();
}
