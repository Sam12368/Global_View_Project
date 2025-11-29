import { useAppSelector } from "../app/hooks";
import type { TempAnomalyArea } from "../features/data/dataTypes";

// --- color interpolation helpers ---
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(c1: string, c2: string, t: number) {
  const parse = (c: string) => c.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);

  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));

  return `rgb(${r}, ${g}, ${b})`;
}

// color scale manually defined
const COLORS = [
  { t: -3, color: "#08306B" },  // blue
  { t: -1.5, color: "#4292C6" }, // light blue
  { t: 0, color: "#F7F7F7" },    // neutral
  { t: 1.5, color: "#FDAE61" },  // orange
  { t: 3, color: "#D73027" },    // red
  { t: 4, color: "#7f0000" },    // dark red
];

function getColorForValue(value: number | null) {
  if (value === null) return "rgba(0,0,0,0)"; // transparent for NA

  // clamp between -3 and 4
  const v = Math.max(-3, Math.min(4, value));

  // find interval
  for (let i = 0; i < COLORS.length - 1; i++) {
    const a = COLORS[i];
    const b = COLORS[i + 1];

    if (v >= a.t && v <= b.t) {
      const t = (v - a.t) / (b.t - a.t);
      return lerpColor(a.color, b.color, t);
    }
  }

  return COLORS[COLORS.length - 1].color;
}

export function useData() {
  const tempData = useAppSelector((state) => state.data.tempData);

  function getArea(lat: number, lon: number): TempAnomalyArea | undefined {
    return tempData.tempanomalies.find((a) => a.lat === lat && a.lon === lon);
  }

  function getValue(area: TempAnomalyArea, year: number) {
    const entry = area.data.find((d) => d.year === year);
    if (!entry) return null;
    if (entry.value === "NA") return null;
    return entry.value;
  }

  function getColor(area: TempAnomalyArea, year: number) {
    const v = getValue(area, year);
    return getColorForValue(v);
  }

  return {
    tempData,
    getArea,
    getValue,
    getColor,
  };
}
