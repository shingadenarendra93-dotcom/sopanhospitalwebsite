import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDocFromServer,
  onSnapshot,
  Unsubscribe,
  Timestamp 
} from 'firebase/firestore';
import { Appointment } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore (pass databaseId if defined)
export const db = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Data structure for Firestore 'website_data' collection
export interface PatientWebsiteData {
  id?: string;
  patientName: string;
  phone: string;
  email?: string;
  age?: string | number;
  gender?: string;
  department?: string;
  chiefComplaint?: string;
  preferredDate?: string;
  notes?: string;
  source?: string;
  userId?: string;
  createdAt?: string;
  timestamp?: any;
}

/**
 * Sanitizes an object before sending it to Firestore by stripping out any
 * undefined values or nested undefined keys, preventing "Unsupported field value: undefined" errors.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Timestamp) && !(val instanceof Date)) {
        cleaned[key] = cleanFirestoreData(val);
      } else if (Array.isArray(val)) {
        cleaned[key] = val
          .filter(item => item !== undefined)
          .map(item => {
            if (item !== null && typeof item === 'object' && !(item instanceof Timestamp) && !(item instanceof Date)) {
              return cleanFirestoreData(item);
            }
            return item;
          });
      } else {
        cleaned[key] = val;
      }
    }
  }
  return cleaned;
}

/**
 * Save patient data record directly into the Firestore collection 'website_data'
 */
export async function savePatientToWebsiteData(data: Omit<PatientWebsiteData, 'id' | 'createdAt' | 'timestamp'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const colRef = collection(db, 'website_data');
    const rawData = {
      patientName: data.patientName || 'Patient',
      phone: data.phone || '',
      email: data.email || '',
      age: data.age !== undefined && data.age !== null ? String(data.age) : '',
      gender: data.gender || 'Not Specified',
      department: data.department || 'General Neurology',
      chiefComplaint: data.chiefComplaint || '',
      preferredDate: data.preferredDate || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      source: data.source || 'Sopan Hospital Web Intake',
      userId: data.userId || 'guest',
      createdAt: new Date().toISOString(),
      timestamp: Timestamp.now()
    };
    const cleaned = cleanFirestoreData(rawData);
    if (!cleaned.userId) {
      cleaned.userId = 'guest';
    }
    const docRef = await addDoc(colRef, cleaned);
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('Error saving patient to Firestore website_data collection:', err);
    return { success: false, error: err?.message || 'Failed to save patient data to Firestore.' };
  }
}

/**
 * Retrieve patient data records from the Firestore collection 'website_data'
 */
export async function fetchWebsiteData(limitCount = 50): Promise<PatientWebsiteData[]> {
  try {
    const colRef = collection(db, 'website_data');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as PatientWebsiteData[];
  } catch (err) {
    console.warn('Error fetching website_data records from Firestore:', err);
    // If order index is building or not available, fallback to un-ordered query
    try {
      const colRef = collection(db, 'website_data');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as PatientWebsiteData[];
    } catch {
      return [];
    }
  }
}

// Test Firestore connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Verify network/firebase config.');
    }
  }
}
testFirestoreConnection();

// Sign in with Google Popup
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Persist or update user profile document in Firestore
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Sopan Hospital Patient',
      photoURL: user.photoURL || '',
      role: 'patient',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }, { merge: true });
  }

  return user;
}

// Sign Out
export async function logOut(): Promise<void> {
  await fbSignOut(auth);
}

