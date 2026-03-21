'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
    testVideos: [],
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
  const [newLicense, setNewLicense] = useState({ accountId: '', planId: 'm1', email: '', fullName: '' });
  const [creatingLicense, setCreatingLicense] = useState(false);
  const [termsOfUse, setTermsOfUse] = useState([]);
  const [termsUpdatedAt, setTermsUpdatedAt] = useState(null);
  const [termsSaving, setTermsSaving] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

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

    if (data.termsOfUse) {
      setTermsOfUse(data.termsOfUse);
    }
    if (data.termsUpdatedAt) {
      setTermsUpdatedAt(data.termsUpdatedAt);
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

  const createLicense = async () => {
    if (!newLicense.accountId.trim() || !newLicense.planId) {
      alert('MT5 hisob raqami va tarif majburiy.');
      return;
    }

    setCreatingLicense(true);
    try {
      const res = await authedFetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_license',
          accountId: newLicense.accountId.trim(),
          planId: newLicense.planId,
          email: newLicense.email.trim(),
          fullName: newLicense.fullName.trim(),
          months: { m1: 1, m3: 3, m6: 6, y1: 12 }[newLicense.planId] || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Litsenziya yaratib bo lmadi');

      alert(`Litsenziya yaratildi!\nKalit: ${data.licenseKey}`);
      setNewLicense({ accountId: '', planId: 'm1', email: '', fullName: '' });
      await loadAdminData();
    } catch (error) {
      alert(`Xato: ${error.message}`);
    } finally {
      setCreatingLicense(false);
    }
  };

  const saveTerms = async () => {
    setTermsSaving(true);
    try {
      const res = await authedFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'terms_of_use', data: { sections: termsOfUse } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Shartlarni saqlashda xatolik');
      setTermsUpdatedAt(new Date().toISOString());
      alert('Foydalanish shartlari saqlandi.');
    } catch (error) {
      alert(`Xato: ${error.message}`);
    } finally {
      setTermsSaving(false);
    }
  };

  const addTermsSection = () => {
    setTermsOfUse((prev) => [...prev, { title: '', content: '', items: [], highlight: false }]);
  };

  const removeTermsSection = (idx) => {
    setTermsOfUse((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTermsSection = (idx, field, value) => {
    setTermsOfUse((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const addTermsItem = (sectionIdx) => {
    setTermsOfUse((prev) =>
      prev.map((s, i) => (i === sectionIdx ? { ...s, items: [...(s.items || []), ''] } : s))
    );
  };

  const removeTermsItem = (sectionIdx, itemIdx) => {
    setTermsOfUse((prev) =>
      prev.map((s, i) =>
        i === sectionIdx ? { ...s, items: s.items.filter((_, j) => j !== itemIdx) } : s
      )
    );
  };

  const updateTermsItem = (sectionIdx, itemIdx, value) => {
    setTermsOfUse((prev) =>
      prev.map((s, i) =>
        i === sectionIdx
          ? { ...s, items: s.items.map((item, j) => (j === itemIdx ? value : item)) }
          : s
      )
    );
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

          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">Test videolari (Robot haqida sahifasi)</p>
            </div>

            <div className="mb-3 rounded-lg border border-dashed border-cyan-300 bg-cyan-50/40 p-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">Yangi video yuklash</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="videoTitle"
                  className="flex-1 rounded-lg border border-cyan-200 px-3 py-2 text-sm"
                  placeholder="Video sarlavhasi"
                />
                <input
                  id="videoFile"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  className="flex-1 rounded-lg border border-cyan-200 px-3 py-2 text-sm"
                />
                <button
                  disabled={videoUploading}
                  onClick={async () => {
                    const titleEl = document.getElementById('videoTitle');
                    const fileEl = document.getElementById('videoFile');
                    const title = titleEl?.value?.trim() || '';
                    const file = fileEl?.files?.[0];
                    if (!file) { alert('Video faylni tanlang'); return; }
                    if (!title) { alert('Video sarlavhasini kiriting'); return; }
                    if (file.size > 100 * 1024 * 1024) { alert('Fayl hajmi 100 MB dan oshmasligi kerak'); return; }

                    setVideoUploading(true);
                    try {
                      const stamp = Date.now();
                      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
                      const safeName = title.replace(/[^0-9a-zA-Z._-]/g, '_').slice(0, 60);
                      const storagePath = `videos/${safeName}-${stamp}.${ext}`;
                      const storageRef = ref(storage, storagePath);

                      await uploadBytes(storageRef, file, {
                        contentType: file.type || 'video/mp4',
                        customMetadata: { title, uploadedBy: auth.currentUser?.uid || '' },
                      });

                      const downloadUrl = await getDownloadURL(storageRef);

                      setSiteProfile((p) => ({
                        ...p,
                        testVideos: [...(p.testVideos || []), { title, url: downloadUrl, storagePath }],
                      }));

                      titleEl.value = '';
                      fileEl.value = '';
                      alert('Video yuklandi! "Havolalarni saqlash" tugmasini bosing.');
                    } catch (error) {
                      console.error('Video upload error:', error);
                      alert(`Xato: ${error.message || 'Video yuklanmadi'}`);
                    } finally {
                      setVideoUploading(false);
                    }
                  }}
                  className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {videoUploading ? 'Yuklanmoqda...' : 'Yuklash'}
                </button>
              </div>
            </div>

            {(siteProfile.testVideos || []).length > 0 && (
              <div className="space-y-2">
                {(siteProfile.testVideos || []).map((v, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2">
                    <span className="text-lg">🎬</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{v.title || `Video ${i + 1}`}</p>
                      <p className="text-xs text-slate-500 truncate">{v.storagePath || v.objectPath || v.url || '-'}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm(`"${v.title || 'Video'}" ni o'chirmoqchimisiz?`)) return;
                        const path = v.storagePath || v.objectPath;
                        if (path) {
                          try {
                            await deleteObject(ref(storage, path));
                          } catch {}
                        }
                        setSiteProfile((p) => ({ ...p, testVideos: p.testVideos.filter((_, j) => j !== i) }));
                      }}
                      className="shrink-0 rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                    >O'chirish</button>
                  </div>
                ))}
              </div>
            )}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Foydalanish shartlari</h2>
              <p className="mt-1 text-sm text-slate-600">
                Amaldagi qonunchilikga qarab shartlarni tahrirlang.
                {termsUpdatedAt && (
                  <span className="ml-2 text-xs text-slate-400">
                    Oxirgi o'zgarish: {new Date(termsUpdatedAt).toLocaleDateString('uz-UZ')}
                  </span>
                )}
              </p>
            </div>
            <button onClick={addTermsSection} className="rounded-lg border border-cyan-300 px-3 py-1.5 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">+ Bo'lim qo'shish</button>
          </div>

          <div className="mt-4 space-y-4">
            {termsOfUse.length === 0 ? (
              <p className="text-sm text-slate-500">Shartlar hali kiritilmagan. Yangi bo'lim qo'shing yoki saytda standart shartlar ko'rsatiladi.</p>
            ) : (
              termsOfUse.map((section, sIdx) => (
                <div key={sIdx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        value={section.title}
                        onChange={(e) => updateTermsSection(sIdx, 'title', e.target.value)}
                        className="w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold"
                        placeholder={`${sIdx + 1}. Bo'lim sarlavhasi`}
                      />
                      <textarea
                        value={section.content || ''}
                        onChange={(e) => updateTermsSection(sIdx, 'content', e.target.value)}
                        className="w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Asosiy matn (ixtiyoriy)"
                      />
                    </div>
                    <button
                      onClick={() => removeTermsSection(sIdx)}
                      className="shrink-0 rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                      title="Bo'limni o'chirish"
                    >✕</button>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={section.highlight || false}
                      onChange={(e) => updateTermsSection(sIdx, 'highlight', e.target.checked)}
                      className="rounded"
                    />
                    Muhim ogohlantirish sifatida ajratib ko'rsatish
                  </label>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bandlar:</p>
                    {(section.items || []).map((item, iIdx) => (
                      <div key={iIdx} className="flex items-start gap-2">
                        <span className="mt-2.5 text-xs text-slate-400 shrink-0">{iIdx + 1}.</span>
                        <textarea
                          value={item}
                          onChange={(e) => updateTermsItem(sIdx, iIdx, e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                          rows={2}
                          placeholder="Band matni"
                        />
                        <button
                          onClick={() => removeTermsItem(sIdx, iIdx)}
                          className="shrink-0 mt-1 rounded bg-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-400"
                          title="Bandni o'chirish"
                        >✕</button>
                      </div>
                    ))}
                    <button
                      onClick={() => addTermsItem(sIdx)}
                      className="text-xs font-semibold text-cyan-600 hover:text-cyan-800"
                    >+ Band qo'shish</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            disabled={termsSaving}
            onClick={saveTerms}
            className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
          >
            {termsSaving ? 'Saqlanmoqda...' : 'Shartlarni saqlash'}
          </button>
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
          <h2 className="text-2xl font-black text-slate-900">Yangi litsenziya yaratish</h2>
          <p className="mt-1 text-sm text-slate-600">To'lovsiz litsenziya yaratish (test, sovg'a yoki maxsus holatlar uchun).</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">MT5 hisob raqami *</label>
              <input value={newLicense.accountId} onChange={(e) => setNewLicense((p) => ({ ...p, accountId: e.target.value }))} className="w-full rounded-lg border border-cyan-200 px-3 py-2" placeholder="123456789" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Tarif *</label>
              <select value={newLicense.planId} onChange={(e) => setNewLicense((p) => ({ ...p, planId: e.target.value }))} className="w-full rounded-lg border border-cyan-200 px-3 py-2 bg-white">
                <option value="m1">1 oy (MONTHLY)</option>
                <option value="m3">3 oy (QUARTER)</option>
                <option value="m6">6 oy (HALF-YEAR)</option>
                <option value="y1">12 oy (YEARLY)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email (ixtiyoriy)</label>
              <input value={newLicense.email} onChange={(e) => setNewLicense((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-lg border border-cyan-200 px-3 py-2" placeholder="mijoz@email.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">F.I.Sh (ixtiyoriy)</label>
              <input value={newLicense.fullName} onChange={(e) => setNewLicense((p) => ({ ...p, fullName: e.target.value }))} className="w-full rounded-lg border border-cyan-200 px-3 py-2" placeholder="Ism familiya" />
            </div>
          </div>
          <button disabled={creatingLicense} onClick={createLicense} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {creatingLicense ? 'Yaratilmoqda...' : 'Litsenziya yaratish'}
          </button>
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
