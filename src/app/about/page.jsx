'use client';

import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

const strategies = [
  {
    title: 'Gann Square of Nine metodologiyasi',
    body: "Strategiya W.D. Gann yondashuviga asoslanadi. Narx darajalari geometriya va matematik model orqali aniqlanadi.",
  },
  {
    title: 'M15 uchun optimallashtirilgan signal',
    body: "Robot M15 timeframe uchun sozlangan bo'lib, shovqinni kamaytirish va tezkor kirish nuqtalarini aniqlashga xizmat qiladi.",
  },
  {
    title: 'Recovery va risk boshqaruvi',
    body: "Recovery Mode, breakeven va lot nazorati orqali xavf boshqaruvi amalga oshiriladi. Har bir savdo intizomli qoidalarga tayangan holda yuritiladi.",
  },
  {
    title: 'Ko\'p instrument qo\'llab-quvvatlovi',
    body: "XAUUSD, BTCUSD, EURUSD, GBPUSD kabi instrumentlarda ishlaydi. Har bir chart uchun alohida Magic Number ishlatiladi.",
  },
];

const features = [
  { title: '24/7 savdo',            body: "To'xtovsiz avtomatik savdo. Siz uxlaganda ham robot ishlaydi." },
  { title: 'Ko\'p instrument rejimi',  body: 'Bir terminalda bir nechta chartda savdo yuritish mumkin. Har bir chart alohida boshqariladi.' },
  { title: 'Real vaqt tahlili',     body: "Joriy savdo natijalarini real vaqt rejimida kuzating." },
  { title: 'Moslashuvchan sozlamalar', body: "Xavf darajangizga mos sozlamalarni o'rnating." },
  { title: 'Backtesting vositasi',  body: "Tarixiy ma'lumotlarda strategiyani test qiling." },
  { title: 'Xabarnomalar',          body: "Muhim voqealar haqida elektron pochta orqali xabar olasiz." },
];

const stats = [
  { value: '87.3%', label: 'Yutuq foizi' },
  { value: '40% - 150%', label: 'Kutiladigan oylik diapazon' },
  { value: '1 : 3.2', label: 'Daromad / Xavf' },
  { value: '12.8%', label: 'Maks. drawdown' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="mb-10 border-b border-slate-800 pb-10">
          <span className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
            MetaTrader 5 · Expert Advisor
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">FATH Robot V1.6</h1>
          <p className="mt-3 text-base text-slate-400">
            Gann Square Trading System asosidagi professional MetaTrader 5 savdo roboti
          </p>
        </div>

        {/* About */}
        <section className="mb-10 rounded-lg border border-slate-800 bg-slate-900 p-7">
          <h2 className="mb-4 text-lg font-bold text-slate-100">FATH nima?</h2>
          <p className="leading-7 text-slate-400">
            FATH — MetaTrader 5 platformasi uchun mo'ljallangan professional savdo roboti bo'lib,
            M15 timeframe asosida Forex va kripto instrumentlarda avtomatik savdoni amalga oshiradi.
            Tajribasiz va professional savdogarlar uchun ham mos keladi.
            Robot bozorni tahlil qiladi, xavfni nazorat qiladi va eng qulay signallarni avtomatik bajaradi.
          </p>
          <p className="mt-3 leading-7 text-slate-400">
            Tavsiya etilgan minimal depozit 100 dollar bo'lib, amaliy savdoda 500 dollar va undan yuqori depozit tavsiya etiladi.
            Litsenziya token asosida faqat real hisob uchun ishlaydi.
          </p>
        </section>

        {/* Strategy */}
        <section className="mb-10">
          <h2 className="mb-5 text-lg font-bold text-slate-100">Savdo strategiyasi</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {strategies.map((s) => (
              <div key={s.title} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <div className="mb-2 h-0.5 w-8 rounded bg-amber-500" />
                <h3 className="mb-2 font-semibold text-slate-100">{s.title}</h3>
                <p className="text-sm leading-6 text-slate-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-10 rounded-lg border border-slate-800 bg-slate-900 p-7">
          <h2 className="mb-6 text-lg font-bold text-slate-100">Ish ko'rsatkichlari</h2>
          <div className="grid grid-cols-2 gap-px bg-slate-800 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-slate-900 px-5 py-6 text-center">
                <p className="text-2xl font-black text-amber-400">{s.value}</p>
                <p className="mt-1 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-600">* Ko'rsatkichlar oxirgi 6 oylik real savdo natijalari asosida</p>
        </section>

        {/* Features */}
        <section className="mb-10">
          <h2 className="mb-5 text-lg font-bold text-slate-100">Asosiy xususiyatlar</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-md border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1.5">{f.title}</p>
                <p className="text-sm text-slate-400">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
          <h2 className="text-lg font-bold text-slate-100 mb-2">Boshlashga tayyormisiz?</h2>
          <p className="text-sm text-slate-400 mb-6">
            Ko'plab savdogarlar FATH yordamida investitsiyalarini o'stirmoqda
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="rounded-md bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
              Litsenziya sotib olish
            </Link>
            <Link href="/guide-mt5" className="rounded-md border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors">
              O'rnatish qo'llanmasi
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
