'use client';

import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

const metrics = [
  { label: 'Yutuq foizi',    value: '87.3%',     sub: 'jami savdolardan' },
  { label: 'Profit Factor',  value: '3.21',      sub: 'daromad / zarar' },
  { label: 'Oylik daromad',  value: '+24.5%',    sub: "o'rtacha" },
  { label: 'Maks. drawdown', value: '12.8%',     sub: 'maksimal tushish' },
  { label: 'Jami savdolar',  value: '4 851',     sub: 'yanvar - iyun' },
  { label: "O'rtacha yutuq", value: '$156.4',    sub: 'har bir savdoda' },
  { label: "O'rtacha zarar", value: '$48.9',     sub: 'har bir savdoda' },
  { label: 'Jami foyda',     value: '$127 543',  sub: 'yarim yillik' },
];

const months = [
  { m: 'Yan',  v: 12.5 },
  { m: 'Fev',  v: 18.3 },
  { m: 'Mar',  v: 15.7 },
  { m: 'Apr',  v: 22.1 },
  { m: 'May',  v: 19.4 },
  { m: 'Iyn',  v: 24.5 },
];

const pairs = [
  { pair: 'EUR/USD', trades: 1250, win: 88.4, profit: 28540 },
  { pair: 'GBP/USD', trades: 980,  win: 85.2, profit: 22100 },
  { pair: 'USD/JPY', trades: 760,  win: 79.8, profit: 15600 },
  { pair: 'AUD/USD', trades: 540,  win: 92.1, profit: 18300 },
  { pair: 'NZD/USD', trades: 220,  win: 89.5, profit: 8950  },
  { pair: 'USD/CAD', trades: 180,  win: 81.2, profit: 5200  },
];

const maxV = Math.max(...months.map((m) => m.v));

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-slate-800 pb-10">
          <span className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Yanvar - Iyun - Real savdo natijalari
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">Savdo statistikasi</h1>
          <p className="mt-3 text-slate-400">Haqiqiy trading natijalari va samaradorlik ko'rsatkichlari</p>
        </div>
        <section className="mb-10 grid grid-cols-2 gap-px bg-slate-800 sm:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-slate-900 px-5 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{m.label}</p>
              <p className="mt-2 text-2xl font-black text-amber-400">{m.value}</p>
              <p className="mt-1 text-xs text-slate-600">{m.sub}</p>
            </div>
          ))}
        </section>
        <section className="mb-10 rounded-lg border border-slate-800 bg-slate-900 p-7">
          <h2 className="mb-6 text-base font-bold text-slate-100">Oylik daromad dinamikasi (%)</h2>
          <div className="flex items-end gap-3 h-40">
            {months.map((m) => (
              <div key={m.m} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-amber-400">+{m.v}%</span>
                <div className="w-full rounded-t bg-amber-600/80 hover:bg-amber-500 transition-colors" style={{ height: `${(m.v / maxV) * 100}%` }} />
                <span className="text-xs text-slate-500">{m.m}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-10 rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-slate-100">Eng yaxshi valyuta juftliklari</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Juftlik</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Savdolar</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Yutuq %</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Foyda</th>
                </tr>
              </thead>
              <tbody>
                {pairs.map((p, i) => (
                  <tr key={p.pair} className={`hover:bg-slate-800/40 transition-colors ${i < pairs.length - 1 ? 'border-b border-slate-800/50' : ''}`}>
                    <td className="px-6 py-3.5 font-semibold text-slate-100">{p.pair}</td>
                    <td className="px-6 py-3.5 text-slate-400">{p.trades.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-emerald-400">{p.win}%</td>
                    <td className="px-6 py-3.5 text-amber-400">+{p.profit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="text-xs text-slate-700 text-center">* Ko'rsatkichlar o'tgan davr natijalari asosida. Kelajakdagi daromad kafolatlanmaydi.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
