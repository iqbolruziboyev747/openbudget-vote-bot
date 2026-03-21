import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { issueLicenseForCheckout } from '../../../../lib/licenseService';

function isAuthorized(request) {
  const configuredSecret = process.env.PAYMENT_CONFIRM_SECRET;
  if (!configuredSecret) {
    throw new Error('PAYMENT_CONFIRM_SECRET is not configured');
  }

  const providedSecret = request.headers.get('x-payment-confirm-secret');
  return providedSecret === configuredSecret;
}

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { checkoutRequestId, paymentId, orderId, transactionId, provider } = body;
    const resolvedCheckoutId = checkoutRequestId || paymentId;

    if (!resolvedCheckoutId && !orderId) {
      return new Response(JSON.stringify({ success: false, error: 'checkoutRequestId or orderId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getAdminDb();

    let checkoutId = resolvedCheckoutId;
    if (!checkoutId && orderId) {
      const query = await db.collection('checkoutRequests').where('orderId', '==', String(orderId)).limit(1).get();
      if (query.empty) {
        return new Response(JSON.stringify({ success: false, error: 'Checkout request not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      checkoutId = query.docs[0].id;
    }

    const result = await issueLicenseForCheckout(db, checkoutId, transactionId || paymentId || orderId || null);

    await db.collection('checkoutRequests').doc(checkoutId).set(
      {
        provider: provider || 'payme',
        transactionId: transactionId || null,
        status: 'paid',
        finalizedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        checkoutRequestId: checkoutId,
        ...result,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const status = error.message === 'Checkout request not found' ? 404 : 500;
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
