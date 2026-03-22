'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

const strategyDetails = [
  {
    icon: '📐',
    title: 'Gann Square of Nine',
    subtitle: 'Asosiy matematik model',
    body: "W.D. Gann ning Square of Nine (9-lik kvadrat) metodologiyasiga asoslangan narx darajalari hisoblanadi. Robot kecha yopilgan narx (yesterday close) ni markaziy nuqta sifatida olib, geometrik spiral bo'ylab muhim qo'llab-quvvatlash va qarshilik darajalarini hisoblaydi.",
    details: [
      "Markaziy narx (CenterPrice) atrofida spiral darajalar quriladi",
      "Har bir daraja 45°, 90°, 180°, 360° burchak ostida hisoblanadi",
      "Strong levels — eng kuchli darajalar, ular asosiy kirish/chiqish nuqtalari",
      "Robot avtomatik ravishda kunlik darajalarni yangilab turadi",
    ],
  },
  {
    icon: '⏱️',
    title: 'M15 Timeframe strategiya',
    subtitle: '15-daqiqalik grafik asosida',
    body: "Robot M15 (15 daqiqalik) timeframe uchun optimallashtirilgan. Bu timeframe shovqinni kamaytiradi, lekin tezkor signallarni ham ushlab turadi. Robot har bir 15-daqiqalik shamda narxning Gann darajalaridan o'tishini kuzatadi.",
    details: [
      "Narx Gann Strong Level ga tekkanda signal hosil bo'ladi",
      "Buy signal — narx qo'llab-quvvatlash darajasidan yuqoriga o'tganda",
      "Sell signal — narx qarshilik darajasidan pastga tushganda",
      "Har bir signal bir marta ishlatiladi, takroriy kirish yo'q",
    ],
  },
  {
    icon: '🔄',
    title: 'Recovery Mode',
    subtitle: 'Zarar qoplash tizimi',
    body: "Recovery Mode yoqilgan holda robot oldingi zararli savdoni keyingi savdoda lot hajmini oshirish orqali qoplashga harakat qiladi. Bu Martingale emas — lot faqat bir bosqich oshiriladi va maksimal lot chegarasi bilan boshqariladi.",
    details: [
      "Zarar bo'lsa, keyingi savdo uchun lot hajmi oshiriladi",
      "Maksimal lot chegarasi (Maxlot) dan oshmaydi",
      "Foyda bo'lsa, lot dastlabki holatga qaytadi",
      "O'chirish mumkin: Recovery_Mode = OFF",
    ],
  },
  {
    icon: '🛡️',
    title: 'Risk boshqaruvi',
    subtitle: 'Himoya mexanizmlari',
    body: "Har bir savdo intizomli qoidalarga tayangan holda boshqariladi. Robot bir vaqtning o'zida bir instrumentda maksimum 2 ta pozitsiya ochadi va har bir pozitsiya uchun Take Profit va Breakeven darajalari belgilanadi.",
    details: [
      "Har bir chart uchun alohida MagicNumber ishlatiladi",
      "TP1 (birinchi maqsad) va TP2 (ikkinchi maqsad) avtomatik belgilanadi",
      "Breakeven — narx ma'lum masofaga o'tganda stop loss kirish narxiga ko'chiriladi",
      "Kunlik savdolar soni har kuni qayta tiklanadi",
    ],
  },
  {
    icon: '📊',
    title: "Ko'p instrument rejimi",
    subtitle: 'Bir nechta chart boshqaruvi',
    body: "Robot bir terminalda bir nechta chartda mustaqil ishlaydi. Har bir chart uchun alohida MagicNumber o'rnatiladi, shuning uchun pozitsiyalar aralashmaydi.",
    details: [
      "XAUUSD (oltin) — asosiy va eng yaxshi optimallashtirilgan instrument",
      "BTCUSD, EURUSD, GBPUSD va boshqa instrumentlarda ishlaydi",
      "Har bir chart uchun alohida sozlama (lot, TP, CenterPrice)",
      "Bir hisobda bir nechta robotni parallel ishlatish mumkin",
    ],
  },
  {
    icon: '📡',
    title: 'Server bilan integratsiya',
    subtitle: 'Litsenziya va statistika',
    body: "Robot har 30 daqiqada serverga ulanib litsenziyani tekshiradi va savdo natijalarini yuboradi. Bu sizga Dashboard dan natijalarni kuzatish imkonini beradi.",
    details: [
      "Litsenziya har 30 daqiqada avtomatik tekshiriladi",
      "Savdo natijalari real vaqtda saytga yuboriladi",
      "Telegram kanalga signal va savdo natijalari yuboriladi",
      "Weekend (dam olish kunlari) da ham heartbeat yuboriladi",
    ],
  },
];

