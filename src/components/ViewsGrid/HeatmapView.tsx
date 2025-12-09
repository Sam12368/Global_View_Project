// src/components/ViewsGrid/HeatmapView.tsx
import "./HeatmapView.css";
import { useData } from "../../hooks/useData";
import { useYear } from "../../hooks/useYear";
import { useSelections } from "../../hooks/useSelection";
import { useMemo, useState, useRef, useEffect } from "react";

export default function HeatmapView() {
  const { tempData, getInterpolatedValue } = useData();
  const { currentYear, setYear } = useYear();
  const { addLatitude, removeLatitude, selectedLatitudes } = useSelections();
  const [hoveredCell, setHoveredCell] = useState<{ lat: number; year: number; value: number | null; x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================================
  // 🔹 FONCTION POUR OBTENIR LA COULEUR
  // ============================================================
  const getColor = (value: number | null): string => {
    if (value === null || value === undefined) return "#0b0f19";
    
    // Palette NASA : bleu (froid) → rouge (chaud)
    if (value <= -2) return "#053061";
    if (value <= -1.5) return "#2166ac";
    if (value <= -1) return "#4393c3";
    if (value <= -0.5) return "#92c5de";
    if (value <= 0) return "#d1e5f0";
    if (value <= 0.5) return "#fddbc7";
    if (value <= 1) return "#f4a582";
    if (value <= 1.5) return "#d6604d";
    if (value <= 2) return "#b2182b";
    return "#67001f";
  };

  // ============================================================
  // 🔹 PRÉPARER LES DONNÉES POUR LA HEATMAP
  // ============================================================
  const heatmapData = useMemo(() => {
    try {
      // Utiliser uniquement les latitudes sélectionnées ou une liste réduite
      const latitudes = selectedLatitudes.length > 0
        ? selectedLatitudes.sort((a, b) => b - a)
        : Array.from(new Set(tempData.tempanomalies.map((a) => a.lat)))
            .sort((a, b) => b - a)
            .filter((_, i) => i % 5 === 0);

      // Années réduites (tous les 5 ans)
      const years = Array.from({ length: 30 }, (_, i) => 1880 + i * 5);

      // Créer une map pour accès rapide
      const dataMap = new Map<string, number>();
      
      latitudes.forEach((lat) => {
        years.forEach((year) => {
          let sum = 0;
          let count = 0;

          tempData.tempanomalies.forEach((cell) => {
            if (cell.lat === lat) {
              const value = getInterpolatedValue(cell, year);
              if (value !== null) {
                sum += value;
                count++;
              }
            }
          });

          const avgValue = count > 0 ? sum / count : null;
          if (avgValue !== null) {
            dataMap.set(`${lat}-${year}`, avgValue);
          }
        });
      });

      return { dataMap, latitudes, years };
    } catch (error) {
      console.error("Error in heatmap data:", error);
      return { dataMap: new Map(), latitudes: [], years: [] };
    }
  }, [tempData, getInterpolatedValue, selectedLatitudes]);

  // ============================================================
  // 🔹 DESSINER LA HEATMAP SUR CANVAS
  // ============================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { latitudes, years, dataMap } = heatmapData;
    if (latitudes.length === 0 || years.length === 0) return;

    const cellWidth = 18;
    const cellHeight = 14;
    const leftMargin = 60;
    const topMargin = 35;

    canvas.width = years.length * cellWidth + leftMargin + 20;
    canvas.height = latitudes.length * cellHeight + topMargin + 20;

    // Fond simple
    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner les cellules
    latitudes.forEach((lat, latIdx) => {
      years.forEach((year, yearIdx) => {
        const value = dataMap.get(`${lat}-${year}`);
        const color = getColor(value !== undefined ? value : null);
        
        ctx.fillStyle = color;
        ctx.fillRect(
          leftMargin + yearIdx * cellWidth,
          topMargin + latIdx * cellHeight,
          cellWidth - 1,
          cellHeight - 1
        );
      });
    });

    // Labels années
    ctx.fillStyle = "#7aa2ff";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    years.forEach((year, i) => {
      ctx.fillText(
        year.toString(),
        leftMargin + i * cellWidth + cellWidth / 2,
        topMargin - 8
      );
    });

    // Labels latitudes
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    latitudes.forEach((lat, i) => {
      ctx.fillText(
        `${lat}°`,
        leftMargin - 10,
        topMargin + i * cellHeight + cellHeight / 2
      );
    });
  }, [heatmapData, getColor]);

  // ============================================================
  // 🔹 DESSINER LES BORDURES (overlay) POUR SELECTIONS
  // ============================================================
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { latitudes, years } = heatmapData;
    if (latitudes.length === 0 || years.length === 0) return;

    const cellWidth = 18;
    const cellHeight = 14;
    const leftMargin = 60;
    const topMargin = 35;

    canvas.width = years.length * cellWidth + leftMargin + 20;
    canvas.height = latitudes.length * cellHeight + topMargin + 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bordures simples
    latitudes.forEach((lat, latIdx) => {
      years.forEach((year, yearIdx) => {
        const isSelected = selectedLatitudes.includes(lat);
        const isCurrentYear = year === currentYear;
        const isHovered = hoveredCell?.lat === lat && hoveredCell?.year === year;

        if (isSelected || isCurrentYear || isHovered) {
          const x = leftMargin + yearIdx * cellWidth;
          const y = topMargin + latIdx * cellHeight;

          if (isSelected || isCurrentYear) {
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 2;
          } else if (isHovered) {
            ctx.strokeStyle = "#7aa2ff";
            ctx.lineWidth = 2;
          }
          
          ctx.strokeRect(x, y, cellWidth - 1, cellHeight - 1);
        }
      });
    });
  }, [heatmapData, selectedLatitudes, currentYear, hoveredCell]);

  // ============================================================
  // 🔹 GÉRER LE CLIC SUR UNE CELLULE
  // ============================================================
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const cellWidth = 28;
    const cellHeight = 22;
    const leftMargin = 70;
    const topMargin = 40;

    // Vérifier si le clic est dans la zone des cellules
    if (x < leftMargin || y < topMargin) return;

    const { latitudes, years } = heatmapData;
    const yearIdx = Math.floor((x - leftMargin) / cellWidth);
    const latIdx = Math.floor((y - topMargin) / cellHeight);

    if (yearIdx >= 0 && yearIdx < years.length && latIdx >= 0 && latIdx < latitudes.length) {
      const year = years[yearIdx];
      const lat = latitudes[latIdx];

      setYear(year);

      if (selectedLatitudes.includes(lat)) {
        removeLatitude(lat);
      } else {
        addLatitude(lat);
      }
    }
  };

  // ============================================================
  // 🔹 GÉRER LE HOVER
  // ============================================================
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const cellWidth = 28;
    const cellHeight = 22;
    const leftMargin = 70;
    const topMargin = 40;

    if (x < leftMargin || y < topMargin) {
      setHoveredCell(null);
      return;
    }

    const { latitudes, years, dataMap } = heatmapData;
    const yearIdx = Math.floor((x - leftMargin) / cellWidth);
    const latIdx = Math.floor((y - topMargin) / cellHeight);

    if (yearIdx >= 0 && yearIdx < years.length && latIdx >= 0 && latIdx < latitudes.length) {
      const year = years[yearIdx];
      const lat = latitudes[latIdx];
      const value = dataMap.get(`${lat}-${year}`);

      setHoveredCell({
        lat,
        year,
        value: value !== undefined ? value : null,
        x: event.clientX,
        y: event.clientY,
      });
    } else {
      setHoveredCell(null);
    }
  };

  // ============================================================
  // 🔹 RENDU
  // ============================================================
  return (
    <div className="heatmapview-container">
      <h2>🌡️ Temperature Anomaly Heatmap</h2>
      <p className="heatmap-subtitle">
        Latitude × Year | Click on a cell to select latitude and year
      </p>

      <div className="heatmap-wrapper">
        <div style={{ position: "relative", display: "inline-block" }}>
          <canvas
            ref={canvasRef}
            style={{ display: "block" }}
          />
          <canvas
            ref={overlayCanvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredCell(null)}
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              cursor: "pointer",
              display: "block"
            }}
          />
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div
            className="heatmap-tooltip"
            style={{
              position: "fixed",
              left: hoveredCell.x,
              top: hoveredCell.y - 60,
              transform: "translateX(-50%)",
            }}
          >
            <div className="tooltip-content">
              <strong>{hoveredCell.year}</strong> • {hoveredCell.lat}°
              <br />
              <span className="tooltip-value">
                {hoveredCell.value !== null ? `${hoveredCell.value.toFixed(2)}°C` : "No data"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Légende des couleurs */}
      <div className="heatmap-legend">
        <span className="legend-label">Cold</span>
        <div className="legend-gradient"></div>
        <span className="legend-label">Hot</span>
      </div>

      {selectedLatitudes.length > 0 && (
        <div className="heatmap-info">
          <p>
            <strong>{selectedLatitudes.length}</strong> latitude(s) selected:{" "}
            {selectedLatitudes.sort((a, b) => b - a).join("°, ")}°
          </p>
        </div>
      )}
    </div>
  );
}
