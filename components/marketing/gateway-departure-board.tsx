"use client";

import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

type BoardRow = {
  time: string;
  model: string;
  provider: string;
  path: string;
  p95: string;
  status: string;
};

type BoardScene = {
  label: string;
  note: string;
};

type BoardProps = {
  autoPlay?: boolean;
  boardWidth?: number;
  maxRows?: number;
  showFooter?: boolean;
  showSceneNote?: boolean;
  timeZone?: string;
};

const FLAP_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FLAP_DIGITS = "0123456789";

const SCENES: BoardScene[] = [
  { label: "STEADY", note: "primary upstream stable" },
  { label: "SURGE", note: "burst load crossing lanes" },
  { label: "FAILOVER", note: "fallback provider engaged" },
];

const ROW_TRACKS: BoardRow[][] = [
  [
    { time: "12:40", model: "GPT-4O", provider: "HKG", path: "G1>OPEN", p95: "142", status: "STEADY" },
    { time: "12:40", model: "GPT-4O", provider: "HKG", path: "G1>OPEN", p95: "231", status: "QUEUED" },
    { time: "12:40", model: "GPT-4O", provider: "HKG", path: "G2>AZUR", p95: "274", status: "FAILOV" },
  ],
  [
    { time: "12:41", model: "O3-MINI", provider: "SIN", path: "G1>OPEN", p95: "168", status: "STEADY" },
    { time: "12:41", model: "O3-MINI", provider: "SIN", path: "G1>OPEN", p95: "248", status: "PROBE" },
    { time: "12:41", model: "O3-MINI", provider: "SIN", path: "G2>AZUR", p95: "289", status: "FAILOV" },
  ],
  [
    { time: "12:42", model: "CLAUDE-3.7", provider: "SIN", path: "G3>ANTH", p95: "154", status: "STEADY" },
    { time: "12:42", model: "CLAUDE-3.7", provider: "SIN", path: "G3>ANTH", p95: "198", status: "SURGE" },
    { time: "12:42", model: "CLAUDE-3.7", provider: "SIN", path: "G1>OPEN", p95: "252", status: "SPILL" },
  ],
  [
    { time: "12:44", model: "GEMINI-2.5P", provider: "NRT", path: "G4>GOOG", p95: "163", status: "STEADY" },
    { time: "12:44", model: "GEMINI-2.5P", provider: "NRT", path: "G4>GOOG", p95: "224", status: "THRTLD" },
    { time: "12:44", model: "GEMINI-2.5P", provider: "NRT", path: "G2>AZUR", p95: "211", status: "RECOVR" },
  ],
  [
    { time: "12:46", model: "DEEPSEEK-V3", provider: "SHA", path: "G5>DEEP", p95: "129", status: "STEADY" },
    { time: "12:46", model: "DEEPSEEK-V3", provider: "SHA", path: "G5>DEEP", p95: "216", status: "SURGE" },
    { time: "12:46", model: "DEEPSEEK-V3", provider: "SHA", path: "G1>OPEN", p95: "302", status: "REROUT" },
  ],
  [
    { time: "12:48", model: "DEEPSEEK-R1", provider: "FRA", path: "G5>DEEP", p95: "188", status: "STEADY" },
    { time: "12:48", model: "DEEPSEEK-R1", provider: "FRA", path: "G5>DEEP", p95: "309", status: "THRTLD" },
    { time: "12:48", model: "DEEPSEEK-R1", provider: "FRA", path: "G3>ANTH", p95: "328", status: "FAILOV" },
  ],
  [
    { time: "12:49", model: "GPT-4.1", provider: "SJC", path: "G1>OPEN", p95: "149", status: "STEADY" },
    { time: "12:49", model: "GPT-4.1", provider: "SJC", path: "G1>OPEN", p95: "212", status: "PROBE" },
    { time: "12:49", model: "GPT-4.1", provider: "SJC", path: "G2>AZUR", p95: "268", status: "DEGRAD" },
  ],
  [
    { time: "12:51", model: "CLAUDE-3.5", provider: "AMS", path: "G3>ANTH", p95: "162", status: "STEADY" },
    { time: "12:51", model: "CLAUDE-3.5", provider: "AMS", path: "G3>ANTH", p95: "238", status: "QUEUED" },
    { time: "12:51", model: "CLAUDE-3.5", provider: "AMS", path: "G1>OPEN", p95: "219", status: "RECOVR" },
  ],
  [
    { time: "12:53", model: "LLAMA-4", provider: "LAX", path: "G6>META", p95: "176", status: "STEADY" },
    { time: "12:53", model: "LLAMA-4", provider: "LAX", path: "G6>META", p95: "257", status: "SURGE" },
    { time: "12:53", model: "LLAMA-4", provider: "LAX", path: "G2>AZUR", p95: "311", status: "FAILOV" },
  ],
  [
    { time: "12:54", model: "QWQ-32B", provider: "HKG", path: "G7>ALIY", p95: "133", status: "STEADY" },
    { time: "12:54", model: "QWQ-32B", provider: "HKG", path: "G7>ALIY", p95: "207", status: "PROBE" },
    { time: "12:54", model: "QWQ-32B", provider: "HKG", path: "G5>DEEP", p95: "241", status: "SPILL" },
  ],
  [
    { time: "12:56", model: "MISTRAL-7B", provider: "CDG", path: "G8>MSTR", p95: "182", status: "STEADY" },
    { time: "12:56", model: "MISTRAL-7B", provider: "CDG", path: "G8>MSTR", p95: "269", status: "QUEUED" },
    { time: "12:56", model: "MISTRAL-7B", provider: "CDG", path: "G1>OPEN", p95: "296", status: "REROUT" },
  ],
  [
    { time: "12:58", model: "KIMI-K2", provider: "DXB", path: "G9>MOON", p95: "171", status: "STEADY" },
    { time: "12:58", model: "KIMI-K2", provider: "DXB", path: "G9>MOON", p95: "281", status: "THRTLD" },
    { time: "12:58", model: "KIMI-K2", provider: "DXB", path: "G2>AZUR", p95: "319", status: "FAILOV" },
  ],
];

