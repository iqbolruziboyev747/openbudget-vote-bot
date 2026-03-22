'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

const PROFILES = [
  { id: 'conservative', name: 'Konservativ',  icon: '🛡️', color: '#10b981', monthlyReturn: 25,  maxDrawdown: 8,  desc: 'Minimal risk, barqaror foyda. Yangi boshlovchilar va kichik depozit uchun.' },
  { id: 'cautious',     name: 'Ehtiyotkor',   icon: '🔵', color: '#3b82f6', monthlyReturn: 70,  maxDrawdown: 18, desc: 'Past risk darajasi, o\'rtacha foyda. Tajribasi oz treyderlar uchun.' },
  { id: 'balanced',     name: 'Muvozanatli',  icon: '⚖️', color: '#f59e0b', monthlyReturn: 120, maxDrawdown: 30, desc: 'Optimal foyda va risk balansi. Ko\'pchilik uchun tavsiya etiladi.' },
  { id: 'aggressive',   name: 'Agressiv',     icon: '🔥', color: '#ef4444', monthlyReturn: 180, maxDrawdown: 45, desc: 'Yuqori foyda, yuqori risk. Tajribali treyderlar uchun.' },
  { id: 'maximum',      name: 'Maksimal',     icon: '🚀', color: '#9333ea', monthlyReturn: 250, maxDrawdown: 65, desc: 'Eng yuqori foyda va risk. Professional treyderlar, katta depozit uchun.' },
];

function getProfile(score) {
  if (score <= 20) return PROFILES[0];
  if (score <= 40) return PROFILES[1];
  if (score <= 60) return PROFILES[2];
  if (score <= 80) return PROFILES[3];
  return PROFILES[4];
}

function interpolateReturn(score) {
  const minR = 25, maxR = 250;
  return minR + (maxR - minR) * (score / 100);
}

function interpolateDrawdown(score) {
  const minD = 8, maxD = 65;
  return minD + (maxD - minD) * (score / 100);
}

function ProfitChart({ monthlyReturn, maxDrawdown, deposit, color }) {
  const W = 500, H = 240, PAD = 45;
  const days = 30;
  const dailyReturn = monthlyReturn / 22;
  const dailyDrawdownChance = maxDrawdown / 30;

  const profitPoints = [];
  const riskPoints = [];
  for (let d = 0; d <= days; d++) {
    const profit = deposit * (1 + (dailyReturn / 100) * d);
    const risk = deposit * (1 - (dailyDrawdownChance / 100) * d);
    profitPoints.push({ x: d, y: profit });
    riskPoints.push({ x: d, y: Math.max(risk, deposit * (1 - maxDrawdown / 100)) });
  }

  const allY = [...profitPoints.map(p => p.y), ...riskPoints.map(p => p.y)];
  const minY = Math.min(...allY) * 0.95;
  const maxY = Math.max(...allY) * 1.05;

  const scaleX = (d) => PAD + (d / days) * (W - PAD - 10);
  const scaleY = (v) => H - PAD - ((v - minY) / (maxY - minY)) * (H - PAD - 20);

  const profitPath = profitPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x).toFixed(1)},${scaleY(p.y).toFixed(1)}`).join(' ');
  const riskPath = riskPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x).toFixed(1)},${scaleY(p.y).toFixed(1)}`).join(' ');

  const profitAreaPath = profitPath + ` L${scaleX(days).toFixed(1)},${scaleY(deposit).toFixed(1)} L${scaleX(0).toFixed(1)},${scaleY(deposit).toFixed(1)} Z`;
  const riskAreaPath = riskPath + ` L${scaleX(days).toFixed(1)},${scaleY(deposit).toFixed(1)} L${scaleX(0).toFixed(1)},${scaleY(deposit).toFixed(1)} Z`;

  const yTicks = 5;
  const yStep = (maxY - minY) / yTicks;

  const finalProfit = profitPoints[profitPoints.length - 1].y;
  const finalRisk = riskPoints[riskPoints.length - 1].y;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 280 }}>
      <defs>
        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Y grid lines */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const val = minY + yStep * i;
        const y = scaleY(val);
        return (
          <g key={i}>
            <line x1={PAD} y1={y} x2={W - 10} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
            <text x={PAD - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8">${Math.round(val).toLocaleString()}</text>
          </g>
        );
      })}

      {/* X labels */}
      {[0, 7, 14, 21, 30].map((d) => (
        <text key={d} x={scaleX(d)} y={H - PAD + 14} textAnchor="middle" fontSize="8" fill="#94a3b8">
          {d === 0 ? 'Bugun' : `${d}-kun`}
        </text>
      ))}

      {/* Deposit baseline */}
      <line x1={PAD} y1={scaleY(deposit)} x2={W - 10} y2={scaleY(deposit)} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="4,3" />

      {/* Risk area + line */}
      <path d={riskAreaPath} fill="url(#riskGrad)" />
      <path d={riskPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.7" />

      {/* Profit area + line */}
      <path d={profitAreaPath} fill="url(#profitGrad)" />
      <path d={profitPath} fill="none" stroke={color} strokeWidth="2" />

      {/* End markers */}
      <circle cx={scaleX(days)} cy={scaleY(finalProfit)} r="3.5" fill={color} />
      <text x={scaleX(days) - 5} y={scaleY(finalProfit) - 8} textAnchor="end" fontSize="9" fontWeight="bold" fill={color}>
        +{((finalProfit - deposit) / deposit * 100).toFixed(0)}%
      </text>

      <circle cx={scaleX(days)} cy={scaleY(finalRisk)} r="3" fill="#ef4444" />
      <text x={scaleX(days) - 5} y={scaleY(finalRisk) + 14} textAnchor="end" fontSize="9" fontWeight="bold" fill="#ef4444">
        -{maxDrawdown}%
      </text>
    </svg>
  );
}

