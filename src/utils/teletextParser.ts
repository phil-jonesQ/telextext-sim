import { TeletextColor, TeletextCell } from '../types/teletext';
import {
  CODES,
  CODE_TO_ALPHA_COLOR,
  CODE_TO_GRAPHICS_COLOR,
} from '../constants/teletextCodes';

export const TELETEXT_ROWS = 25;
export const TELETEXT_COLS = 40;

/**
 * Calculates the sixel 6-bit mask from character code.
 * Bit 0: Top-Left (1)
 * Bit 1: Top-Right (2)
 * Bit 2: Mid-Left (4)
 * Bit 3: Mid-Right (8)
 * Bit 4: Bottom-Left (16)
 * Bit 5: Bottom-Right (32)
 */
export function getSixelBits(charCode: number): { isSixel: boolean; bits: number; isBlastThrough: boolean } {
  // 8-bit Mode 7 block graphics codes (160..191 and 224..255)
  if (charCode >= 160 && charCode <= 191) {
    const offset = charCode - 160;
    return { isSixel: true, bits: offset, isBlastThrough: false };
  }
  if (charCode >= 224 && charCode <= 255) {
    const offset = charCode - 224;
    return { isSixel: true, bits: offset | 32, isBlastThrough: false };
  }

  // 7-bit ASCII in graphics mode:
  // Uppercase letters @, A-Z, [, \, ], ^, _ (0x40 - 0x5F) are blast-through
  if (charCode >= 0x40 && charCode <= 0x5f) {
    return { isSixel: false, bits: 0, isBlastThrough: true };
  }

  // 0x20..0x3F (32..63) -> lower 5 bits of sixel, bottom-right = 0
  if (charCode >= 0x20 && charCode <= 0x3f) {
    const offset = charCode - 0x20;
    return { isSixel: true, bits: offset, isBlastThrough: false };
  }

  // 0x60..0x7F (96..127) -> lower 5 bits of sixel, bottom-right = 1
  if (charCode >= 0x60 && charCode <= 0x7f) {
    const offset = charCode - 0x60;
    return { isSixel: true, bits: offset | 32, isBlastThrough: false };
  }

  return { isSixel: false, bits: 0, isBlastThrough: false };
}

/**
 * Parses raw text lines (up to 25 lines of 40 characters) into a 2D array of TeletextCell
 */
export function parseTeletextScreen(
  rawLines: string[],
  revealConcealed: boolean = false
): TeletextCell[][] {
  const screen: TeletextCell[][] = [];
  let previousRowWasDoubleTop = false;

  for (let rowIdx = 0; rowIdx < TELETEXT_ROWS; rowIdx++) {
    const line = rawLines[rowIdx] || '';
    const rowCells: TeletextCell[] = [];

    // Mode 7 Initial state at start of every row:
    // "all rows start off as steady, single-height alphanumeric white characters on a black background"
    let currentFg: TeletextColor = 'white';
    let currentBg: TeletextColor = 'black';
    let isGraphics = false;
    let separated = false;
    let flash = false;
    let doubleHeight = false;
    let conceal = false;
    let holdGraphics = false;
    let heldSixelBits = 0;
    let heldSeparated = false;
    let hasGraphicsBeenDrawn = false;
    let rowHasDoubleHeight = false;

    // First pass on row characters to process attributes and cell structure
    for (let colIdx = 0; colIdx < TELETEXT_COLS; colIdx++) {
      const char = colIdx < line.length ? line[colIdx] : ' ';
      const code = char.charCodeAt(0);

      let isControl = false;

      // Check if code is a Mode 7 control code (128-159)
      if (code >= 128 && code <= 159) {
        isControl = true;

        if (CODE_TO_ALPHA_COLOR[code]) {
          currentFg = CODE_TO_ALPHA_COLOR[code];
          isGraphics = false;
          conceal = false; // color reset cancels conceal
          hasGraphicsBeenDrawn = false; // mode switch clears held graphics
        } else if (CODE_TO_GRAPHICS_COLOR[code]) {
          currentFg = CODE_TO_GRAPHICS_COLOR[code];
          isGraphics = true;
          conceal = false;
        } else {
          switch (code) {
            case CODES.FLASH:
              flash = true;
              break;
            case CODES.STEADY:
              flash = false;
              break;
            case CODES.NORMAL_HEIGHT:
              doubleHeight = false;
              hasGraphicsBeenDrawn = false;
              break;
            case CODES.DOUBLE_HEIGHT:
              doubleHeight = true;
              rowHasDoubleHeight = true;
              hasGraphicsBeenDrawn = false;
              break;
            case CODES.CONCEAL:
              conceal = true;
              break;
            case CODES.CONTIGUOUS_GRAPHICS:
              separated = false;
              break;
            case CODES.SEPARATED_GRAPHICS:
              separated = true;
              break;
            case CODES.BLACK_BACKGROUND:
              currentBg = 'black';
              break;
            case CODES.NEW_BACKGROUND:
              // current foreground colour becomes new background colour!
              currentBg = currentFg;
              break;
            case CODES.HOLD_GRAPHICS:
              holdGraphics = true;
              break;
            case CODES.RELEASE_GRAPHICS:
              holdGraphics = false;
              break;
          }
        }
      }

      // Check if this character is sixel or blast-through
      let sixelBits = 0;
      let blastThrough = false;

      if (isGraphics && !isControl) {
        const sixelInfo = getSixelBits(code);
        if (sixelInfo.isBlastThrough) {
          blastThrough = true;
        } else if (sixelInfo.isSixel) {
          sixelBits = sixelInfo.bits;
          heldSixelBits = sixelBits;
          heldSeparated = separated;
          hasGraphicsBeenDrawn = true;
        }
      }

      // Held graphics behavior:
      // "In the held graphics mode, control codes are displayed as a copy of the most recently displayed graphics symbol"
      let finalSixelBits = sixelBits;
      let finalSeparated = separated;
      let displayChar = char;

      if (isControl) {
        if (holdGraphics && hasGraphicsBeenDrawn) {
          finalSixelBits = heldSixelBits;
          finalSeparated = heldSeparated;
          displayChar = ' ';
        } else {
          displayChar = ' ';
        }
      }

      rowCells.push({
        char: displayChar,
        charCode: code,
        fgColor: currentFg,
        bgColor: currentBg,
        isGraphics: isGraphics,
        separated: finalSeparated,
        flash,
        doubleHeight,
        isDoubleBottom: false, // set in second pass
        conceal,
        isControlCode: isControl,
        sixelBits: finalSixelBits,
        blastThrough,
      });
    }

    // Determine double-height top vs bottom halving:
    // SAA5050 logic: If previous row was a top double-height, this row is bottom half.
    const isBottomHalfRow = previousRowWasDoubleTop && rowHasDoubleHeight;
    if (isBottomHalfRow) {
      previousRowWasDoubleTop = false; // Pair completed
    } else if (rowHasDoubleHeight) {
      previousRowWasDoubleTop = true; // This is top half
    } else {
      previousRowWasDoubleTop = false;
    }

    // Second pass on row cells: assign isDoubleBottom & conceal unmasking
    for (let c = 0; c < TELETEXT_COLS; c++) {
      const cell = rowCells[c];
      cell.isDoubleBottom = isBottomHalfRow;

      // On a bottom-half row, single-height characters display as spaces in current background
      if (isBottomHalfRow && !cell.doubleHeight) {
        cell.char = ' ';
        cell.sixelBits = 0;
      }

      // If concealed and not revealed by user, mask it
      if (cell.conceal && !revealConcealed) {
        cell.char = ' ';
        cell.sixelBits = 0;
      }
    }

    screen.push(rowCells);
  }

  return screen;
}

