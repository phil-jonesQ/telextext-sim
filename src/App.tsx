import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TeletextPage, CrtConfig } from './types/teletext';
import { DEFAULT_PAGES } from './data/pages';
import { parseTeletextScreen } from './utils/teletextParser';
import { TeletextCanvas } from './components/TeletextCanvas';
import { RemoteControl } from './components/RemoteControl';
import { CrtSettingsModal } from './components/CrtSettingsModal';
import { PageEditor } from './components/PageEditor';
import { teletextAudio } from './utils/audio';
import { sportsService, SportsDataState } from './services/sportsService';
import {
  generatePage301,
  generatePage302,
  generatePage303,
  generatePage324,
  generatePage330,
  generateTeamPage,
} from './utils/sportsTeletextGenerator';
import { Tv, Sliders, Edit3, Volume2, VolumeX, HelpCircle, RotateCcw, Check, Trophy } from 'lucide-react';

const STORAGE_KEY = 'ceefax_mode7_pages_v3';

export default function App() {
  // Load pages from localStorage or fallback to default factory pages
  const [pages, setPages] = useState<Record<number, TeletextPage>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && parsed[100]) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to parse pages from localStorage', err);
      }
    }
    return DEFAULT_PAGES;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const [currentPageNum, setCurrentPageNum] = useState<number>(100);
  const [currentSubPageIdx, setCurrentSubPageIdx] = useState<number>(0);
  const [pendingDigits, setPendingDigits] = useState<string>('');
  const [isHeld, setIsHeld] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  
  // Page search / raster rolling simulation state
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchingHeaderPage, setSearchingHeaderPage] = useState<number>(100);

  // Modals & editor state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editorStartRow, setEditorStartRow] = useState<number>(0);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Top-to-bottom 500ms raster scanline draw counter (1 to 25)
  const [visibleRowsCount, setVisibleRowsCount] = useState<number>(25);

  // CRT configuration (interlace scanlines disabled per user request)
  const [crtConfig, setCrtConfig] = useState<CrtConfig>({
    scanlines: false,
    curvature: true,
    bloom: false,
    flicker: false,
    rgbPhosphor: false,
    soundEnabled: true,
    ambientHum: false,
  });

  // Current real-time clock for teletext header
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toTimeString().split(' ')[0]; // HH:MM:SS
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = days[now.getDay()];
      const date = now.getDate().toString().padStart(2, '0');
      const mon = months[now.getMonth()];
      setCurrentTimeStr(time);
      setCurrentDateStr(`${day} ${date} ${mon}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sports live data state for Page 302
  const [sportsState, setSportsState] = useState<SportsDataState>(() =>
    sportsService.getCurrentState()
  );

  useEffect(() => {
    const unsub = sportsService.subscribe((state) => {
      setSportsState(state);
    });
    return unsub;
  }, []);

  // On-demand fetch of team-specific matches when user opens a team page
  useEffect(() => {
    if (currentPageNum >= 331 && currentPageNum <= 338) {
      const team = sportsState.teams.find((t) => t.pageNumber === currentPageNum);
      if (team) {
        sportsService.fetchTeamMatches(team.id);
      }
    }
  }, [currentPageNum, sportsState.teams]);

  // Current page object (or fallback for missing page)
  const activePage: TeletextPage = useMemo(() => {
    // Page 301: Sports Desk Index
    if (currentPageNum === 301) {
      if (pages[301] && pages[301].isCustomUserEdit) return pages[301];
      return generatePage301(sportsState);
    }

    // Page 302: Premier League Previous Results
    if (currentPageNum === 302) {
      if (pages[302] && pages[302].isCustomUserEdit) return pages[302];
      return generatePage302(sportsState);
    }

    // Page 303: Premier League Upcoming Fixtures
    if (currentPageNum === 303) {
      if (pages[303] && pages[303].isCustomUserEdit) return pages[303];
      return generatePage303(sportsState);
    }

    // Page 324: Premier League Table / Standings
    if (currentPageNum === 324) {
      if (pages[324] && pages[324].isCustomUserEdit) return pages[324];
      return generatePage324(sportsState);
    }

    // Page 330: Premier League Club Directory
    if (currentPageNum === 330) {
      if (pages[330] && pages[330].isCustomUserEdit) return pages[330];
      return generatePage330(sportsState);
    }

    // Pages 331 to 338: Individual Team Profile Pages
    if (currentPageNum >= 331 && currentPageNum <= 338) {
      if (pages[currentPageNum] && pages[currentPageNum].isCustomUserEdit) return pages[currentPageNum];
      const team = sportsState.teams.find((t) => t.pageNumber === currentPageNum);
      if (team) {
        return generateTeamPage(team, sportsState);
      }
    }

    if (pages[currentPageNum]) {
      return pages[currentPageNum];
    }
    // Missing page fallback
    return {
      pageNumber: currentPageNum,
      title: 'Not Found',
      category: 'user',
      subPages: [
        {
          lines: [
            '',
            '       PAGE ' + currentPageNum + ' NOT BROADCAST',
            '',
            '  The page you requested is currently not',
            '  in the transmission cycle.',
            '',
            '  Please select another page or press',
            '  INDEX on your remote to return to',
            '  the main Ceefax directory (Page 100).',
            '',
            '  ---------------------------------------',
            '  101 Headlines   120 Markets',
            '  400 Weather     500 Sport',
            '  550 Bamboozle   700 Mode 7 Spec Demo',
            '  ---------------------------------------',
          ],
        },
      ],
      fastext: { red: 100, green: 101, yellow: 120, cyan: 400 },
    };
  }, [pages, currentPageNum]);

  // Current subpage index bounds
  const currentSubPage = Math.min(
    currentSubPageIdx,
    Math.max(0, (activePage.subPages?.length || 1) - 1)
  );

  // Subpage auto-cycle timer (runs if not held and more than 1 subpage)
  useEffect(() => {
    if (isHeld || isSearching) return;
    const totalSubs = activePage.subPages.length;
    if (totalSubs <= 1) return;

    const timer = setInterval(() => {
      setCurrentSubPageIdx((prev) => (prev + 1) % totalSubs);
    }, 8000); // 8-second subpage cycle

    return () => clearInterval(timer);
  }, [activePage, isHeld, isSearching]);

  // Jump to specific page with authentic raster search animation and 500ms top-to-bottom line draw
  const navigateToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 100 || targetPage > 899) return;
      setPendingDigits('');
      setIsRevealed(false);
      setCurrentSubPageIdx(0);

      // Start page search animation
      setIsSearching(true);
      let searchCounter = 100 + Math.floor(Math.random() * 50);
      let steps = 0;
      const maxSteps = 6;

      const searchInterval = setInterval(() => {
        searchCounter = (searchCounter + 13) % 900;
        if (searchCounter < 100) searchCounter += 100;
        setSearchingHeaderPage(searchCounter);
        teletextAudio.playPageScanPip();
        steps++;

        if (steps >= maxSteps) {
          clearInterval(searchInterval);
          setCurrentPageNum(targetPage);
          setSearchingHeaderPage(targetPage);
          setIsSearching(false);
          teletextAudio.playPageFound();

          // 500ms Top-to-Bottom sequential line draw (20ms per row * 24 rows = 480ms)
          setVisibleRowsCount(1);
          let row = 1;
          const drawInterval = setInterval(() => {
            row++;
            setVisibleRowsCount(row);
            if (row >= 25) {
              clearInterval(drawInterval);
            }
          }, 20);
        }
      }, 65);
    },
    []
  );

  // Handle clicking on a row on the CRT to edit it directly
  const handleRowClick = (rowIndex: number) => {
    setEditorStartRow(Math.max(0, rowIndex - 1)); // Row 0 is header, row 1-24 are lines 0-23
    setIsEditorOpen(true);
  };

  // Digit input from remote or keyboard (collects 3 digits)
  const handleDigitInput = useCallback(
    (digit: string) => {
      const nextPending = pendingDigits + digit;
      teletextAudio.playRemoteClick();

      if (nextPending.length === 3) {
        const pageNum = parseInt(nextPending, 10);
        setPendingDigits('');
        if (pageNum >= 100 && pageNum <= 899) {
          navigateToPage(pageNum);
        }
      } else {
        setPendingDigits(nextPending);
      }
    },
    [pendingDigits, navigateToPage]
  );

  // Fastext button press
  const handleFastextPress = useCallback(
    (color: 'red' | 'green' | 'yellow' | 'cyan') => {
      const links = activePage.fastext;
      if (!links) return;
      const target = links[color];
      if (target) {
        navigateToPage(target);
      }
    },
    [activePage, navigateToPage]
  );

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditorOpen) return; // Don't intercept while typing in editor

      if (e.key >= '0' && e.key <= '9') {
        handleDigitInput(e.key);
      } else if (e.key === 'r' || e.key === 'R') {
        setIsRevealed((prev) => !prev);
        teletextAudio.playRemoteClick();
      } else if (e.key === 'h' || e.key === 'H') {
        setIsHeld((prev) => !prev);
        teletextAudio.playRemoteClick();
      } else if (e.key === 'i' || e.key === 'I') {
        navigateToPage(100);
      } else if (e.key === 'ArrowUp') {
        navigateToPage(currentPageNum + 1 > 899 ? 100 : currentPageNum + 1);
      } else if (e.key === 'ArrowDown') {
        navigateToPage(currentPageNum - 1 < 100 ? 899 : currentPageNum - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentSubPageIdx((prev) => (prev + 1) % activePage.subPages.length);
        teletextAudio.playRemoteClick();
      } else if (e.key === 'ArrowLeft') {
        setCurrentSubPageIdx((prev) =>
          prev === 0 ? activePage.subPages.length - 1 : prev - 1
        );
        teletextAudio.playRemoteClick();
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        setPendingDigits('');
      } else if (e.key === 'F1') {
        e.preventDefault();
        handleFastextPress('red');
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleFastextPress('green');
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleFastextPress('yellow');
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleFastextPress('cyan');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isEditorOpen,
    handleDigitInput,
    navigateToPage,
    currentPageNum,
    activePage,
    handleFastextPress,
  ]);

  // Generate Mode 7 dynamic Row 0 Header
  // e.g. "P100  CEEFAX 100  Sun 18 Oct  10:03:45"
  const headerLine = useMemo(() => {
    const pagePrompt = pendingDigits ? `P${pendingDigits}..` : `P${currentPageNum}`;
    const rollingNum = isSearching ? searchingHeaderPage : currentPageNum;
    const headerTitle = `CEEFAX ${rollingNum}`;
    const datePart = currentDateStr || 'Sun 18 Oct';
    const timePart = currentTimeStr || '10:00:00';

    // Format to exactly 40 chars: "P100  CEEFAX 100  Sun 18 Oct  10:03:45"
    const left = `${pagePrompt.padEnd(6, ' ')}${headerTitle}`;
    const right = `${datePart}  ${timePart}`;
    const spaces = Math.max(1, 40 - left.length - right.length);
    return `${left}${' '.repeat(spaces)}${right}`.slice(0, 40);
  }, [
    pendingDigits,
    currentPageNum,
    isSearching,
    searchingHeaderPage,
    currentDateStr,
    currentTimeStr,
  ]);

  // Current subpage lines parsed into Mode 7 cell grid
  const screenCells = useMemo(() => {
    const rawLines = activePage.subPages[currentSubPage]?.lines || [];
    // Ensure 25 lines
    const padded = [...rawLines];
    while (padded.length < 24) {
      padded.push('');
    }
    // Prepend Row 0 header placeholder
    const fullScreenLines = [headerLine, ...padded.slice(0, 24)];
    return parseTeletextScreen(fullScreenLines, isRevealed);
  }, [activePage, currentSubPage, headerLine, isRevealed]);

  // Save changes from Page Editor and persist to localStorage
  const handleSavePageLines = (newLines: string[]) => {
    setPages((prev) => {
      const updated = {
        ...prev,
        [currentPageNum]: {
          ...activePage,
          isCustomUserEdit: true,
          subPages: [
            {
              lines: newLines,
              fastext: activePage.fastext,
            },
          ],
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        showToast(`✓ Page ${currentPageNum} saved to browser storage`);
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }

      return updated;
    });
  };

  // Reset all pages to factory defaults
  const handleResetToDefaults = () => {
    if (confirm('Restore all Ceefax pages to original factory defaults? Any custom edits will be cleared.')) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setPages(DEFAULT_PAGES);
      showToast('✓ Restored all pages to factory defaults');
      navigateToPage(100);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      {/* Universal 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-neutral-900 border-b border-neutral-800 shrink-0">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-mono font-bold text-black text-sm shadow-[0_0_12px_rgba(251,191,36,0.5)]">
            M7
          </div>
          <span className="text-base font-bold font-mono tracking-wider text-amber-400">
            BBC CEEFAX EMULATOR
          </span>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-neutral-300">
          <button
            onClick={() => navigateToPage(101)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            101 Headlines
          </button>
          <button
            onClick={() => navigateToPage(120)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            120 Markets
          </button>
          <button
            onClick={() => navigateToPage(302)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer text-emerald-400 font-bold flex items-center gap-1"
          >
            <Trophy className="w-3 h-3 text-emerald-400 inline" />
            <span>302 PL Scores</span>
          </button>
          <button
            onClick={() => navigateToPage(400)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            400 Weather
          </button>
          <button
            onClick={() => navigateToPage(550)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            550 Bamboozle
          </button>
          <button
            onClick={() => navigateToPage(700)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer text-cyan-400"
          >
            700 Mode 7 Demo
          </button>
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Audio toggle button */}
          <button
            onClick={() => {
              const nextState = !crtConfig.soundEnabled;
              setCrtConfig((prev) => ({ ...prev, soundEnabled: nextState }));
              teletextAudio.setEnabled(nextState);
            }}
            title={crtConfig.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {crtConfig.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          {/* Reset All Pages */}
          <button
            onClick={handleResetToDefaults}
            title="Reset all pages to factory defaults"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* CRT Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>CRT Display</span>
          </button>

          {/* Edit Page */}
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-black shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Page</span>
          </button>
        </div>
      </header>

      {/* Floating Auto-Save Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-400 text-black px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-300 animate-in fade-in zoom-in duration-150">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Emulator Stage */}
      <main className="flex-1 flex flex-col xl:flex-row items-center justify-center p-4 lg:p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Left / Center: Vintage CRT Television */}
        <div className="flex-1 flex flex-col items-center w-full max-w-3xl">
          {/* CRT Screen Frame */}
          <TeletextCanvas
            screenCells={screenCells}
            headerText={headerLine}
            crtConfig={crtConfig}
            revealConcealed={isRevealed}
            visibleRowsCount={visibleRowsCount}
            onRowClick={handleRowClick}
            onPageClick={navigateToPage}
          />

          {/* Dedicated Scratchpad Interactive Panel (Visible on Page 800) */}
          {currentPageNum === 800 ? (
            <div className="mt-3 w-full max-w-[800px] bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 border-2 border-amber-500/80 rounded-xl p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
                  <span className="font-mono font-bold text-sm text-amber-300">
                    PAGE 800: USER SCRATCHPAD ACTIVE
                  </span>
                </div>
                <p className="text-xs text-neutral-300 font-mono mt-0.5">
                  Click any row directly on the TV screen above, or use the button to edit:
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditorStartRow(0);
                    setIsEditorOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold font-mono text-xs rounded-lg shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>EDIT THIS PAGE</span>
                </button>
              </div>
            </div>
          ) : (
            /* General quick bar for editing any page */
            <div className="mt-2 flex items-center justify-between w-full max-w-[800px] px-2 text-xs font-mono text-neutral-400">
              <span className="text-[11px] text-neutral-500 hidden sm:inline">
                Click any line on the TV to edit it in Mode 7
              </span>
              <button
                onClick={() => {
                  setEditorStartRow(0);
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 transition-colors cursor-pointer text-xs ml-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Page {currentPageNum}</span>
              </button>
            </div>
          )}

          {/* Screen Status Info Strip */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between w-full max-w-[800px] px-3 text-xs font-mono text-neutral-400 gap-2">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold">
                PAGE {currentPageNum}
                {activePage.subPages.length > 1 && (
                  <span className="text-neutral-300 ml-1">
                    [{currentSubPage + 1}/{activePage.subPages.length}]
                  </span>
                )}
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300 truncate max-w-[180px]">
                {activePage.title}
              </span>
              {isHeld && (
                <span className="px-1.5 py-0.5 text-[10px] bg-red-950 text-red-400 border border-red-800 rounded font-bold">
                  HOLD ACTIVE
                </span>
              )}
              {isRevealed && (
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-950 text-amber-400 border border-amber-800 rounded font-bold">
                  REVEALED
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
              <span>Tip: Type 3 digits on keyboard</span>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="hover:text-amber-400 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Shortcuts</span>
              </button>
            </div>
          </div>

          {/* Quick Page Jump Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 w-full max-w-[850px] px-2 text-xs font-mono">
            {[
              { num: 100, label: 'Index' },
              { num: 101, label: 'Headlines' },
              { num: 120, label: 'Markets' },
              { num: 301, label: 'Sport Desk' },
              { num: 302, label: 'PL Results' },
              { num: 303, label: 'PL Fixtures' },
              { num: 324, label: 'PL Table' },
              { num: 330, label: 'PL Clubs' },
              { num: 400, label: 'Weather' },
              { num: 500, label: 'Sport' },
              { num: 550, label: 'Bamboozle' },
              { num: 700, label: 'Mode 7' },
              { num: 800, label: 'Scratchpad' },
            ].map((item) => (
              <button
                key={item.num}
                onClick={() => navigateToPage(item.num)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currentPageNum === item.num
                    ? 'bg-amber-400 text-black font-bold shadow-sm'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                <span className="text-amber-300/80 mr-1">{item.num}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Retro Remote Control Handset */}
        <div className="w-full xl:w-auto flex flex-col items-center shrink-0">
          <RemoteControl
            currentPage={currentPageNum}
            currentSubPage={currentSubPage}
            totalSubPages={activePage.subPages.length}
            fastext={activePage.fastext}
            isHeld={isHeld}
            isRevealed={isRevealed}
            pendingDigits={pendingDigits}
            onDigitPress={handleDigitInput}
            onFastextPress={handleFastextPress}
            onRevealToggle={() => setIsRevealed((prev) => !prev)}
            onHoldToggle={() => setIsHeld((prev) => !prev)}
            onIndexPress={() => navigateToPage(100)}
            onPageChange={(delta) => {
              const next = currentPageNum + delta;
              if (next >= 100 && next <= 899) navigateToPage(next);
            }}
            onSubPageChange={(delta) => {
              const total = activePage.subPages.length;
              if (total <= 1) return;
              setCurrentSubPageIdx((prev) => (prev + delta + total) % total);
            }}
            onClearInput={() => setPendingDigits('')}
          />
        </div>
      </main>

      {/* Keyboard Shortcuts Dialog */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md rounded-2xl p-6 font-mono text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="font-bold text-amber-400">KEYBOARD SHORTCUTS</h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">0 - 9</span>
                <span className="text-white">Type 3-digit page number (e.g. 101)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">R key</span>
                <span className="text-white">Toggle REVEAL (Concealed Quiz Answers)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">H key</span>
                <span className="text-white">Toggle HOLD (Stop subpage cycling)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">I key</span>
                <span className="text-white">Jump to INDEX (Page 100)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Arrow Up / Down</span>
                <span className="text-white">Next / Previous Page</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Arrow Left / Right</span>
                <span className="text-white">Step through subpages</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">F1 / F2 / F3 / F4</span>
                <span className="text-white">Fastext Red / Green / Yellow / Cyan</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Esc / Backspace</span>
                <span className="text-white">Cancel pending page input</span>
              </div>
            </div>
            <button
              onClick={() => setIsHelpOpen(false)}
              className="mt-5 w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg text-xs"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}

      {/* CRT Settings Modal */}
      <CrtSettingsModal
        isOpen={isSettingsOpen}
        config={crtConfig}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateConfig={setCrtConfig}
      />

      {/* Mode 7 Interactive Page Editor */}
      <PageEditor
        initialLines={activePage.subPages[currentSubPage]?.lines || []}
        pageNumber={currentPageNum}
        initialRow={editorStartRow}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePageLines}
      />
    </div>
  );
}
