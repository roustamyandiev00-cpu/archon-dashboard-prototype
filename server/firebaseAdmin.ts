/**
 * Firebase Admin SDK Configuration (Server-side only)
 * 
 * Best Practices:
 * - Gebruik alleen in server/API routes
 * - Service account credentials via env vars
 * - Singleton pattern voor admin instance
 */

import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

/**
 * Initialize Firebase Admin SDK
 * 
 * Credentials kunnen op 3 manieren worden geladen:
 * 1. FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string of base64)
 * 2. GOOGLE_APPLICATION_CREDENTIALS env var (path naar JSON file)
 * 3. Default credentials (in Google Cloud omgeving)
 */
export function initializeAdmin(): admin.app.App {
  try {
    // Return existing instance if already initialized
    if (admin.apps.length > 0) {
      adminApp = admin.apps[0]!;
      return adminApp;
    }

    // Option 1: Service account key from env var
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      let credential;
      
      // Try to parse as JSON
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        credential = admin.credential.cert(serviceAccount);
      } catch {
        // Try to decode from base64
        try {
          const decoded = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
          const serviceAccount = JSON.parse(decoded);
          credential = admin.credential.cert(serviceAccount);
        } catch (error) {
          console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
          throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
        }
      }

      adminApp = admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });

      console.log('✅ Firebase Admin initialized with service account');
      return adminApp;
    }

    // Option 2: Use default credentials (works in Cloud Functions, Cloud Run, etc.)
    adminApp = admin.initializeApp();
    console.log('✅ Firebase Admin initialized with default credentials');
    return adminApp;

  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

// Initialize on module load
const currentApp = initializeAdmin();

// Export admin services
export const adminAuth = admin.auth(currentApp);
export const adminDb = admin.firestore(currentApp);
export const adminStorage = admin.storage(currentApp);

// Helper function to verify ID token
export async function verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

// Helper to get user by UID
export async function getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
  return adminAuth.getUser(uid);
}

// Helper to get user by email
export async function getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
  return adminAuth.getUserByEmail(email);
}

// Export admin namespace for advanced usage
export { admin };
export default currentApp;