// Save Appointment to Firestore
export async function saveAppointmentToFirestore(appointment: {
  id?: string;
  patientName?: string;
  contactNumber?: string;
  patientPhone?: string;
  age?: string | number;
  patientAge?: string | number;
  gender?: string;
  patientGender?: string;
  doctor?: string;
  doctorName?: string;
  doctorId?: string;
  date?: string;
  timeSlot?: string;
  tokenNumber?: string;
  department?: string;
  conditionContext?: string;
  symptoms?: string;
  status?: string;
  visitType?: string;
  slotNumber?: number;
  remainingSlotsAtBooking?: number;
  email?: string;
  patientEmail?: string;
  reminderSettings?: any;
  userId?: string;
  createdAt?: string;
}): Promise<string | null> {
  try {
    const rawData: Record<string, any> = {
      patientName: appointment.patientName || 'Patient',
      contactNumber: appointment.contactNumber || appointment.patientPhone || '',
      phone: appointment.contactNumber || appointment.patientPhone || '',
      age: appointment.age !== undefined && appointment.age !== null 
        ? String(appointment.age) 
        : (appointment.patientAge !== undefined && appointment.patientAge !== null ? String(appointment.patientAge) : ''),
      gender: appointment.gender || appointment.patientGender || 'Not Specified',
      doctor: appointment.doctor || appointment.doctorName || 'Dr. Sanjay Sopan Varade',
      doctorName: appointment.doctorName || appointment.doctor || 'Dr. Sanjay Sopan Varade',
      doctorId: appointment.doctorId || 'dr-sanjay-varade',
      date: appointment.date || new Date().toISOString().split('T')[0],
      timeSlot: appointment.timeSlot || '09:00 AM - 01:00 PM',
      tokenNumber: appointment.tokenNumber || '0',
      department: appointment.department || 'Neurology',
      conditionContext: appointment.conditionContext || appointment.symptoms || '',
      symptoms: appointment.symptoms || appointment.conditionContext || '',
      status: appointment.status || 'Confirmed',
      visitType: appointment.visitType || 'In-Person Hospital OPD',
      slotNumber: appointment.slotNumber || 1,
      remainingSlotsAtBooking: appointment.remainingSlotsAtBooking ?? 49,
      userId: appointment.userId || 'guest',
      createdAt: appointment.createdAt || new Date().toISOString()
    };

    if (appointment.email || appointment.patientEmail) {
      rawData.email = appointment.email || appointment.patientEmail;
    }
    if (appointment.reminderSettings) {
      rawData.reminderSettings = appointment.reminderSettings;
    }

    const cleaned = cleanFirestoreData(rawData);
    // Explicit guard: userId must NEVER be undefined
    if (!cleaned.userId) {
      cleaned.userId = 'guest';
    }

    if (appointment.id) {
      const docRef = doc(db, 'appointments', appointment.id);
      await setDoc(docRef, cleaned, { merge: true });
      return appointment.id;
    } else {
      const apptsCol = collection(db, 'appointments');
      const docRef = await addDoc(apptsCol, cleaned);
      return docRef.id;
    }
  } catch (err) {
    console.error('Failed to save appointment to Firestore:', err);
    return null;
  }
}

// Load User Appointments from Firestore
export async function fetchUserAppointments(userId: string) {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Falling back or error fetching appointments:', err);
    return [];
  }
}

// Save Patient Feedback to Firestore
export async function saveFeedbackToFirestore(feedback: any) {
  try {
    const feedbacksCol = collection(db, 'feedbacks');
    const cleaned = cleanFirestoreData({
      ...feedback,
      userId: feedback?.userId || 'guest',
      createdAt: new Date().toISOString()
    });
    const docRef = await addDoc(feedbacksCol, cleaned);
    return docRef.id;
  } catch (err) {
    console.error('Failed to save feedback to Firestore:', err);
    return null;
  }
}

// Fetch Feedbacks from Firestore
export async function fetchFeedbacksFromFirestore() {
  try {
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Error fetching feedbacks from Firestore:', err);
    return [];
  }
}

// Save Chat Message to User's private Firestore subcollection
export async function saveChatMessageToFirestore(userId: string, message: {
  role: 'user' | 'model' | 'system';
  content: string;
  model: string;
  groundingType?: string;
  sources?: any;
}) {
  try {
    const safeUserId = userId || 'guest';
    const chatsCol = collection(db, 'users', safeUserId, 'chats');
    const cleaned = cleanFirestoreData({
      ...message,
      timestamp: new Date().toISOString()
    });
    await addDoc(chatsCol, cleaned);
  } catch (err) {
    console.warn('Error persisting chat to Firestore:', err);
  }
}

