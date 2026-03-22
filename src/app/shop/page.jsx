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
  const [partnerBrokers, setPartnerBrokers] = useState([]);

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

    fetch('/api/public/site-profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.profile?.partnerBrokers?.length) setPartnerBrokers(data.profile.partnerBrokers);
      })
      .catch(() => {});
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
        <section className="fath-shell rounded-2xl sm:rounded-3xl p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Litsenziya xaridi</p>
              <h1 className="mt-2 text-xl font-black text-slate-900 sm:text-3xl leading-tight">Tarifni tanlang va ma lumotlarni to ldiring</h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">Toldirgandan keyin pastdagi katta tugma orqali xaridni yakunlaysiz.</p>
            </div>

          </div>
        </section>

        <section className="mt-4 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {plans.map((plan) => {
            const active = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`fath-shell rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-left transition ${
                  active ? 'ring-2 ring-cyan-300 border-cyan-300' : 'hover:border-cyan-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">{plan.name}</p>
                  <span className={`h-4 w-4 rounded-full border ${active ? 'border-cyan-600 bg-cyan-600' : 'border-slate-300'}`} />
                </div>
                <p className="mt-2 sm:mt-3 text-base sm:text-2xl font-black text-slate-900 leading-tight">{formatUZS(plan.price)}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">{plan.months} oy</p>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 hidden sm:block">{plan.details}</p>
              </button>
            );
          })}
        </section>

        <section className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="fath-shell rounded-2xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900">Xaridor ma lumotlari</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: 'F.I.Sh', value: fullName, setValue: setFullName, placeholder: 'To liq ism-sharif' },
                { label: 'Pasport / ID', value: passport, setValue: setPassport, placeholder: 'AB1234567' },
                { label: 'Telefon', value: phone, setValue: setPhone, placeholder: '+998 90 123 45 67' },
                { label: 'Manzil', value: address, setValue: setAddress, placeholder: 'Viloyat, tuman, ko cha' },
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

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">MT5 hisob raqami</label>
                <input
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="123456789"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500"
                />
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <div className="text-xs text-amber-800">
                      <p className="font-bold">Diqqat! MT5 hisob raqamini to'g'ri kiriting!</p>
                      <p className="mt-1">Litsenziya faqat shu hisob raqamiga biriktiriladi. Noto'g'ri raqam bilan olingan litsenziya ishlamaydi va qayta tiklab bo'lmaydi. MetaTrader 5 dasturida hisobingiz raqamini tekshirib oling.</p>
                    </div>
                  </div>
                </div>

                {partnerBrokers.length > 0 && (
                  <div className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50/60 p-3">
                    <p className="text-xs font-bold text-cyan-800">MT5 hisobingiz yo'qmi?</p>
                    <p className="mt-1 text-xs text-cyan-700">Quyidagi ishonchli brokerlardan birida bepul hisob oching va savdoni boshlang:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {partnerBrokers.map((broker, idx) => (
                        <a
                          key={idx}
                          href={broker.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-2.5 py-1.5 transition-all hover:border-cyan-400 hover:shadow-sm"
                        >
                          <img src={broker.logoUrl} alt={broker.name} className="h-5 w-5 object-contain" />
                          <span className="text-[11px] font-semibold text-slate-700">{broker.name}</span>
                          <svg className="h-3 w-3 text-cyan-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
            <div className="fath-shell rounded-2xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-black text-slate-900">Qoshimcha xizmat</h2>
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

            <div className="fath-shell rounded-2xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-black text-slate-900">Muhim eslatmalar</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>- 1 litsenziya faqat 1 ta MT5 hisob uchun.</li>
                <li>- <span className="font-semibold text-amber-700">MT5 hisob raqamini noto'g'ri kiritsangiz, litsenziya ishlamaydi!</span></li>
                <li>- Litsenziya muddati tanlangan tarifga bog liq.</li>
                <li>- Professional o rnatish tanlansa, mutaxassis siz bilan bog lanadi.</li>
              </ul>
              <div className="mt-4">
                <Link href="/guide-mt5" className="text-cyan-700 underline">Robotni o rnatish qollanmasini ochish</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 sm:mt-6 fath-shell rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Tanlangan tarif</p>
              <p className="text-base sm:text-lg font-black text-slate-900">{selectedPlan.name}</p>
              <p className="text-xs sm:text-sm text-slate-600">{selectedPlan.months} oy</p>
              <p className="mt-2 text-xs sm:text-sm text-slate-500">Jami to lov</p>
              <p className="text-xl sm:text-2xl font-black text-cyan-700">{formatUZS(totalAmount)}</p>
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