const COLUMN_WIDTHS = {
  time: 8,
  model: 12,
  provider: 4,
  path: 24,
  p95: 3,
  status: 10,
} as const;

const INITIAL_ROW_STEPS = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2] as const;
const TIME_OFFSETS_IN_MINUTES = [0, 1, 2, 4, 6, 8, 9, 11, 13, 14, 16, 18] as const;

function normalizeFlapValue(value: string, width: number) {
  return value.toUpperCase().padEnd(width, " ").slice(0, width);
}

function formatBoardTime(seed: Date, rowIndex: number, timeZone: string) {
  const offset = TIME_OFFSETS_IN_MINUTES[rowIndex % TIME_OFFSETS_IN_MINUTES.length] ?? rowIndex;
  const rowTime = new Date(seed.getTime() + offset * 60_000);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).format(rowTime);
}

function getShortestFlapSteps(from: string, to: string) {
  if (from === to) return [to];

  const isDigitPair = FLAP_DIGITS.includes(from) && FLAP_DIGITS.includes(to);
  const isAlphaPair = FLAP_ALPHA.includes(from) && FLAP_ALPHA.includes(to);
  const source = isDigitPair ? FLAP_DIGITS : isAlphaPair ? FLAP_ALPHA : null;

  if (!source) return [to];

  const start = source.indexOf(from);
  const end = source.indexOf(to);
  const forwardDistance = (end - start + source.length) % source.length;
  const backwardDistance = (start - end + source.length) % source.length;
  const direction = forwardDistance <= backwardDistance ? 1 : -1;
  const distance = Math.min(forwardDistance, backwardDistance);
  const steps: string[] = [];

  for (let offset = 1; offset <= distance; offset += 1) {
    const nextIndex = (start + direction * offset + source.length) % source.length;
    steps.push(source[nextIndex] ?? to);
  }

  return steps.length > 0 ? steps : [to];
}

