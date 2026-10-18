import { TeletextPage } from '../types/teletext';
import { SportsDataState, TeamProfile } from '../services/sportsService';
import { M7 } from '../constants/teletextCodes';

// Helper to pad string to exact length
const pad = (s: string, len: number) => s.slice(0, len).padEnd(len, ' ');
const rep = (c: string, len: number) => c.repeat(Math.max(0, len));

/**
 * PAGE 301: Sports Headlines & Desk Index
 */
export function generatePage301(sportsData: SportsDataState): TeletextPage {
  const { lastUpdated, isRateLimited, rateLimitMessage, dataSource } = sportsData;
  const statusNote = isRateLimited
    ? `${M7.YEL}${rateLimitMessage}`
    : `${M7.GRN}[${dataSource}]`;

  const lines: string[] = [
    `${M7.YEL}${M7.DBL}   CEEFAX SPORTS DESK 301 `,
    `${M7.YEL}${M7.DBL}   CEEFAX SPORTS DESK 301 `,
    `${M7.CYN}PREMIER LEAGUE TELETEXT SERVICES:`,
    `${M7.BLU}${rep('-', 39)}`,
    `${M7.WHT}* PREVIOUS MATCH RESULTS ...... PAGE ${M7.YEL}302`,
    `${M7.WHT}* UPCOMING FIXTURES ........... PAGE ${M7.YEL}303`,
    `${M7.WHT}* LEAGUE TABLE / STANDINGS .... PAGE ${M7.YEL}324`,
    `${M7.WHT}* PREMIER LEAGUE CLUBS ........ PAGE ${M7.YEL}330`,
    `${M7.BLU}${rep('-', 39)}`,
    `${M7.CYN}FEATURED CLUB PROFILES:`,
    `${M7.WHT}Arsenal 331   Aston Villa 332   Chelsea 333`,
    `${M7.WHT}Liverpool 334 Man City 335      Man Utd 336`,
    `${M7.WHT}Newcastle 337 Tottenham 338`,
    `${M7.BLU}${rep('-', 39)}`,
    `${M7.MAG}SPORT HEADLINES: ${M7.WHT}F1 & Ashes on page 500`,
    `${M7.CYN}SERVICE STATUS: ${statusNote}`,
    `${M7.WHT}Updated: ${lastUpdated} · Teletext 40x25`,
    `${M7.BLU}${rep('=', 39)}`,
    `${M7.RED}Results302${M7.GRN}Fixtures303${M7.YEL}Table 324 ${M7.CYN}Clubs 330`,
  ];

  return {
    pageNumber: 301,
    title: 'Ceefax Sports Desk',
    category: 'sport',
    fastext: {
      red: 302,
      green: 303,
      yellow: 324,
      cyan: 330,
      labels: { red: 'Results', green: 'Fixtures', yellow: 'Table', cyan: 'Clubs' },
    },
    subPages: [{ lines }],
  };
}

/**
 * PAGE 302: Premier League Previous Results
 */
