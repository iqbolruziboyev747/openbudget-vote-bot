import { getAdminAuth, getAdminDb } from '../../../../lib/firebaseAdmin';

async function getBearerToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice('Bearer '.length).trim();
}

export async function GET(request) {
  try {
    const token = await getBearerToken(request);
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid || '';
    const email = decoded.email || '';

    if (!uid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();

    let isAdmin = false;

    const uidDoc = await db.collection('users').doc(uid).get();
    if (uidDoc.exists && uidDoc.data()?.isAdmin === true) {
      isAdmin = true;
    }

    // Fallback: some older records may exist under a different doc id but same email
    if (!isAdmin && email) {
      const emailSnap = await db
        .collection('users')
        .where('email', '==', email)
        .where('isAdmin', '==', true)
        .limit(1)
        .get();
      if (!emailSnap.empty) isAdmin = true;
    }

    return Response.json({ isAdmin, uid, email }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error?.message || 'server_error' }, { status: 500 });
  }
}