function statusTone(status: string): "default" | "accent" | "warning" | "info" {
  if (status === "FAILOV" || status === "DEGRAD" || status === "THRTLD") return "info";
  if (status === "REROUT" || status === "SURGE" || status === "PROBE" || status === "SPILL") return "warning";
  if (status === "RECOVR") return "accent";
  return "default";
}

function formatRoute(row: BoardRow) {
  const [gatewayCode = "G1", upstreamCode = "OPEN"] = row.path.split(">");
  const lane = `API > ${gatewayCode} > ${upstreamCode}`;

  switch (row.status) {
    case "STEADY":
      return `${lane} MAIN`;
    case "SURGE":
      return `${lane} BURST`;
    case "REROUT":
      return `${lane} SWAP`;
    case "QUEUED":
      return `${lane} QUEUE`;
    case "FAILOV":
      return `${lane} FBACK`;
    case "PROBE":
      return `${lane} PROBING`;
    case "SPILL":
      return `${lane} SPILLOVR`;
    case "RECOVR":
      return `${lane} RECOVERY`;
    case "THRTLD":
      return `${lane} THROTTL`;
    case "DEGRAD":
      return `${lane} DEGRADE`;
    default:
      return lane;
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "STEADY":
      return "HEALTHY";
    case "SURGE":
      return "SURGING";
    case "REROUT":
      return "REROUTED";
    case "QUEUED":
      return "QUEUED";
    case "FAILOV":
      return "FAILOVER";
    case "PROBE":
      return "PROBING";
    case "SPILL":
      return "SPILLING";
    case "RECOVR":
      return "RECOVERY";
    case "THRTLD":
      return "LIMITING";
    case "DEGRAD":
      return "DEGRADED";
    default:
      return status;
  }
}

function FlapCell({
  char,
  tone,
  shouldAnimate,
}: {
  char: string;
  tone: "default" | "accent" | "warning" | "info";
  shouldAnimate: boolean;
}) {
  const [currentChar, setCurrentChar] = useState(char);
  const [nextChar, setNextChar] = useState(char);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setCurrentChar(char);
      setNextChar(char);
      setFlipping(false);
      return undefined;
    }

    if (char === currentChar) return undefined;

    setNextChar(char);
    setFlipping(true);

    const timer = window.setTimeout(() => {
      setCurrentChar(char);
      setFlipping(false);
    }, 320);

    return () => window.clearTimeout(timer);
  }, [char, currentChar, shouldAnimate]);

  const displayCurrent = currentChar === " " ? "\u00A0" : currentChar;
  const displayNext = nextChar === " " ? "\u00A0" : nextChar;

  return (
    <span className={`tm-departure-cell ${flipping ? "is-flipping" : ""}`} data-tone={tone}>
      <span className="tm-departure-half tm-departure-top">
        <span className="tm-departure-glyph">{displayCurrent}</span>
      </span>
      <span className="tm-departure-half tm-departure-bottom">
        <span className="tm-departure-glyph">{flipping ? displayNext : displayCurrent}</span>
      </span>
      <span className="tm-departure-flap tm-departure-flap-top">
        <span className="tm-departure-glyph">{displayCurrent}</span>
      </span>
      <span className="tm-departure-flap tm-departure-flap-bottom">
        <span className="tm-departure-glyph">{displayNext}</span>
      </span>
    </span>
  );
}

