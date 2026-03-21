import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../../lib/firebaseAdmin';

function parseNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toIsoOrNow(value) {
  if (!value) return new Date().toISOString();
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return new Date().toISOString();
  return dt.toISOString();
}

function sideFromInput(value) {
  const text = String(value || '').trim().toLowerCase();
  if (text === 'buy' || text === 'sell') return text;
  return 'unknown';
}

export async function POST(request) {
  try {
    const apiSecret = process.env.EA_INGEST_SECRET || '';
    if (apiSecret) {
      const provided = (request.headers.get('x-ea-secret') || '').trim();
      if (!provided || provided !== apiSecret) {
        return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();

    const licenseKey = String(body.licenseKey || '').trim();
    const accountId = String(body.accountId || '').trim();
    const ticket = String(body.ticket || '').trim();

    if (!licenseKey || !accountId || !ticket) {
      return Response.json(
        { ok: false, error: 'licenseKey, accountId, ticket are required' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const licenseSnap = await db
      .collection('licenses')
      .where('licenseKey', '==', licenseKey)
      .limit(1)
      .get();

    if (licenseSnap.empty) {
      return Response.json({ ok: false, error: 'license_not_found' }, { status: 404 });
    }

    const licenseDoc = licenseSnap.docs[0];
    const license = licenseDoc.data();

    if (String(license.accountId || '') !== accountId) {
      return Response.json({ ok: false, error: 'account_mismatch' }, { status: 403 });
    }

    const now = Date.now();
    const expiresAtMs = license.expiresAt?.toDate?.()?.getTime?.() || 0;
    if (license.status !== 'active' || (expiresAtMs && expiresAtMs <= now)) {
      return Response.json({ ok: false, error: 'inactive_or_expired' }, { status: 403 });
    }

    const symbol = String(body.symbol || '').trim() || 'UNKNOWN';
    const side = sideFromInput(body.side);
    const volume = parseNumber(body.volume, 0);
    const pnl = parseNumber(body.pnl, 0);
    const openPrice = parseNumber(body.openPrice, 0);
    const closePrice = parseNumber(body.closePrice, 0);
    const commission = parseNumber(body.commission, 0);
    const swap = parseNumber(body.swap, 0);

    const tradeRefId = `${licenseDoc.id}_${ticket}`;
    const tradeRef = db.collection('tradeResults').doc(tradeRefId);
    const existing = await tradeRef.get();

    const payload = {
      ticket,
      licenseId: licenseDoc.id,
      licenseKey,
      userUid: license.userUid || null,
      userId: license.userUid || null,
      email: license.email || null,
      accountId,
      symbol,
      side,
      volume,
      pnl,
      openPrice,
      closePrice,
      commission,
      swap,
      openedAt: toIsoOrNow(body.openedAt),
      closedAt: toIsoOrNow(body.closedAt),
      source: 'ea',
      terminalId: String(body.terminalId || '').trim() || null,
      eaVersion: String(body.eaVersion || '').trim() || null,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (existing.exists) {
      await tradeRef.update(payload);
    } else {
      await tradeRef.set({
        ...payload,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    await licenseDoc.ref.update({
      lastTradeAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ ok: true, tradeId: tradeRef.id }, { status: 200 });
  } catch (error) {
    return Response.json(
      { ok: false, error: 'server_error', details: error?.message || 'unknown_error' },
      { status: 500 }
    );
  }
}
