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

export { onAuthStateChanged };
export type { FirebaseUser };
