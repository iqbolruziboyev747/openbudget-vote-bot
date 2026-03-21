import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const FATH_NODE_APP_NAME = 'fath-node-secondary';

function getFathNodeServiceAccount() {
  const raw = process.env.FATH_NODE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('FATH_NODE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
}

function getFathNodeApp() {
  const existing = getApps().find((app) => app.name === FATH_NODE_APP_NAME);
  if (existing) {
    return existing;
  }

  const serviceAccount = getFathNodeServiceAccount();
  if (!serviceAccount) {
    return null;
  }

  return initializeApp(
    {
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FATH_NODE_PROJECT_ID || 'fath-node',
    },
    FATH_NODE_APP_NAME
  );
}

export function getFathNodeDb() {
  const app = getFathNodeApp();
  if (!app) {
    return null;
  }

  return getFirestore(app);
}
