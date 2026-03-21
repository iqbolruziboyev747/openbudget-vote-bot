/* ===================================================================
   FATH ROBOT — yuridik ma'lumotlar va shartnoma bandlari
   =================================================================== */

export const SELLER_LEGAL_INFO = {
  brand: 'FATH ROBOT',
  ownerFullName: "Ro'ziboyev Iqboljon Talibovich",
  legalForm: "Oilaviy tadbirkorlik asosida tashkil etilgan yakka tartibdagi tadbirkor (YaTT)",
  inn: '30308920580088',
  passport: 'AB 746 56 99',
  registrationDate: '15.09.2023',
  registrationNumber: '5640805',
  issuer: "Ohangaron tumani Davlat xizmatlari markazi",
  legalAddress: "Toshkent viloyati, Ohangaron tumani, Nurobod MFY, Nurobodqo'rg'oni ko'chasi, 12-uy",
  phone: '+998930012284',
  telegram: '@TraderMQL',
};

/* -------------------------------------------------------------------
   SHARTNOMA BANDLARI — asosiy shartnoma matni
   ------------------------------------------------------------------- */

/** 1-bob: Shartnoma predmeti */
export const CONTRACT_SUBJECT = [
  "Sotuvchi ushbu shartnomaga muvofiq Xaridorga FATH Robot nomli algoritmik savdo dasturiy ta'minotidan (keyingi o'rinlarda «Mahsulot» deb yuritiladi) foydalanish huquqini — litsenziyani taqdim etadi.",
  "Xaridor Mahsulotning belgilangan narxini to'liq va o'z vaqtida to'lash majburiyatini oladi.",
  "Mahsulot MetaTrader 5 savdo platformasi uchun mo'ljallangan avtomatik (Expert Advisor) yoki yarim avtomatik savdo dasturi hisoblanadi.",
  "Sotuvchi tomonidan taqdim etiladigan litsenziya — bu foydalanish huquqi bo'lib, Mahsulotning intellektual mulk huquqlari to'liq Sotuvchida qoladi.",
];

/** 2-bob: Mahsulot tavsifi va talablar */
export const CONTRACT_PRODUCT = [
  "Mahsulot oldindan belgilangan algoritm asosida moliyaviy bozorlarda savdo operatsiyalarini avtomatik ravishda bajaradi.",
  "Mahsulot foyda olishni kafolatlamaydi. Algoritmik savdo natijalari bozor sharoitiga, likvidlikka, broker xizmatlari sifatiga va boshqa tashqi omillarga bog'liq.",
  "Mahsulot faqat Sotuvchi tomonidan qo'llab-quvvatlanadigan moliyaviy instrumentlar (valyuta juftliklari, metallar, kriptovalyutalar) bo'yicha ishlaydi.",
  "Mahsulot to'g'ri ishlashi uchun barqaror internet aloqasi va MetaTrader 5 platformasining uzluksiz ishlashi talab etiladi.",
];

/** 3-bob: Narx va to'lov tartibi */
export const CONTRACT_PAYMENT = [
  "Mahsulot narxi tanlangan tarif rejasiga muvofiq belgilanadi va to'lov vaqtida amal qilayotgan narxlar asosida hisoblanadi.",
  "Xaridor shartnoma tuzilgan sanadan boshlab 24 soat ichida to'lovni to'liq amalga oshiradi.",
  "To'lov amalga oshirilgandan so'ng Sotuvchi 3 (uch) ish kuni ichida Mahsulotni Xaridorning MetaTrader 5 hisobiga faollashtiradi.",
  "To'lov qaytarilmaydigan xarakter kasb etadi, 7-bobda nazarda tutilgan holatlar bundan mustasno.",
];

/** 4-bob: Sotuvchining huquq va majburiyatlari */
export const CONTRACT_SELLER_OBLIGATIONS = [
  "Shartnomada kelishilgan muddatda Mahsulotni yetkazib berish va Xaridorning MetaTrader 5 hisobiga faollashtirish.",
  "Mahsulotning texnik jihatdan ishlashini ta'minlash va aniqlangan dasturiy nosozliklarni oqilona muddatlarda bartaraf etish.",
  "Xaridorni Mahsulot yangilanishlari haqida xabardor qilish va litsenziya muddati davomida bepul yangilanishlarni taqdim etish.",
  "Xaridorning shaxsiy ma'lumotlarini uchinchi shaxslarga oshkor qilmaslik.",
  "Sotuvchi moliyaviy maslahat berish majburiyatini olmaydi va investitsiya bo'yicha tavsiyalar bermaydi.",
];

