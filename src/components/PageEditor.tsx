import React, { useState, useEffect, useRef } from 'react';
import {
  codesToTokens,
  tokensToCodes,
  countScreenCells,
  parseTeletextScreen,
} from '../utils/teletextParser';
import { TELETEXT_COLORS } from '../constants/teletextCodes';

interface PageEditorProps {
  initialLines: string[];
  pageNumber: number;
  initialRow?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lines: string[]) => void;
}

const TEMPLATES: Record<string, string[]> = {
  blank: [
    '[YEL][DBL]   CUSTOM TELETEXT PAGE   ',
    '[YEL][DBL]   CUSTOM TELETEXT PAGE   ',
    '[CYN]AUTHOR: USER MODE 7 BROADCAST',
    '[BLU]---------------------------------------',
    '[WHT]Type your announcement or message here.',
    '[WHT]Use the buttons above to add colours,',
    '[WHT]graphics, flashing and double-height!',
    '',
    '[GRN]* ITEM 1: Live updates enabled',
    '[GRN]* ITEM 2: Full SAA5050 chip emulation',
    '',
    '[YEL]Double-height headers use [DBL]',
    '[YEL]on two consecutive rows!',
    '',
    '[MAG]Secret: [CON]You found the secret message!',
    '',
    '[BLU]=======================================',
    '[RED]Index 100 [GRN]News 101 [YEL]Markets [CYN]Weather',
  ],
  news: [
    '[RED][DBL]   BREAKING CEEFAX NEWS   ',
    '[RED][DBL]   BREAKING CEEFAX NEWS   ',
    '[YEL]SPECIAL BULLETIN: COMPUTER EXPERT EDITION',
    '[BLU]---------------------------------------',
    '[WHT]LONDON - Engineers successfully restore',
    '[WHT]classic teletext broadcast format for',
    '[WHT]the modern internet age!',
    '',
    '[CYN]SYSTEM HIGHLIGHTS:',
    '[WHT]- Authentic SAA5050 Bedstead font',
    '[WHT]- Top-to-bottom raster scanline draw',
    '[WHT]- 25 rows by 40 columns text matrix',
    '',
    '[GRN]More updates to follow on page 101.',
    '[BLU]=======================================',
    '[RED]Headlines [GRN]World    [YEL]Sci-Tech [CYN]Index',
  ],
  weather: [
    '[YEL][DBL]   WEEKEND WEATHER OUTLOOK ',
    '[YEL][DBL]   WEEKEND WEATHER OUTLOOK ',
    '[CYN]NATIONAL REGIONS & TEMPERATURES:',
    '[BLU]---------------------------------------',
    '[G-YEL][CTG]   xxxx   [WHT]LONDON:    19C  [YEL]SUNNY & WARM',
    '[G-YEL][CTG]  xxxxxx  [WHT]BIRMINGHAM:17C  [YEL]SUNNY',
    '[G-CYN][CTG]   xxxx   [WHT]EDINBURGH: 13C  [CYN]RAIN SHOWERS',
    '[G-CYN][CTG]    xx    [WHT]CARDIFF:   16C  [WHT]MILD & DRY',
    '[BLU]---------------------------------------',
    '[MAG]OUTLOOK:[WHT] High pressure dominant over South.',
    '[BLU]=======================================',
    '[RED]Regions   [GRN]Europe   [YEL]5-Day    [CYN]Index',
  ],
  art: [
    '[CYN][DBL]    MODE 7 SIXEL ARTWORK   ',
    '[CYN][DBL]    MODE 7 SIXEL ARTWORK   ',
    '[G-YEL][CTG]   xx      xx    xxxxxxxx    xx      xx',
    '[G-RED][CTG]   xxxx  xxxx    xx          xxxx  xxxx',
    '[G-CYN][CTG]   xx xxxx xx    xxxxxx      xx xxxx xx',
    '[G-GRN][CTG]   xx  xx  xx    xx          xx  xx  xx',
    '[G-MAG][CTG]   xx      xx    xxxxxxxx    xx      xx',
    '[BLU]---------------------------------------',
    '[WHT]Rendered with 2x3 block sixels in Mode 7!',
    '[YEL]Separated mode gives textured look.',
    '[BLU]=======================================',
    '[RED]Index 100 [GRN]News 101 [YEL]Markets  [CYN]Demo 700',
  ],
};

