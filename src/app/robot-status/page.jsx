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

function statusMeta(license) {
  const now = Date.now();
  const heartbeatMs = Date.parse(license.lastHeartbeatAt || license.lastSeenAt || 0) || 0;
  const minutesFromHeartbeat = heartbeatMs ? (now - heartbeatMs) / 60000 : Number.POSITIVE_INFINITY;

  if (license.status !== 'active') {
    return { text: 'Litsenziya faol emas', cls: 'bg-rose-100 text-rose-700' };
  }
  if (!heartbeatMs) {
    return { text: 'Robot ulanmagan', cls: 'bg-amber-100 text-amber-700' };
  }
  if (minutesFromHeartbeat > 45) {
    return { text: 'Robot offline', cls: 'bg-rose-100 text-rose-700' };
  }
  return { text: 'Robot online', cls: 'bg-emerald-100 text-emerald-700' };
}

export default function RobotStatusPage() {
  const { user, loading: userLoading } = useAuthUser();
  const [licenses, setLicenses] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return { totalTrades, wins, losses, netProfit, winRate };
  }, [trades]);

  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-700">Yuklanmoqda...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-slate-700">
        <div className="fath-shell rounded-2xl p-6 text-center">
          <p className="mb-4">Sahifani ko'rish uchun tizimga kiring.</p>
          <Link href="/login" className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Kirish</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="fath-shell rounded-3xl p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Robot Holati</h1>
              <p className="text-slate-600 mt-1">Litsenziya tasdiqlanishi, online/offline holat, hisob ko'rsatkichlari va bitim statistikasi.</p>
            </div>
            <Link href="/dashboard" className="rounded-lg border border-cyan-200 px-4 py-2 text-sm text-cyan-700 hover:bg-cyan-100">Kabinetga qaytish</Link>
          </div>
        </section>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">Robot va Litsenziya Holati</h2>
          {loading ? (
            <p className="text-slate-500 mt-4">Yuklanmoqda...</p>
          ) : licenses.length === 0 ? (
            <p className="text-slate-600 mt-4">Litsenziya topilmadi.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {licenses.map((license) => {
                const meta = statusMeta(license);
                return (
                  <article key={license.id} className="rounded-xl border border-cyan-100 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Litsenziya</p>
                        <p className="font-mono text-sm break-all">{license.licenseKey || '-'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>{meta.text}</span>
                    </div>

                    <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-slate-700">
                      <p>MT5 hisob: {license.accountId || '-'}</p>
                      <p>Tarif: {license.planName || license.planId || '-'}</p>
                      <p>Muddat: {toDateLabel(license.expiresAt)}</p>
                      <p>Oxirgi heartbeat: {toDateLabel(license.lastHeartbeatAt || license.lastSeenAt)}</p>
                      <p>Balans: {Number(license.lastBalance || 0).toFixed(2)}</p>
                      <p>Equity: {Number(license.lastEquity || 0).toFixed(2)}</p>
                      <p>Free margin: {Number(license.lastFreeMargin || 0).toFixed(2)}</p>
                      <p>Margin level: {Number(license.lastMarginLevel || 0).toFixed(1)}%</p>
                      <p>Ochiq pozitsiyalar: {Number(license.lastOpenPositions || 0)}</p>
                      <p>Terminal: {license.lastTerminalId || '-'}</p>
                      <p>EA versiya: {license.lastEaVersion || '-'}</p>
                      <p>Status: {license.status || '-'}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="fath-shell rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-black text-slate-900">Robot Bitimlari Statistikasi</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Jami bitim</p><p className="text-2xl font-black text-slate-900 mt-1">{summary.totalTrades}</p></div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4"><p className="text-xs text-slate-500">Yutuq</p><p className="text-2xl font-black text-emerald-700 mt-1">{summary.wins}</p></div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4"><p className="text-xs text-slate-500">Yutqazilgan</p><p className="text-2xl font-black text-rose-700 mt-1">{summary.losses}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Winrate</p><p className="text-2xl font-black text-slate-900 mt-1">{summary.winRate.toFixed(1)}%</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Sof P/L</p><p className={`text-2xl font-black mt-1 ${summary.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{summary.netProfit.toFixed(2)}</p></div>
          </div>

          {trades.length > 0 && (
            <div className="mt-4 space-y-2">
              {trades.slice(0, 15).map((trade) => (
                <article key={trade.id} className="rounded-xl border border-cyan-100 bg-white p-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">{trade.symbol || 'UNKNOWN'}</span>
                      <span className="mx-2 text-slate-400">|</span>
                      Ticket: {trade.ticket || '-'}
                      <span className="mx-2 text-slate-400">|</span>
                      {String(trade.side || 'unknown').toUpperCase()}
                    </div>
                    <div className={`text-sm font-semibold ${Number(trade.pnl || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {Number(trade.pnl || 0).toFixed(2)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Yopilgan vaqt: {toDateLabel(trade.closedAt)} | Lot: {Number(trade.volume || 0).toFixed(2)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
