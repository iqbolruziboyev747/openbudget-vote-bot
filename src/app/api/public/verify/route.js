import { getAdminDb } from '../../../../lib/firebaseAdmin';

/**
 * Hujjat tekshiruv kodi bo'yicha litsenziyani topib natija qaytaradi.
 * PDF hujjatdagi VRF-XXXX-XXXX kodi orqali soxtalashtirilganligini tekshirish.
 */

function generateVerificationCode(docNumber, licenseKey, buyerName) {
  const raw = `${docNumber}|${licenseKey}|${buyerName || ''}|FATH-SEC-2025`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `VRF-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get('code') || '').trim().toUpperCase();

    if (!code || !code.startsWith('VRF-') || code.length !== 13) {
      return Response.json(
        { valid: false, error: "Noto'g'ri tekshiruv kodi formati" },
        { status: 400 },
      );
    }

    const db = getAdminDb();

    // Barcha aktiv litsenziyalarni qidirish
    const licensesSnap = await db.collection('licenses')
      .where('status', 'in', ['active', 'inactive', 'expired'])
      .get();

    let matchedLicense = null;
    let matchedDocType = null;

    for (const doc of licensesSnap.docs) {
      const lic = doc.data();

      // Guvohnoma tekshiruvi
      const certDocNum = lic.certificate?.documentNumber || `CERT-${doc.id.slice(0, 8).toUpperCase()}`;
      const certBuyer = lic.certificate?.buyer?.fullName || '';
      const certCode = generateVerificationCode(certDocNum, lic.licenseKey, certBuyer);
      if (certCode === code) {
        matchedLicense = { id: doc.id, ...lic };
        matchedDocType = 'guvohnoma';
        break;
      }

      // Shartnoma tekshiruvi
      const ctrDocNum = lic.contract?.contractNumber || `CTR-${doc.id.slice(0, 8).toUpperCase()}`;
      const ctrBuyer = lic.contract?.buyer?.fullName || lic.certificate?.buyer?.fullName || '';
      const ctrCode = generateVerificationCode(ctrDocNum, lic.licenseKey, ctrBuyer);
      if (ctrCode === code) {
        matchedLicense = { id: doc.id, ...lic };
        matchedDocType = 'shartnoma';
        break;
      }
    }

    if (!matchedLicense) {
      return Response.json({
        valid: false,
        code,
        message: 'Bu tekshiruv kodi bilan hujjat topilmadi. Hujjat soxta bo\'lishi mumkin.',
      });
    }

    // Faqat xavfsiz (ommaviy) ma'lumotlarni qaytarish
    const expiresAt = matchedLicense.expiresAt?.toDate?.()?.toISOString?.()
      || matchedLicense.expiresAt || null;
    const issuedAt = matchedLicense.issuedAt?.toDate?.()?.toISOString?.()
      || matchedLicense.issuedAt || null;

    return Response.json({
      valid: true,
      code,
      documentType: matchedDocType,
      license: {
        status: matchedLicense.status,
        planName: matchedLicense.planName || matchedLicense.planId || null,
        issuedAt,
        expiresAt,
        accountIdLast4: matchedLicense.accountId
          ? '****' + String(matchedLicense.accountId).slice(-4)
          : null,
        buyerInitials: matchedLicense.certificate?.buyer?.fullName
          ? matchedLicense.certificate.buyer.fullName.split(' ').map(w => w[0]).join('.') + '.'
          : null,
      },
      message: 'Hujjat haqiqiy va FATH ROBOT tizimida ro\'yxatdan o\'tgan.',
    });
  } catch (err) {
    console.error('Verify API error:', err);
    return Response.json(
      { valid: false, error: 'Ichki xatolik' },
      { status: 500 },
    );
  }
}
