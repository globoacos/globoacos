'use client';

import { ContactShadows, Environment } from '@react-three/drei';
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import BrazilStateMesh from './BrazilStateMesh';
import { featureToGeometry, type GeoFeature, type StateGeometry } from './geojsonToShapes';
import { publicPath } from '@/lib/publicPath';

interface Props {
  selectedState: string | null;
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

function MapModel({ selectedState, onSelect, onHover }: Props) {
  const group = useRef<THREE.Group>(null);
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(publicPath('/brazil-states.geojson'))
      .then((response) => {
        if (!response.ok) throw new Error(`GeoJSON indisponível (${response.status})`);
        return response.json() as Promise<GeoCollection>;
      })
      .then((data) => active && setFeatures(data.features))
      .catch((error) => console.error('[Brazil3DMap]', error));
    return () => { active = false; };
  }, []);

  const states = useMemo(
    () => features.map((feature) => {
      const stateId = String(feature.properties.sigla ?? IBGE_STATE_CODES[String(feature.properties.codarea)] ?? '');
      return featureToGeometry(feature, stateId);
    }).filter((state): state is StateGeometry => Boolean(state?.stateId)),
    [features],
  );

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -0.12 + pointer.y * 0.035, 3, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.055, 3, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -0.025 - pointer.x * 0.02, 3, delta);
  });

  const handleHover = (stateId: string | null, event?: ThreeEvent<PointerEvent>) => {
    setHoveredState(stateId);
    document.body.style.cursor = stateId ? 'pointer' : 'default';
    onHover(stateId, event?.nativeEvent.clientX, event?.nativeEvent.clientY);
  };

  return (
    <>
      <color attach="background" args={['#07111d']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[2.5, 4, 6]} intensity={2.6} color="#d9edff" castShadow />
      <pointLight position={[-4, -1, 4]} intensity={18} color="#3a9e48" distance={8} />
      <group ref={group} position={[0, 0.05, 0]}>
        {states.map((state) => (
          <BrazilStateMesh key={state.stateId} state={state} hovered={hoveredState === state.stateId} selected={selectedState === state.stateId} onHover={handleHover} onSelect={onSelect} />
        ))}
      </group>
      <ContactShadows position={[0, -2.15, -0.28]} opacity={0.32} scale={7} blur={2.8} far={5} />
      <Environment preset="city" environmentIntensity={0.32} />
    </>
  );
}

export default function BrazilMapCanvas(props: Props) {
  return (
    <Canvas dpr={[1, 1.65]} camera={{ position: [0, -0.1, 6.1], fov: 43, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} shadows onPointerMissed={() => props.onHover(null)}>
      <MapModel {...props} />
    </Canvas>
  );
}
