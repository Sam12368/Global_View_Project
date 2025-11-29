// src/components/WorldMap/WorldMap.tsx
import "./WorldMap.css";
import earth from "../../assets/earth.png";
import { useData } from "../../hooks/useData";
import { useYear } from "../../hooks/useYear";
import { useSelections } from "../../hooks/useSelection";
import type { TempAnomalyArea } from "../../features/data/dataTypes";

export default function WorldMap() {
  const { tempData, getColor } = useData();
  const { currentYear } = useYear();
  const { mode, selectedAreas, addArea, removeArea, addLatitude, removeLatitude } =
    useSelections();

  // pour savoir si une “cellule” est sélectionnée par son indice
  const isAreaSelected = (index: number) => selectedAreas.includes(index);

  return (
    <section className="map-shell">
      {/* image de fond */}
      <img src={earth} alt="World map" className="map-image" />

      {/* overlay SVG pour les rectangles colorés */}
      <svg className="map-overlay" viewBox="0 0 360 180">
  <defs>
    {/* flou appliqué à toutes les cases */}
    <filter id="blur-cells" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="0.9" />
    </filter>
  </defs>

  {/* groupe qui contient toutes les cellules colorées */}
  <g filter="url(#blur-cells)">
    {tempData.tempanomalies.map((area, index) => {
      const x = area.lon + 180;
      const y = 90 - area.lat;
      const width = 4;
      const height = 4;

      const color = getColor(area, currentYear);
      const selected = isAreaSelected(index);

      function handleClickArea(index: number, area: TempAnomalyArea): void {
        throw new Error("Function not implemented.");
      }

      return (
        <rect
          key={index}
          x={x - width / 2}
          y={y - height / 2}
          width={width}
          height={height}
          fill={color}
          fillOpacity={selected ? 0.85 : 0.7}
          stroke="none"
          className="map-cell"
          onClick={() => handleClickArea(index, area)}
        />
      );
    })}
  </g>
</svg>
    </section>
  );
}

