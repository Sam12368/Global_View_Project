import { useAppSelector } from "../app/hooks";
import type { TempAnomalyArea } from "../features/data/dataTypes";

/* ---------------------------------------------------------
   🔵 INTERPOLATION LISSEE (Méthode B — Weighted smoothing)
   --------------------------------------------------------- */
function interpolateSmooth(
  data: { year: number; value: number | string }[],
  targetYear: number
): number | null {

  // 🔹 Valeur exacte ?
  const exact = data.find((d) => d.year === targetYear);
  if (exact && exact.value !== "NA") return exact.value as number;

  // 🔹 Cherche centre, année précédente, année suivante
  const center = data.find((d) => d.year === targetYear) || null;
  const prev = data.find((d) => d.year === targetYear - 1) || null;
  const next = data.find((d) => d.year === targetYear + 1) || null;

  if (!center) return null;

  let c = center.value !== "NA" ? (center.value as number) : null;
  if (c === null) return null;

  let p =
    prev && prev.value !== "NA"
      ? (prev.value as number)
      : c; // fallback vers la valeur centrale

  let n =
    next && next.value !== "NA"
      ? (next.value as number)
      : c; // fallback vers la valeur centrale

  // 🔥 Smoothing pondéré (0.25 / 0.50 / 0.25)
  return 0.25 * p + 0.5 * c + 0.25 * n;
}

/* ---------------------------------------------------------
   🟢 HOOK PRINCIPAL
   --------------------------------------------------------- */
export function useData() {
  const tempData = useAppSelector((s) => s.data.tempData);

  function getArea(lat: number, lon: number): TempAnomalyArea | undefined {
    return tempData.tempanomalies.find(
      (a) => a.lat === lat && a.lon === lon
    );
  }

  /** 🔹 Retourne la valeur EXACTE si elle existe */
  function getValue(area: TempAnomalyArea, year: number): number | null {
    const entry = area.data.find((d) => d.year === year);
    if (!entry || entry.value === "NA") return null;
    return entry.value;
  }

  /** 🔥 Retourne la valeur INTERPOLÉE + LISSÉE (Méthode B) */
  function getInterpolatedValue(area: TempAnomalyArea, year: number): number | null {
    return interpolateSmooth(area.data, year);
  }

  return {
    tempData,
    getArea,
    getValue,             // valeur brute
    getInterpolatedValue, // valeur interpolée smooth
  };
}

export { interpolateSmooth };
