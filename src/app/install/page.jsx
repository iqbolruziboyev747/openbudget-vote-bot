'use client';

import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

const steps = [
  ['MT5 ni o`rnating', 'MetaTrader 5 terminalini rasmiy manbadan yuklab o`rnating va broker hisobingizga kiring.'],
  ['Robot faylini yuklang', 'Kabinetdagi Versiyalar sahifasidan eng so`nggi .ex5 faylni yuklab oling.'],
  ['Faylni papkaga joylang', 'MT5 -> File -> Open Data Folder -> MQL5 -> Experts ichiga robot faylini ko`chiring.'],
  ['MT5 ni qayta ishga tushiring', 'Navigator bo`limida robot ko`rinishi uchun terminalni restart qiling.'],
  ['Grafikka biriktiring', 'Valyuta juftligini ochib, robotni chart ustiga sudrab tashlang. AutoTrading ON bo`lsin.'],
  ['Litsenziya kalitini kiriting', 'Kabinetdan olingan kalit va account ID ni robot inputlariga to`g`ri kiriting.'],
  ['Tekshirish', 'Expert/Journal loglarida License valid va robot started xabarlari chiqqanini tekshiring.'],
];

export default function InstallPage() {
  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="fath-shell rounded-3xl p-8 sm:p-10">
          <h1 className="text-4xl font-black text-slate-900">MT5 ga o`rnatish qo`llanmasi</h1>
          <p className="mt-3 text-slate-600">Birinchi marta ko`rayotgan foydalanuvchi ham robotni mustaqil o`rnata olishi uchun soddalashtirilgan yo`riqnoma.</p>

          <ol className="mt-8 space-y-4">
            {steps.map((step, index) => (
              <li key={step[0]} className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-5">
                <p className="text-sm font-bold text-cyan-700">QADAM {index + 1}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{step[0]}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step[1]}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Eslatma: real hisobda ishlatishdan oldin demo hisobda kamida 1 hafta test tavsiya etiladi.
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