export function generatePage302(sportsData: SportsDataState): TeletextPage {
  const { results, lastUpdated, isRateLimited, rateLimitMessage, dataSource } = sportsData;
  const statusNote = isRateLimited
    ? `${M7.YEL}${rateLimitMessage}`
    : `${M7.GRN}[${dataSource}]`;

  // Subpage 1: Latest 6 results
  const sub1Lines: string[] = [
    `${M7.YEL}${M7.DBL} CEEFAX RESULTS DESK 302 1/2`,
    `${M7.YEL}${M7.DBL} CEEFAX RESULTS DESK 302 `,
    `${M7.CYN}PREMIER LEAGUE RECENT RESULTS:`,
    `${M7.BLU}${rep('-', 39)}`,
  ];

  results.slice(0, 6).forEach((r) => {
    const dt = pad(r.date, 6);
    const home = pad(r.homeTeam, 10);
    const away = pad(r.awayTeam, 10);
    const score = `${r.homeScore}-${r.awayScore}`;
    sub1Lines.push(
      `${M7.GRN}${dt} ${M7.WHT}${home} ${M7.YEL}${score} ${M7.WHT}${away} ${M7.GRN}FT`
    );
  });

  while (sub1Lines.length < 15) sub1Lines.push('');

  sub1Lines.push(`${M7.BLU}${rep('-', 39)}`);
  sub1Lines.push(`${M7.CYN}STATUS: ${statusNote} ${M7.WHT}AT ${lastUpdated}`);
  sub1Lines.push(`${M7.WHT}Subpage 2 has earlier results.`);
  sub1Lines.push(`${M7.WHT}Press HOLD on remote to stop cycling.`);
  sub1Lines.push(`${M7.BLU}${rep('=', 39)}`);
  sub1Lines.push(`${M7.RED}Results302${M7.GRN}Fixtures303${M7.YEL}Table 324 ${M7.CYN}Clubs 330`);

  // Subpage 2: Earlier results (indices 6 to 12)
  const sub2Lines: string[] = [
    `${M7.YEL}${M7.DBL} CEEFAX RESULTS DESK 302 2/2`,
    `${M7.YEL}${M7.DBL} CEEFAX RESULTS DESK 302 `,
    `${M7.CYN}PREVIOUS ROUND SCORES:`,
    `${M7.BLU}${rep('-', 39)}`,
  ];

  const page2Results = results.slice(6, 12);
  const itemsToRender = page2Results.length > 0 ? page2Results : results.slice(0, 6);

  itemsToRender.forEach((r) => {
    const dt = pad(r.date, 6);
    const home = pad(r.homeTeam, 10);
    const away = pad(r.awayTeam, 10);
    const score = `${r.homeScore}-${r.awayScore}`;
    sub2Lines.push(
      `${M7.GRN}${dt} ${M7.WHT}${home} ${M7.YEL}${score} ${M7.WHT}${away} ${M7.GRN}FT`
    );
  });

  while (sub2Lines.length < 15) sub2Lines.push('');

  sub2Lines.push(`${M7.BLU}${rep('-', 39)}`);
  sub2Lines.push(`${M7.CYN}STATUS: ${statusNote} ${M7.WHT}AT ${lastUpdated}`);
  sub2Lines.push(`${M7.WHT}Upcoming fixtures on page 303.`);
  sub2Lines.push(`${M7.WHT}Full league table on page 324.`);
  sub2Lines.push(`${M7.BLU}${rep('=', 39)}`);
  sub2Lines.push(`${M7.RED}Results302${M7.GRN}Fixtures303${M7.YEL}Table 324 ${M7.CYN}Clubs 330`);

  return {
    pageNumber: 302,
    title: 'PL Previous Results',
    category: 'sport',
    fastext: {
      red: 302,
      green: 303,
      yellow: 324,
      cyan: 330,
      labels: { red: 'Results', green: 'Fixtures', yellow: 'Table', cyan: 'Clubs' },
    },
    subPages: [
      { lines: sub1Lines, fastext: { red: 302, green: 303, yellow: 324, cyan: 330 } },
      { lines: sub2Lines, fastext: { red: 302, green: 303, yellow: 324, cyan: 330 } },
    ],
  };
}

/**
 * PAGE 303: Premier League Upcoming Fixtures
 */
