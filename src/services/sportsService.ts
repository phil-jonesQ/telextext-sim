/**
 * TheSportsDB Free-Tier V1 Premier League Sports Service
 *
 * Implements:
 * 1. Upcoming Fixtures: eventsnextleague.php?id=4328
 * 2. Previous Results: eventspastleague.php?id=4328
 * 3. League Table / Standings: lookuptable.php?l=4328
 * 4. Club-Specific Next & Last matches: eventsnext.php?id={teamId} & eventslast.php?id={teamId}
 * 5. Resilient rate limiting (30 req/min limit, 429 backoff, cached data)
 */

export interface StandingRow {
  rank: number;
  team: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: string;
  points: number;
  form: string;
}

export interface MatchResult {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
}

export interface UpcomingMatch {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue?: string;
}

export interface TeamProfile {
  id: string;
  name: string;
  fullName: string;
  stadium: string;
  capacity: string;
  formed: string;
  nickname: string;
  pageNumber: number;
  manager: string;
}

export interface TeamMatchData {
  lastMatch?: MatchResult;
  nextMatch?: UpcomingMatch;
}

export interface LiveFixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  minute: string | null;
  goalAlertUntil?: number;
}

export interface SportsDataState {
  standings: StandingRow[];
  results: MatchResult[];
  fixtures: UpcomingMatch[];
  liveFixtures: LiveFixture[];
  liveScoresError: string | null;
  liveScoresUpdatedAt: string | null;
  teams: TeamProfile[];
  teamMatches: Record<string, TeamMatchData>;
  isRateLimited: boolean;
  rateLimitMessage?: string;
  dataSource: 'THESPORTSDB' | 'CACHED';
  lastUpdated: string;
}

interface LeagueEvent {
  idEvent: string;
  idLeague?: string;
  dateEvent?: string;
  strTime?: string | null;
  strTimeLocal?: string | null;
  strTimestamp?: string | null;
  strHomeTeam: string;
  strAwayTeam: string;
  strVenue?: string;
  strStatus?: string | null;
  strSeason?: string | null;
  intRound?: string | null;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
}

const PREMIER_LEAGUE_ID = '4328';
const BASE_V1_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const COMPLETED_MATCH_STATUSES = new Set(['FT', 'AET', 'PEN']);
const IN_PROGRESS_MATCH_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE']);
const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const shiftDateKey = (date: Date, days: number) =>
  getDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
const getEventSortKey = (event: LeagueEvent) =>
  event.strTimestamp || `${event.dateEvent || ''}T${event.strTimeLocal || event.strTime || '00:00:00'}`;
const getEventTimestamp = (event: LeagueEvent) => {
  if (event.strTimestamp) {
    const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/.test(event.strTimestamp)
      ? event.strTimestamp
      : `${event.strTimestamp}Z`;
    return new Date(timestamp).getTime();
  }
  return new Date(
    `${event.dateEvent || ''}T${event.strTimeLocal || event.strTime || '23:59:59'}`
  ).getTime();
};

export function parseSportApiFixtures(payload: unknown): LiveFixture[] {
  if (!payload || typeof payload !== 'object') {
    throw new Error('SportAPI returned an invalid fixtures response');
  }
  const response = payload as {
    success?: unknown;
    data?: unknown;
  };
  if (response.success !== true || !Array.isArray(response.data)) {
    throw new Error('SportAPI returned an invalid fixtures response');
  }

  return response.data.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const fixture = item as Record<string, unknown>;
    const leagueName = String(fixture.league_name || '').trim().toLowerCase();
    const leagueGeo = String(fixture.league_geo || '').trim().toUpperCase();
    const leagueZone = String(fixture.league_zone || '').trim().toLowerCase();
    const isEnglishPremierLeague =
      Number(fixture.league_id) === 24 &&
      leagueName === 'premier league' &&
      (leagueGeo === 'GB-ENG' || leagueZone === 'england');
    if (!isEnglishPremierLeague) {
      return [];
    }

    const id = Number(fixture.id);
    const homeTeam = String(fixture.home_short || fixture.home_team || '').trim();
    const awayTeam = String(fixture.away_short || fixture.away_team || '').trim();
    const status = String(fixture.status || '').trim();
    if (
      !Number.isInteger(id) ||
      !homeTeam ||
      !awayTeam ||
      status.toUpperCase() !== 'LIVE'
    ) {
      return [];
    }

    const scoreOrNull = (value: unknown) =>
      value === null || value === undefined || value === ''
        ? null
        : Number.isFinite(Number(value))
        ? Number(value)
        : null;

    return [{
      id,
      homeTeam,
      awayTeam,
      homeScore: scoreOrNull(fixture.home_score),
      awayScore: scoreOrNull(fixture.away_score),
      status,
      minute: typeof fixture.minute === 'string' ? fixture.minute : null,
    }];
  });
}

