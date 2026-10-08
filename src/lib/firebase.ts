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
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDocFromServer,
  Timestamp 
} from 'firebase/firestore';
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
  createdAt?: string;
  timestamp?: any;
}

/**
 * Save patient data record directly into the Firestore collection 'website_data'
 */
export async function savePatientToWebsiteData(data: Omit<PatientWebsiteData, 'id' | 'createdAt' | 'timestamp'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const colRef = collection(db, 'website_data');
    const docData = {
      ...data,
      source: data.source || 'Sopan Hospital Web Intake',
      createdAt: new Date().toISOString(),
      timestamp: Timestamp.now()
    };
    const docRef = await addDoc(colRef, docData);
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
  patientName: string;
  contactNumber: string;
  age?: string;
  gender?: string;
  doctor?: string;
  date: string;
  timeSlot: string;
  tokenNumber: string;
  department: string;
  conditionContext?: string;
  status: string;
  userId?: string;
}) {
  try {
    const apptsCol = collection(db, 'appointments');
    const docRef = await addDoc(apptsCol, {
      ...appointment,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
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
    const docRef = await addDoc(feedbacksCol, {
      ...feedback,
      createdAt: new Date().toISOString()
    });
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
    const chatsCol = collection(db, 'users', userId, 'chats');
    await addDoc(chatsCol, {
      ...message,
      timestamp: new Date().toISOString()
    });
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
    const docRef = await addDoc(logsCol, {
      ...log,
      createdAt: new Date().toISOString()
    });
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
    await setDoc(eventRef, {
      ...event,
      updatedAt: new Date().toISOString()
    }, { merge: true });
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

// Save Hospital Configuration Settings (consultationFee, opdCapacity)
export async function saveHospitalSettingsToFirestore(settings: {
  consultationFee?: number;
  opdCapacity?: number;
  updatedBy?: string;
}) {
  try {
    const settingsRef = doc(db, 'hospital_settings', 'configuration');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore fallback: Settings saved locally:', err);
    return false;
  }
}

// Fetch Hospital Configuration Settings from Firestore
export async function fetchHospitalSettingsFromFirestore(): Promise<{
  consultationFee?: number;
  opdCapacity?: number;
  updatedAt?: string;
  updatedBy?: string;
} | null> {
  try {
    const settingsRef = doc(db, 'hospital_settings', 'configuration');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data() as any;
    }
    return null;
  } catch (err) {
    console.warn('Falling back to local settings:', err);
    return null;
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
