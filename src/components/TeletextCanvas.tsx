import React, { useEffect, useRef, useState } from 'react';
import { TeletextCell, CrtConfig } from '../types/teletext';
import { TELETEXT_COLORS } from '../constants/teletextCodes';
import { TELETEXT_COLS, TELETEXT_ROWS } from '../utils/teletextParser';

interface TeletextCanvasProps {
  screenCells: TeletextCell[][];
  headerText: string;
  crtConfig: CrtConfig;
  revealConcealed: boolean;
  visibleRowsCount?: number; // For authentic 500ms top-to-bottom raster draw
  onRowClick?: (rowIndex: number) => void;
  onPageClick?: (targetPage: number) => void;
}

const CELL_W = 16;
const CELL_H = 24;
const CANVAS_W = TELETEXT_COLS * CELL_W; // 640px
const CANVAS_H = TELETEXT_ROWS * CELL_H; // 600px

export const TeletextCanvas: React.FC<TeletextCanvasProps> = ({
  screenCells,
  headerText,
  crtConfig,
  revealConcealed,
  visibleRowsCount = 25,
  onRowClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [flashOn, setFlashOn] = useState<boolean>(true);
  const [fontLoaded, setFontLoaded] = useState<boolean>(false);

  // Ensure Bedstead font is ready before rendering
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        setFontLoaded(true);
      });
    }
  }, []);

  // Flash cycle: 700ms visible, 350ms hidden (SAA5050 flash rate)
  useEffect(() => {
    const interval = setInterval(() => {
      setFlashOn((prev) => !prev);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Main canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Reset background to solid black
    ctx.fillStyle = TELETEXT_COLORS.black;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Render 25 rows x 40 cols
    for (let row = 0; row < TELETEXT_ROWS; row++) {
      const y = row * CELL_H;

      // Authentic Teletext top-to-bottom arrival:
      // If row has not arrived yet during the 500ms raster draw, keep it solid black
      if (row > 0 && row >= visibleRowsCount) {
        ctx.fillStyle = TELETEXT_COLORS.black;
        ctx.fillRect(0, y, CANVAS_W, CELL_H);
        continue;
      }

      const rowCells = screenCells[row] || [];

      for (let col = 0; col < TELETEXT_COLS; col++) {
        const x = col * CELL_W;
        const cell = rowCells[col] || {
          char: ' ',
          charCode: 32,
          fgColor: 'white',
          bgColor: 'black',
          isGraphics: false,
          separated: false,
          flash: false,
          doubleHeight: false,
          isDoubleBottom: false,
          conceal: false,
          isControlCode: false,
          sixelBits: 0,
          blastThrough: false,
        };

        // Determine effective foreground & background
        const bgHex = TELETEXT_COLORS[cell.bgColor] || '#000000';
        let fgHex = TELETEXT_COLORS[cell.fgColor] || '#ffffff';

        // Flash handling
        if (cell.flash && !flashOn) {
          fgHex = bgHex; // when flash is off, foreground blends into background
        }

        // Draw cell background
        ctx.fillStyle = bgHex;
        ctx.fillRect(x, y, CELL_W, CELL_H);

        // Header line (Row 0) override with real-time text
        let displayChar = cell.char;
        if (row === 0 && headerText.length > col) {
          displayChar = headerText[col];
        }

        // If concealed and not revealed, don't draw foreground content
        if (cell.conceal && !revealConcealed) {
          continue;
        }

        // 1. Draw Sixels (block graphics)
        if (cell.sixelBits > 0 && (!cell.blastThrough || cell.isControlCode)) {
          ctx.fillStyle = fgHex;
          const bits = cell.sixelBits;
          const sep = cell.separated;

          // Gap for separated graphics mode
          const gapX = sep ? 2 : 0;
          const gapY = sep ? 2 : 0;

          const blockW = CELL_W / 2;
          const blockH = CELL_H / 3;

          // Double height stretching for graphics
          let subRowTop = 0;
          let subRowHeight = blockH;

          if (cell.doubleHeight) {
            subRowHeight = blockH * 2;
            subRowTop = cell.isDoubleBottom ? -CELL_H : 0;
          }

          const drawBlock = (bx: number, by: number) => {
            const destX = x + bx * blockW + (sep ? 1 : 0);
            const destY = y + by * blockH + (sep ? 1 : 0);
            const w = blockW - gapX;
            const h = blockH - gapY;

            if (cell.doubleHeight) {
              const scaledY = y + (by * subRowHeight + subRowTop);
              const clippedY = Math.max(y, scaledY);
              const clippedH = Math.min(y + CELL_H - clippedY, subRowHeight - gapY);
              if (clippedH > 0) {
                ctx.fillRect(destX, clippedY, w, clippedH);
              }
            } else {
              ctx.fillRect(destX, destY, w, h);
            }
          };

          // Bit 0: Top-Left
          if (bits & 1) drawBlock(0, 0);
          // Bit 1: Top-Right
          if (bits & 2) drawBlock(1, 0);
          // Bit 2: Mid-Left
          if (bits & 4) drawBlock(0, 1);
          // Bit 3: Mid-Right
          if (bits & 8) drawBlock(1, 1);
          // Bit 4: Bottom-Left
          if (bits & 16) drawBlock(0, 2);
          // Bit 5: Bottom-Right
          if (bits & 32) drawBlock(1, 2);
          continue;
        }

        // 2. Draw Text (Authentic SAA5050 Bedstead font)
        if (displayChar && displayChar !== ' ') {
          ctx.fillStyle = fgHex;

          if (cell.doubleHeight) {
            // Authentic SAA5050 Double height:
            // Top half: top 12px stretched to full 24px height
            // Bottom half: bottom 12px stretched to full 24px height
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, CELL_W, CELL_H);
            ctx.clip();

            ctx.font = '24px "Bedstead", "VT323", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const scaleY = 2;
            const scaledCenterY = cell.isDoubleBottom ? y - 1 : y + CELL_H - 1;

            ctx.translate(x + CELL_W / 2, scaledCenterY);
            ctx.scale(1, scaleY);
            ctx.fillText(displayChar, 0, 0);

            ctx.restore();
          } else {
            // Normal single-height text in SAA5050 font
            ctx.font = '24px "Bedstead", "VT323", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(displayChar, x + CELL_W / 2, y + CELL_H / 2);
          }
        }
      }
    }
  }, [screenCells, headerText, flashOn, revealConcealed, visibleRowsCount, fontLoaded]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onRowClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const scaleY = CANVAS_H / rect.height;
    const canvasY = clickY * scaleY;
    const clickedRow = Math.floor(canvasY / CELL_H);
    if (clickedRow >= 0 && clickedRow < TELETEXT_ROWS) {
      onRowClick(clickedRow);
    }
  };

  return (
    <div className="relative flex justify-center items-center w-full max-w-[800px] mx-auto select-none">
      {/* Outer TV Bezel */}
      <div
        className={`relative w-full rounded-2xl p-3 sm:p-5 transition-all duration-300 ${
          crtConfig.curvature
            ? 'bg-gradient-to-b from-neutral-800 via-neutral-900 to-black shadow-2xl border-4 border-neutral-700'
            : 'bg-neutral-900 border-2 border-neutral-800 rounded-lg'
        }`}
      >
        {/* Vintage Header Badge */}
        <div className="flex items-center justify-between pb-2 px-2 text-[11px] tracking-wider text-neutral-400 font-mono uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="font-bold text-neutral-300">SAA5050 TELETEXT DECODER</span>
            <span className="text-amber-400 hidden sm:inline">· BEDSTEAD MODE 7</span>
          </div>
          <span className="text-neutral-400">40×25 MATRIX</span>
        </div>

        {/* Screen Tube Container (Interlace stripped out per user request for pure clarity) */}
        <div
          className={`relative overflow-hidden bg-black flex items-center justify-center rounded-xl aspect-[4/3] ${
            crtConfig.curvature ? 'crt-barrel-screen' : ''
          }`}
          style={{
            boxShadow: crtConfig.bloom ? '0 0 30px rgba(255, 255, 255, 0.08)' : 'none',
          }}
        >
          {/* Canvas Rendering Plane */}
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onClick={handleCanvasClick}
            className="w-full h-full object-contain image-rendering-pixelated cursor-pointer"
            style={{
              imageRendering: 'pixelated',
            }}
          />

          {/* CRT Glass Reflection Glare (subtle) */}
          {crtConfig.curvature && (
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-br from-white/5 via-transparent to-black/30 rounded-xl" />
          )}
        </div>
      </div>
    </div>
  );
};
