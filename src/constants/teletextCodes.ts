import { TeletextColor } from '../types/teletext';

export const TELETEXT_COLORS: Record<TeletextColor, string> = {
  black: '#000000',
  red: '#e50000',
  green: '#00e500',
  yellow: '#e5e500',
  blue: '#0000e5',
  magenta: '#e500e5',
  cyan: '#00e5e5',
  white: '#ffffff',
};

// Mode 7 / SAA5050 Control Code IDs
export const CODES = {
  // Alphanumeric colours
  ALPHA_BLACK: 128,
  ALPHA_RED: 129,
  ALPHA_GREEN: 130,
  ALPHA_YELLOW: 131,
  ALPHA_BLUE: 132,
  ALPHA_MAGENTA: 133,
  ALPHA_CYAN: 134,
  ALPHA_WHITE: 135,

  // Text attributes
  FLASH: 136,
  STEADY: 137,
  NORMAL_HEIGHT: 140,
  DOUBLE_HEIGHT: 141,

  // Graphics colours
  GRAPHICS_BLACK: 144,
  GRAPHICS_RED: 145,
  GRAPHICS_GREEN: 146,
  GRAPHICS_YELLOW: 147,
  GRAPHICS_BLUE: 148,
  GRAPHICS_MAGENTA: 149,
  GRAPHICS_CYAN: 150,
  GRAPHICS_WHITE: 151,

  // Graphics & background attributes
  CONCEAL: 152,
  CONTIGUOUS_GRAPHICS: 153,
  SEPARATED_GRAPHICS: 154,
  BLACK_BACKGROUND: 156,
  NEW_BACKGROUND: 157,
  HOLD_GRAPHICS: 158,
  RELEASE_GRAPHICS: 159,
} as const;

export const COLOR_INDEX_MAP: Record<number, TeletextColor> = {
  0: 'black',
  1: 'red',
  2: 'green',
  3: 'yellow',
  4: 'blue',
  5: 'magenta',
  6: 'cyan',
  7: 'white',
};

export const CODE_TO_ALPHA_COLOR: Record<number, TeletextColor> = {
  128: 'black',
  129: 'red',
  130: 'green',
  131: 'yellow',
  132: 'blue',
  133: 'magenta',
  134: 'cyan',
  135: 'white',
};

export const CODE_TO_GRAPHICS_COLOR: Record<number, TeletextColor> = {
  144: 'black',
  145: 'red',
  146: 'green',
  147: 'yellow',
  148: 'blue',
  149: 'magenta',
  150: 'cyan',
  151: 'white',
};

/**
 * String escape helper shortcuts for authoring Mode 7 teletext screens.
 * These characters evaluate to the actual ASCII control codes in JavaScript strings.
 */
export const M7 = {
  // Alphanumerics
  BLK: String.fromCharCode(128),
  RED: String.fromCharCode(129),
  GRN: String.fromCharCode(130),
  YEL: String.fromCharCode(131),
  BLU: String.fromCharCode(132),
  MAG: String.fromCharCode(133),
  CYN: String.fromCharCode(134),
  WHT: String.fromCharCode(135),

  // Flash / Steady
  FLS: String.fromCharCode(136),
  STD: String.fromCharCode(137),

  // Height
  NRM: String.fromCharCode(140),
  DBL: String.fromCharCode(141),

  // Graphics colors
  G_BLK: String.fromCharCode(144),
  G_RED: String.fromCharCode(145),
  G_GRN: String.fromCharCode(146),
  G_YEL: String.fromCharCode(147),
  G_BLU: String.fromCharCode(148),
  G_MAG: String.fromCharCode(149),
  G_CYN: String.fromCharCode(150),
  G_WHT: String.fromCharCode(151),

  // Attributes
  CON: String.fromCharCode(152),
  CTG: String.fromCharCode(153),
  SEP: String.fromCharCode(154),
  BG_BLK: String.fromCharCode(156),
  BG_NEW: String.fromCharCode(157),
  HLD: String.fromCharCode(158),
  RLS: String.fromCharCode(159),

  // Background shortcuts (Color + BG_NEW)
  BG_BLU: String.fromCharCode(132) + String.fromCharCode(157),
  BG_RED: String.fromCharCode(129) + String.fromCharCode(157),
  BG_GRN: String.fromCharCode(130) + String.fromCharCode(157),
  BG_YEL: String.fromCharCode(131) + String.fromCharCode(157),
  BG_CYN: String.fromCharCode(134) + String.fromCharCode(157),
  BG_MAG: String.fromCharCode(133) + String.fromCharCode(157),
  BG_WHT: String.fromCharCode(135) + String.fromCharCode(157),
};