/** 5-bob: Xaridorning huquq va majburiyatlari */
export const CONTRACT_BUYER_OBLIGATIONS = [
  "Mahsulot narxini belgilangan muddatda to'liq to'lash.",
  "Mahsulotni faqat o'z shaxsiy MetaTrader 5 hisobida, litsenziya bilan biriktirilgan hisobda ishlatish.",
  "Mahsulot kodini dekompilyatsiya qilmaslik, teskari muhandislik (reverse engineering) qilmaslik va uchinchi shaxslarga tarqatmaslik.",
  "Litsenziya kalitini, faollashtirish ma'lumotlarini va dastur fayllarini boshqa shaxslarga bermaslik, sotmaslik yoki ijaraga bermaslik.",
  "Onlayn birjada ko'rilgan zarar, shu jumladan savdo operatsiyalari natijasida yuzaga kelgan har qanday moliyaviy yo'qotish uchun to'liq javobgarlikni o'z zimmasiga olish.",
  "Demo hisobda Mahsulotni sinab ko'rish va faqat risklarni to'liq tushungan holda real hisobda foydalanishni boshlash.",
];

/** 6-bob: Risklar va javobgarlik chegarasi */
export const CONTRACT_RISK_DISCLAIMER = [
  "Moliyaviy bozorlarda savdo qilish yuqori darajadagi risk bilan bog'liq. Xaridor ushbu risklarni to'liq anglagan holda Mahsulotni sotib oladi.",
  "Sotuvchi va Mahsulot onlayn birjada ko'rilgan zararlar uchun javobgar emas. Savdo natijalari — foyda yoki zarar — to'liq Xaridorning mas'uliyati hisoblanadi.",
  "Sotuvchi hech qanday sharoitda daromad, foyda yoki muayyan savdo natijalarini kafolatlamaydi. Oldingi natijalar kelajakdagi natijalarni kafolatlamaydi.",
  "Broker serveridagi uzilishlar, internet aloqasining uzilishi, likvidlik yetishmasligi, slippage, spread kengayishi yoki bozorning kutilmagan harakatlari natijasida yuzaga kelgan zararlar uchun Sotuvchi javobgar emas.",
  "Xaridor o'z moliyaviy ahvoliga mos keladigan mablag' bilan savdo qilishi va yo'qotishga tayyor bo'lgan summadan ortiq mablag' kiritmasligi shart.",
  "Ushbu shartnoma investitsiyaviy maslahat yoki daromad va'dasi sifatida talqin etilmaydi.",
];

/** 7-bob: Shartnomani bekor qilish va pulni qaytarish */
export const CONTRACT_CANCELLATION = [
  "Xaridor shartnoma shartlarini buzgan taqdirda (litsenziyani tarqatish, kodga ruxsatsiz kirish va h.k.) Sotuvchi litsenziyani oldindan ogohlantirishsiz bekor qilish huquqiga ega. Bu holda to'lov qaytarilmaydi.",
  "Agar Mahsulotda Sotuvchi tomonidan tan olingan jiddiy texnik nosozlik mavjud bo'lsa va uni oqilona muddatda bartaraf etib bo'lmasa, Xaridor to'lovning foydalanilmagan qismini qaytarib olish huquqiga ega.",
  "Bozor sharoitlari, savdo natijalari yoki Xaridorning shaxsiy qarorlari asosida to'lovni qaytarish amalga oshirilmaydi.",
];

/** 8-bob: Maxfiylik */
export const CONTRACT_CONFIDENTIALITY = [
  "Tomonlar shartnoma doirasida olgan barcha ma'lumotlarni maxfiy saqlaydi va uchinchi shaxslarga qonuniy asos bo'lmagan holda oshkor qilmaydi.",
  "Xaridorning shaxsiy ma'lumotlari faqat litsenziyani boshqarish va texnik qo'llab-quvvatlash maqsadlarida ishlatiladi.",
];

