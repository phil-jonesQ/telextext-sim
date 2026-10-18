import React from 'react';
import { CrtConfig } from '../types/teletext';
import { teletextAudio } from '../utils/audio';

interface CrtSettingsModalProps {
  isOpen: boolean;
  config: CrtConfig;
  onClose: () => void;
  onUpdateConfig: (newConfig: CrtConfig) => void;
}

export const CrtSettingsModal: React.FC<CrtSettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof CrtConfig) => {
    const updated = { ...config, [key]: !config[key] };
    if (key === 'soundEnabled') {
      teletextAudio.setEnabled(updated.soundEnabled);
    }
    if (key === 'ambientHum') {
      teletextAudio.toggleCrtHum(updated.ambientHum);
    }
    onUpdateConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-2xl shadow-2xl p-6 font-mono text-zinc-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <h3 className="text-base font-bold text-yellow-400">
            CRT & EMULATION SETTINGS
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 text-xs"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Scanlines */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <div className="font-bold text-zinc-100">CRT Scanlines</div>
              <div className="text-[10px] text-zinc-400">Horizontal cathode ray beam lines</div>
            </div>
            <button
              onClick={() => toggle('scanlines')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                config.scanlines ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {config.scanlines ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Tube Curvature */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <div className="font-bold text-zinc-100">Tube Curvature & Bezel</div>
              <div className="text-[10px] text-zinc-400">Convex curved glass screen & shadow frame</div>
            </div>
            <button
              onClick={() => toggle('curvature')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                config.curvature ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {config.curvature ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Phosphor Bloom */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <div className="font-bold text-zinc-100">Phosphor Glow & Bloom</div>
              <div className="text-[10px] text-zinc-400">Atmospheric cathode ray tube dispersion</div>
            </div>
            <button
              onClick={() => toggle('bloom')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                config.bloom ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {config.bloom ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* RGB Phosphor Grid */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <div className="font-bold text-zinc-100">RGB Subpixel Mask</div>
              <div className="text-[10px] text-zinc-400">Shadow-mask phosphor dot matrix</div>
            </div>
            <button
              onClick={() => toggle('rgbPhosphor')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                config.rgbPhosphor ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {config.rgbPhosphor ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <div className="font-bold text-zinc-100">Remote Click & Beep Audio</div>
              <div className="text-[10px] text-zinc-400">Synthesized relay clicks & page chimes</div>
            </div>
            <button
              onClick={() => toggle('soundEnabled')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                config.soundEnabled ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {config.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* 50Hz CRT Mains Hum */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <div className="font-bold text-zinc-100">50Hz CRT Flyback Hum</div>
              <div className="text-[10px] text-zinc-400">Subtle background transformer acoustic</div>
            </div>
            <button
              onClick={() => toggle('ambientHum')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                config.ambientHum ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {config.ambientHum ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* TheSportsDB Live Feed Config */}
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-emerald-400">Page 302: TheSportsDB Live Feed</div>
                <div className="text-[10px] text-zinc-400">English Premier League (ID: 4328)</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Polling runs every 18 seconds (rate limit: &lt;30/min). If using the default test key or when offline, realistic Premier League live matches and upcoming fixtures are simulated automatically.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-xs transition-colors"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
