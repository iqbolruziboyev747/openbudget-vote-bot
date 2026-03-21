import { getAdminDb } from '../../../../../lib/firebaseAdmin';
import { getResolvedAdminBucket } from '../../../../../lib/adminStorage';
import { requireUserFromRequest } from '../../../../../lib/serverAuth';

function sanitizeFileName(name) {
  return String(name || 'robot-version.ex5').replace(/[\r\n"\\]/g, '_');
}

async function hasActiveLicense(db, uid, email) {
  const checks = [];
  if (uid) {
    checks.push(db.collection('licenses').where('status', '==', 'active').where('userUid', '==', uid).limit(1).get());
    checks.push(db.collection('licenses').where('status', '==', 'active').where('userId', '==', uid).limit(1).get());
  }
  if (email) {
    checks.push(db.collection('licenses').where('status', '==', 'active').where('email', '==', email).limit(1).get());
  }

  if (!checks.length) return false;
  const snaps = await Promise.all(checks);
  return snaps.some((s) => !s.empty);
}

export async function GET(request, { params }) {
  try {
    const user = await requireUserFromRequest(request);
    if (user.error) {
      return Response.json({ error: user.error }, { status: user.status || 401 });
    }

    const resolvedParams = await params;
    const versionId = resolvedParams?.versionId;
    if (!versionId) {
      return Response.json({ error: 'Invalid version id' }, { status: 400 });
    }

    const db = getAdminDb();
    const allowed = await hasActiveLicense(db, user.uid, user.email);
    if (!allowed) {
      return Response.json({ error: 'Active license required' }, { status: 403 });
    }

    const versionDoc = await db.collection('robotVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      return Response.json({ error: 'Version not found' }, { status: 404 });
    }

    const data = versionDoc.data() || {};
    const objectPath = String(data.objectPath || '').trim();
    if (!objectPath) {
      return Response.json({ error: 'Download file missing for this version' }, { status: 404 });
    }

    const bucket = await getResolvedAdminBucket();
    const file = bucket.file(objectPath);

    const [exists] = await file.exists();
    if (!exists) {
      return Response.json({ error: 'File not found in storage' }, { status: 404 });
    }

    const [contents] = await file.download();
    const fileName = sanitizeFileName(data.fileName || objectPath.split('/').pop() || `fath-${data.version || 'latest'}.ex5`);
    const contentType = String(data.contentType || 'application/octet-stream');

    return new Response(contents, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=0, no-store',
      },
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'server_error' }, { status: 500 });
  }
}