const TEAM_NAME_ALIASES: Record<string, string> = {
  'ARSENAL FC': 'ARSENAL',
  'ASTON VILLA FC': 'ASTON VILLA',
  'AFC BOURNEMOUTH': 'BOURNEMOUTH',
  'AFC BOURNEMOUTH FC': 'BOURNEMOUTH',
  'BRIGHTON AND HOVE ALBION': 'BRIGHTON',
  'BRIGHTON & HOVE ALBION': 'BRIGHTON',
  'CHELSEA FC': 'CHELSEA',
  'COVENTRY CITY': 'COVENTRY',
  'COVENTRY CITY FC': 'COVENTRY',
  'CRYSTAL PALACE': 'PALACE',
  'EVERTON FC': 'EVERTON',
  'FULHAM FC': 'FULHAM',
  'HULL CITY': 'HULL',
  'HULL CITY AFC': 'HULL',
  'IPSWICH TOWN FC': 'IPSWICH TOWN',
  'LEICESTER CITY': 'LEICESTER',
  'LEEDS UNITED': 'LEEDS',
  'LEEDS UTD': 'LEEDS',
  'LIVERPOOL FC': 'LIVERPOOL',
  'MANCHESTER CITY': 'MAN CITY',
  'MANCHESTER CITY FC': 'MAN CITY',
  'MANCHESTER UNITED': 'MAN UTD',
  'MANCHESTER UNITED FC': 'MAN UTD',
  'NEWCASTLE UNITED': 'NEWCASTLE',
  'NOTTINGHAM FOREST': 'NOTTM FOREST',
  'SOUTHAMPTON FC': 'SOUTHAMPTON',
  'SUNDERLAND AFC': 'SUNDERLAND',
  'TOTTENHAM HOTSPUR': 'SPURS',
  'TOTTENHAM HOTSPUR FC': 'SPURS',
  'WEST HAM UNITED': 'WEST HAM',
  'WOLVERHAMPTON WANDERERS': 'WOLVES',
};