export function generatePage303(sportsData: SportsDataState): TeletextPage {
  const { fixtures, lastUpdated, isRateLimited, rateLimitMessage, dataSource } = sportsData;
  const statusNote = isRateLimited
    ? `${M7.YEL}${rateLimitMessage}`
    : `${M7.GRN}[${dataSource}]`;

  // Subpage 1: Next scheduled fixtures
  const sub1Lines: string[] = [
    `${M7.YEL}${M7.DBL} CEEFAX FIXTURE DESK 303 1/2`,
    `${M7.YEL}${M7.DBL} CEEFAX FIXTURE DESK 303 `,
    `${M7.CYN}NEXT SCHEDULED LEAGUE FIXTURES:`,
    `${M7.BLU}${rep('-', 39)}`,
  ];

  fixtures.slice(0, 6).forEach((f) => {
    const dt = pad(f.date, 6);
    const tm = pad(f.time, 5);
    const home = pad(f.homeTeam, 10);
    const away = pad(f.awayTeam, 10);
    sub1Lines.push(
      `${M7.GRN}${dt} ${tm} ${M7.WHT}${home} v ${away}`
    );
  });

  while (sub1Lines.length < 15) sub1Lines.push('');

  sub1Lines.push(`${M7.BLU}${rep('-', 39)}`);
  sub1Lines.push(`${M7.CYN}STATUS: ${statusNote} ${M7.WHT}AT ${lastUpdated}`);
  sub1Lines.push(`${M7.WHT}Subpage 2 has further scheduled matches.`);
  sub1Lines.push(`${M7.WHT}Previous results on page 302.`);
  sub1Lines.push(`${M7.BLU}${rep('=', 39)}`);
  sub1Lines.push(`${M7.RED}Results302${M7.GRN}Fixtures303${M7.YEL}Table 324 ${M7.CYN}Clubs 330`);

  // Subpage 2: Following fixtures
  const sub2Lines: string[] = [
    `${M7.YEL}${M7.DBL} CEEFAX FIXTURE DESK 303 2/2`,
    `${M7.YEL}${M7.DBL} CEEFAX FIXTURE DESK 303 `,
    `${M7.CYN}UPCOMING MATCHES CONTINUED:`,
    `${M7.BLU}${rep('-', 39)}`,
  ];

  const page2Fixtures = fixtures.slice(6, 12);
  const itemsToRender = page2Fixtures.length > 0 ? page2Fixtures : fixtures.slice(0, 6);

  itemsToRender.forEach((f) => {
    const dt = pad(f.date, 6);
    const tm = pad(f.time, 5);
    const home = pad(f.homeTeam, 10);
    const away = pad(f.awayTeam, 10);
    sub2Lines.push(
      `${M7.GRN}${dt} ${tm} ${M7.WHT}${home} v ${away}`
    );
  });

  while (sub2Lines.length < 15) sub2Lines.push('');

  sub2Lines.push(`${M7.BLU}${rep('-', 39)}`);
  sub2Lines.push(`${M7.CYN}STATUS: ${statusNote} ${M7.WHT}AT ${lastUpdated}`);
  sub2Lines.push(`${M7.WHT}For club squad & ground, see page 330.`);
  sub2Lines.push(`${M7.WHT}Standings table on page 324.`);
  sub2Lines.push(`${M7.BLU}${rep('=', 39)}`);
  sub2Lines.push(`${M7.RED}Results302${M7.GRN}Fixtures303${M7.YEL}Table 324 ${M7.CYN}Clubs 330`);

  return {
    pageNumber: 303,
    title: 'PL Upcoming Fixtures',
    category: 'sport',
    fastext: {
      red: 302,
      green: 303,
      yellow: 324,
      cyan: 330,
      labels: { red: 'Results', green: 'Fixtures', yellow: 'Table', cyan: 'Clubs' },
    },
    subPages: [
      { lines: sub1Lines, fastext: { red: 302, green: 303, yellow: 324, cyan: 330 } },
      { lines: sub2Lines, fastext: { red: 302, green: 303, yellow: 324, cyan: 330 } },
    ],
  };
}

/**
 * PAGE 324: Premier League Table / Standings
 */
