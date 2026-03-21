import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../../../../lib/firebaseAdmin';
import { issueLicenseForCheckout } from '../../../../../lib/licenseService';

const PAYME_ERRORS = {
  INVALID_AMOUNT: {
    code: -31001,
    message: { uz: 'Notogri summa', ru: 'Nevernaya summa', en: 'Invalid amount' },
  },
  ORDER_NOT_FOUND: {
    code: -31050,
    message: { uz: 'Buyurtma topilmadi', ru: 'Zakaz ne nayden', en: 'Order not found' },
  },
  ALREADY_PAID: {
    code: -31051,
    message: { uz: 'Buyurtma allaqachon tolangan', ru: 'Zakaz uzhe oplachen', en: 'Order already paid' },
  },
  CANNOT_PERFORM: {
    code: -31008,
    message: { uz: 'Tranzaksiyani bajarib bolmaydi', ru: 'Nelzya vypolnit tranzaksiyu', en: 'Cannot perform transaction' },
  },
  TRANSACTION_NOT_FOUND: {
    code: -31003,
    message: { uz: 'Tranzaksiya topilmadi', ru: 'Tranzaksiya ne naydena', en: 'Transaction not found' },
  },
  UNAUTHORIZED: {
    code: -32504,
    message: { uz: 'Avtorizatsiya xatosi', ru: 'Oshibka avtorizatsii', en: 'Authorization error' },
  },
};

function verifyPaymeAuth(request) {
  const secret = process.env.PAYME_SECRET_KEY;
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1] || '';
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [login, password] = credentials.split(':');
  return login === 'Paycom' && password === secret;
}

async function getCheckoutByOrderId(db, orderIdRaw) {
  const orderIdStr = String(orderIdRaw);
  const byString = await db.collection('checkoutRequests').where('orderId', '==', orderIdStr).limit(1).get();
  if (!byString.empty) {
    return byString.docs[0];
  }

  const orderIdNum = Number(orderIdRaw);
  if (!Number.isNaN(orderIdNum)) {
    const byNumeric = await db.collection('checkoutRequests').where('orderIdNumeric', '==', orderIdNum).limit(1).get();
    if (!byNumeric.empty) {
      return byNumeric.docs[0];
    }
  }

  return null;
}

async function checkPerformTransaction(db, params) {
  const { account, amount } = params || {};
  const orderId = account?.order_id;
  if (!orderId) {
    return { error: PAYME_ERRORS.ORDER_NOT_FOUND };
  }

  const checkoutDoc = await getCheckoutByOrderId(db, orderId);
  if (!checkoutDoc) {
    return { error: PAYME_ERRORS.ORDER_NOT_FOUND };
  }

  const checkout = checkoutDoc.data();
  if (checkout.status === 'paid' || checkout.licenseId) {
    return { error: PAYME_ERRORS.ALREADY_PAID };
  }

  const expectedAmount = Math.round(Number(checkout.amountUZS || 0) * 100);
  if (Number(amount) !== expectedAmount) {
    return { error: PAYME_ERRORS.INVALID_AMOUNT };
  }

  return { result: { allow: true } };
}

