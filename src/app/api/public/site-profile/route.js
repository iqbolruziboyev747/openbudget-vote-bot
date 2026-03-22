import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { SELLER_LEGAL_INFO } from '../../../../lib/legalInfo';

const DEFAULT_PROFILE = {
  telegramChannel: 'https://t.me/Fath_EA',
  authorTelegram: 'https://t.me/TraderMQL',
  phone: '+998930012284',
  instagramUrl: '',
  youtubeUrl: '',
  facebookUrl: '',
  guideVideoUrl: '',
};

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('app_settings').doc('site_profile').get();
    const data = snap.exists ? snap.data() : {};

    const profile = {
      telegramChannel: data.telegramChannel || DEFAULT_PROFILE.telegramChannel,
      authorTelegram: data.authorTelegram || DEFAULT_PROFILE.authorTelegram,
      phone: data.phone || DEFAULT_PROFILE.phone,
      instagramUrl: data.instagramUrl || '',
      youtubeUrl: data.youtubeUrl || '',
      facebookUrl: data.facebookUrl || '',
      guideVideoUrl: data.guideVideoUrl || '',
      testVideos: Array.isArray(data.testVideos) ? data.testVideos : [],
      homeVideos: Array.isArray(data.homeVideos) ? data.homeVideos : [],
      partnerBrokers: Array.isArray(data.partnerBrokers) ? data.partnerBrokers : [],
      robotProfiles: Array.isArray(data.robotProfiles) ? data.robotProfiles : [],
      teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
      seller: {
        brand: data.sellerBrand || SELLER_LEGAL_INFO.brand,
        ownerFullName: data.sellerOwnerFullName || SELLER_LEGAL_INFO.ownerFullName,
        legalForm: data.sellerLegalForm || SELLER_LEGAL_INFO.legalForm,
        inn: data.sellerInn || SELLER_LEGAL_INFO.inn,
        registrationNumber: data.sellerRegistrationNumber || SELLER_LEGAL_INFO.registrationNumber,
        registrationDate: data.sellerRegistrationDate || SELLER_LEGAL_INFO.registrationDate,
        issuer: data.sellerIssuer || SELLER_LEGAL_INFO.issuer,
        legalAddress: data.sellerLegalAddress || SELLER_LEGAL_INFO.legalAddress,
        phone: data.sellerPhone || SELLER_LEGAL_INFO.phone || data.phone || DEFAULT_PROFILE.phone,
        telegram: data.sellerTelegram || SELLER_LEGAL_INFO.telegram || '',
      },
    };

    return Response.json({ profile }, { status: 200 });
  } catch {
    return Response.json({ profile: { ...DEFAULT_PROFILE, seller: SELLER_LEGAL_INFO } }, { status: 200 });
  }
}
