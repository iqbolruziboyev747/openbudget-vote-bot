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

const allSteps = [
  {
    id: 1,
    title: 'Litsenziya sotib olish',
    icon: '🛒',
    summary: "Tariflar sahifasidan o'zingizga mos tarifni tanlang va to'lovni amalga oshiring.",
    details: [
      {
        heading: "Tarif tanlash",
        text: "Saytdagi Tariflar sahifasiga o'ting. 1 oy, 3 oy, 6 oy yoki 12 oylik tariflardan birini tanlang. Uzoqroq muddat — arzonroq narx.",
      },
      {
        heading: "MT5 hisob raqamini kiriting",
        text: "To'lov sahifasida MetaTrader 5 dagi real hisob raqamingizni kiriting. Litsenziya shu hisobga biriktiriladi. Raqamni noto'g'ri kiritib bo'lmaydi — diqqat bilan tekshiring!",
        warning: "Hisob raqami noto'g'ri kiritilsa, litsenziya ishlamaydi. Brokeringiz bergan MT5 hisob raqamini aynan shu yerga yozing.",
      },
      {
        heading: "To'lov qilish",
        text: "Payme orqali qulay usulda to'lang. To'lov tasdiqlangach, litsenziya 1-3 ish kuni ichida faollashtiriladi.",
      },
      {
        heading: "Litsenziya kalitini olish",
        text: "Litsenziya faollashtirilgach, shaxsiy kabinet (Dashboard) da litsenziya kaliti paydo bo'ladi. Bu kalitni robot sozlamalariga kiritasiz.",
      },
    ],
    link: { href: '/shop', label: "Tariflarni ko'rish →" },
  },
  {
    id: 2,
    title: "MetaTrader 5 o'rnatish",
    icon: '💻',
    summary: "Agar kompyuteringizda MT5 o'rnatilmagan bo'lsa, brokeringiz yoki rasmiy saytdan yuklab o'rnating.",
    details: [
      {
        heading: "MT5 ni yuklab olish",
        text: "Brokeringizning rasmiy saytidan MetaTrader 5 ni yuklab oling. Ko'pchilik brokerlar (Exness, RoboForex, IC Markets, OctaFX va boshqalar) o'z saytlarida MT5 yuklab olish tugmasini taqdim etadi.",
      },
      {
        heading: "O'rnatish",
        text: "Yuklab olingan faylni ishga tushiring va ko'rsatmalarga amal qiling. O'rnatish 1-2 daqiqa davom etadi. O'rnatish tugagach, MT5 avtomatik ochiladi.",
      },
      {
        heading: "Hisobga kirish",
        text: "MT5 ochilganda, brokeringiz bergan login va parolni kiriting. File → Login to Trade Account tugmasidan foydalaning. Server ro'yxatidan brokeringiz serverini tanlang.",
        tip: "Demo hisob ochib sinash uchun — File → Open an Account → demo tanlang.",
      },
    ],
  },
  {
    id: 3,
    title: 'Robot faylini yuklash',
    icon: '📥',
    summary: "Eng so'nggi FATH robot versiyasini saytdan yuklab oling.",
    details: [
      {
        heading: "Versiyalar sahifasiga o'tish",
        text: "Shaxsiy kabinetga (Dashboard) kiring. U yerda \"Versiyalar\" bo'limi mavjud yoki saytdagi Versiyalar sahifasiga o'ting.",
      },
      {
        heading: "Eng so'nggi versiyani yuklash",
        text: "Eng so'nggi FATH versiyasini (.ex5 fayl) \"Yuklash\" tugmasi orqali kompyuteringizga yuklab oling. Fayl nomi masalan: FATH_1.6.ex5",
      },
    ],
    link: { href: '/versions', label: "Versiyalar sahifasi →" },
  },
  {
    id: 4,
    title: "Robotni MT5 ga joylash",
    icon: '📂',
    summary: "Yuklab olingan robot faylini MT5 ning Experts papkasiga ko'chiring.",
    details: [
      {
        heading: "Experts papkasini ochish",
        text: "MetaTrader 5 ni oching. Yuqoridagi menyudan: File → Open Data Folder bosing. Ochilgan papkada MQL5 → Experts papkasiga kiring.",
        tip: "Yo'l odatda: C:\\Users\\[Ism]\\AppData\\Roaming\\MetaQuotes\\Terminal\\[ID]\\MQL5\\Experts",
      },
      {
        heading: "Robot faylini ko'chirish",
        text: "Yuklab olingan FATH_1.6.ex5 faylini Experts papkasiga ko'chiring yoki tortib tashlang (drag & drop).",
      },
      {
        heading: "MT5 ni yangilash",
        text: "Robot faylini joylaganingizdan so'ng, MT5 da chap tomondagi Navigator panelida sichqoncha o'ng tugmasi bilan Expert Advisors ustiga bosing va \"Refresh\" tanlang. FATH_1.6 ro'yxatda paydo bo'ladi.",
        tip: "Agar ko'rinmasa, MT5 ni yopib qaytadan oching.",
      },
    ],
  },
  {
    id: 5,
    title: "AutoTrading va WebRequest sozlash",
    icon: '⚡',
    summary: "MT5 da avtomatik savdoni va internet ulanishini ruxsat bering — bu robotning ishlashi uchun majburiy.",
    details: [
      {
        heading: "AutoTrading yoqish",
        text: "MT5 ning yuqori toolbaridagi \"AutoTrading\" tugmasini bosing. Tugma yashil rangda bo'lishi kerak. Qizil bo'lsa — o'chirilgan, robot ishlamaydi.",
        warning: "Bu tugma qizil bo'lsa, robot hech qanday buyruq bera olmaydi!",
      },
      {
        heading: "Expert Advisors sozlamalariga kirish",
        text: "Menyudan Tools → Options → Expert Advisors bo'limiga kiring. Bu yerda avtomatik savdo va internet ulanishi ruxsatlari bor.",
      },
      {
        heading: "Kerakli belgilar",
        checklist: [
          "✅ Allow automated trading — avtomatik savdoga ruxsat",
          "✅ Allow DLL imports — qo'shimcha kutubxonalarga ruxsat",
        ],
      },
      {
        heading: "⚠️ WebRequest sozlash (JUDA MUHIM!)",
        text: "Robot serverga ulanib litsenziyani tekshiradi va savdo natijalarini yuboradi. Buning uchun WebRequest sozlanishi SHART. Aks holda robot ishga tushmaydi!",
        warning: "WebRequest sozlanmasa, robot litsenziyani tekshira olmaydi va \"License check failed\" yoki \"WebRequest error\" xabarini beradi. Bu qadamni albatta bajaring!",
      },
      {
        heading: "WebRequest ni sozlash bosqichlari",
        text: "1) Tools → Options → Expert Advisors bo'limiga kiring.\n2) \"Allow WebRequest for listed URL\" katagini belgilang (✅ qo'ying).\n3) Pastdagi maydonga quyidagi URL ni qo'shing:",
      },
      {
        heading: "Qo'shilishi kerak bo'lgan URL",
        text: "Robot sozlamalaridagi SiteApiBaseUrl maydonida ko'rsatilgan URL ni aynan shu holatda ko'chiring. URL odatda robot Inputs oynasida ko'rinadi. Masalan: https://fathrobot-5c48d.web.app",
        tip: "Agar SiteApiFallbackUrl ham bo'lsa (zaxira URL), uni ham alohida qator sifatida qo'shing. Har bir URL alohida qatorda bo'lishi kerak.",
      },
      {
        heading: "URL qo'shish usuli",
        checklist: [
          "1. Tools → Options → Expert Advisors oching",
          "2. \"Allow WebRequest for listed URL\" belgisini qo'ying",
          "3. URL ro'yxatida bo'sh joyga ikki marta bosing",
          "4. SiteApiBaseUrl dagi URL ni joylang (masalan: https://fathrobot-5c48d.web.app)",
          "5. Yana bo'sh joyga bosib, SiteApiFallbackUrl ni ham qo'shing (agar bor bo'lsa)",
          "6. OK tugmasini bosing",
        ],
      },
      {
        heading: "Tekshirish",
        text: "WebRequest to'g'ri sozlanganini tekshirish uchun robotni grafik ustiga qo'ying va Experts logida \"License valid\" xabarini kuting. Agar \"WebRequest error\" chiqsa — URL to'g'ri kiritilganini qayta tekshiring.",
        warning: "URL boshida va oxirida bo'sh joy (probel) bo'lmasligi kerak. URL aniq bir xil bo'lishi shart — bitta harf farq qilsa ham ishlamaydi.",
      },
    ],
  },
  {
    id: 6,
    title: "Robotni grafik ustiga qo'yish",
    icon: '📊',
    summary: "Valyuta juftligini ochib, FATH robotini grafik ustiga tashlang.",
    details: [
      {
        heading: "Grafik ochish",
        text: "MT5 da savdo qilinadigan valyuta juftligini yoki instrumentni oching. Masalan, XAUUSD (oltin). Chap tomondagi Market Watch dan ikki marta bosing yoki chartga sudrab tashlang.",
        tip: "Robot XAUUSD (oltin), valyuta juftliklari va boshqa instrumentlarda ishlaydi. Asosiy instrument: XAUUSD.",
      },
      {
        heading: "Robotni grafik ustiga qo'yish",
        text: "Navigator panelidan (Ctrl+N) Expert Advisors → FATH_1.6 ni toping. Uni ochiq grafik ustiga ikki marta bosing yoki tortib tashlang. Sozlamalar oynasi ochiladi.",
      },
    ],
  },
  {
    id: 7,
    title: "Litsenziya va sozlamalar",
    icon: '🔑',
    summary: "Robot sozlamalarida litsenziya kaliti va boshqa parametrlarni kiriting.",
    details: [
      {
        heading: "Inputs oynasi",
        text: "Robotni grafik ustiga qo'yganingizda Inputs (Kiritish) oynasi ochiladi. Agar yopilgan bo'lsa — chartdagi robotga sichqoncha o'ng tugma → Properties → Inputs.",
      },
      {
        heading: "SiteLicenseKey (Litsenziya kaliti)",
        text: "Dashboard dagi litsenziya kalitingizni nusxalab, SiteLicenseKey maydoniga joylang. Bu kalit sizning litsenziyangizni tekshirish uchun ishlatiladi.",
        warning: "Kalitni noto'g'ri kiritib litsenziya ishlamasa, Dashboard dan tekshirib qayta kiriting.",
      },
      {
        heading: "Boshqa sozlamalar",
        text: "Risk darajasi (RiskPercent), lot hajmi va boshqa parametrlarni o'zingizning savdo strategiyangizga moslab sozlang. Boshlang'ichlar uchun standart sozlamalarni o'zgartirmaslik tavsiya etiladi.",
        tip: "Dastlab standart sozlamalar bilan ishlang. Tajriba ortgach, parametrlarni o'zgartiring.",
      },
      {
        heading: "📁 Tayyor .set fayl bilan sozlash (tavsiya!)",
        text: "Robot sozlamalarini qo'lda kiritish o'rniga, saytdagi \"Sozlamalar\" sahifasidan tayyor .set faylni yuklab oling. Buning uchun: 1) Saytda \"Sozlamalar\" sahifasiga kiring. 2) Slayderlar yordamida o'z strategiyangizni tanlang. 3) \"Sozlamani yuklash (.set)\" tugmasini bosing. 4) MT5 da robot Properties → Inputs oynasida pastdagi \"Load\" tugmasini bosing va yuklab olingan .set faylni tanlang.",
        tip: "Tayyor .set fayl barcha sozlamalarni avtomatik o'rnatadi — faqat litsenziya kalitini qo'lda kiritish kerak.",
      },
    ],
    link: { href: '/robot-settings', label: "Sozlamalar sahifasi →" },
  },
  {
    id: 8,
    title: "Ishga tushirish va tekshirish",
    icon: '🚀',
    summary: "Robot ishlayotganini tekshiring va loglarni kuzating.",
    details: [
      {
        heading: "Robot statusini tekshirish",
        text: "Grafik o'ng yuqori burchagida robotning nomi va kulgimsirab turgan yuz (😊) ko'rinishi kerak. Agar xomushr (😐) yoki qizil yuz ko'rinsa — sozlamalarni tekshiring.",
      },
      {
        heading: "Journal loglarini ko'rish",
        text: "MT5 ning pastki qismidagi \"Experts\" tabini bosing. Bu yerda robot yuborgan xabarlar ko'rinadi. \"License valid\", \"FATH initialized\" kabi muvaffaqiyat xabarlari bo'lishi kerak.",
        warning: "\"License invalid\" yoki \"License expired\" xabari chiqsa, litsenziya kaliti yoki hisob raqamini tekshiring.",
      },
      {
        heading: "Birinchi savdo",
        text: "Robot bozor sharoitiga qarab o'zi savdo ochadi. Sabr bilan kuting — robot signalni kutmoqda. Trade tabida ochilgan pozitsiyalarni kuzatishingiz mumkin.",
      },
    ],
  },
];