// Save OPD Admin Audit Log to Firestore
export async function saveAuditLogToFirestore(log: {
  action: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  details: string;
  appointmentId?: string;
  patientName?: string;
  patientPhone?: string;
  tokenNumber?: string;
  rejectionReason?: string;
  timestamp: string;
  displayTime: string;
}) {
  try {
    const logsCol = collection(db, 'opd_admin_audit_logs');
    const cleaned = cleanFirestoreData({
      ...log,
      createdAt: new Date().toISOString()
    });
    const docRef = await addDoc(logsCol, cleaned);
    return docRef.id;
  } catch (err) {
    console.warn('Firestore notice: Audit log fallback to localStorage:', err);
    return null;
  }
}

// Fetch OPD Admin Audit Logs from Firestore
export async function fetchAuditLogsFromFirestore() {
  try {
    const q = query(collection(db, 'opd_admin_audit_logs'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Falling back to local audit logs:', err);
    return [];
  }
}

// Clear OPD Admin Audit Logs from Firestore
export async function clearAuditLogsFromFirestore(): Promise<boolean> {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const q = query(collection(db, 'opd_admin_audit_logs'));
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (err) {
    console.warn('Firestore clear audit logs notice:', err);
    return false;
  }
}

// Save Hospital Event Photograph to Firestore
export async function saveHospitalEventToFirestore(event: {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  leadClinician: string;
  summary: string;
  attendeesCount: string;
  imageUrl: string;
  tags: string[];
  keyHighlights: string[];
  addedBy?: string;
  addedAt?: string;
}) {
  try {
    const eventRef = doc(db, 'hospital_events', event.id);
    const cleaned = cleanFirestoreData({
      ...event,
      updatedAt: new Date().toISOString()
    });
    await setDoc(eventRef, cleaned, { merge: true });
    return event.id;
  } catch (err) {
    console.warn('Firestore fallback: Event saved locally:', err);
    return null;
  }
}

// Delete Hospital Event Photograph from Firestore
export async function deleteHospitalEventFromFirestore(eventId: string) {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const eventRef = doc(db, 'hospital_events', eventId);
    await deleteDoc(eventRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete fallback:', err);
    return false;
  }
}

// Fetch Hospital Event Photographs from Firestore
export async function fetchHospitalEventsFromFirestore() {
  try {
    const q = query(collection(db, 'hospital_events'), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Falling back or error fetching hospital events from Firestore:', err);
    return [];
  }
}

// Hospital Content and Configuration Settings Structure for Firestore
export interface HospitalContentSettings {
  consultationFee: number;
  opdCapacity: number;
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  directorName: string;
  directorTitle: string;
  directorExperience: string;
  emergencyBannerText: string;
  emergencyPhone: string;
  emergencyPhoneDisplay: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  hospitalAddress: string;
  doorToNeedleTime: string;
  ctScanTechnology: string;
  seizureControlRate: string;
  announcementBannerEnabled: boolean;
  announcementBannerText: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_HOSPITAL_CONTENT: HospitalContentSettings = {
  consultationFee: 1500,
  opdCapacity: 50,
  heroBadgeText: 'NABH Accredited Super-Speciality Neuroscience Center • Mumbai Naka, Nashik',
  heroTitle: 'Compassionate Clinical Excellence in Neurology & Brain Sciences',
  heroSubtitle: 'Led by Director & Chief Consultant Dr. Sanjay Sopan Varade (MD, DM Neuro) with over 35+ Years of Experience. Comprehensive acute stroke rescue, 32-Slice high-speed CT diagnostic angiography, continuous 24-hr Video-EEG, and dedicated neuro-rehabilitation delivered with warmth, precision, and dignity.',
  directorName: 'Dr. Sanjay Sopan Varade',
  directorTitle: 'MD, DM Neuro (CMC Vellore)',
  directorExperience: '35+ Years Clinical Practice',
  emergencyBannerText: '24/7 ACUTE STROKE & NEURO EMERGENCY HOTLINE: Mumbai Naka, Nashik • 32-Slice CT & ICU Ready',
  emergencyPhone: '02532317364',
  emergencyPhoneDisplay: '0253 2317364',
  whatsappNumber: '9405545521',
  whatsappDisplay: 'WhatsApp: 9405545521',
  hospitalAddress: 'Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001',
  doorToNeedleTime: '< 25 Minutes',
  ctScanTechnology: '32-Slice CT Scan',
  seizureControlRate: '88.4%',
  announcementBannerEnabled: false,
  announcementBannerText: 'Walk-in acute stroke triage operational 24/7. Regular OPD tokens issued daily from 9:00 AM.'
};

// Save Hospital Configuration Settings (consultationFee, opdCapacity, Home Page Content)
export async function saveHospitalSettingsToFirestore(settings: Partial<HospitalContentSettings>): Promise<boolean> {
  try {
    const settingsRef = doc(db, 'hospital_settings', 'configuration');
    const cleaned = cleanFirestoreData({
      ...settings,
      updatedAt: new Date().toISOString()
    });
    await setDoc(settingsRef, cleaned, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore fallback: Settings saved locally:', err);
    return false;
  }
}

// Fetch Hospital Configuration Settings from Firestore
export async function fetchHospitalSettingsFromFirestore(): Promise<HospitalContentSettings> {
  try {
    const settingsRef = doc(db, 'hospital_settings', 'configuration');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return {
        ...DEFAULT_HOSPITAL_CONTENT,
        ...snap.data()
      };
    }
    return DEFAULT_HOSPITAL_CONTENT;
  } catch (err) {
    console.warn('Falling back to local settings:', err);
    return DEFAULT_HOSPITAL_CONTENT;
  }
}

/**
 * Real-Time onSnapshot Subscription for Home Page Content & Hospital Settings
 * Every change made in the admin panel or Firestore updates all connected devices instantly!
 */
export function subscribeToHospitalSettings(callback: (settings: HospitalContentSettings) => void): Unsubscribe {
  const settingsRef = doc(db, 'hospital_settings', 'configuration');
  return onSnapshot(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const merged: HospitalContentSettings = {
        ...DEFAULT_HOSPITAL_CONTENT,
        ...data
      };

      // Synchronize localStorage & custom events so non-React helpers stay updated
      if (typeof window !== 'undefined') {
        try {
          if (merged.consultationFee) {
            localStorage.setItem('sopan_hospital_consultation_fee', String(merged.consultationFee));
            window.dispatchEvent(new CustomEvent('sopan_consultation_fee_updated', {
              detail: { fee: merged.consultationFee }
            }));
          }
          if (merged.opdCapacity) {
            localStorage.setItem('sopan_hospital_opd_custom_capacity', String(merged.opdCapacity));
            window.dispatchEvent(new CustomEvent('sopan_opd_quota_updated', {
              detail: { customCapacity: merged.opdCapacity }
            }));
          }
        } catch {}
      }

      callback(merged);
    } else {
      // First boot: write defaults into Firestore so it's initialized
      saveHospitalSettingsToFirestore(DEFAULT_HOSPITAL_CONTENT).catch(() => {});
      callback(DEFAULT_HOSPITAL_CONTENT);
    }
  }, (err) => {
    console.warn('Real-time hospital settings snapshot notice:', err);
    callback(DEFAULT_HOSPITAL_CONTENT);
  });
}

/**
 * Real-Time onSnapshot Subscription for OPD Appointments
 * All appointment lists, tables, and slot counts update live across devices without refresh!
 */
export function subscribeToAppointments(callback: (appointments: Appointment[]) => void): Unsubscribe {
  const apptsCol = collection(db, 'appointments');
  
  const mapDocToAppointment = (docSnap: any): Appointment => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      patientName: data.patientName || 'Patient',
      patientAge: Number(data.age) || Number(data.patientAge) || 0,
      patientGender: (data.gender as any) || (data.patientGender as any) || 'Other',
      patientPhone: data.contactNumber || data.phone || data.patientPhone || '',
      patientEmail: data.email || data.patientEmail || '',
      doctorId: data.doctorId || 'dr-sanjay-varade',
      doctorName: data.doctor || data.doctorName || 'Dr. Sanjay Sopan Varade',
      department: (data.department as any) || 'Comprehensive Stroke Center',
      date: data.date || '',
      timeSlot: data.timeSlot || '09:00 AM - 01:00 PM',
      visitType: (data.visitType as any) || 'In-Person Hospital OPD',
      symptoms: data.conditionContext || data.symptoms || '',
      status: (data.status === 'CONFIRMED' || data.status === 'Confirmed' 
        ? 'Confirmed' 
        : data.status === 'CANCELLED' || data.status === 'Cancelled' 
          ? 'Cancelled' 
          : data.status === 'COMPLETED' || data.status === 'Completed' 
            ? 'Completed' 
            : 'Confirmed') as any,
      tokenNumber: data.tokenNumber || '0',
      slotNumber: Number(data.slotNumber) || 1,
      remainingSlotsAtBooking: Number(data.remainingSlotsAtBooking) || 50,
      createdAt: data.createdAt || new Date().toISOString(),
      rejectionReason: data.rejectionReason,
      adminActionAt: data.adminActionAt,
      adminActionBy: data.adminActionBy,
      reminderSettings: data.reminderSettings
    };
  };

  let fallbackUnsub: Unsubscribe | null = null;

  const unsub = onSnapshot(
    query(apptsCol, orderBy('createdAt', 'desc')),
    (snapshot) => {
      const list = snapshot.docs.map(mapDocToAppointment);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sopan_hospital_opd_appointments', JSON.stringify(list));
          window.dispatchEvent(new CustomEvent('sopan_opd_quota_updated', { detail: { appointments: list } }));
        } catch {}
      }
      callback(list);
    },
    (err) => {
      console.warn('Real-time query with orderBy failed, switching to base collection snapshot listener:', err);
      fallbackUnsub = onSnapshot(apptsCol, (snap) => {
        const list = snap.docs.map(mapDocToAppointment).sort((a, b) => 
          (b.createdAt || '').localeCompare(a.createdAt || '')
        );
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('sopan_hospital_opd_appointments', JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('sopan_opd_quota_updated', { detail: { appointments: list } }));
          } catch {}
        }
        callback(list);
      }, (fallbackErr) => {
        console.warn('Base snapshot listener notice:', fallbackErr);
      });
    }
  );

  return () => {
    unsub();
    if (fallbackUnsub) {
      fallbackUnsub();
    }
  };
}

