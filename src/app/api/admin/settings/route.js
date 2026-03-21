import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { requireAdminFromRequest } from '../../../../lib/serverAuth';
import { normalizePricing } from '../../../../lib/pricing';

export async function POST(request) {
  try {
    const admin = await requireAdminFromRequest(request);
    if (admin.error) {
      return Response.json({ error: admin.error }, { status: admin.status || 403 });
    }

    const body = await request.json();
    const { type, data = {} } = body;
    const db = getAdminDb();

    if (type === 'pricing') {
      const pricing = normalizePricing(data);
      await db.collection('app_settings').doc('pricing').set(
        {
          ...pricing,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: admin.uid,
        },
        { merge: true }
      );
      return Response.json({ ok: true, pricing }, { status: 200 });
    }

    if (type === 'site_profile') {
      const profile = {
        telegramChannel: String(data.telegramChannel || '').trim(),
        authorTelegram: String(data.authorTelegram || '').trim(),
        phone: String(data.phone || '').trim(),
        instagramUrl: String(data.instagramUrl || '').trim(),
        youtubeUrl: String(data.youtubeUrl || '').trim(),
        facebookUrl: String(data.facebookUrl || '').trim(),
        guideVideoUrl: String(data.guideVideoUrl || '').trim(),
        sellerBrand: String(data.sellerBrand || '').trim(),
        sellerOwnerFullName: String(data.sellerOwnerFullName || '').trim(),
        sellerLegalForm: String(data.sellerLegalForm || '').trim(),
        sellerInn: String(data.sellerInn || '').trim(),
        sellerRegistrationNumber: String(data.sellerRegistrationNumber || '').trim(),
        sellerRegistrationDate: String(data.sellerRegistrationDate || '').trim(),
        sellerIssuer: String(data.sellerIssuer || '').trim(),
        sellerLegalAddress: String(data.sellerLegalAddress || '').trim(),
        sellerPhone: String(data.sellerPhone || '').trim(),
        sellerTelegram: String(data.sellerTelegram || '').trim(),
      };

      await db.collection('app_settings').doc('site_profile').set(
        {
          ...profile,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: admin.uid,
        },
        { merge: true }
      );

      return Response.json({ ok: true, profile }, { status: 200 });
    }

    return Response.json({ error: 'Invalid settings type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'server_error' }, { status: 500 });
  }
}
