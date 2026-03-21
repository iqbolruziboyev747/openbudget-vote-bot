'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import useAuthUser from '../../lib/useAuthUser';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { downloadCertificatePdf, downloadContractPdf } from '../../lib/pdfDocuments';

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

        setLicenses(data.licenses || []);
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

    return {
      activeLicenses,
      totalLicenses,
      paidPayments,
      totalTrades,
      winningTrades,
      losingTrades,
      netProfit,
      winRate,
      symbolBreakdown,
    };
  }, [licenses, payments, trades]);



  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Nusxa olindi.');
    } catch {
      alert('Nusxa olish muvaffaqiyatsiz.');
    }
  };

  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-700">Yuklanmoqda...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-slate-700">
        <div className="fath-shell rounded-2xl p-6 text-center">
          <p className="mb-4">Kabinetni ko'rish uchun kirish kerak.</p>
          <Link href="/login" className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Kirish</Link>
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
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Shaxsiy kabinet</h1>
              <p className="mt-1 text-sm text-slate-600">{user.email}</p>
              {!!profile.fullName && <p className="mt-1 text-sm font-semibold text-slate-800">{profile.fullName}</p>}
              {!!profile.phone && <p className="text-xs text-slate-500">Telefon: {profile.phone}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/robot-status" className="rounded-lg border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100">Robot holati</Link>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-x-auto">
          <div className="flex min-w-max gap-2 pb-1">
          {[
            { id: 'overview', label: 'Umumiy' },
            { id: 'payments', label: 'To lovlar' },
            { id: 'licenses', label: 'Litsenziyalar' },
            { id: 'robot', label: 'Robot statistika' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:text-cyan-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </section>

        {activeTab === 'overview' && (
          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="fath-shell rounded-2xl p-5">
              <p className="text-xs text-slate-500">Faol litsenziyalar</p>
              <p className="mt-2 text-3xl font-black text-cyan-700">{stats.activeLicenses}</p>
            </div>
            <div className="fath-shell rounded-2xl p-5">
              <p className="text-xs text-slate-500">Jami litsenziyalar</p>
              <p className="mt-2 text-3xl font-black text-cyan-700">{stats.totalLicenses}</p>
            </div>
            <div className="fath-shell rounded-2xl p-5">
              <p className="text-xs text-slate-500">Tasdiqlangan to lovlar</p>
              <p className="mt-2 text-3xl font-black text-cyan-700">{stats.paidPayments}</p>
            </div>
            <div className="fath-shell rounded-2xl p-5">
              <p className="text-xs text-slate-500">Sof P/L</p>
              <p className={`mt-2 text-3xl font-black ${stats.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {stats.netProfit.toFixed(2)}
              </p>
            </div>

            <div className="fath-shell rounded-2xl p-5 md:col-span-2">
              <p className="text-sm font-semibold text-slate-800">Oxirgi to lov</p>
              {payments[0] ? (
                <div className="mt-2 text-sm text-slate-600">
                  <p>Order: {payments[0].orderId || '-'}</p>
                  <p>Holat: {payments[0].status || '-'}</p>
                  <p>Vaqt: {toDateLabel(payments[0].createdAt)}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Ma lumot yo q.</p>
              )}
            </div>

            <div className="fath-shell rounded-2xl p-5 md:col-span-2">
              <p className="text-sm font-semibold text-slate-800">Oxirgi litsenziya</p>
              {licenses[0] ? (
                <div className="mt-2 text-sm text-slate-600">
                  <p>Kalit: {licenses[0].licenseKey || '-'}</p>
                  <p>Muddat: {toDateLabel(licenses[0].expiresAt)}</p>
                  <p>MT5 hisob: {licenses[0].accountId || '-'}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Ma lumot yo q.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'payments' && (
          <section className="fath-shell rounded-3xl p-6 mt-6">
            <h2 className="text-xl font-black text-slate-900">To lovlar</h2>
            {loadingPayments ? (
              <p className="mt-4 text-slate-500">Yuklanmoqda...</p>
            ) : payments.length === 0 ? (
              <p className="mt-4 text-slate-600">To lovlar topilmadi.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {payments.slice(0, 12).map((payment) => (
                  <article key={payment.id} className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Order ID</p>
                        <p className="font-mono text-sm">{payment.orderId || '-'}</p>
                      </div>
                      <span className={badgeClass(payment.status || 'pending')}>{payment.status || 'pending'}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Tarif: {payment.planName || payment.planId || '-'}</p>
                    <p className="text-sm text-slate-600">Vaqt: {toDateLabel(payment.createdAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!!payment.checkoutUrl && payment.status !== 'paid' && (
                        <a href={payment.checkoutUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100">
                          To lovni davom ettirish
                        </a>
                      )}
                      {!!payment.orderId && (
                        <button onClick={() => copyText(payment.orderId)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">
                          Order ID nusxalash
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'licenses' && (
          <section className="fath-shell rounded-3xl p-6 mt-6">
            <h2 className="text-xl font-black text-slate-900">Litsenziyalar</h2>
            {loadingLicenses ? (
              <p className="mt-4 text-slate-500">Yuklanmoqda...</p>
            ) : licenses.length === 0 ? (
              <div className="mt-4">
                <p className="mb-4 text-slate-600">Faol litsenziya topilmadi.</p>
                <Link href="/shop" className="rounded-lg bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700">Tarif tanlash</Link>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {licenses.map((license) => (
                  <article key={license.id} className="rounded-xl border border-cyan-100 bg-white p-4">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Litsenziya kaliti</p>
                        <p className="font-mono text-sm break-all">{license.licenseKey || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Status</p>
                        <span className={badgeClass(license.status || 'inactive')}>{license.status || 'inactive'}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <p>Muddat: {toDateLabel(license.expiresAt)}</p>
                      <p>Tarif: {license.planName || license.planId || '-'}</p>
                      <p>MT5 hisob: {license.accountId || '-'}</p>
                      <p>Tekshiruvlar soni: {license.validationCount || 0}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => copyText(license.licenseKey || '')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">
                        Kalitni nusxalash
                      </button>
                      <Link href="/contract" className="rounded-lg border border-cyan-200 px-3 py-2 text-sm text-cyan-700 hover:bg-cyan-100">
                        Guvohnomani ko rish
                      </Link>
                      <button onClick={() => downloadCertificatePdf(license, toDateLabel)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">
                        Guvohnoma yuklab olish
                      </button>
                      <button onClick={() => downloadContractPdf(license, toDateLabel)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">
                        Shartnoma yuklab olish
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'robot' && (
          <section className="fath-shell rounded-3xl p-6 mt-6">
            <h2 className="text-xl font-black text-slate-900">Robot statistikasi</h2>
            {loadingTrades ? (
              <p className="mt-4 text-slate-500">Yuklanmoqda...</p>
            ) : trades.length === 0 ? (
              <p className="mt-4 text-slate-600">Hali robot bitim natijalari kelmagan.</p>
            ) : (
              <>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/30 p-4">
                    <p className="text-xs text-slate-500">Jami bitim</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{stats.totalTrades}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                    <p className="text-xs text-slate-500">Yutuq</p>
                    <p className="mt-1 text-2xl font-black text-emerald-700">{stats.winningTrades}</p>
                  </div>
                  <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
                    <p className="text-xs text-slate-500">Yutqazilgan</p>
                    <p className="mt-1 text-2xl font-black text-rose-700">{stats.losingTrades}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Winrate</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{stats.winRate.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Sof natija (P/L)</p>
                  <p className={`mt-1 text-2xl font-black ${stats.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{stats.netProfit.toFixed(2)}</p>
                </div>

                {stats.symbolBreakdown.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-cyan-100">
                    <table className="w-full text-sm">
                      <thead className="bg-cyan-50/60">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Symbol</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Bitimlar</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Win</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Loss</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">P/L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-50">
                        {stats.symbolBreakdown.map((row) => (
                          <tr key={row.symbol} className="bg-white">
                            <td className="px-3 py-2 font-mono font-semibold text-slate-900">{row.symbol}</td>
                            <td className="px-3 py-2 text-right text-slate-700">{row.trades}</td>
                            <td className="px-3 py-2 text-right text-emerald-700">{row.wins}</td>
                            <td className="px-3 py-2 text-right text-rose-700">{row.losses}</td>
                            <td className={`px-3 py-2 text-right font-semibold ${row.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{row.pnl.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
