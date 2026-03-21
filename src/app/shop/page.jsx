'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import useAuthUser from '../../lib/useAuthUser';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { SELLER_LEGAL_INFO } from '../../lib/legalInfo';

const makePlans = (pricing) => ([
  { id: 'm1', name: 'MONTHLY', price: Number(pricing?.monthly || 490000), months: 1, details: 'Qisqa muddat test va moslashuv uchun.' },
  { id: 'm3', name: 'QUARTER', price: Number(pricing?.quarterly || 1290000), months: 3, details: 'Eng mashhur tanlov. Narx va muddat balanslangan.' },
  { id: 'm6', name: 'HALF-YEAR', price: Number(pricing?.halfYear || 2390000), months: 6, details: 'Barqaror savdo intizomi uchun qulay paket.' },
  { id: 'y1', name: 'YEARLY', price: Number(pricing?.annual || 4490000), months: 12, details: 'Professional uzoq muddatli foydalanish uchun.' },
]);

function formatUZS(value) {
  return `${Number(value || 0).toLocaleString('ru-RU')} UZS`;
}

export default function ShopPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuthUser();

  const [selectedPlanId, setSelectedPlanId] = useState('m3');

  const [accountId, setAccountId] = useState('');
  const [fullName, setFullName] = useState('');
  const [passport, setPassport] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [needSupportInstall, setNeedSupportInstall] = useState(false);
  const [supportPreferredTime, setSupportPreferredTime] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportTelegram, setSupportTelegram] = useState('');
  const [supportNote, setSupportNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [pricing, setPricing] = useState({
    monthly: 490000,
    quarterly: 1290000,
    halfYear: 2390000,
    annual: 4490000,
    installationSupport: 150000,
  });

  const plans = useMemo(() => makePlans(pricing), [pricing]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || plans[1],
    [plans, selectedPlanId]
  );

  const totalAmount = selectedPlan.price + (needSupportInstall ? Number(pricing.installationSupport || 0) : 0);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const res = await fetch('/api/public/pricing');
        const data = await res.json();
        if (!res.ok || !data.pricing) return;
        setPricing((prev) => ({ ...prev, ...data.pricing }));
      } catch {
        // Keep defaults if endpoint is temporarily unavailable.
      }
    };

    loadPricing();
  }, []);



  const validateSupportFields = () => {
    if (!needSupportInstall) return true;
    return supportPreferredTime.trim() && supportPhone.trim() && supportTelegram.trim();
  };

  const handleBuy = async () => {
    if (!selectedPlan?.id) {
      alert('Iltimos, tarif tanlang.');
      return;
    }

    if (!accountId.trim() || !fullName.trim() || !passport.trim() || !phone.trim() || !address.trim()) {
      alert("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    if (!acceptedTerms) {
      alert('Yuridik shartlarni tasdiqlashingiz shart.');
      return;
    }

    if (!validateSupportFields()) {
      alert("Professional o'rnatish uchun qulay vaqt, telefon va Telegram kiriting.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          userId: user.uid,
          email: user.email,
          accountId: accountId.trim(),
          legalAccepted: true,
          buyer: {
            fullName: fullName.trim(),
            passport: passport.trim(),
            phone: phone.trim(),
            address: address.trim(),
          },
          installationSupport: {
            selected: needSupportInstall,
            preferredTime: supportPreferredTime.trim(),
            phone: supportPhone.trim() || phone.trim(),
            telegram: supportTelegram.trim(),
            note: supportNote.trim(),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "To'lov yaratishda xatolik");

      if (data.testMode && data.licenseKey) {
        alert(`Test rejimi: litsenziya yaratildi.\nKalit: ${data.licenseKey}`);
        router.push('/dashboard');
        return;
      }

      if (!data.checkoutUrl) throw new Error('To lov havolasi olinmadi');
      window.location.href = data.checkoutUrl;
    } catch (error) {
      alert(`Xato: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Yuklanmoqda...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fath-shell w-full max-w-sm rounded-2xl p-8 text-center">
          <h1 className="text-xl font-black text-slate-900">Tizimga kiring</h1>
          <p className="mt-2 text-sm text-slate-600">Tarif tanlash va litsenziya sotib olish uchun kirishingiz shart.</p>
          <Link href="/login" className="mt-6 inline-block rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700">
            Kirish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="fath-shell rounded-3xl p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Litsenziya xaridi</p>
              <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Tarifni tanlang va ma lumotlarni to ldiring</h1>
              <p className="mt-2 text-sm text-slate-600">Toldirgandan keyin pastdagi katta tugma orqali xaridni yakunlaysiz.</p>
            </div>

          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const active = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`fath-shell rounded-2xl p-5 text-left transition ${
                  active ? 'ring-2 ring-cyan-300 border-cyan-300' : 'hover:border-cyan-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{plan.name}</p>
                  <span className={`h-4 w-4 rounded-full border ${active ? 'border-cyan-600 bg-cyan-600' : 'border-slate-300'}`} />
                </div>
                <p className="mt-3 text-2xl font-black text-slate-900">{formatUZS(plan.price)}</p>
                <p className="text-xs text-slate-500">{plan.months} oy</p>
                <p className="mt-2 text-sm text-slate-600">{plan.details}</p>
              </button>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="fath-shell rounded-2xl p-6">
            <h2 className="text-lg font-black text-slate-900">Xaridor ma lumotlari</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: 'F.I.Sh', value: fullName, setValue: setFullName, placeholder: 'To liq ism-sharif' },
                { label: 'Pasport / ID', value: passport, setValue: setPassport, placeholder: 'AB1234567' },
                { label: 'Telefon', value: phone, setValue: setPhone, placeholder: '+998 90 123 45 67' },
                { label: 'Manzil', value: address, setValue: setAddress, placeholder: 'Viloyat, tuman, ko cha' },
                { label: 'MT5 hisob raqami', value: accountId, setValue: setAccountId, placeholder: '123456789' },
              ].map((row) => (
                <div key={row.label}>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">{row.label}</label>
                  <input
                    value={row.value}
                    onChange={(e) => row.setValue(e.target.value)}
                    placeholder={row.placeholder}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/40 p-4 text-xs text-slate-700">
              <p><span className="font-semibold">Sotuvchi:</span> {SELLER_LEGAL_INFO.ownerFullName}</p>
              <p className="mt-1"><span className="font-semibold">INN:</span> {SELLER_LEGAL_INFO.inn}</p>
              <p className="mt-1"><span className="font-semibold">Ro yxat:</span> {SELLER_LEGAL_INFO.registrationNumber}</p>
              <div className="mt-3 flex gap-3">
                <Link href="/terms" className="text-cyan-700 underline">Foydalanish shartlari</Link>
                <Link href="/license-agreement" className="text-cyan-700 underline">Litsenziya shartnomasi</Link>
              </div>
            </div>

            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-cyan-600"
              />
              <span className="text-xs leading-5 text-slate-600">Men foydalanish va litsenziya shartlarini qabul qilaman.</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="fath-shell rounded-2xl p-6">
              <h2 className="text-lg font-black text-slate-900">Qoshimcha xizmat</h2>
              <p className="mt-1 text-sm text-slate-600">Professional mutaxassis yordamida o rnatish xizmati.</p>

              <label className="mt-4 flex items-start gap-3 cursor-pointer rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={needSupportInstall}
                  onChange={(e) => setNeedSupportInstall(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-cyan-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">+{formatUZS(pricing.installationSupport)} professional o rnatish</span>
                  <span className="block text-xs text-slate-600">Mutaxassis siz bilan bog lanib, masofadan sozlab beradi.</span>
                </span>
              </label>

              {needSupportInstall && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Qulay vaqt</label>
                    <input value={supportPreferredTime} onChange={(e) => setSupportPreferredTime(e.target.value)} placeholder="Masalan: Dushanba 19:00" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Aloqa telefoni</label>
                    <input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="+998 90 123 45 67" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Telegram kontakt</label>
                    <input value={supportTelegram} onChange={(e) => setSupportTelegram(e.target.value)} placeholder="@username" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Izoh (ixtiyoriy)</label>
                    <textarea rows={3} value={supportNote} onChange={(e) => setSupportNote(e.target.value)} placeholder="Qaysi broker, qaysi symbol va boshqa izohlar" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="fath-shell rounded-2xl p-6">
              <h2 className="text-lg font-black text-slate-900">Muhim eslatmalar</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>- 1 litsenziya faqat 1 ta MT5 hisob uchun.</li>
                <li>- Litsenziya muddati tanlangan tarifga bog liq.</li>
                <li>- Professional o rnatish tanlansa, mutaxassis siz bilan bog lanadi.</li>
              </ul>
              <div className="mt-4">
                <Link href="/guide-mt5" className="text-cyan-700 underline">MT5 o rnatish qollanmasini ochish</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 fath-shell rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Tanlangan tarif</p>
              <p className="text-lg font-black text-slate-900">{selectedPlan.name}</p>
              <p className="text-sm text-slate-600">{selectedPlan.months} oy</p>
              <p className="mt-2 text-sm text-slate-500">Jami to lov</p>
              <p className="text-2xl font-black text-cyan-700">{formatUZS(totalAmount)}</p>
            </div>

            <button
              type="button"
              onClick={handleBuy}
              disabled={submitting}
              className="w-full rounded-xl bg-cyan-600 px-6 py-3 text-base font-bold text-white hover:bg-cyan-700 disabled:opacity-60 sm:w-auto"
            >
              {submitting ? 'Yuborilmoqda...' : 'Sotib olish'}
            </button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
