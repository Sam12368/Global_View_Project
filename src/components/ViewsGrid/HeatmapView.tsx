// src/components/ViewsGrid/HeatmapView.tsx
import "./HeatmapView.css";
import { useData } from "../../hooks/useData";
import { useYear } from "../../hooks/useYear";
import { useSelections } from "../../hooks/useSelection";
import { useMemo, useRef, useEffect } from "react";

export default function HeatmapView() {
  const { tempData, getInterpolatedValue } = useData();
  const { setYear } = useYear();
  const { setHighlightedCells, highlightedCellIds } = useSelections();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Stocker la cellule sélectionnée (latitude + année)
  const selectedCell = useRef<{ lat: number; year: number } | null>(null);
  
  // Extraire les latitudes depuis highlightedCellIds
  const selectedLatitudes = useMemo(() => {
    const lats = new Set<number>();
    highlightedCellIds.forEach(cellId => {
      const cell = tempData.tempanomalies[cellId];
      if (cell) lats.add(cell.lat);
    });
    return Array.from(lats);
  }, [highlightedCellIds, tempData]);

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
      // Latitudes réduites (tous les 4° pour meilleures performances)
      const latitudes = Array.from(new Set(tempData.tempanomalies.map((a) => a.lat)))
        .sort((a, b) => b - a)
        .filter(lat => lat >= -88 && lat <= 88 && lat % 4 === 0);

      // Années réduites (tous les 10 ans pour encore meilleures performances)
      const years = Array.from({ length: 15 }, (_, i) => 1880 + i * 10);

      // Créer une map pour accès rapide
      const dataMap = new Map<string, number>();
      
      // Pré-grouper les cellules par latitude pour optimisation
      const cellsByLat = new Map<number, typeof tempData.tempanomalies>();
      tempData.tempanomalies.forEach((cell) => {
        if (!cellsByLat.has(cell.lat)) {
          cellsByLat.set(cell.lat, []);
        }
        cellsByLat.get(cell.lat)!.push(cell);
      });

      latitudes.forEach((lat) => {
        const cellsForLat = cellsByLat.get(lat) || [];
        years.forEach((year) => {
          let sum = 0;
          let count = 0;

          cellsForLat.forEach((cell) => {
            const value = getInterpolatedValue(cell, year);
            if (value !== null) {
              sum += value;
              count++;
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

    // Marges
    const leftMargin = 70;
    const topMargin = 50;
    const rightMargin = 20;
    const bottomMargin = 20;

    // Calculer les dimensions du canvas en fonction de l'espace disponible
    const parentWidth = canvas.parentElement?.clientWidth || 800;
    const parentHeight = canvas.parentElement?.clientHeight || 500;
    
    canvas.width = Math.max(parentWidth, 800);
    canvas.height = Math.max(parentHeight, 450);

    // Calculer la taille des cellules pour remplir l'espace
    const availableWidth = canvas.width - leftMargin - rightMargin;
    const availableHeight = canvas.height - topMargin - bottomMargin;
    
    const cellWidth = Math.floor(availableWidth / years.length);
    const cellHeight = Math.floor(availableHeight / latitudes.length);

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

    // Labels années (en bas, rotation pour meilleure lisibilité)
    ctx.fillStyle = "#7aa2ff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    years.forEach((year, i) => {
      ctx.save();
      const x = leftMargin + i * cellWidth + cellWidth / 2;
      const y = topMargin + latitudes.length * cellHeight + 8;
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 6); // Rotation -30°
      ctx.fillText(year.toString(), 0, 0);
      ctx.restore();
    });

    // Labels latitudes (tous les 8°)
    ctx.fillStyle = "#7aa2ff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    latitudes.forEach((lat, i) => {
      if (lat % 8 === 0 || lat === -88 || lat === 88) {
        ctx.fillText(
          `${lat}°`,
          leftMargin - 10,
          topMargin + i * cellHeight + cellHeight / 2
        );
      }
    });

    // Grille de séparation verticale (tous les 10 ans)
    ctx.strokeStyle = "rgba(251, 191, 36, 0.2)";
    ctx.lineWidth = 1;
    years.forEach((year, i) => {
      if (year % 10 === 0) {
        ctx.beginPath();
        ctx.moveTo(leftMargin + i * cellWidth, topMargin);
        ctx.lineTo(leftMargin + i * cellWidth, topMargin + latitudes.length * cellHeight);
        ctx.stroke();
      }
    });

    // Grille de séparation horizontale (tous les 16°)
    latitudes.forEach((lat, i) => {
      if (lat % 16 === 0) {
        ctx.beginPath();
        ctx.moveTo(leftMargin, topMargin + i * cellHeight);
        ctx.lineTo(leftMargin + years.length * cellWidth, topMargin + i * cellHeight);
        ctx.stroke();
      }
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

    // Utiliser les mêmes dimensions que le canvas principal
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    
    const leftMargin = 70;
    const topMargin = 50;
    const rightMargin = 20;
    const bottomMargin = 20;

    canvas.width = mainCanvas.width;
    canvas.height = mainCanvas.height;
    
    const availableWidth = canvas.width - leftMargin - rightMargin;
    const availableHeight = canvas.height - topMargin - bottomMargin;
    
    const cellWidth = Math.floor(availableWidth / years.length);
    const cellHeight = Math.floor(availableHeight / latitudes.length);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bordure jaune uniquement pour la cellule sélectionnée
    if (selectedCell.current) {
      const { lat, year } = selectedCell.current;
      const latIdx = latitudes.findIndex(l => l === lat);
      const yearIdx = years.findIndex(y => y === year);

      if (latIdx !== -1 && yearIdx !== -1) {
        const x = leftMargin + yearIdx * cellWidth;
        const y = topMargin + latIdx * cellHeight;

        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellWidth - 1, cellHeight - 1);
      }
    }
    // Forcer le re-render en cas de changement
    canvas.style.opacity = '0.99999';
  }, [heatmapData, highlightedCellIds]);

  // ============================================================
  // 🔹 GÉRER LE CLIC SUR UNE CELLULE
  // ============================================================
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { latitudes, years } = heatmapData;
    
    const leftMargin = 70;
    const topMargin = 50;
    const rightMargin = 20;
    const bottomMargin = 20;
    
    const availableWidth = canvas.width - leftMargin - rightMargin;
    const availableHeight = canvas.height - topMargin - bottomMargin;
    
    const cellWidth = Math.floor(availableWidth / years.length);
    const cellHeight = Math.floor(availableHeight / latitudes.length);

    // Vérifier si le clic est dans la zone des cellules
    if (x < leftMargin || y < topMargin) return;

    const yearIdx = Math.floor((x - leftMargin) / cellWidth);
    const latIdx = Math.floor((y - topMargin) / cellHeight);

    if (yearIdx >= 0 && yearIdx < years.length && latIdx >= 0 && latIdx < latitudes.length) {
      const year = years[yearIdx];
      const lat = latitudes[latIdx];

      // Changer l'année TOUJOURS
      setYear(year);

      // Trouver tous les cellIds (indices) qui correspondent à cette latitude
      const cellIdsForLat: number[] = [];
      tempData.tempanomalies.forEach((cell, idx) => {
        if (cell.lat === lat) {
          cellIdsForLat.push(idx);
        }
      });

      // Si on clique sur la même cellule, désélectionner
      if (selectedCell.current?.lat === lat && selectedCell.current?.year === year) {
        selectedCell.current = null;
        setHighlightedCells([]);
      } else {
        // Sinon, sélectionner la nouvelle cellule
        selectedCell.current = { lat, year };
        setHighlightedCells(cellIdsForLat);
      }
    }
  };



  // ============================================================
  // 🔹 RENDU
  // ============================================================
  return (
    <div className="heatmapview-container">
      <h2>Temperature Anomaly Heatmap</h2>
      <p className="heatmap-subtitle">
        Latitude × Year | Click on a cell to select latitude and year
      </p>

      <div className="heatmap-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <canvas
            ref={canvasRef}
            style={{ display: "block" }}
          />
          <canvas
            ref={overlayCanvasRef}
            onClick={handleCanvasClick}
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              cursor: "pointer",
              display: "block"
            }}
          />
        </div>
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
