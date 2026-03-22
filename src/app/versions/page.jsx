'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '../../lib/firebase';
import useAuthUser from '../../lib/useAuthUser';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

export default function VersionsPage() {
  const { user, loading } = useAuthUser();
  const [canDownload, setCanDownload] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const headers = {};
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch('/api/versions', { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Versiyalarni olishda xatolik');

        setVersions(data.versions || []);
        setCanDownload(Boolean(data.canDownload));
      } catch {
        setVersions([]);
        setCanDownload(false);
      } finally {
        setLoadingData(false);
      }
    };

    run();
  }, [user]);

  const defaultVersions = [
    {
      id: 'demo-1',
      version: '1.6.0',
      notes: `Yangi versiyalar admin panel orqali joylanadi.`,
      status: 'current',
    },
  ];

  const displayVersions = versions.length > 0 ? versions : defaultVersions;

  const handleDownload = async (id) => {
    try {
      if (!auth.currentUser) {
        alert('Avval tizimga kiring.');
        return;
      }

      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/versions/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let errMsg = 'Yuklab olishda xatolik';
        try {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^";\n]+)"?/i);
      const fileName = match ? match[1] : `fath-robot-${id}.ex5`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Xato: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen text-slate-800">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-cyan-100 fath-hero-glow">
        <div className="pointer-events-none absolute inset-0 fath-grid-bg opacity-70" />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <span className="inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Versiyalar va yangilanishlar
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            FATH Robot versiyalari
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Faol litsenziyali foydalanuvchilar robot faylini yuklab olishi mumkin. Eng oxirgi versiya — joriy versiya.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Login prompt */}
        {!loading && !user && (
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <p className="text-sm font-medium text-amber-800">Yuklab olish uchun tizimga kiring</p>
            </div>
            <Link href="/login" className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-200 transition hover:-translate-y-0.5 hover:bg-amber-600">
              Kirish
            </Link>
          </div>
        )}

        {/* Loading */}
        {loadingData && (
          <div className="py-16 text-center">
            <div className="inline-flex h-10 w-10 animate-spin rounded-full border-3 border-cyan-200 border-t-cyan-600" />
            <p className="mt-4 text-sm text-slate-500">Versiyalar yuklanmoqda...</p>
          </div>
        )}

        {/* Version timeline */}
        {!loadingData && (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 sm:left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-300 via-slate-200 to-transparent hidden sm:block" />

            <div className="space-y-5">
              {displayVersions.map((v, idx) => {
                const isCurrent = idx === 0;
                const notes = String(v.notes || '').split('\n').filter((l) => l.trim());
                const publishDate = v.publishedAt?.toDate
                  ? v.publishedAt.toDate()
                  : v.publishedAt?._seconds
                    ? new Date(v.publishedAt._seconds * 1000)
                    : null;
                const dateStr = publishDate
                  ? publishDate.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '';

                return (
                  <div key={v.id || idx} className="relative sm:pl-16">
                    {/* Timeline dot */}
                    <div className={`hidden sm:flex absolute left-3.5 sm:left-4.5 top-6 h-5 w-5 items-center justify-center rounded-full border-2 z-10 ${
                      isCurrent
                        ? 'border-cyan-500 bg-cyan-500 shadow-lg shadow-cyan-300/50'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isCurrent && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>

                    <div className={`rounded-2xl border overflow-hidden transition-all ${
                      isCurrent
                        ? 'border-cyan-200 bg-gradient-to-br from-cyan-50/80 via-white to-sky-50/60 shadow-lg shadow-cyan-100/50 ring-1 ring-cyan-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}>
                      {/* Header */}
                      <div className={`px-5 py-4 sm:px-6 sm:py-5 ${isCurrent ? 'border-b border-cyan-100' : 'border-b border-slate-100'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Version badge */}
                            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 ${
                              isCurrent ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                              <span className="text-sm font-black tracking-wide">v{v.version}</span>
                            </div>

                            {/* Status label */}
                            {isCurrent ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                                <span className="relative flex h-2 w-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                Joriy versiya
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Eski versiya
                              </span>
                            )}

                            {/* Date */}
                            {dateStr && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {dateStr}
                              </span>
                            )}
                          </div>

                          {/* Download button */}
                          <div className="flex-shrink-0">
                            {user && canDownload && v.id ? (
                              <button
                                type="button"
                                onClick={() => handleDownload(v.id)}
                                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-cyan-600 shadow-cyan-200 hover:bg-cyan-700'
                                    : 'bg-slate-600 shadow-slate-200 hover:bg-slate-700'
                                }`}
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Yuklab olish
                              </button>
                            ) : user && !canDownload ? (
                              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Litsenziya kerak
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Release notes */}
                      {notes.length > 0 && (
                        <div className="px-5 py-4 sm:px-6">
                          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            O&apos;zgarishlar
                          </p>
                          <ul className="space-y-1.5">
                            {notes.map((line, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isCurrent ? 'bg-cyan-400' : 'bg-slate-300'}`} />
                                {line.trim()}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No license CTA */}
        {!canDownload && !loading && (
          <div className="mt-10 fath-shell rounded-3xl border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 px-6 py-10 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 mb-4">
              <svg className="h-7 w-7 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Litsenziyangiz yo&apos;qmi?</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Litsenziyali foydalanuvchilar barcha versiya fayllarini yuklab olishi mumkin.
              Hoziroq litsenziya sotib oling va robotni ishga tushiring.
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              Litsenziya sotib olish
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
