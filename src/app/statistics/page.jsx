'use client';

import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

/* ── Data ── */
const heroStats = [
  { label: 'Yutuq foizi', value: '87.3%', icon: 'target', color: 'emerald' },
  { label: 'Profit Factor', value: '3.21', icon: 'chart', color: 'cyan' },
  { label: 'Oylik daromad', value: '+24.5%', icon: 'trending', color: 'emerald' },
  { label: 'Maks. drawdown', value: '12.8%', icon: 'shield', color: 'amber' },
];

const detailMetrics = [
  { label: 'Jami savdolar', value: '4 851', sub: 'yanvar — iyun' },
  { label: "O'rtacha yutuq", value: '$156.4', sub: 'har bir savdoda' },
  { label: "O'rtacha zarar", value: '$48.9', sub: 'har bir savdoda' },
  { label: 'Jami foyda', value: '$127 543', sub: 'yarim yillik' },
];

const months = [
  { m: 'Yan', v: 12.5 },
  { m: 'Fev', v: 18.3 },
  { m: 'Mar', v: 15.7 },
  { m: 'Apr', v: 22.1 },
  { m: 'May', v: 19.4 },
  { m: 'Iyn', v: 24.5 },
];

const equity = [1000, 1125, 1331, 1540, 1880, 2245, 2797];
const equityLabels = ['Bosh.', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn'];

const instruments = [
  { pair: 'XAUUSD', name: 'Oltin', trades: 1680, win: 89.2, profit: 48750, icon: '🥇' },
  { pair: 'BTCUSD', name: 'Bitcoin', trades: 820, win: 84.1, profit: 27300, icon: '₿' },
  { pair: 'GBPUSD', name: 'Funt/Dollar', trades: 710, win: 86.5, profit: 19200, icon: '£' },
  { pair: 'EURUSD', name: 'Yevro/Dollar', trades: 640, win: 88.9, profit: 15600, icon: '€' },
  { pair: 'USOIL', name: 'Neft (WTI)', trades: 520, win: 85.7, profit: 9850, icon: '🛢️' },
  { pair: 'SP500', name: 'S&P 500', trades: 481, win: 90.4, profit: 6843, icon: '📊' },
];

const maxV = Math.max(...months.map((m) => m.v));
const eqMax = Math.max(...equity);
const eqMin = Math.min(...equity);
const winRate = 87.3;

/* ── Icons ── */
function MetricIcon({ type, className }) {
  const cls = `h-5 w-5 ${className}`;
  if (type === 'target') return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  if (type === 'chart') return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>;
  if (type === 'trending') return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2 20l6-6 4 4 10-14"/></svg>;
  return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>;
}

const colorMap = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  cyan:    { bg: 'bg-cyan-100',    text: 'text-cyan-600',    ring: 'ring-cyan-200' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-600',   ring: 'ring-amber-200' },
};

export default function StatisticsPage() {
  /* SVG equity path */
  const svgW = 600, svgH = 200, pad = 0;
  const pts = equity.map((v, i) => {
    const x = pad + (i / (equity.length - 1)) * (svgW - pad * 2);
    const y = svgH - pad - ((v - eqMin) / (eqMax - eqMin)) * (svgH - pad * 2);
    return { x, y };
  });
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length - 1].x},${svgH} L${pts[0].x},${svgH} Z`;

  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cyan-100 fath-hero-glow">
        <div className="pointer-events-none absolute inset-0 fath-grid-bg opacity-70" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <span className="inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Yanvar — Iyun &middot; Real savdo natijalari
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Savdo statistikasi
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Haqiqiy trading natijalari va samaradorlik ko&apos;rsatkichlari — FATH algoritmining kuchi raqamlarda
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── 4 Hero Stat Cards ── */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-10">
          {heroStats.map((s) => {
            const c = colorMap[s.color];
            return (
              <article key={s.label} className="fath-shell fath-fade-up rounded-2xl p-5 sm:p-6">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ring-1 ${c.ring} mb-3`}>
                  <MetricIcon type={s.icon} className={c.text} />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{s.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
              </article>
            );
          })}
        </section>

        {/* ── Detail Metrics Row ── */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-10">
          {detailMetrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{m.label}</p>
              <p className="mt-1.5 text-xl font-black text-cyan-700">{m.value}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{m.sub}</p>
            </div>
          ))}
        </section>

        {/* ── Equity Curve + Win/Loss Donut ── */}
        <section className="grid gap-4 lg:grid-cols-[1fr_320px] mb-10">
          {/* Equity Curve */}
          <div className="fath-shell rounded-2xl p-4 sm:p-7">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">Balans o&apos;sishi</h2>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">$1,000 dan $2,797 gacha — 6 oy</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                +179.7%
              </span>
            </div>
            <div className="relative">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" preserveAspectRatio="none" style={{ minHeight: '160px' }}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0891b2" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r) => (
                  <line key={r} x1="0" y1={svgH * r} x2={svgW} y2={svgH * r} stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="4 4" />
                ))}
                <path d={areaD} fill="url(#eqGrad)" />
                <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="5" fill="white" stroke="#0891b2" strokeWidth="2.5" />
                ))}
              </svg>
              <div className="flex justify-between mt-2 px-1">
                {equityLabels.map((l) => (
                  <span key={l} className="text-[10px] font-semibold text-slate-400">{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Win/Loss Donut */}
          <div className="fath-shell rounded-2xl p-4 sm:p-7 flex flex-col items-center justify-center">
            <h2 className="text-sm sm:text-base font-black text-slate-900 mb-4 sm:mb-5">Yutuq / Zarar</h2>
            <div className="relative h-36 w-36 sm:h-44 sm:w-44">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="#10b981" strokeWidth="14"
                  strokeDasharray={`${winRate * 2.512} ${(100 - winRate) * 2.512}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{winRate}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Yutuq</span>
              </div>
            </div>
            <div className="flex items-center gap-5 mt-5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-600">Yutuq {winRate}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="text-xs font-semibold text-slate-600">Zarar {(100 - winRate).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Monthly Bar Chart ── */}
        <section className="fath-shell rounded-2xl p-4 sm:p-7 mb-10">
          <h2 className="text-sm sm:text-base font-black text-slate-900 mb-1">Oylik daromad dinamikasi</h2>
          <p className="text-xs text-slate-500 mb-6">Har oylik foizda o&apos;sish ko&apos;rsatkichi</p>
          <div className="flex items-end gap-1.5 sm:gap-4 h-44 sm:h-56">
            {months.map((m) => {
              const pct = (m.v / maxV) * 100;
              return (
                <div key={m.m} className="flex flex-1 flex-col items-center gap-1 sm:gap-1.5 group">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">+{m.v}%</span>
                  <div className="relative w-full overflow-hidden rounded-t-lg sm:rounded-t-xl transition-all duration-300 group-hover:scale-[1.03]" style={{ height: `${pct}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-600 to-emerald-400 opacity-85 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 hidden sm:flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-black text-white drop-shadow">+{m.v}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500">{m.m}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Risk / Reward Compare ── */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-4 mb-10">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-6 text-center">
            <div className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-100 mb-2 sm:mb-3">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
            </div>
            <p className="text-xl sm:text-3xl font-black text-emerald-700">$156.4</p>
            <p className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600/70">O&apos;rtacha yutuq</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 sm:p-6 text-center">
            <div className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-red-100 mb-2 sm:mb-3">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
            <p className="text-xl sm:text-3xl font-black text-red-600">$48.9</p>
            <p className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-500/70">O&apos;rtacha zarar</p>
          </div>
        </section>

        {/* ── Instruments Table ── */}
        <section className="fath-shell rounded-2xl overflow-hidden mb-10">
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900">Savdo instrumentlari</h2>
            <p className="text-xs text-slate-500 mt-0.5">FATH robot ishlaydigan asosiy bozorlar</p>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Instrument</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Savdolar</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Yutuq %</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Foyda</th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((p, i) => (
                  <tr key={p.pair} className={`transition-colors hover:bg-cyan-50/40 ${i < instruments.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base">{p.icon}</span>
                        <div>
                          <p className="font-bold text-slate-900">{p.pair}</p>
                          <p className="text-[11px] text-slate-400">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">{p.trades.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.win}%` }} />
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{p.win}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-cyan-700">+${p.profit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {instruments.map((p) => (
              <div key={p.pair} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base">{p.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.pair}</p>
                      <p className="text-[10px] text-slate-400">{p.name}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-cyan-700">+${p.profit.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Yutuq</span>
                      <span className="text-xs font-bold text-emerald-600">{p.win}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${p.win}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Savdolar</p>
                    <p className="text-sm font-bold text-slate-700">{p.trades.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <p className="text-[11px] text-slate-400 text-center mb-10">
          * Ko&apos;rsatkichlar o&apos;tgan davr natijalari asosida. Kelajakdagi daromad kafolatlanmaydi. Savdoda zarar ko&apos;rish xavfi mavjud.
        </p>

        {/* ── CTA ── */}
        <section className="fath-shell rounded-3xl border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 px-6 py-10 text-center sm:px-8 mb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 mb-4">
            <svg className="h-7 w-7 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl mb-2">Siz ham foyda olishni boshlang</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-lg mx-auto">
            FATH roboti bilan avtomatlashtirilgan savdoni bugunoq boshlang. Litsenziyani oling, robotni o&apos;rnating va natijani kuzating.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
              Litsenziya sotib olish
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700">
              Robot haqida batafsil
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
