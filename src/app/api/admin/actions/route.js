import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';
import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { getResolvedAdminBucket } from '../../../../lib/adminStorage';
import { requireAdminFromRequest } from '../../../../lib/serverAuth';
import { SELLER_LEGAL_INFO } from '../../../../lib/legalInfo';

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

    if (action === 'create_license') {
      const accountId = String(body.accountId || '').trim();
      const planId = String(body.planId || '').trim();
      const email = String(body.email || '').trim();
      const fullName = String(body.fullName || '').trim();
      const months = Number(body.months) || ({ m1: 1, m3: 3, m6: 6, y1: 12 }[planId]) || 0;

      if (!accountId || !months || !planId) {
        return Response.json({ error: 'accountId, planId va months kerak' }, { status: 400 });
      }

      const licenseKey = `FATH-${randomBytes(3).toString('hex').toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      let sellerInfo = SELLER_LEGAL_INFO;
      try {
        const profileSnap = await db.collection('app_settings').doc('site_profile').get();
        if (profileSnap.exists) {
          const p = profileSnap.data();
          if (p.sellerOwnerFullName) {
            sellerInfo = {
              brand: p.sellerBrand || SELLER_LEGAL_INFO.brand,
              ownerFullName: p.sellerOwnerFullName || SELLER_LEGAL_INFO.ownerFullName,
              legalForm: p.sellerLegalForm || SELLER_LEGAL_INFO.legalForm,
              inn: p.sellerInn || SELLER_LEGAL_INFO.inn,
              registrationNumber: p.sellerRegistrationNumber || SELLER_LEGAL_INFO.registrationNumber,
              registrationDate: p.sellerRegistrationDate || SELLER_LEGAL_INFO.registrationDate,
              issuer: p.sellerIssuer || SELLER_LEGAL_INFO.issuer,
              legalAddress: p.sellerLegalAddress || SELLER_LEGAL_INFO.legalAddress,
              phone: p.sellerPhone || SELLER_LEGAL_INFO.phone || '',
              telegram: p.sellerTelegram || SELLER_LEGAL_INFO.telegram || '',
            };
          }
        }
      } catch {}

      const planNames = { m1: 'MONTHLY', m3: 'QUARTER', m6: 'HALF-YEAR', y1: 'YEARLY' };
      const licenseRef = db.collection('licenses').doc();

      await licenseRef.set({
        userUid: '',
        email: email || '',
        accountId,
        planId,
        planName: planNames[planId] || planId,
        planMonths: months,
        amountLabel: 'Admin tomonidan yaratilgan',
        amountUZS: 0,
        provider: 'admin',
        paymentRef: null,
        status: 'active',
        licenseKey,
        certificate: {
          licenseId: licenseRef.id,
          documentNumber: `CERT-${licenseRef.id.slice(0, 8).toUpperCase()}`,
          seller: sellerInfo,
          buyer: { fullName: fullName || '', passport: '', phone: '', address: '' },
          terms: [],
          agreementAcceptedAt: null,
          issuedForPlan: planNames[planId] || planId,
          accountId,
          generatedAt: FieldValue.serverTimestamp(),
        },
        contract: {
          contractNumber: `CTR-${licenseRef.id.slice(0, 8).toUpperCase()}`,
          seller: sellerInfo,
          buyer: { fullName: fullName || '', passport: '', phone: '', address: '' },
          terms: [],
          obligations: [
            'Savdo xavfi mijoz tomonidan qabul qilinadi.',
            'Litsenziya faqat biriktirilgan bitta MT5 hisobda amal qiladi.',
            'Litsenziya muddati tanlangan tarifga muvofiq belgilanadi.',
            'Litsenziya kalitini uchinchi shaxslarga berish taqiqlanadi.',
          ],
          agreementAcceptedAt: null,
          generatedAt: FieldValue.serverTimestamp(),
        },
        issuedAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        lastValidatedAt: null,
        validationCount: 0,
        createdBy: admin.uid,
      });

      return Response.json({ ok: true, licenseId: licenseRef.id, licenseKey }, { status: 200 });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'server_error' }, { status: 500 });
  }
}
