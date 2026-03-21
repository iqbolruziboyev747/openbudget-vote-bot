'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

const DEFAULT_GUIDE_VIDEO = '';

function toEmbedUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }

    const v = parsed.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;

    if (parsed.pathname.includes('/embed/')) return url;
    return '';
  } catch {
    return '';
  }
}

const steps = [
  {
    num: 1,
    title: "MetaTrader 5 o'rnatish",
    body: "MT5 ni rasmiy saytidan (metatrader5.com) yuklab oling va o'rnating. Windows, Mac yoki Linux uchun kerakli versiyani tanlang.",
  },
  {
    num: 2,
    title: 'Broker hisobi ochish',
    body: "Ishonchli Forex/kripto broker orqali hisob oching. FATH MetaTrader 5 qo'llab-quvvatlaydigan barcha brokerlar bilan ishlaydi. Demo yoki real hisob tanlang.",
  },
  {
    num: 3,
    title: 'FATH robotni yuklash',
    body: "Litsenziya sotib olgandan so'ng, FATH_1.6.ex5 faylini yuklab oling va MT5 ning MQL5\\Experts papkasiga ko'chiring.",
  },
  {
    num: 4,
    title: 'Terminal sozlamalari',
    body: "MetaTrader 5 ni oching → Tools → Options → Expert Advisors bo'limiga kiring → \"Allow automated trading\" katagini belgilang.",
  },
  {
    num: 5,
    title: 'FATH ni sozlash',
    body: "Grafik oynasini oching va FATH robotini ustiga tashlang. Sozlamalar oynasida xavf darajasi, valyuta juftliklari va strategiyani tanlang.",
  },
  {
    num: 6,
    title: 'Backtesting',
    body: "Robotni real savdoga qo'shishdan avval Strategy Tester (Ctrl+R) orqali tarixiy ma'lumotlarda sinab ko'ring.",
  },
  {
    num: 7,
    title: 'Real savdoni boshlash',
    body: "Kichik hisob bilan 1-2 hafta test o'tkazing, keyin to'liq tezlikda ishga tushiring. Har kuni natijalarni kuzating.",
  },
];

const faqs = [
  {
    q: "FATH qaysi brokerlar bilan ishlaydi?",
    a: "MetaTrader 5 qo'llab-quvvatlaydigan barcha brokerlar: Exness, OctaFX, RoboForex, IC Markets va boshqalar. Eng yaxshi natija uchun past spread va tez bajaruvchi broker tanlang.",
  },
  {
    q: "Demo hisob bilan sinash mumkinmi?",
    a: "Ha, albatta. Live savdoga o'tishdan avval kamida 1-2 hafta demo hisob bilan test qilishni tavsiya etamiz.",
  },
  {
    q: "Kompyuter 24/7 yoqiq turishi kerakmi?",
    a: "Ha. 24/7 savdo uchun kompyuter yoki VPS server yoqiq turishi zarur. Oyiga $3-10 narxdagi VPS xizmati qulay yechim.",
  },
  {
    q: "Boshlang'ich depozit qancha bo'lishi kerak?",
    a: "Minimal $100 bilan boshlash mumkin, ammo $500-1000 optimal hisoblanadi. Katta hisob — yaxshiroq risk boshqaruvi va ko'proq foyda imkoniyati.",
  },
];

const errors = [
  {
    title: '"Expert Advisor disabled"',
    fix: 'Tools → Options → Expert Advisors → "Allow automated trading" ni belgilang. Keyin F5 tugmasini bosing.',
  },
  {
    title: "FATH fayli topilmayapti",
    fix: "FATH_1.6.ex5 faylini ...\\MetaQuotes\\Terminal\\...\\MQL5\\Experts papkasiga ko'chiring va MT5 ni qayta ishga tushiring.",
  },
  {
    title: "Savdo ochmayapti",
    fix: "Broker ulanishini va hisob statusini tekshiring. Strategy Tester bilan sinab ko'ring. Xavf darajasini oshiring.",
  },
];

