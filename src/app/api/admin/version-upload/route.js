import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { getResolvedAdminBucket } from '../../../../lib/adminStorage';
import { requireAdminFromRequest } from '../../../../lib/serverAuth';

function safeVersion(input) {
  return String(input || '').trim().replace(/[^0-9a-zA-Z._-]/g, '');
}

export async function POST(request) {
  try {
    const admin = await requireAdminFromRequest(request);
    if (admin.error) {
      return Response.json({ error: admin.error }, { status: admin.status || 403 });
    }

    const formData = await request.formData();
    const version = safeVersion(formData.get('version'));
    const notes = String(formData.get('notes') || '').trim();
    const file = formData.get('file');

    if (!version || !file) {
      return Response.json({ error: 'version and file are required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!buffer.length) {
      return Response.json({ error: 'Empty file is not allowed' }, { status: 400 });
    }

    const ext = String(file.name || '').toLowerCase().endsWith('.mq5') ? 'mq5' : 'ex5';
    const objectPath = `robots/fath-${version}.${ext}`;

    const bucket = await getResolvedAdminBucket();
    const target = bucket.file(objectPath);

    await target.save(buffer, {
      resumable: false,
      metadata: {
        contentType: file.type || 'application/octet-stream',
        metadata: {
          originalName: String(file.name || ''),
          uploadedBy: admin.uid,
        },
      },
    });

    const db = getAdminDb();
    const docRef = db.collection('robotVersions').doc();

    await docRef.set({
      version,
      notes,
      fileName: file.name || `fath-${version}.${ext}`,
      objectPath,
      contentType: file.type || 'application/octet-stream',
      status: 'current',
      publishedAt: FieldValue.serverTimestamp(),
      createdBy: admin.uid,
      createdByEmail: admin.email || '',
    });

    return Response.json({ ok: true, id: docRef.id }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error?.message || 'server_error' }, { status: 500 });
  }
}