/** 9-bob: Fors-major */
export const CONTRACT_FORCE_MAJEURE = [
  "Tomonlarning nazoratidan tashqaridagi holatlarda (tabiiy ofatlar, urush, qonunchilik o'zgarishlari, internet infratuzilmasining global buzilishi va h.k.) shartnoma majburiyatlari to'xtatiladi.",
  "Fors-major holati tugaganidan so'ng tomonlar o'z majburiyatlarini bajarishda davom etadilar.",
];

/** 10-bob: Nizolarni hal etish */
export const CONTRACT_DISPUTES = [
  "Shartnoma yuzasidan kelib chiqadigan barcha nizolar avvalo muzokaralar yo'li bilan hal etiladi.",
  "Muzokaralar natija bermaganida nizo O'zbekiston Respublikasi amaldagi qonunchiligiga muvofiq sud tartibida hal etiladi.",
  "Shartnomaga O'zbekiston Respublikasi qonunlari tatbiq etiladi.",
];

/** 11-bob: Shartnomaning amal qilish muddati */
export const CONTRACT_VALIDITY = [
  "Shartnoma tomonlar imzo chekkan (to'lov amalga oshirilgan) kundan boshlab kuchga kiradi.",
  "Shartnoma tanlangan litsenziya tarif muddati tugaguniga qadar amal qiladi.",
  "Litsenziya muddati uzaytirilgan taqdirda shartnoma yangi muddatga qadar amal qiladi.",
];

/** 12-bob: Yakuniy qoidalar */
export const CONTRACT_FINAL = [
  "Ushbu shartnoma ikki tomonning erkin irodasi asosida tuzilgan bo'lib, har ikkala tomon uchun teng yuridik kuchga ega.",
  "Shartnomaga o'zgartirish va qo'shimchalar faqat tomonlarning yozma kelishuvi asosida kiritiladi.",
  "Ushbu shartnomada tartibga solinmagan masalalar O'zbekiston Respublikasi amaldagi qonunchiligiga muvofiq hal etiladi.",
  "Xaridor to'lovni amalga oshirish orqali ushbu shartnomaning barcha bandlari bilan tanishganligini va roziligini tasdiqlaydi.",
];

/* -------------------------------------------------------------------
   Oddiy qator — eskicha CONTRACT_TERMS bilan mos bo'lish uchun
   ------------------------------------------------------------------- */
export const CONTRACT_TERMS = [
  ...CONTRACT_SUBJECT,
  ...CONTRACT_PRODUCT,
  ...CONTRACT_PAYMENT,
  ...CONTRACT_SELLER_OBLIGATIONS,
  ...CONTRACT_BUYER_OBLIGATIONS,
  ...CONTRACT_RISK_DISCLAIMER,
  ...CONTRACT_CANCELLATION,
  ...CONTRACT_CONFIDENTIALITY,
  ...CONTRACT_FORCE_MAJEURE,
  ...CONTRACT_DISPUTES,
  ...CONTRACT_VALIDITY,
  ...CONTRACT_FINAL,
];

/* -------------------------------------------------------------------
   Bo'limlar ro'yxati — UI va PDF uchun
   ------------------------------------------------------------------- */
export const CONTRACT_SECTIONS = [
  { title: '1-bob. Shartnoma predmeti',                  items: CONTRACT_SUBJECT },
  { title: '2-bob. Mahsulot tavsifi va talablar',        items: CONTRACT_PRODUCT },
  { title: '3-bob. Narx va to\'lov tartibi',             items: CONTRACT_PAYMENT },
  { title: '4-bob. Sotuvchining huquq va majburiyatlari', items: CONTRACT_SELLER_OBLIGATIONS },
  { title: '5-bob. Xaridorning huquq va majburiyatlari', items: CONTRACT_BUYER_OBLIGATIONS },
  { title: '6-bob. Risklar va javobgarlik chegarasi',    items: CONTRACT_RISK_DISCLAIMER },
  { title: '7-bob. Bekor qilish va pulni qaytarish',     items: CONTRACT_CANCELLATION },
  { title: '8-bob. Maxfiylik',                           items: CONTRACT_CONFIDENTIALITY },
  { title: '9-bob. Fors-major holatlari',                items: CONTRACT_FORCE_MAJEURE },
  { title: '10-bob. Nizolarni hal etish',                items: CONTRACT_DISPUTES },
  { title: '11-bob. Shartnomaning amal qilish muddati',  items: CONTRACT_VALIDITY },
  { title: '12-bob. Yakuniy qoidalar',                   items: CONTRACT_FINAL },
];
