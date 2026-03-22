'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import useAuthUser from '../../lib/useAuthUser';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { downloadCertificatePdf, downloadContractPdf } from '../../lib/pdfDocuments';

/* ─── helpers ─── */
function toDateLabel(value) {
  try {
    if (!value) return '-';
    if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString();
    return new Date(value).toLocaleString();
  } catch {
    return '-';
  }
}

function badgeClass(status) {
  if (status === 'paid' || status === 'active') return 'fath-badge fath-badge--paid';
  if (status === 'pending' || status === 'processing') return 'fath-badge fath-badge--pending';
  return 'fath-badge fath-badge--expired';
}

/* ─── SVG icons (inline, no dependency) ─── */
const icons = {
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>
  ),
  key: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
  ),
  wallet: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  ),
  chart: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  ),
  settings: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  ),
  robot: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
  ),
  shop: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
  ),
  copy: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
  ),
  download: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
};

/* ─── nav items ─── */
const navItems = [
  { id: 'overview', label: 'Bosh sahifa', icon: icons.home },
  { id: 'licenses', label: 'Litsenziyalar', icon: icons.key },
  { id: 'payments', label: 'To\'lovlar', icon: icons.wallet },
  { id: 'robot', label: 'Savdo natijalar', icon: icons.chart },
];

const quickLinks = [
  { href: '/robot-settings', label: 'Sozlamalar', icon: icons.settings },
  { href: '/robot-status', label: 'Robot holati', icon: icons.robot },
  { href: '/shop', label: 'Tarif olish', icon: icons.shop },
];

