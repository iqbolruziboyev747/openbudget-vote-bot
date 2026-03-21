import { getAdminDb } from '../../../lib/firebaseAdmin';
import { requireUserFromRequest } from '../../../lib/serverAuth';

async function hasActiveLicense(db, uid, email) {
  if (!uid && !email) return false;

  const checks = [];
  if (uid) {
    checks.push(db.collection('licenses').where('status', '==', 'active').where('userUid', '==', uid).limit(1).get());
    checks.push(db.collection('licenses').where('status', '==', 'active').where('userId', '==', uid).limit(1).get());
  }
  if (email) {
    checks.push(db.collection('licenses').where('status', '==', 'active').where('email', '==', email).limit(1).get());
  }

  const snaps = await Promise.all(checks);
  return snaps.some((s) => !s.empty);
}

export async function GET(request) {
  try {
    const db = getAdminDb();
    const versionsSnap = await db.collection('robotVersions').orderBy('publishedAt', 'desc').limit(50).get();
    const versions = versionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const user = await requireUserFromRequest(request);
    let canDownload = false;
    let uid = '';

    if (!user.error) {
      uid = user.uid;
      canDownload = await hasActiveLicense(db, user.uid, user.email);
    }

    return Response.json({
      versions,
      canDownload,
      uid,
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'server_error' }, { status: 500 });
  }
}