export function generatePage324(sportsData: SportsDataState): TeletextPage {
  const { standings, lastUpdated, isRateLimited, rateLimitMessage, dataSource } = sportsData;
  const statusNote = isRateLimited
    ? `${M7.YEL}${rateLimitMessage}`
    : `${M7.GRN}[${dataSource}]`;

  // Subpage 1: Top 10 (Positions 1 to 10)
  const sub1Lines: string[] = [
    `${M7.YEL}${M7.DBL} BARCLAYS PREMIER LEAGUE 1/2`,
    `${M7.YEL}${M7.DBL} BARCLAYS PREMIER LEAGUE `,
    `${M7.CYN}POS TEAM         P  W  D  L  GD PTS`,
    `${M7.BLU}${rep('-', 39)}`,
  ];

  standings.slice(0, 10).forEach((t) => {
    const rankStr = String(t.rank).padStart(2, ' ');
    const teamStr = pad(t.team, 11);
    const pStr = String(t.played).padStart(2, ' ');
    const wStr = String(t.win).padStart(2, ' ');
    const dStr = String(t.draw).padStart(2, ' ');
    const lStr = String(t.loss).padStart(2, ' ');
    const gdStr = t.goalDiff.padStart(4, ' ');
    const ptsStr = String(t.points).padStart(3, ' ');

    // Top 4: Green (Champions League)
    // 5th: Cyan (Europa League)
    // Rest: White
    const colCode = t.rank <= 4 ? M7.GRN : t.rank === 5 ? M7.CYN : M7.WHT;

    sub1Lines.push(
      `${colCode} ${rankStr} ${teamStr} ${pStr} ${wStr} ${dStr} ${lStr} ${gdStr} ${ptsStr}`
    );
  });

  while (sub1Lines.length < 15) sub1Lines.push('');

  sub1Lines.push(`${M7.BLU}${rep('-', 39)}`);
  sub1Lines.push(`${M7.GRN}TOP 4: UEFA Champions League Stage`);
  sub1Lines.push(`${M7.CYN}STATUS: ${statusNote} ${M7.WHT}AT ${lastUpdated}`);
  sub1Lines.push(`${M7.WHT}Subpage 2 shows positions 11-20.`);
  sub1Lines.push(`${M7.BLU}${rep('=', 39)}`);
  sub1Lines.push(`${M7.RED}Results302${M7.GRN}Fixtures303${M7.YEL}Clubs 330 ${M7.CYN}Index`);

  // Subpage 2: Bottom 10 (Positions 11 to 20)
  const sub2Lines: string[] = [
    `${M7.YEL}${M7.DBL} BARCLAYS PREMIER LEAGUE 2/2`,
    `${M7.YEL}${M7.DBL} BARCLAYS PREMIER LEAGUE `,
    `${M7.CYN}POS TEAM         P  W  D  L  GD PTS`,
    `${M7.BLU}${rep('-', 39)}`,
  ];

  standings.slice(10, 20).forEach((t) => {
    const rankStr = String(t.rank).padStart(2, ' ');
    const teamStr = pad(t.team, 11);
    const pStr = String(t.played).padStart(2, ' ');
    const wStr = String(t.win).padStart(2, ' ');
    const dStr = String(t.draw).padStart(2, ' ');
    const lStr = String(t.loss).padStart(2, ' ');
    const gdStr = t.goalDiff.padStart(4, ' ');
    const ptsStr = String(t.points).padStart(3, ' ');

    // Bottom 3: Red (Relegation)
    const colCode = t.rank >= 18 ? M7.RED : M7.WHT;

    sub2Lines.push(
      `${colCode} ${rankStr} ${teamStr} ${pStr} ${wStr} ${dStr} ${lStr} ${gdStr} ${ptsStr}`
    );
  });

  while (sub2Lines.length < 15) sub2Lines.push('');

  sub2Lines.push(`${M7.BLU}${rep('-', 39)}`);
  sub2Lines.push(`${M7.RED}BOTTOM 3: Relegation Zone (EFL Champ)`);
  sub2Lines.push(`${M7.CYN}STATUS: ${statusNote} ${M7.WHT}AT ${lastUpdated}`);
  sub2Lines.push(`${M7.WHT}Previous results on page 302.`);
  sub2Lines.push(`${M7.BLU}${rep('=', 39)}`);
  sub2Lines.push(`${M7.RED}Results302${M7.GRN}Fixtures303${M7.YEL}Clubs 330 ${M7.CYN}Index`);

  return {
    pageNumber: 324,
    title: 'Premier League Table',
    category: 'sport',
    fastext: {
      red: 302,
      green: 303,
      yellow: 330,
      cyan: 100,
      labels: { red: 'Results', green: 'Fixtures', yellow: 'Clubs', cyan: 'Index' },
    },
    subPages: [
      { lines: sub1Lines, fastext: { red: 302, green: 303, yellow: 330, cyan: 100 } },
      { lines: sub2Lines, fastext: { red: 302, green: 303, yellow: 330, cyan: 100 } },
    ],
  };
}

