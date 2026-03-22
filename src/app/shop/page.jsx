'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import useAuthUser from '../../lib/useAuthUser';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { SELLER_LEGAL_INFO } from '../../lib/legalInfo';

const makePlans = (pricing) => ([
  { id: 'm1', name: 'Sinov', price: Number(pricing?.monthly || 490000), months: 1, details: 'Qisqa muddat test va moslashuv uchun.', color: 'slate', features: ['FATH robot litsenziyasi', 'Telegram signal kanali', 'Texnik qo\'llab-quvvatlash', 'Robot yangilanishlari'], tagline: 'Sinab ko\'ring — bozorni robotga topshiring' },
  { id: 'm3', name: 'Trader', price: Number(pricing?.quarterly || 1290000), months: 3, details: 'Eng mashhur tanlov. Narx va muddat balanslangan.', color: 'cyan', badge: 'Eng mashhur', features: ['FATH robot litsenziyasi', 'Telegram signal kanali', 'Texnik qo\'llab-quvvatlash', 'Robot yangilanishlari', 'Oylik shaxsiy konsultatsiya'], tagline: 'Optimal tanlov — narx va imkoniyat balansi' },
  { id: 'm6', name: 'Professional', price: Number(pricing?.halfYear || 2390000), months: 6, details: 'Jiddiy treyderlar uchun — barqaror natija.', color: 'indigo', features: ['FATH robot litsenziyasi', 'Telegram signal kanali', 'Ustuvor texnik yordam', 'Robot yangilanishlari', 'Oylik 2 ta shaxsiy konsultatsiya', 'Maxsus signal filtrlari'], tagline: 'Jiddiy treyderlar uchun — barqaror natija' },
  { id: 'y1', name: 'Elite', price: Number(pricing?.annual || 4490000), months: 12, details: 'Maksimal quvvat — yillik investitsiya.', color: 'amber', badge: 'Premium', features: ['FATH robot litsenziyasi', 'VIP signal kanali', 'Cheksiz shaxsiy konsultatsiya', 'Bepul professional o\'rnatish', 'Yangi versiyalarga birinchi kirish', 'Ustuvor texnik yordam', 'Maxsus signal filtrlari'], tagline: 'Maksimal quvvat — yillik investitsiya' },
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
              <h1 className="mt-2 text-xl font-black text-slate-900 sm:text-3xl leading-tight">Sizga mos tarifni tanlang</h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">Har bir tarif o&apos;z ustunliklariga ega — o&apos;zingizga mosini toping.</p>
            </div>

          </div>
        </section>

        <section className="mt-4 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {plans.map((plan) => {
            const active = selectedPlanId === plan.id;
            const colorMap = {
              slate:  { ring: 'ring-slate-400', bg: 'from-slate-50 to-slate-100', badge: 'bg-slate-500', icon: '🧪', accent: 'text-slate-600', border: 'border-slate-200', check: 'text-slate-500' },
              cyan:   { ring: 'ring-cyan-400', bg: 'from-cyan-50 to-teal-50', badge: 'bg-cyan-500', icon: '📈', accent: 'text-cyan-700', border: 'border-cyan-200', check: 'text-cyan-600' },
              indigo: { ring: 'ring-indigo-400', bg: 'from-indigo-50 to-violet-50', badge: 'bg-indigo-500', icon: '🏆', accent: 'text-indigo-700', border: 'border-indigo-200', check: 'text-indigo-600' },
              amber:  { ring: 'ring-amber-400', bg: 'from-amber-50 to-orange-50', badge: 'bg-amber-500', icon: '👑', accent: 'text-amber-700', border: 'border-amber-200', check: 'text-amber-600' },
            };
            const c = colorMap[plan.color] || colorMap.slate;
            const perMonth = plan.months > 1 ? Math.round(plan.price / plan.months) : null;
            const savePct = plan.months > 1 ? Math.round((1 - plan.price / plan.months / (plans[0].price / plans[0].months)) * 100) : 0;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-left transition-all duration-200 bg-gradient-to-br ${c.bg} border ${active ? `${c.ring} ring-2 ${c.border}` : 'border-white/80 hover:shadow-md'} ${plan.color === 'amber' ? 'sm:scale-[1.02]' : ''}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <span className={`absolute -top-2.5 right-3 sm:right-4 ${c.badge} text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}>
                    ⭐ {plan.badge}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-lg sm:text-xl">{c.icon}</span>
                  <span className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 flex items-center justify-center ${active ? `${c.border} ${c.badge}` : 'border-slate-300 bg-white'}`}>
                    {active && <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                  </span>
                </div>

                <h3 className={`mt-2 text-sm sm:text-base font-black ${c.accent}`}>{plan.name}</h3>
                <p className="mt-1 sm:mt-2 text-base sm:text-2xl font-black text-slate-900 leading-tight">{formatUZS(plan.price)}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">{plan.months} oy</p>

                {/* Per month & savings */}
                {perMonth && (
                  <p className="mt-1 text-[10px] sm:text-xs text-slate-400">
                    ~{formatUZS(perMonth)}/oy
                    {savePct > 0 && <span className="ml-1 font-bold text-emerald-600">-{savePct}%</span>}
                  </p>
                )}

                {/* Features - desktop only */}
                <ul className="mt-2 sm:mt-3 space-y-1 hidden sm:block">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <svg className={`mt-0.5 h-3 w-3 flex-shrink-0 ${c.check}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <p className="mt-2 text-[10px] sm:text-xs italic text-slate-400 hidden sm:block">{plan.tagline}</p>
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
