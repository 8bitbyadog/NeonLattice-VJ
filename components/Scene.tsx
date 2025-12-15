import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { Layer, AudioData, MidiData } from '../types';
import { useMusicEngine } from '../hooks/useMusicEngine';
import GeometryPulse from './visualizers/GeometryPulse';
import SpectrumGrid from './visualizers/SpectrumGrid';
import ParticleFlow from './visualizers/ParticleFlow';
import TunnelWarp from './visualizers/TunnelWarp';

interface Props {
  layers: Layer[];
  enableEffects: boolean;
  backgroundColor: string;
  globalAudioEnabled: boolean;
  globalMidiEnabled: boolean;
}

interface VisualizerProps {
  layer: Layer;
  musicData: React.MutableRefObject<{ audio: AudioData; midi: MidiData }>;
  globalAudioEnabled: boolean;
  globalMidiEnabled: boolean;
}

const VisualizerRenderer: React.FC<VisualizerProps> = (props) => {
  if (!props.layer.visible) return null;

  switch (props.layer.type) {
    case 'GeometryPulse': return <GeometryPulse {...props} />;
    case 'SpectrumGrid': return <SpectrumGrid {...props} />;
    case 'ParticleFlow': return <ParticleFlow {...props} />;
    case 'TunnelWarp': return <TunnelWarp {...props} />;
    default: return null;
  }
};

const SceneContent: React.FC<Props> = ({ layers, enableEffects, globalAudioEnabled, globalMidiEnabled }) => {
  const musicData = useMusicEngine();

  return (
    <>
      <OrbitControls makeDefault />
      
      <group>
        {layers.map(layer => (
          <VisualizerRenderer 
            key={layer.id} 
            layer={layer} 
            musicData={musicData} 
            globalAudioEnabled={globalAudioEnabled}
            globalMidiEnabled={globalMidiEnabled}
          />
        ))}
      </group>

      {enableEffects && (
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          <ChromaticAberration offset={[0.002, 0.002]} />
        </EffectComposer>
      )}
    </>
  );
};

export const Scene: React.FC<Props> = (props) => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 10], fov: 75 }}
      style={{ background: props.backgroundColor }}
      gl={{ preserveDrawingBuffer: true }} // Important for screenshots/streaming
    >
      <SceneContent {...props} />
    </Canvas>
  );
};