/**
 * PAGE 330: Premier League Club Directory
 */
export function generatePage330(sportsData: SportsDataState): TeletextPage {
  const { teams } = sportsData;

  const lines: string[] = [
    `${M7.YEL}${M7.DBL}   PREMIER LEAGUE CLUBS   `,
    `${M7.YEL}${M7.DBL}   PREMIER LEAGUE CLUBS   `,
    `${M7.CYN}SELECT A CLUB FOR VENUE & MATCHES:`,
    `${M7.BLU}${rep('-', 39)}`,
  ];

  teams.forEach((team) => {
    const name = pad(team.name, 12);
    const ground = pad(team.stadium, 15);
    const pageNum = team.pageNumber;
    lines.push(
      `${M7.WHT}* ${name} ${M7.CYN}${ground} ${M7.YEL}P${pageNum}`
    );
  });

  while (lines.length < 15) lines.push('');

  lines.push(`${M7.BLU}${rep('-', 39)}`);
  lines.push(`${M7.GRN}Each page includes: Stadium, Capacity,`);
  lines.push(`${M7.GRN}League Standing, Last Result & Next Match.`);
  lines.push(`${M7.WHT}Type 3-digit page number on remote.`);
  lines.push(`${M7.BLU}${rep('=', 39)}`);
  lines.push(`${M7.RED}Arsenal331${M7.GRN}Liverpool ${M7.YEL}ManCity  ${M7.CYN}Table 324`);

  return {
    pageNumber: 330,
    title: 'PL Club Directory',
    category: 'sport',
    fastext: {
      red: 331,
      green: 334,
      yellow: 335,
      cyan: 324,
      labels: { red: 'Arsenal', green: 'Liverpool', yellow: 'Man City', cyan: 'Table' },
    },
    subPages: [{ lines }],
  };
}

/**
 * Single Club Profile Page (e.g., 331 Arsenal, 334 Liverpool, etc.)
 * Displays Stadium, Capacity, Manager, Formed, Current League Position,
 * Last Result, and Next Fixture.
 */
