'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

export default function TermsPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/public/site-profile')
      .then((r) => r.json())
      .then((d) => setProfile(d.profile || {}))
      .catch(() => {});
  }, []);

  const seller = profile?.seller || {};
  const phone = profile?.phone || '+998930012284';
  const telegram = profile?.telegramChannel || 'https://t.me/Fath_EA';
  const author = profile?.authorTelegram || 'https://t.me/TraderMQL';

  const sellerName = seller.ownerFullName || "Ro'ziboyev Iqboljon Talibovich";
  const sellerBrand = seller.brand || 'FATH ROBOT';
  const sellerForm = seller.legalForm || 'YaTT';
  const sellerInn = seller.inn || '';
  const sellerAddress = seller.legalAddress || '';

  const sections = [
    {
      title: '1. Umumiy qoidalar',
      content: `Ushbu foydalanish shartlari (keyingi o'rinlarda «Shartlar») ${sellerBrand} dasturiy ta'minotidan
        foydalanish qoidalarini belgilaydi. ${sellerBrand} — MetaTrader 5 savdo platformasi uchun mo'ljallangan
        algoritmik savdo dasturi (Expert Advisor) bo'lib, ${sellerForm} ${sellerName} tomonidan ishlab chiqilgan
        va taqdim etiladi.`,
      items: [
        "Saytdan ro'yxatdan o'tish, dasturni sotib olish yoki foydalanish orqali siz ushbu Shartlarning barcha bandlarini o'qiganligingizni, tushunganligingizni va qabul qilganligingizni tasdiqlaysiz.",
        "Agar siz ushbu Shartlarga rozi bo'lmasangiz, dasturni sotib olmang va foydalanmang.",
        "Sotuvchi ushbu Shartlarni istalgan vaqtda o'zgartirish huquqini o'zida saqlab qoladi. O'zgarishlar saytda e'lon qilingan paytdan boshlab kuchga kiradi.",
      ],
    },
    {
      title: '2. Xizmat tavsifi',
      items: [
        `${sellerBrand} — moliyaviy bozorlarda algoritmik savdo operatsiyalarini bajaruvchi dasturiy ta'minot.`,
        "Dastur oldindan belgilangan algoritm asosida ishlaydi va foydalanuvchi sozlamalariga muvofiq savdo buyruqlarini bajaradi.",
        "Dastur foyda olishni kafolatlamaydi. Savdo natijalari bozor sharoitiga, broker xizmatlari sifatiga va boshqa tashqi omillarga bog'liq.",
        "Dastur faqat Sotuvchi tomonidan qo'llab-quvvatlanadigan moliyaviy instrumentlar (valyuta juftliklari, metallar, kriptovalyutalar) bo'yicha ishlaydi.",
      ],
    },
    {
      title: '3. Litsenziya tartibi',
      items: [
        "Har bir litsenziya faqat bitta (1) MetaTrader 5 real savdo hisobiga biriktiriladi.",
        "Litsenziya muddati xaridor tanlagan tarif rejasiga muvofiq belgilanadi: 1 oy, 3 oy, 6 oy yoki 12 oy.",
        "Litsenziya muddati tugashi bilan robot avtomatik ravishda ishlashni to'xtatadi. Muddat uzaytirish uchun qayta to'lov talab etiladi.",
        "Litsenziya kaliti shaxsiy hisoblanadi — boshqa shaxsga o'tkazilmaydi, sotilmaydi, ijaraga berilmaydi.",
        "Demo hisobda sinov uchun litsenziya talab etilmasligi mumkin, ammo real hisobda litsenziya majburiy.",
        "Litsenziya server tomonidan har 30 daqiqada tekshiriladi. Muddati tugagan yoki admin tomonidan bekor qilingan litsenziya avtomatik to'xtatiladi.",
      ],
    },
    {
      title: '4. Foydalanuvchi majburiyatlari',
      items: [
        "MetaTrader 5 hisob ma'lumotlarini to'g'ri va aniq kiritish.",
        "Dasturni faqat o'z shaxsiy hisobida, litsenziya bilan biriktirilgan hisobda ishlatish.",
        "Risk boshqaruvi qoidalariga rioya qilish va o'z moliyaviy ahvoliga mos mablag' bilan savdo qilish.",
        "Dastur fayllarini ruxsatsiz nusxalash, tarqatish yoki uchinchi shaxslarga bermaslik.",
        "Dastur kodini dekompilyatsiya qilish, teskari muhandislik qilish yoki himoya mexanizmlarini chetlab o'tishga urinmaslik.",
        "Dasturni noqonuniy maqsadlarda yoki broker shartlarini buzish uchun ishlatmaslik.",
        "Real hisobda foydalanishdan oldin demo hisobda dasturni sinab ko'rish tavsiya etiladi.",
      ],
    },
    {
      title: '5. Moliyaviy risklar haqida ogohlantirish',
      highlight: true,
      content: `Moliyaviy bozorlarda savdo qilish yuqori darajadagi risk bilan bog'liq bo'lib,
        investitsiya qilingan mablag'ning qisman yoki to'liq yo'qotilishiga olib kelishi mumkin.`,
      items: [
        "Onlayn birjada ko'rilgan har qanday zarar — foyda yoki yo'qotish — to'liq foydalanuvchining mas'uliyati hisoblanadi.",
        "Sotuvchi hech qanday sharoitda savdo natijalari, daromad yoki foyda uchun javobgarlik olmaydi.",
        "Oldingi savdo natijalari kelajakdagi natijalarni kafolatlamaydi va belgilamaydi.",
        "Broker serveridagi uzilishlar, internet aloqasining uzilishi, likvidlik yetishmasligi, slippage yoki bozorning kutilmagan harakatlari natijasida yuzaga kelgan zararlar uchun Sotuvchi javobgar emas.",
        "Foydalanuvchi faqat yo'qotishga tayyor bo'lgan mablag' bilan savdo qilishi shart.",
        "Ushbu dastur investitsiyaviy maslahat yoki daromad va'dasi sifatida taqdim etilmaydi.",
      ],
    },
    {
      title: "6. To'lov va qaytarish siyosati",
      items: [
        "To'lov tasdiqlangach, litsenziya tegishli tarif bo'yicha 3 ish kuni ichida faollashtiriladi.",
        "To'lov qaytarilmaydigan xarakter kasb etadi — bozor sharoitlari yoki savdo natijalari asosida to'lov qaytarilmaydi.",
        "Istisno: agar dasturda Sotuvchi tomonidan tan olingan jiddiy texnik nosozlik mavjud bo'lsa va uni oqilona muddatda bartaraf etib bo'lmasa, foydalanilmagan muddat uchun to'lov qaytarilishi mumkin.",
        "To'lov bilan bog'liq nizolar O'zbekiston Respublikasi amaldagi qonunchiligiga muvofiq hal etiladi.",
      ],
    },
    {
      title: "7. Kafolat va javobgarlik chegarasi",
      items: [
        'Dastur "bor holatida" (as-is) taqdim etiladi. Sotuvchi dasturning uzluksiz yoki xatosiz ishlashini kafolatlamaydi.',
        "Sotuvchi faqat aniqlangan dasturiy (texnik) nosozliklarni oqilona muddatda bartaraf etish majburiyatini oladi.",
        "Sotuvchining maksimal javobgarligi har qanday holatda xaridor to'lagan litsenziya narxidan oshmaydi.",
        "Bilvosita zarar, yo'qotilgan foyda yoki savdo natijalari uchun Sotuvchi javobgar emas.",
      ],
    },
    {
      title: '8. Intellektual mulk',
      items: [
        `${sellerBrand} dasturining barcha intellektual mulk huquqlari, shu jumladan dastur kodi, algoritm, dizayn va texnik yechimlar to'liq Sotuvchiga tegishli.`,
        "Litsenziya foydalanish huquqini beradi, ammo mulk huquqini bermaydi.",
        "Shartnoma buzilgan taqdirda Sotuvchi litsenziyani oldindan ogohlantirishsiz bekor qilish huquqiga ega.",
      ],
    },
    {
      title: '9. Maxfiylik siyosati',
      items: [
        "Foydalanuvchining shaxsiy ma'lumotlari (ism, email, telefon, MT5 hisob raqami) faqat litsenziyani boshqarish va texnik qo'llab-quvvatlash maqsadlarida ishlatiladi.",
        "Ma'lumotlar uchinchi shaxslarga qonuniy asos yoki foydalanuvchi roziligi bo'lmagan holda oshkor qilmaydi.",
        "Savdo statistikasi anonim ravishda umumiy ko'rsatkichlar uchun ishlatilishi mumkin.",
      ],
    },
    {
      title: '10. Amaldagi qonunchilik',
      content: `Ushbu Shartlarga O'zbekiston Respublikasi qonunlari tatbiq etiladi. Shartlar yuzasidan
        kelib chiqadigan barcha nizolar avvalo muzokaralar yo'li bilan, kelishuv hosil bo'lmaganda —
        O'zbekiston Respublikasi sudlari orqali hal etiladi.`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">

        <div className="mb-8 border-b border-slate-800 pb-8">
          <span className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Huquqiy ma'lumot
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">
            Foydalanish shartlari
          </h1>
          <p className="mt-3 text-slate-400">Oxirgi yangilanish: 2026-03-21</p>
        </div>

        {/* Sotuvchi ma'lumotlari */}
        {profile && (sellerName || sellerInn) && (
          <section className="mb-4 rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-slate-100">Sotuvchi haqida</h2>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {sellerBrand && <p><span className="font-semibold text-slate-300">Brend:</span> <span className="text-slate-400">{sellerBrand}</span></p>}
              {sellerName && <p><span className="font-semibold text-slate-300">Rahbar:</span> <span className="text-slate-400">{sellerName}</span></p>}
              {sellerForm && <p><span className="font-semibold text-slate-300">Yuridik shakli:</span> <span className="text-slate-400">{sellerForm}</span></p>}
              {sellerInn && <p><span className="font-semibold text-slate-300">INN:</span> <span className="text-slate-400">{sellerInn}</span></p>}
              {sellerAddress && <p className="sm:col-span-2"><span className="font-semibold text-slate-300">Manzil:</span> <span className="text-slate-400">{sellerAddress}</span></p>}
            </div>
          </section>
        )}

        <div className="space-y-4">
          {sections.map((s, idx) => (
            <section
              key={idx}
              className={`rounded-lg border p-6 ${
                s.highlight
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <h2 className={`text-lg font-bold ${s.highlight ? 'text-amber-400' : 'text-slate-100'}`}>
                {s.title}
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

          {/* Aloqa */}
          <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-slate-100">11. Aloqa ma'lumotlari</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>Telegram kanal: {telegram}</li>
              <li>Muallif: {author}</li>
              <li>Telefon: {phone}</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-sm text-slate-400">
            Ushbu shartlar bilan tanishib chiqqach, xaridni davom ettirishingiz mumkin.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-md bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Tariflarni ko'rish
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
