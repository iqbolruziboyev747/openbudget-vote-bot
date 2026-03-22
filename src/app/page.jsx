'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const proofStats = [
  { value: '87.3%', label: 'Yutuq foizi', icon: '🎯' },
  { value: '1.92', label: 'Profit factor', icon: '📊' },
  { value: '2 700+', label: 'Jami savdolar', icon: '⚡' },
  { value: '+179%', label: 'Equity o\'sishi', icon: '📈' },
];

const whyCards = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: 'Algoritmik aniqlik',
    desc: 'Gann metodologiyasi asosida kirish va chiqish nuqtalarini hissiyotsiz, aniq hisoblaydi.',
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Recovery himoya',
    desc: 'Zarar yetganda tizim avtomatik tiklash rejimiga o\'tadi — depozitni himoya qiladi.',
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: 'Telegram nazorat',
    desc: 'Har bir ochilgan/yopilgan savdo, foyda va zarar — barchasi telefoningizga keladi.',
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: '15 daqiqada start',
    desc: 'To\'lovdan keyin litsenziya avtomatik faollashadi. Video qo\'llanma bilan tez o\'rnatasiz.',
  },
];

const steps = [
  { n: '1', t: 'Tarifni tanlang', d: 'Oylik yoki yillik — o\'zingizga mos muddatni tanlang va xarid qiling.', icon: '🛒' },
  { n: '2', t: 'MT5 hisobni biriktiring', d: 'Account ID kiriting — litsenziya xavfsiz tarzda biriktiriladi.', icon: '🔗' },
  { n: '3', t: 'Robotni ishga tushiring', d: 'FATH ni MT5 ga o\'rnating va savdo avtomatik boshlanadi.', icon: '🚀' },
];

/* Mini equity curve data points (simplified from statistics page) */
const equityPoints = [
  { x: 0, y: 1000 }, { x: 1, y: 1045 }, { x: 2, y: 1120 }, { x: 3, y: 1080 },
  { x: 4, y: 1190 }, { x: 5, y: 1310 }, { x: 6, y: 1280 }, { x: 7, y: 1420 },
  { x: 8, y: 1560 }, { x: 9, y: 1510 }, { x: 10, y: 1680 }, { x: 11, y: 1820 },
  { x: 12, y: 1790 }, { x: 13, y: 1950 }, { x: 14, y: 2100 }, { x: 15, y: 2050 },
  { x: 16, y: 2250 }, { x: 17, y: 2400 }, { x: 18, y: 2350 }, { x: 19, y: 2550 },
  { x: 20, y: 2797 },
];