/* ═══════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuthUser();

  const [licenses, setLicenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [trades, setTrades] = useState([]);
  const [profile, setProfile] = useState({ fullName: '', phone: '', passport: '', address: '' });

  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingTrades, setLoadingTrades] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    let stopped = false;

    const loadRecords = async () => {
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

        if (!res.ok) throw new Error('Kabinet ma`lumotlarini olishda xatolik');

        const data = await res.json();
        if (stopped) return;

        const paymentRows = (data.payments || []).sort((a, b) => {
          const aMs = Date.parse(a.createdAt || 0) || 0;
          const bMs = Date.parse(b.createdAt || 0) || 0;
          return bMs - aMs;
        });

        const tradeRows = (data.trades || []).sort((a, b) => {
          const aMs = Date.parse(a.closedAt || a.createdAt || 0) || 0;
          const bMs = Date.parse(b.closedAt || b.createdAt || 0) || 0;
          return bMs - aMs;
        });

        setLicenses((data.licenses || []).sort((a, b) => {
          const aMs = a.issuedAt?.seconds ? a.issuedAt.seconds * 1000 : Date.parse(a.issuedAt || 0) || 0;
          const bMs = b.issuedAt?.seconds ? b.issuedAt.seconds * 1000 : Date.parse(b.issuedAt || 0) || 0;
          return bMs - aMs;
        }));
        setPayments(paymentRows);
        setTrades(tradeRows);
        setProfile(data.profile || { fullName: '', phone: '', passport: '', address: '' });
      } catch {
        if (!stopped) {
          setLicenses([]);
          setPayments([]);
          setTrades([]);
          setProfile({ fullName: '', phone: '', passport: '', address: '' });
        }
      } finally {
        if (!stopped) {
          setLoadingLicenses(false);
          setLoadingPayments(false);
          setLoadingTrades(false);
        }
      }
    };

    loadRecords();
    const timer = setInterval(loadRecords, 10000);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [user]);

  const stats = useMemo(() => {
    const activeLicenses = licenses.filter((l) => l.status === 'active').length;
    const totalLicenses = licenses.length;
    const paidPayments = payments.filter((p) => p.status === 'paid').length;

    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => Number(t.pnl || 0) > 0).length;
    const losingTrades = trades.filter((t) => Number(t.pnl || 0) < 0).length;
    const netProfit = trades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const symbolMap = {};
    trades.forEach((t) => {
      const sym = t.symbol || 'UNKNOWN';
      if (!symbolMap[sym]) symbolMap[sym] = { symbol: sym, trades: 0, wins: 0, losses: 0, pnl: 0 };
      symbolMap[sym].trades++;
      const pnl = Number(t.pnl || 0);
      symbolMap[sym].pnl += pnl;
      if (pnl > 0) symbolMap[sym].wins++;
      else if (pnl < 0) symbolMap[sym].losses++;
    });

    const symbolBreakdown = Object.values(symbolMap).sort((a, b) => b.trades - a.trades);

    return { activeLicenses, totalLicenses, paidPayments, totalTrades, winningTrades, losingTrades, netProfit, winRate, symbolBreakdown };
  }, [licenses, payments, trades]);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Nusxa olindi.');
    } catch {
      alert('Nusxa olish muvaffaqiyatsiz.');
    }
  };

  /* ── loading / auth gates ── */
  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-700">Yuklanmoqda...</div>;
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-slate-700">
        <div className="fath-shell rounded-2xl p-6 text-center">
          <p className="mb-4">Kabinetni ko&apos;rish uchun kirish kerak.</p>
          <Link href="/login" className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Kirish</Link>
        </div>
      </div>
    );
  }

  const isLoading = loadingLicenses || loadingPayments || loadingTrades;
  const activeLicense = licenses.find((l) => l.status === 'active');

  /* ═══════════════════════════════════════════ RENDER ════ */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <SiteHeader />

      {/* ── mobile top bar ── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={() => setSideOpen(!sideOpen)} className="rounded-lg p-2 hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="text-sm font-bold text-slate-800">FATH Kabinet</span>
          <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">
            {(profile.fullName || user.email || '?')[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── mobile overlay ── */}
      {sideOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setSideOpen(false)} />}

      <div className="lg:flex">
        {/* ═══════════ SIDEBAR ═══════════ */}
        <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-10 h-screen w-64 flex-shrink-0 bg-white border-r border-slate-200 transition-transform duration-200 ${sideOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex h-full flex-col">
            {/* user card */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {(profile.fullName || user.email || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{profile.fullName || 'Foydalanuvchi'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              {!!profile.phone && <p className="mt-2 text-[11px] text-slate-400">{profile.phone}</p>}
            </div>

            {/* nav */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSideOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${activeTab === item.id ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className={activeTab === item.id ? 'text-cyan-600' : 'text-slate-400'}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div className="pt-4 pb-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tezkor havolalar</p>
              </div>
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSideOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  <span className="text-slate-400">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* mini status at bottom */}
            <div className="border-t border-slate-100 p-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Litsenziya</span>
                {activeLicense ? (
                  <span className="font-bold text-emerald-600">Faol</span>
                ) : (
                  <span className="font-bold text-slate-400">Yo&apos;q</span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Savdolar</span>
                <span className="font-bold text-slate-700">{stats.totalTrades}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ═══════════ MAIN CONTENT ═══════════ */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* greeting */}
                <div>
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                    Xush kelibsiz{profile.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}!
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">FATH boshqaruv paneli</p>
                </div>

                {/* stat cards row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Faol litsenziya" value={stats.activeLicenses} color="cyan" loading={isLoading} />
                  <StatCard label="Jami savdolar" value={stats.totalTrades} color="slate" loading={isLoading} />
                  <StatCard label="Winrate" value={stats.totalTrades > 0 ? `${stats.winRate.toFixed(1)}%` : '-'} color="blue" loading={isLoading} />
                  <StatCard label="Sof P/L" value={stats.totalTrades > 0 ? stats.netProfit.toFixed(2) : '-'} color={stats.netProfit >= 0 ? 'emerald' : 'rose'} loading={isLoading} />
                </div>

                {/* active license card */}
                {activeLicense && (
                  <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-bold uppercase text-emerald-700">Faol litsenziya</span>
                        </div>
                        <p className="font-mono text-sm text-slate-700 break-all">{activeLicense.licenseKey}</p>
                      </div>
                      <button onClick={() => copyText(activeLicense.licenseKey || '')} className="flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition">
                        {icons.copy} Nusxalash
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
                      <div><span className="text-slate-400 block">Tarif</span>{activeLicense.planName || activeLicense.planId || '-'}</div>
                      <div><span className="text-slate-400 block">MT5 hisob</span>{activeLicense.accountId || '-'}</div>
                      <div><span className="text-slate-400 block">Muddati</span>{toDateLabel(activeLicense.expiresAt)}</div>
                      <div><span className="text-slate-400 block">Tekshiruvlar</span>{activeLicense.validationCount || 0}</div>
                    </div>
                  </div>
                )}

                {/* quick actions */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <QuickActionCard href="/robot-settings" icon={icons.settings} title="Sozlamalar" desc="Robot parametrlari" />
                  <QuickActionCard href="/robot-status" icon={icons.robot} title="Robot holati" desc="Jonli monitoring" />
                  <QuickActionCard href="/shop" icon={icons.shop} title="Tarif olish" desc="Yangi litsenziya" />
                </div>

                {/* last activity row */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* last payment */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Oxirgi to&apos;lov</p>
                    {payments[0] ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Order</span><span className="font-mono text-slate-800">{payments[0].orderId || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Holat</span><span className={badgeClass(payments[0].status || 'pending')}>{payments[0].status || 'pending'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Vaqt</span><span className="text-slate-700">{toDateLabel(payments[0].createdAt)}</span></div>
                      </div>
                    ) : <p className="text-sm text-slate-400">Hali to&apos;lov yo&apos;q</p>}
                  </div>

                  {/* trade summary */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Savdo xulosasi</p>
                    {stats.totalTrades > 0 ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Yutuq</span><span className="font-bold text-emerald-600">{stats.winningTrades}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Yutqazilgan</span><span className="font-bold text-rose-600">{stats.losingTrades}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Sof natija</span><span className={`font-bold ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${stats.netProfit.toFixed(2)}</span></div>
                        {/* mini winrate bar */}
                        <div className="pt-2">
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: `${stats.winRate}%` }} />
                          </div>
                          <p className="mt-1 text-[10px] text-slate-400 text-right">{stats.winRate.toFixed(1)}% winrate</p>
                        </div>
                      </div>
                    ) : <p className="text-sm text-slate-400">Savdo ma&apos;lumotlari yo&apos;q</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── LICENSES TAB ── */}
            {activeTab === 'licenses' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-slate-900">Litsenziyalar</h2>
                  <Link href="/shop" className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700 transition shadow-sm">+ Yangi tarif</Link>
                </div>

                {loadingLicenses ? (
                  <LoadingPlaceholder />
                ) : licenses.length === 0 ? (
                  <EmptyState message="Faol litsenziya topilmadi" action={{ href: '/shop', label: 'Tarif tanlash' }} />
                ) : (
                  <div className="space-y-4">
                    {licenses.map((license) => (
                      <article key={license.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-block w-2 h-2 rounded-full ${license.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                              <span className={badgeClass(license.status || 'inactive')}>{license.status || 'inactive'}</span>
                            </div>
                            <p className="font-mono text-xs text-slate-600 break-all mt-1">{license.licenseKey || '-'}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
                          <div><span className="text-slate-400 block">Muddati</span><span className="text-slate-700">{toDateLabel(license.expiresAt)}</span></div>
                          <div><span className="text-slate-400 block">Tarif</span><span className="text-slate-700">{license.planName || license.planId || '-'}</span></div>
                          <div><span className="text-slate-400 block">MT5 hisob</span><span className="text-slate-700">{license.accountId || '-'}</span></div>
                          <div><span className="text-slate-400 block">Tekshiruvlar</span><span className="text-slate-700">{license.validationCount || 0}</span></div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <ActionBtn icon={icons.copy} label="Kalit nusxalash" onClick={() => copyText(license.licenseKey || '')} />
                          <ActionBtn icon={icons.download} label="Guvohnoma" onClick={() => downloadCertificatePdf(license, toDateLabel)} />
                          <ActionBtn icon={icons.download} label="Shartnoma" onClick={() => downloadContractPdf(license, toDateLabel)} />
                          <Link href="/contract" className="flex items-center gap-1.5 rounded-lg border border-cyan-200 px-3 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 transition">
                            Ko&apos;rish
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PAYMENTS TAB ── */}
            {activeTab === 'payments' && (
              <div className="space-y-5">
                <h2 className="text-xl font-black text-slate-900">To&apos;lovlar tarixi</h2>

                {loadingPayments ? (
                  <LoadingPlaceholder />
                ) : payments.length === 0 ? (
                  <EmptyState message="To'lovlar topilmadi" />
                ) : (
                  <div className="space-y-3">
                    {payments.slice(0, 20).map((payment) => (
                      <article key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {icons.wallet}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{payment.planName || payment.planId || 'To\'lov'}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{payment.orderId || '-'}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={badgeClass(payment.status || 'pending')}>{payment.status || 'pending'}</span>
                            <p className="text-[10px] text-slate-400 mt-1">{toDateLabel(payment.createdAt)}</p>
                          </div>
                        </div>
                        {(!!payment.checkoutUrl && payment.status !== 'paid') && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <a href={payment.checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-700 transition">
                              To&apos;lovni davom ettirish →
                            </a>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ROBOT STATS TAB ── */}
            {activeTab === 'robot' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-slate-900">Savdo natijalari</h2>
                  <Link href="/statistics" className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition">Umumiy statistika →</Link>
                </div>

                {loadingTrades ? (
                  <LoadingPlaceholder />
                ) : trades.length === 0 ? (
                  <EmptyState message="Hali robot bitim natijalari kelmagan" />
                ) : (
                  <>
                    {/* trade metrics */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      <MiniMetric label="Jami" value={stats.totalTrades} />
                      <MiniMetric label="Yutuq" value={stats.winningTrades} color="emerald" />
                      <MiniMetric label="Yutqazish" value={stats.losingTrades} color="rose" />
                      <MiniMetric label="Winrate" value={`${stats.winRate.toFixed(1)}%`} />
                      <MiniMetric label="Sof P/L" value={stats.netProfit.toFixed(2)} color={stats.netProfit >= 0 ? 'emerald' : 'rose'} span />
                    </div>

                    {/* symbol breakdown */}
                    {stats.symbolBreakdown.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Juftliklar bo&apos;yicha</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50">
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Symbol</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Bitimlar</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Win</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Loss</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">P/L</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {stats.symbolBreakdown.map((row) => (
                                <tr key={row.symbol} className="hover:bg-slate-50 transition">
                                  <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{row.symbol}</td>
                                  <td className="px-4 py-2.5 text-right text-slate-600">{row.trades}</td>
                                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">{row.wins}</td>
                                  <td className="px-4 py-2.5 text-right font-semibold text-rose-600">{row.losses}</td>
                                  <td className={`px-4 py-2.5 text-right font-bold ${row.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{row.pnl.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* recent trades */}
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Oxirgi savdolar</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {trades.slice(0, 10).map((t, i) => {
                          const pnl = Number(t.pnl || 0);
                          return (
                            <div key={t.id || i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pnl > 0 ? 'bg-emerald-500' : pnl < 0 ? 'bg-rose-500' : 'bg-slate-300'}`} />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800">{t.symbol || 'UNKNOWN'}</p>
                                  <p className="text-[10px] text-slate-400">{toDateLabel(t.closedAt || t.createdAt)}</p>
                                </div>
                              </div>
                              <span className={`text-sm font-bold ${pnl > 0 ? 'text-emerald-600' : pnl < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

/* ═══════════ Sub-components ═══════════ */

function StatCard({ label, value, color = 'slate', loading }) {
  const colors = {
    cyan: 'border-cyan-200 bg-gradient-to-br from-cyan-50 to-white text-cyan-700',
    emerald: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-700',
    rose: 'border-rose-200 bg-gradient-to-br from-rose-50 to-white text-rose-700',
    blue: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white text-blue-700',
    slate: 'border-slate-200 bg-white text-slate-800',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color] || colors.slate}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      {loading ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-1 text-2xl font-black">{value}</p>
      )}
    </div>
  );
}

function MiniMetric({ label, value, color, span }) {
  const textColor = color === 'emerald' ? 'text-emerald-600' : color === 'rose' ? 'text-rose-600' : 'text-slate-800';
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 ${span ? 'col-span-2 sm:col-span-1' : ''}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-black ${textColor}`}>{value}</p>
    </div>
  );
}

function QuickActionCard({ href, icon, title, desc }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-cyan-300 hover:shadow-md">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800 group-hover:text-cyan-700 transition">{title}</p>
        <p className="text-[11px] text-slate-400">{desc}</p>
      </div>
    </Link>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition">
      {icon} {label}
    </button>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

function EmptyState({ message, action }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
      <p className="text-slate-500">{message}</p>
      {action && (
        <Link href={action.href} className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700 transition">
          {action.label}
        </Link>
      )}
    </div>
  );
}
