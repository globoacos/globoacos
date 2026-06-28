'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { brazilStatesData, regionColors } from './brazilStatesData';
import { publicPath } from '@/lib/publicPath';

interface Props {
  selectedState: string | null;
  onClose: () => void;
}

export default function BrazilInfoPanel({ selectedState, onClose }: Props) {
  const data = selectedState ? brazilStatesData[selectedState] : null;

  return (
    <AnimatePresence mode="wait">
      {data && selectedState ? (
        <motion.div
          key={selectedState}
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="h-full flex flex-col"
        >
          <div
            className="relative overflow-hidden px-6 pb-5 pt-6"
            style={{
              background: `linear-gradient(135deg, ${regionColors[data.region] ?? '#1e3a6a'}cc, transparent)`,
            }}
          >
            <div
              className="absolute left-0 right-0 top-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #3a9e48 50%, transparent)' }}
            />

            <button
              onClick={onClose}
              aria-label="Fechar painel"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>

            <span className="absolute -bottom-4 -right-2 select-none text-8xl font-black leading-none text-white opacity-[0.06]">
              {selectedState}
            </span>

            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] p-1.5 shadow-[inset_0_0_18px_rgba(255,255,255,0.04),0_12px_30px_rgba(0,0,0,0.22)]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-[#3a9e48]/10" />
                <Image
                  src={publicPath(`/images/flags/${selectedState.toLowerCase()}.png`)}
                  alt={`Bandeira de ${data.name}`}
                  fill
                  sizes="56px"
                  className="relative z-10 object-contain p-2"
                />
              </div>

              <div>
                <h3 className="text-xl font-black leading-tight tracking-tight text-white">
                  {data.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full border border-[rgba(58,158,72,0.3)] bg-[rgba(58,158,72,0.15)] px-2 py-0.5 text-xs font-semibold text-[#3a9e48]">
                    {selectedState}
                  </span>
                  <span className="text-xs text-gray-400">{data.region}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black leading-none tracking-tight text-white">
                {data.value}
              </span>
              <span className="mb-1.5 text-sm font-semibold text-[#3a9e48]">
                {data.metricLabel ?? 'obras'}
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((data.value / 120) * 100, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#3a9e48] to-[#5cc86a]"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Relativo à maior concentração nacional
            </p>
          </div>

          <div className="flex-1 px-6 py-5">
            <p className="text-sm leading-relaxed text-gray-300">
              {data.description}
            </p>
          </div>

          {data.cta && (
            <div className="px-6 pb-6">
              <a
                href={data.cta.href}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3a9e48] py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(58,158,72,0.3)] transition-all duration-200 hover:translate-y-[-1px] hover:bg-[#4db85e] hover:shadow-[0_0_30px_rgba(58,158,72,0.5)]"
              >
                {data.cta.label}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(58,158,72,0.2)] bg-[rgba(58,158,72,0.08)]"
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="#3a9e48"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="9" r="2.5" stroke="#3a9e48" strokeWidth="1.5" />
            </svg>
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-white">Clique em um estado</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Selecione qualquer estado do mapa para ver detalhes das operações
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
