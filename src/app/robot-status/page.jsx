'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { auth } from '../../lib/firebase';
import useAuthUser from '../../lib/useAuthUser';

function toDateLabel(value) {
  try {
    if (!value) return '-';
    if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString();
    return new Date(value).toLocaleString();
  } catch {
    return '-';
  }
}

function timeAgo(value) {
  try {
    const ms = value?.seconds ? value.seconds * 1000 : Date.parse(value);
    if (!ms) return '';
    const diff = Date.now() - ms;
    if (diff < 60000) return 'hozirgina';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} daqiqa oldin`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} soat oldin`;
    return `${Math.floor(diff / 86400000)} kun oldin`;
  } catch {
    return '';
  }
}

function statusMeta(license) {
  const now = Date.now();
  const heartbeatMs = Date.parse(license.lastHeartbeatAt || license.lastSeenAt || 0) || 0;
  const minutesFromHeartbeat = heartbeatMs ? (now - heartbeatMs) / 60000 : Number.POSITIVE_INFINITY;

  if (license.status !== 'active') {
    return { text: 'Faol emas', color: 'rose', dot: 'bg-rose-500', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
  if (!heartbeatMs) {
    return { text: 'Ulanmagan', color: 'amber', dot: 'bg-amber-400', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (minutesFromHeartbeat > 45) {
    return { text: 'Offline', color: 'rose', dot: 'bg-rose-500', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
  return { text: 'Online', color: 'emerald', dot: 'bg-emerald-500 animate-pulse', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
}

function StatCard({ label, value, sub, color }) {
  const colorClasses = {
    cyan: 'border-cyan-100 bg-gradient-to-br from-cyan-50 to-white',
    emerald: 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-white',
    rose: 'border-rose-100 bg-gradient-to-br from-rose-50 to-white',
    slate: 'border-slate-200 bg-white',
  };
  const valueClasses = {
    cyan: 'text-cyan-700',
    emerald: 'text-emerald-700',
    rose: 'text-rose-700',
    slate: 'text-slate-900',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colorClasses[color] || colorClasses.slate}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${valueClasses[color] || valueClasses.slate}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-slate-500">{sub}</p>}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-500 shrink-0">{label}</span>
      <span className={`text-sm text-slate-800 text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>{value || '-'}</span>
    </div>
  );
}

export default function RobotStatusPage() {
  const { user, loading: userLoading } = useAuthUser();
  const [licenses, setLicenses] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllTrades, setShowAllTrades] = useState(false);

  useEffect(() => {
    if (!user) return;

    let stop = false;

    const load = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const query = new URLSearchParams({
          uid: user.uid || '',
          email: user.email || '',
        });

        const res = await fetch(`/api/me/records?${query.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Yuklashda xatolik');
        const data = await res.json();
        if (stop) return;

        const sortedLicenses = (data.licenses || []).sort((a, b) => {
          const aMs = Date.parse(a.updatedAt || a.issuedAt || 0) || 0;
          const bMs = Date.parse(b.updatedAt || b.issuedAt || 0) || 0;
          return bMs - aMs;
        });

        const sortedTrades = (data.trades || []).sort((a, b) => {
          const aMs = Date.parse(a.closedAt || a.createdAt || 0) || 0;
          const bMs = Date.parse(b.closedAt || b.createdAt || 0) || 0;
          return bMs - aMs;
        });

        setLicenses(sortedLicenses);
        setTrades(sortedTrades);
      } catch {
        if (!stop) {
          setLicenses([]);
          setTrades([]);
        }
      } finally {
        if (!stop) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, 10000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [user]);

  const summary = useMemo(() => {
    const totalTrades = trades.length;
    const wins = trades.filter((t) => Number(t.pnl || 0) > 0).length;
    const losses = trades.filter((t) => Number(t.pnl || 0) < 0).length;
    const netProfit = trades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const avgWin = wins > 0 ? trades.filter((t) => Number(t.pnl || 0) > 0).reduce((s, t) => s + Number(t.pnl), 0) / wins : 0;
    const avgLoss = losses > 0 ? trades.filter((t) => Number(t.pnl || 0) < 0).reduce((s, t) => s + Number(t.pnl), 0) / losses : 0;
    return { totalTrades, wins, losses, netProfit, winRate, avgWin, avgLoss };
  }, [trades]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-slate-700">
        <div className="fath-shell rounded-2xl p-8 text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100">
            <svg className="h-7 w-7 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-slate-800 font-semibold mb-1">Kirish talab etiladi</p>
          <p className="text-sm text-slate-500 mb-5">Robot holatini ko'rish uchun tizimga kiring.</p>
          <Link href="/login" className="inline-block px-6 py-2.5 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-700 transition">Kirish</Link>
        </div>
      </div>
    );
  }

  const visibleTrades = showAllTrades ? trades : trades.slice(0, 10);

  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Robot holati</h1>
            <p className="text-sm text-slate-500 mt-1">Real vaqtda litsenziya holati, hisob monitoringi va savdo statistikasi</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-cyan-300 hover:text-cyan-700 transition">
            ← Kabinet
          </Link>
        </div>

        {loading ? (
          <div className="fath-shell rounded-3xl p-12 text-center">
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin mb-4" />
            <p className="text-slate-500">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <>
            {/* License Cards */}
            {licenses.length === 0 ? (
              <div className="fath-shell rounded-3xl p-8 text-center mb-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-800">Litsenziya topilmadi</p>
                <p className="text-sm text-slate-500 mt-1 mb-4">Robot holatini ko'rish uchun avval litsenziya sotib oling.</p>
                <Link href="/shop" className="inline-block rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition">Litsenziya olish</Link>
              </div>
            ) : (
              <div className="space-y-5 mb-8">
                {licenses.map((license) => {
                  const meta = statusMeta(license);
                  const bal = Number(license.lastBalance || 0);
                  const eq = Number(license.lastEquity || 0);
                  const fm = Number(license.lastFreeMargin || 0);
                  const ml = Number(license.lastMarginLevel || 0);
                  const op = Number(license.lastOpenPositions || 0);

                  return (
                    <div key={license.id} className="fath-shell rounded-3xl overflow-hidden">
                      {/* License Status Bar */}
                      <div className={`flex items-center justify-between gap-3 px-6 py-3 ${
                        meta.color === 'emerald' ? 'bg-emerald-50 border-b border-emerald-100' :
                        meta.color === 'amber' ? 'bg-amber-50 border-b border-amber-100' :
                        'bg-rose-50 border-b border-rose-100'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-full ${meta.dot}`} />
                          <span className={`text-sm font-bold ${
                            meta.color === 'emerald' ? 'text-emerald-700' :
                            meta.color === 'amber' ? 'text-amber-700' :
                            'text-rose-700'
                          }`}>{meta.text}</span>
                          {license.lastHeartbeatAt && (
                            <span className="text-xs text-slate-500">• {timeAgo(license.lastHeartbeatAt || license.lastSeenAt)}</span>
                          )}
                        </div>
                        <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${meta.cls}`}>
                          {license.status === 'active' ? 'ACTIVE' : (license.status || '-').toUpperCase()}
                        </span>
                      </div>

                      <div className="p-6">
                        {/* Account Summary Grid */}
                        {bal > 0 && (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-5">
                            <StatCard label="Balans" value={`$${bal.toFixed(2)}`} color="cyan" />
                            <StatCard label="Equity" value={`$${eq.toFixed(2)}`} color={eq >= bal ? 'emerald' : 'rose'} />
                            <StatCard label="Erkin margin" value={`$${fm.toFixed(2)}`} color="slate" />
                            <StatCard label="Margin level" value={`${ml.toFixed(1)}%`} color={ml > 200 ? 'emerald' : ml > 100 ? 'slate' : 'rose'} />
                            <StatCard label="Ochiq pozitsiyalar" value={op} color="slate" />
                          </div>
                        )}

                        {/* License Details */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-2">Litsenziya</p>
                            <InfoRow label="Kalit" value={license.licenseKey} mono />
                            <InfoRow label="MT5 hisob" value={license.accountId} mono />
                            <InfoRow label="Tarif" value={license.planName || license.planId} />
                            <InfoRow label="Amal qiladi" value={toDateLabel(license.expiresAt)} />
                          </div>
                          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-2">Terminal</p>
                            <InfoRow label="Oxirgi heartbeat" value={toDateLabel(license.lastHeartbeatAt || license.lastSeenAt)} />
                            <InfoRow label="EA versiya" value={license.lastEaVersion} />
                            <InfoRow label="Terminal ID" value={license.lastTerminalId} mono />
                            <InfoRow label="Berilgan" value={toDateLabel(license.issuedAt)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Trade Statistics */}
            <section className="fath-shell rounded-3xl p-6 mb-5">
              <h2 className="text-xl font-black text-slate-900 mb-4">Savdo statistikasi</h2>

              {summary.totalTrades === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-500">Hozircha bitimlar mavjud emas.</p>
                  <p className="text-xs text-slate-400 mt-1">Robot savdo ochgandan keyin natijalar shu yerda ko'rinadi.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mb-5">
                    <StatCard label="Jami bitim" value={summary.totalTrades} color="slate" />
                    <StatCard label="Yutuq" value={summary.wins} color="emerald" />
                    <StatCard label="Yutqazilgan" value={summary.losses} color="rose" />
                    <StatCard label="Winrate" value={`${summary.winRate.toFixed(1)}%`} color={summary.winRate >= 50 ? 'emerald' : 'rose'} />
                    <StatCard label="Sof P/L" value={`$${summary.netProfit.toFixed(2)}`} color={summary.netProfit >= 0 ? 'emerald' : 'rose'} />
                    <StatCard label="O'rtacha yutuq" value={`$${summary.avgWin.toFixed(2)}`} color="emerald" />
                    <StatCard label="O'rtacha zarar" value={`$${summary.avgLoss.toFixed(2)}`} color="rose" />
                  </div>

                  {/* Win/Loss Bar */}
                  {summary.totalTrades > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="text-emerald-600 font-semibold">{summary.wins} yutuq</span>
                        <span>/</span>
                        <span className="text-rose-600 font-semibold">{summary.losses} zarar</span>
                      </div>
                      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="bg-emerald-500 rounded-l-full transition-all duration-700"
                          style={{ width: `${summary.winRate}%` }}
                        />
                        <div
                          className="bg-rose-400 rounded-r-full transition-all duration-700"
                          style={{ width: `${100 - summary.winRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Trade History */}
            {trades.length > 0 && (
              <section className="fath-shell rounded-3xl overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <h2 className="text-xl font-black text-slate-900">Bitimlar tarixi</h2>
                  <span className="text-xs text-slate-500">{trades.length} ta bitim</span>
                </div>

                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_0.8fr_0.6fr_0.8fr_0.8fr_0.8fr] gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <span>Instrument</span>
                  <span>Yo'nalish</span>
                  <span>Lot</span>
                  <span>Yopilgan vaqt</span>
                  <span>Ticket</span>
                  <span className="text-right">P/L</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {visibleTrades.map((trade) => {
                    const pnl = Number(trade.pnl || 0);
                    const isWin = pnl >= 0;
                    const side = String(trade.side || '').toUpperCase();
                    return (
                      <div key={trade.id} className="grid grid-cols-2 sm:grid-cols-[1fr_0.8fr_0.6fr_0.8fr_0.8fr_0.8fr] gap-2 items-center px-6 py-3 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${isWin ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                          <span className="text-sm font-bold text-slate-900">{trade.symbol || 'UNKNOWN'}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
                          side === 'BUY' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>{side || '-'}</span>
                        <span className="text-sm text-slate-600">{Number(trade.volume || 0).toFixed(2)}</span>
                        <span className="text-xs text-slate-500">{toDateLabel(trade.closedAt)}</span>
                        <span className="text-xs font-mono text-slate-500">{trade.ticket || '-'}</span>
                        <span className={`text-sm font-bold text-right ${isWin ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isWin ? '+' : ''}{pnl.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {trades.length > 10 && (
                  <div className="px-6 py-3 border-t border-slate-100 text-center">
                    <button
                      onClick={() => setShowAllTrades((p) => !p)}
                      className="text-sm font-semibold text-cyan-700 hover:text-cyan-800 transition"
                    >
                      {showAllTrades ? 'Kamroq ko\'rsatish' : `Hammasini ko'rsatish (${trades.length} ta)`}
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