const stats = [
  { value: '87.3%', label: 'Yutuq foizi', sub: 'Oxirgi 6 oy' },
  { value: '40-150%', label: 'Oylik foyda', sub: 'Bozor sharoitiga bog\'liq' },
  { value: '1 : 3.2', label: 'Daromad / Xavf', sub: 'O\'rtacha nisbat' },
  { value: '12.8%', label: 'Maks. drawdown', sub: 'Eng katta pasayish' },
];

const features = [
  { icon: '🤖', title: '24/7 avtomatik savdo', body: "Siz uxlayotganda ham robot ishlaydi. VPS serverda to'xtovsiz savdo." },
  { icon: '📱', title: 'Telegram xabarnomalar', body: "Har bir savdo ochilishi va yopilishi haqida Telegram orqali xabar olasiz." },
  { icon: '🔒', title: 'Litsenziya himoyasi', body: "Litsenziya faqat bitta MT5 hisobga biriktiriladi. Server tomonidan tekshiriladi." },
  { icon: '📈', title: 'Real vaqt statistika', body: "Dashboard da barcha savdo natijalari, foyda/zarar, yutuq foizi ko'rinadi." },
  { icon: '⚙️', title: 'Moslashuvchan sozlamalar', body: "Lot hajmi, risk, TP, savdo kunlari — hamma narsa o'zgartirilishi mumkin." },
  { icon: '🧪', title: 'Backtesting', body: "Strategy Tester orqali tarixiy ma'lumotlarda sinab ko'rish mumkin." },
];

const steps = [
  { n: '1', title: 'Kunlik darajalar hisoblanadi', desc: "Har kuni yangi sham ochilganda robot Gann Square of Nine asosida qo'llab-quvvatlash va qarshilik darajalarini hisoblaydi." },
  { n: '2', title: 'Narx kuzatiladi', desc: "M15 timeframe da har 15 daqiqada narxning Gann darajalariga yaqinlashishi va ulardan o'tishi kuzatiladi." },
  { n: '3', title: 'Signal hosil bo\'ladi', desc: "Narx muhim darajadan o'tganda Buy yoki Sell signali hosil bo'ladi. Signal bir marta ishlatiladi." },
  { n: '4', title: 'Savdo ochiladi', desc: "Robot avtomatik ravishda belgilangan lot hajmida pozitsiya ochadi. TP1, TP2 va Breakeven avtomatik qo'yiladi." },
  { n: '5', title: 'Natija hisoblanadi', desc: "Narx TP ga yetganda savdo yopiladi. Natija Telegram ga va Dashboard ga yuboriladi." },
];

