/**
 * Mode 7 BBC Teletext SAA5050 Specification Types
 */

export type TeletextColor = 
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white';

export interface TeletextCell {
  char: string;             // Display character or space
  charCode: number;         // Original ASCII or control code (0-255)
  fgColor: TeletextColor;   // Foreground color
  bgColor: TeletextColor;   // Background color
  isGraphics: boolean;      // In graphics mode (sixels or blast-through)
  separated: boolean;       // Contiguous vs Separated graphics
  flash: boolean;           // Flashing character
  doubleHeight: boolean;    // Double height
  isDoubleBottom: boolean;  // Render bottom half instead of top half
  conceal: boolean;         // Concealed until revealed
  isControlCode: boolean;   // Control code (displays as space unless held)
  sixelBits: number;        // 6-bit mask (0..63) for 2x3 block graphics
  blastThrough: boolean;    // Blast-through uppercase ASCII in graphics mode
}

export interface FastextLinks {
  red: number;
  green: number;
  yellow: number;
  cyan: number;
  labels?: {
    red?: string;
    green?: string;
    yellow?: string;
    cyan?: string;
  };
}

export interface TeletextSubPage {
  lines: string[];          // Up to 24 rows (row 0 is header generated dynamically or provided)
  fastext?: FastextLinks;
}

export interface TeletextPage {
  pageNumber: number;       // 100 to 899
  title: string;            // For directory/index
  category: 'news' | 'market' | 'weather' | 'sport' | 'tv' | 'quiz' | 'demo' | 'user';
  subPages: TeletextSubPage[];
  fastext?: FastextLinks;
  concealedAnswers?: boolean;
  isCustomUserEdit?: boolean;
}

export interface CrtConfig {
  scanlines: boolean;
  curvature: boolean;
  bloom: boolean;
  flicker: boolean;
  rgbPhosphor: boolean;
  soundEnabled: boolean;
  ambientHum: boolean;
}