async function createTransaction(db, params) {
  const { id: paymeTransactionId, amount, account } = params || {};
  const orderId = account?.order_id;
  if (!orderId) {
    return { error: PAYME_ERRORS.ORDER_NOT_FOUND };
  }

  const checkoutDoc = await getCheckoutByOrderId(db, orderId);
  if (!checkoutDoc) {
    return { error: PAYME_ERRORS.ORDER_NOT_FOUND };
  }

  const checkout = checkoutDoc.data();
  if (checkout.status === 'paid' || checkout.licenseId) {
    return { error: PAYME_ERRORS.ALREADY_PAID };
  }

  const expectedAmount = Math.round(Number(checkout.amountUZS || 0) * 100);
  if (Number(amount) !== expectedAmount) {
    return { error: PAYME_ERRORS.INVALID_AMOUNT };
  }

  const existing = await db.collection('payme_transactions').where('paymeId', '==', paymeTransactionId).limit(1).get();
  if (!existing.empty) {
    const tx = existing.docs[0].data();
    return {
      result: {
        create_time: tx.createTime,
        transaction: existing.docs[0].id,
        state: tx.state,
      },
    };
  }

  const createTime = Date.now();
  const txRef = db.collection('payme_transactions').doc();
  await txRef.set({
    paymeId: paymeTransactionId,
    orderId: String(orderId),
    checkoutRequestId: checkoutDoc.id,
    userUid: checkout.userUid,
    amount: Number(amount),
    createTime,
    state: 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await checkoutDoc.ref.update({
    status: 'processing',
    transactionId: paymeTransactionId,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    result: {
      create_time: createTime,
      transaction: txRef.id,
      state: 1,
    },
  };
}

async function performTransaction(db, params) {
  const { id: paymeTransactionId } = params || {};
  const txQuery = await db.collection('payme_transactions').where('paymeId', '==', paymeTransactionId).limit(1).get();
  if (txQuery.empty) {
    return { error: PAYME_ERRORS.TRANSACTION_NOT_FOUND };
  }

  const txDoc = txQuery.docs[0];
  const tx = txDoc.data();

  if (tx.state === 2) {
    return {
      result: {
        transaction: txDoc.id,
        perform_time: tx.performTime,
        state: 2,
      },
    };
  }

  if (tx.state !== 1) {
    return { error: PAYME_ERRORS.CANNOT_PERFORM };
  }

  const performTime = Date.now();
  await txDoc.ref.update({
    state: 2,
    performTime,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const issueResult = await issueLicenseForCheckout(db, tx.checkoutRequestId, paymeTransactionId);

  return {
    result: {
      transaction: txDoc.id,
      perform_time: performTime,
      state: 2,
      license_id: issueResult.licenseId,
    },
  };
}

async function cancelTransaction(db, params) {
  const { id: paymeTransactionId, reason } = params || {};
  const txQuery = await db.collection('payme_transactions').where('paymeId', '==', paymeTransactionId).limit(1).get();
  if (txQuery.empty) {
    return { error: PAYME_ERRORS.TRANSACTION_NOT_FOUND };
  }

  const txDoc = txQuery.docs[0];
  const tx = txDoc.data();

  if (tx.state < 0) {
    return {
      result: {
        transaction: txDoc.id,
        cancel_time: tx.cancelTime,
        state: tx.state,
      },
    };
  }

  const cancelTime = Date.now();
  const newState = tx.state === 2 ? -2 : -1;
  await txDoc.ref.update({
    state: newState,
    cancelTime,
    reason: Number(reason) || 0,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection('checkoutRequests').doc(tx.checkoutRequestId).set(
    {
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return {
    result: {
      transaction: txDoc.id,
      cancel_time: cancelTime,
      state: newState,
    },
  };
}

async function checkTransaction(db, params) {
  const { id: paymeTransactionId } = params || {};
  const txQuery = await db.collection('payme_transactions').where('paymeId', '==', paymeTransactionId).limit(1).get();
  if (txQuery.empty) {
    return { error: PAYME_ERRORS.TRANSACTION_NOT_FOUND };
  }

  const txDoc = txQuery.docs[0];
  const tx = txDoc.data();

  return {
    result: {
      create_time: tx.createTime,
      perform_time: tx.performTime || 0,
      cancel_time: tx.cancelTime || 0,
      transaction: txDoc.id,
      state: tx.state,
      reason: tx.reason || null,
    },
  };
}

async function getStatement(db, params) {
  const { from, to } = params || {};
  const txQuery = await db
    .collection('payme_transactions')
    .where('createTime', '>=', Number(from) || 0)
    .where('createTime', '<=', Number(to) || Date.now())
    .orderBy('createTime', 'asc')
    .get();

  const transactions = txQuery.docs.map((doc) => {
    const t = doc.data();
    return {
      id: t.paymeId,
      time: t.createTime,
      amount: t.amount,
      account: {
        order_id: t.orderId,
      },
      create_time: t.createTime,
      perform_time: t.performTime || 0,
      cancel_time: t.cancelTime || 0,
      transaction: doc.id,
      state: t.state,
      reason: t.reason || null,
    };
  });

  return { result: { transactions } };
}

export async function POST(request) {
  const body = await request.json();
  const responseId = body?.id || null;

  try {
    if (!verifyPaymeAuth(request)) {
      return new Response(JSON.stringify({ error: PAYME_ERRORS.UNAUTHORIZED, id: responseId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getAdminDb();
    const { method, params } = body || {};

    let result;
    switch (method) {
      case 'CheckPerformTransaction':
        result = await checkPerformTransaction(db, params);
        break;
      case 'CreateTransaction':
        result = await createTransaction(db, params);
        break;
      case 'PerformTransaction':
        result = await performTransaction(db, params);
        break;
      case 'CancelTransaction':
        result = await cancelTransaction(db, params);
        break;
      case 'CheckTransaction':
        result = await checkTransaction(db, params);
        break;
      case 'GetStatement':
        result = await getStatement(db, params);
        break;
      default:
        result = { error: { code: -32601, message: 'Method not found' } };
    }

    return new Response(JSON.stringify({ ...result, id: responseId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: { code: -32400, message: `Internal error: ${error.message || 'Unknown error'}` },
        id: responseId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