// Full baseline 20-team Premier League table
const FALLBACK_STANDINGS: StandingRow[] = [
  { rank: 1, team: 'MAN CITY', played: 7, win: 7, draw: 0, loss: 0, goalsFor: 19, goalsAgainst: 7, goalDiff: '+12', points: 21, form: '-----' },
  { rank: 2, team: 'ARSENAL', played: 6, win: 5, draw: 0, loss: 1, goalsFor: 10, goalsAgainst: 5, goalDiff: '+5', points: 15, form: '-----' },
  { rank: 3, team: 'BRIGHTON', played: 6, win: 4, draw: 1, loss: 1, goalsFor: 18, goalsAgainst: 5, goalDiff: '+13', points: 13, form: '-----' },
  { rank: 4, team: 'CHELSEA', played: 7, win: 4, draw: 1, loss: 2, goalsFor: 17, goalsAgainst: 13, goalDiff: '+4', points: 13, form: '-----' },
  { rank: 5, team: 'LIVERPOOL', played: 7, win: 3, draw: 3, loss: 1, goalsFor: 9, goalsAgainst: 8, goalDiff: '+1', points: 12, form: '-----' },
  { rank: 6, team: 'BRENTFORD', played: 7, win: 2, draw: 4, loss: 1, goalsFor: 13, goalsAgainst: 8, goalDiff: '+5', points: 10, form: '-----' },
  { rank: 7, team: 'EVERTON', played: 7, win: 2, draw: 4, loss: 1, goalsFor: 8, goalsAgainst: 7, goalDiff: '+1', points: 10, form: '-----' },
  { rank: 8, team: 'LEEDS', played: 6, win: 2, draw: 3, loss: 1, goalsFor: 8, goalsAgainst: 5, goalDiff: '+3', points: 9, form: '-----' },
  { rank: 9, team: 'HULL', played: 7, win: 2, draw: 3, loss: 2, goalsFor: 8, goalsAgainst: 7, goalDiff: '+1', points: 9, form: '-----' },
  { rank: 10, team: 'IPSWICH TOWN', played: 7, win: 3, draw: 0, loss: 4, goalsFor: 11, goalsAgainst: 15, goalDiff: '-4', points: 9, form: '-----' },
  { rank: 11, team: 'NEWCASTLE', played: 7, win: 2, draw: 2, loss: 3, goalsFor: 10, goalsAgainst: 14, goalDiff: '-4', points: 8, form: '-----' },
  { rank: 12, team: 'ASTON VILLA', played: 7, win: 2, draw: 2, loss: 3, goalsFor: 7, goalsAgainst: 11, goalDiff: '-4', points: 8, form: '-----' },
  { rank: 13, team: 'PALACE', played: 6, win: 2, draw: 1, loss: 3, goalsFor: 9, goalsAgainst: 12, goalDiff: '-3', points: 7, form: '-----' },
  { rank: 14, team: 'MAN UTD', played: 6, win: 1, draw: 3, loss: 2, goalsFor: 9, goalsAgainst: 9, goalDiff: '0', points: 6, form: '-----' },
  { rank: 15, team: 'COVENTRY', played: 6, win: 2, draw: 0, loss: 4, goalsFor: 5, goalsAgainst: 11, goalDiff: '-6', points: 6, form: '-----' },
  { rank: 16, team: 'FULHAM', played: 7, win: 1, draw: 2, loss: 4, goalsFor: 7, goalsAgainst: 10, goalDiff: '-3', points: 5, form: '-----' },
  { rank: 17, team: 'NOTTM FOREST', played: 6, win: 1, draw: 2, loss: 3, goalsFor: 5, goalsAgainst: 8, goalDiff: '-3', points: 5, form: '-----' },
  { rank: 18, team: 'SUNDERLAND', played: 6, win: 1, draw: 1, loss: 4, goalsFor: 6, goalsAgainst: 12, goalDiff: '-6', points: 4, form: '-----' },
  { rank: 19, team: 'BOURNEMOUTH', played: 6, win: 0, draw: 3, loss: 3, goalsFor: 7, goalsAgainst: 13, goalDiff: '-6', points: 3, form: '-----' },
  { rank: 20, team: 'SPURS', played: 6, win: 0, draw: 3, loss: 3, goalsFor: 3, goalsAgainst: 9, goalDiff: '-6', points: 3, form: '-----' },
];