/**
 * Updates an appointment's status in Firestore, propagating live via onSnapshot to all devices
 */
export async function updateAppointmentStatusInFirestore(
  appointmentId: string,
  newStatus: 'Confirmed' | 'Cancelled' | 'Completed' | 'Pending',
  rejectionReason?: string,
  adminName = 'Dr. Sanjay Varade Clinic Desk'
): Promise<boolean> {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    const cleaned = cleanFirestoreData({
      status: newStatus === 'Confirmed' ? 'CONFIRMED' : newStatus === 'Cancelled' ? 'CANCELLED' : newStatus,
      rejectionReason: newStatus === 'Cancelled' ? (rejectionReason || 'Cancelled by OPD Administration') : '',
      adminActionAt: new Date().toISOString(),
      adminActionBy: adminName,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to update appointment in Firestore:', err);
    return false;
  }
}

/**
 * Deletes an appointment from Firestore
 */
export async function deleteAppointmentFromFirestore(appointmentId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Failed to delete appointment in Firestore:', err);
    return false;
  }
}

/**
 * Real-Time onSnapshot Subscription for website_data Collection
 */
export function subscribeToWebsiteData(callback: (records: PatientWebsiteData[]) => void): Unsubscribe {
  const colRef = collection(db, 'website_data');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: PatientWebsiteData[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as PatientWebsiteData[];
    callback(list);
  }, (err) => {
    console.warn('Real-time website_data snapshot notice:', err);
  });
}

export { onAuthStateChanged };
export type { FirebaseUser };
