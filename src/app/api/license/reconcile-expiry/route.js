import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../../lib/firebaseAdmin';

function isAuthorized(request) {
  const configuredSecret = process.env.LICENSE_ISSUE_SECRET;
  if (!configuredSecret) {
    throw new Error('LICENSE_ISSUE_SECRET is not configured');
  }

  return request.headers.get('x-license-admin-secret') === configuredSecret;
}

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getAdminDb();
    const nowTs = Timestamp.fromDate(new Date());
    const activeSnap = await db
      .collection('licenses')
      .where('status', '==', 'active')
      .where('expiresAt', '<=', nowTs)
      .get();

    const batch = db.batch();
    activeSnap.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'expired',
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    if (!activeSnap.empty) {
      await batch.commit();
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiredCount: activeSnap.size,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
