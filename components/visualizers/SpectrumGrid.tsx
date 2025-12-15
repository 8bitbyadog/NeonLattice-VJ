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

const COUNT = 20;

const SpectrumGrid: React.FC<Props> = ({ layer, musicData, globalAudioEnabled, globalMidiEnabled }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    // --- GATE LOGIC ---
    const audioActive = globalAudioEnabled && layer.audioReactive;
    // SpectrumGrid mostly uses Audio, but we could hook MIDI to color or something later.
    
    const { dataArray, low } = audioActive ? musicData.current.audio : { dataArray: new Uint8Array(0), low: 0 };
    // ------------------

    let i = 0;
    for (let x = 0; x < COUNT; x++) {
      for (let z = 0; z < COUNT; z++) {
        // Fallback to 0 if no data
        const freqIndex = dataArray.length > 0 ? Math.floor(((x * COUNT) + z) % (dataArray.length / 2)) : 0;
        const value = dataArray.length > 0 ? dataArray[freqIndex] / 255.0 : 0;

        const xPos = (x - COUNT / 2) * 1.5;
        const zPos = (z - COUNT / 2) * 1.5;
        
        dummy.position.set(xPos, 0, zPos);
        // Base scale 0.1 so it doesn't disappear completely
        dummy.scale.set(1, Math.max(0.1, value * 10 * layer.scale), 1);
        dummy.updateMatrix();
        
        meshRef.current.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y += 0.001 * layer.speed;
    
    if (materialRef.current) {
       materialRef.current.opacity = layer.opacity;
       const c = new THREE.Color(layer.color);
       c.offsetHSL(0, 0, low * 0.2);
       materialRef.current.color = c;
       materialRef.current.emissive = c;
       materialRef.current.emissiveIntensity = low * 2;
       
       updateChromaKeyUniforms(materialRef.current, layer);
    }
  });

  const blending = BLENDING_OPTIONS.find(b => b.mode === layer.blending)?.threeMode || THREE.NormalBlending;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT * COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        ref={materialRef}
        color={layer.color} 
        transparent 
        opacity={layer.opacity}
        blending={blending}
        onBeforeCompile={(shader) => {
            injectChromaKey(shader);
            if (materialRef.current) materialRef.current.userData.shader = shader;
        }}
      />
    </instancedMesh>
  );
};

export default SpectrumGrid;