/**
 * Pads or slices line to exactly 40 chars
 */
export function formatTeletextLine(text: string): string {
  if (text.length > TELETEXT_COLS) {
    return text.slice(0, TELETEXT_COLS);
  }
  return text.padEnd(TELETEXT_COLS, ' ');
}

export const CODE_TO_TOKEN: Record<number, string> = {
  128: '[BLK]',
  129: '[RED]',
  130: '[GRN]',
  131: '[YEL]',
  132: '[BLU]',
  133: '[MAG]',
  134: '[CYN]',
  135: '[WHT]',
  136: '[FLS]',
  137: '[STD]',
  140: '[NRM]',
  141: '[DBL]',
  144: '[G-BLK]',
  145: '[G-RED]',
  146: '[G-GRN]',
  147: '[G-YEL]',
  148: '[G-BLU]',
  149: '[G-MAG]',
  150: '[G-CYN]',
  151: '[G-WHT]',
  152: '[CON]',
  153: '[CTG]',
  154: '[SEP]',
  156: '[BG-BLK]',
  157: '[BG-NEW]',
  158: '[HLD]',
  159: '[RLS]',
};

export const TOKEN_TO_CODE: Record<string, number> = Object.entries(CODE_TO_TOKEN).reduce(
  (acc, [code, token]) => {
    acc[token] = parseInt(code, 10);
    return acc;
  },
  {} as Record<string, number>
);

/**
 * Converts raw control codes (128-159) into readable text tokens like [RED], [DBL]
 */
export function codesToTokens(text: string): string {
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (CODE_TO_TOKEN[code]) {
      res += CODE_TO_TOKEN[code];
    } else {
      res += text[i];
    }
  }
  return res;
}

/**
 * Converts readable text tokens like [RED], [DBL] back into Mode 7 control codes
 */
export function tokensToCodes(tokenStr: string): string {
  return tokenStr.replace(/\[[A-Z0-9_-]+\]/g, (match) => {
    if (TOKEN_TO_CODE[match]) {
      return String.fromCharCode(TOKEN_TO_CODE[match]);
    }
    return match;
  });
}

/**
 * Calculates how many Mode 7 screen cells (0..40) a token string occupies.
 * Each control token occupies 1 cell, and each normal character occupies 1 cell.
 */
export function countScreenCells(tokenOrRawStr: string): number {
  const raw = tokensToCodes(tokenOrRawStr);
  return raw.length;
}