export default function AboutPage() {
  const [testVideos, setTestVideos] = useState([]);
  const [openStrategy, setOpenStrategy] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    fetch('/api/public/site-profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.profile?.testVideos?.length) {
          setTestVideos(data.profile.testVideos);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cyan-100 fath-hero-glow">
        <div className="pointer-events-none absolute inset-0 fath-grid-bg opacity-70" />
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <span className="inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            MetaTrader 5 · Expert Advisor
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            FATH Robot <span className="text-cyan-700">V1.6</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Gann Square of Nine metodologiyasiga asoslangan professional savdo roboti. 
            M15 timeframe da XAUUSD va boshqa instrumentlarda avtomatik savdo amalga oshiradi.
            Tajribasiz va professional savdogarlar uchun mos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-xl bg-cyan-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-700"
            >Litsenziya sotib olish</Link>
            <Link
              href="/statistics"
              className="rounded-xl border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >Natijalarni ko'rish</Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* About */}
        <section className="fath-shell rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-8">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-4">FATH nima?</h2>
          
          <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/60 to-white p-5 mb-5">
            <p className="text-sm font-bold text-slate-800 leading-7">
              🔥 FATH — bu oddiy robot emas. Bu <span className="text-cyan-700">strategiya</span>. Bu <span className="text-cyan-700">tizim</span>. Bu <span className="text-cyan-700">natija</span>.
            </p>
          </div>

          <div className="space-y-3 text-sm leading-7 text-slate-600">
            <p>
              FATH — bu shunchaki savdo roboti emas. Bu <strong className="text-slate-900">100 yillik matematik va geometrik bilimlarga asoslangan</strong> professional trading tizimi.
            </p>
            <p>
              Uning yuragi — afsonaviy <span className="text-cyan-700 font-bold">Gann metodologiyasi</span>. Bu metod orqali bozor harakatlari tasodif emas, balki aniq hisoblangan qonuniyatlar ekanligi isbotlangan.
            </p>
          </div>

          <div className="mt-5 mb-4">
            <h3 className="text-base font-black text-slate-900 mb-3">💡 Nega aynan FATH?</h3>
            <p className="text-sm text-slate-500 mb-4">Bozorda minglab robotlar bor. Lekin ularning aksariyati indikatorlarga bog&apos;langan, kechikadi yoki noto&apos;g&apos;ri signal beradi. FATH esa boshqacha ishlaydi:</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                { icon: '📐', text: "Bozorni oldindan hisoblaydi — matematik darajalar orqali" },
                { icon: '🧠', text: "Emotsiyasiz savdo qiladi — inson xatolari yo'q" },
                { icon: '🎯', text: "Aniq kirish nuqtalarini topadi — Strong Level asosida" },
                { icon: '🔄', text: "O'zini o'zi tiklaydi — Recovery tizimi bilan zararlarni yopadi" },
                { icon: '⏰', text: "24/7 ishlaydi — siz uxlayotganda ham foyda qidiradi" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mt-2">
            <p className="text-xs text-emerald-800">
              Tavsiya etilgan minimal depozit <strong>$100</strong>, amaliy savdoda <strong>$500–1000</strong> va undan yuqori depozit tavsiya etiladi. Litsenziya asosida faqat bitta MT5 real hisobda ishlaydi.
            </p>
          </div>
        </section>

        {/* Test Videos — 3D Coverflow Carousel */}
        {testVideos.length > 0 && (
          <section className="relative overflow-hidden rounded-3xl py-10 sm:py-14 mb-8" style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #f0f9ff 40%, #eff6ff 70%, #ecfeff 100%)' }}>
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full bg-cyan-400/[0.12] blur-[100px]" />

            <div className="relative px-4 sm:px-6">
              <div className="text-center mb-8">
                <span className="inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 mb-3">
                  Test natijalari
                </span>
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Test natijalari va videolar</h2>
                <p className="mt-2 text-sm text-slate-500">Real va demo hisobdagi test natijalari video shaklida</p>
              </div>

              {/* 3D Coverflow Container */}
              <div
                className="relative mx-auto select-none"
                style={{ perspective: '1200px', height: 'clamp(220px, 50vw, 480px)' }}
                onTouchStart={(e) => {
                  setTouchStart(e.touches[0].clientX);
                  setTouchDelta(0);
                  setSwiping(true);
                }}
                onTouchMove={(e) => {
                  if (touchStart === null) return;
                  setTouchDelta(e.touches[0].clientX - touchStart);
                }}
                onTouchEnd={() => {
                  if (Math.abs(touchDelta) > 50) {
                    if (touchDelta < 0) setSelectedIdx((p) => (p < testVideos.length - 1 ? p + 1 : 0));
                    else setSelectedIdx((p) => (p > 0 ? p - 1 : testVideos.length - 1));
                  }
                  setTouchStart(null);
                  setTouchDelta(0);
                  setSwiping(false);
                }}
              >
                {testVideos.map((vid, idx) => {
                  const offset = idx - selectedIdx;
                  const abs = Math.abs(offset);
                  if (abs > 3) return null;

                  const isCenter = offset === 0;
                  const swipePx = swiping ? touchDelta * 0.12 : 0;
                  const ry = -offset * 32;
                  const tz = -abs * 140;
                  const sc = isCenter ? 1.15 : Math.max(0.75 - abs * 0.08, 0.45);
                  const op = abs === 0 ? 1 : abs === 1 ? 0.8 : abs === 2 ? 0.45 : 0.2;

                  return (
                    <div
                      key={idx}
                      className="absolute top-1/2"
                      style={{
                        width: isCenter ? 'clamp(260px, 70vw, 680px)' : 'clamp(120px, 28vw, 320px)',
                        aspectRatio: '16 / 9',
                        left: `calc(50% + ${offset * (isCenter ? 0 : 26)}%)`,
                        transform: `translateX(calc(-50% + ${swipePx}px)) translateY(-50%) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`,
                        zIndex: 10 - abs,
                        opacity: op,
                        transition: swiping ? 'none' : 'all 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
                        transformStyle: 'preserve-3d',
                        filter: isCenter ? 'none' : `brightness(${Math.max(0.7 - abs * 0.1, 0.35)})`,
                      }}
                      onClick={() => !isCenter && setSelectedIdx(idx)}
                    >
                      <div className={`relative h-full w-full rounded-2xl sm:rounded-3xl overflow-hidden ${
                        isCenter
                          ? 'ring-2 ring-cyan-400/50 shadow-2xl shadow-cyan-400/30'
                          : 'shadow-xl shadow-slate-400/40 cursor-pointer'
                      }`}>
                        <video
                          className="h-full w-full object-contain bg-slate-900"
                          src={vid.url}
                          controls={isCenter}
                          playsInline
                          muted={!isCenter}
                          controlsList="nodownload"
                        />
                        {vid.title && isCenter && (
                          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent px-4 pt-3 pb-8 pointer-events-none">
                            <p className="text-sm sm:text-base font-bold text-white drop-shadow-lg">{vid.title}</p>
                          </div>
                        )}
                        {!isCenter && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                              <svg className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Desktop navigation arrows */}
                {testVideos.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedIdx((p) => (p > 0 ? p - 1 : testVideos.length - 1))}
                      className="hidden sm:flex absolute left-1 lg:left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full bg-white/80 border border-slate-200 text-slate-600 shadow-lg backdrop-blur-md transition-all hover:bg-white hover:text-cyan-700 hover:border-cyan-300 hover:scale-110 cursor-pointer"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                      onClick={() => setSelectedIdx((p) => (p < testVideos.length - 1 ? p + 1 : 0))}
                      className="hidden sm:flex absolute right-1 lg:right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full bg-white/80 border border-slate-200 text-slate-600 shadow-lg backdrop-blur-md transition-all hover:bg-white hover:text-cyan-700 hover:border-cyan-300 hover:scale-110 cursor-pointer"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
              </div>

              {/* Navigation dots */}
              {testVideos.length > 1 && (
                <div className="flex justify-center gap-2 mt-5">
                  {testVideos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        selectedIdx === idx ? 'w-8 h-2.5 bg-cyan-600 shadow-lg shadow-cyan-400/40' : 'w-2.5 h-2.5 bg-slate-300 hover:bg-cyan-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <article key={s.label} className="fath-shell rounded-2xl p-5 text-center">
                <p className="text-2xl font-black text-cyan-700">{s.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-800">{s.label}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{s.sub}</p>
              </article>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 text-center">* Ko'rsatkichlar real savdo natijalari asosida. O'tmishdagi natijalar kelajakni kafolatlamaydi.</p>
        </section>

        {/* Strategy Accordion */}
        <section className="mb-8">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">Savdo strategiyasi — batafsil</h2>
          <p className="text-sm text-slate-500 mb-5">Robotning ishlash prinsipi va har bir tarkibiy qism haqida</p>

          <div className="space-y-3">
            {strategyDetails.map((s, idx) => (
              <div key={s.title} className={`fath-shell rounded-2xl overflow-hidden transition-all duration-300 ${openStrategy === idx ? 'ring-2 ring-cyan-200' : ''}`}>
                <button
                  onClick={() => setOpenStrategy(openStrategy === idx ? -1 : idx)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <span className="text-2xl shrink-0">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900">{s.title}</h3>
                    <p className="text-xs text-slate-500">{s.subtitle}</p>
                  </div>
                  <svg className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${openStrategy === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openStrategy === idx && (
                  <div className="border-t border-cyan-100 px-5 pb-5 pt-4">
                    <p className="text-sm leading-relaxed text-slate-600">{s.body}</p>
                    <ul className="mt-3 space-y-2">
                      {s.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-cyan-100 bg-white/70 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 mb-8">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-5 sm:mb-6">Robot qanday ishlaydi?</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-5">
            {steps.map((s) => (
              <article key={s.n} className="fath-shell rounded-2xl p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-sm font-black text-cyan-700">{s.n}</div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-8">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-5">Asosiy xususiyatlar</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article key={f.title} className="fath-shell rounded-2xl p-5">
                <span className="text-2xl">{f.icon}</span>
                <p className="mt-2 text-sm font-bold text-slate-900">{f.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Risk Warning */}
        <section className="mb-8 rounded-2xl border-2 border-red-200 bg-red-50 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-black text-red-700">⚠️ Risk ogohlantirishlari</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-red-800">
            <li>• Forex va CFD savdosi yuqori riskli. Sarmoyangizni qisman yoki to'liq yo'qotish ehtimoli bor.</li>
            <li>• Robot faqat yordamchi vosita — hech qanday foyda kafolatlanmaydi.</li>
            <li>• O'tmishdagi natijalar kelajakdagi natijalarni belgilamaydi va kafolatlamaydi.</li>
            <li>• Faqat yo'qotishga tayyor bo'lgan mablag' bilan savdo qiling.</li>
            <li>• Real hisobda ishlatishdan oldin albatta demo hisobda sinab ko'ring.</li>
          </ul>
        </section>

        {/* CTA */}
        <section className="fath-shell rounded-3xl border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 px-6 py-10 text-center">
          <h2 className="text-2xl font-black text-slate-900">Boshlashga tayyormisiz?</h2>
          <p className="mt-2 text-sm text-slate-600 mb-6">
            Litsenziya olganingizdan keyin 30 daqiqada robotni ishga tushirishingiz mumkin
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-xl bg-cyan-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-700"
            >Litsenziya sotib olish</Link>
            <Link
              href="/guide-mt5"
              className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >Robotni o'rnatish</Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
