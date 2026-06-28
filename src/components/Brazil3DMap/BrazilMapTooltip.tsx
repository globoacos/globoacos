'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  visible: boolean;
  x: number;
  y: number;
  stateName: string;
  sigla: string;
  value: number;
  metricLabel?: string;
}

export default function BrazilMapTooltip({
  visible, x, y, stateName, sigla, value, metricLabel = 'obras',
}: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="tooltip"
          initial={{ opacity: 0, scale: 0.88, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="pointer-events-none fixed z-50"
          style={{ left: x + 14, top: y - 48 }}
        >
          <div className="
            bg-[rgba(10,20,40,0.92)] backdrop-blur-md
            border border-[rgba(58,158,72,0.45)]
            rounded-xl px-4 py-2.5 shadow-2xl
            flex items-center gap-3
          ">
            {/* Indicador de cor */}
            <span className="w-2.5 h-2.5 rounded-full bg-[#3a9e48] shadow-[0_0_8px_rgba(58,158,72,0.8)] flex-shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm tracking-tight">
                {stateName}
                <span className="ml-1.5 text-[#3a9e48] font-semibold text-xs">({sigla})</span>
              </span>
              <span className="text-[#7a8a9a] text-xs mt-0.5">
                <span className="text-white font-semibold">{value}</span> {metricLabel}
              </span>
            </div>
          </div>
          {/* Seta */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 rotate-45
            bg-[rgba(10,20,40,0.92)] border-r border-b border-[rgba(58,158,72,0.45)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