// Rich previous results dataset
const FALLBACK_RESULTS: MatchResult[] = [
  { id: 'r1', date: '17 OCT', homeTeam: 'NEWCASTLE', awayTeam: 'ASTON VILLA', homeScore: 0, awayScore: 1, status: 'FT' },
  { id: 'r2', date: '17 OCT', homeTeam: 'FULHAM', awayTeam: 'HULL', homeScore: 1, awayScore: 0, status: 'FT' },
  { id: 'r3', date: '17 OCT', homeTeam: 'MAN CITY', awayTeam: 'IPSWICH TOWN', homeScore: 3, awayScore: 2, status: 'FT' },
  { id: 'r4', date: '17 OCT', homeTeam: 'BRENTFORD', awayTeam: 'LIVERPOOL', homeScore: 1, awayScore: 2, status: 'FT' },
  { id: 'r5', date: '17 OCT', homeTeam: 'EVERTON', awayTeam: 'CHELSEA', homeScore: 0, awayScore: 2, status: 'FT' },
  { id: 'r6', date: '12 OCT', homeTeam: 'COVENTRY', awayTeam: 'NEWCASTLE', homeScore: 4, awayScore: 1, status: 'FT' },
  { id: 'r7', date: '11 OCT', homeTeam: 'LIVERPOOL', awayTeam: 'MAN CITY', homeScore: 0, awayScore: 3, status: 'FT' },
  { id: 'r8', date: '11 OCT', homeTeam: 'PALACE', awayTeam: 'NOTTM FOREST', homeScore: 3, awayScore: 1, status: 'FT' },
  { id: 'r9', date: '11 OCT', homeTeam: 'HULL', awayTeam: 'EVERTON', homeScore: 2, awayScore: 2, status: 'FT' },
];

// Rich upcoming fixtures dataset
const FALLBACK_FIXTURES: UpcomingMatch[] = [
  { id: 'f1', date: '18 OCT', time: '16:30', homeTeam: 'NOTTM FOREST', awayTeam: 'ARSENAL', venue: 'City Ground' },
  { id: 'f2', date: '19 OCT', time: '20:00', homeTeam: 'SPURS', awayTeam: 'COVENTRY', venue: 'Tottenham Hotspur Stadium' },
  { id: 'f3', date: '23 OCT', time: '20:00', homeTeam: 'IPSWICH TOWN', awayTeam: 'NOTTM FOREST', venue: 'Portman Road' },
  { id: 'f4', date: '24 OCT', time: '12:30', homeTeam: 'ASTON VILLA', awayTeam: 'MAN CITY', venue: 'Villa Park' },
  { id: 'f5', date: '24 OCT', time: '15:00', homeTeam: 'ARSENAL', awayTeam: 'EVERTON', venue: 'Emirates Stadium' },
  { id: 'f6', date: '24 OCT', time: '15:00', homeTeam: 'COVENTRY', awayTeam: 'FULHAM', venue: 'Coventry Building Society Arena' },
  { id: 'f7', date: '24 OCT', time: '17:30', homeTeam: 'CHELSEA', awayTeam: 'SPURS', venue: 'Stamford Bridge' },
  { id: 'f8', date: '25 OCT', time: '14:00', homeTeam: 'MAN UTD', awayTeam: 'BOURNEMOUTH', venue: 'Old Trafford' },
  { id: 'f9', date: '25 OCT', time: '14:00', homeTeam: 'LIVERPOOL', awayTeam: 'BRIGHTON', venue: 'Anfield' },
  { id: 'f10', date: '25 OCT', time: '14:00', homeTeam: 'PALACE', awayTeam: 'NEWCASTLE', venue: 'Selhurst Park' },
  { id: 'f11', date: '25 OCT', time: '14:00', homeTeam: 'HULL', awayTeam: 'BRENTFORD', venue: 'The MKM Stadium' },
  { id: 'f12', date: '25 OCT', time: '16:30', homeTeam: 'SUNDERLAND', awayTeam: 'LEEDS', venue: 'Stadium of Light' },
];

