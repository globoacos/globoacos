'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const Brazil3DMap = dynamic(() => import('./Brazil3DMap'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#050b14] text-center text-slate-500">
      <div>
        <span className="map-loader mx-auto block" />
        <p className="mt-4 text-xs uppercase tracking-[0.2em]">Carregando presença nacional</p>
      </div>
    </div>
  ),
});

export default function LazyBrazilMap() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: '320px 0px' });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} id="obras" className="min-h-screen scroll-mt-20 bg-[#050b14]">
      {visible ? <Brazil3DMap /> : <div className="min-h-screen" aria-hidden="true" />}
    </div>
  );
}
