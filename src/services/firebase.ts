import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
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
import { AuthUser, UserRole, UserActivity, ActivityType } from '../types';

// Initialize Firebase App instance safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Analytics safely for browser environment
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional in restricted iframe/preview environments
  });
}

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with long-polling resilience for browser/iframe environments
function initFirestore(): Firestore {
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  const targetDb = dbId && dbId !== '(default)' ? dbId : undefined;
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: true,
    } as any, targetDb);
  } catch {
    try {
      return targetDb ? getFirestore(app, targetDb) : getFirestore(app);
    } catch {
      return getFirestore(app);
    }
  }
}

export const db: Firestore = initFirestore();

// Google Auth Provider with Google Docs & Drive Workspace Scopes
export const GOOGLE_WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
];

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// In-memory token cache (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export function getCachedGoogleAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedGoogleAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Note:', JSON.stringify(errInfo));
}

// Test initial connection
export async function testFirestoreConnection(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await getDoc(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info('Firebase operates in offline-cached mode while connecting.');
    }
  }
}
setTimeout(() => {
  testFirestoreConnection();
}, 2000);

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
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    phone: customData?.phone,
    totalSearches: customData?.totalSearches ?? 0,
    totalSimulations: customData?.totalSimulations ?? 0
  };
}

/**
 * Save / Update User Profile in Firestore
 */
