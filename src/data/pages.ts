import { TeletextPage } from '../types/teletext';
import { M7 } from '../constants/teletextCodes';

// Helper to make repeating characters
const rep = (char: string, count: number) => char.repeat(Math.max(0, count));

export const DEFAULT_PAGES: Record<number, TeletextPage> = {
  // ==========================================
  // PAGE 100: CEEFAX INDEX
  // ==========================================
  100: {
    pageNumber: 100,
    title: 'Ceefax Index',
    category: 'news',
    fastext: {
      red: 101,
      green: 120,
      yellow: 400,
      cyan: 500,
      labels: {
        red: 'Headlines',
        green: 'Markets',
        yellow: 'Weather',
        cyan: 'Sport',
      },
    },
    subPages: [
      {
        lines: [
          // Row 0 is dynamic header
          `${M7.BLU}${M7.BG_BLU}${rep(' ', 37)}`,
          `${M7.YEL}${M7.DBL} CEEFAX 100 ${M7.WHT}THE NATION'S TELETEXT`,
          `${M7.YEL}${M7.DBL} CEEFAX 100 ${M7.WHT}THE NATION'S TELETEXT`,
          `${M7.BLU}${M7.BG_BLU}${rep(' ', 37)}`,
          `${M7.WHT}NEWS HEADLINES ... 101 ${M7.GRN}WEATHER ... 400`,
          `${M7.WHT}UK NEWS .......... 102 ${M7.GRN}REGIONS ... 401`,
          `${M7.WHT}WORLD NEWS ....... 103 ${M7.GRN}WORLD ..... 402`,
          `${M7.WHT}SCI-TECH & AI .... 104 ${M7.GRN}5-DAY ..... 403`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.CYN}MARKETS 120-122 ${M7.MAG}PL RESULTS 302`,
          `${M7.CYN}PL FIXTURES 303 ${M7.MAG}PL TABLE 324`,
          `${M7.CYN}PL LIVE SCORES 304`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.YEL}TV & RADIO GUIDE . 600 ${M7.RED}BAMBOOZLE!  550`,
          `${M7.YEL}BBC ONE / TWO .... 601 ${M7.RED}TRIVIA QUIZ 551`,
          `${M7.YEL}ITV & CHANNEL 4 .. 602 ${M7.WHT}MODE 7 DEMO 700`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.G_CYN}${M7.CTG}w   w w   w   w   w   w   w   w   w  `,
          `${M7.WHT}Type a 3-digit page number on remote`,
          `${M7.WHT}or use ${M7.RED}RED ${M7.GRN}GRN ${M7.YEL}YEL ${M7.CYN}CYN ${M7.WHT}Fastext`,
          `${M7.CYN}Press ${M7.YEL}REVEAL${M7.CYN} for hidden quiz answers`,
          `${M7.RED}${M7.FLS}* BREAKING: GLOBAL TECH SUMMIT 2026 *`,
          `${M7.BLU}${rep('=', 39)}`,
          `${M7.RED}Headlines ${M7.GRN}Markets ${M7.YEL}Weather ${M7.CYN}Sport`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 101: NEWS HEADLINES (Subpages 1, 2, 3)
  // ==========================================
  101: {
    pageNumber: 101,
    title: 'News Headlines',
    category: 'news',
    fastext: {
      red: 102,
      green: 103,
      yellow: 104,
      cyan: 100,
      labels: {
        red: 'UK News',
        green: 'World',
        yellow: 'Sci-Tech',
        cyan: 'Index',
      },
    },
    subPages: [
      {
        lines: [
          `${M7.YEL}${M7.DBL} CEEFAX NEWS BULLETINS ${M7.WHT}1/3`,
          `${M7.YEL}${M7.DBL} CEEFAX NEWS BULLETINS ${M7.WHT}1/3`,
          `${M7.CYN}TOP STORIES TODAY:${M7.WHT}`,
          ``,
          `${M7.RED}>> GLOBAL AI BREAKTHROUGH ACCORD SIGNED`,
          `${M7.WHT}Delegates from 42 nations conclude`,
          `${M7.WHT}treaty on open standards and automated`,
          `${M7.WHT}safety oversight in Geneva.`,
          ``,
          `${M7.RED}>> FTSE REACHES NEW 12-MONTH PEAK`,
          `${M7.WHT}London shares surge past 8,450 points`,
          `${M7.WHT}led by renewable energy and semiconductor`,
          `${M7.WHT}stocks. Details page 120.`,
          ``,
          `${M7.RED}>> HIGH-SPEED RAIL NETWORK UPGRADES`,
          `${M7.WHT}New zero-emission locomotives enter`,
          `${M7.WHT}commercial service along East Coast line.`,
          ``,
          `${M7.GRN}WEATHER ALERT:${M7.WHT} Bright spells with sunny`,
          `${M7.WHT}intervals in South; coastal gale warnings`,
          `${M7.WHT}in northern Scotland. Forecast page 400.`,
          ``,
          `${M7.YEL}Subpages cycle automatically or press HOLD`,
          `${M7.RED}UK News   ${M7.GRN}World    ${M7.YEL}Sci-Tech ${M7.CYN}Index`,
        ],
      },
      {
        lines: [
          `${M7.YEL}${M7.DBL} CEEFAX NEWS BULLETINS ${M7.WHT}2/3`,
          `${M7.YEL}${M7.DBL} CEEFAX NEWS BULLETINS ${M7.WHT}2/3`,
          `${M7.CYN}INTERNATIONAL ROUND-UP:${M7.WHT}`,
          ``,
          `${M7.RED}>> JAMES WEBB FINDS WATER WORLDS`,
          `${M7.WHT}Deep space telescope confirms atmospheric`,
          `${M7.WHT}water vapor around habitable-zone planets`,
          `${M7.WHT}in TRAPPIST-1 star system.`,
          ``,
          `${M7.RED}>> EU APPROVES HISTORIC GREEN CORRIDORS`,
          `${M7.WHT}Cross-border hydrogen rail networks to be`,
          `${M7.WHT}subsidised across central Europe.`,
          ``,
          `${M7.RED}>> RECORD CROWDS AT EDINBURGH FESTIVAL`,
          `${M7.WHT}Organisers announce highest international`,
          `${M7.WHT}attendance on record with 2.8m visitors.`,
          ``,
          `${M7.MAG}FINANCE:${M7.WHT} Sterling holds steady at $1.31`,
          `${M7.WHT}as inflation figures drop to 2.1%.`,
          ``,
          `${M7.YEL}Press HOLD to lock page / REVEAL for quiz`,
          `${M7.RED}UK News   ${M7.GRN}World    ${M7.YEL}Sci-Tech ${M7.CYN}Index`,
        ],
      },
      {
        lines: [
          `${M7.YEL}${M7.DBL} CEEFAX NEWS BULLETINS ${M7.WHT}3/3`,
          `${M7.YEL}${M7.DBL} CEEFAX NEWS BULLETINS ${M7.WHT}3/3`,
          `${M7.CYN}HOME & CONSUMER NEWS:${M7.WHT}`,
          ``,
          `${M7.RED}>> POSTAL SERVICE ROLLS OUT DRONE FLEET`,
          `${M7.WHT}Remote islands in the Hebrides receive`,
          `${M7.WHT}same-day medical supplies and parcels`,
          `${M7.WHT}via autonomous battery delivery flights.`,
          ``,
          `${M7.RED}>> RETRO COMPUTING EXHIBIT OPENS`,
          `${M7.WHT}Science Museum launches tribute to the`,
          `${M7.WHT}BBC Microcomputer and early Teletext,`,
          `${M7.WHT}drawing queues of enthusiastic fans.`,
          ``,
          `${M7.GRN}TODAY'S THOUGHT:${M7.CYN} "Information at the`,
          `${M7.CYN}touch of a button - 24 hours a day."`,
          ``,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.RED}UK News   ${M7.GRN}World    ${M7.YEL}Sci-Tech ${M7.CYN}Index`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 102: UK NEWS
  // ==========================================
  102: {
    pageNumber: 102,
    title: 'UK News',
    category: 'news',
    fastext: { red: 101, green: 103, yellow: 120, cyan: 100 },
    subPages: [
      {
        lines: [
          `${M7.CYN}${M7.DBL}   CEEFAX UK HOME NEWS  `,
          `${M7.CYN}${M7.DBL}   CEEFAX UK HOME NEWS  `,
          `${M7.YEL}PARLIAMENT APPROVES NEW CLEAN AIR ACT`,
          ``,
          `${M7.WHT}MPs have voted overwhelmingly in favour of`,
          `${M7.WHT}strict statutory emission limits covering`,
          `${M7.WHT}all metropolitan areas by 2028.`,
          ``,
          `${M7.WHT}The Secretary for the Environment told`,
          `${M7.WHT}the House of Commons that public health`,
          `${M7.WHT}benefits would save the NHS millions:`,
          ``,
          `${M7.GRN} "This landmark bill guarantees clean air`,
          `${M7.GRN}  for every child growing up in Britain."`,
          ``,
          `${M7.YEL}OPPOSITION AMENDMENT REJECTED`,
          `${M7.WHT}A proposed 2-year delay for rural haulage`,
          `${M7.WHT}was defeated by 342 votes to 218.`,
          ``,
          `${M7.MAG}TRANSPORT:${M7.WHT} EV vehicle grants expanded to`,
          `${M7.WHT}small commercial vehicles and vans.`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.RED}Headlines ${M7.GRN}World    ${M7.YEL}Markets  ${M7.CYN}Index`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 104: SCI-TECH NEWS
  // ==========================================
  104: {
    pageNumber: 104,
    title: 'Science & Technology',
    category: 'news',
    fastext: { red: 101, green: 700, yellow: 120, cyan: 100 },
    subPages: [
      {
        lines: [
          `${M7.GRN}${M7.DBL}   SCIENCE & TECHNOLOGY   `,
          `${M7.GRN}${M7.DBL}   SCIENCE & TECHNOLOGY   `,
          `${M7.YEL}FUSION REACTOR ACHIEVES NET GAIN RECORD`,
          ``,
          `${M7.WHT}Scientists at Culham Centre for Fusion`,
          `${M7.WHT}Energy have sustained a continuous plasma`,
          `${M7.WHT}reaction producing 69 Megajoules of`,
          `${M7.WHT}fusion energy over 12 minutes.`,
          ``,
          `${M7.CYN}COMMERCIAL PROSPECTS:`,
          `${M7.WHT}The engineering team stated that modular`,
          `${M7.WHT}pilot plants could provide baseload grid`,
          `${M7.WHT}power by the next decade.`,
          ``,
          `${M7.YEL}MODE 7 & SAA5050 CHIP RETROSPECTIVE`,
          `${M7.WHT}How the 1970s Philips Mullard chip`,
          `${M7.WHT}architecture defined broadcast teletext`,
          `${M7.WHT}for 30 million British television sets.`,
          `${M7.WHT}See our interactive test page 700.`,
          ``,
          `${M7.BLU}${rep('=', 39)}`,
          `${M7.RED}Headlines ${M7.GRN}Mode 7   ${M7.YEL}Markets  ${M7.CYN}Index`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 120: FINANCIAL MARKETS & STOCKS
  // ==========================================
  120: {
    pageNumber: 120,
    title: 'Financial Markets',
    category: 'market',
    fastext: {
      red: 121,
      green: 122,
      yellow: 101,
      cyan: 100,
      labels: {
        red: 'Currencies',
        green: 'Movers',
        yellow: 'News',
        cyan: 'Index',
      },
    },
    subPages: [
      {
        lines: [
          `${M7.CYN}${M7.DBL}   CEEFAX FINANCIAL DESK  `,
          `${M7.CYN}${M7.DBL}   CEEFAX FINANCIAL DESK  `,
          `${M7.YEL}WORLD STOCK INDICES        LATEST   CHG`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.WHT}FTSE 100 (LONDON)       ${M7.GRN}8,452.1  +68.4`,
          `${M7.WHT}FTSE 250 (MID-CAP)      ${M7.GRN}21,340.5 +112.0`,
          `${M7.WHT}DOW JONES (NEW YORK)    ${M7.GRN}39,870.2 +195.8`,
          `${M7.WHT}S&P 500 COMPOSITE       ${M7.GRN}5,310.8  +24.1`,
          `${M7.WHT}NASDAQ TECH 100         ${M7.RED}18,720.4 -35.2`,
          `${M7.WHT}DAX 40 (FRANKFURT)      ${M7.GRN}18,655.0 +84.6`,
          `${M7.WHT}NIKKEI 225 (TOKYO)      ${M7.GRN}38,910.0 +320.0`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.YEL}MARKET TREND VISUALISER (7 DAYS):`,
          `${M7.G_GRN}${M7.CTG}  xx  xxxx  xxxx  xxxxxx  xxxxxxxx`,
          `${M7.G_GRN}${M7.CTG} xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
          `${M7.G_GRN}${M7.CTG}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
          `${M7.WHT}Mon  Tue   Wed   Thu    Fri   LATEST`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.MAG}COMMODITIES: ${M7.WHT}Gold $2,385/oz  Oil $82.40/bbl`,
          `${M7.RED}Currencies${M7.GRN}Movers   ${M7.YEL}News     ${M7.CYN}Index`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 121: COMMODITIES & FOREX
  // ==========================================
  121: {
    pageNumber: 121,
    title: 'Currencies & Commodities',
    category: 'market',
    fastext: { red: 120, green: 122, yellow: 101, cyan: 100 },
    subPages: [
      {
        lines: [
          `${M7.CYN}${M7.DBL}   FOREIGN EXCHANGE & METALS`,
          `${M7.CYN}${M7.DBL}   FOREIGN EXCHANGE & METALS`,
          `${M7.YEL}FOREIGN CURRENCIES (PER GBP) LATEST`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.WHT}US DOLLAR ($)              ${M7.GRN}1.3140  +0.005`,
          `${M7.WHT}EURO (EUR)                 ${M7.GRN}1.1895  +0.002`,
          `${M7.WHT}JAPANESE YEN (JPY)         ${M7.RED}198.40  -0.80`,
          `${M7.WHT}SWISS FRANC (CHF)          ${M7.WHT}1.1420   0.000`,
          `${M7.WHT}CANADIAN DOLLAR (CAD)      ${M7.GRN}1.7850  +0.008`,
          `${M7.WHT}AUSTRALIAN DOLLAR (AUD)    ${M7.GRN}1.9610  +0.010`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.YEL}COMMODITY SPOT PRICES:`,
          `${M7.WHT}BRENT CRUDE (BARREL)       ${M7.RED}$82.40  -$1.10`,
          `${M7.WHT}NATURAL GAS (THERM)        ${M7.GRN}78.50p  +2.10p`,
          `${M7.WHT}GOLD BULLION (TROY OZ)     ${M7.GRN}$2,385  +$18`,
          `${M7.WHT}SILVER (TROY OZ)           ${M7.GRN}$28.40  +$0.65`,
          `${M7.WHT}COPPER (METRIC TONNE)      ${M7.GRN}$9,850  +$120`,
          `${M7.BLU}${rep('=', 39)}`,
          `${M7.RED}Markets   ${M7.GRN}Movers   ${M7.YEL}News     ${M7.CYN}Index`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 400: WEATHER FORECAST & UK MAP
  // ==========================================
  400: {
    pageNumber: 400,
    title: 'UK Weather Map',
    category: 'weather',
    fastext: {
      red: 401,
      green: 402,
      yellow: 403,
      cyan: 100,
      labels: {
        red: 'UK Regions',
        green: 'World',
        yellow: '5-Day',
        cyan: 'Index',
      },
    },
    subPages: [
      {
        lines: [
          `${M7.YEL}${M7.DBL}   BBC CEEFAX WEATHER MAP  `,
          `${M7.YEL}${M7.DBL}   BBC CEEFAX WEATHER MAP  `,
          `${M7.CYN}NATIONAL 24-HOUR FORECAST:`,
          `${M7.G_CYN}${M7.CTG}         xx`,
          `${M7.G_CYN}${M7.CTG}        xxxx     ${M7.WHT}SCOTLAND: 11C ${M7.CYN}Showers`,
          `${M7.G_CYN}${M7.CTG}       xxxxxx`,
          `${M7.G_CYN}${M7.CTG}       xxxx      ${M7.WHT}BELFAST:  12C ${M7.YEL}Breezy`,
          `${M7.G_CYN}${M7.CTG}   xx xxxxx`,
          `${M7.G_CYN}${M7.CTG}  xxxx xxxxxx    ${M7.WHT}NORTH:    13C ${M7.CYN}Cloudy`,
          `${M7.G_CYN}${M7.CTG}   xx  xxxxxxx`,
          `${M7.G_CYN}${M7.CTG}       xxxxxxxxx ${M7.WHT}MIDLANDS: 15C ${M7.YEL}Bright`,
          `${M7.G_CYN}${M7.CTG}      xxxxxxxxxx`,
          `${M7.G_CYN}${M7.CTG}     xxxxxxxxxxx ${M7.WHT}WALES:    14C ${M7.CYN}Misty`,
          `${M7.G_CYN}${M7.CTG}      xxxxxxxxx`,
          `${M7.G_CYN}${M7.CTG}       xxxxxxxxx ${M7.WHT}LONDON:   17C ${M7.YEL}Sunny`,
          `${M7.G_CYN}${M7.CTG}        xxxxxxx`,
          `${M7.G_CYN}${M7.CTG}         xxxxx   ${M7.WHT}SOUTH:    18C ${M7.YEL}Warm`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.GRN}OUTLOOK:${M7.WHT} High pressure building from the`,
          `${M7.WHT}Atlantic will bring dry, warm sunshine.`,
          `${M7.RED}UK Regions${M7.GRN}World    ${M7.YEL}5-Day    ${M7.CYN}Index`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 401: REGIONAL WEATHER
  // ==========================================
  401: {
    pageNumber: 401,
    title: 'UK Regional Weather',
    category: 'weather',
    fastext: { red: 400, green: 402, yellow: 403, cyan: 100 },
    subPages: [
      {
        lines: [
          `${M7.YEL}${M7.DBL}   UK REGIONAL FORECASTS  `,
          `${M7.YEL}${M7.DBL}   UK REGIONAL FORECASTS  `,
          `${M7.CYN}REGION            TEMP  WEATHER   WIND`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.WHT}GREATER LONDON     17C  SUNNY     SW 10`,
          `${M7.WHT}BIRMINGHAM         15C  SUNNY     W  12`,
          `${M7.WHT}MANCHESTER         14C  CLOUDY    NW 14`,
          `${M7.WHT}NEWCASTLE          12C  RAIN      N  18`,
          `${M7.WHT}EDINBURGH          11C  SHOWERS   NE 15`,
          `${M7.WHT}GLASGOW            11C  RAIN      W  16`,
          `${M7.WHT}CARDIFF            15C  FAIR      SW 11`,
          `${M7.WHT}SWANSEA            14C  BRIGHT    SW 14`,
          `${M7.WHT}BELFAST            12C  BREEZY    W  20`,
          `${M7.WHT}PLYMOUTH           16C  SUNNY     S  08`,
          `${M7.WHT}NORWICH            16C  DRY       E  09`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.MAG}POLLEN COUNT:${M7.GRN} LOW across all sectors`,
          `${M7.MAG}UV INDEX:    ${M7.YEL} MODERATE (Level 4)`,
          `${M7.BLU}${rep('=', 39)}`,
          `${M7.RED}Weather   ${M7.GRN}World    ${M7.YEL}5-Day    ${M7.CYN}Index`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 402: EUROPE & WORLD WEATHER
  // ==========================================
  402: {
    pageNumber: 402,
    title: 'World Weather',
    category: 'weather',
    fastext: { red: 400, green: 401, yellow: 403, cyan: 100 },
    subPages: [
      {
        lines: [
          `${M7.YEL}${M7.DBL}   EUROPE & WORLD RESORTS `,
          `${M7.YEL}${M7.DBL}   EUROPE & WORLD RESORTS `,
          `${M7.CYN}CITY              TEMP   CONDITIONS`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.WHT}PARIS              21C   WARM SUNSHINE`,
          `${M7.WHT}ROME               26C   HOT & DRY`,
          `${M7.WHT}MADRID             28C   CLEAR SKIES`,
          `${M7.WHT}AMSTERDAM          18C   PARTLY CLOUDY`,
          `${M7.WHT}BERLIN             19C   FAIR`,
          `${M7.WHT}NEW YORK           23C   MILD & SUNNY`,
          `${M7.WHT}TOKYO              22C   LIGHT DRIZZLE`,
          `${M7.WHT}SYDNEY             20C   FRESH BREEZE`,
          `${M7.WHT}LOS ANGELES        27C   SUNNY`,
          `${M7.WHT}DUBAI              38C   VERY HOT`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.GRN}HOLIDAY RESORTS:`,
          `${M7.WHT}MAJORCA 25C  ALGARVE 24C  TENERIFE 26C`,
          `${M7.RED}Weather   ${M7.GRN}UK Region${M7.YEL}5-Day    ${M7.CYN}Index`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 500: SPORT
  // ==========================================
  500: {
    pageNumber: 500,
    title: 'Sport Headlines',
    category: 'sport',
    fastext: {
      red: 302,
      green: 303,
      yellow: 324,
      cyan: 100,
      labels: {
        red: 'Results',
        green: 'Fixtures',
        yellow: 'Table',
        cyan: 'Index',
      },
    },
    subPages: [
      {
        lines: [
          `${M7.MAG}${M7.DBL}   CEEFAX SPORT HEADLINES `,
          `${M7.MAG}${M7.DBL}   CEEFAX SPORT HEADLINES `,
          `${M7.YEL}LATEST FOOTBALL ACTION & RESULTS:`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.WHT}ARSENAL              ${M7.CYN}2 - 1${M7.WHT}  CHELSEA`,
          `${M7.WHT}MANCHESTER CITY      ${M7.CYN}3 - 0${M7.WHT}  EVERTON`,
          `${M7.WHT}LIVERPOOL            ${M7.CYN}1 - 1${M7.WHT}  TOTTENHAM`,
          `${M7.WHT}ASTON VILLA          ${M7.CYN}2 - 0${M7.WHT}  NEWCASTLE`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.GRN}FORMULA ONE: BRITISH GRAND PRIX`,
          `${M7.WHT}Norris secures sensational Silverstone`,
          `${M7.WHT}pole position under changing conditions`,
          `${M7.WHT}edging out Verstappen by 0.04 seconds.`,
          ``,
          `${M7.YEL}CRICKET: THE ASHES TEST`,
          `${M7.WHT}England 324/5 at close on Day 2;`,
          `${M7.WHT}Root unbeaten on 124 in masterclass.`,
          `${M7.BLU}${rep('=', 39)}`,
          `${M7.RED}Results302${M7.GRN}Fixtures303${M7.YEL}Table 324 ${M7.CYN}Index`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 550: "BAMBOOZLE!" TRIVIA QUIZ
  // (Uses Mode 7 CONCEAL code 152!)
  // ==========================================
  550: {
    pageNumber: 550,
    title: 'Bamboozle! Quiz',
    category: 'quiz',
    concealedAnswers: true,
    fastext: {
      red: 551,
      green: 100,
      yellow: 700,
      cyan: 101,
      labels: {
        red: 'Question 2',
        green: 'Index',
        yellow: 'Mode 7',
        cyan: 'News',
      },
    },
    subPages: [
      {
        lines: [
          `${M7.RED}${M7.DBL}   B A M B O O Z L E !    `,
          `${M7.RED}${M7.DBL}   B A M B O O Z L E !    `,
          `${M7.YEL}TODAY'S NOSTALGIC TRIVIA QUESTION:`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.CYN}Q: Which iconic computer featured MODE 7`,
          `${M7.CYN}   driven by the Philips SAA5050 chip?`,
          ``,
          `${M7.WHT} [A] ZX Spectrum 48K`,
          `${M7.WHT} [B] BBC Microcomputer Model B`,
          `${M7.WHT} [C] Commodore 64`,
          `${M7.WHT} [D] Apple Macintosh 128k`,
          ``,
          `${M7.YEL}PRESS 'REVEAL' ON REMOTE TO SEE ANSWER!`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.GRN}ANSWER: ${M7.CON}[B] BBC Microcomputer!`,
          `${M7.WHT}${M7.CON}Launched in Dec 1981 by Acorn Computers`,
          `${M7.WHT}${M7.CON}for the BBC Computer Literacy Project.`,
          `${M7.CYN}${M7.CON}Score: 100 Points for Ceefax Masters!`,
          `${M7.BLU}${rep('=', 39)}`,
          `${M7.RED}Next Q    ${M7.GRN}Index    ${M7.YEL}Mode 7   ${M7.CYN}News`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 551: BAMBOOZLE QUESTION 2
  // ==========================================
  551: {
    pageNumber: 551,
    title: 'Bamboozle! Q2',
    category: 'quiz',
    concealedAnswers: true,
    fastext: { red: 550, green: 100, yellow: 700, cyan: 101 },
    subPages: [
      {
        lines: [
          `${M7.RED}${M7.DBL}   B A M B O O Z L E ! 2  `,
          `${M7.RED}${M7.DBL}   B A M B O O Z L E ! 2  `,
          `${M7.YEL}QUESTION TWO - BROADCAST TRIVIA:`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.CYN}Q: What does the acronym 'CEEFAX' stand for?`,
          ``,
          `${M7.WHT} [A] Central Electronic Entertainment Fax`,
          `${M7.WHT} [B] "See Facts" (Phonetic play on words)`,
          `${M7.WHT} [C] Computer Enabled Encoding Facility`,
          `${M7.WHT} [D] Crown Electronic Information Axis`,
          ``,
          `${M7.YEL}PRESS 'REVEAL' ON REMOTE TO UNMASK!`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.GRN}ANSWER: ${M7.CON}[B] "See Facts"!`,
          `${M7.WHT}${M7.CON}Invented by BBC engineers in 1974`,
          `${M7.WHT}${M7.CON}to broadcast subtitles & instant news!`,
          `${M7.CYN}${M7.CON}Bonus: It ran for 38 years until 2012!`,
          `${M7.BLU}${rep('=', 39)}`,
          `${M7.RED}Back Q1   ${M7.GRN}Index    ${M7.YEL}Mode 7   ${M7.CYN}News`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 600: TV & RADIO GUIDE
  // ==========================================
  600: {
    pageNumber: 600,
    title: 'TV Guide',
    category: 'tv',
    fastext: { red: 101, green: 100, yellow: 400, cyan: 550 },
    subPages: [
      {
        lines: [
          `${M7.YEL}${M7.DBL}   BBC TELEVISION GUIDE   `,
          `${M7.YEL}${M7.DBL}   BBC TELEVISION GUIDE   `,
          `${M7.CYN}TONIGHT'S HIGHLIGHTS:`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.WHT}BBC ONE:`,
          `${M7.GRN}18:00 ${M7.WHT}BBC Six O'Clock News & Weather`,
          `${M7.GRN}18:30 ${M7.WHT}Regional News Programmes`,
          `${M7.GRN}19:00 ${M7.WHT}The One Show: Retro Tech Special`,
          `${M7.GRN}20:00 ${M7.WHT}EastEnders (Drama)`,
          `${M7.GRN}20:30 ${M7.WHT}Doctor Who: The Time Lord Returns`,
          `${M7.GRN}21:30 ${M7.WHT}Panorama: The Artificial Future`,
          `${M7.BLU}${rep('-', 39)}`,
          `${M7.WHT}BBC TWO:`,
          `${M7.CYN}19:30 ${M7.WHT}Great British Railway Journeys`,
          `${M7.CYN}20:00 ${M7.WHT}University Challenge`,
          `${M7.CYN}20:30 ${M7.WHT}Only Connect: Quiz Tournament`,
          `${M7.CYN}21:00 ${M7.WHT}BBC Micro: 45 Years of Coding`,
          `${M7.RED}News      ${M7.GRN}Index    ${M7.YEL}Weather  ${M7.CYN}Bamboozle`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 700: MODE 7 SAA5050 HARDWARE DEMO
  // (Showcases every single feature from the spec!)
  // ==========================================
  700: {
    pageNumber: 700,
    title: 'Mode 7 SAA5050 Spec Demo',
    category: 'demo',
    fastext: {
      red: 100,
      green: 101,
      yellow: 550,
      cyan: 800,
      labels: {
        red: 'Index',
        green: 'News',
        yellow: 'Quiz',
        cyan: 'Scratchpad',
      },
    },
    subPages: [
      {
        lines: [
          `${M7.CYN}${M7.DBL}   MODE 7 SAA5050 SPEC DEMO `,
          `${M7.CYN}${M7.DBL}   MODE 7 SAA5050 SPEC DEMO `,
          `${M7.YEL}TEXT COLOURS (128-135):`,
          `${M7.RED}RED ${M7.GRN}GRN ${M7.YEL}YEL ${M7.BLU}BLU ${M7.MAG}MAG ${M7.CYN}CYN ${M7.WHT}WHT`,
          `${M7.YEL}NEW BACKGROUND (157):`,
          `${M7.BLU}${M7.BG_NEW}${M7.YEL} Yellow on Blue ${M7.BG_BLK}${M7.RED}${M7.BG_NEW}${M7.WHT} White on Red ${M7.BG_BLK}`,
          `${M7.YEL}CONTIGUOUS VS SEPARATED SIXELS:`,
          `${M7.G_CYN}${M7.CTG}Contiguous:   XXXXX   WWWWW   12345`,
          `${M7.G_CYN}${M7.SEP}Separated:    XXXXX   WWWWW   12345`,
          `${M7.YEL}BLAST-THROUGH (UPPERCASE IN GRAPHICS):`,
          `${M7.G_YEL}ABC 123 ${M7.G_RED}DEF 456 ${M7.G_GRN}GHI 789`,
          `${M7.YEL}FLASHING TEXT (136/137):`,
          `${M7.WHT}Steady text  ${M7.RED}${M7.FLS}* FLASHING ALERT *${M7.STD}${M7.WHT} Steady`,
          `${M7.YEL}DOUBLE HEIGHT (141) PAIRING:`,
          `${M7.GRN}${M7.DBL}DOUBLE-HEIGHT ROW`,
          `${M7.GRN}${M7.DBL}DOUBLE-HEIGHT ROW`,
          `${M7.YEL}CONCEAL (152) & REVEAL:`,
          `${M7.MAG}Secret: ${M7.CON}THE TREASURE IS ON PAGE 550!`,
          `${M7.BLU}${rep('=', 39)}`,
          `${M7.RED}Index     ${M7.GRN}News     ${M7.YEL}Quiz     ${M7.CYN}Editor`,
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 800: USER SCRATCHPAD / INTERACTIVE EDITOR
  // ==========================================
  800: {
    pageNumber: 800,
    title: 'Custom Page Scratchpad',
    category: 'user',
    fastext: { red: 100, green: 700, yellow: 101, cyan: 400 },
    subPages: [
      {
        lines: [
          `${M7.YEL}${M7.DBL}   MODE 7 USER SCRATCHPAD `,
          `${M7.YEL}${M7.DBL}   MODE 7 USER SCRATCHPAD `,
          `${M7.CYN}WELCOME TO THE TELETEXT CREATOR`,
          `${M7.BLU}---------------------------------------`,
          `${M7.WHT}Design and broadcast your own custom`,
          `${M7.WHT}teletext page in authentic Mode 7!`,
          ``,
          `${M7.YEL}${M7.FLS}* HOW TO EDIT THIS PAGE: *`,
          `${M7.GRN}1. Click any row directly on the TV!`,
          `${M7.GRN}2. Or click 'EDIT THIS PAGE' below`,
          ``,
          `${M7.CYN}Available Mode 7 features:`,
          `${M7.WHT}* Colours: Red, Green, Yellow, Blue, etc`,
          `${M7.WHT}* Double-height characters (code 141)`,
          `${M7.WHT}* 2x3 block sixel graphics & separation`,
          `${M7.WHT}* Concealed quiz answers (code 152)`,
          `${M7.WHT}* Flashing text & custom backgrounds`,
          ``,
          `${M7.BLU}=======================================`,
          `${M7.RED}Index 100 ${M7.GRN}Demo 700 ${M7.YEL}News 101 ${M7.CYN}Weather`,
        ],
      },
    ],
  },
};
