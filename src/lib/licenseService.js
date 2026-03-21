import { randomBytes } from 'crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { SELLER_LEGAL_INFO } from './legalInfo';

const PLAN_MONTHS = {
  m1: 1,
  m3: 3,
  m6: 6,
  y1: 12,
};

function addMonths(date, months) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + months);
  return value;
}

function createLicenseKey() {
  const p1 = randomBytes(3).toString('hex').toUpperCase();
  const p2 = randomBytes(3).toString('hex').toUpperCase();
  const p3 = randomBytes(3).toString('hex').toUpperCase();
  return `FATH-${p1}-${p2}-${p3}`;
}

function getPlanMonths(checkout) {
  if (Number.isInteger(checkout.planMonths) && checkout.planMonths > 0) {
    return checkout.planMonths;
  }

  if (checkout.planId && PLAN_MONTHS[checkout.planId]) {
    return PLAN_MONTHS[checkout.planId];
  }

  return null;
}

export async function issueLicenseForCheckout(db, checkoutRequestId, paymentRef) {
  const checkoutRef = db.collection('checkoutRequests').doc(checkoutRequestId);

  /* Sotuvchi ma'lumotlarini Firestordan olish (yoki fallback) */
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

  return db.runTransaction(async (transaction) => {
    const checkoutSnap = await transaction.get(checkoutRef);
    if (!checkoutSnap.exists) {
      throw new Error('Checkout request not found');
    }

    const checkout = checkoutSnap.data();
    const months = getPlanMonths(checkout);
    if (!months) {
      throw new Error('Plan months not found in checkout request');
    }

    if (checkout.licenseId) {
      const existingLicenseRef = db.collection('licenses').doc(checkout.licenseId);
      const existingLicenseSnap = await transaction.get(existingLicenseRef);

      if (existingLicenseSnap.exists) {
        return {
          alreadyIssued: true,
          licenseId: existingLicenseRef.id,
          licenseKey: existingLicenseSnap.data().licenseKey,
          expiresAt: existingLicenseSnap.data().expiresAt?.toDate?.()?.toISOString?.() ?? null,
        };
      }
    }

    const licenseRef = db.collection('licenses').doc();
    const expiresAt = addMonths(new Date(), months);
    const licenseKey = createLicenseKey();

    transaction.set(licenseRef, {
      userUid: checkout.userUid,
      email: checkout.email,
      accountId: checkout.accountId,
      planId: checkout.planId ?? null,
      planName: checkout.planName ?? null,
      planMonths: months,
      amountLabel: checkout.amountLabel ?? null,
      amountUZS: checkout.amountUZS ?? null,
      provider: checkout.provider ?? 'payme',
      paymentRef: paymentRef ?? null,
      status: 'active',
      licenseKey,
      certificate: {
        licenseId: licenseRef.id,
        documentNumber: `CERT-${licenseRef.id.slice(0, 8).toUpperCase()}`,
        seller: checkout.contractSnapshot?.seller || sellerInfo,
        buyer: checkout.contractSnapshot?.buyer || null,
        terms: checkout.contractSnapshot?.terms || [],
        agreementAcceptedAt: checkout.contractSnapshot?.acceptedAt || null,
        issuedForPlan: checkout.planName ?? checkout.planId ?? null,
        accountId: checkout.accountId,
        generatedAt: FieldValue.serverTimestamp(),
      },
      contract: {
        contractNumber: `CTR-${licenseRef.id.slice(0, 8).toUpperCase()}`,
        seller: checkout.contractSnapshot?.seller || sellerInfo,
        buyer: checkout.contractSnapshot?.buyer || null,
        terms: checkout.contractSnapshot?.terms || [],
        obligations: [
          'Savdo xavfi mijoz tomonidan qabul qilinadi.',
          'Litsenziya faqat biriktirilgan bitta MT5 hisobda amal qiladi.',
          'Litsenziya muddati tanlangan tarifga muvofiq belgilanadi.',
          'Litsenziya kalitini uchinchi shaxslarga berish taqiqlanadi.',
        ],
        agreementAcceptedAt: checkout.contractSnapshot?.acceptedAt || null,
        generatedAt: FieldValue.serverTimestamp(),
      },
      issuedAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      lastValidatedAt: null,
      validationCount: 0,
    });

    transaction.update(checkoutRef, {
      status: 'paid',
      paymentRef: paymentRef ?? null,
      paidAt: FieldValue.serverTimestamp(),
      licenseId: licenseRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      alreadyIssued: false,
      licenseId: licenseRef.id,
      licenseKey,
      expiresAt: expiresAt.toISOString(),
    };
  });
}
