'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const NON_BLOCKING_PROFILE_ERROR_CODES = new Set([
  'permission-denied',
  'failed-precondition',
  'unavailable',
]);

function normalizeFirebaseCode(err) {
  const raw = err?.code;

  if (!raw || typeof raw !== 'string') {
    return '';
  }

  return raw.startsWith('auth/') || raw.startsWith('firestore/')
    ? raw.split('/')[1]
    : raw;
}

async function ensureUserProfile(user) {
  const fallbackName = user.email ? user.email.split('@')[0] : 'user';

  try {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        email: user.email ?? '',
        displayName: user.displayName || fallbackName,
        photoURL: user.photoURL ?? null,
        isAdmin: false,
        subscriptionTier: 'free',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    const code = normalizeFirebaseCode(err);

    if (NON_BLOCKING_PROFILE_ERROR_CODES.has(code)) {
      // Auth succeeded; Firestore profile write can be retried later.
      console.warn('Profile sync skipped:', code || err?.message || 'unknown');
      return;
    }

    throw err;
  }
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(credential.user);
  return credential.user;
}

export async function ensureEmailUserProfile(user) {
  await ensureUserProfile(user);
}
