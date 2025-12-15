import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioService } from '../services/audioService';
import { midiService } from '../services/midiService';
import { AudioData, MidiData } from '../types';

// Mutable ref object to avoid re-renders but allow access in useFrame
export const useMusicEngine = () => {
  const musicState = useRef<{
    audio: AudioData;
    midi: MidiData;
  }>({
    audio: { low: 0, mid: 0, high: 0, volume: 0, dataArray: new Uint8Array(0) },
    midi: { lastNote: 0, lastVelocity: 0, ccValues: {} }
  });

  useEffect(() => {
    // Initialize services
    const init = async () => {
      // Audio is initialized on user gesture usually, handled in UI
      await midiService.initialize();
      
      midiService.onNoteOn = (note, vel) => {
        musicState.current.midi.lastNote = note;
        musicState.current.midi.lastVelocity = vel;
      };

      midiService.onControlChange = (cc, val) => {
        musicState.current.midi.ccValues[cc] = val;
      };
    };
    init();
  }, []);

  useFrame(() => {
    if (audioService.isReady) {
      musicState.current.audio = audioService.getAnalysis();
    }
  });

  return musicState;
};