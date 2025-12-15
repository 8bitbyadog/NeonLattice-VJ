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

const GeometryPulse: React.FC<Props> = ({ layer, musicData, globalAudioEnabled, globalMidiEnabled }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Mesh[]>([]);
  const midiImpactRef = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;

    // --- GATE LOGIC ---
    const audioActive = globalAudioEnabled && layer.audioReactive;
    const midiActive = globalMidiEnabled && layer.midiReactive;

    // Fetch data or use defaults if disabled
    const { low, mid, high } = audioActive ? musicData.current.audio : { low: 0, mid: 0, high: 0 };
    const { lastVelocity, ccValues } = midiActive ? musicData.current.midi : { lastVelocity: 0, ccValues: {} };
    // ------------------

    // MIDI Trigger Logic
    midiImpactRef.current *= 0.9;
    if (lastVelocity > 0) {
      midiImpactRef.current = lastVelocity / 127;
      musicData.current.midi.lastVelocity = 0; 
    }

    // CC 1 controls rotation
    const rotationKnob = (ccValues[1] || 0) / 127; 

    // Animation
    const rotationSpeed = (0.001 + (mid * 0.01)) * layer.speed + (rotationKnob * 0.1);
    groupRef.current.rotation.z += rotationSpeed;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;

    rings.current.forEach((mesh, i) => {
      const baseScale = 1 + (i * 0.5);
      const beatScale = 1 + (low * layer.scale * 2) + (midiImpactRef.current * 3); 
      
      mesh.scale.setScalar(baseScale * beatScale);
      mesh.rotation.z += (i % 2 === 0 ? 1 : -1) * 0.002 * (1 + high * 5);
      
      if (mesh.material instanceof THREE.MeshBasicMaterial) {
        const col = new THREE.Color(layer.color);
        const hueShift = (i * 0.1); 
        
        col.offsetHSL(hueShift, 0, (low * 0.5) + midiImpactRef.current); 
        
        mesh.material.color = col;
        mesh.material.opacity = layer.opacity;

        updateChromaKeyUniforms(mesh.material, layer);
      }
    });
  });

  const blending = BLENDING_OPTIONS.find(b => b.mode === layer.blending)?.threeMode || THREE.NormalBlending;

  return (
    <group ref={groupRef}>
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i} 
          ref={(el) => { if (el) rings.current[i] = el; }}
          rotation={[0, 0, 0]}
        >
          <torusGeometry args={[1 + i * 0.5, 0.02 + (i*0.01), 16, 100]} />
          <meshBasicMaterial 
            color={layer.color} 
            transparent 
            opacity={layer.opacity}
            blending={blending}
            wireframe
            onBeforeCompile={(shader) => {
              injectChromaKey(shader);
              // @ts-ignore
              rings.current[i].material.userData.shader = shader;
            }}
          />
        </mesh>
      ))}
    </group>
  );
};

export default GeometryPulse;