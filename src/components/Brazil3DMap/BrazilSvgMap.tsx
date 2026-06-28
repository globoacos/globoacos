'use client';

import { useEffect, useMemo, useState } from 'react';
import { brazilStatesData } from './brazilStatesData';
import type { GeoFeature } from './geojsonToShapes';
import type { CityGalleryItem } from './galleryTypes';
import { publicPath } from '@/lib/publicPath';

interface Props {
  selectedState: string | null;
  cities: CityGalleryItem[];
  selectedCity: CityGalleryItem | null;
  onCitySelect: (city: CityGalleryItem) => void;
  onSelect: (stateId: string) => void;
  onHover: (stateId: string | null, x?: number, y?: number) => void;
}

interface GeoCollection { type: 'FeatureCollection'; features: GeoFeature[]; }

const IBGE_STATE_CODES: Record<string, string> = {
  '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
  '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL',
  '28': 'SE', '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP', '41': 'PR',
  '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF',
};

function projectPoint([lon, lat]: number[]): [number, number] {
  const x = 40 + ((lon + 74) / 45.5) * 560;
  const y = 40 + ((5.3 - lat) / 39.1) * 480;
  return [x, y];
}

function project(point: number[]) {
  const [x, y] = projectPoint(point);
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
}

function ringPath(ring: number[][]) {
  return ring.map((point, index) => `${index === 0 ? 'M' : 'L'} ${project(point)}`).join(' ') + ' Z';
}

function featurePath(feature: GeoFeature) {
  if (feature.geometry.type === 'Polygon') {
    return (feature.geometry.coordinates as number[][][]).map(ringPath).join(' ');
  }
  return (feature.geometry.coordinates as number[][][][])
    .flatMap((polygon) => polygon.map(ringPath))
    .join(' ');
}

