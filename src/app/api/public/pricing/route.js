import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { DEFAULT_PRICING, normalizePricing } from '../../../../lib/pricing';

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('app_settings').doc('pricing').get();
    const pricing = normalizePricing(snap.exists ? snap.data() : DEFAULT_PRICING);

    return Response.json({ pricing }, { status: 200 });
  } catch {
    return Response.json({ pricing: DEFAULT_PRICING }, { status: 200 });
  }
}
