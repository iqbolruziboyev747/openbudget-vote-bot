import { getAdminDb } from '../../../../lib/firebaseAdmin';

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('app_settings').doc('terms_of_use').get();

    if (!snap.exists || !snap.data()?.sections?.length) {
      return Response.json({ sections: null, updatedAt: null }, { status: 200 });
    }

    const data = snap.data();
    return Response.json({
      sections: data.sections,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
    }, { status: 200 });
  } catch {
    return Response.json({ sections: null, updatedAt: null }, { status: 200 });
  }
}
