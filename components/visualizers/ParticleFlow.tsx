import React, { useRef, useMemo } from 'react';
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

const COUNT = 2000;

const ParticleFlow: React.FC<Props> = ({ layer, musicData, globalAudioEnabled, globalMidiEnabled }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(COUNT * 3);
    const vels = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const baseColor = new THREE.Color(layer.color);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      temp[i3] = (Math.random() - 0.5) * 20;
      temp[i3 + 1] = (Math.random() - 0.5) * 20;
      temp[i3 + 2] = (Math.random() - 0.5) * 20;
      
      vels[i3] = (Math.random() - 0.5) * 0.01;
      vels[i3 + 1] = (Math.random() - 0.5) * 0.01;
      vels[i3 + 2] = (Math.random() - 0.5) * 0.01;

      const c = baseColor.clone().offsetHSL((Math.random() - 0.5) * 0.2, 0, 0);
      colors[i3] = c.r;
      colors[i3+1] = c.g;
      colors[i3+2] = c.b;
    }
    return { pos: temp, vel: vels, colors };
  }, [layer.color]); 

  useFrame((state) => {
    if (!pointsRef.current) return;

    // --- GATE LOGIC ---
    const audioActive = globalAudioEnabled && layer.audioReactive;
    const { high, mid } = audioActive ? musicData.current.audio : { high: 0, mid: 0 };
    // ------------------

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // If not active, high is 0, so explosion is 0.
    const explosion = high * 0.5 * layer.scale; 
    const speedBase = layer.speed;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      positions[i3] += particles.vel[i3] * (1 + explosion * 10);
      positions[i3 + 1] += particles.vel[i3 + 1] * (1 + explosion * 10);
      // Constant movement based on speed layer setting + extra burst
      positions[i3 + 2] += particles.vel[i3 + 2] * (1 + explosion * 10) + (speedBase * 0.1);

      if (positions[i3 + 2] > 10) positions[i3 + 2] = -20;
      if (Math.abs(positions[i3]) > 20) positions[i3] *= -0.9;
      if (Math.abs(positions[i3+1]) > 20) positions[i3+1] *= -0.9;
      
      const x = positions[i3];
      const z = positions[i3+2];
      
      // Only twist if active
      if (audioActive) {
          positions[i3] = x * Math.cos(mid * 0.1) - z * Math.sin(mid * 0.1);
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    if (materialRef.current) {
         materialRef.current.opacity = layer.opacity;
         materialRef.current.size = 0.05 + (high * 0.2);
         updateChromaKeyUniforms(materialRef.current, layer);
    }
  });

  const blending = BLENDING_OPTIONS.find(b => b.mode === layer.blending)?.threeMode || THREE.AdditiveBlending;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.pos.length / 3}
          array={particles.pos}
          itemSize={3}
        />
        <bufferAttribute 
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        ref={materialRef}
        vertexColors
        size={0.1} 
        transparent 
        opacity={layer.opacity} 
        blending={blending}
        depthWrite={false}
        onBeforeCompile={(shader) => {
            injectChromaKey(shader);
            if (materialRef.current) materialRef.current.userData.shader = shader;
        }}
      />
    </points>
  );
};

export default ParticleFlow;