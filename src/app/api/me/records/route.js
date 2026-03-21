import { getAdminAuth, getAdminDb } from '../../../../lib/firebaseAdmin';

function normalizeValue(value) {
  if (!value) return value;

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, normalizeValue(v)])
    );
  }

  return value;
}

function mergeDocs(...snaps) {
  const map = new Map();
  snaps.forEach((snap) => {
    snap.docs.forEach((doc) => {
      map.set(doc.id, { id: doc.id, ...normalizeValue(doc.data()) });
    });
  });
  return Array.from(map.values());
}

function pickLatestByCreatedAt(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return [...rows].sort((a, b) => {
    const aMs = Date.parse(a?.createdAt || 0) || 0;
    const bMs = Date.parse(b?.createdAt || 0) || 0;
    return bMs - aMs;
  })[0];
}

async function getBearerToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice('Bearer '.length).trim();
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const queryUid = (url.searchParams.get('uid') || '').trim();
    const queryEmail = (url.searchParams.get('email') || '').trim();

    const token = await getBearerToken(request);
    let uid = '';
    let email = '';

    if (token) {
      try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifyIdToken(token);
        uid = decoded.uid || '';
        email = decoded.email || '';
      } catch {
        uid = queryUid;
        email = queryEmail;
      }
    } else {
      uid = queryUid;
      email = queryEmail;
    }

    if (!uid && !email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getAdminDb();

    const licensePromises = [];
    if (uid) {
      licensePromises.push(db.collection('licenses').where('userUid', '==', uid).get());
      licensePromises.push(db.collection('licenses').where('userId', '==', uid).get());
    }
    if (email) licensePromises.push(db.collection('licenses').where('email', '==', email).get());

    const paymentPromises = [];
    if (uid) {
      paymentPromises.push(db.collection('checkoutRequests').where('userUid', '==', uid).get());
      paymentPromises.push(db.collection('checkoutRequests').where('userId', '==', uid).get());
    }
    if (email) paymentPromises.push(db.collection('checkoutRequests').where('email', '==', email).get());

    const licenseSnaps = await Promise.all(licensePromises);
    const paymentSnaps = await Promise.all(paymentPromises);

    const tradePromises = [];
    if (uid) {
      tradePromises.push(db.collection('tradeResults').where('userUid', '==', uid).get());
      tradePromises.push(db.collection('tradeResults').where('userId', '==', uid).get());
    }
    if (email) tradePromises.push(db.collection('tradeResults').where('email', '==', email).get());

    const tradeSnaps = await Promise.all(tradePromises);

    const licenses = mergeDocs(...licenseSnaps);
    const payments = mergeDocs(...paymentSnaps);
    const trades = mergeDocs(...tradeSnaps);

    const latestPayment = pickLatestByCreatedAt(payments);
    const buyer = latestPayment?.contractSnapshot?.buyer || {};
    const support = latestPayment?.installationSupport || {};

    const profile = {
      fullName: buyer.fullName || '',
      phone: buyer.phone || support.phone || '',
      passport: buyer.passport || '',
      address: buyer.address || '',
    };

    return new Response(JSON.stringify({ licenses, payments, trades, profile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