export default function MT5GuidePage() {
  const [guideVideoUrl, setGuideVideoUrl] = useState(DEFAULT_GUIDE_VIDEO);

  useEffect(() => {
    const loadGuideVideo = async () => {
      try {
        const res = await fetch('/api/public/site-profile');
        const data = await res.json();
        if (!res.ok) return;
        const raw = data?.profile?.guideVideoUrl;
        if (raw) setGuideVideoUrl(raw);
      } catch {
        // Keep default guide when profile endpoint is unavailable.
      }
    };

    loadGuideVideo();
  }, []);

  const embedUrl = toEmbedUrl(guideVideoUrl);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="mb-10 border-b border-slate-200 pb-10">
          <span className="inline-block rounded border border-amber-500/40 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
            Bosqichma-bosqich yo'riqnoma
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            MetaTrader 5 o'rnatish qo'llanmasi
          </h1>
          <p className="mt-3 text-slate-600">
            FATH robotini 30 daqiqada o'rnatib, savdoni boshlash uchun to'liq yo'riqnoma
          </p>
        </div>

        <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Video qo'llanma</h2>
          <p className="mb-4 text-sm text-slate-600">Agar yozma bosqichlar qiyin tuyulsa, quyidagi videodan bosqichma-bosqich ko'ring.</p>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {embedUrl ? (
              <iframe
                className="h-56 w-full sm:h-80"
                src={embedUrl}
                title="MT5 o'rnatish video qo'llanma"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-slate-600">
                Video havola topilmadi. Admin paneldan YouTube havolani kiriting.
              </div>
            )}
          </div>
        </section>

        <section className="mb-10 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="mb-3 text-lg font-bold text-emerald-800">Tez start cheklist</h2>
          <ul className="space-y-2 text-sm text-emerald-900">
            <li>1. MT5 o'rnatildi va akkauntga kirildi</li>
            <li>2. FATH_1.6.ex5 MQL5/Experts papkasiga joylandi</li>
            <li>3. AutoTrading yoqildi</li>
            <li>4. Litsenziya kaliti va MT5 hisob raqami to'g'ri kiritildi</li>
            <li>5. Demo testdan keyin real savdo boshlandi</li>
          </ul>
        </section>

        <section className="mb-10 rounded-xl border border-cyan-200 bg-cyan-50/60 p-6">
          <h2 className="text-lg font-bold text-cyan-900">Professional o'rnatish xizmati</h2>
          <p className="mt-2 text-sm text-cyan-900/80">
            Agar xohlasangiz, mutaxassis yordamida to'liq o'rnatish xizmatini tanlashingiz mumkin.
            Narxi: <span className="font-semibold">150 000 UZS</span>.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-cyan-900/80">
            <li>- Robot, terminal va asosiy parametrlar masofadan sozlanadi</li>
            <li>- Qulay vaqt bo'yicha bog'lanish tashkil qilinadi</li>
            <li>- Telefon va Telegram kontaktlaringiz orqali tezkor aloqaga chiqiladi</li>
          </ul>
          <div className="mt-4">
            <Link href="/shop" className="inline-block rounded-lg bg-cyan-700 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
              Xaridda xizmatni tanlash
            </Link>
          </div>
        </section>

        {/* Steps */}
        <section className="mb-12">
          <div className="space-y-3">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-black text-white">
                  {s.num}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Requirements */}
        <section className="mb-10 rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Tizim talablari</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600">Kompyuter</p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li>— Windows 7 yoki undan yuqori</li>
                <li>— Kamida 2 GB RAM</li>
                <li>— 500 MB bo'sh disk</li>
                <li>— Internet ulanishi (10 Mbps+)</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600">VPS server</p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li>— Linux yoki Windows VPS</li>
                <li>— Kamida 1 GB RAM</li>
                <li>— 99.9% uptime kafolati</li>
                <li>— 24/7 ulanish</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Ko'p so'raladigan savollar</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-lg border border-slate-200 bg-white p-5 group cursor-pointer shadow-sm">
                <summary className="font-medium text-slate-700 group-open:text-amber-700 transition-colors select-none">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-10">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Muammolarni hal qilish</h2>
          <div className="space-y-3">
            {errors.map((e) => (
              <div key={e.title} className="rounded-lg border border-red-200 bg-red-50 p-5">
                <p className="font-medium text-red-700 mb-1.5">{e.title}</p>
                <p className="text-sm text-slate-700">{e.fix}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Litsenziya sotib olishga tayyormisiz?</h2>
          <p className="text-sm text-slate-600 mb-6">
            Litsenziya olgan daqiqadan boshlab robot to'liq ishlashga tayyor
          </p>
          <Link href="/shop" className="inline-block rounded-md bg-amber-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
            Litsenziya sotib olish
          </Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
