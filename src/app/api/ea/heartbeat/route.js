import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../../lib/firebaseAdmin';

export async function POST(request) {
  try {
    const body        = await request.json();
    const licenseKey  = String(body.licenseKey  || '').trim();
    const accountId   = String(body.accountId   || '').trim();
    const terminalId  = String(body.terminalId  || '').trim();
    const balance = Number(body.balance || 0);
    const equity = Number(body.equity || 0);
    const freeMargin = Number(body.freeMargin || 0);
    const marginLevel = Number(body.marginLevel || 0);
    const symbol = String(body.symbol || '').trim();
    const openPositions = Number(body.openPositions || 0);

    if (!licenseKey || !accountId) {
      return Response.json(
        { valid: false, reason: 'licenseKey_and_accountId_required' },
        { status: 400 }
      );
    }

    const db   = getAdminDb();
    const snap = await db
      .collection('licenses')
      .where('licenseKey', '==', licenseKey)
      .limit(1)
      .get();

    if (snap.empty) {
      return Response.json({ valid: false, reason: 'license_not_found' }, { status: 404 });
    }

    const doc  = snap.docs[0];
    const data = doc.data();

    if (String(data.accountId || '') !== accountId) {
      return Response.json({ valid: false, reason: 'account_mismatch' }, { status: 403 });
    }

    if (data.status !== 'active') {
      return Response.json(
        { valid: false, reason: data.status === 'expired' ? 'expired' : 'inactive_license' },
        { status: 403 }
      );
    }

    const expiresAt = data.expiresAt?.toDate?.();
    if (!expiresAt) {
      return Response.json({ valid: false, reason: 'missing_expiry' }, { status: 500 });
    }

    if (expiresAt.getTime() <= Date.now()) {
      await doc.ref.update({ status: 'expired', updatedAt: FieldValue.serverTimestamp() });
      return Response.json(
        { valid: false, reason: 'expired', expiresAt: expiresAt.toISOString() },
        { status: 403 }
      );
    }

    await doc.ref.update({
      lastHeartbeatAt: FieldValue.serverTimestamp(),
      lastSeenAt:      FieldValue.serverTimestamp(),
      robotOnline:     true,
      lastTerminalId:  terminalId || null,
      lastSymbol:      symbol || null,
      lastBalance:     Number.isFinite(balance) ? balance : null,
      lastEquity:      Number.isFinite(equity) ? equity : null,
      lastFreeMargin:  Number.isFinite(freeMargin) ? freeMargin : null,
      lastMarginLevel: Number.isFinite(marginLevel) ? marginLevel : null,
      lastOpenPositions:Number.isFinite(openPositions) ? openPositions : null,
      updatedAt:       FieldValue.serverTimestamp(),
    });

    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000);

    return Response.json({
      valid:     true,
      expiresAt: expiresAt.toISOString(),
      daysLeft,
    });
  } catch (err) {
    return Response.json(
      { valid: false, reason: 'server_error', details: err?.message || 'unknown' },
      { status: 500 }
    );
  }
}
