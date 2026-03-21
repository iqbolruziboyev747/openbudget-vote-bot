'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

const staticSections = [
  {
    id: 1,
    title: 'Shartnoma predmeti',
    content: `Ushbu yakuniy foydalanuvchi litsenziya shartnomasi (EULA) FATH Robot dasturiy ta'minotidan
      foydalanish qoidalarini belgilaydi. Dasturni o'rnatish, faollashtirish yoki foydalanish orqali
      siz ushbu shartnomaning barcha bandlarini qabul qilgan hisoblanasiz. Agar siz ushbu shartlarga
      rozi bo'lmasangiz, dasturni o'rnatmang va foydalanmang.`,
  },
  {
    id: 2,
    title: 'Litsenziya berish',
    items: [
      "Sotuvchi sizga FATH Robot dasturidan foydalanish uchun cheklangan, shaxsiy, o'tkazib bo'lmaydigan va eksklyuziv bo'lmagan litsenziya beradi.",
      "Litsenziya faqat bitta (1) MetaTrader 5 real hisobga biriktiriladi. Biriktirilgan hisobni o'zgartirish faqat texnik qo'llab-quvvatlash orqali amalga oshirilishi mumkin.",
      'Litsenziya muddati xaridor tanlagan tarif rejasiga muvofiq belgilanadi.',
      "Litsenziya kaliti shaxsiy hisoblanadi va boshqa shaxsga o'tkazilmaydi.",
    ],
  },
  {
    id: 3,
    title: 'Intellektual mulk huquqlari',
    items: [
      "FATH Robot dasturining barcha intellektual mulk huquqlari, shu jumladan dastur kodi, algoritm, dizayn va texnik yechimlar to'liq Sotuvchiga tegishli.",
      'Litsenziya foydalanish huquqini beradi, ammo mulk huquqini bermaydi.',
      "Dasturning har qanday qismini nusxalash, tarqatish, modifikatsiya qilish yoki lotin bo'lmagan shakllarda qayta yaratish taqiqlanadi.",
    ],
  },
  {
    id: 4,
    title: 'Taqiqlangan amallar',
    items: [
      "Dastur kodini dekompilyatsiya qilish, teskari muhandislik (reverse engineering) yoki disassemblerdan o'tkazish.",
      'Dastur fayllarini ruxsatsiz nusxalash, tarqatish yoki uchinchi shaxslarga berish.',
      'Litsenziya kalitini sotish, ijaraga berish, hadya qilish yoki ommaviy ulashish.',
      "Litsenziya tekshiruvi, HWID himoyasi yoki server bilan bog'lanish mexanizmlarini chetlab o'tishga urinish.",
      "Dasturni noqonuniy maqsadlarda yoki broker shartlarini buzish uchun ishlatish.",
    ],
  },
  {
    id: 5,
    title: 'Risklar haqida ogohlantirish',
    highlight: true,
    content: `Moliyaviy bozorlarda savdo qilish yuqori darajadagi risk bilan bog'liq bo'lib, investitsiya
      qilingan mablag'ning qisman yoki to'liq yo'qotilishiga olib kelishi mumkin. FATH Robot algoritmik
      savdo dasturi bo'lib, foyda olishni kafolatlamaydi. Oldingi savdo natijalari kelajakdagi natijalarni
      belgilamaydi.`,
    items: [
      "Onlayn birjada ko'rilgan har qanday zarar to'liq foydalanuvchining mas'uliyati hisoblanadi.",
      "Sotuvchi hech qanday sharoitda savdo natijalari, daromad yoki foyda uchun javobgarlik olmaydi.",
      "Broker serveridagi uzilishlar, internet aloqasining uzilishi, likvidlik yetishmasligi, slippage yoki bozorning kutilmagan harakatlari natijasida yuzaga kelgan zararlar uchun Sotuvchi javobgar emas.",
      "Foydalanuvchi faqat yo'qotishga tayyor bo'lgan mablag' bilan savdo qilishi shart.",
      "Ushbu dastur investitsiyaviy maslahat yoki daromad va'dasi sifatida taqdim etilmaydi.",
    ],
  },
  {
    id: 6,
    title: "Kafolat va javobgarlik chegarasi",
    content: `Dastur "bor holatida" (as-is) taqdim etiladi. Sotuvchi dasturning uzluksiz, xatosiz yoki
      foydalanuvchi kutgan natijalarni berishini kafolatlamaydi. Sotuvchi faqat aniqlangan dasturiy
      (texnik) nosozliklarni oqilona muddatda bartaraf etish majburiyatini oladi.`,
    items: [
      "Sotuvchining maksimal javobgarligi har qanday holatda xaridor tomonidan to'langan litsenziya narxidan oshmaydi.",
      "Bilvosita zarar, yo'qotilgan foyda yoki savdo natijalari uchun Sotuvchi javobgar emas.",
    ],
  },
  {
    id: 7,
    title: 'Litsenziyani bekor qilish',
    items: [
      "Ushbu shartnoma buzilgan taqdirda (taqiqlangan amallar, litsenziyani tarqatish va h.k.) Sotuvchi litsenziyani oldindan ogohlantirishsiz bekor qilish huquqiga ega.",
      "Bekor qilingan litsenziya qayta faollashtirilmasligi mumkin va to'lov qaytarilmaydi.",
      "Foydalanuvchi istalgan vaqtda dasturni o'chirib, foydalanishni to'xtatishi mumkin.",
    ],
  },
  {
    id: 8,
    title: "Yangilanishlar va qo'llab-quvvatlash",
    items: [
      "Litsenziya muddati davomida dastur yangilanishlari bepul taqdim etiladi.",
      "Sotuvchi dastur funksionalligini o'zgartirish, yangi xususiyatlar qo'shish yoki olib tashlash huquqini o'zida saqlab qoladi.",
      "Texnik qo'llab-quvvatlash Telegram kanali va shaxsiy murojaat orqali amalga oshiriladi.",
    ],
  },
  {
    id: 9,
    title: 'Amaldagi qonunchilik',
    content: `Ushbu shartnomaga O'zbekiston Respublikasi qonunlari tatbiq etiladi. Shartnoma yuzasidan
      kelib chiqadigan barcha nizolar avvalo muzokaralar yo'li bilan, kelishuv hosil bo'lmaganda —
      O'zbekiston Respublikasi sudlari orqali hal etiladi.`,
  },
];

