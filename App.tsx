import React, { useState, useCallback, useEffect } from 'react';
import { Scene } from './components/Scene';
import LayerControls from './components/LayerControls';
import { Layer, VisualizerType } from './types';
import { DEFAULT_LAYER_COLOR } from './constants';
import { audioService } from './services/audioService';
import { Maximize, Mic, Monitor, Palette, Music, Cable } from 'lucide-react';

const App: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: '1',
      type: 'GeometryPulse',
      blending: 'Additive',
      opacity: 1.0,
      color: '#ff0055',
      visible: true,
      scale: 1.0,
      speed: 1.0,
      audioReactive: true,
      midiReactive: true,
      chromaKeyEnabled: false,
      chromaKeyColor: '#000000',
      chromaKeyThreshold: 0.1
    },
     {
      id: '2',
      type: 'SpectrumGrid',
      blending: 'Additive',
      opacity: 0.8,
      color: '#00ffff',
      visible: true,
      scale: 1.5,
      speed: 0.5,
      audioReactive: true,
      midiReactive: true,
      chromaKeyEnabled: false,
      chromaKeyColor: '#000000',
      chromaKeyThreshold: 0.1
    }
  ]);
  
  const [bgColor, setBgColor] = useState('#050505');
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  
  // Global Toggles
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(true);
  const [globalMidiEnabled, setGlobalMidiEnabled] = useState(true);

  const addLayer = useCallback(() => {
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'ParticleFlow',
      blending: 'Additive',
      opacity: 1.0,
      color: DEFAULT_LAYER_COLOR,
      visible: true,
      scale: 1.0,
      speed: 1.0,
      audioReactive: true,
      midiReactive: true,
      chromaKeyEnabled: false,
      chromaKeyColor: '#000000',
      chromaKeyThreshold: 0.1
    };
    setLayers(prev => [...prev, newLayer]);
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const startAudio = async () => {
    try {
      await audioService.initialize();
      setAudioStarted(true);
    } catch (e) {
      alert("Microphone access denied. Visualizers will remain static.");
    }
  };

  // Keyboard shortcut to hide UI for performance
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'h') setUiVisible(v => !v);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Scene 
          layers={layers} 
          enableEffects={effectsEnabled}
          backgroundColor={bgColor}
          globalAudioEnabled={globalAudioEnabled}
          globalMidiEnabled={globalMidiEnabled}
        />
      </div>

      {/* Main UI Overlay */}
      <div className={`z-10 relative flex w-full h-full pointer-events-none transition-opacity duration-500 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Left Sidebar: Global Controls */}
        <div className="flex flex-col justify-between p-4 pointer-events-auto w-64">
           <div>
             <h1 className="text-2xl font-black text-cyan-400 tracking-tighter mb-1 select-none shadow-cyan-500 drop-shadow-sm">NEON LATTICE</h1>
             <p className="text-[10px] text-cyan-700 font-mono mb-6">ABLETON LINKED VISUALIZER</p>
             
             {!audioStarted ? (
               <button 
                onClick={startAudio}
                className="w-full mb-4 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-4 rounded flex items-center justify-center gap-2 animate-pulse border-2 border-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
               >
                 <Mic size={18} /> INITIALIZE AUDIO
               </button>
             ) : (
                <div className="mb-4 text-xs text-green-500 border border-green-900 bg-green-900/20 p-2 rounded text-center">
                  AUDIO ENGINE READY
                </div>
             )}

             <div className="space-y-4 bg-black/50 p-4 rounded border border-white/10 backdrop-blur-sm">
                
                {/* Global Reactivity Toggles */}
                <div>
                   <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 block">Global Reactivity</label>
                   
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-white">
                        <Music size={14} className={globalAudioEnabled ? "text-green-400" : "text-gray-600"} />
                        Audio Input
                      </div>
                      <input 
                        type="checkbox" 
                        checked={globalAudioEnabled} 
                        onChange={e => setGlobalAudioEnabled(e.target.checked)}
                        className="accent-green-500"
                      />
                   </div>

                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-white">
                        <Cable size={14} className={globalMidiEnabled ? "text-yellow-400" : "text-gray-600"} />
                        MIDI Input
                      </div>
                      <input 
                        type="checkbox" 
                        checked={globalMidiEnabled} 
                        onChange={e => setGlobalMidiEnabled(e.target.checked)}
                        className="accent-yellow-500"
                      />
                   </div>
                </div>

                <div className="h-px bg-white/10 my-2" />

                {/* Background (Chroma) */}
                <div>
                   <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-2">
                     <Palette size={12}/> Background (Chroma)
                   </label>
                   <div className="flex gap-2 mt-1">
                     <input 
                      type="color" 
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-none"
                     />
                     <button onClick={() => setBgColor('#00FF00')} className="bg-green-600 w-8 h-8 rounded text-[8px] text-black font-bold">GRN</button>
                     <button onClick={() => setBgColor('#0000FF')} className="bg-blue-600 w-8 h-8 rounded text-[8px] text-white font-bold">BLU</button>
                     <button onClick={() => setBgColor('#000000')} className="bg-black border border-white/20 w-8 h-8 rounded text-[8px] text-white font-bold">BLK</button>
                   </div>
                </div>

                {/* Post Processing Toggle */}
                <div className="flex items-center justify-between">
                   <label className="text-[10px] text-gray-400 uppercase font-bold">Post-FX (Bloom)</label>
                   <input 
                    type="checkbox" 
                    checked={effectsEnabled}
                    onChange={(e) => setEffectsEnabled(e.target.checked)}
                    className="accent-cyan-500"
                   />
                </div>
                
                <button onClick={toggleFullscreen} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded flex justify-center items-center gap-2">
                  <Maximize size={12} /> Toggle Fullscreen
                </button>
             </div>
           </div>

           <div className="text-[10px] text-gray-600">
             <p>Controls:</p>
             <p>[H] Hide UI</p>
             <p>[Mouse] Orbit Camera</p>
             <p>[Wheel] Zoom</p>
           </div>
        </div>

        {/* Right Sidebar: Layer Manager */}
        <div className="ml-auto pointer-events-auto h-full">
          <LayerControls 
            layers={layers}
            addLayer={addLayer}
            updateLayer={updateLayer}
            removeLayer={removeLayer}
          />
        </div>
      </div>
      
      {/* Hidden Toggle when UI is hidden */}
      {!uiVisible && (
        <button 
          onClick={() => setUiVisible(true)}
          className="absolute top-4 left-4 z-50 p-2 bg-white/10 text-white rounded hover:bg-white/20"
        >
          <Monitor size={20} />
        </button>
      )}
    </div>
  );
};

export default App;