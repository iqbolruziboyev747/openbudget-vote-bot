'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoChecked, setAutoChecked] = useState(false);

  const verify = async (verifyCode) => {
    const c = (verifyCode || code).trim().toUpperCase();
    if (!c) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/public/verify?code=${encodeURIComponent(c)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, message: 'Serverga ulanishda xatolik yuz berdi.' });
    } finally {
      setLoading(false);
    }
  };

  // URL dan code kelsa avtomatik tekshirish
  if (initialCode && !autoChecked) {
    setAutoChecked(true);
    verify(initialCode);
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-800">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:py-16 sm:px-6">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-100 mb-4">
            <svg className="w-8 h-8 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-4xl">Hujjat tekshiruvi</h1>
          <p className="mt-2 text-slate-600">PDF hujjatingizdagi tekshiruv kodini kiriting</p>
        </div>

        <div className="fath-shell rounded-2xl p-6 sm:p-8">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tekshiruv kodi</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VRF-XXXX-XXXX"
              maxLength={13}
              className="w-full sm:flex-1 rounded-lg border border-cyan-200 px-4 py-3 text-base sm:text-lg font-mono tracking-widest text-center focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
            />
            <button
              onClick={() => verify()}
              disabled={loading || !code.trim()}
              className="w-full sm:w-auto rounded-lg bg-cyan-600 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Tekshirilmoqda...' : 'Tekshirish'}
            </button>
          </div>

          {result && (
            <div className={`mt-6 rounded-xl p-4 sm:p-6 ${result.valid ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
              <div className="flex items-start gap-3">
                {result.valid ? (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${result.valid ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {result.valid ? 'Hujjat haqiqiy' : 'Hujjat topilmadi'}
                  </h3>
                  <p className={`mt-1 text-sm ${result.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {result.message}
                  </p>

                  {result.valid && result.license && (
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <div className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-lg bg-white/60 p-3 sm:grid-cols-2 sm:p-4">
                        <span className="font-semibold">Hujjat turi:</span>
                        <span>{result.documentType === 'guvohnoma' ? 'Litsenziya guvohnomasi' : 'Yuridik shartnoma'}</span>

                        <span className="font-semibold">Status:</span>
                        <span className={`font-bold ${result.license.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {result.license.status === 'active' ? 'Faol' : result.license.status === 'expired' ? 'Muddati tugagan' : 'Nofaol'}
                        </span>

                        {result.license.planName && (
                          <><span className="font-semibold">Tarif:</span><span>{result.license.planName}</span></>
                        )}

                        {result.license.issuedAt && (
                          <><span className="font-semibold">Berilgan sana:</span><span>{new Date(result.license.issuedAt).toLocaleDateString('uz-UZ')}</span></>
                        )}

                        {result.license.expiresAt && (
                          <><span className="font-semibold">Amal muddati:</span><span>{new Date(result.license.expiresAt).toLocaleDateString('uz-UZ')}</span></>
                        )}

                        {result.license.accountIdLast4 && (
                          <><span className="font-semibold">MT5 hisob:</span><span>{result.license.accountIdLast4}</span></>
                        )}

                        {result.license.buyerInitials && (
                          <><span className="font-semibold">Xaridor:</span><span>{result.license.buyerInitials}</span></>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Hujjat kodini PDF faylingizning yuqori va pastki qismlarida topishingiz mumkin.</p>
          <p className="mt-1">QR kodni telefoningiz kamerasi bilan skanerlashingiz ham mumkin.</p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
