'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signInWithGoogle } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError("Tizimga kirishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,154,48,0.12)_0%,transparent_60%)]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="w-24 h-24">
            <Image src="/logos/fath-robot.png" alt="FATH Robot" width={96} height={96} priority className="w-full h-full" />
          </div>
          <div className="text-center">
            <p className="font-black tracking-widest text-amber-400 text-xl">FATH</p>
            <p className="text-[9px] tracking-[0.3em] text-slate-500 font-medium">TRADING ROBOT</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 text-center mb-1">Tizimga kirish</h1>
          <p className="text-sm text-slate-600 text-center mb-8">
            Litsenziya va kabinetga kirish uchun Google hisobingizdan foydalaning
          </p>

          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M47.53 24.56c0-1.64-.15-3.22-.42-4.74H24v8.97h13.2a11.3 11.3 0 0 1-4.9 7.41v6.16h7.93c4.64-4.27 7.3-10.57 7.3-17.8z" fill="#4285F4"/>
              <path d="M24 48c6.63 0 12.19-2.2 16.25-5.97l-7.93-6.16c-2.2 1.48-5.02 2.35-8.32 2.35-6.39 0-11.8-4.32-13.74-10.12H2.08v6.36A24 24 0 0 0 24 48z" fill="#34A853"/>
              <path d="M10.26 28.1A14.47 14.47 0 0 1 9.5 24c0-1.42.25-2.8.76-4.1v-6.36H2.08A24 24 0 0 0 0 24c0 3.86.93 7.51 2.08 10.46l8.18-6.36z" fill="#FBBC05"/>
              <path d="M24 9.5c3.6 0 6.83 1.24 9.37 3.67l7.03-7.03C36.18 2.19 30.62 0 24 0A24 24 0 0 0 2.08 13.54l8.18 6.36C12.2 13.82 17.61 9.5 24 9.5z" fill="#EA4335"/>
            </svg>
            {loading ? 'Ulanmoqda...' : 'Google bilan kirish'}
          </button>

          <p className="mt-6 text-center text-xs text-slate-600">
            Kirib, siz{' '}
            <Link href="/terms" className="text-slate-600 hover:text-amber-600 underline underline-offset-2 transition-colors">
              Foydalanish shartlari
            </Link>
            {' '}va{' '}
            <Link href="/license-agreement" className="text-slate-600 hover:text-amber-600 underline underline-offset-2 transition-colors">
              Litsenziya shartnomasini
            </Link>
            {' '}qabul qilasiz.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-400 transition-colors">← Bosh sahifaga qaytish</Link>
        </p>
      </div>
    </div>
  );
}
