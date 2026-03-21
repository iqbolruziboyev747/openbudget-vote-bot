'use client';

import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const credibility = [
  { title: 'Algo intizomi', desc: 'Robot hissiyotga berilmaydi: qoidaga asoslangan kirish, chiqish va xavf nazorati.' },
  { title: 'Hisobga biriktirilgan kalit', desc: 'Litsenziya bitta MT5 accountga boglanadi, noqonuniy ulanishlar avtomatik bloklanadi.' },
  { title: 'Kabinet nazorati', desc: 'Litsenziya, tolov, versiya va faollik holatini bitta paneldan korasiz.' },
];

const metrics = [
  { label: 'Ishlash rejimi', value: '24/7', note: 'bozor monitoringi' },
  { label: 'Ornatish vaqti', value: '15-20 min', note: 'qollanma asosida' },
  { label: 'Aktivatsiya', value: '< 2 min', note: 'tolovdan song' },
  { label: 'Qo llab-quvvatlash', value: 'Telegram', note: 'tezkor javob' },
];

const objections = [
  {
    q: 'Robotni ornatish qiyinmi?',
    a: 'Yoq. Video va bosqichma-bosqich qollanma bilan odatda 15-20 daqiqada ishga tushiriladi.',
  },
  {
    q: 'Litsenziya qanday ishlaydi?',
    a: 'Tolovdan keyin kalit beriladi va u sizning MT5 account ID bilan biriktiriladi.',
  },
  {
    q: 'Agar yordam kerak bolsa-chi?',
    a: 'Professional ornatish xizmati va Telegram orqali texnik yordam mavjud.',
  },
];

const steps = [
  { n: '1', t: 'Tarifni tanlang', d: 'Sizga mos davrni tanlang va buyurtmani boshlang.' },
  { n: '2', t: 'MT5 accountni kiriting', d: 'Hisob raqami asosida litsenziya xavfsiz biriktiriladi.' },
  { n: '3', t: 'Savdoni boshlang', d: 'Robotni ishga tushiring va natijani kabinetda kuzating.' },
];

export default function Home() {
  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-cyan-100 fath-hero-glow">
        <div className="pointer-events-none absolute inset-0 fath-grid-bg opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="fath-fade-up">
              <span className="inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                MT5 uchun premium savdo roboti
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Birinchi savdodan oldin
                <span className="text-cyan-700"> tizim </span>
                quring, keyin daromadni oshiring.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700">
                FATH sizga tartibsiz savdoni emas, balki qoidaga asoslangan avtomatlashtirilgan yondashuvni beradi.
                Tez ornatish, aniq litsenziya nazorati va real kabinet kuzatuvi bilan siz bugun boshlaysiz.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="rounded-xl bg-cyan-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-700"
                >
                  Tarif tanlash va sotib olish
                </Link>
                <Link
                  href="/statistics"
                  className="rounded-xl border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                >
                  Natijalarni korish
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
                <span>Tarifni istalgan vaqtda yangilash</span>
                <span>Hisobga boglangan xavfsiz kalit</span>
                <span>Yordam: Telegram orqali</span>
              </div>
            </div>

            <div className="fath-shell fath-fade-up fath-delay-1 rounded-3xl p-6 sm:p-7">
              <p className="text-sm font-semibold tracking-wide text-slate-800">Nega mijozlar FATH ni tanlaydi?</p>
              <div className="mt-4 space-y-3">
                {credibility.map((item) => (
                  <div key={item.title} className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Tezkor start</p>
                <p className="mt-1 text-sm text-emerald-900">Tolovdan song bir necha daqiqada litsenziya faol holatga otadi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <article key={m.label} className="fath-shell fath-fade-up fath-delay-2 rounded-2xl p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">{m.label}</p>
              <p className="mt-2 text-3xl font-black text-cyan-700">{m.value}</p>
              <p className="mt-1 text-xs text-slate-500">{m.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-cyan-100 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900">Xarid yo li: 3 qadam</h2>
          <p className="mt-2 text-sm text-slate-600">Murakkab jarayon yoq. Quyidagi ketma-ketlik bilan tez boshlaysiz.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <article key={s.n} className="fath-shell fath-fade-up fath-delay-3 rounded-2xl p-6">
                <p className="text-xs font-bold tracking-wider text-cyan-700">QADAM {s.n}</p>
                <h3 className="mt-2 text-lg font-black text-slate-900">{s.t}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {objections.map((item) => (
            <article key={item.q} className="fath-shell rounded-2xl p-6">
              <h3 className="text-base font-black text-slate-900">{item.q}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="fath-shell rounded-3xl border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 px-6 py-10 text-center sm:px-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">Asosiy savol: bugun boshlaysizmi, yoqmi?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
            FATH bilan savdo intizomini tizimga topshiring. Litsenziyani oling, accountni biriktiring, robotni ishga tushiring.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-xl bg-cyan-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-700"
            >
              Hozir sotib olish
            </Link>
            <Link
              href="/guide-mt5"
              className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              Ornatish qollanmasi
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">Tugmani bosishdan oldin tariflarni ko rib chiqishingiz mumkin.</p>
          <div className="mt-3">
            <Link href="/shop" className="text-sm font-semibold text-cyan-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-800">
              Tariflarni ochish
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
