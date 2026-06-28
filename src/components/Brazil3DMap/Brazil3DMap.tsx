'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BrazilInfoPanel from './BrazilInfoPanel';
import BrazilMapTooltip from './BrazilMapTooltip';
import BrazilProjectsCarousel from './BrazilProjectsCarousel';
import BrazilSvgMap from './BrazilSvgMap';
import { brazilStatesData } from './brazilStatesData';
import type { CityGalleryItem, GalleryManifest } from './galleryTypes';
import { publicPath } from '@/lib/publicPath';

export default function Brazil3DMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [gallery, setGallery] = useState<GalleryManifest>({});
  const [selectedCity, setSelectedCity] = useState<CityGalleryItem | null>(null);

  useEffect(() => {
    let active = true;
    fetch(publicPath('/images/states/manifest.json'))
      .then((response) => response.json() as Promise<GalleryManifest>)
      .then((manifest) => active && setGallery(manifest));
    return () => { active = false; };
  }, []);
  const hoveredData = hoveredState ? brazilStatesData[hoveredState] : null;
  const cities = selectedState ? (gallery[selectedState.toLowerCase()] ?? []) : [];
  const selectState = (stateId: string | null) => {
    setSelectedState(stateId);
    setSelectedCity(null);
  };

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#050b14] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="map-grid absolute inset-0 -z-10 opacity-35" />
      <div className="absolute left-1/2 top-1/3 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#164b39]/20 blur-[120px]" />
      <div className="mx-auto max-w-7xl">
        <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10 max-w-2xl">
          <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#73d983]"><span className="h-px w-8 bg-[#3a9e48]" /> Presença nacional</div>
          <h1 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">Estruturas que conectam <span className="text-[#64c974]">todo o Brasil.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">Explore nossa atuação por estado e descubra onde engenharia, precisão e escala se encontram.</p>
        </motion.header>

        <div className="grid items-center gap-8 min-[1120px]:grid-cols-[260px_minmax(420px,1fr)_290px] min-[1120px]:gap-4 2xl:grid-cols-[300px_minmax(500px,1fr)_340px] 2xl:gap-8">
          <aside className="order-2 min-h-[390px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#091522]/70 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl min-[1120px]:order-1" aria-live="polite" aria-label="Detalhes do estado selecionado">
            <BrazilInfoPanel selectedState={selectedState} onClose={() => selectState(null)} />
          </aside>

          <div className="relative order-1 min-h-[590px] min-[1120px]:order-2 min-[1120px]:min-h-[650px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5fd470]/[0.07] shadow-[0_0_90px_rgba(58,158,72,0.08)]" />
            <div className="absolute left-2 top-3 z-10 hidden items-center gap-2 rounded-full border border-white/10 bg-[#07111d]/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 backdrop-blur-md sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-[#58c66a] shadow-[0_0_10px_#58c66a]" />27 unidades federativas</div>
            <label className="absolute right-2 top-3 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-[#07111d]/85 px-3 py-2 text-xs text-slate-400 shadow-xl backdrop-blur-md">
              <span className="hidden 2xl:inline">Estado</span>
              <select aria-label="Selecionar estado no mapa" className="max-w-[170px] bg-transparent font-semibold text-white outline-none" value={selectedState ?? ''} onChange={(event) => selectState(event.target.value || null)}>
                <option className="bg-[#081421]" value="">Selecione</option>
                {Object.entries(brazilStatesData).map(([id, data]) => <option className="bg-[#081421]" key={id} value={id}>{data.name} ({id})</option>)}
              </select>
            </label>
            <BrazilSvgMap selectedState={selectedState} cities={cities} selectedCity={selectedCity} onCitySelect={setSelectedCity} onSelect={(stateId) => selectState(stateId)} onHover={(stateId, x, y) => { setHoveredState(stateId); if (typeof x === 'number' && typeof y === 'number') setPointer({ x, y }); }} />
            <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] uppercase tracking-[0.2em] text-slate-600">Selecione um estado e explore os pontos</p>
          </div>

          <aside className="order-3 min-h-[390px] min-[1120px]:min-h-[500px]" aria-live="polite">
            <BrazilProjectsCarousel selectedState={selectedState} selectedCity={selectedCity} onClose={() => setSelectedCity(null)} />
          </aside>
        </div>
      </div>
      {hoveredData && hoveredState && <BrazilMapTooltip visible x={pointer.x} y={pointer.y} stateName={hoveredData.name} sigla={hoveredState} value={hoveredData.value} metricLabel={hoveredData.metricLabel} />}
    </section>
  );
}
