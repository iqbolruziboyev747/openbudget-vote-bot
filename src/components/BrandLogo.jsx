"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandLogo({ compact = false }) {
  const [logoSrc, setLogoSrc] = useState('/logos/fath-robot.png');

  return (
    <Link href="/" className="inline-flex items-center gap-2 group">
      <div className={`flex-shrink-0 ${compact ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-40 h-40'}`}>
        <Image
          src={logoSrc}
          alt="FATH Robot"
          width={compact ? 64 : 160}
          height={compact ? 64 : 160}
          priority
          onError={() => setLogoSrc('/logos/fath-robot.svg')}
          className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-wider text-slate-900 group-hover:text-slate-800 transition-colors ${compact ? 'text-lg sm:text-2xl' : 'text-4xl'}`}>
          FATH
        </span>
        <span className={`font-semibold uppercase tracking-[0.22em] text-slate-400 ${compact ? 'text-[7px] sm:text-[9px] mt-0.5' : 'text-xs mt-1'}`}>
          Algorithmic Trading
        </span>
      </div>
    </Link>
  );
}
