import { HospitalEvent } from '../types';
import { HOSPITAL_EVENTS } from '../data/mockData';
import { addAdminAuditLog, getAdminSession } from './opdSlotUtils';
import { 
  saveHospitalEventToFirestore, 
  deleteHospitalEventFromFirestore,
  fetchHospitalEventsFromFirestore,
  resetHospitalEventsInFirestore
} from '../lib/firebase';

const STORAGE_KEY = 'sopan_hospital_events_gallery';

/**
 * Compresses an image file before storing or saving to Firestore.
 * Keeps payload well under Firestore's 1MB limit (~100-200KB) while maintaining crisp visual fidelity.
 */
export function compressImageFile(
  file: File, 
  maxWidth = 1280, 
  maxHeight = 850, 
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Curated preset photographs for hospital special occasions
 * Admin can select one of these or enter custom URL / upload
 */
export const PRESET_OCCASION_PHOTOS = [
  {
    label: 'Neuro-Intervention Suite Inauguration Ceremony',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    category: 'Events'
  },
  {
    label: 'World Stroke Day Medical Summit & Protocol Seminar',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    category: 'Events'
  },
  {
    label: 'Lifetime Achievement & Neurological Excellence Award',
    url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=80',
    category: 'Awards'
  },
  {
    label: 'Hospital Doctors & Multidisciplinary Specialists Conclave',
    url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
    category: 'Awards'
  },
  {
    label: 'Neuro-ICU Nursing & Clinical Staff Conclave',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1200&q=80',
    category: 'Staff'
  },
  {
    label: 'Acute Stroke Survivors & Functional Recovery Felicitation',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    category: 'Patient Stories'
  },
  {
    label: 'Free Parkinson’s & Geriatric Tremor Screening Camp',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    category: 'Medical Camps'
  },
  {
    label: 'Pediatric Epilepsy Workshop & Video-EEG CME Training',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    category: 'Clinical CME'
  },
  {
    label: 'Silver Jubilee Annual Neurology Day & Recovery Gala',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    category: 'Events'
  },
  {
    label: 'Hospital Doctors, Nurses & Rehabilitation Team',
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    category: 'Staff'
  }
];

export const OCCASION_CATEGORIES = [
  'All',
  'Events',
  'Awards',
  'Staff',
  'Patient Stories',
  'Medical Camps',
  'Clinical CME',
  'Special Occasion'
] as const;

/**
 * Smart Category Matching: supports direct category match as well as semantic alias tags
 * (e.g. 'Events', 'Awards', 'Staff', 'Patient Stories')
 */
export function matchEventCategory(evt: HospitalEvent, category: string): boolean {
  if (!category || category === 'All') return true;
  if (evt.category === category) return true;

  const catLower = category.toLowerCase();
  const evtCatLower = (evt.category || '').toLowerCase();
  const tagsStr = (evt.tags || []).join(' ').toLowerCase();
  const textStr = `${evt.title || ''} ${evt.summary || ''}`.toLowerCase();

  if (category === 'Events') {
    return (
      evtCatLower === 'events' ||
      evtCatLower.includes('occasion') ||
      evtCatLower.includes('inauguration') ||
      evtCatLower.includes('celebration') ||
      evtCatLower.includes('stroke awareness') ||
      tagsStr.includes('event') ||
      tagsStr.includes('summit') ||
      tagsStr.includes('jubilee') ||
      textStr.includes('summit') ||
      textStr.includes('seminar') ||
      textStr.includes('conclave')
    );
  }

  if (category === 'Awards') {
    return (
      evtCatLower === 'awards' ||
      evtCatLower.includes('felicitation') ||
      evtCatLower.includes('honor') ||
      tagsStr.includes('award') ||
      tagsStr.includes('honor') ||
      tagsStr.includes('achievement') ||
      textStr.includes('award') ||
      textStr.includes('lifetime achievement') ||
      textStr.includes('felicitation') ||
      textStr.includes('gold medal')
    );
  }

  if (category === 'Staff') {
    return (
      evtCatLower === 'staff' ||
      tagsStr.includes('staff') ||
      tagsStr.includes('nursing') ||
      tagsStr.includes('team') ||
      tagsStr.includes('doctor') ||
      tagsStr.includes('clinician') ||
      textStr.includes('staff') ||
      textStr.includes('nurses') ||
      textStr.includes('physicians') ||
      textStr.includes('paramedic') ||
      textStr.includes('healthcare heroes')
    );
  }

  if (category === 'Patient Stories') {
    return (
      evtCatLower === 'patient stories' ||
      evtCatLower.includes('survivor') ||
      tagsStr.includes('patient stories') ||
      tagsStr.includes('survivor') ||
      tagsStr.includes('recovery') ||
      tagsStr.includes('inspiration') ||
      textStr.includes('survivor') ||
      textStr.includes('patient story') ||
      textStr.includes('recovery journey') ||
      textStr.includes('triumph')
    );
  }

  if (category === 'Medical Camps') {
    return (
      evtCatLower === 'medical camps' ||
      evtCatLower.includes('camp') ||
      tagsStr.includes('camp') ||
      tagsStr.includes('screening') ||
      textStr.includes('free screening') ||
      textStr.includes('camp')
    );
  }

  if (category === 'Clinical CME') {
    return (
      evtCatLower === 'clinical cme' ||
      evtCatLower.includes('cme') ||
      tagsStr.includes('cme') ||
      tagsStr.includes('workshop') ||
      textStr.includes('cme') ||
      textStr.includes('workshop')
    );
  }

  if (category === 'Special Occasion') {
    return evtCatLower.includes('occasion') || evtCatLower.includes('celebration');
  }

  return false;
}

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
      // Merge in any newly added default category items (e.g. Awards, Staff, Events, Patient Stories)
      const existingIds = new Set(parsed.map((p: any) => p?.id));
      const missingDefaults = HOSPITAL_EVENTS.filter(def => !existingIds.has(def.id));
      if (missingDefaults.length > 0) {
        const merged = [...parsed, ...missingDefaults];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
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

  // Persist to Firestore - propagates via onSnapshot to all connected devices instantly
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
  }).then((res) => {
    if (res) {
      console.log('Occasion photo synced to Firestore:', newEvent.id);
    }
  }).catch((err) => {
    console.warn('Firestore photo save notice:', err);
  });

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

  // Delete from Firestore - triggers onSnapshot across all connected devices
  deleteHospitalEventFromFirestore(eventId).then((ok) => {
    if (ok) {
      console.log('Occasion photo removed from Firestore:', eventId);
    }
  }).catch((err) => {
    console.warn('Firestore photo deletion notice:', err);
  });

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

  // Reset Firestore documents so all devices update live
  resetHospitalEventsInFirestore().catch((err) => {
    console.warn('Firestore reset events notice:', err);
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
      const mapped: HospitalEvent[] = remote.map((r: any) => ({
        id: r.id,
        title: r.title || 'Special Occasion Photograph',
        category: r.category || 'Events',
        date: r.date || '',
        location: r.location || 'Sopan Hospital, Shrihari Kute Marg, Mumbai Naka, Nashik',
        leadClinician: r.leadClinician || 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
        summary: r.summary || '',
        attendeesCount: r.attendeesCount || '150+ Attendees & Dignitaries',
        imageUrl: r.imageUrl || '',
        tags: Array.isArray(r.tags) ? r.tags : ['HospitalOccasion', 'SopanNeuro'],
        keyHighlights: Array.isArray(r.keyHighlights) ? r.keyHighlights : [],
        addedBy: r.addedBy,
        addedAt: r.addedAt,
        updatedAt: r.updatedAt
      })).sort((a, b) => (b.addedAt || b.date || '').localeCompare(a.addedAt || a.date || ''));

      saveHospitalEvents(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Sync with Firestore error:', err);
  }
  return loadHospitalEvents();
}
