import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AuthUser, UserRole } from '../types';

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with configured custom database ID
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

export interface FirestoreUserAlert {
  id?: string;
  trainNumber: string;
  trainName: string;
  stationCode: string;
  stationName: string;
  notifyMinutesBefore: number;
  platformChangeAlert: boolean;
  wakeUpAlarm: boolean;
  createdAt: string;
}

export interface FirestoreRecentSearch {
  id?: string;
  trainNumber: string;
  trainName: string;
  searchedAt: string;
  source?: string;
  destination?: string;
}

/**
 * Maps Firebase User + Profile doc to application AuthUser
 */
export function formatAuthUser(
  fbUser: FirebaseUser, 
  role: UserRole = 'PASSENGER', 
  customData?: Partial<AuthUser>
): AuthUser {
  const email = fbUser.email || customData?.email || 'commuter@smarteta.in';
  const name = fbUser.displayName || customData?.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  return {
    uid: fbUser.uid,
    email: email,
    role: customData?.role || role,
    name: name,
    department: customData?.department || (role === 'OPERATOR' ? 'Control Office - Western Railway (BCT Division)' : 'Commuter / Live Traveler Portal'),
    badgeId: customData?.badgeId || (role === 'OPERATOR' ? 'IR-WR-OP-8492' : undefined),
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Authenticates user via Firebase Auth and syncs User Profile to Cloud Firestore
 */
export async function authenticateWithFirebase(
  email: string,
  pass: string,
  role: UserRole = 'PASSENGER'
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail) {
    return { success: false, error: 'Please enter a valid email address' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your password' };
  }

  // Operator verification
  if (role === 'OPERATOR') {
    if (cleanEmail !== 'trainetaoperator@gmail.com' || cleanPass !== '12345678') {
      return { 
        success: false, 
        error: 'Invalid Operator Credentials. Required: trainetaoperator@gmail.com / 12345678' 
      };
    }
  }

  try {
    let fbUser: FirebaseUser;

    try {
      // 1. Try Signing In with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      fbUser = userCredential.user;
    } catch (signInErr: any) {
      // If user not found, auto-create account for seamless onboarding
      if (
        signInErr.code === 'auth/user-not-found' || 
        signInErr.code === 'auth/invalid-credential' ||
        signInErr.code === 'auth/invalid-login-credentials'
      ) {
        try {
          const createCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          fbUser = createCredential.user;
        } catch (createErr: any) {
          // If already in use with different password or password too weak
          if (createErr.code === 'auth/email-already-in-use') {
            return { 
              success: false, 
              error: 'An account with this email exists. Please verify your password.' 
            };
          }
          if (createErr.code === 'auth/weak-password') {
            return { 
              success: false, 
              error: 'Password should be at least 6 characters for Firebase security.' 
            };
          }
          throw signInErr;
        }
      } else if (signInErr.code === 'auth/wrong-password') {
        return { 
          success: false, 
          error: 'Incorrect password for this account. Please try again.' 
        };
      } else {
        throw signInErr;
      }
    }

    // 2. Fetch or Create User Profile Document in Firestore: users/{userId}
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    const derivedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const initialName = role === 'OPERATOR' ? 'Chief Train Controller' : derivedName;

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        email: cleanEmail,
        displayName: initialName,
        role: role,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferredLanguage: 'English'
      });
    } else {
      await setDoc(userDocRef, {
        lastLoginAt: new Date().toISOString(),
        role: role
      }, { merge: true });
    }

    const authUser = formatAuthUser(fbUser, role, {
      name: userDocSnap.exists() ? userDocSnap.data()?.displayName || initialName : initialName,
      role: role
    });

    return { success: true, user: authUser };

  } catch (err: any) {
    console.warn('Firebase Auth error, fallback to offline local session:', err);
    
    // Graceful fallback for offline / preview sandbox
    const fallbackUser: AuthUser = {
      email: cleanEmail,
      role: role,
      name: role === 'OPERATOR' 
        ? 'Chief Train Controller' 
        : cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      department: role === 'OPERATOR' 
        ? 'Control Office - Western Railway (BCT Division)' 
        : 'Commuter / Live Traveler Portal',
      badgeId: role === 'OPERATOR' ? 'IR-WR-OP-8492' : undefined,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    return { success: true, user: fallbackUser };
  }
}

/**
 * Sign Out from Firebase
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Failed to sign out from Firebase:', e);
  }
}

/**
 * Subscribes to live Firestore user alerts: users/{userId}/alerts
 */
export function subscribeToUserAlerts(
  userId: string,
  onUpdate: (alerts: FirestoreUserAlert[]) => void
): () => void {
  try {
    const alertsRef = collection(db, 'users', userId, 'alerts');
    const q = query(alertsRef, orderBy('createdAt', 'desc'), limit(20));

    return onSnapshot(q, (snapshot) => {
      const list: FirestoreUserAlert[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<FirestoreUserAlert, 'id'>)
        });
      });
      onUpdate(list);
    }, (error) => {
      console.warn('Firestore alerts subscription error:', error);
    });
  } catch (e) {
    console.warn('Failed to subscribe to alerts:', e);
    return () => {};
  }
}

/**
 * Adds a new alert to Firestore: users/{userId}/alerts
 */
export async function saveUserAlert(
  userId: string,
  alert: Omit<FirestoreUserAlert, 'id' | 'createdAt'>
): Promise<string | null> {
  try {
    const alertsRef = collection(db, 'users', userId, 'alerts');
    const docRef = await addDoc(alertsRef, {
      ...alert,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (e) {
    console.error('Failed to save alert in Firestore:', e);
    return null;
  }
}

/**
 * Deletes an alert from Firestore: users/{userId}/alerts/{alertId}
 */
export async function removeUserAlert(
  userId: string,
  alertId: string
): Promise<boolean> {
  try {
    const alertDocRef = doc(db, 'users', userId, 'alerts', alertId);
    await deleteDoc(alertDocRef);
    return true;
  } catch (e) {
    console.error('Failed to delete alert in Firestore:', e);
    return false;
  }
}

/**
 * Subscribes to recent train searches in Firestore: users/{userId}/recentSearches
 */
export function subscribeToRecentSearches(
  userId: string,
  onUpdate: (searches: FirestoreRecentSearch[]) => void
): () => void {
  try {
    const searchRef = collection(db, 'users', userId, 'recentSearches');
    const q = query(searchRef, orderBy('searchedAt', 'desc'), limit(8));

    return onSnapshot(q, (snapshot) => {
      const list: FirestoreRecentSearch[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<FirestoreRecentSearch, 'id'>)
        });
      });
      onUpdate(list);
    }, (error) => {
      console.warn('Firestore searches subscription error:', error);
    });
  } catch (e) {
    console.warn('Failed to subscribe to recent searches:', e);
    return () => {};
  }
}

/**
 * Logs a train search to Firestore: users/{userId}/recentSearches
 */
export async function logRecentSearch(
  userId: string,
  searchItem: Omit<FirestoreRecentSearch, 'id' | 'searchedAt'>
): Promise<void> {
  try {
    const searchRef = collection(db, 'users', userId, 'recentSearches');
    await addDoc(searchRef, {
      ...searchItem,
      searchedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Failed to log search to Firestore:', e);
  }
}
