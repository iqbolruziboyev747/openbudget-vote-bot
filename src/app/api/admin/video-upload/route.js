import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { getResolvedAdminBucket } from '../../../../lib/adminStorage';
import { requireAdminFromRequest } from '../../../../lib/serverAuth';
import { FieldValue } from 'firebase-admin/firestore';

function safeName(input) {
  return String(input || '')
    .trim()
    .replace(/[^0-9a-zA-Z._-]/g, '_')
    .slice(0, 80);
}

export async function POST(request) {
  try {
    const admin = await requireAdminFromRequest(request);
    if (admin.error) {
      return Response.json({ error: admin.error }, { status: admin.status || 403 });
    }

    const formData = await request.formData();
    const title = String(formData.get('title') || '').trim();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return Response.json({ error: 'Video fayl majburiy' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!buffer.length) {
      return Response.json({ error: 'Bo\'sh fayl yuklab bo\'lmaydi' }, { status: 400 });
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (buffer.length > maxSize) {
      return Response.json({ error: 'Fayl hajmi 100 MB dan oshmasligi kerak' }, { status: 400 });
    }

    const originalName = String(file.name || 'video.mp4');
    const ext = originalName.split('.').pop()?.toLowerCase() || 'mp4';
    const allowed = ['mp4', 'webm', 'mov', 'avi'];
    if (!allowed.includes(ext)) {
      return Response.json({ error: `Ruxsat etilgan formatlar: ${allowed.join(', ')}` }, { status: 400 });
    }

    const stamp = Date.now();
    const slug = safeName(title || 'video');
    const objectPath = `videos/${slug}-${stamp}.${ext}`;

    const bucket = await getResolvedAdminBucket();
    const target = bucket.file(objectPath);

    await target.save(buffer, {
      resumable: false,
      metadata: {
        contentType: file.type || 'video/mp4',
        metadata: {
          originalName,
          uploadedBy: admin.uid,
          title,
        },
      },
    });

    await target.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${objectPath}`;

    return Response.json({ ok: true, url: publicUrl, objectPath, title }, { status: 200 });
  } catch (err) {
    console.error('[video-upload] error:', err);
    return Response.json({ error: 'Video yuklashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await requireAdminFromRequest(request);
    if (admin.error) {
      return Response.json({ error: admin.error }, { status: admin.status || 403 });
    }

    const body = await request.json();
    const objectPath = String(body.objectPath || '').trim();

    if (!objectPath || !objectPath.startsWith('videos/')) {
      return Response.json({ error: 'Noto\'g\'ri objectPath' }, { status: 400 });
    }

    const bucket = await getResolvedAdminBucket();
    const target = bucket.file(objectPath);
    const [exists] = await target.exists();

    if (exists) {
      await target.delete();
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[video-delete] error:', err);
    return Response.json({ error: 'Video o\'chirishda xatolik' }, { status: 500 });
  }
}