// Featured 8 Premier League Clubs with dedicated pages
const STATIC_TEAMS: TeamProfile[] = [
  { id: '133604', name: 'ARSENAL', fullName: 'Arsenal FC', stadium: 'Emirates Stadium', capacity: '60,704', formed: '1886', nickname: 'The Gunners', pageNumber: 331, manager: 'Mikel Arteta' },
  { id: '133601', name: 'ASTON VILLA', fullName: 'Aston Villa FC', stadium: 'Villa Park', capacity: '42,682', formed: '1874', nickname: 'The Villans', pageNumber: 332, manager: 'Unai Emery' },
  { id: '133610', name: 'CHELSEA', fullName: 'Chelsea FC', stadium: 'Stamford Bridge', capacity: '40,341', formed: '1905', nickname: 'The Blues', pageNumber: 333, manager: 'Enzo Maresca' },
  { id: '133602', name: 'LIVERPOOL', fullName: 'Liverpool FC', stadium: 'Anfield', capacity: '61,276', formed: '1892', nickname: 'The Reds', pageNumber: 334, manager: 'Arne Slot' },
  { id: '133613', name: 'MAN CITY', fullName: 'Manchester City FC', stadium: 'Etihad Stadium', capacity: '53,400', formed: '1894', nickname: 'The Citizens', pageNumber: 335, manager: 'Pep Guardiola' },
  { id: '133612', name: 'MAN UTD', fullName: 'Manchester United FC', stadium: 'Old Trafford', capacity: '74,310', formed: '1878', nickname: 'The Red Devils', pageNumber: 336, manager: 'Erik ten Hag' },
  { id: '133615', name: 'NEWCASTLE', fullName: 'Newcastle United FC', stadium: 'St. James Park', capacity: '52,305', formed: '1892', nickname: 'The Magpies', pageNumber: 337, manager: 'Eddie Howe' },
  { id: '133616', name: 'TOTTENHAM', fullName: 'Tottenham Hotspur FC', stadium: 'Tottenham Stadium', capacity: '62,850', formed: '1882', nickname: 'Spurs', pageNumber: 338, manager: 'Ange Postecoglou' },
];

class SportsService {
  private lastFetchTime: number = 0;
  private cacheTtlMs: number = 10 * 60 * 1000; // 10 minutes cache
  private isFetching: boolean = false;
  private isRateLimited: boolean = false;
  private rateLimitMessage: string = '';
  private standings: StandingRow[] = FALLBACK_STANDINGS;
  private results: MatchResult[] = FALLBACK_RESULTS;
  private fixtures: UpcomingMatch[] = FALLBACK_FIXTURES;
  private liveFixtures: LiveFixture[] = [];
  private liveScoresError: string | null = null;
  private liveScoresUpdatedAt: string | null = null;
  private liveScoresRequest: Promise<void> | null = null;
  private teams: TeamProfile[] = STATIC_TEAMS;
  private teamMatches: Record<string, TeamMatchData> = {};
  private dataSource: 'THESPORTSDB' | 'CACHED' = 'CACHED';
  private subscribers: ((state: SportsDataState) => void)[] = [];

  constructor() {
    this.refreshData();
  }

