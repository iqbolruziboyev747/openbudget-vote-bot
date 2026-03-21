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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-slate-800 pb-10">
          <span className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Versiyalar va yangilanishlar
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">
            FATH Robot versiyalari
          </h1>
          <p className="mt-3 text-slate-400">
            Faol litsenziyali foydalanuvchilar robot faylini yuklab olishi mumkin
          </p>
        </div>

        {!loading && !user && (
          <div className="mb-8 rounded-lg border border-amber-800/40 bg-amber-950/30 p-5 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-300">Yuklab olish uchun tizimga kiring</p>
            <Link href="/login" className="flex-shrink-0 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
              Kirish
            </Link>
          </div>
        )}

        {loadingData && (
          <div className="py-12 text-center text-slate-500 text-sm">Yuklanmoqda...</div>
        )}

        {!loadingData && (
          <div className="space-y-4 mb-10">
            {displayVersions.map((v, idx) => {
              const isCurrent = (v.status || 'current') === 'current';
              return (
                <div key={v.id || idx} className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-slate-100">v{v.version}</span>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isCurrent
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isCurrent ? 'Joriy' : 'Barqaror'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {user && canDownload && v.id ? (
                        <button
                          type="button"
                          onClick={() => handleDownload(v.id)}
                          className="rounded-md bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                        >
                          Robotni yuklab olish
                        </button>
                      ) : (
                        <span className="rounded-md border border-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-600 cursor-not-allowed">
                          Litsenziya kerak
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Yangiliklar</p>
                    <ul className="space-y-1">
                      {(String(v.notes || '')).split('\n').filter((l) => l.trim()).map((line, i) => (
                        <li key={i} className="text-sm text-slate-400">{line.trim()}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!canDownload && !loading && (
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
            <h2 className="text-lg font-bold text-slate-100 mb-2">Litsenziyangiz yo'qmi?</h2>
            <p className="text-sm text-slate-400 mb-6">
              Litsenziyali foydalanuvchilar robot fayllarini yuklab olishi mumkin
            </p>
            <Link href="/shop" className="inline-block rounded-md bg-amber-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
              Litsenziya sotib olish
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