export default function RobotSettingsPage() {
  const [profit, setProfit] = useState(50);
  const [risk, setRisk] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [deposit, setDeposit] = useState(1000);
  const [period, setPeriod] = useState('month');
  const [robotProfiles, setRobotProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('standard');
  const [partnerBrokers, setPartnerBrokers] = useState([]);

  // Prop firm settings
  const [propBalance, setPropBalance] = useState(50000);
  const [propDailyRisk, setPropDailyRisk] = useState(5);
  const [propTotalRisk, setPropTotalRisk] = useState(10);
  const [propHedging, setPropHedging] = useState(false);
  const [propLotScaling, setPropLotScaling] = useState(false);

  useEffect(() => {
    fetch('/api/public/site-profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.profile?.robotProfiles?.length) {
          setRobotProfiles(data.profile.robotProfiles);
        }
        if (data?.profile?.partnerBrokers?.length) {
          setPartnerBrokers(data.profile.partnerBrokers);
        }
      })
      .catch(() => {});
  }, []);

  const avgScore = Math.round((profit + risk + speed) / 3);
  const profile = useMemo(() => getProfile(avgScore), [avgScore]);

  const monthlyReturn = interpolateReturn(avgScore);
  const maxDrawdown = interpolateDrawdown(avgScore);

  const periodMultiplier = period === 'day' ? 1 / 22 : period === 'week' ? 5 / 22 : 1;
  const periodLabel = period === 'day' ? 'kunlik' : period === 'week' ? 'haftalik' : 'oylik';
  const expectedProfit = deposit * (monthlyReturn / 100) * periodMultiplier;
  const expectedRisk = deposit * (maxDrawdown / 100) * periodMultiplier;

  const profileFile = robotProfiles.find((p) => p.id === profile.id);

  const propProfileId = useMemo(() => {
    if (propDailyRisk <= 3 && propTotalRisk <= 6) return 'conservative';
    if (propDailyRisk <= 5 && propTotalRisk <= 10) return 'cautious';
    return 'balanced';
  }, [propDailyRisk, propTotalRisk]);
  const propProfile = PROFILES.find((p) => p.id === propProfileId) || PROFILES[0];
  const propFile = robotProfiles.find((p) => p.id === `prop-${propProfileId}`);

  const sliders = [
    { label: 'Foyda maqsadi', icon: '💰', value: profit, setter: setProfit, low: 'Kam foyda', high: 'Yuqori foyda', gradient: 'from-emerald-400 via-amber-400 to-rose-500' },
    { label: 'Risk darajasi', icon: '⚡', value: risk, setter: setRisk, low: 'Minimal risk', high: 'Yuqori risk', gradient: 'from-emerald-400 via-amber-400 to-rose-500' },
    { label: 'Savdo tezligi', icon: '🔄', value: speed, setter: setSpeed, low: 'Kam savdo', high: 'Ko\'p savdo', gradient: 'from-cyan-400 via-blue-400 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded border border-amber-500/40 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
            Interaktiv sozlash
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Robot sozlamalari
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Slayderlarni surib o&apos;zingizga mos savdo profilini tanlang. Robot tayyor sozlamalar bilan ishlaydi.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('standard')}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === 'standard' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200/50' : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300'}`}
          >
            📊 Standart sozlamalar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prop')}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === 'prop' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200/50' : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'}`}
          >
            🏢 Prop firma sozlamalari
          </button>
        </div>

        {activeTab === 'standard' && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Sliders + Controls */}
          <div className="lg:col-span-3 space-y-5">

            {/* 3 Sliders */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Savdo parametrlari</h2>
              {sliders.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{s.icon} {s.label}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{s.value}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.value}
                    onChange={(e) => s.setter(Number(e.target.value))}
                    className="slider-input w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #f59e0b ${s.value}%, #e2e8f0 ${s.value}%, #e2e8f0 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">{s.low}</span>
                    <span className="text-[10px] text-slate-400">{s.high}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Deposit + Period */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Hisoblash parametrlari</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Depozit ($)</label>
                  <input
                    type="number"
                    min={100}
                    max={1000000}
                    value={deposit}
                    onChange={(e) => setDeposit(Math.max(100, Number(e.target.value) || 100))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-500"
                  />
                  <div className="flex gap-1.5 mt-2">
                    {[500, 1000, 5000, 10000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setDeposit(v)}
                        className={`rounded px-2 py-1 text-[10px] font-semibold transition ${deposit === v ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >${v.toLocaleString()}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Hisoblash muddati</label>
                  <div className="flex gap-2 mt-1">
                    {[
                      { id: 'day', label: '1 kun' },
                      { id: 'week', label: '1 hafta' },
                      { id: 'month', label: '1 oy' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPeriod(p.id)}
                        className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${period === p.id ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >{p.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900">Taxminiy foyda grafigi</h2>
                <span className="text-xs text-slate-400">30 kunlik prognoz</span>
              </div>
              <ProfitChart
                monthlyReturn={monthlyReturn}
                maxDrawdown={maxDrawdown}
                deposit={deposit}
                color={profile.color}
              />
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="h-2 w-4 rounded" style={{ background: profile.color }} /> Kutilgan foyda</span>
                <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-red-400 opacity-70" style={{ borderStyle: 'dashed' }} /> Maksimal risk</span>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">* Grafik taxminiy hisob-kitobga asoslangan. Haqiqiy natijalarga bozor sharoiti ta&apos;sir qiladi.</p>
            </div>
          </div>

          {/* Right: Profile summary */}
          <div className="lg:col-span-2 space-y-5">

            {/* Active Profile */}
            <div
              className="rounded-2xl border-2 p-5 shadow-sm transition-all duration-500"
              style={{ borderColor: profile.color, background: `${profile.color}08` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{profile.icon}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: profile.color }}>Tanlangan profil</p>
                  <h3 className="text-xl font-black text-slate-900">{profile.name}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">{profile.desc}</p>

              {/* Score meter */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500">Umumiy ball</span>
                  <span className="text-sm font-black" style={{ color: profile.color }}>{avgScore}/100</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${avgScore}%`, background: profile.color }}
                  />
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Foyda', val: profit },
                  { label: 'Risk', val: risk },
                  { label: 'Tezlik', val: speed },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="w-12 text-slate-500 font-medium">{b.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${b.val}%`, background: profile.color }}/>
                    </div>
                    <span className="w-6 text-right text-slate-500 font-bold">{b.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated numbers */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Taxminiy {periodLabel} natijalar</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-emerald-600">Kutilgan foyda</p>
                    <p className="text-lg font-black text-emerald-700">+${expectedProfit.toFixed(0)}</p>
                  </div>
                  <span className="text-2xl">📈</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-rose-50 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-rose-600">Maksimal risk</p>
                    <p className="text-lg font-black text-rose-700">-${expectedRisk.toFixed(0)}</p>
                  </div>
                  <span className="text-2xl">📉</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-cyan-50 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-cyan-600">Oylik daromad</p>
                    <p className="text-lg font-black text-cyan-700">~{monthlyReturn.toFixed(0)}%</p>
                  </div>
                  <span className="text-2xl">💹</span>
                </div>
              </div>
            </div>

            {/* Download button */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
              {profileFile ? (
                <>
                  <a
                    href={profileFile.fileUrl}
                    download
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                    style={{ background: profile.color }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Sozlamani yuklash (.set)
                  </a>
                  <p className="mt-2 text-xs text-slate-500">{profile.icon} {profile.name} profili sozlamalari</p>
                </>
              ) : (
                <div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-600">Sozlama fayli hali tayyorlanmagan</p>
                    <p className="mt-1 text-xs text-slate-400">Bu profil uchun .set fayl tez orada qo&apos;shiladi.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Guide link */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-xs text-amber-800 mb-2">
                Yuklab olingan .set faylni MT5 da robot sozlamalariga import qiling
              </p>
              <Link href="/guide-mt5" className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline">
                O&apos;rnatish qo&apos;llanmasi →
              </Link>
            </div>

            {/* Broker recommendation */}
            {partnerBrokers.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-700 mb-2">Savdoni boshlash uchun</p>
                <p className="text-[11px] text-slate-500 mb-3">Robot bilan ishlash uchun MT5 ni qo&apos;llab-quvvatlaydigan ishonchli broker kerak</p>
                <div className="flex flex-wrap gap-2">
                  {partnerBrokers.map((b, i) => (
                    <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 transition hover:border-cyan-300 hover:shadow-sm">
                      <img src={b.logoUrl} alt={b.name} className="h-5 w-5 object-contain" />
                      <span className="text-[10px] font-semibold text-slate-600">{b.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* ═══ PROP FIRMA SOZLAMALARI ═══ */}
        {activeTab === 'prop' && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Prop Controls */}
          <div className="lg:col-span-3 space-y-5">

            <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏢</span>
                <h2 className="text-lg font-bold text-slate-900">Prop firma hisobi sozlamalari</h2>
              </div>
              <p className="text-sm text-slate-600 mb-5">Prop challenge yoki real prop hisobingiz qoidalariga mos sozlamalarni tanlang.</p>

              {/* Prop Balance */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Hisob balansi ($)</label>
                <div className="flex flex-wrap gap-2">
                  {[10000, 25000, 50000, 100000, 200000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPropBalance(v)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${propBalance === v ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300'}`}
                    >${v.toLocaleString()}</button>
                  ))}
                </div>
              </div>

              {/* Daily Risk Limit */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">📉 Kunlik risk chegarasi</span>
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">{propDailyRisk}%</span>
                </div>
                <input
                  type="range" min={1} max={10} step={0.5}
                  value={propDailyRisk}
                  onChange={(e) => setPropDailyRisk(Number(e.target.value))}
                  className="slider-input w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #10b981 0%, #ef4444 ${propDailyRisk * 10}%, #e2e8f0 ${propDailyRisk * 10}%, #e2e8f0 100%)` }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-400">1% — xavfsiz</span>
                  <span className="text-[10px] text-slate-400">10% — yuqori risk</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Kuniga maksimal ${(propBalance * propDailyRisk / 100).toLocaleString()} yo&apos;qotish chegarasi</p>
              </div>

              {/* Total Risk Limit */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">📊 Umumiy risk chegarasi</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">{propTotalRisk}%</span>
                </div>
                <input
                  type="range" min={4} max={20} step={1}
                  value={propTotalRisk}
                  onChange={(e) => setPropTotalRisk(Number(e.target.value))}
                  className="slider-input w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #10b981 0%, #f59e0b ${propTotalRisk * 5}%, #e2e8f0 ${propTotalRisk * 5}%, #e2e8f0 100%)` }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-400">4% — konservativ</span>
                  <span className="text-[10px] text-slate-400">20% — agressiv</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Umumiy maksimal ${(propBalance * propTotalRisk / 100).toLocaleString()} yo&apos;qotish chegarasi</p>
              </div>

              {/* Toggle options */}
              <div className="space-y-3">
                <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 cursor-pointer hover:border-purple-200 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">🔀 Hedging (qarama-qarshi pozitsiyalar)</p>
                    <p className="text-xs text-slate-500">Bir vaqtda Buy va Sell pozitsiyalarni ochish</p>
                  </div>
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${propHedging ? 'bg-purple-600' : 'bg-slate-300'}`} onClick={() => setPropHedging(!propHedging)}>
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${propHedging ? 'translate-x-5' : 'translate-x-0.5'}`}/>
                  </div>
                </label>
                <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 cursor-pointer hover:border-purple-200 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">📈 Lot oshirish (martingale)</p>
                    <p className="text-xs text-slate-500">Yo&apos;qotishdan keyin lot hajmini oshirish</p>
                  </div>
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${propLotScaling ? 'bg-purple-600' : 'bg-slate-300'}`} onClick={() => setPropLotScaling(!propLotScaling)}>
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${propLotScaling ? 'translate-x-5' : 'translate-x-0.5'}`}/>
                  </div>
                </label>
              </div>
            </div>

            {/* Prop risk visual */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Prop firma qoidalari moslik</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Kunlik risk</span>
                    <span className={`font-bold ${propDailyRisk <= 5 ? 'text-emerald-600' : propDailyRisk <= 8 ? 'text-amber-600' : 'text-rose-600'}`}>{propDailyRisk}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${propDailyRisk <= 5 ? 'bg-emerald-500' : propDailyRisk <= 8 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${propDailyRisk * 10}%` }}/>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{propDailyRisk <= 5 ? '✅ Ko\'pchilik prop firmalar ruxsat beradi' : propDailyRisk <= 8 ? '⚠️ Ba\'zi firmalarda chegarada' : '❌ Ko\'p prop firmalar rad etadi'}</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Umumiy risk</span>
                    <span className={`font-bold ${propTotalRisk <= 10 ? 'text-emerald-600' : propTotalRisk <= 15 ? 'text-amber-600' : 'text-rose-600'}`}>{propTotalRisk}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${propTotalRisk <= 10 ? 'bg-emerald-500' : propTotalRisk <= 15 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${propTotalRisk * 5}%` }}/>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{propTotalRisk <= 10 ? '✅ Standart prop firma talablariga mos' : propTotalRisk <= 15 ? '⚠️ Ehtiyotkorlik bilan foydalaning' : '❌ Ko\'p prop firmalar rad etadi'}</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Hedging</span>
                    <span className={`font-bold ${propHedging ? 'text-amber-600' : 'text-emerald-600'}`}>{propHedging ? 'Yoqilgan' : 'O\'chirilgan'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{propHedging ? '⚠️ Ba\'zi prop firmalar hedging ni taqiqlaydi — firmangiz qoidalarini tekshiring' : '✅ Xavfsiz — ko\'pchilik firmalar qabul qiladi'}</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Lot oshirish</span>
                    <span className={`font-bold ${propLotScaling ? 'text-rose-600' : 'text-emerald-600'}`}>{propLotScaling ? 'Yoqilgan' : 'O\'chirilgan'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{propLotScaling ? '❌ Ko\'pchilik prop firmalar martingale ni taqiqlaydi!' : '✅ Xavfsiz — standart lot boshqaruvi'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Prop Summary */}
          <div className="lg:col-span-2 space-y-5">

            <div className="rounded-2xl border-2 border-purple-300 p-5 shadow-sm" style={{ background: '#f5f3ff' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🏢</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Prop sozlamalari</p>
                  <h3 className="text-xl font-black text-slate-900">{propProfile.name}</h3>
                </div>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between rounded-lg bg-white/80 p-2.5">
                  <span className="text-slate-600">Balans</span>
                  <span className="font-bold text-slate-900">${propBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-white/80 p-2.5">
                  <span className="text-slate-600">Kunlik risk</span>
                  <span className="font-bold text-rose-600">{propDailyRisk}% (${(propBalance * propDailyRisk / 100).toLocaleString()})</span>
                </div>
                <div className="flex justify-between rounded-lg bg-white/80 p-2.5">
                  <span className="text-slate-600">Umumiy risk</span>
                  <span className="font-bold text-amber-600">{propTotalRisk}% (${(propBalance * propTotalRisk / 100).toLocaleString()})</span>
                </div>
                <div className="flex justify-between rounded-lg bg-white/80 p-2.5">
                  <span className="text-slate-600">Hedging</span>
                  <span className={`font-bold ${propHedging ? 'text-purple-600' : 'text-slate-400'}`}>{propHedging ? '✅ Yoqilgan' : '❌ O\'chirilgan'}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-white/80 p-2.5">
                  <span className="text-slate-600">Lot oshirish</span>
                  <span className={`font-bold ${propLotScaling ? 'text-purple-600' : 'text-slate-400'}`}>{propLotScaling ? '✅ Yoqilgan' : '❌ O\'chirilgan'}</span>
                </div>
              </div>
            </div>

            {/* Taxminiy natijalar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Taxminiy oylik natijalar</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-emerald-600">Kutilgan foyda</p>
                    <p className="text-lg font-black text-emerald-700">+${(propBalance * propProfile.monthlyReturn / 100 * 0.3).toFixed(0)}</p>
                  </div>
                  <span className="text-2xl">📈</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-rose-50 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-rose-600">Max kunlik yo&apos;qotish</p>
                    <p className="text-lg font-black text-rose-700">-${(propBalance * propDailyRisk / 100).toLocaleString()}</p>
                  </div>
                  <span className="text-2xl">📉</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-purple-600">Max umumiy yo&apos;qotish</p>
                    <p className="text-lg font-black text-purple-700">-${(propBalance * propTotalRisk / 100).toLocaleString()}</p>
                  </div>
                  <span className="text-2xl">🛡️</span>
                </div>
              </div>
            </div>

            {/* Download prop .set */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
              {propFile ? (
                <>
                  <a
                    href={propFile.fileUrl}
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-purple-700 hover:shadow-xl"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Prop sozlamani yuklash (.set)
                  </a>
                  <p className="mt-2 text-xs text-slate-500">🏢 {propProfile.name} prop sozlamalari</p>
                </>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Prop sozlama fayli hali tayyorlanmagan</p>
                  <p className="mt-1 text-xs text-slate-400">Bu profil uchun .set fayl tez orada qo&apos;shiladi.</p>
                </div>
              )}
            </div>

            {/* Prop firma eslatmalar */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
              <h4 className="text-xs font-bold text-purple-800 mb-2">💡 Prop firma uchun maslahatlar</h4>
              <ul className="space-y-1 text-xs text-purple-700">
                <li>• Firmangiz qoidalarini diqqat bilan o&apos;qing</li>
                <li>• Avval demo challenge&apos;da sinang</li>
                <li>• Hedging va martingale qoidalarini tekshiring</li>
                <li>• Kunlik risk chegarasidan ortib ketmang</li>
              </ul>
            </div>
          </div>
        </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2">⚠️ Muhim ogohlantirishlar</h3>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li>• Ko&apos;rsatilgan foydalar — o&apos;tgan natijalarga asoslangan <strong>taxminiy</strong> raqamlar. Kelajakdagi natijalar farq qilishi mumkin.</li>
            <li>• Forex va metallar savdosi yuqori risk bilan bog&apos;liq. Faqat yo&apos;qotishga tayyor bo&apos;lgan mablag&apos; bilan savdo qiling.</li>
            <li>• Agressiv va Maksimal profillar katta foyda berishi mumkin, lekin yo&apos;qotish xavfi ham yuqori.</li>
            <li>• Dastlab demo hisobda sinab ko&apos;ring, keyin real hisobga o&apos;ting.</li>
          </ul>
        </div>

      </main>

      <SiteFooter />

      <style jsx>{`
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #0891b2;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: transform 0.15s;
        }
        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .slider-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #0891b2;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
