import * as THREE from 'three';

// ─────────────────────────────────────────────
// GeoJSON Feature → Three.js ExtrudeGeometry
// Converte coordenadas lon/lat para espaço 3D
// centrado e normalizado para o Brasil
// ─────────────────────────────────────────────

export interface GeoFeature {
  type: string;
  properties: Record<string, unknown>;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

// Bounds aproximados do Brasil
const BRAZIL_BOUNDS = {
  minLon: -74.0,
  maxLon: -28.5,
  minLat: -33.8,
  maxLat:   5.3,
};

const LON_RANGE = BRAZIL_BOUNDS.maxLon - BRAZIL_BOUNDS.minLon; // 45.5
const LAT_RANGE = BRAZIL_BOUNDS.maxLat - BRAZIL_BOUNDS.minLat; // 39.1

// Mapeia lon/lat para coordenadas [-1..1] em X e [-aspect..aspect] em Y
function project(lon: number, lat: number, scale = 4.5): [number, number] {
  const x = ((lon - BRAZIL_BOUNDS.minLon) / LON_RANGE - 0.5) * scale;
  const y = ((lat - BRAZIL_BOUNDS.minLat) / LAT_RANGE - 0.5) * (scale * (LAT_RANGE / LON_RANGE));
  return [x, y];
}

// Cria um THREE.Shape a partir de um anel de coordenadas [lon, lat]
function ringToShape(ring: number[][]): THREE.Shape {
  const shape = new THREE.Shape();
  ring.forEach(([lon, lat], i) => {
    const [x, y] = project(lon, lat);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  return shape;
}

// Parâmetros de extrusão dos estados
const extrudeSettings: THREE.ExtrudeGeometryOptions = {
  depth: 0.08,
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.006,
  bevelSegments: 3,
};

export interface StateGeometry {
  /** sigla do estado (ex: 'SP') */
  stateId: string;
  /** nome completo do estado */
  stateName: string;
  /** geometria extrudada pronta para THREE.Mesh */
  geometry: THREE.ExtrudeGeometry;
  /** centróide aproximado [x, y] no espaço 3D para posicionar tooltip */
  centroid: [number, number];
}

/** Gera a geometria extrudada de um feature GeoJSON */
export function featureToGeometry(feature: GeoFeature, stateId: string): StateGeometry | null {
  const { geometry, properties } = feature;
  const stateName = (properties.name as string) || stateId;

  const shapes: THREE.Shape[] = [];
  let sumX = 0, sumY = 0, count = 0;

  try {
    if (geometry.type === 'Polygon') {
      const rings = geometry.coordinates as number[][][];
      const outerShape = ringToShape(rings[0]);
      // Furos (inner rings)
      rings.slice(1).forEach(ring => {
        outerShape.holes.push(ringToShape(ring));
      });
      shapes.push(outerShape);
      rings[0].forEach(([lon, lat]) => {
        const [x, y] = project(lon, lat);
        sumX += x; sumY += y; count++;
      });
    } else if (geometry.type === 'MultiPolygon') {
      const polys = geometry.coordinates as number[][][][];
      polys.forEach(poly => {
        const outerShape = ringToShape(poly[0]);
        poly.slice(1).forEach(ring => {
          outerShape.holes.push(ringToShape(ring));
        });
        shapes.push(outerShape);
        poly[0].forEach(([lon, lat]) => {
          const [x, y] = project(lon, lat);
          sumX += x; sumY += y; count++;
        });
      });
    }
  } catch (e) {
    console.warn(`[Brazil3DMap] Erro ao processar estado ${stateId}:`, e);
    return null;
  }

  if (shapes.length === 0) return null;

  // Une todos os shapes num único ExtrudeGeometry
  const geo = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
  geo.computeVertexNormals();

  const centroid: [number, number] = count > 0
    ? [sumX / count, sumY / count]
    : [0, 0];

  return { stateId, stateName, geometry: geo, centroid };
}
