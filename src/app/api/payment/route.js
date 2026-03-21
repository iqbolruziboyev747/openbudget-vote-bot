import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../lib/firebaseAdmin';
import { getFathNodeDb } from '../../../lib/fathNodeAdmin';
import { issueLicenseForCheckout } from '../../../lib/licenseService';
import { CONTRACT_TERMS, SELLER_LEGAL_INFO } from '../../../lib/legalInfo';
import { DEFAULT_PRICING, makePlansFromPricing, normalizePricing } from '../../../lib/pricing';

// Temporary test mode: bypass Payme checkout and issue license immediately.
const TEST_PAYMENT_MODE = true;

function generateOrderId() {
  const tail = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-8);
  return `7${tail}`;
}

function toNumericOrderId(orderId) {
  return /^\d+$/.test(orderId) ? Number(orderId) : null;
}

function resolvePublicOrigin(request) {
  const configuredBaseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').trim();

  const forwardedHost = (request.headers.get('x-forwarded-host') || '').trim();
  if (forwardedHost) {
    const forwardedProto = (request.headers.get('x-forwarded-proto') || 'https').trim();
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = (request.headers.get('host') || '').trim();
  if (host) {
    return `https://${host}`;
  }

  const origin = new URL(request.url).origin;
  if (origin.includes('0.0.0.0') || origin.includes('localhost')) {
    return configuredBaseUrl || origin;
  }

  return origin;
}

function buildPaymeCheckoutUrl(orderId, amountUZS, account = {}) {
  const merchantId = process.env.PAYME_MERCHANT_ID || '';
  if (!merchantId) {
    return '';
  }

  const amountTiyin = Math.round(Number(amountUZS) * 100);
  const accountEntries = Object.entries({ order_id: orderId, ...account })
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `ac.${key}=${String(value)}`);

  const payload = [`m=${merchantId}`, ...accountEntries, `a=${amountTiyin}`].join(';');
  const encoded = Buffer.from(payload).toString('base64');
  return `https://checkout.paycom.uz/${encoded}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      planId,
      userId,
      email,
      accountId,
      legalAccepted,
      buyer = {},
      installationSupport = {},
    } = body;

    if (!planId || !userId || !email || !accountId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!legalAccepted) {
      return new Response(JSON.stringify({ error: 'Legal agreement must be accepted' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!buyer.fullName || !buyer.passport || !buyer.phone || !buyer.address) {
      return new Response(JSON.stringify({ error: 'Buyer legal fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getAdminDb();

    const pricingDoc = await db.collection('app_settings').doc('pricing').get();
    const pricing = normalizePricing(pricingDoc.exists ? pricingDoc.data() : DEFAULT_PRICING);
    const plans = makePlansFromPricing(pricing);

    if (!plans[planId]) {
      return new Response(JSON.stringify({ error: 'Invalid planId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const origin = resolvePublicOrigin(request);
    const projectCode = process.env.PAYME_PROJECT_CODE || 'fathrobot';
    const plan = plans[planId];
    const wantsInstallationSupport = Boolean(installationSupport.selected);
    const installationSupportAmount = wantsInstallationSupport ? pricing.installationSupport : 0;
    const finalAmountUZS = plan.amountUZS + installationSupportAmount;
    const orderId = generateOrderId();
    const orderIdNumeric = toNumericOrderId(orderId);
    const checkoutRef = db.collection('checkoutRequests').doc();
    const confirmUrl = `${origin}/api/payment/confirm`;
    const checkoutUrl = TEST_PAYMENT_MODE ? '' : buildPaymeCheckoutUrl(orderId, finalAmountUZS);

    if (!TEST_PAYMENT_MODE && !checkoutUrl) {
      return new Response(JSON.stringify({ error: 'PAYME_MERCHANT_ID is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = FieldValue.serverTimestamp();
    const normalizedAccountId = String(accountId).trim();
    const contractSnapshot = {
      accepted: true,
      acceptedAt: now,
      buyer: {
        fullName: String(buyer.fullName).trim(),
        passport: String(buyer.passport).trim(),
        phone: String(buyer.phone).trim(),
        address: String(buyer.address).trim(),
      },
      seller: SELLER_LEGAL_INFO,
      terms: CONTRACT_TERMS,
    };

    const supportSnapshot = {
      selected: wantsInstallationSupport,
      amountUZS: installationSupportAmount,
      preferredTime: wantsInstallationSupport ? String(installationSupport.preferredTime || '').trim() : '',
      phone: wantsInstallationSupport ? String(installationSupport.phone || buyer.phone || '').trim() : '',
      telegram: wantsInstallationSupport ? String(installationSupport.telegram || '').trim() : '',
      note: wantsInstallationSupport ? String(installationSupport.note || '').trim() : '',
    };

    if (wantsInstallationSupport && (!supportSnapshot.preferredTime || !supportSnapshot.phone || !supportSnapshot.telegram)) {
      return new Response(JSON.stringify({ error: 'Installation support fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const batch = db.batch();

    batch.set(checkoutRef, {
      userUid: userId,
      email,
      accountId: normalizedAccountId,
      planId,
      planName: plan.label,
      planMonths: plan.months,
      amountUZS: finalAmountUZS,
      amountTiyin: finalAmountUZS * 100,
      baseAmountUZS: plan.amountUZS,
      installationSupportAmountUZS: installationSupportAmount,
      provider: TEST_PAYMENT_MODE ? 'test' : 'payme',
      projectCode,
      orderId,
      orderIdNumeric,
      confirmUrl,
      status: TEST_PAYMENT_MODE ? 'paid' : 'pending',
      checkoutUrl,
      contractSnapshot,
      installationSupport: supportSnapshot,
      createdAt: now,
      updatedAt: now,
    });

    // Keep a Payme-compatible mirror for shared webhook flows that resolve by order_id.
    batch.set(db.collection('payments').doc(checkoutRef.id), {
      id: checkoutRef.id,
      orderId,
      orderIdNumeric,
      userId,
      email,
      accountId: normalizedAccountId,
      planId,
      planName: plan.label,
      paymentMethod: TEST_PAYMENT_MODE ? 'test' : 'payme',
      provider: TEST_PAYMENT_MODE ? 'test' : 'payme',
      amount: finalAmountUZS,
      amountUZS: finalAmountUZS,
      baseAmountUZS: plan.amountUZS,
      installationSupportAmountUZS: installationSupportAmount,
      currency: 'UZS',
      status: TEST_PAYMENT_MODE ? 'paid' : 'pending',
      project: projectCode,
      checkoutUrl,
      confirmUrl,
      contractSnapshot,
      installationSupport: supportSnapshot,
      createdAt: now,
      updatedAt: now,
    });

    if (wantsInstallationSupport) {
      const supportRef = db.collection('installationSupportRequests').doc(checkoutRef.id);
      batch.set(supportRef, {
        checkoutRequestId: checkoutRef.id,
        orderId,
        userUid: userId,
        email,
        accountId: normalizedAccountId,
        status: 'new',
        amountUZS: installationSupportAmount,
        preferredTime: supportSnapshot.preferredTime,
        phone: supportSnapshot.phone,
        telegram: supportSnapshot.telegram,
        note: supportSnapshot.note,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();

    if (TEST_PAYMENT_MODE) {
      const licenseResult = await issueLicenseForCheckout(db, checkoutRef.id, `test-${orderId}`);

      await db.collection('checkoutRequests').doc(checkoutRef.id).set(
        {
          status: 'paid',
          finalizedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return new Response(
        JSON.stringify({
          success: true,
          testMode: true,
          provider: 'test',
          status: 'paid',
          paymentId: checkoutRef.id,
          orderId,
          plan,
          ...licenseResult,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const fathNodeDb = getFathNodeDb();
    if (!fathNodeDb) {
      throw new Error('FATH_NODE_SERVICE_ACCOUNT_JSON is not configured at runtime');
    }

    await fathNodeDb.collection('payments').doc(checkoutRef.id).set({
      id: checkoutRef.id,
      orderId,
      userId,
      amount: finalAmountUZS,
      currency: 'UZS',
      status: 'pending',
      planId,
      planName: plan.label,
      paymentMethod: 'payme',
      project: projectCode,
      source: 'fathrobot',
      checkoutUrl,
      contractSnapshot,
      installationSupport: supportSnapshot,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        provider: 'payme',
        status: 'pending',
        paymentId: checkoutRef.id,
        orderId,
        checkoutUrl,
        plan,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const userId = searchParams.get('userId');

    if (!paymentId || !userId) {
      return new Response(JSON.stringify({ error: 'paymentId and userId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getAdminDb();
    const doc = await db.collection('checkoutRequests').doc(paymentId).get();

    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Payment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = doc.data();
    if (data.userUid !== userId) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        orderId: data.orderId,
        status: data.status,
        provider: data.provider,
        planId: data.planId,
        amountUZS: data.amountUZS,
        checkoutUrl: data.checkoutUrl,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
