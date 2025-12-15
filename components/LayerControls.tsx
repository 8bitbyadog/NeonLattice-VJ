import React from 'react';
import { Layer, VisualizerType, BlendingMode } from '../types';
import { VISUALIZER_OPTIONS, BLENDING_OPTIONS } from '../constants';
import { Trash2, Eye, EyeOff, Plus, Scissors, Music, Cable } from 'lucide-react';

interface Props {
  layers: Layer[];
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  addLayer: () => void;
}

const LayerControls: React.FC<Props> = ({ layers, updateLayer, removeLayer, addLayer }) => {
  return (
    <div className="bg-black/80 backdrop-blur-md p-4 border-l border-cyan-500/30 h-full overflow-y-auto text-xs text-cyan-100 w-80 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold tracking-widest text-cyan-400">LAYERS</h2>
        <button 
          onClick={addLayer}
          className="p-1 px-3 bg-cyan-900 hover:bg-cyan-700 text-white rounded flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> ADD
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {layers.map((layer) => (
          <div key={layer.id} className="border border-white/10 p-3 rounded bg-white/5 hover:bg-white/10 transition-colors">
            
            {/* Header: Type + Visibility + Delete */}
            <div className="flex justify-between items-center mb-2">
              <select 
                value={layer.type}
                onChange={(e) => updateLayer(layer.id, { type: e.target.value as VisualizerType })}
                className="bg-black border border-cyan-900 rounded p-1 text-cyan-400 w-32"
              >
                {VISUALIZER_OPTIONS.map(opt => (
                  <option key={opt.type} value={opt.type}>{opt.label}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button onClick={() => updateLayer(layer.id, { visible: !layer.visible })} className="text-gray-400 hover:text-white">
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => removeLayer(layer.id)} className="text-red-900 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-2">
              
              {/* Reactivity Toggles */}
              <div className="col-span-2 flex gap-4 my-1 p-1 bg-black/20 rounded">
                 <label className="flex items-center gap-1 cursor-pointer">
                   <input 
                    type="checkbox" 
                    checked={layer.audioReactive}
                    onChange={(e) => updateLayer(layer.id, { audioReactive: e.target.checked })}
                    className="accent-green-500"
                   />
                   <span className="text-[9px] text-gray-400 uppercase font-bold flex gap-1 items-center">
                     <Music size={10} /> Audio
                   </span>
                 </label>

                 <label className="flex items-center gap-1 cursor-pointer">
                   <input 
                    type="checkbox" 
                    checked={layer.midiReactive}
                    onChange={(e) => updateLayer(layer.id, { midiReactive: e.target.checked })}
                    className="accent-yellow-500"
                   />
                   <span className="text-[9px] text-gray-400 uppercase font-bold flex gap-1 items-center">
                     <Cable size={10} /> MIDI
                   </span>
                 </label>
              </div>

              {/* Blending */}
              <div className="col-span-2">
                <label className="block text-gray-500 text-[10px] uppercase">Blend Mode</label>
                <select 
                  value={layer.blending}
                  onChange={(e) => updateLayer(layer.id, { blending: e.target.value as BlendingMode })}
                  className="w-full bg-black border border-white/10 rounded px-1"
                >
                  {BLENDING_OPTIONS.map(opt => (
                    <option key={opt.mode} value={opt.mode}>{opt.mode}</option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                 <label className="block text-gray-500 text-[10px] uppercase">Tint</label>
                 <input 
                  type="color" 
                  value={layer.color}
                  onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                  className="w-full h-6 bg-transparent cursor-pointer"
                 />
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-gray-500 text-[10px] uppercase">Opacity</label>
                <input 
                  type="range" min="0" max="1" step="0.01"
                  value={layer.opacity}
                  onChange={(e) => updateLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Scale */}
              <div>
                <label className="block text-gray-500 text-[10px] uppercase">React Scale</label>
                <input 
                  type="range" min="0" max="5" step="0.1"
                  value={layer.scale}
                  onChange={(e) => updateLayer(layer.id, { scale: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Speed */}
              <div>
                <label className="block text-gray-500 text-[10px] uppercase">Speed</label>
                <input 
                  type="range" min="0" max="5" step="0.1"
                  value={layer.speed}
                  onChange={(e) => updateLayer(layer.id, { speed: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
              
              {/* Chroma Key Section */}
              <div className="col-span-2 border-t border-white/10 pt-2 mt-1">
                 <div className="flex items-center justify-between mb-1">
                   <label className="text-[10px] text-pink-400 uppercase font-bold flex items-center gap-1">
                     <Scissors size={10} /> Chroma Mask
                   </label>
                   <input 
                    type="checkbox"
                    checked={layer.chromaKeyEnabled}
                    onChange={(e) => updateLayer(layer.id, { chromaKeyEnabled: e.target.checked })}
                    className="accent-pink-500"
                   />
                 </div>
                 
                 {layer.chromaKeyEnabled && (
                   <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-500 text-[9px] uppercase">Key Color</label>
                        <input 
                          type="color" 
                          value={layer.chromaKeyColor}
                          onChange={(e) => updateLayer(layer.id, { chromaKeyColor: e.target.value })}
                          className="w-full h-4 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-[9px] uppercase">Threshold</label>
                        <input 
                          type="range" min="0" max="1" step="0.01"
                          value={layer.chromaKeyThreshold}
                          onChange={(e) => updateLayer(layer.id, { chromaKeyThreshold: parseFloat(e.target.value) })}
                          className="w-full accent-pink-500 h-4"
                        />
                      </div>
                   </div>
                 )}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerControls;