import { getAdminApp } from './firebaseAdmin';
import { getStorage } from 'firebase-admin/storage';

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function parseFirebaseConfigBucket() {
  try {
    const raw = process.env.FIREBASE_CONFIG;
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return String(parsed?.storageBucket || '').trim();
  } catch {
    return '';
  }
}

function bucketCandidates(projectId) {
  return unique([
    String(process.env.FIREBASE_STORAGE_BUCKET || '').trim(),
    String(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '').trim(),
    parseFirebaseConfigBucket(),
    projectId ? `${projectId}.appspot.com` : '',
    projectId ? `${projectId}.firebasestorage.app` : '',
  ]);
}

export async function getResolvedAdminBucket() {
  const app = getAdminApp();
  const storage = getStorage(app);
  const candidates = bucketCandidates(app.options?.projectId);

  for (const name of candidates) {
    try {
      const bucket = storage.bucket(name);
      const [exists] = await bucket.exists();
      if (exists) {
        return bucket;
      }
    } catch {
      // Continue with next candidate.
    }
  }

  throw new Error(
    `No existing storage bucket found. Tried: ${candidates.join(', ') || 'none'}`
  );
}
