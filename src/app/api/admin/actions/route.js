import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { getResolvedAdminBucket } from '../../../../lib/adminStorage';
import { requireAdminFromRequest } from '../../../../lib/serverAuth';

export async function POST(request) {
  try {
    const admin = await requireAdminFromRequest(request);
    if (admin.error) {
      return Response.json({ error: admin.error }, { status: admin.status || 403 });
    }

    const body = await request.json();
    const { action } = body;
    const db = getAdminDb();

    if (action === 'deactivate_license') {
      const licenseId = String(body.licenseId || '').trim();
      if (!licenseId) {
        return Response.json({ error: 'licenseId is required' }, { status: 400 });
      }

      await db.collection('licenses').doc(licenseId).set(
        {
          status: 'inactive',
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: admin.uid,
        },
        { merge: true }
      );

      return Response.json({ ok: true }, { status: 200 });
    }

    if (action === 'support_status') {
      const supportId = String(body.supportId || '').trim();
      const status = String(body.status || '').trim();
      if (!supportId || !status) {
        return Response.json({ error: 'supportId and status are required' }, { status: 400 });
      }

      await db.collection('installationSupportRequests').doc(supportId).set(
        {
          status,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: admin.uid,
        },
        { merge: true }
      );

      return Response.json({ ok: true }, { status: 200 });
    }

    if (action === 'delete_version') {
      const versionId = String(body.versionId || '').trim();
      if (!versionId) {
        return Response.json({ error: 'versionId is required' }, { status: 400 });
      }

      const docRef = db.collection('robotVersions').doc(versionId);
      const snap = await docRef.get();
      if (!snap.exists) {
        return Response.json({ error: 'Version not found' }, { status: 404 });
      }

      const objectPath = snap.data().objectPath;
      if (objectPath) {
        try {
          const bucket = await getResolvedAdminBucket();
          await bucket.file(objectPath).delete();
        } catch (e) {
          console.warn('Storage delete warning:', e?.message);
        }
      }

      await docRef.delete();
      return Response.json({ ok: true }, { status: 200 });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'server_error' }, { status: 500 });
  }
}