export const PageEditor: React.FC<PageEditorProps> = ({
  initialLines,
  pageNumber,
  initialRow = 0,
  isOpen,
  onClose,
  onSave,
}) => {
  // Store lines as human-readable token strings like "[YEL][DBL] CEEFAX 100..."
  const [tokenLines, setTokenLines] = useState<string[]>([]);
  const [activeRow, setActiveRow] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      const converted = initialLines.map((line) => codesToTokens(line));
      while (converted.length < 24) {
        converted.push('');
      }
      setTokenLines(converted.slice(0, 24));
      setActiveRow(Math.min(initialRow, 23));
    }
  }, [isOpen, initialLines, initialRow]);

  if (!isOpen) return null;

  const handleLineChange = (index: number, val: string) => {
    const updated = [...tokenLines];
    updated[index] = val;
    setTokenLines(updated);
  };

  const insertToken = (token: string) => {
    const updated = [...tokenLines];
    const current = updated[activeRow] || '';
    const inputEl = inputRefs.current[activeRow];

    if (inputEl) {
      const start = inputEl.selectionStart || current.length;
      const end = inputEl.selectionEnd || current.length;
      const nextStr = current.slice(0, start) + token + current.slice(end);
      updated[activeRow] = nextStr;
      setTokenLines(updated);

      setTimeout(() => {
        inputEl.focus();
        inputEl.setSelectionRange(start + token.length, start + token.length);
      }, 10);
    } else {
      updated[activeRow] = current + token;
      setTokenLines(updated);
    }
  };

  const loadTemplate = (key: string) => {
    const tpl = TEMPLATES[key];
    if (tpl) {
      const padded = [...tpl];
      while (padded.length < 24) padded.push('');
      setTokenLines(padded);
    }
  };

  const handleSave = () => {
    // Convert readable tokens back to raw Mode 7 control codes
    const rawLines = tokenLines.map((tokenLine) => tokensToCodes(tokenLine));
    onSave(rawLines);
    onClose();
  };

  const activeRowText = tokenLines[activeRow] || '';
  const activeRowCells = countScreenCells(activeRowText);

  // Parse active row for a live miniature preview
  const previewCells = parseTeletextScreen([tokensToCodes(activeRowText)], true)[0] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-5 select-none font-mono">
      <div className="bg-neutral-900 border-2 border-amber-500/70 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-base font-bold text-amber-400 font-mono">
                TELETEXT MODE 7 PAGE EDITOR · PAGE {pageNumber}
              </h2>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Row {activeRow + 1} of 24 · Tokens like <code className="text-amber-300 font-bold">[RED]</code>, <code className="text-amber-300 font-bold">[DBL]</code> occupy 1 screen cell each.
            </p>
          </div>

          {/* Preset Templates */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[10px] text-neutral-500 uppercase mr-1">Templates:</span>
            <button
              onClick={() => loadTemplate('blank')}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 text-[11px] cursor-pointer"
            >
              Blank
            </button>
            <button
              onClick={() => loadTemplate('news')}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 text-[11px] cursor-pointer"
            >
              News
            </button>
            <button
              onClick={() => loadTemplate('weather')}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 text-[11px] cursor-pointer"
            >
              Weather
            </button>
            <button
              onClick={() => loadTemplate('art')}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 text-[11px] cursor-pointer"
            >
              Graphics
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded-lg text-xs font-bold font-mono transition-colors shadow-sm cursor-pointer"
            >
              SAVE & APPLY
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </div>

        {/* Mode 7 Code Inserter Toolbar */}
        <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center gap-2 text-xs">
          {/* Text Colors */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <span className="text-[10px] text-neutral-400 px-1 font-mono">TEXT:</span>
            <button onClick={() => insertToken('[RED]')} title="Red Text" className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[11px] cursor-pointer">RED</button>
            <button onClick={() => insertToken('[GRN]')} title="Green Text" className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[11px] cursor-pointer">GRN</button>
            <button onClick={() => insertToken('[YEL]')} title="Yellow Text" className="px-1.5 py-0.5 rounded bg-amber-400 text-black font-bold text-[11px] cursor-pointer">YEL</button>
            <button onClick={() => insertToken('[CYN]')} title="Cyan Text" className="px-1.5 py-0.5 rounded bg-cyan-400 text-black font-bold text-[11px] cursor-pointer">CYN</button>
            <button onClick={() => insertToken('[BLU]')} title="Blue Text" className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[11px] cursor-pointer">BLU</button>
            <button onClick={() => insertToken('[MAG]')} title="Magenta Text" className="px-1.5 py-0.5 rounded bg-fuchsia-600 text-white font-bold text-[11px] cursor-pointer">MAG</button>
            <button onClick={() => insertToken('[WHT]')} title="White Text" className="px-1.5 py-0.5 rounded bg-white text-black font-bold text-[11px] cursor-pointer">WHT</button>
          </div>

          {/* Graphics Colors */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <span className="text-[10px] text-neutral-400 px-1 font-mono">GRAPHICS:</span>
            <button onClick={() => insertToken('[G-CYN]')} className="px-1.5 py-0.5 rounded bg-cyan-700 text-white font-bold text-[11px] cursor-pointer">G-CYN</button>
            <button onClick={() => insertToken('[G-YEL]')} className="px-1.5 py-0.5 rounded bg-amber-600 text-black font-bold text-[11px] cursor-pointer">G-YEL</button>
            <button onClick={() => insertToken('[G-RED]')} className="px-1.5 py-0.5 rounded bg-red-700 text-white font-bold text-[11px] cursor-pointer">G-RED</button>
            <button onClick={() => insertToken('[G-GRN]')} className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-bold text-[11px] cursor-pointer">G-GRN</button>
            <button onClick={() => insertToken('[SEP]')} title="Separated Graphics" className="px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-200 text-[11px] cursor-pointer">SEP</button>
            <button onClick={() => insertToken('[CTG]')} title="Contiguous Graphics" className="px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-200 text-[11px] cursor-pointer">CTG</button>
          </div>

          {/* Attributes */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <span className="text-[10px] text-neutral-400 px-1 font-mono">ATTRIBUTES:</span>
            <button onClick={() => insertToken('[DBL]')} title="Double Height" className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold text-[11px] cursor-pointer">DBL-HT</button>
            <button onClick={() => insertToken('[FLS]')} title="Flashing Text" className="px-1.5 py-0.5 rounded bg-amber-600 text-black font-bold text-[11px] cursor-pointer">FLASH</button>
            <button onClick={() => insertToken('[CON]')} title="Conceal Text (Revealed on Remote)" className="px-1.5 py-0.5 rounded bg-pink-700 text-white font-bold text-[11px] cursor-pointer">CONCEAL</button>
            <button onClick={() => insertToken('[BG-NEW]')} title="New Background Color" className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-600 text-neutral-200 text-[11px] cursor-pointer">NEW-BG</button>
            <button onClick={() => insertToken('[BG-BLK]')} title="Black Background" className="px-1.5 py-0.5 rounded bg-black border border-neutral-600 text-white text-[11px] cursor-pointer">BLK-BG</button>
          </div>
        </div>

        {/* Live Active Row Mode 7 Preview Strip */}
        <div className="px-4 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] uppercase text-neutral-400 font-mono whitespace-nowrap">
              Row {activeRow + 1} Preview:
            </span>
            <div className="flex items-center bg-black border border-neutral-800 rounded px-2 py-1 font-mono tracking-widest text-sm h-7 min-w-[340px] max-w-[600px] overflow-x-auto whitespace-pre">
              {previewCells.slice(0, 40).map((cell, idx) => (
                <span
                  key={idx}
                  style={{
                    color: TELETEXT_COLORS[cell.fgColor] || '#fff',
                    backgroundColor: TELETEXT_COLORS[cell.bgColor] || '#000',
                    fontFamily: 'Bedstead, monospace',
                  }}
                >
                  {cell.char || ' '}
                </span>
              ))}
            </div>
          </div>

          {/* Screen Cell Budget Meter */}
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="text-[10px] text-neutral-400">Screen Cells:</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                activeRowCells <= 40
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
              }`}
            >
              {activeRowCells} / 40
            </span>
            {activeRowCells > 40 && (
              <span className="text-[11px] text-red-400 font-bold">
                ({activeRowCells - 40} overflow off-screen!)
              </span>
            )}
          </div>
        </div>

        {/* 24 Row Inputs List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-sm bg-black">
          {tokenLines.map((line, idx) => {
            const cellsCount = countScreenCells(line);
            const isOverflow = cellsCount > 40;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2 px-2 py-0.5 rounded border transition-colors ${
                  activeRow === idx
                    ? 'bg-neutral-800/95 border-amber-500'
                    : isOverflow
                    ? 'bg-red-950/20 border-red-900/60'
                    : 'bg-neutral-950 border-neutral-900 hover:border-neutral-800'
                }`}
              >
                <span className="text-neutral-500 text-xs w-7 text-right select-none font-mono">
                  R{idx + 1}
                </span>

                <input
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  value={line}
                  onFocus={() => setActiveRow(idx)}
                  onChange={(e) => handleLineChange(idx, e.target.value)}
                  className={`flex-1 bg-transparent focus:outline-none px-2 py-1 font-mono text-sm tracking-wider ${
                    isOverflow ? 'text-red-300' : 'text-white'
                  }`}
                  placeholder="Empty row..."
                />

                <span
                  className={`text-[11px] font-mono w-14 text-right select-none ${
                    isOverflow
                      ? 'text-red-400 font-bold'
                      : cellsCount === 40
                      ? 'text-amber-400'
                      : 'text-neutral-500'
                  }`}
                  title={`${cellsCount} screen cells used`}
                >
                  {cellsCount}/40
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓ AUTO-SAVED</span>
            <span>All modifications persist in your browser's Local Storage across reloads.</span>
          </div>
          <div className="text-neutral-500">
            Mode 7 BBC Ceefax (40 columns per row)
          </div>
        </div>
      </div>
    </div>
  );
};
