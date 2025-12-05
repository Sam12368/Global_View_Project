// src/components/WorldMap/WorldMap.tsx
import "./WorldMap.css";
import earth from "../../assets/earth.png";
import { useData } from "../../hooks/useData";
import { useYear } from "../../hooks/useYear";
import { useSelections } from "../../hooks/useSelection"; // ou useSelections selon ton nom
import type { TempAnomalyArea } from "../../features/data/dataTypes";

export default function WorldMap() {
  const { tempData, getColor } = useData();
  const { currentYear } = useYear();
  const {
    mode,
    selectedAreas,
    selectedLatitudes,
    addArea,
    removeArea,
    addLatitude,
    removeLatitude,
  } = useSelections();

  const isAreaSelected = (index: number) => selectedAreas.includes(index);
  const isLatSelected = (lat: number) => selectedLatitudes.includes(lat);

  const handleClickArea = (index: number, area: TempAnomalyArea) => {
    if (mode === "areas") {
      // toggle par zone
      if (isAreaSelected(index)) {
        removeArea(index);     
      } else {
        addArea(index);
      }
    } else if (mode === "latitudes") {
      // toggle par latitude
      const lat = area.lat;
      if (isLatSelected(lat)) {
        removeLatitude(lat);
      } else {
        addLatitude(lat);
      }
    }
  };

  return (
    <section className="map-shell">
      {/* Légende de couleur à gauche */}
      <div className="color-legend">
        <div className="legend-gradient" />
        <div className="legend-labels">
          <span>2°C</span>
          <span>1°C</span>
          <span>0</span>
          <span>-1°C</span>
          <span>-2°C</span>
        </div>
      </div>

      {/* image de fond */}
      <img src={earth} alt="World map" className="map-image" />

      {/* overlay SVG pour les anomalies */}
      <svg
        className="map-overlay"
        viewBox="0 0 360 180"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Marqueurs des limites */}
        <g className="grid-markers">
          {/* Ligne latitude max (88°) */}
          <line x1={0} y1={2} x2={360} y2={2} stroke="#ff0000" strokeWidth={0.5} strokeDasharray="3 3" />
          <text x={5} y={6} fill="#ff0000" fontSize="4">Lat +88°</text>
          
          {/* Ligne latitude min (-88°) */}
          <line x1={0} y1={178} x2={360} y2={178} stroke="#ff0000" strokeWidth={0.5} strokeDasharray="3 3" />
          <text x={5} y={176} fill="#ff0000" fontSize="4">Lat -88°</text>
          
          {/* Ligne longitude min (-178°) */}
          <line x1={2} y1={0} x2={2} y2={180} stroke="#00ff00" strokeWidth={0.5} strokeDasharray="3 3" />
          <text x={4} y={10} fill="#00ff00" fontSize="4">Lon -178°</text>
          
          {/* Ligne longitude max (178°) */}
          <line x1={358} y1={0} x2={358} y2={180} stroke="#00ff00" strokeWidth={0.5} strokeDasharray="3 3" />
          <text x={320} y={10} fill="#00ff00" fontSize="4">Lon +178°</text>
          
          {/* Ligne équateur (lat 0) */}
          <line x1={0} y1={90} x2={360} y2={90} stroke="#ffff00" strokeWidth={0.3} strokeDasharray="2 2" />
          <text x={5} y={94} fill="#ffff00" fontSize="4">Équateur (0°)</text>
          
          {/* Ligne méridien (lon 0) */}
          <line x1={180} y1={0} x2={180} y2={180} stroke="#ffff00" strokeWidth={0.3} strokeDasharray="2 2" />
          <text x={182} y={10} fill="#ffff00" fontSize="4">Méridien 0°</text>
        </g>

        <defs>
          {/* Définir les gradients radiaux pour chaque anomalie */}
          {tempData.tempanomalies.map((area, index) => {
            const color = getColor(area, currentYear);
            if (color === "rgba(0,0,0,0)") return null;
            return (
              <radialGradient key={`grad-${index}`} id={`gradient-${index}`}>
                <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                <stop offset="40%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            );
          })}

        </defs>
        {/* lignes pour les latitudes sélectionnées */}
        {selectedLatitudes.map((lat) => {
          const y = 90 - lat;
          return (
            <line
              key={`lat-${lat}`}
              x1={0}
              y1={y}
              x2={360}
              y2={y}
              stroke="#111827"
              strokeWidth={0.4}
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Anomalies avec gradients radiaux */}
        <g>
          {tempData.tempanomalies.map((area, index) => {
            const x = area.lon + 180;
            const y = 90 - area.lat;
            const color = getColor(area, currentYear);
            if (color === "rgba(0,0,0,0)") return null;
            const selected = isAreaSelected(index);
            const radius = selected ? 10 : 8;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={radius}
                fill={`url(#gradient-${index})`}
                className="map-anomaly"
                onClick={() => handleClickArea(index, area)}
              />
            );
          })}
        </g>
      </svg>
    </section>
  );
}