export default function BrazilSvgMap({ selectedState, cities, selectedCity, onCitySelect, onSelect, onHover }: Props) {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityGalleryItem | null>(null);

  useEffect(() => {
    let active = true;
    fetch(publicPath('/brazil-states.geojson'))
      .then((response) => response.json() as Promise<GeoCollection>)
      .then((data) => active && setFeatures(data.features));
    return () => { active = false; };
  }, []);

  const states = useMemo(() => features.map((feature) => ({
    feature,
    id: String(feature.properties.sigla ?? IBGE_STATE_CODES[String(feature.properties.codarea)] ?? ''),
    path: featurePath(feature),
  })).filter(({ id }) => Boolean(id)), [features]);
  const cityPoints = useMemo(() => {
    const points = cities.filter((city) => city.coordinates).map((city) => {
      const [anchorX, anchorY] = projectPoint(city.coordinates as [number, number]);
      return { city, anchorX, anchorY: anchorY - 5, x: anchorX, y: anchorY - 5 };
    });
    for (let iteration = 0; iteration < 24; iteration += 1) {
      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          let dx = points[j].x - points[i].x;
          let dy = points[j].y - points[i].y;
          let distance = Math.hypot(dx, dy);
          if (distance >= 18) continue;
          if (distance < 0.01) {
            const angle = (i * 2.4 + j * 1.7) % (Math.PI * 2);
            dx = Math.cos(angle); dy = Math.sin(angle); distance = 1;
          }
          const force = (18 - distance) * 0.28;
          const ux = dx / distance; const uy = dy / distance;
          points[i].x -= ux * force; points[i].y -= uy * force;
          points[j].x += ux * force; points[j].y += uy * force;
        }
      }
      points.forEach((point) => {
        point.x += (point.anchorX - point.x) * 0.035;
        point.y += (point.anchorY - point.y) * 0.035;
      });
    }
    return points;
  }, [cities]);
  const hoveredCityPoint = hoveredCity ? cityPoints.find(({ city }) => city.city === hoveredCity.city) : null;

  const setHover = (id: string | null, x?: number, y?: number) => {
    setHovered(id);
    onHover(id, x, y);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center px-0 pb-2 pt-5">
      <svg className="h-full w-full scale-[1.13] overflow-visible" viewBox="40 20 560 520" role="img" aria-label="Mapa interativo dos estados do Brasil" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="map-shadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="12" stdDeviation="11" floodColor="#000814" floodOpacity="0.72" />
          </filter>
          <filter id="state-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#62d775" floodOpacity="0.8" />
          </filter>
          <linearGradient id="state-fill" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#315f93" />
            <stop offset="0.55" stopColor="#1d4775" />
            <stop offset="1" stopColor="#102d51" />
          </linearGradient>
        </defs>
        <g filter="url(#map-shadow)">
          {states.map(({ id, path }) => {
            const active = hovered === id || selectedState === id;
            const data = brazilStatesData[id];
            return (
              <g key={id} className="cursor-pointer transition-transform duration-200 ease-out" transform={active ? 'translate(0 -5)' : undefined}>
                <path d={path} transform="translate(0 7)" fill="#07182c" stroke="#07182c" strokeWidth="2.6" fillRule="evenodd" />
                <path
                  d={path}
                  className="outline-none focus:outline-none"
                  fill={selectedState === id ? '#3a9e48' : active ? '#3976b5' : 'url(#state-fill)'}
                  stroke={active ? '#9af3a8' : '#5c8aba'}
                  strokeWidth={active ? 2.2 : 1.15}
                  vectorEffect="non-scaling-stroke"
                  fillRule="evenodd"
                  filter={active ? 'url(#state-glow)' : undefined}
                  role="button"
                  tabIndex={0}
                  aria-label={`${data?.name ?? id}, ${data?.value ?? 0} ${data?.metricLabel ?? 'obras'}`}
                  onPointerMove={(event) => setHover(id, event.clientX, event.clientY)}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => onSelect(id)}
                  onFocus={() => setHover(id)}
                  onBlur={() => setHover(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(id);
                    }
                  }}
                />
              </g>
            );
          })}
        </g>
        {selectedState && cityPoints.map(({ city, anchorX, anchorY, x, y }) => {
          const active = selectedCity?.city === city.city || hoveredCity?.city === city.city;
          return (
            <g key={city.file}>
              {Math.hypot(x - anchorX, y - anchorY) > 2 && <line x1={anchorX} y1={anchorY} x2={x} y2={y} stroke="#76d984" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.45" vectorEffect="non-scaling-stroke" />}
              <g
                transform={`translate(${x} ${y})`}
                className="cursor-pointer outline-none"
                role="button"
                tabIndex={0}
                aria-label={`${city.label} - ${selectedState}`}
                onPointerEnter={() => setHoveredCity(city)}
                onPointerLeave={() => setHoveredCity(null)}
                onFocus={() => setHoveredCity(city)}
                onBlur={() => setHoveredCity(null)}
                onClick={(event) => { event.stopPropagation(); onCitySelect(city); }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onCitySelect(city);
                  }
                }}
              >
                <circle r="13" fill="transparent" />
                <circle r={active ? 7 : 5.5} fill="#071522" stroke="#7bea8c" strokeWidth={active ? 2 : 1.4} vectorEffect="non-scaling-stroke" />
                <circle r={active ? 3.5 : 2.8} fill="#78e989" />
                {active && <circle r="8" fill="none" stroke="#78e989" strokeWidth="1" opacity="0.7"><animate attributeName="r" values="7;13;7" dur="1.5s" repeatCount="indefinite" /><animate attributeName="opacity" values=".8;0;.8" dur="1.5s" repeatCount="indefinite" /></circle>}
              </g>
            </g>
          );
        })}
        {hoveredCity && hoveredCityPoint && selectedState && (() => {
          const { x, y } = hoveredCityPoint;
          const toRight = x < 420;
          const labelX = toRight ? x + 28 : x - 218;
          const lineEnd = toRight ? labelX : labelX + 190;
          const label = `${hoveredCity.label} - ${selectedState}`;
          return (
            <g pointerEvents="none" aria-hidden="true">
              <path d={`M ${x} ${y} Q ${x + (toRight ? 16 : -16)} ${y - 18}, ${lineEnd} ${y - 18}`} fill="none" stroke="#72df82" strokeWidth="1.5" strokeDasharray="5 6" vectorEffect="non-scaling-stroke"><animate attributeName="stroke-dashoffset" from="22" to="0" dur=".9s" repeatCount="indefinite" /></path>
              <g transform={`translate(${labelX} ${y - 34})`}>
                <rect width="190" height="32" rx="16" fill="#071522" fillOpacity="0.96" stroke="#72df82" strokeOpacity="0.5" />
                <circle cx="16" cy="16" r="4" fill="#72df82" />
                <text x="29" y="20" fill="#ffffff" fontSize={label.length > 25 ? 8 : 10} fontWeight="700">{label}</text>
              </g>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
