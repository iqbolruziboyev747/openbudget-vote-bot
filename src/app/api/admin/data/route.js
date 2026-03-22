import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { requireAdminFromRequest } from '../../../../lib/serverAuth';
import { DEFAULT_PRICING, normalizePricing } from '../../../../lib/pricing';

const DEFAULT_PROFILE = {
  telegramChannel: 'https://t.me/Fath_EA',
  authorTelegram: 'https://t.me/TraderMQL',
  phone: '+998930012284',
  instagramUrl: '',
  youtubeUrl: '',
  facebookUrl: '',
  guideVideoUrl: '',
};

const toRows = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

export async function GET(request) {
  try {
    const admin = await requireAdminFromRequest(request);
    if (admin.error) {
      return Response.json({ error: admin.error, uid: admin.uid || '', email: admin.email || '' }, { status: admin.status || 403 });
    }

    const db = getAdminDb();

    const [licenseSnap, paymentSnap, supportSnap, pricingDoc, profileDoc, versionsSnap, termsDoc] = await Promise.all([
      db.collection('licenses').get(),
      db.collection('checkoutRequests').orderBy('createdAt', 'desc').limit(50).get(),
      db.collection('installationSupportRequests').orderBy('createdAt', 'desc').limit(80).get(),
      db.collection('app_settings').doc('pricing').get(),
      db.collection('app_settings').doc('site_profile').get(),
      db.collection('robotVersions').orderBy('publishedAt', 'desc').limit(25).get(),
      db.collection('app_settings').doc('terms_of_use').get(),
    ]);

    const pricing = normalizePricing(pricingDoc.exists ? pricingDoc.data() : DEFAULT_PRICING);
    const profileRaw = profileDoc.exists ? profileDoc.data() : {};

    const siteProfile = {
      telegramChannel: profileRaw.telegramChannel || DEFAULT_PROFILE.telegramChannel,
      authorTelegram: profileRaw.authorTelegram || DEFAULT_PROFILE.authorTelegram,
      phone: profileRaw.phone || DEFAULT_PROFILE.phone,
      instagramUrl: profileRaw.instagramUrl || '',
      youtubeUrl: profileRaw.youtubeUrl || '',
      facebookUrl: profileRaw.facebookUrl || '',
      guideVideoUrl: profileRaw.guideVideoUrl || '',
      testVideos: Array.isArray(profileRaw.testVideos) ? profileRaw.testVideos : [],
      homeVideos: Array.isArray(profileRaw.homeVideos) ? profileRaw.homeVideos : [],
      partnerBrokers: Array.isArray(profileRaw.partnerBrokers) ? profileRaw.partnerBrokers : [],
      robotProfiles: Array.isArray(profileRaw.robotProfiles) ? profileRaw.robotProfiles : [],
      sellerBrand: profileRaw.sellerBrand || '',
      sellerOwnerFullName: profileRaw.sellerOwnerFullName || '',
      sellerLegalForm: profileRaw.sellerLegalForm || '',
      sellerInn: profileRaw.sellerInn || '',
      sellerRegistrationNumber: profileRaw.sellerRegistrationNumber || '',
      sellerRegistrationDate: profileRaw.sellerRegistrationDate || '',
      sellerIssuer: profileRaw.sellerIssuer || '',
      sellerLegalAddress: profileRaw.sellerLegalAddress || '',
      sellerPhone: profileRaw.sellerPhone || '',
      sellerTelegram: profileRaw.sellerTelegram || '',
    };

    return Response.json(
      {
        ok: true,
        licenses: toRows(licenseSnap),
        payments: toRows(paymentSnap),
        supportRequests: toRows(supportSnap),
        versions: toRows(versionsSnap),
        pricing,
        siteProfile,
        termsOfUse: termsDoc.exists ? (termsDoc.data().sections || []) : [],
        termsUpdatedAt: termsDoc.exists ? (termsDoc.data().updatedAt?.toDate?.()?.toISOString?.() || null) : null,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ error: error?.message || 'server_error' }, { status: 500 });
  }
}
