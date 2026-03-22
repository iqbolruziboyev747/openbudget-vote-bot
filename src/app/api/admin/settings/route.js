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
        testVideos: Array.isArray(data.testVideos)
          ? data.testVideos.map((v) => ({
              title: String(v.title || '').trim(),
              url: String(v.url || '').trim(),
              storagePath: String(v.storagePath || v.objectPath || '').trim(),
            })).filter((v) => v.url)
          : [],
        homeVideos: Array.isArray(data.homeVideos)
          ? data.homeVideos.map((v) => ({
              title: String(v.title || '').trim(),
              url: String(v.url || '').trim(),
              storagePath: String(v.storagePath || v.objectPath || '').trim(),
            })).filter((v) => v.url)
          : [],
        partnerBrokers: Array.isArray(data.partnerBrokers)
          ? data.partnerBrokers.map((b) => ({
              name: String(b.name || '').trim(),
              url: String(b.url || '').trim(),
              logoUrl: String(b.logoUrl || '').trim(),
              storagePath: String(b.storagePath || '').trim(),
            })).filter((b) => b.name && b.logoUrl)
          : [],
        robotProfiles: Array.isArray(data.robotProfiles)
          ? data.robotProfiles.map((p) => ({
              id: String(p.id || '').trim(),
              name: String(p.name || '').trim(),
              fileUrl: String(p.fileUrl || '').trim(),
              storagePath: String(p.storagePath || '').trim(),
            })).filter((p) => p.id && p.fileUrl)
          : [],
        teamMembers: Array.isArray(data.teamMembers)
          ? data.teamMembers.map((m) => ({
              name: String(m.name || '').trim(),
              role: String(m.role || '').trim(),
              bio: String(m.bio || '').trim(),
              photoUrl: String(m.photoUrl || '').trim(),
              storagePath: String(m.storagePath || '').trim(),
              telegram: String(m.telegram || '').trim(),
              instagram: String(m.instagram || '').trim(),
              linkedin: String(m.linkedin || '').trim(),
            })).filter((m) => m.name && m.photoUrl)
          : [],
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

    if (type === 'terms_of_use') {
      const sections = Array.isArray(data.sections) ? data.sections : [];
      const sanitized = sections.map((s) => ({
        title: String(s.title || '').trim(),
        content: String(s.content || '').trim(),
        items: Array.isArray(s.items) ? s.items.map((i) => String(i || '').trim()).filter(Boolean) : [],
        highlight: !!s.highlight,
      })).filter((s) => s.title);

      await db.collection('app_settings').doc('terms_of_use').set(
        {
          sections: sanitized,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: admin.uid,
        },
      );

      return Response.json({ ok: true, sectionsCount: sanitized.length }, { status: 200 });
    }

    return Response.json({ error: 'Invalid settings type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'server_error' }, { status: 500 });
  }
}