export async function syncUserProfileToFirestore(
  fbUser: FirebaseUser,
  role: UserRole,
  extraProfileData: {
    displayName?: string;
    department?: string;
    badgeId?: string;
    phone?: string;
    pnrOrTicket?: string;
  } = {}
): Promise<void> {
  const path = `users/${fbUser.uid}`;
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    const now = new Date().toISOString();
    const cleanEmail = (fbUser.email || '').toLowerCase();
    const displayName = extraProfileData.displayName || fbUser.displayName || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        email: cleanEmail,
        displayName: displayName,
        role: role,
        createdAt: now,
        lastLoginAt: now,
        preferredLanguage: 'English',
        department: extraProfileData.department || (role === 'OPERATOR' ? 'Western Railway BCT Division' : 'Commuter Portal'),
        badgeId: extraProfileData.badgeId || (role === 'OPERATOR' ? 'IR-WR-OP-8492' : null),
        phone: extraProfileData.phone || '',
        totalSearches: 0,
        totalSimulations: 0
      });
    } else {
      await setDoc(userDocRef, {
        lastLoginAt: now,
        role: role,
        ...(extraProfileData.displayName ? { displayName: extraProfileData.displayName } : {}),
        ...(extraProfileData.phone ? { phone: extraProfileData.phone } : {}),
        ...(extraProfileData.department ? { department: extraProfileData.department } : {})
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Log user activity into Firestore audit collection: users/{userId}/activities
 */
export async function logUserActivity(
  userId: string,
  activity: {
    activityType: ActivityType;
    title: string;
    details: string;
    metadata?: Record<string, any>;
  }
): Promise<string | null> {
  if (!userId) return null;
  const path = `users/${userId}/activities`;
  try {
    const actRef = collection(db, 'users', userId, 'activities');
    const docRef = await addDoc(actRef, {
      userId,
      activityType: activity.activityType,
      title: activity.title,
      details: activity.details,
      timestamp: new Date().toISOString(),
      metadata: activity.metadata ? JSON.stringify(activity.metadata) : ''
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return null;
  }
}

/**
 * Subscribes to live user activity logs: users/{userId}/activities
 */
export function subscribeToUserActivities(
  userId: string,
  onUpdate: (activities: UserActivity[]) => void
): () => void {
  if (!userId) return () => {};
  const path = `users/${userId}/activities`;
  try {
    const actRef = collection(db, 'users', userId, 'activities');
    const q = query(actRef, orderBy('timestamp', 'desc'), limit(30));

    return onSnapshot(q, (snapshot) => {
      const list: UserActivity[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let parsedMetadata: Record<string, any> | undefined;
        if (data.metadata) {
          try {
            parsedMetadata = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
          } catch {
            parsedMetadata = undefined;
          }
        }
        list.push({
          id: docSnap.id,
          userId: data.userId || userId,
          activityType: data.activityType || 'LOGIN',
          title: data.title || '',
          details: data.details || '',
          timestamp: data.timestamp || new Date().toISOString(),
          metadata: parsedMetadata
        });
      });
      onUpdate(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

/**
 * Sign In Existing User via Firebase Auth + sync profile & activity
 */
export async function signInUser(
  email: string,
  pass: string,
  role: UserRole = 'PASSENGER'
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your password.' };
  }

  // Operator official credential verification
  if (role === 'OPERATOR') {
    if (cleanEmail === 'trainoperator@gmail.com' && cleanPass === 'eta161739') {
      const authUser: AuthUser = {
        uid: 'official-operator-8492',
        email: cleanEmail,
        role: 'OPERATOR',
        name: 'Chief Train Controller',
        department: 'Control Office - Western Railway (BCT Division)',
        badgeId: 'IR-WR-OP-8492',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      logUserActivity(authUser.uid, {
        activityType: 'LOGIN',
        title: 'Logged in as Chief Section Controller',
        details: `Sign-in session initiated from ${cleanEmail} via Official Operator Portal.`
      }).catch(() => {});

      return { success: true, user: authUser };
    } else {
      // Check if this operator account is registered in Firebase Auth
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        const fbUser = userCredential.user;
        const authUser = formatAuthUser(fbUser, 'OPERATOR');
        return { success: true, user: authUser };
      } catch {
        return {
          success: false,
          error: 'Invalid Operator credentials. Access restricted to authorized Railway Controllers.'
        };
      }
    }
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const fbUser = userCredential.user;

    const authUser = formatAuthUser(fbUser, 'PASSENGER');

    // Non-blocking background sync
    syncUserProfileToFirestore(fbUser, 'PASSENGER').catch(() => {});
    logUserActivity(fbUser.uid, {
      activityType: 'LOGIN',
      title: 'Logged in as Commuter',
      details: `Sign-in session initiated from ${cleanEmail} via Firebase Auth.`
    }).catch(() => {});

    return { success: true, user: authUser };

  } catch (err: any) {
    console.warn('Firebase sign-in note:', err);

    let errorMsg = 'Failed to sign in. Please verify your credentials.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
      errorMsg = 'No account found with this email, or password was incorrect. Click "New Registration" to sign up.';
    } else if (err.code === 'auth/wrong-password') {
      errorMsg = 'Incorrect password. Please try again.';
    } else if (err.code === 'auth/too-many-requests') {
      errorMsg = 'Access temporarily disabled due to many failed attempts. Please try again later.';
    }

    return { success: false, error: errorMsg };
  }
}

/**
 * Sign Up New User via Firebase Auth + save profile in Firestore + log activity
 */
export async function signUpUser(
  email: string,
  pass: string,
  name: string,
  role: UserRole = 'PASSENGER',
  extraData: {
    phone?: string;
    department?: string;
    badgeId?: string;
    pnrOrTicket?: string;
  } = {}
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();
  const cleanName = name.trim();

  if (!cleanEmail) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!cleanPass || cleanPass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  if (!cleanName) {
    return { success: false, error: 'Please enter your full name.' };
  }

  // Operator sign up is blocked - Operator portal is sign in only
  if (role === 'OPERATOR') {
    return { 
      success: false, 
      error: 'Operator registration is disabled. Railway Section Controller access is sign-in only with official credentials.' 
    };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const fbUser = userCredential.user;

    // Non-blocking profile update & sync
    updateProfile(fbUser, { displayName: cleanName }).catch(() => {});
    syncUserProfileToFirestore(fbUser, role, {
      displayName: cleanName,
      phone: extraData.phone,
      department: extraData.department,
      badgeId: extraData.badgeId,
      pnrOrTicket: extraData.pnrOrTicket
    }).catch(() => {});
    logUserActivity(fbUser.uid, {
      activityType: 'SIGN_UP',
      title: `Account Created (${role})`,
      details: `New account registered for ${cleanName} (${cleanEmail}).`
    }).catch(() => {});

    const authUser = formatAuthUser(fbUser, role, {
      name: cleanName,
      department: extraData.department,
      badgeId: extraData.badgeId,
      pnrOrTicket: extraData.pnrOrTicket,
      phone: extraData.phone
    });

    return { success: true, user: authUser };

  } catch (err: any) {
    console.warn('Firebase sign up error:', err);

    let errorMsg = 'Failed to create account.';
    if (err.code === 'auth/email-already-in-use') {
      errorMsg = 'An account with this email already exists. Please switch to Sign In.';
    } else if (err.code === 'auth/weak-password') {
      errorMsg = 'Password is too weak. Please use at least 6 characters with letters and numbers.';
    } else if (err.code === 'auth/invalid-email') {
      errorMsg = 'The email address is invalid.';
    }

    return { success: false, error: errorMsg };
  }
}

/**
 * Sign in with Google Popup (Passenger Only)
 */
export async function signInWithGoogle(
  role: UserRole = 'PASSENGER'
): Promise<{ success: boolean; user?: AuthUser; accessToken?: string; error?: string }> {
  if (role === 'OPERATOR') {
    return {
      success: false,
      error: 'Google login is not available for Operator accounts. Please use official Railway credentials.'
    };
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    const authUser = formatAuthUser(fbUser, 'PASSENGER');

    // Non-blocking background sync
    syncUserProfileToFirestore(fbUser, 'PASSENGER').catch(() => {});
    logUserActivity(fbUser.uid, {
      activityType: 'LOGIN',
      title: `Google Sign-in (PASSENGER)`,
      details: `Authenticated via Google Identity for ${fbUser.email}`
    }).catch(() => {});

    return { success: true, user: authUser, accessToken: cachedAccessToken || undefined };
  } catch (err: any) {
    console.warn('Google sign-in status note:', err);

    if (err?.code === 'auth/popup-closed-by-user') {
      return { 
        success: false, 
        error: 'Google Sign-in popup was closed.' 
      };
    }

    if (err?.code === 'auth/unauthorized-domain') {
      return {
        success: false,
        error: 'This domain/localhost is not authorized in Firebase Auth settings. Please use Email/Password sign in.'
      };
    }

    return { 
      success: false, 
      error: err?.message || 'Google Sign-in failed. Please use email and password.' 
    };
  } finally {
    isSigningIn = false;
  }
}

/**
 * Backward-compatible authenticateWithFirebase wrapper
 */
export async function authenticateWithFirebase(
  email: string,
  pass: string,
  role: UserRole = 'PASSENGER'
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  return signInUser(email, pass, role);
}

/**
 * Sign Out from Firebase + log logout activity
 */
export async function logoutFirebase(userId?: string): Promise<void> {
  cachedAccessToken = null;
  if (userId) {
    try {
      await logUserActivity(userId, {
        activityType: 'LOGOUT',
        title: 'Logged Out',
        details: 'User terminated active session.'
      });
    } catch (e) {
      console.warn('Logout log warning:', e);
    }
  }

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
  if (!userId) return () => {};
  const path = `users/${userId}/alerts`;
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
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, path);
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
  if (!userId) return null;
  const path = `users/${userId}/alerts`;
  try {
    const alertsRef = collection(db, 'users', userId, 'alerts');
    const docRef = await addDoc(alertsRef, {
      ...alert,
      createdAt: new Date().toISOString()
    });

    await logUserActivity(userId, {
      activityType: 'CREATE_ALERT',
      title: `Alert Set for Train ${alert.trainNumber}`,
      details: `Notify ${alert.notifyMinutesBefore} mins before arrival at ${alert.stationName} (${alert.stationCode}).`
    });

    return docRef.id;
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
    return null;
  }
}

/**
 * Deletes an alert from Firestore: users/{userId}/alerts/{alertId}
 */
export async function removeUserAlert(
  userId: string,
  alertId: string,
  trainNumber?: string
): Promise<boolean> {
  if (!userId || !alertId) return false;
  const path = `users/${userId}/alerts/${alertId}`;
  try {
    const alertDocRef = doc(db, 'users', userId, 'alerts', alertId);
    await deleteDoc(alertDocRef);

    await logUserActivity(userId, {
      activityType: 'DELETE_ALERT',
      title: `Alert Removed ${trainNumber ? 'for Train ' + trainNumber : ''}`,
      details: `Dismissed notification alert with ID: ${alertId}`
    });

    return true;
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
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
  if (!userId) return () => {};
  const path = `users/${userId}/recentSearches`;
  try {
    const searchRef = collection(db, 'users', userId, 'recentSearches');
    const q = query(searchRef, orderBy('searchedAt', 'desc'), limit(10));

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
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, path);
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
  if (!userId) return;
  const path = `users/${userId}/recentSearches`;
  try {
    const searchRef = collection(db, 'users', userId, 'recentSearches');
    await addDoc(searchRef, {
      ...searchItem,
      searchedAt: new Date().toISOString()
    });

    await logUserActivity(userId, {
      activityType: 'SEARCH_TRAIN',
      title: `Searched Train ${searchItem.trainNumber}`,
      details: `Looked up live route & ETA for ${searchItem.trainName} (${searchItem.source || 'Origin'} → ${searchItem.destination || 'Destination'})`
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
  }
}
