import * as THREE from 'three';
import { BlendingMode, VisualizerType } from './types';

export const VISUALIZER_OPTIONS: { type: VisualizerType; label: string; description: string }[] = [
  { type: 'GeometryPulse', label: 'Sacred Geometry', description: 'Mandala shapes breathing with bass.' },
  { type: 'SpectrumGrid', label: 'Spectrum City', description: '3D Towers reacting to frequency bands.' },
  { type: 'ParticleFlow', label: 'Particle Nebula', description: 'Flowing particles driven by transients.' },
  { type: 'TunnelWarp', label: 'Warp Tunnel', description: 'Infinite shader tunnel speed-controlled by BPM/Volume.' },
];

export const BLENDING_OPTIONS: { mode: BlendingMode; threeMode: THREE.Blending }[] = [
  { mode: 'Normal', threeMode: THREE.NormalBlending },
  { mode: 'Additive', threeMode: THREE.AdditiveBlending },
  { mode: 'Subtractive', threeMode: THREE.SubtractiveBlending },
  { mode: 'Multiply', threeMode: THREE.MultiplyBlending },
];

export const DEFAULT_LAYER_COLOR = '#00ffcc';