const tips = [
  {
    icon: '🖥️',
    title: "VPS server tavsiya etiladi",
    text: "Robot 24/7 ishlashi uchun kompyuter doimo yoqiq turishi kerak. VPS server (oyiga $3-10) eng qulay yechim — internet uzilishi va elektr uzilishidan himoyalaydi.",
  },
  {
    icon: '📊',
    title: "Avval demo hisobda sinang",
    text: "Real pulni xavf ostiga qo'yishdan oldin, kamida 1-2 hafta demo hisobda sinab ko'ring. Demo hisobda haqiqiy bozor sharoitlarida robotning ishlashini kuzating.",
  },
  {
    icon: '💰',
    title: "Risk boshqarish",
    text: "Faqat yo'qotishga tayyor bo'lgan mablag' bilan savdo qiling. Boshlang'ich depozit kamida $100, optimal $500-1000.",
  },
];

const troubleshooting = [
  {
    problem: "\"Expert Advisor disabled\" xabari chiqyapti",
    solution: "AutoTrading tugmasi o'chirilgan. Yuqori toolbardagi AutoTrading tugmasini bosing (yashil bo'lishi kerak). Keyin Tools → Options → Expert Advisors → Allow automated trading belgilang.",
  },
  {
    problem: "Robot Navigator da ko'rinmayapti",
    solution: "FATH_1.6.ex5 faylini to'g'ri papkaga (MQL5/Experts) ko'chirganingizni tekshiring. Navigator da Expert Advisors ustiga o'ng tugma → Refresh bosing. Yoki MT5 ni qayta ishga tushiring.",
  },
  {
    problem: "\"License invalid\" xabari",
    solution: "1) Litsenziya kalitini Dashboard dan nusxalab, robot inputlariga qayta joylang. 2) MT5 hisob raqamingiz litsenziya bilan bir xil ekanini tekshiring. 3) Litsenziya muddati tugagan bo'lishi mumkin.",
  },
  {
    problem: "\"WebRequest error\" yoki \"License check failed\"",
    solution: "WebRequest sozlanmagan. Tools → Options → Expert Advisors → \"Allow WebRequest for listed URL\" belgilang va SiteApiBaseUrl dagi URL ni ro'yxatga qo'shing. URL to'g'ri yozilganini tekshiring — boshida/oxirida probel bo'lmasin.",
  },
  {
    problem: "Robot savdo ochmayapti",
    solution: "Robot signalni kutmoqda — bu normal holat. Bozor sharoiti mos kelganida savdo ochiladi. Agar uzoq vaqt ochilmasa: 1) Internet ulanishini tekshiring, 2) Brokerda savdo vaqtini tekshiring, 3) Experts loglarini o'qing.",
  },
  {
    problem: "Chart da robot yuz ko'rsatmayapti",
    solution: "Robotni qayta grafik ustiga qo'ying: Navigator → FATH_1.6 ni grafik ustiga ikki marta bosing. Properties → Common tabida \"Allow Algo Trading\" belgilang.",
  },
];

