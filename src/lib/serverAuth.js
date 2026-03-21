import { getAdminAuth, getAdminDb } from './firebaseAdmin';

function getBearerToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice('Bearer '.length).trim();
}

export async function requireUserFromRequest(request) {
  const token = getBearerToken(request);
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid || '',
      email: decoded.email || '',
      token,
    };
  } catch (error) {
    return { error: error?.message || 'Unauthorized', status: 401 };
  }
}

export async function requireAdminFromRequest(request) {
  const user = await requireUserFromRequest(request);
  if (user.error) return user;

  const db = getAdminDb();

  const uidDoc = await db.collection('users').doc(user.uid).get();
  if (uidDoc.exists && uidDoc.data()?.isAdmin === true) {
    return { ...user, isAdmin: true };
  }

  if (user.email) {
    const emailSnap = await db
      .collection('users')
      .where('email', '==', user.email)
      .where('isAdmin', '==', true)
      .limit(1)
      .get();
    if (!emailSnap.empty) {
      return { ...user, isAdmin: true };
    }
  }

  return { error: 'Forbidden', status: 403, ...user, isAdmin: false };
}