export default function Home() {
  const [homeVideos, setHomeVideos] = useState([]);
  const [activeVid, setActiveVid] = useState(0);
  const [socials, setSocials] = useState({ telegram: '', instagram: '', youtube: '' });
  const [partnerBrokers, setPartnerBrokers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    fetch('/api/public/site-profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.profile?.homeVideos?.length) setHomeVideos(data.profile.homeVideos);
        if (data?.profile?.partnerBrokers?.length) setPartnerBrokers(data.profile.partnerBrokers);
        if (data?.profile?.teamMembers?.length) setTeamMembers(data.profile.teamMembers);
        setSocials({
          telegram: data?.profile?.telegramChannel || '',
          instagram: data?.profile?.instagramUrl || '',
          youtube: data?.profile?.youtubeUrl || '',
        });
      })
      .catch(() => {});
  }, []);

  /* Build SVG path for mini equity curve */
  const minY = 900, maxY = 2900, svgW = 400, svgH = 120;
  const eqPath = equityPoints
    .map((p, i) => {
      const px = (p.x / 20) * svgW;
      const py = svgH - ((p.y - minY) / (maxY - minY)) * svgH;
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(' ');
  const eqAreaPath = eqPath + ` L${svgW},${svgH} L0,${svgH} Z`;

  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />

      {/* ═══ 1. HERO — Strong selling headline ═══ */}
      <section className="relative overflow-hidden border-b border-cyan-100 fath-hero-glow">
        <div className="pointer-events-none absolute inset-0 fath-grid-bg opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-8 lg:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="fath-fade-up">
            <span className="inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              MT5 uchun avtomatlashtirilgan savdo roboti
            </span>

            <h1 className="mt-4 sm:mt-6 text-[1.7rem] leading-[1.15] font-black text-slate-900 sm:text-5xl lg:text-6xl">
              Bozorni kuzatmang —
              <br />
              <span className="text-cyan-700">FATH siz uchun savdo qilsin.</span>
            </h1>

            <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg leading-7 sm:leading-8 text-slate-600">
              Gann strategiyasiga asoslangan algoritm. Hissiyotsiz, intizomli, 24/7 ishlaydigan savdo tizimi.
            </p>

            {/* Value checkmarks */}
            <div className="mt-5 sm:mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 sm:gap-y-3">
              {[
                'Avtomatlashtirilgan savdo — 24/7',
                'Gann strategiyasi asosida',
                'Telegram orqali real-time nazorat',
                '15 daqiqada to\'liq ishga tushirish',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-6 sm:mt-9 flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/shop"
                className="group rounded-xl bg-cyan-600 px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-200/60 transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-cyan-300/70"
              >
                Robotni ishga tushirish
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/statistics"
                className="rounded-xl border border-slate-300 bg-white px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
              >
                Natijalarni ko&#39;rish
              </Link>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Har kuni grafik oldida o&#39;tirish shart emas — FATH buni siz uchun qiladi.
            </p>
          </div>

          {/* Hero logo */}
          <div className="fath-fade-up fath-delay-1 hidden lg:flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-cyan-400/[0.07] blur-[60px] scale-75" />
            <Image
              src="/logos/logo2.png"
              alt="FATH Trading Robot"
              width={560}
              height={560}
              className="relative w-full max-w-[520px] h-auto drop-shadow-[0_20px_50px_rgba(6,182,212,0.25)]"
              priority
            />
          </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. PROOF STRIP — Big numbers ═══ */}
      <section className="border-b border-cyan-100 bg-white/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {proofStats.map((s) => (
              <div key={s.label} className="fath-fade-up text-center rounded-xl sm:rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50/60 to-white p-3.5 sm:p-6">
                <span className="text-lg sm:text-2xl">{s.icon}</span>
                <p className="mt-1.5 sm:mt-2 text-2xl font-black text-cyan-700 sm:text-4xl">{s.value}</p>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            * Statistik ma&#39;lumotlar test natijalariga asoslangan. O&#39;tgan natijalar kelajakni kafolatlamaydi.
          </p>
        </div>
      </section>

      {/* ═══ 3. VIDEO CAROUSEL — Keep existing 3D coverflow ═══ */}
      {homeVideos.length > 0 && (
        <section className="relative overflow-hidden py-10 sm:py-20" style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #f0f9ff 40%, #eff6ff 70%, #ecfeff 100%)' }}>
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-cyan-400/[0.12] blur-[100px]" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-14">
              <span className="inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 mb-2 sm:mb-3">
                FATH Trading Robot
              </span>
              <h2 className="text-xl font-black text-slate-900 sm:text-3xl lg:text-4xl">Savdoni avtomatlashtiring, natijani kuzating</h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500">Algoritmik kuch, intizomli savdo — har bir video FATH imkoniyatlarini ko&apos;rsatadi</p>
            </div>

            {/* 3D Coverflow Container */}
            <div
              className="relative mx-auto select-none"
              style={{ perspective: '1200px', height: 'clamp(240px, 56vw, 500px)' }}
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
                  if (touchDelta < 0) setActiveVid((p) => (p < homeVideos.length - 1 ? p + 1 : 0));
                  else setActiveVid((p) => (p > 0 ? p - 1 : homeVideos.length - 1));
                }
                setTouchStart(null);
                setTouchDelta(0);
                setSwiping(false);
              }}
            >
              {homeVideos.map((vid, idx) => {
                const offset = idx - activeVid;
                const abs = Math.abs(offset);
                if (abs > 3) return null;

                const isCenter = offset === 0;
                const swipePx = swiping ? touchDelta * 0.12 : 0;
                const ry = -offset * 28;
                const tz = -abs * 120;
                const sc = Math.max(1 - abs * 0.14, 0.5);
                const op = abs === 0 ? 1 : abs === 1 ? 0.85 : abs === 2 ? 0.5 : 0.25;

                return (
                  <div
                    key={idx}
                    className="absolute top-1/2"
                    style={{
                      width: 'clamp(130px, 36vw, 280px)',
                      aspectRatio: '9 / 14',
                      left: `calc(50% + ${offset * 20}%)`,
                      maxHeight: '90%',
                      transform: `translateX(calc(-50% + ${swipePx}px)) translateY(-50%) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`,
                      zIndex: 10 - abs,
                      opacity: op,
                      transition: swiping ? 'none' : 'all 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
                      transformStyle: 'preserve-3d',
                      filter: isCenter ? 'none' : `brightness(${Math.max(0.75 - abs * 0.08, 0.4)})`,
                    }}
                    onClick={() => !isCenter && setActiveVid(idx)}
                  >
                    <div className={`relative h-full w-full rounded-2xl sm:rounded-3xl overflow-hidden ${
                      isCenter
                        ? 'ring-2 ring-cyan-400/50 shadow-2xl shadow-cyan-400/30'
                        : 'shadow-xl shadow-slate-400/40 cursor-pointer'
                    }`}>
                      <video
                        className="h-full w-full object-cover bg-slate-900"
                        src={vid.url}
                        controls={isCenter}
                        playsInline
                        muted={!isCenter}
                        controlsList="nodownload"
                      />
                      {vid.title && isCenter && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-10">
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
              {homeVideos.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveVid((p) => (p > 0 ? p - 1 : homeVideos.length - 1))}
                    className="hidden sm:flex absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-white/80 border border-slate-200 text-slate-600 shadow-lg backdrop-blur-md transition-all hover:bg-white hover:text-cyan-700 hover:border-cyan-300 hover:scale-110 cursor-pointer"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={() => setActiveVid((p) => (p < homeVideos.length - 1 ? p + 1 : 0))}
                    className="hidden sm:flex absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-white/80 border border-slate-200 text-slate-600 shadow-lg backdrop-blur-md transition-all hover:bg-white hover:text-cyan-700 hover:border-cyan-300 hover:scale-110 cursor-pointer"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>

            {/* Navigation dots */}
            {homeVideos.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 sm:mt-8">
                {homeVideos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveVid(idx)}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      activeVid === idx ? 'w-8 h-2.5 bg-cyan-600 shadow-lg shadow-cyan-400/40' : 'w-2.5 h-2.5 bg-slate-300 hover:bg-cyan-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ 4. NEGA FATH? — 4 strong cards ═══ */}
      <section className="border-y border-cyan-100 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
          <div className="text-center mb-7 sm:mb-10">
            <h2 className="text-xl font-black text-slate-900 sm:text-3xl lg:text-4xl">Nega aynan FATH?</h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">Boshqa robotlardan farqi — FATH strategiya, himoya va nazoratni bitta tizimda birlashtiradi</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {whyCards.map((card) => (
              <article key={card.title} className="fath-fade-up group rounded-xl sm:rounded-2xl border border-cyan-100 bg-gradient-to-b from-white to-cyan-50/40 p-4 sm:p-6 transition-all hover:shadow-lg hover:shadow-cyan-100/50 hover:-translate-y-1">
                <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-cyan-100 text-cyan-700 transition-colors group-hover:bg-cyan-600 group-hover:text-white [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-8 sm:[&>svg]:w-8">
                  {card.icon}
                </div>
                <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-black text-slate-900">{card.title}</h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">{card.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. MINI RESULTS — equity graph snippet ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
        <div className="fath-shell rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1.2fr] items-center">
            <div>
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Real natijalar
              </span>
              <h2 className="mt-3 sm:mt-4 text-xl font-black text-slate-900 sm:text-3xl">
                $1 000 → $2 797
              </h2>
              <p className="mt-1 text-sm text-emerald-600 font-bold">+179.7% o&#39;sish</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                FATH test davomida barqaror equity o&#39;sishini ko&#39;rsatdi. Tizim zarar paytida avtomatik recovery rejimiga o&#39;tadi va depozitni himoya qiladi.
              </p>
              <Link
                href="/statistics"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:text-cyan-800 transition-colors"
              >
                Batafsil statistikani ko&#39;rish
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Mini equity curve SVG */}
            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50/40 to-white p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Equity egri chizig&#39;i</p>
                <p className="text-xs text-slate-400">20 oy davomida</p>
              </div>
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={eqAreaPath} fill="url(#eqGrad)" />
                <path d={eqPath} fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Start dot */}
                <circle cx="0" cy={svgH - ((1000 - minY) / (maxY - minY)) * svgH} r="3.5" fill="#0891b2" />
                {/* End dot */}
                <circle cx={svgW} cy={svgH - ((2797 - minY) / (maxY - minY)) * svgH} r="3.5" fill="#059669" />
              </svg>
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>$1 000</span>
                <span className="text-emerald-600 font-bold">$2 797</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. 3 QADAM — Steps (improved) ═══ */}
      <section className="border-y border-cyan-100 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
          <div className="text-center mb-7 sm:mb-10">
            <h2 className="text-xl font-black text-slate-900 sm:text-3xl">3 qadam — va savdo boshlandi</h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500">Murakkab jarayon yo&#39;q. Oddiy ketma-ketlik bilan tez boshlaysiz.</p>
          </div>

          <div className="grid gap-3 sm:gap-6 grid-cols-3">
            {steps.map((s) => (
              <article key={s.n} className="fath-fade-up group relative rounded-xl sm:rounded-2xl border border-cyan-100 bg-white p-4 sm:p-7 text-center transition-all hover:shadow-lg hover:shadow-cyan-50 hover:-translate-y-1">
                <span className="text-xl sm:text-3xl">{s.icon}</span>
                <div className="mt-2 sm:mt-3 inline-flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-cyan-100 text-xs sm:text-sm font-black text-cyan-700">
                  {s.n}
                </div>
                <h3 className="mt-2 sm:mt-3 text-xs sm:text-lg font-black text-slate-900 leading-tight">{s.t}</h3>
                <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm text-slate-600 leading-4 sm:leading-normal">{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. EMOTIONAL TRIGGER + CTA ═══ */}
      <section className="relative overflow-hidden py-12 sm:py-20" style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #f0f9ff 50%, #ecfeff 100%)' }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-3xl sm:text-4xl mb-3 sm:mb-4">🤔</p>
          <h2 className="text-xl font-black text-slate-900 sm:text-3xl lg:text-4xl">
            Siz hali ham grafik qarab o&#39;tirasizmi?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 max-w-xl mx-auto">
            Har kuni soatlab monitor oldida o&#39;tirish — bu savdo emas, bu charchoq.
            FATH sizning o&#39;rningizda ishlaydi: kecha ham, tunda ham, dam olganingizda ham.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="group rounded-xl bg-cyan-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-200/60 transition hover:-translate-y-0.5 hover:bg-cyan-700"
            >
              Ha, robotni ishga tushiraman
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">Birinchi qadam — eng qiyin. Lekin eng muhim.</p>
        </div>
      </section>

      {/* ═══ 8. HAMKOR BROKERLAR ═══ */}
      {partnerBrokers.length > 0 && (
        <section className="border-b border-cyan-100 bg-white/70">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
            <div className="text-center mb-7 sm:mb-10">
              <h2 className="text-xl font-black text-slate-900 sm:text-3xl">Hamkor brokerlar</h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500">Quyidagi ishonchli brokerlar orqali bepul MT5 hisob oching va FATH robot bilan savdoni boshlang</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
              {partnerBrokers.map((broker, idx) => {
                const inner = (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 transition-all hover:shadow-lg hover:border-cyan-200 hover:-translate-y-1 w-28 sm:w-36">
                    <img
                      src={broker.logoUrl}
                      alt={broker.name}
                      className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                    />
                    <p className="text-[10px] sm:text-xs font-bold text-slate-700 text-center leading-tight">{broker.name}</p>
                    <span className="text-[9px] sm:text-[10px] font-semibold text-cyan-600">Hisob ochish →</span>
                  </div>
                );
                return broker.url ? (
                  <a key={idx} href={broker.url} target="_blank" rel="noopener noreferrer">{inner}</a>
                ) : (
                  <div key={idx}>{inner}</div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 8.5. JAMOAMIZ ═══ */}
      {teamMembers.length > 0 && (
        <section className="relative overflow-hidden py-10 sm:py-16" style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 40%, #f0f9ff 70%, #f0fdfa 100%)' }}>
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-teal-400/[0.08] blur-[100px]" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-flex rounded-full border border-teal-200 bg-white px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 mb-2 sm:mb-3">
                Bizning jamoa
              </span>
              <h2 className="text-xl font-black text-slate-900 sm:text-3xl lg:text-4xl">FATH ortidagi mutaxassislar</h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">Professional treyderlar va dasturchilar jamoasi sizning muvaffaqiyatingiz uchun ishlaydi</p>
            </div>

            <div className={`grid gap-4 sm:gap-6 ${teamMembers.length === 1 ? 'max-w-sm mx-auto' : teamMembers.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : teamMembers.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
              {teamMembers.map((member, idx) => (
                <article key={idx} className="group relative rounded-2xl sm:rounded-3xl border border-white/60 bg-white/80 backdrop-blur-sm p-5 sm:p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-teal-100/50 hover:-translate-y-1">
                  {/* Photo */}
                  <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 opacity-20 group-hover:opacity-40 transition-opacity scale-110" />
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="relative w-full h-full rounded-full object-cover border-3 border-white shadow-lg"
                    />
                  </div>

                  {/* Info */}
                  <h3 className="text-sm sm:text-base font-black text-slate-900">{member.name}</h3>
                  <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-teal-600">{member.role}</p>
                  {member.bio && (
                    <p className="mt-2 text-[11px] sm:text-xs text-slate-500 leading-4 sm:leading-5">{member.bio}</p>
                  )}

                  {/* Social links */}
                  {(member.telegram || member.instagram || member.linkedin) && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      {member.telegram && (
                        <a href={member.telegram} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500 transition hover:bg-sky-100 hover:text-sky-600 hover:scale-110">
                          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        </a>
                      )}
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-400 transition hover:bg-rose-100 hover:text-rose-500 hover:scale-110">
                          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition hover:bg-blue-100 hover:text-blue-600 hover:scale-110">
                          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 9. SOCIAL MEDIA — Keep existing ═══ */}
      {(socials.telegram || socials.instagram || socials.youtube) && (
        <section className="relative overflow-hidden py-10 sm:py-14">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-black text-slate-900 sm:text-3xl">Bizni ijtimoiy tarmoqlarda kuzating</h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500">Yangiliklar, signallar va natijalar — birinchilardan bo&apos;lib xabardor bo&apos;ling</p>

            <div className="mt-8 flex items-center justify-center gap-5 sm:gap-6">
              {socials.telegram && (
                <a
                  href={socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-xl shadow-sky-200/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-sky-300/60 group-hover:-translate-y-1">
                    <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-sky-600 transition-colors">Telegram</span>
                </a>
              )}

              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 shadow-xl shadow-rose-200/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-rose-300/60 group-hover:-translate-y-1">
                    <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-rose-500 transition-colors">Instagram</span>
                </a>
              )}

              {socials.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-xl shadow-red-200/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-red-300/60 group-hover:-translate-y-1">
                    <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-red-500 transition-colors">YouTube</span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 10. FINAL CTA — Stronger ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
        <div className="fath-shell rounded-2xl sm:rounded-3xl border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 px-5 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="text-xl font-black text-slate-900 sm:text-4xl">
            Tayyor bo&#39;lsangiz — boshlang.
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base leading-6 sm:leading-7 text-slate-600">
            Intizomli savdo hissiyotga emas, tizimga asoslanadi.
            FATH — sizning avtomatik savdo tizimingiz. Litsenziyani oling va bugun ishga tushiring.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/shop"
              className="group rounded-xl bg-cyan-600 px-7 sm:px-9 py-3 sm:py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-200/60 transition hover:-translate-y-0.5 hover:bg-cyan-700"
            >
              Robotni ishga tushirish
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/guide-mt5"
              className="rounded-xl border border-slate-300 bg-white px-7 sm:px-9 py-3 sm:py-3.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              O&#39;rnatish qo&#39;llanmasi
            </Link>
          </div>
          <p className="mt-4 sm:mt-5 text-[10px] sm:text-xs text-slate-400">
            Tariflarni ko&#39;rish, narxlarni solishtirish va tanlash — barchasi bir joyda.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