function FlapText({
  value,
  width,
  tone = "default",
  delayMs = 0,
}: {
  value: string;
  width: number;
  tone?: "default" | "accent" | "warning" | "info";
  delayMs?: number;
}) {
  const target = useMemo(() => normalizeFlapValue(value, width), [value, width]);
  const [displayChars, setDisplayChars] = useState(() => target.split(""));
  const displayCharsRef = useRef(displayChars);

  useEffect(() => {
    displayCharsRef.current = displayChars;
  }, [displayChars]);

  useEffect(() => {
    if (displayCharsRef.current.length !== width) {
      setDisplayChars(target.split(""));
      return undefined;
    }

    const timers: number[] = [];
    const nextChars = target.split("");
    const snapshot = [...displayCharsRef.current];

    nextChars.forEach((finalChar, index) => {
      const currentChar = snapshot[index] ?? " ";
      const steps = getShortestFlapSteps(currentChar, finalChar);
      if (steps.length === 1 && steps[0] === currentChar) return;

      steps.forEach((stepChar, stepIndex) => {
        timers.push(
          window.setTimeout(() => {
            startTransition(() => {
              setDisplayChars((previous) => {
                const updated = [...previous];
                updated[index] = stepChar;
                return updated;
              });
            });
          }, delayMs + index * 24 + stepIndex * 86),
        );
      });
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [delayMs, target, width]);

  return (
    <span className="tm-departure-text">
      {displayChars.map((char, index) => (
        <FlapCell key={index} char={char} tone={tone} shouldAnimate={char !== target[index]} />
      ))}
    </span>
  );
}

function BoardField({
  value,
  width,
  tone = "default",
  delayMs = 0,
}: {
  value: string;
  width: number;
  tone?: "default" | "accent" | "warning" | "info";
  delayMs?: number;
}) {
  return (
    <div className="tm-departure-field">
      <FlapText value={value} width={width} tone={tone} delayMs={delayMs} />
    </div>
  );
}

export default function GatewayDepartureBoard({
  autoPlay = true,
  boardWidth = 1720,
  maxRows = 10,
  showFooter = false,
  showSceneNote = false,
  timeZone,
}: BoardProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [rowSteps, setRowSteps] = useState(() =>
    ROW_TRACKS.map((track, index) => INITIAL_ROW_STEPS[index % INITIAL_ROW_STEPS.length] % track.length),
  );
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [pulseRow, setPulseRow] = useState<number | null>(null);
  const [clockSeed, setClockSeed] = useState(() => new Date());
  const [clientTimeZone, setClientTimeZone] = useState("UTC");
  const [panelSweepKey, setPanelSweepKey] = useState(0);
  const sceneTimersRef = useRef<number[]>([]);
  const sceneSweepRef = useRef(false);
  const rows = ROW_TRACKS.map((track, index) => track[rowSteps[index]] ?? track[0]);
  const visibleRows = rows.slice(0, maxRows);
  const visibleRowCount = Math.min(maxRows, ROW_TRACKS.length);

  useEffect(() => {
    setClockSeed(new Date());
    setClientTimeZone(timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, [timeZone]);

  const bumpRowStep = useEffectEvent((rowIndex: number, nextStep?: number) => {
    startTransition(() => {
      setRowSteps((previous) => {
        const updated = [...previous];
        updated[rowIndex] = nextStep ?? (previous[rowIndex] + 1) % ROW_TRACKS[rowIndex].length;
        return updated;
      });
    });
  });

  const pulseRowLane = useEffectEvent((rowIndex: number, holdMs = 520) => {
    setPulseRow(rowIndex);
    sceneTimersRef.current.push(
      window.setTimeout(() => {
        setPulseRow((current) => (current === rowIndex ? null : current));
      }, holdMs),
    );
  });

  const refreshBoard = useEffectEvent(() => {
    setClockSeed(new Date());
    setPanelSweepKey((current) => current + 1);
  });

  const cycleScene = useEffectEvent(() => {
    const nextScene = (sceneIndex + 1) % SCENES.length;

    sceneTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    sceneTimersRef.current = [];
    sceneSweepRef.current = true;
    setSceneIndex(nextScene);
    setPanelSweepKey((current) => current + 1);

    for (let rowIndex = 0; rowIndex < visibleRowCount; rowIndex += 1) {
      sceneTimersRef.current.push(
        window.setTimeout(() => {
          setActiveRow(rowIndex);
          pulseRowLane(rowIndex, 760);
          bumpRowStep(rowIndex, nextScene);

          sceneTimersRef.current.push(
            window.setTimeout(() => {
              setActiveRow((current) => (current === rowIndex ? null : current));
            }, 760),
          );
        }, rowIndex * 110),
      );
    }

    sceneTimersRef.current.push(
      window.setTimeout(() => {
        sceneSweepRef.current = false;
      }, visibleRowCount * 110 + 900),
    );
  });

  const ambientTraffic = useEffectEvent(() => {
    if (sceneSweepRef.current || visibleRowCount === 0) return;

    const rowIndex = Math.floor(Math.random() * visibleRowCount);
    const shouldRotate = Math.random() > 0.34;

    pulseRowLane(rowIndex, shouldRotate ? 620 : 460);

    if (!shouldRotate) return;

    setActiveRow(rowIndex);
    bumpRowStep(rowIndex);

    sceneTimersRef.current.push(
      window.setTimeout(() => {
        setActiveRow((current) => (current === rowIndex ? null : current));
      }, 640),
    );
  });

  useEffect(() => {
    return () => {
      sceneTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshBoard();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [refreshBoard]);

  useEffect(() => {
    if (!autoPlay) return undefined;

    const timer = window.setInterval(() => {
      cycleScene();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [autoPlay, cycleScene]);

  useEffect(() => {
    if (!autoPlay) return undefined;

    const timer = window.setInterval(() => {
      ambientTraffic();
    }, 920);

    return () => window.clearInterval(timer);
  }, [ambientTraffic, autoPlay]);

  const forceReroute = (rowIndex: number) => {
    setActiveRow(rowIndex);
    setPanelSweepKey((current) => current + 1);
    pulseRowLane(rowIndex, 980);
    bumpRowStep(rowIndex);

    sceneTimersRef.current.push(
      window.setTimeout(() => {
        bumpRowStep(rowIndex);
      }, 240),
    );

    window.setTimeout(() => {
      setActiveRow((current) => (current === rowIndex ? null : current));
    }, 940);
  };

  return (
    <div className="tm-screen-stage">
      <style>{`
        .tm-screen-stage {
          position: relative;
          width: min(${boardWidth}px, 100%);
          margin: 0 auto;
          padding: 0;
          background: transparent;
        }

        .tm-screen-stage:focus-visible {
          outline: none;
        }

        .tm-screen-rig {
          position: relative;
        }

        .tm-screen-chassis {
          position: relative;
          width: fit-content;
          margin: 0 auto;
        }

        .tm-screen-chassis::before {
          content: none;
        }

        .tm-screen-chassis::after {
          content: none;
        }

        .tm-screen-plinth {
          display: none;
          pointer-events: none;
        }

        .tm-departure-shell {
          --cell-w: 14px;
          --cell-h: 34px;
          --cell-gap: 1px;
          position: relative;
          width: fit-content;
          max-width: 100%;
          margin: 0;
          padding: 8px;
          border-radius: 0;
          background: linear-gradient(180deg, rgba(16, 18, 21, 0.98) 0%, rgba(6, 7, 8, 1) 100%);
          border: 1px solid rgba(255, 255, 255, 0.04);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.03),
            0 16px 32px rgba(15, 23, 42, 0.14);
          color: #f4f4f4;
          font-family: ui-sans-serif, system-ui, sans-serif;
          user-select: none;
        }

        .tm-departure-shell::before {
          content: none;
        }

        .tm-departure-shell::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 14%),
            linear-gradient(108deg, rgba(255, 255, 255, 0.04), transparent 15%, transparent 72%, rgba(120, 170, 255, 0.025) 88%, transparent 96%);
          mix-blend-mode: screen;
          opacity: 0.22;
          pointer-events: none;
        }

        .tm-departure-head {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 0;
          margin: 0;
        }

        .tm-departure-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: hidden;
          padding: 18px;
          background:
            linear-gradient(180deg, rgba(12, 13, 15, 0.98) 0%, rgba(5, 5, 6, 1) 100%);
          border: 1px solid rgba(255, 255, 255, 0.03);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.02),
            inset 0 10px 14px rgba(255, 255, 255, 0.01),
            inset 0 -14px 18px rgba(0, 0, 0, 0.78);
        }

        .tm-departure-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255, 255, 255, 0.02);
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.56);
          pointer-events: none;
        }

        .tm-departure-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.02) 48%, transparent 100%);
          opacity: 0.18;
          transform: translateX(-70%);
          mix-blend-mode: screen;
          animation: tm-panel-drift 9s linear infinite;
          pointer-events: none;
        }

        .tm-departure-scene {
          display: inline-flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          padding: 0;
        }

        .tm-departure-scene-label {
          padding: 4px 7px 3px;
          border-radius: 999px;
          background: #111111;
          border: 1px solid #1c1c1c;
          color: #f3d94b;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .tm-departure-scene-note {
          color: #5f5f5f;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .tm-departure-grid {
          display: grid;
          gap: 0;
          width: fit-content;
        }

        .tm-departure-columns,
        .tm-departure-row {
          display: grid;
          grid-template-columns:
            calc((var(--cell-w) * 8) + (var(--cell-gap) * 7))
            calc((var(--cell-w) * 12) + (var(--cell-gap) * 11))
            calc((var(--cell-w) * 4) + (var(--cell-gap) * 3))
            calc((var(--cell-w) * 24) + (var(--cell-gap) * 23))
            calc((var(--cell-w) * 3) + (var(--cell-gap) * 2))
            calc((var(--cell-w) * 10) + (var(--cell-gap) * 9));
          align-items: center;
          column-gap: 14px;
        }

        .tm-departure-columns {
          padding: 0 1px 1px;
          color: #4b4d51;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .tm-departure-row {
          position: relative;
          padding: 0;
          border-radius: 2px;
          transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
          cursor: pointer;
        }

        .tm-departure-row::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid transparent;
          transition: border-color 180ms ease;
          pointer-events: none;
        }

        .tm-departure-row::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.06) 48%, transparent 100%);
          opacity: 0;
          transform: translateX(-18%);
          pointer-events: none;
        }

        .tm-departure-row.is-pulsing,
        .tm-departure-row.is-active {
          background: transparent;
        }

        .tm-departure-row.is-pulsing {
          background: transparent;
        }

        .tm-departure-row.is-pulsing::before,
        .tm-departure-row.is-active::before {
          border-color: rgba(255, 255, 255, 0.06);
        }

        .tm-departure-row.is-pulsing::after {
          animation: tm-row-pulse 560ms cubic-bezier(0.18, 0.7, 0.2, 1) forwards;
        }

        .tm-departure-row.is-active::after {
          animation: tm-row-scan 780ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
        }

        .tm-departure-row.is-pulsing .tm-departure-cell,
        .tm-departure-row.is-active .tm-departure-cell {
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -2px 0 rgba(0, 0, 0, 0.88),
            0 0 0 1px rgba(255, 255, 255, 0.015);
        }

        .tm-departure-field {
          min-width: 0;
          white-space: nowrap;
        }

        .tm-departure-text {
          display: inline-flex;
          gap: var(--cell-gap);
        }

        .tm-departure-cell {
          position: relative;
          width: var(--cell-w);
          height: var(--cell-h);
          border-radius: 0;
          border: 1px solid #080909;
          overflow: hidden;
          background: #090909;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -2px 0 rgba(0, 0, 0, 0.88),
            0 1px 0 rgba(255, 255, 255, 0.015);
          perspective: 320px;
          transform-style: preserve-3d;
        }

        .tm-departure-cell::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent 18%),
            linear-gradient(90deg, rgba(255, 255, 255, 0.018), transparent 18%, transparent 82%, rgba(0, 0, 0, 0.28)),
            linear-gradient(180deg, transparent 60%, rgba(0, 0, 0, 0.3));
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.012),
            inset 0 3px 4px rgba(255, 255, 255, 0.012),
            inset 0 -5px 6px rgba(0, 0, 0, 0.46);
          pointer-events: none;
        }

        .tm-departure-cell::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: calc(50% - 0.5px);
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          z-index: 3;
          pointer-events: none;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.95);
        }

        .tm-departure-half,
        .tm-departure-flap {
          position: absolute;
          left: 0;
          right: 0;
          height: 50%;
          overflow: hidden;
        }

        .tm-departure-top {
          top: 0;
          background:
            linear-gradient(180deg, #232323 0%, #181818 46%, #121212 100%);
        }

        .tm-departure-bottom {
          bottom: 0;
          background:
            linear-gradient(180deg, #0d0d0d 0%, #151515 54%, #1a1a1a 100%);
        }

        .tm-departure-flap {
          z-index: 2;
          backface-visibility: hidden;
          visibility: hidden;
        }

        .tm-departure-flap-top {
          top: 0;
          transform-origin: center bottom;
          background: linear-gradient(180deg, #2a2a2a 0%, #161616 100%);
        }

        .tm-departure-flap-bottom {
          bottom: 0;
          transform-origin: center top;
          transform: rotateX(90deg);
          background: linear-gradient(180deg, #101010 0%, #1d1d1d 100%);
        }

        .tm-departure-glyph {
          position: absolute;
          left: 0;
          right: 0;
          height: var(--cell-h);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 20px;
          line-height: 1;
          transform: scaleX(0.72);
          transform-origin: center;
          text-transform: uppercase;
          text-shadow:
            0 1px 0 rgba(0, 0, 0, 0.8),
            0 0 5px rgba(255, 255, 255, 0.05);
        }

        .tm-departure-top .tm-departure-glyph,
        .tm-departure-flap-top .tm-departure-glyph {
          top: 0;
        }

        .tm-departure-bottom .tm-departure-glyph,
        .tm-departure-flap-bottom .tm-departure-glyph {
          top: calc(var(--cell-h) * -0.5);
        }

        .tm-departure-cell[data-tone="default"] .tm-departure-glyph {
          color: #e2ddd2;
        }

        .tm-departure-cell[data-tone="accent"] .tm-departure-glyph {
          color: #f2d54f;
        }

        .tm-departure-cell[data-tone="warning"] .tm-departure-glyph {
          color: #f8c55d;
        }

        .tm-departure-cell[data-tone="info"] .tm-departure-glyph {
          color: #72a4ff;
        }

        .tm-departure-cell.is-flipping .tm-departure-flap {
          visibility: visible;
        }

        .tm-departure-cell.is-flipping .tm-departure-flap-top {
          animation: tm-flap-top 160ms cubic-bezier(0.62, 0.02, 0.72, 0.43) forwards;
        }

        .tm-departure-cell.is-flipping .tm-departure-flap-bottom {
          animation: tm-flap-bottom 160ms cubic-bezier(0.2, 0.72, 0.27, 1) 160ms forwards;
        }

        .tm-departure-panel-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 245, 198, 0.08) 28%, rgba(120, 170, 255, 0.1) 50%, transparent 72%);
          transform: translateX(-105%);
          pointer-events: none;
          mix-blend-mode: screen;
          animation: tm-panel-sweep 1080ms cubic-bezier(0.2, 0.68, 0.2, 1) forwards;
        }

        .tm-departure-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 12px;
          color: #505050;
          font-size: 12px;
          line-height: 1.55;
        }

        .tm-departure-foot strong {
          color: #7d7d7d;
          font-weight: 600;
        }

        .tm-departure-foot-note {
          color: #6c6c6c;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        @keyframes tm-flap-top {
          from { transform: rotateX(0deg); filter: brightness(1); }
          to { transform: rotateX(-90deg); filter: brightness(0.74); }
        }

        @keyframes tm-flap-bottom {
          from { transform: rotateX(90deg); filter: brightness(0.7); }
          to { transform: rotateX(0deg); filter: brightness(1); }
        }

        @keyframes tm-row-scan {
          0% { opacity: 0; transform: translateX(-18%); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translateX(26%); }
        }

        @keyframes tm-row-pulse {
          0% { opacity: 0; transform: translateX(-12%); }
          22% { opacity: 0.88; }
          100% { opacity: 0; transform: translateX(18%); }
        }

        @keyframes tm-panel-sweep {
          0% { opacity: 0; transform: translateX(-105%); }
          14% { opacity: 1; }
          100% { opacity: 0; transform: translateX(105%); }
        }

        @keyframes tm-panel-drift {
          0% { transform: translateX(-70%); }
          100% { transform: translateX(110%); }
        }

        @media (max-width: 980px) {
          .tm-screen-stage {
            padding: 0;
          }

          .tm-departure-shell {
            --cell-w: 11px;
            --cell-h: 24px;
            padding: 7px;
          }

          .tm-departure-columns,
          .tm-departure-row {
            column-gap: 11px;
          }

          .tm-departure-columns {
            font-size: 13px;
          }

          .tm-departure-foot {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 720px) {
          .tm-screen-stage {
            padding: 8px 0 12px;
          }

          .tm-departure-shell {
            overflow-x: auto;
          }

          .tm-departure-grid,
          .tm-departure-head,
          .tm-departure-foot {
            min-width: 760px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tm-departure-row,
          .tm-departure-flap-top,
          .tm-departure-flap-bottom {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

        <div className="tm-screen-rig">
        <div className="tm-screen-chassis">
          <div className="tm-departure-shell">
            <div className="tm-departure-panel">
              <span key={panelSweepKey} className="tm-departure-panel-sweep" aria-hidden="true" />
              {showSceneNote ? (
                <div className="tm-departure-head">
                  <button type="button" className="tm-departure-scene" onClick={cycleScene}>
                    <span className="tm-departure-scene-label">{SCENES[sceneIndex].label}</span>
                    <span className="tm-departure-scene-note">{SCENES[sceneIndex].note}</span>
                  </button>
                </div>
              ) : null}

              <div className="tm-departure-grid">
                <div className="tm-departure-columns">
                  <span>Time</span>
                  <span>Model</span>
                  <span>Edge</span>
                  <span>Gateway</span>
                  <span>P95</span>
                  <span>Flow</span>
                </div>

                {visibleRows.map((row, index) => (
                  <div
                    key={`${row.time}-${row.model}-${index}`}
                    className={`tm-departure-row${pulseRow === index ? " is-pulsing" : ""}${activeRow === index ? " is-active" : ""}`}
                    onClick={() => forceReroute(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Force reroute row ${index + 1}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        forceReroute(index);
                      }
                    }}
                  >
                    <BoardField value={formatBoardTime(clockSeed, index, clientTimeZone)} width={COLUMN_WIDTHS.time} delayMs={0} />
                    <BoardField value={row.model} width={COLUMN_WIDTHS.model} delayMs={40} />
                    <BoardField value={row.provider} width={COLUMN_WIDTHS.provider} tone="accent" delayMs={80} />
                    <BoardField value={formatRoute(row)} width={COLUMN_WIDTHS.path} delayMs={150} />
                    <BoardField value={row.p95} width={COLUMN_WIDTHS.p95} delayMs={250} />
                    <BoardField value={formatStatus(row.status)} width={COLUMN_WIDTHS.status} tone={statusTone(row.status)} delayMs={320} />
                  </div>
                ))}
              </div>

              {showFooter ? (
                <div className="tm-departure-foot">
                  <div>
                    Hover a row or <strong>click to force reroute</strong>. Scene switch drives the whole board through stable traffic, burst load, and failover recovery.
                  </div>
                  <div className="tm-departure-foot-note">ToMesh gateway transfer board</div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="tm-screen-plinth" />
        </div>
      </div>
    </div>
  );
}