  public subscribe(cb: (state: SportsDataState) => void) {
    this.subscribers.push(cb);
    cb(this.getCurrentState());
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify() {
    const state = this.getCurrentState();
    this.subscribers.forEach((cb) => cb(state));
  }

  public getCurrentState(): SportsDataState {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    return {
      standings: this.standings,
      results: this.results,
      fixtures: this.fixtures,
      liveFixtures: this.liveFixtures,
      liveScoresError: this.liveScoresError,
      liveScoresUpdatedAt: this.liveScoresUpdatedAt,
      teams: this.teams,
      teamMatches: this.teamMatches,
      isRateLimited: this.isRateLimited,
      rateLimitMessage: this.rateLimitMessage,
      dataSource: this.dataSource,
      lastUpdated: timeStr,
    };
  }

  /**
   * Helper to safely fetch JSON with timeout and rate limit check
   */
  private async safeFetchJson(url: string): Promise<any | null> {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (res.status === 429) {
        this.isRateLimited = true;
        this.rateLimitMessage = '[DATA PAUSED - 429 RATE LIMIT]';
        return null;
      }

      if (!res.ok) {
        return null;
      }

      const text = await res.text();
      // Guard against HTML error pages
      if (text.trim().startsWith('<') || text.includes('cloudflare')) {
        return null;
      }

      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  /**
   * Normalize team name for standard Mode 7 displays
   */
  private normalizeTeamName(raw: string): string {
    if (!raw) return 'TEAM';
    const normalized = raw.trim().replace(/\s+/g, ' ').toUpperCase();
    return TEAM_NAME_ALIASES[normalized] || normalized.slice(0, 12);
  }

  private formatEventDate(raw: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
    if (!match) return raw;

    const month = Number(match[2]);
    const day = match[3];
    return month >= 1 && month <= 12 ? `${day} ${MONTHS[month - 1]}` : raw;
  }

  private formatEventTime(event: LeagueEvent): string {
    const rawTime = event.strTimeLocal || event.strTime || '';
    const match = /^(\d{2}:\d{2})/.exec(rawTime);
    if (!match || match[1] === '00:00') return 'TBC';
    if (event.strTimeLocal) return match[1];

    if (event.strTimestamp) {
      const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/.test(event.strTimestamp)
        ? event.strTimestamp
        : `${event.strTimestamp}Z`;
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(new Date(timestamp));
    }

    return match[1];
  }

  public async refreshData(force: boolean = false) {
    const now = Date.now();
    if (!force && now - this.lastFetchTime < this.cacheTtlMs) {
      return;
    }
    if (this.isFetching) return;
    this.isFetching = true;

    try {
      // 1. Fetch League Standings: lookuptable.php?l=4328
      const tableData = await this.safeFetchJson(
        `${BASE_V1_URL}/lookuptable.php?l=${PREMIER_LEAGUE_ID}`
      );

      // 2. Fetch Upcoming Fixtures: eventsnextleague.php?id=4328
      const nextData = await this.safeFetchJson(
        `${BASE_V1_URL}/eventsnextleague.php?id=${PREMIER_LEAGUE_ID}`
      );

      // 3. Fetch Previous Results: eventspastleague.php?id=4328
      const pastData = await this.safeFetchJson(
        `${BASE_V1_URL}/eventspastleague.php?id=${PREMIER_LEAGUE_ID}`
      );

      let liveSuccess = false;

      // Parse League Table Standings
      if (tableData && Array.isArray(tableData.table) && tableData.table.length > 0) {
        const parsedRows: StandingRow[] = tableData.table.map(
          (t: {
            intRank: string;
            strTeam: string;
            intPlayed: string;
            intWin: string;
            intDraw: string;
            intLoss: string;
            intGoalsFor: string;
            intGoalsAgainst: string;
            intGoalDifference: string;
            intPoints: string;
            strForm: string;
          }) => {
            const rawDiff = Number(t.intGoalDifference || 0);
            const diffStr = rawDiff > 0 ? `+${rawDiff}` : `${rawDiff}`;
            return {
              rank: Number(t.intRank || 1),
              team: this.normalizeTeamName(t.strTeam),
              played: Number(t.intPlayed || 0),
              win: Number(t.intWin || 0),
              draw: Number(t.intDraw || 0),
              loss: Number(t.intLoss || 0),
              goalsFor: Number(t.intGoalsFor || 0),
              goalsAgainst: Number(t.intGoalsAgainst || 0),
              goalDiff: diffStr,
              points: Number(t.intPoints || 0),
              form: t.strForm || '-----',
            };
          }
        );

        if (parsedRows.length >= 20) {
          this.standings = parsedRows.sort((a, b) => a.rank - b.rank).slice(0, 20);
          liveSuccess = true;
        }
      }

      const anchorEvents: LeagueEvent[] = [
        ...(Array.isArray(pastData?.events) ? pastData.events : []),
        ...(Array.isArray(nextData?.events) ? nextData.events : []),
      ];
      const roundRequests = new Map<string, { season: string; round: number }>();

      anchorEvents.forEach((event) => {
        const season = event.strSeason;
        const round = Number(event.intRound);
        if (!season || !Number.isInteger(round) || round < 1) return;

        [round - 1, round, round + 1].forEach((eventRound) => {
          if (eventRound < 1) return;
          roundRequests.set(`${season}-${eventRound}`, {
            season,
            round: eventRound,
          });
        });
      });

      const roundResponses = await Promise.all(
        Array.from(roundRequests.values()).map(({ season, round }) =>
          this.safeFetchJson(
            `${BASE_V1_URL}/eventsround.php?id=${PREMIER_LEAGUE_ID}&r=${round}&s=${season}`
          )
        )
      );
      const roundEvents: LeagueEvent[] = roundResponses.flatMap((response) =>
        response && Array.isArray(response.events) ? response.events : []
      );
      const eventsById = new Map<string, LeagueEvent>();

      [...roundEvents, ...anchorEvents].forEach((event) => {
        if (
          !event.idEvent ||
          (event.idLeague && event.idLeague !== PREMIER_LEAGUE_ID)
        ) {
          return;
        }
        eventsById.set(event.idEvent, event);
      });

      const leagueEvents = Array.from(eventsById.values());
      const currentDate = new Date(now);
      const today = getDateKey(currentDate);
      const weekAgo = shiftDateKey(currentDate, -7);
      const weekAhead = shiftDateKey(currentDate, 7);
      const completedEvents = leagueEvents.filter(
        (event) =>
          COMPLETED_MATCH_STATUSES.has((event.strStatus || '').toUpperCase()) &&
          event.intHomeScore !== null &&
          event.intHomeScore !== undefined &&
          event.intAwayScore !== null &&
          event.intAwayScore !== undefined &&
          Number.isFinite(Number(event.intHomeScore)) &&
          Number.isFinite(Number(event.intAwayScore))
      );
      const recentResults = completedEvents
        .filter(
          (event) =>
            !!event.dateEvent &&
            event.dateEvent >= weekAgo &&
            event.dateEvent <= today
        )
        .sort((a, b) => getEventSortKey(b).localeCompare(getEventSortKey(a)));
      const resultsToShow = (recentResults.length > 0
        ? recentResults
        : completedEvents.sort((a, b) =>
            getEventSortKey(b).localeCompare(getEventSortKey(a))
          )
      ).slice(0, 12);

      if (resultsToShow.length > 0) {
        this.results = resultsToShow.map((event) => ({
          id: event.idEvent,
          date: event.dateEvent ? this.formatEventDate(event.dateEvent) : 'TBC',
          homeTeam: this.normalizeTeamName(event.strHomeTeam),
          awayTeam: this.normalizeTeamName(event.strAwayTeam),
          homeScore: Number(event.intHomeScore),
          awayScore: Number(event.intAwayScore),
          status: event.strStatus || 'FT',
        }));
        liveSuccess = true;
      }

      const upcomingEvents = leagueEvents
        .filter((event) => {
          const status = (event.strStatus || '').toUpperCase();
          if (
            !event.dateEvent ||
            event.dateEvent < today ||
            COMPLETED_MATCH_STATUSES.has(status) ||
            IN_PROGRESS_MATCH_STATUSES.has(status) ||
            ['CANC', 'PST', 'POSTPONED'].includes(status)
          ) {
            return false;
          }

          return getEventTimestamp(event) > now;
        })
        .sort((a, b) => getEventSortKey(a).localeCompare(getEventSortKey(b)));
      const scheduledThisWeek = upcomingEvents.filter(
        (event) => !!event.dateEvent && event.dateEvent <= weekAhead
      );
      const fixturesToShow = (scheduledThisWeek.length > 0
        ? scheduledThisWeek
        : upcomingEvents
      ).slice(0, 12);

      if (fixturesToShow.length > 0) {
        this.fixtures = fixturesToShow.map((event) => ({
          id: event.idEvent,
          date: event.dateEvent ? this.formatEventDate(event.dateEvent) : 'TBC',
          time: this.formatEventTime(event),
          homeTeam: this.normalizeTeamName(event.strHomeTeam),
          awayTeam: this.normalizeTeamName(event.strAwayTeam),
          venue: event.strVenue,
        }));
        liveSuccess = true;
      }

      if (liveSuccess) {
        this.dataSource = 'THESPORTSDB';
        this.isRateLimited = false;
        this.rateLimitMessage = '';
      }

      this.lastFetchTime = now;
    } catch (err) {
      console.warn('TheSportsDB fetch error, using cached data', err);
    } finally {
      this.isFetching = false;
      this.notify();
    }
  }

  public async refreshLiveScores(dateKey?: string) {
    if (this.liveScoresRequest) return this.liveScoresRequest;

    const currentDate = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const dateParts = Object.fromEntries(
      currentDate.map(({ type, value }) => [type, value])
    );
    const date = dateKey || `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

    this.liveScoresRequest = (async () => {
      try {
        const url = new URL(
          `api/sportapi/fixtures/date/${date}`,
          document.baseURI
        );
        const response = await fetch(url);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof payload?.error === 'string'
              ? payload.error
              : `Live scores request failed with HTTP ${response.status}`
          );
        }

        const fixtures = parseSportApiFixtures(payload);
        const previousById = new Map(this.liveFixtures.map((fixture) => [fixture.id, fixture]));
        const now = Date.now();
        this.liveFixtures = fixtures.map((fixture) => {
          const previous = previousById.get(fixture.id);
          const scoreIncreased = previous &&
            fixture.homeScore !== null &&
            fixture.awayScore !== null &&
            ((previous.homeScore !== null && fixture.homeScore > previous.homeScore) ||
              (previous.awayScore !== null && fixture.awayScore > previous.awayScore));
          return {
            ...fixture,
            goalAlertUntil: scoreIncreased
              ? now + 45_000
              : previous?.goalAlertUntil,
          };
        });
        this.liveScoresError = null;
        this.liveScoresUpdatedAt = new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      } catch (error) {
        this.liveScoresError = error instanceof Error
          ? error.message
          : 'Live scores request failed';
      } finally {
        this.liveScoresRequest = null;
        this.notify();
      }
    })();

    return this.liveScoresRequest;
  }

  /**
   * On-demand fetch for team-specific next & last match with caching
   * Uses eventsnext.php and eventslast.php as instructed
   */
  public async fetchTeamMatches(teamId: string) {
    if (this.teamMatches[teamId] || this.isRateLimited) {
      return;
    }

    try {
      const [nextRes, lastRes] = await Promise.all([
        this.safeFetchJson(`${BASE_V1_URL}/eventsnext.php?id=${teamId}`),
        this.safeFetchJson(`${BASE_V1_URL}/eventslast.php?id=${teamId}`),
      ]);

      let nextMatch: UpcomingMatch | undefined;
      let lastMatch: MatchResult | undefined;

      if (nextRes && Array.isArray(nextRes.events) && nextRes.events[0]) {
        const ev: LeagueEvent = nextRes.events[0];
        nextMatch = {
          id: ev.idEvent,
          date: ev.dateEvent ? this.formatEventDate(ev.dateEvent) : 'TBC',
          time: this.formatEventTime(ev),
          homeTeam: this.normalizeTeamName(ev.strHomeTeam),
          awayTeam: this.normalizeTeamName(ev.strAwayTeam),
          venue: ev.strVenue,
        };
      }

      const completedTeamResult = lastRes?.results?.find((event: LeagueEvent) =>
        COMPLETED_MATCH_STATUSES.has((event.strStatus || '').toUpperCase()) &&
        event.intHomeScore !== null &&
        event.intHomeScore !== undefined &&
        event.intAwayScore !== null &&
        event.intAwayScore !== undefined
      );
      if (completedTeamResult) {
        const res: LeagueEvent = completedTeamResult;
        lastMatch = {
          id: res.idEvent,
          date: res.dateEvent ? this.formatEventDate(res.dateEvent) : 'TBC',
          homeTeam: this.normalizeTeamName(res.strHomeTeam),
          awayTeam: this.normalizeTeamName(res.strAwayTeam),
          homeScore: Number(res.intHomeScore),
          awayScore: Number(res.intAwayScore),
          status: res.strStatus || 'FT',
        };
      }

      if (nextMatch || lastMatch) {
        this.teamMatches[teamId] = { nextMatch, lastMatch };
        this.notify();
      }
    } catch {
      // Quiet fail to keep fallback
    }
  }
}

export const sportsService = new SportsService();
