"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandLogo({ compact = false }) {
  const [logoSrc, setLogoSrc] = useState('/logos/fath-robot.png');

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      <div className={`flex-shrink-0 ${compact ? 'w-28 h-28' : 'w-40 h-40'}`}>
        <Image
          src={logoSrc}
          alt="FATH Robot"
          width={compact ? 112 : 160}
          height={compact ? 112 : 160}
          priority
          onError={() => setLogoSrc('/logos/fath-robot.svg')}
          className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="flex flex-col leading-none gap-0.5">
        <span className={`font-black tracking-widest text-slate-800 group-hover:text-slate-900 transition-colors ${compact ? 'text-2xl' : 'text-4xl'}`}>
          FATH
        </span>
        <span className={`font-medium tracking-[0.25em] text-sky-700 ${compact ? 'text-xs' : 'text-base'}`}>
          TRADING ROBOT
        </span>
      </div>
    </Link>
  );
}
