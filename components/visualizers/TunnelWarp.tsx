import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Layer, AudioData, MidiData } from '../../types';
import { BLENDING_OPTIONS } from '../../constants';
import { injectChromaKey, updateChromaKeyUniforms } from '../../utils/chromaKey';

interface Props {
  layer: Layer;
  musicData: React.MutableRefObject<{ audio: AudioData; midi: MidiData }>;
  globalAudioEnabled: boolean;
  globalMidiEnabled: boolean;
}

const TunnelWarp: React.FC<Props> = ({ layer, musicData, globalAudioEnabled, globalMidiEnabled }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // --- GATE LOGIC ---
    const audioActive = globalAudioEnabled && layer.audioReactive;
    const midiActive = globalMidiEnabled && layer.midiReactive;

    const { volume, low } = audioActive ? musicData.current.audio : { volume: 0, low: 0 };
    const { ccValues } = midiActive ? musicData.current.midi : { ccValues: {} };
    // ------------------

    // CC 2 controls Warp Speed
    const warpSpeedKnob = (ccValues[2] || 0) / 127; 
    
    // Base speed + CC Speed
    const totalSpeed = 0.005 * layer.speed + (warpSpeedKnob * 0.05);

    meshRef.current.rotation.z += totalSpeed;
    
    // Warp the scale based on bass and speed
    const scaleWarp = 1 + (low * 0.3 * layer.scale) + (warpSpeedKnob * 0.5);
    meshRef.current.scale.set(scaleWarp, scaleWarp, 1);

     if (materialRef.current) {
         const c = new THREE.Color(layer.color);
         if (volume > 0.8) c.set('#ffffff'); 
         materialRef.current.color = c;
         materialRef.current.opacity = layer.opacity;
         updateChromaKeyUniforms(materialRef.current, layer);
    }
  });

  const blending = BLENDING_OPTIONS.find(b => b.mode === layer.blending)?.threeMode || THREE.NormalBlending;

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[2, 2, 40, 32, 20, true]} />
      <meshBasicMaterial 
        ref={materialRef}
        color={layer.color} 
        wireframe 
        side={THREE.DoubleSide}
        transparent
        opacity={layer.opacity}
        blending={blending}
        onBeforeCompile={(shader) => {
            injectChromaKey(shader);
            if (materialRef.current) materialRef.current.userData.shader = shader;
        }}
      />
    </mesh>
  );
};

export default TunnelWarp;