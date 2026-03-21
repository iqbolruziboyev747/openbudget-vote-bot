'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import BrandLogo from './BrandLogo';
import { auth } from '../lib/firebase';
import useAuthUser from '../lib/useAuthUser';

const links = [
  { href: '/about',      label: 'Robot haqida' },
  { href: '/guide-mt5',  label: "MT5 O'rnatish" },
  { href: '/robot-status', label: 'Robot holati' },
  { href: '/statistics', label: 'Statistika' },
  { href: '/versions',   label: 'Versiyalar' },
  { href: '/shop',       label: 'Tariflar' },
  { href: '/terms',      label: 'Shartlar' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setMobileOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <BrandLogo compact />
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-cyan-100 text-cyan-800'
                    : 'text-slate-600 hover:bg-cyan-50 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="hidden rounded-md border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 sm:inline-flex"
          >
            Admin
          </Link>
          <Link
            href="/dashboard"
            className="hidden rounded-md border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 md:inline-flex"
          >
            Kabinet
          </Link>
          <Link
            href="/dashboard"
            title="Kabinet"
            className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
          {user ? (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-md bg-rose-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 md:inline-block"
              >
                Chiqish
              </button>
              <button
                type="button"
                onClick={handleLogout}
                title="Chiqish"
                className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-md border border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-md bg-cyan-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 md:inline-block"
              >
                Kirish
              </Link>
              <Link
                href="/login"
                title="Kirish"
                className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-md border border-cyan-300 text-cyan-600 hover:bg-cyan-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1" />
                </svg>
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 md:hidden hover:bg-slate-50 transition-colors"
            aria-label="Menyu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-cyan-100 bg-white px-4 py-3 md:hidden">
          <nav className="grid gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    active ? 'bg-cyan-100 text-cyan-800' : 'text-slate-700 hover:bg-cyan-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-cyan-50">
              Admin
            </Link>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-cyan-50">
              Kabinet
            </Link>
            {user ? (
              <button type="button" onClick={handleLogout} className="rounded-md px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50">
                Chiqish
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50">
                Kirish
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
