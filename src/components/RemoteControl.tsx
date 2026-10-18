import React, { useState } from 'react';
import { FastextLinks } from '../types/teletext';
import { teletextAudio } from '../utils/audio';

interface RemoteControlProps {
  currentPage: number;
  currentSubPage: number;
  totalSubPages: number;
  fastext?: FastextLinks;
  isHeld: boolean;
  isRevealed: boolean;
  pendingDigits: string;
  onDigitPress: (digit: string) => void;
  onFastextPress: (color: 'red' | 'green' | 'yellow' | 'cyan') => void;
  onRevealToggle: () => void;
  onHoldToggle: () => void;
  onIndexPress: () => void;
  onPageChange: (delta: number) => void;
  onSubPageChange: (delta: number) => void;
  onClearInput: () => void;
}

export const RemoteControl: React.FC<RemoteControlProps> = ({
  fastext,
  isHeld,
  isRevealed,
  pendingDigits,
  onDigitPress,
  onFastextPress,
  onRevealToggle,
  onHoldToggle,
  onIndexPress,
  onPageChange,
  onSubPageChange,
  onClearInput,
}) => {
  const [ledActive, setLedActive] = useState<boolean>(false);

  const triggerLed = () => {
    setLedActive(true);
    teletextAudio.playRemoteClick();
    setTimeout(() => setLedActive(false), 120);
  };

  const handleDigit = (d: string) => {
    triggerLed();
    onDigitPress(d);
  };

  const handleFastext = (color: 'red' | 'green' | 'yellow' | 'cyan') => {
    triggerLed();
    onFastextPress(color);
  };

  const handleReveal = () => {
    triggerLed();
    onRevealToggle();
  };

  const handleHold = () => {
    triggerLed();
    onHoldToggle();
  };

  const handleIndex = () => {
    triggerLed();
    onIndexPress();
  };

  const handlePageStep = (delta: number) => {
    triggerLed();
    onPageChange(delta);
  };

  const handleSubStep = (delta: number) => {
    triggerLed();
    onSubPageChange(delta);
  };

  return (
    <div className="w-full max-w-[340px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 p-4 rounded-3xl border-4 border-neutral-700 shadow-2xl text-neutral-200 select-none mx-auto">
      {/* Remote Top Header with Infrared Diode & LED */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-700/60 mb-3 px-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${
              ledActive
                ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                : 'bg-red-950/80 border border-neutral-600'
            }`}
          />
          <span className="text-[11px] font-mono font-bold tracking-wider text-neutral-400">
            PHILIPS CEEFAX 80
          </span>
        </div>
        <div className="text-[10px] bg-neutral-950 px-2 py-0.5 rounded font-mono text-amber-400 border border-neutral-700">
          {pendingDigits ? `P${pendingDigits}...` : 'READY'}
        </div>
      </div>

      {/* 4 Colored Fastext Buttons */}
      <div className="mb-4">
        <div className="text-[9px] uppercase font-mono tracking-widest text-center text-neutral-400 mb-1.5">
          FASTEXT QUICK SELECT
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* Red Button */}
          <button
            onClick={() => handleFastext('red')}
            title={`Red: P${fastext?.red || 100}`}
            className="group relative flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 shadow-[0_3px_0_#991b1b] transition-all"
          >
            <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate w-full text-center">
              {fastext?.labels?.red || 'RED'}
            </span>
            <span className="text-[8px] text-red-200 font-mono">
              {fastext?.red ? `P${fastext.red}` : '---'}
            </span>
          </button>

          {/* Green Button */}
          <button
            onClick={() => handleFastext('green')}
            title={`Green: P${fastext?.green || 100}`}
            className="group relative flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-[0_3px_0_#065f46] transition-all"
          >
            <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate w-full text-center">
              {fastext?.labels?.green || 'GRN'}
            </span>
            <span className="text-[8px] text-emerald-200 font-mono">
              {fastext?.green ? `P${fastext.green}` : '---'}
            </span>
          </button>

          {/* Yellow Button */}
          <button
            onClick={() => handleFastext('yellow')}
            title={`Yellow: P${fastext?.yellow || 100}`}
            className="group relative flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 shadow-[0_3px_0_#b45309] transition-all text-neutral-900"
          >
            <span className="text-[10px] font-bold text-neutral-950 uppercase tracking-wider truncate w-full text-center">
              {fastext?.labels?.yellow || 'YEL'}
            </span>
            <span className="text-[8px] text-neutral-900 font-mono">
              {fastext?.yellow ? `P${fastext.yellow}` : '---'}
            </span>
          </button>

          {/* Cyan Button */}
          <button
            onClick={() => handleFastext('cyan')}
            title={`Cyan: P${fastext?.cyan || 100}`}
            className="group relative flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 shadow-[0_3px_0_#0e7490] transition-all"
          >
            <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate w-full text-center">
              {fastext?.labels?.cyan || 'CYN'}
            </span>
            <span className="text-[8px] text-cyan-200 font-mono">
              {fastext?.cyan ? `P${fastext.cyan}` : '---'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Teletext Function Keys */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* REVEAL */}
        <button
          onClick={handleReveal}
          className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all active:scale-95 flex flex-col items-center ${
            isRevealed
              ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
              : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          <span>REVEAL ?</span>
          <span className="text-[9px] font-normal text-neutral-400">
            {isRevealed ? 'UNMASKED' : 'CONCEAL'}
          </span>
        </button>

        {/* HOLD */}
        <button
          onClick={handleHold}
          className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all active:scale-95 flex flex-col items-center ${
            isHeld
              ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
              : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          <span>HOLD</span>
          <span className="text-[9px] font-normal text-neutral-400">
            {isHeld ? 'STOPPED' : 'CYCLE'}
          </span>
        </button>

        {/* INDEX (100) */}
        <button
          onClick={handleIndex}
          className="py-2 px-1 rounded-xl text-xs font-bold bg-neutral-800 text-cyan-400 border border-neutral-700 hover:bg-neutral-700 transition-all active:scale-95 flex flex-col items-center"
        >
          <span>INDEX</span>
          <span className="text-[9px] font-normal text-neutral-400">PAGE 100</span>
        </button>
      </div>

      {/* Numeric Keypad (1 to 9, 0, Page Up/Down) */}
      <div className="bg-neutral-950/70 p-3 rounded-2xl border border-neutral-800 mb-4">
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-lg font-mono font-bold text-neutral-100 shadow-[0_2px_0_#171717] transition-all border border-neutral-700/60 active:scale-95"
            >
              {digit}
            </button>
          ))}

          {/* Page Down */}
          <button
            onClick={() => handlePageStep(-1)}
            title="Previous Page"
            className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 border border-neutral-700/60 active:scale-95"
          >
            PAGE ▼
          </button>

          {/* Digit 0 */}
          <button
            onClick={() => handleDigit('0')}
            className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-lg font-mono font-bold text-neutral-100 shadow-[0_2px_0_#171717] transition-all border border-neutral-700/60 active:scale-95"
          >
            0
          </button>

          {/* Page Up */}
          <button
            onClick={() => handlePageStep(1)}
            title="Next Page"
            className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 border border-neutral-700/60 active:scale-95"
          >
            PAGE ▲
          </button>
        </div>
      </div>

      {/* Subpage and Clear Controls */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <button
          onClick={() => handleSubStep(-1)}
          className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-mono active:scale-95"
        >
          SUB ◀
        </button>

        <button
          onClick={() => {
            triggerLed();
            onClearInput();
          }}
          className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 font-mono active:scale-95"
        >
          CLEAR
        </button>

        <button
          onClick={() => handleSubStep(1)}
          className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-mono active:scale-95"
        >
          SUB ▶
        </button>
      </div>
    </div>
  );
};
