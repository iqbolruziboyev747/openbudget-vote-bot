import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../../lib/firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { licenseKey, accountId } = body;

    if (!licenseKey) {
      return new Response(JSON.stringify({ valid: false, reason: 'licenseKey is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!accountId) {
      return new Response(JSON.stringify({ valid: false, reason: 'accountId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getAdminDb();
    const querySnap = await db
      .collection('licenses')
      .where('licenseKey', '==', licenseKey)
      .limit(1)
      .get();

    if (querySnap.empty) {
      return new Response(JSON.stringify({ valid: false, reason: 'license_not_found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const licenseDoc = querySnap.docs[0];
    const license = licenseDoc.data();

    if (license.accountId !== accountId) {
      return new Response(JSON.stringify({ valid: false, reason: 'account_mismatch' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (license.status !== 'active') {
      return new Response(JSON.stringify({ valid: false, reason: 'inactive_license' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const expiresAtDate = license.expiresAt?.toDate?.();
    if (!expiresAtDate) {
      return new Response(JSON.stringify({ valid: false, reason: 'missing_expiry' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (expiresAtDate.getTime() <= Date.now()) {
      await licenseDoc.ref.update({
        status: 'expired',
        updatedAt: FieldValue.serverTimestamp(),
      });

      return new Response(
        JSON.stringify({
          valid: false,
          reason: 'expired',
          expiresAt: expiresAtDate.toISOString(),
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await licenseDoc.ref.update({
      lastValidatedAt: FieldValue.serverTimestamp(),
      validationCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return new Response(
      JSON.stringify({
        valid: true,
        licenseId: licenseDoc.id,
        accountId: license.accountId,
        planMonths: license.planMonths,
        expiresAt: expiresAtDate.toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ valid: false, reason: 'server_error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