export default function LicenseAgreementPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/public/site-profile')
      .then((r) => r.json())
      .then((d) => setProfile(d.profile || {}))
      .catch(() => {});
  }, []);

  const phone = profile?.phone || '+998930012284';
  const telegram = profile?.telegramChannel || 'https://t.me/Fath_EA';
  const author = profile?.authorTelegram || 'https://t.me/TraderMQL';

  const sections = [
    ...staticSections,
    {
      id: 10,
      title: 'Aloqa',
      items: [
        `Telegram kanal: ${telegram}`,
        `Muallif: ${author}`,
        `Telefon: ${phone}`,
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">

        <div className="mb-8 border-b border-slate-800 pb-8">
          <span className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
            EULA
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">
            Yakuniy foydalanuvchi litsenziya shartnomasi
          </h1>
          <p className="mt-3 text-slate-400">
            FATH Robot dasturiy ta'minoti uchun foydalanish shartlari
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((s) => (
            <section
              key={s.id}
              className={`rounded-lg border p-6 ${
                s.highlight
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <h2
                className={`text-lg font-bold ${
                  s.highlight ? 'text-amber-400' : 'text-slate-100'
                }`}
              >
                {s.id}. {s.title}
              </h2>

              {s.content && (
                <p className="mt-3 text-sm leading-7 text-slate-400">{s.content}</p>
              )}

              {s.items && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-400">
                  {s.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-sm text-slate-400">
            Xaridni davom ettirish orqali siz ushbu litsenziya shartnomasi bandlarini to'liq o'qiganligingizni,
            tushunganligingizni va qabul qilganligingizni tasdiqlaysiz.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-md bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Qabul qilaman — Xarid sahifasiga o'tish
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
