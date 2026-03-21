import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { issueLicenseForCheckout } from '../../../../lib/licenseService';

export async function POST(request) {
  try {
    const configuredSecret = process.env.LICENSE_ISSUE_SECRET;
    if (!configuredSecret) {
      return new Response(JSON.stringify({ error: 'LICENSE_ISSUE_SECRET is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const providedSecret = request.headers.get('x-license-admin-secret');
    if (providedSecret !== configuredSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { checkoutRequestId, paymentRef } = body;

    if (!checkoutRequestId) {
      return new Response(JSON.stringify({ error: 'checkoutRequestId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getAdminDb();
    const result = await issueLicenseForCheckout(db, checkoutRequestId, paymentRef);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const status = error.message === 'Checkout request not found' ? 404 : 400;
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
