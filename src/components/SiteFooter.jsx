"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

const DEFAULT_PROFILE = {
  telegramChannel: 'https://t.me/Fath_EA',
  authorTelegram: 'https://t.me/TraderMQL',
  phone: '+998930012284',
  instagramUrl: '',
  youtubeUrl: '',
  facebookUrl: '',
};

function SocialIcon({ href, label, children }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-500 transition-colors hover:border-amber-500/40 hover:text-amber-600"
    >
      {children}
    </a>
  );
}

export default function SiteFooter() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/public/site-profile');
        const data = await res.json();
        if (!res.ok || !data.profile) return;

        setProfile((prev) => ({
          ...prev,
          telegramChannel: data.profile.telegramChannel || prev.telegramChannel,
          authorTelegram: data.profile.authorTelegram || prev.authorTelegram,
          phone: data.profile.phone || prev.phone,
          instagramUrl: data.profile.instagramUrl || '',
          youtubeUrl: data.profile.youtubeUrl || '',
          facebookUrl: data.profile.facebookUrl || '',
        }));
      } catch {
        // Keep defaults if endpoint is unavailable.
      }
    };

    loadProfile();
  }, []);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-black tracking-widest text-amber-600">FATH</p>
            <p className="mt-1 text-[10px] tracking-[0.25em] text-slate-500 font-medium">TRADING ROBOT</p>
            <p className="mt-3 text-xs leading-5 text-slate-600">
              MetaTrader 5 uchun algoritmik savdo tizimi va litsenziya boshqaruvi platformasi.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Sahifalar</p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/about" className="hover:text-slate-900 transition-colors">Robot haqida</Link></li>
              <li><Link href="/guide-mt5" className="hover:text-slate-900 transition-colors">MT5 o'rnatish</Link></li>
              <li><Link href="/statistics" className="hover:text-slate-900 transition-colors">Statistika</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Tijorat</p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/shop" className="hover:text-slate-900 transition-colors">Tariflar va to'lov</Link></li>
              <li><Link href="/versions" className="hover:text-slate-900 transition-colors">Versiyalar</Link></li>
              <li><Link href="/terms" className="hover:text-slate-900 transition-colors">Foydalanish shartlari</Link></li>
              <li><Link href="/license-agreement" className="hover:text-slate-900 transition-colors">Litsenziya shartnomasi</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Aloqa</p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href={profile.telegramChannel} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                  Telegram kanal
                </a>
              </li>
              <li>
                <a href={profile.authorTelegram} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                  Muallif bilan aloqa
                </a>
              </li>
              <li>
                <a href={`tel:${profile.phone}`} className="hover:text-slate-900 transition-colors">
                  {profile.phone}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <SocialIcon href={profile.telegramChannel} label="Telegram">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M9.78 15.43 9.4 20.8c.54 0 .78-.23 1.06-.51l2.53-2.42 5.25 3.84c.96.53 1.64.25 1.9-.9l3.45-16.16v-.01c.3-1.38-.5-1.92-1.44-1.57L2.37 10.7c-1.35.53-1.33 1.28-.23 1.62l5.04 1.57L18.9 6.5c.55-.37 1.06-.16.65.21" /></svg>
              </SocialIcon>
              <SocialIcon href={profile.instagramUrl} label="Instagram">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
              </SocialIcon>
              <SocialIcon href={profile.youtubeUrl} label="YouTube">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M23 12c0 2.03-.24 3.85-.48 5.03-.2.95-.95 1.7-1.9 1.9C19.45 19.17 16.92 19.4 12 19.4s-7.45-.23-8.62-.47a2.43 2.43 0 0 1-1.9-1.9A24.3 24.3 0 0 1 1 12c0-2.03.24-3.85.48-5.03.2-.95.95-1.7 1.9-1.9C4.55 4.83 7.08 4.6 12 4.6s7.45.23 8.62.47c.95.2 1.7.95 1.9 1.9.24 1.18.48 3 .48 5.03ZM10 9.2v5.6l4.8-2.8L10 9.2Z" /></svg>
              </SocialIcon>
              <SocialIcon href={profile.facebookUrl} label="Facebook">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8V14h2.5v7" /></svg>
              </SocialIcon>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FATH Trading Robot. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