function StepCard({ step, isOpen, onToggle }) {
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${isOpen ? 'border-amber-400 bg-white shadow-lg shadow-amber-100/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-colors ${isOpen ? 'bg-amber-100' : 'bg-slate-100'}`}>
          {step.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isOpen ? 'text-amber-600' : 'text-slate-400'}`}>
              Qadam {step.id}
            </span>
          </div>
          <h3 className="mt-0.5 text-lg font-bold text-slate-900">{step.title}</h3>
          <p className="mt-1 text-sm text-slate-500 line-clamp-1">{step.summary}</p>
        </div>
        <svg className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          <p className="mb-4 text-sm leading-relaxed text-slate-600">{step.summary}</p>

          <div className="space-y-4">
            {step.details.map((d, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-800">{d.heading}</h4>
                {d.text && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{d.text}</p>}

                {d.checklist && (
                  <ul className="mt-2 space-y-1.5">
                    {d.checklist.map((item, j) => (
                      <li key={j} className="text-sm text-slate-700">{item}</li>
                    ))}
                  </ul>
                )}

                {d.warning && (
                  <div className="mt-2 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <span className="shrink-0 text-amber-500">⚠️</span>
                    <p className="text-xs leading-relaxed text-amber-800">{d.warning}</p>
                  </div>
                )}

                {d.tip && (
                  <div className="mt-2 flex gap-2 rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                    <span className="shrink-0 text-cyan-500">💡</span>
                    <p className="text-xs leading-relaxed text-cyan-800">{d.tip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {step.link && (
            <div className="mt-4">
              <Link href={step.link.href} className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800">
                {step.link.label}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  const [guideVideoUrl, setGuideVideoUrl] = useState(DEFAULT_GUIDE_VIDEO);
  const [openStep, setOpenStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const [partnerBrokers, setPartnerBrokers] = useState([]);

  useEffect(() => {
    fetch('/api/public/site-profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.profile?.guideVideoUrl) setGuideVideoUrl(data.profile.guideVideoUrl);
        if (data?.profile?.partnerBrokers?.length) setPartnerBrokers(data.profile.partnerBrokers);
      })
      .catch(() => {});
  }, []);

  const toggleStep = (id) => {
    setOpenStep(openStep === id ? null : id);
  };

  const markComplete = (id) => {
    if (!completedSteps.includes(id)) {
      setCompletedSteps((prev) => [...prev, id]);
    }
    if (id < allSteps.length) {
      setOpenStep(id + 1);
    }
  };

  const embedUrl = toEmbedUrl(guideVideoUrl);
  const progress = Math.round((completedSteps.length / allSteps.length) * 100);

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
            Robotni o'rnatish
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Litsenziya sotib olishdan boshlab, robotni ishga tushirishgacha — hamma narsa qadamba-qadam. 
            Birinchi marta foydalanayotgan bo'lsangiz ham osongina o'rnatasiz.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Jarayon</span>
            <span className="text-sm font-bold text-amber-600">{completedSteps.length}/{allSteps.length} qadam</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {completedSteps.length === allSteps.length && (
            <p className="mt-2 text-center text-sm font-semibold text-emerald-600">🎉 Barcha qadamlar bajarildi! Robot ishlashga tayyor.</p>
          )}
        </div>

        {/* Video */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-slate-900">🎬 Video qo'llanma</h2>
          <p className="mb-4 text-sm text-slate-600">Yozma bosqichlar qiyin tuyulsa, avval videoni ko'ring — keyin qadamlarni bajaring.</p>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {embedUrl ? (
              <iframe
                className="h-56 w-full sm:h-80"
                src={embedUrl}
                title="FATH robot o'rnatish video qo'llanma"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-slate-500">
                Video hali qo'shilmagan. Admin paneldan YouTube havolani kiriting.
              </div>
            )}
          </div>
        </section>

        {/* Broker Selection Step */}
        {partnerBrokers.length > 0 && (
          <section className="mb-5 rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl">🏦</div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Birinchi qadam</span>
                <h3 className="text-lg font-bold text-slate-900">Broker tanlang va MT5 hisob oching</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              FATH robot bilan savdo qilish uchun avval brokerda MetaTrader 5 hisob ochishingiz kerak. 
              Quyidagi ishonchli brokerlardan birini tanlang — ro'yxatdan o'tish bepul va bir necha daqiqa oladi.
            </p>
            <div className="flex flex-wrap gap-3">
              {partnerBrokers.map((broker, idx) => (
                <a
                  key={idx}
                  href={broker.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 w-28 sm:w-32"
                >
                  <img src={broker.logoUrl} alt={broker.name} className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 text-center leading-tight">{broker.name}</span>
                  <span className="text-[10px] font-semibold text-emerald-600">Hisob ochish →</span>
                </a>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Allaqachon MT5 hisobingiz bormi? Bu qadamni o'tkazib yuboring.</p>
          </section>
        )}

        {/* Steps */}
        <section className="mb-10">
          <div className="space-y-3">
            {allSteps.map((step) => (
              <div key={step.id}>
                <StepCard
                  step={step}
                  isOpen={openStep === step.id}
                  onToggle={() => toggleStep(step.id)}
                />
                {openStep === step.id && (
                  <div className="flex justify-end px-2 pt-2">
                    <button
                      onClick={() => markComplete(step.id)}
                      disabled={completedSteps.includes(step.id)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        completedSteps.includes(step.id)
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}
                    >
                      {completedSteps.includes(step.id) ? '✓ Bajarildi' : 'Bajarildi — keyingisiga o\'tish'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tips */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">💡 Muhim maslahatlar</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {tips.map((t) => (
              <div key={t.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-2xl">{t.icon}</span>
                <h3 className="mt-2 font-semibold text-slate-900 text-sm">{t.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{t.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Professional Installation */}
        <section className="mb-10 rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6">
          <h2 className="text-lg font-bold text-cyan-900">🛠 Professional o'rnatish xizmati</h2>
          <p className="mt-2 text-sm text-cyan-900/80">
            O'zingiz o'rnatishga vaqtingiz yo'qmi yoki qiyinchilik bo'lsa — mutaxassis masofaviy ravishda o'rnatib beradi.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-cyan-900/80">
            <li>✓ Robot, terminal va parametrlar to'liq sozlanadi</li>
            <li>✓ Qulay vaqtda Telegram/telefon orqali bog'laniladi</li>
            <li>✓ O'rnatish 30-60 daqiqa davom etadi</li>
          </ul>
          <div className="mt-4">
            <Link href="/shop" className="inline-block rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 transition-colors">
              Xaridda xizmatni tanlash →
            </Link>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">🔧 Muammolar va yechimlar</h2>
          <div className="space-y-3">
            {troubleshooting.map((t) => (
              <details key={t.problem} className="rounded-xl border border-slate-200 bg-white shadow-sm group cursor-pointer">
                <summary className="flex items-center gap-3 p-4 font-medium text-slate-700 group-open:text-red-700 transition-colors select-none">
                  <span className="shrink-0 text-red-400 group-open:text-red-600">⚠</span>
                  {t.problem}
                </summary>
                <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-slate-600">{t.solution}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* System Requirements */}
        <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-900">💻 Tizim talablari</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600">Kompyuter</p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li>— Windows 7 yoki undan yuqori</li>
                <li>— Kamida 2 GB RAM</li>
                <li>— 500 MB bo'sh disk</li>
                <li>— Internet ulanishi (10 Mbps+)</li>
              </ul>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600">VPS server (tavsiya)</p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li>— Linux yoki Windows VPS</li>
                <li>— Kamida 1 GB RAM</li>
                <li>— 99.9% uptime kafolati</li>
                <li>— 24/7 uzluksiz ishlash</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Tayyormisiz?</h2>
          <p className="text-sm text-slate-600 mb-6">
            Litsenziya oling va robotni bugun ishga tushiring
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="inline-block rounded-lg bg-amber-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
              Litsenziya sotib olish
            </Link>
            <Link href="/dashboard" className="inline-block rounded-lg border border-slate-300 px-7 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 transition-colors">
              Kabinetga kirish
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
