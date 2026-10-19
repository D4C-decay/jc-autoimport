/*
 * © JC Autoimport — LogoLoop brands wrapper
 */
'use client';

import LogoLoop from '@/components/react-bits/LogoLoop';
import { BRANDS } from '@/lib/brands';

function slug(s: string) {
  const map: Record<string,string> = {
    'Mercedes-Benz': 'mercedes-benz',
    'Land Rover': 'land-rover',
    'Porsche': 'porsche',
    'BMW': 'bmw',
    'Audi': 'audi',
    'Tesla': 'tesla',
    'Toyota': 'toyota',
    'Ford': 'ford',
  };
  return map[s] || s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function FooterLogoLoop() {
  const logos = BRANDS.map((b) => ({
    src: `/media/brands/${slug(b)}.svg`,
    alt: String(b),
  }));

  return (
    <div className="mt-10 mb-8">
      <LogoLoop
        logos={logos as any}
        speed={70}
        gap={36}
        logoHeight={26}
        pauseOnHover
        fadeOut
        direction="left"
        layout="line"
        labels="none"
        ariaLabel="Marcas que importamos"
      />
    </div>
  );
}
