'use client';

import { useEffect, useState } from 'react';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { auth } from '../../lib/firebase';
import useAuthUser from '../../lib/useAuthUser';
import { CONTRACT_SECTIONS, SELLER_LEGAL_INFO } from '../../lib/legalInfo';
import { downloadCertificatePdf, downloadContractPdf } from '../../lib/pdfDocuments';

export default function ContractPage() {
  const { user } = useAuthUser();
  const [licenses, setLicenses] = useState([]);
  const [sellerFromApi, setSellerFromApi] = useState(null);

  const toDateLabel = (value) => {
    try {
      if (!value) return '-';
      if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString();
      return new Date(value).toLocaleString();
    } catch {
      return '-';
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const query = new URLSearchParams({
        uid: user.uid || '',
        email: user.email || '',
      });

      const res = await fetch(`/api/me/records?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) { setLicenses([]); return; }

      const data = await res.json();
      setLicenses(data.licenses || []);
    };

    run();
  }, [user]);

  useEffect(() => {
    fetch('/api/public/site-profile')
      .then((r) => r.json())
      .then((d) => { if (d.profile?.seller) setSellerFromApi(d.profile.seller); })
      .catch(() => {});
  }, []);

  const seller = sellerFromApi || SELLER_LEGAL_INFO;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">

        {/* ───────────── Sarlavha ───────────── */}
        <div className="mb-10 border-b border-slate-800 pb-10">
          <span className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Yuridik hujjatlar
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">
            Shartnoma va Guvohnoma
          </h1>
          <p className="mt-3 text-slate-400">
            FATH Robot litsenziyasi uchun rasmiy shartnoma. To'lov amalga oshirilgandan so'ng
            guvohnoma va shartnoma shaxsiy kabinetda saqlanadi.
          </p>
        </div>

        {/* ───────────── Sotuvchi ma'lumotlari ───────────── */}
        <section className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-bold text-slate-100">Sotuvchi ma'lumotlari</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <InfoRow label="Brend" value={seller.brand} />
            <InfoRow label="Yuridik shakli" value={seller.legalForm} />
            <InfoRow label="Rahbar / F.I.Sh" value={seller.ownerFullName} />
            <InfoRow label="INN / JSHSHIR" value={seller.inn} />
            <InfoRow label="Ro'yxat raqami" value={seller.registrationNumber} />
            <InfoRow label="Ro'yxatga olingan sana" value={seller.registrationDate} />
            <InfoRow label="Bergan organ" value={seller.issuer} />
            <InfoRow label="Manzil" value={seller.legalAddress} />
            <InfoRow label="Telefon" value={seller.phone} />
            <InfoRow label="Telegram" value={seller.telegram} />
          </div>
        </section>

        {/* ───────────── Shartnoma bandlari ───────────── */}
        <div className="space-y-4">
          {CONTRACT_SECTIONS.map((section) => {
            const isRisk = section.title.includes('Risk');
            return (
              <section
                key={section.title}
                className={`rounded-lg border p-6 ${
                  isRisk
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                <h2 className={`text-lg font-bold ${isRisk ? 'text-amber-400' : 'text-slate-100'}`}>
                  {section.title}
                </h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-400">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>

        {/* ───────────── Tasdiqlash ───────────── */}
        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-sm text-slate-400">
            Xaridni amalga oshirish orqali siz ushbu shartnomaning barcha bandlari bilan tanishganligingizni
            va ularni qabul qilganligingizni tasdiqlaysiz.
          </p>
        </div>

        {/* ───────────── Foydalanuvchi guvohnomalari ───────────── */}
        {user && (
          <section className="mt-10 rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-slate-100">Mening guvohnoma va shartnomalarim</h2>
            {licenses.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Hozircha hujjat topilmadi.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {licenses.map((license) => (
                  <article
                    key={license.id}
                    className="rounded-lg border border-slate-700 bg-slate-800/60 p-5 text-sm"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <InfoRow label="Litsenziya" value={license.licenseKey || '-'} light />
                      <InfoRow label="Tarif" value={license.planName || license.planId || '-'} light />
                      <InfoRow label="Status" value={license.status || '-'} light />
                      <InfoRow label="MT5 hisob" value={license.accountId || '-'} light />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => downloadCertificatePdf(license, toDateLabel)}
                        className="rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-600"
                      >
                        Guvohnoma (PDF)
                      </button>
                      <button
                        onClick={() => downloadContractPdf(license, toDateLabel)}
                        className="rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-600"
                      >
                        Shartnoma (PDF)
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoRow({ label, value, light }) {
  return (
    <div>
      <span className={`font-semibold ${light ? 'text-slate-300' : 'text-slate-300'}`}>{label}: </span>
      <span className={light ? 'text-slate-400' : 'text-slate-400'}>{value}</span>
    </div>
  );
}