export function generateTeamPage(
  team: TeamProfile,
  sportsData: SportsDataState
): TeletextPage {
  const { results, fixtures, standings, teamMatches, lastUpdated } = sportsData;

  // Trigger on-demand team specific fetch if not already loaded
  sportsData; // references state

  const teamStanding = standings.find(
    (s) => s.team.toUpperCase().includes(team.name) || team.name.includes(s.team)
  );

  // Check cached team match data first, then fall back to league results/fixtures
  const cachedData = teamMatches[team.id];

  const teamResult =
    cachedData?.lastMatch ||
    results.find(
      (r) =>
        r.homeTeam.toUpperCase().includes(team.name) ||
        r.awayTeam.toUpperCase().includes(team.name)
    );

  const teamFixture =
    cachedData?.nextMatch ||
    fixtures.find(
      (f) =>
        f.homeTeam.toUpperCase().includes(team.name) ||
        f.awayTeam.toUpperCase().includes(team.name)
    );

  // Determine prev and next club page numbers for remote navigation
  const clubList = sportsData.teams;
  const currentIndex = clubList.findIndex((t) => t.id === team.id);
  const prevClub = clubList[(currentIndex - 1 + clubList.length) % clubList.length];
  const nextClub = clubList[(currentIndex + 1) % clubList.length];

  const headerTitle = pad(`${team.fullName.toUpperCase()}`, 24);

  const lines: string[] = [
    `${M7.YEL}${M7.DBL} ${headerTitle}`,
    `${M7.YEL}${M7.DBL} ${headerTitle}`,
    `${M7.CYN}CLUB PROFILE & FIXTURE SCHEDULE:`,
    `${M7.BLU}${rep('-', 39)}`,
    `${M7.WHT}HOME GROUND : ${M7.YEL}${team.stadium}`,
    `${M7.WHT}CAPACITY    : ${M7.CYN}${team.capacity}`,
    `${M7.WHT}FOUNDED     : ${M7.CYN}${team.formed}   ${M7.WHT}NICKNAME: ${M7.MAG}${team.nickname}`,
    `${M7.WHT}MANAGER     : ${M7.WHT}${team.manager}`,
    `${M7.BLU}${rep('-', 39)}`,
  ];

  if (teamStanding) {
    const diffStr = teamStanding.goalDiff;
    lines.push(
      `${M7.GRN}LEAGUE STANDING:${M7.WHT} POS ${M7.YEL}${teamStanding.rank}${M7.WHT} | PTS ${M7.YEL}${teamStanding.points}${M7.WHT} | GD ${diffStr}`
    );
  }

  if (teamResult) {
    const h = pad(teamResult.homeTeam, 10);
    const a = pad(teamResult.awayTeam, 10);
    const isHome = teamResult.homeTeam.toUpperCase().includes(team.name);
    const scoreColor = isHome
      ? teamResult.homeScore > teamResult.awayScore
        ? M7.GRN
        : teamResult.homeScore < teamResult.awayScore
        ? M7.RED
        : M7.YEL
      : teamResult.awayScore > teamResult.homeScore
      ? M7.GRN
      : teamResult.awayScore < teamResult.homeScore
      ? M7.RED
      : M7.YEL;

    lines.push(
      `${M7.CYN}RECENT RESULT (${teamResult.date}):`
    );
    lines.push(
      ` ${M7.WHT}${h} ${scoreColor}${teamResult.homeScore}-${teamResult.awayScore} ${M7.WHT}${a} ${M7.GRN}FT`
    );
  }

  if (teamFixture) {
    const h = pad(teamFixture.homeTeam, 10);
    const a = pad(teamFixture.awayTeam, 10);
    lines.push(
      `${M7.CYN}NEXT FIXTURE (${teamFixture.date} ${teamFixture.time}):`
    );
    lines.push(
      ` ${M7.WHT}${h} ${M7.YEL}v ${M7.WHT}${a}`
    );
  }

  while (lines.length < 15) lines.push('');

  lines.push(`${M7.BLU}${rep('-', 39)}`);
  lines.push(`${M7.CYN}CEEFAX CLUB GUIDE · Updated ${lastUpdated}`);
  lines.push(`${M7.WHT}Use FastText buttons to jump between clubs`);
  lines.push(`${M7.BLU}${rep('=', 39)}`);
  lines.push(`${M7.RED}P${prevClub.pageNumber} Prev ${M7.GRN}P${nextClub.pageNumber} Next${M7.YEL}Table 324 ${M7.CYN}Clubs 330`);

  return {
    pageNumber: team.pageNumber,
    title: `${team.name} Profile`,
    category: 'sport',
    fastext: {
      red: prevClub.pageNumber,
      green: nextClub.pageNumber,
      yellow: 324,
      cyan: 330,
      labels: {
        red: `P${prevClub.pageNumber} Prev`,
        green: `P${nextClub.pageNumber} Next`,
        yellow: 'Table',
        cyan: 'Clubs',
      },
    },
    subPages: [{ lines }],
  };
}
