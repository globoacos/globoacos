'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import type { CityGalleryItem } from './galleryTypes';
import { publicPath } from '@/lib/publicPath';

interface Props {
  selectedState: string | null;
  selectedCity: CityGalleryItem | null;
  onClose: () => void;
}

const illustrativeClients = [
  'Atlas Centros Logísticos',
  'Horizonte Atacadista',
  'Nova Safra Alimentos',
  'Vértice Distribuição',
  'Polo Industrial Brasil',
  'Rota Sul Operações',
  'Vale Verde Armazéns',
  'Integra Logística',
  'Aurora Manufatura',
  'Central Norte Atacado',
];

function getIllustrativeClient(city: string) {
  const hash = Array.from(city).reduce((total, character) => total + character.charCodeAt(0), 0);
  return illustrativeClients[hash % illustrativeClients.length];
}

export default function BrazilProjectsCarousel({ selectedState, selectedCity, onClose }: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const cityKey = selectedState && selectedCity ? `${selectedState}-${selectedCity.file}` : null;
  const expanded = Boolean(cityKey && expandedKey === cityKey);
  const imageSrc = selectedState && selectedCity ? publicPath(`/images/states/${selectedState.toLowerCase()}/${selectedCity.file}`) : '';
  const title = selectedState && selectedCity ? `${selectedCity.label} - ${selectedState}` : '';
  const client = selectedCity ? getIllustrativeClient(selectedCity.city) : '';

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpandedKey(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedState && selectedCity ? (
          <motion.figure
            key={`${selectedState}-${selectedCity.file}`}
            initial={{ opacity: 0, x: 38, scale: 0.92, filter: 'blur(12px)', clipPath: 'inset(14% 8% 14% 8% round 34px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0% 0% 0% round 28px)', y: [0, -6, 0] }}
            exit={{ opacity: 0, x: 24, scale: 0.96, filter: 'blur(8px)' }}
            transition={{ opacity: { duration: 0.45 }, x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }, scale: { duration: 0.55 }, filter: { duration: 0.4 }, clipPath: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } }}
            className="relative w-full drop-shadow-[0_35px_55px_rgba(0,0,0,0.5)]"
            aria-label={`Obra em ${title}`}
          >
            <div className="absolute -inset-8 -z-10 rounded-full bg-[#3a9e48]/10 blur-3xl" />
            <figcaption className="mb-5 px-1">
              <strong className="block text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                {title}
              </strong>
              <span className="mt-1.5 block text-sm text-slate-400">
                <span className="mr-2 font-semibold uppercase tracking-[0.14em] text-[#58c96b]">Cliente</span>
                {client}
              </span>
            </figcaption>
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[28px]">
              <button
                type="button"
                onClick={() => setExpandedKey(cityKey)}
                aria-label={`Ampliar imagem da obra em ${title}`}
                className="absolute inset-0 z-10 cursor-zoom-in text-left outline-none focus-visible:ring-2 focus-visible:ring-[#72df82] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b14]"
              >
                <span className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/15 bg-[#06101c]/55 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Clique para ampliar
                </span>
              </button>
              <Image
                src={imageSrc}
                alt={`Obra da Globo Aços em ${title}`}
                fill
                sizes="(min-width: 1280px) 340px, (min-width: 768px) 45vw, 92vw"
                className="object-cover transition duration-700 group-hover:scale-[1.035]"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04101b]/55 via-transparent to-transparent" />
              <div className="pointer-events-none absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#07111d]/55 text-white/75 opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5H5v4M15 5h4v4M9 19H5v-4M15 19h4v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar imagem da obra"
                className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-[#07111d]/55 text-lg text-white/70 backdrop-blur-md transition hover:bg-[#07111d]/90 hover:text-white"
              >
                ×
              </button>
            </div>
          </motion.figure>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && selectedState && selectedCity ? (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020711]/85 p-4 backdrop-blur-xl sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Imagem ampliada da obra em ${title}`}
            onClick={() => setExpandedKey(null)}
          >
            <motion.div
              className="relative w-full max-w-6xl"
              initial={{ opacity: 0, y: 26, scale: 0.94, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 18, scale: 0.97, filter: 'blur(8px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="pointer-events-none absolute -inset-10 rounded-full bg-[#3a9e48]/10 blur-3xl" />
              <div className="mb-4 flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <strong className="block text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">{title}</strong>
                  <span className="mt-1 block text-sm text-slate-400">
                    <span className="mr-2 font-semibold uppercase tracking-[0.14em] text-[#58c96b]">Cliente</span>
                    {client}
                  </span>
                </div>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Visualização ampliada</span>
              </div>
              <div className="relative aspect-[16/10] max-h-[76vh] overflow-hidden rounded-[30px] border border-white/10 bg-[#07111d] shadow-[0_45px_120px_rgba(0,0,0,0.65)]">
                <Image
                  src={imageSrc}
                  alt={`Imagem ampliada da obra da Globo Aços em ${title}`}
                  fill
                  sizes="96vw"
                  className="object-contain"
                  priority
                />
              </div>
              <button
                type="button"
                onClick={() => setExpandedKey(null)}
                aria-label="Fechar visualização ampliada"
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#07111d]/80 text-2xl text-white/75 shadow-xl backdrop-blur-md transition hover:bg-white/10 hover:text-white sm:-right-4 sm:-top-4"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
