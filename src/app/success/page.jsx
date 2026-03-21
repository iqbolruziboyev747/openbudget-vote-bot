'use client';

import React from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Buyurtma Qabul Qilindi</h1>
        <p className="text-slate-300 mb-6">
          Siz tanlagan tarif bo'yicha buyurtma navbatga qo'shildi.
        </p>

        <div className="text-left bg-slate-900/40 border border-slate-700 rounded-lg p-5 mb-8">
          <p className="text-sm text-slate-300 leading-7">
            To'lov provayderi ulanishi yakunlangach sizning buyurtmangiz avtomatik to'lov bosqichiga o'tadi.
            Keyingi bosqichda litsenziya tokeni yaratiladi va kabinetda ko'rsatiladi.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard" className="block w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold">
            Kabinetga O'tish
          </Link>
          <Link href="/shop" className="block w-full py-3 rounded-lg border border-slate-600 hover:bg-slate-700 font-semibold">
            Yana Tarif Ko'rish
          </Link>
        </div>
      </div>
    </div>
  );
}
