import * as THREE from 'three';

export type VisualizerType = 'GeometryPulse' | 'SpectrumGrid' | 'ParticleFlow' | 'TunnelWarp';

export type BlendingMode = 'Normal' | 'Additive' | 'Subtractive' | 'Multiply';

export interface Layer {
  id: string;
  type: VisualizerType;
  blending: BlendingMode;
  opacity: number;
  color: string;
  visible: boolean;
  scale: number;
  speed: number;
  // Reactivity Toggles
  audioReactive: boolean;
  midiReactive: boolean;
  // Chroma Key / Masking
  chromaKeyEnabled: boolean;
  chromaKeyColor: string;
  chromaKeyThreshold: number;
}

export interface AudioData {
  low: number;  // 0-1 Bass
  mid: number;  // 0-1 Mids/Vocals
  high: number; // 0-1 Treble/Hats
  volume: number; // 0-1 RMS
  dataArray: Uint8Array;
}

export interface MidiData {
  lastNote: number;
  lastVelocity: number;
  ccValues: Record<number, number>; // Map CC number to value 0-127
}