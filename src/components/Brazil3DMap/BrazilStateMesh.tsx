'use client';

import { Edges } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { memo, useRef } from 'react';
import * as THREE from 'three';
import { BORDER_COLOR, STATE_HOVER_COLOR, STATE_SELECT_COLOR, brazilStatesData } from './brazilStatesData';
import type { StateGeometry } from './geojsonToShapes';

interface Props {
  state: StateGeometry;
  hovered: boolean;
  selected: boolean;
  onHover: (stateId: string | null, event?: ThreeEvent<PointerEvent>) => void;
  onSelect: (stateId: string) => void;
}

function BrazilStateMesh({ state, hovered, selected, onHover, onSelect }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const data = brazilStatesData[state.stateId];
  const active = hovered || selected;
  const targetColor = selected ? STATE_SELECT_COLOR : hovered ? STATE_HOVER_COLOR : (data?.color ?? '#17345b');

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, active ? 0.12 : 0, 9, delta);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={state.geometry}
      castShadow
      receiveShadow
      onPointerMove={(event) => { event.stopPropagation(); onHover(state.stateId, event); }}
      onPointerOut={(event) => { event.stopPropagation(); onHover(null); }}
      onClick={(event) => { event.stopPropagation(); onSelect(state.stateId); }}
    >
      <meshBasicMaterial color={active ? targetColor : '#2f69a7'} toneMapped={false} />
      <Edges color={active ? '#8df1a0' : BORDER_COLOR} threshold={12} />
    </mesh>
  );
}

export default memo(BrazilStateMesh);
