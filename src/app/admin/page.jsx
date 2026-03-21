'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import useAuthUser from '../../lib/useAuthUser';
import SiteHeader from '../../components/SiteHeader';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authMeta, setAuthMeta] = useState({ uid: '', email: '' });

  const [licenses, setLicenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [versions, setVersions] = useState([]);

  const [pricing, setPricing] = useState({
    monthly: '490000',
    quarterly: '1290000',
    halfYear: '2390000',
    annual: '4490000',
    currency: 'UZS',
    installationSupport: '150000',
  });

  const [siteProfile, setSiteProfile] = useState({
    telegramChannel: 'https://t.me/Fath_EA',
    authorTelegram: 'https://t.me/TraderMQL',
    phone: '+998930012284',
    instagramUrl: '',
    youtubeUrl: '',
    facebookUrl: '',
    guideVideoUrl: '',
    sellerBrand: '',
    sellerOwnerFullName: '',
    sellerLegalForm: '',
    sellerInn: '',
    sellerRegistrationNumber: '',
    sellerRegistrationDate: '',
    sellerIssuer: '',
    sellerLegalAddress: '',
    sellerPhone: '',
    sellerTelegram: '',
  });

  const [versionForm, setVersionForm] = useState({ version: '', notes: '', file: null });
  const [adminSecret, setAdminSecret] = useState('');

  const getToken = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Auth token topilmadi');
    return token;
  };

  const authedFetch = async (url, options = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const loadAdminData = async () => {
    const res = await authedFetch('/api/admin/data');
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Admin ma lumotlarini olishda xatolik');
    }

    setIsAdmin(true);
    setAuthMeta({ uid: auth.currentUser?.uid || '', email: auth.currentUser?.email || '' });
    setLicenses(data.licenses || []);
    setPayments(data.payments || []);
    setSupportRequests(data.supportRequests || []);
    setVersions(data.versions || []);

    if (data.pricing) {
      setPricing({
        monthly: String(data.pricing.monthly || ''),
        quarterly: String(data.pricing.quarterly || ''),
        halfYear: String(data.pricing.halfYear || ''),
        annual: String(data.pricing.annual || ''),
        currency: String(data.pricing.currency || 'UZS'),
        installationSupport: String(data.pricing.installationSupport || '150000'),
      });
    }

    if (data.siteProfile) {
      setSiteProfile((prev) => ({ ...prev, ...data.siteProfile }));
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          setChecking(false);
          return;
        }

        const res = await fetch('/api/me/admin-status', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        const info = await res.json();
        setAuthMeta({ uid: info.uid || user.uid || '', email: info.email || user.email || '' });
        if (!info.isAdmin) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        await loadAdminData();
      } catch {
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    run();
  }, [user]);



  const deactivateLicense = async (licenseId) => {
    const res = await authedFetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deactivate_license', licenseId }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(`Xato: ${data.error || 'Litsenziyani o chirib bo lmadi'}`);
      return;
    }

    setLicenses((prev) => prev.map((l) => (l.id === licenseId ? { ...l, status: 'inactive' } : l)));
  };

  const updatePricing = async () => {
    setSaving(true);
    try {
      const res = await authedFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pricing',
          data: {
            monthly: Number(pricing.monthly),
            quarterly: Number(pricing.quarterly),
            halfYear: Number(pricing.halfYear),
            annual: Number(pricing.annual),
            currency: pricing.currency,
            installationSupport: Number(pricing.installationSupport),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tarifni saqlashda xatolik');

      alert('Tarif narxlari yangilandi.');
    } catch (error) {
      alert(`Xato: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateSiteProfile = async () => {
    setSaving(true);
    try {
      const res = await authedFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'site_profile', data: siteProfile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Havolalarni saqlab bo lmadi');

      alert('Ijtimoiy havolalar saqlandi.');
    } catch (error) {
      alert(`Xato: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const publishVersion = async () => {
    if (!versionForm.version || !versionForm.file) {
      alert('Versiya va robot faylini tanlang.');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const body = new FormData();
      body.append('version', versionForm.version);
      body.append('notes', versionForm.notes || '');
      body.append('file', versionForm.file);

      const res = await fetch('/api/admin/version-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Versiya yuklanmadi');

      setVersionForm({ version: '', notes: '', file: null });
      await loadAdminData();
      alert("Yangi versiya fayli bilan e'lon qilindi.");
    } catch (error) {
      alert(`Xato: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteVersion = async (versionId, versionName) => {
    if (!confirm(`"v${versionName}" versiyasini o'chirishni xohlaysizmi?`)) return;
    try {
      const res = await authedFetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_version', versionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');
      await loadAdminData();
    } catch (error) {
      alert(`Xato: ${error.message}`);
    }
  };

  const runExpiryReconcile = async () => {
    if (!adminSecret.trim()) {
      alert('Admin secret kiriting.');
      return;
    }

    const res = await fetch('/api/license/reconcile-expiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-license-admin-secret': adminSecret.trim(),
      },
      body: JSON.stringify({}),
    });

    const json = await res.json();
    if (!res.ok) {
      alert(`Xato: ${json.error || "noma'lum xato"}`);
      return;
    }

    alert(`Muddat tekshiruvi bajarildi. Yangilangan kalitlar: ${json.expiredCount}`);
  };

  const setSupportRequestStatus = async (id, status) => {
    const res = await authedFetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'support_status', supportId: id, status }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(`Xato: ${data.error || 'Holat yangilanmadi'}`);
      return;
    }

    setSupportRequests((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  if (loading || checking) {
    return <div className="min-h-screen flex items-center justify-center text-slate-700">Yuklanmoqda...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/login" className="rounded-lg bg-cyan-600 px-6 py-3 text-white">Kirish</Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fath-shell rounded-2xl p-6 text-center">
          <p className="mb-4">Bu bo lim faqat admin uchun.</p>
          <p className="mb-1 text-xs text-slate-500">UID: {authMeta.uid || user.uid || '-'}</p>
          <p className="mb-4 text-xs text-slate-500">Email: {authMeta.email || user.email || '-'}</p>
          <Link href="/dashboard" className="rounded-lg border border-cyan-200 px-4 py-2">Kabinetga qaytish</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="fath-shell rounded-3xl p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-black text-slate-900">Admin panel</h1>

          </div>
        </div>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">Tarif narxlari</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input value={pricing.monthly} onChange={(e) => setPricing((p) => ({ ...p, monthly: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="1 oy" />
            <input value={pricing.quarterly} onChange={(e) => setPricing((p) => ({ ...p, quarterly: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="3 oy" />
            <input value={pricing.halfYear} onChange={(e) => setPricing((p) => ({ ...p, halfYear: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="6 oy" />
            <input value={pricing.annual} onChange={(e) => setPricing((p) => ({ ...p, annual: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="12 oy" />
            <input value={pricing.installationSupport} onChange={(e) => setPricing((p) => ({ ...p, installationSupport: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Professional o rnatish" />
            <input value={pricing.currency} onChange={(e) => setPricing((p) => ({ ...p, currency: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Currency" />
          </div>
          <button disabled={saving} onClick={updatePricing} className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">Narxlarni saqlash</button>
        </section>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">Ijtimoiy tarmoq va aloqa</h2>
          <p className="mt-1 text-sm text-slate-600">Footer va aloqa bo limi shu havolalardan olinadi.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={siteProfile.telegramChannel} onChange={(e) => setSiteProfile((p) => ({ ...p, telegramChannel: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Telegram kanal URL" />
            <input value={siteProfile.authorTelegram} onChange={(e) => setSiteProfile((p) => ({ ...p, authorTelegram: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Muallif Telegram URL" />
            <input value={siteProfile.phone} onChange={(e) => setSiteProfile((p) => ({ ...p, phone: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Telefon" />
            <input value={siteProfile.instagramUrl} onChange={(e) => setSiteProfile((p) => ({ ...p, instagramUrl: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Instagram URL" />
            <input value={siteProfile.youtubeUrl} onChange={(e) => setSiteProfile((p) => ({ ...p, youtubeUrl: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="YouTube URL" />
            <input value={siteProfile.facebookUrl} onChange={(e) => setSiteProfile((p) => ({ ...p, facebookUrl: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Facebook URL" />
            <input value={siteProfile.guideVideoUrl} onChange={(e) => setSiteProfile((p) => ({ ...p, guideVideoUrl: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2 sm:col-span-2" placeholder="Qo llanma video URL" />
          </div>
          <button disabled={saving} onClick={updateSiteProfile} className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">Havolalarni saqlash</button>
        </section>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">Sotuvchi ma'lumotlari</h2>
          <p className="mt-1 text-sm text-slate-600">Shartnoma, guvohnoma va shartlar sahifalarida ko'rinadigan yuridik ma'lumotlar.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={siteProfile.sellerBrand} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerBrand: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Brend nomi (masalan: FATH ROBOT)" />
            <input value={siteProfile.sellerOwnerFullName} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerOwnerFullName: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Rahbar F.I.Sh" />
            <input value={siteProfile.sellerLegalForm} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerLegalForm: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Yuridik shakli (masalan: YaTT)" />
            <input value={siteProfile.sellerInn} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerInn: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="INN / JSHSHIR" />
            <input value={siteProfile.sellerRegistrationNumber} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerRegistrationNumber: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Ro'yxat raqami" />
            <input value={siteProfile.sellerRegistrationDate} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerRegistrationDate: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Ro'yxatga olingan sana" />
            <input value={siteProfile.sellerIssuer} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerIssuer: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2 sm:col-span-2" placeholder="Bergan organ (masalan: Davlat xizmatlari markazi)" />
            <input value={siteProfile.sellerLegalAddress} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerLegalAddress: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2 sm:col-span-2" placeholder="Yuridik manzil" />
            <input value={siteProfile.sellerPhone} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerPhone: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Sotuvchi telefoni" />
            <input value={siteProfile.sellerTelegram} onChange={(e) => setSiteProfile((p) => ({ ...p, sellerTelegram: e.target.value }))} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="Sotuvchi Telegram" />
          </div>
          <button disabled={saving} onClick={updateSiteProfile} className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">Sotuvchi ma'lumotlarini saqlash</button>
        </section>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">Yangi versiya e'lon qilish</h2>
          <div className="mt-4 space-y-3">
            <input value={versionForm.version} onChange={(e) => setVersionForm((v) => ({ ...v, version: e.target.value }))} className="w-full rounded-lg border border-cyan-200 px-3 py-2" placeholder="1.7.0" />
            <input type="file" accept=".ex5,.mq5,application/octet-stream" onChange={(e) => setVersionForm((v) => ({ ...v, file: e.target.files?.[0] || null }))} className="w-full rounded-lg border border-cyan-200 px-3 py-2" />
            <textarea value={versionForm.notes} onChange={(e) => setVersionForm((v) => ({ ...v, notes: e.target.value }))} className="w-full rounded-lg border border-cyan-200 px-3 py-2" rows={3} placeholder="Nimalar o zgardi" />
          </div>
          <button disabled={saving} onClick={publishVersion} className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">Versiyani e'lon qilish</button>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">So nggi versiyalar:</p>
            {versions.length === 0 ? (
              <p>Hozircha versiyalar yo q.</p>
            ) : (
              versions.slice(0, 10).map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  <span>v{v.version} — {v.fileName || v.objectPath || '-'}</span>
                  <button onClick={() => deleteVersion(v.id, v.version)} className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700" title="O'chirish">O'chirish</button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">Kalit muddatini tekshirish</h2>
          <p className="text-sm text-slate-600 mt-1">Bu endpointni Cloud Scheduler bilan kunlik ishlatish tavsiya etiladi.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <input value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} className="rounded-lg border border-cyan-200 px-3 py-2" placeholder="LICENSE_ISSUE_SECRET" />
            <button onClick={runExpiryReconcile} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">Expiry reconcile ishga tushirish</button>
          </div>
        </section>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">Professional o'rnatish so'rovlari</h2>
          <div className="mt-4 space-y-3">
            {supportRequests.length === 0 ? (
              <p className="text-sm text-slate-500">Hozircha so'rovlar yo'q.</p>
            ) : (
              supportRequests.map((row) => (
                <article key={row.id} className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p><span className="font-semibold">Order:</span> {row.orderId || '-'}</p>
                    <span className="fath-badge fath-badge--pending">{row.status || 'new'}</span>
                  </div>
                  <div className="mt-2 grid gap-1 sm:grid-cols-2">
                    <p><span className="font-semibold">Mijoz:</span> {row.email || '-'}</p>
                    <p><span className="font-semibold">MT5:</span> {row.accountId || '-'}</p>
                    <p><span className="font-semibold">Telefon:</span> {row.phone || '-'}</p>
                    <p><span className="font-semibold">Telegram:</span> {row.telegram || '-'}</p>
                    <p><span className="font-semibold">Qulay vaqt:</span> {row.preferredTime || '-'}</p>
                    <p><span className="font-semibold">Narx:</span> {row.amountUZS?.toLocaleString?.('ru-RU') || row.amountUZS || 0} UZS</p>
                  </div>
                  {!!row.note && <p className="mt-2 text-slate-600"><span className="font-semibold">Izoh:</span> {row.note}</p>}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => setSupportRequestStatus(row.id, 'contacted')} className="rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100">Bog'landik</button>
                    <button onClick={() => setSupportRequestStatus(row.id, 'scheduled')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">Vaqt belgilandi</button>
                    <button onClick={() => setSupportRequestStatus(row.id, 'completed')} className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Bajarildi</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">To lovlar holati</h2>
          <div className="mt-4 space-y-3">
            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">To lovlar topilmadi.</p>
            ) : (
              payments.map((payment) => (
                <article key={payment.id} className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4 text-sm">
                  <p><span className="font-semibold">Order:</span> {payment.orderId || '-'}</p>
                  <p><span className="font-semibold">User:</span> {payment.userUid || payment.userId || '-'}</p>
                  <p><span className="font-semibold">Status:</span> {payment.status || 'pending'}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">Litsenziyalarni boshqarish</h2>
          <div className="mt-4 space-y-3">
            {licenses.length === 0 ? (
              <p className="text-sm text-slate-500">Litsenziyalar topilmadi.</p>
            ) : (
              licenses.map((license) => (
                <article key={license.id} className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                      <p><span className="font-semibold">Kalit:</span> {license.licenseKey || '-'}</p>
                      <p><span className="font-semibold">Status:</span> {license.status || '-'}</p>
                    </div>
                    {license.status === 'active' && (
                      <button onClick={() => deactivateLicense(license.id)} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                        Bekor qilish
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
