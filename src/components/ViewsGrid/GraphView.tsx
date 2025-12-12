// src/components/ViewsGrid/GraphView.tsx
import "./GraphView.css";
import { useData } from "../../hooks/useData";
import { useSelections } from "../../hooks/useSelection";
import { useYear } from "../../hooks/useYear";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartEvent,
  type ActiveElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getRelativePosition } from "chart.js/helpers";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function GraphView() {
  const { tempData, getInterpolatedValue } = useData();
  const { areas, groups, activeGroupIds, toggleActiveGroup } = useSelections();
  const { currentYear, setYear } = useYear();
  
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const currentYearRef = useRef(currentYear);
  const [, forceUpdate] = useState({});
  const [chartReady, setChartReady] = useState(false);

  // États locaux pour gérer les modes actifs
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [showSingleArea, setShowSingleArea] = useState(true); // Activé par défaut
  const [showGroups, setShowGroups] = useState(false);

  // Mettre à jour la ref quand currentYear change
  useEffect(() => {
    currentYearRef.current = currentYear;
    console.log("GraphView currentYear changed to:", currentYear);
    forceUpdate({}); // Forcer le re-render du SVG
  }, [currentYear]);

  // 🔹 Sélectionner automatiquement la Zone 1 si elle existe
  useEffect(() => {
    if (areas.length > 0 && selectedAreaId === null) {
      setSelectedAreaId(areas[0].id); // Sélectionner la première zone par défaut
    }
  }, [areas, selectedAreaId]);

  // Marquer le chart comme prêt après le premier render
  useEffect(() => {
    if (chartRef.current && chartRef.current.scales && chartRef.current.scales.x) {
      setChartReady(true);
    }
  }, [chartRef.current?.scales]);

  // Forcer le re-render du chart quand currentYear change
  useEffect(() => {
    const chart = chartRef.current;
    console.log("GraphView useEffect triggered, chart exists:", !!chart, "currentYear:", currentYear);
    if (chart) {
      // Forcer un redraw complet
      chart.update('active');
      // Alternative: forcer render via requestAnimationFrame
      requestAnimationFrame(() => {
        chart.render();
        console.log("GraphView chart rendered for year:", currentYear);
      });
    }
  }, [currentYear]);

  // ============================================================
  // 🔹 FONCTION UTILITAIRE : CALCUL DES MOYENNES PAR ANNÉE
  // ============================================================
  const calculateYearlyMeans = useMemo(() => {
    return (cellIds: number[]) => {
      const years = Array.from({ length: 2025 - 1880 + 1 }, (_, i) => 1880 + i);
      return years.map((year) => {
        const values: number[] = [];
        cellIds.forEach((cellId) => {
          const cell = tempData.tempanomalies[cellId];
          if (cell) {
            const val = getInterpolatedValue(cell, year);
            if (val !== null) values.push(val);
          }
        });
        if (values.length === 0) return { year, avgValue: null };
        return {
          year,
          avgValue: values.reduce((sum, v) => sum + v, 0) / values.length,
        };
      }).filter((d) => d.avgValue !== null) as Array<{
        year: number;
        avgValue: number;
      }>;
    };
  }, [tempData, getInterpolatedValue]);

  // ============================================================
  // 🔹 CALCUL DES DATASETS POUR LES 2 MODES
  // ============================================================
  const datasets = useMemo(() => {
    const result: Array<{
      id: string;
      name: string;
      color: string;
      data: Array<{ year: number; avgValue: number }>;
    }> = [];

    // 🔹 MODE 1 : SINGLE AREA (si activé et zone sélectionnée)
    if (showSingleArea && selectedAreaId !== null) {
      const area = areas.find((a) => a.id === selectedAreaId);
      if (area && area.cellIds.length > 0) {
        const data = calculateYearlyMeans(area.cellIds);
        result.push({
          id: `area-${area.id}`,
          name: area.name,
          color: area.color,
          data,
        });
      }
    }

    // 🔹 MODE 2 : GROUPS (si activé)
    if (showGroups) {
      activeGroupIds.forEach((groupId) => {
        const group = groups.find((g) => g.id === groupId);
        if (!group) return;

        const allCellIds = new Set<number>();
        group.areaIds.forEach((areaId) => {
          const area = areas.find((a) => a.id === areaId);
          if (area) {
            area.cellIds.forEach((cellId) => allCellIds.add(cellId));
          }
        });

        const data = calculateYearlyMeans(Array.from(allCellIds));
        result.push({
          id: `group-${group.id}`,
          name: group.name,
          color: group.color,
          data,
        });
      });
    }

    return result;
  }, [selectedAreaId, areas, activeGroupIds, groups, tempData, getInterpolatedValue, calculateYearlyMeans, showSingleArea, showGroups]);

  // ============================================================
  // 🔹 PRÉPARER LES DONNÉES POUR CHART.JS
  // ============================================================
  const chartData = useMemo(() => {
    const years = Array.from({ length: 2025 - 1880 + 1 }, (_, i) => 1880 + i);
    
    return {
      labels: years,
      datasets: datasets.map((ds) => {
        const dataMap = new Map(ds.data.map((d) => [d.year, d.avgValue]));
        return {
          label: ds.name,
          data: years.map((y) => dataMap.get(y) ?? null),
          borderColor: ds.color,
          backgroundColor: ds.color + "33",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0, // Désactiver le grossissement au hover
          pointHoverBorderWidth: 2, // Garder la même épaisseur
          tension: 0.1,
        };
      }),
    };
  }, [datasets]);

  // ============================================================
  // 🔹 OPTIONS CHART.JS
  // ============================================================
  const chartOptions: ChartOptions<"line"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    onClick: (_event: ChartEvent, _activeElements: ActiveElement[], chart) => {
      const canvasPosition = getRelativePosition(_event, chart);
      const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
      if (dataX !== undefined) {
        const year = Math.round(dataX);
        if (year >= 1880 && year <= 2025) {
          console.log("GraphView onClick - Setting year to:", year);
          setYear(year);
          // Forcer immédiatement le redraw
          setTimeout(() => {
            chart.update();
          }, 0);
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#cbd5e1",
          font: { size: 12, weight: "bold" },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        borderColor: "#3b82f6",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: "linear",
        min: 1880,
        max: 2025,
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          stepSize: 20,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        title: {
          display: true,
          text: "Year",
          color: "#7aa2ff",
          font: { size: 13, weight: "bold" },
        },
      },
      y: {
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        title: {
          display: true,
          text: "Temperature Anomaly (°C)",
          color: "#7aa2ff",
          font: { size: 13, weight: "bold" },
        },
      },
    },
  }), [setYear, currentYear]); // Ajouter currentYear comme dépendance

  // ============================================================
  // 🔹 RENDU
  // ============================================================
  if (areas.length === 0) {
    return (
      <div className="graphview-container">
        <h2>Temperature Anomaly Graph</h2>
        <div className="graphview-placeholder">
          <p>⚠️ No areas selected. Draw rectangular zones on the map to see temperature anomaly trends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="graphview-container">
      <h2>Temperature Anomaly Graph</h2>

      {/* 🔹 BOUTONS DE MODES */}
      <div className="graph-mode-buttons">
        <button
          className={`mode-btn ${showSingleArea ? "active" : ""}`}
          onClick={() => {
            setShowSingleArea(true);
            setShowGroups(false);
          }}
          disabled={areas.length === 0}
        >
          Single Area
        </button>
        <button
          className={`mode-btn ${showGroups ? "active" : ""}`}
          onClick={() => {
            setShowSingleArea(false);
            setShowGroups(true);
          }}
          disabled={groups.length === 0}
        >
          Groups
        </button>
      </div>

      {/* 🔹 SECTION 1 : SINGLE AREA SELECTOR (visible si activé) */}
      {showSingleArea && areas.length > 0 && (
        <div className="graphview-section">
          <h4>Single Area Selection</h4>
          <div className="area-selector">
            <label>
              <input
                type="radio"
                name="singleArea"
                checked={selectedAreaId === null}
                onChange={() => setSelectedAreaId(null)}
              />
              <span>None</span>
            </label>
            {areas.map((area) => (
              <label key={area.id} className="area-option">
                <input
                  type="radio"
                  name="singleArea"
                  checked={selectedAreaId === area.id}
                  onChange={() => setSelectedAreaId(area.id)}
                />
                <span
                  className="color-box"
                  style={{ backgroundColor: area.color }}
                />
                <span>{area.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 SECTION 2 : GROUPS COMPARISON (visible si activé) */}
      {showGroups && groups.length > 0 && (
        <div className="graphview-section">
          <h4>Groups Selection</h4>
          <div className="group-selector">
            {groups.map((group) => (
              <label key={group.id} className="group-checkbox">
                <input
                  type="checkbox"
                  checked={activeGroupIds.includes(group.id)}
                  onChange={() => toggleActiveGroup(group.id)}
                />
                <span
                  className="color-box"
                  style={{ backgroundColor: group.color }}
                />
                {group.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 GRAPHIQUE CHART.JS */}
      {datasets.length > 0 && (
        <div className="graphview-chart" style={{ position: 'relative' }}>
          <Line 
            ref={chartRef}
            data={chartData} 
            options={chartOptions} 
            plugins={[]} 
          />
          {/* Ligne verticale pour l'année courante */}
          {chartReady && chartRef.current && chartRef.current.scales?.x && (() => {
            const chart = chartRef.current;
            if (!chart?.scales?.x || !chart?.scales?.y) return null;
            
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            const x = xAxis.getPixelForValue(currentYear);
            const y1 = yAxis.top;
            const y2 = yAxis.bottom;
            
            console.log("Year Line - year:", currentYear, "x:", x, "y1:", y1, "y2:", y2);
            
            return (
              <>
                {/* Ligne verticale */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y1}px`,
                    width: '4px',
                    height: `${y2 - y1}px`,
                    background: 'repeating-linear-gradient(to bottom, #fbbf24 0px, #fbbf24 10px, transparent 10px, transparent 15px)',
                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    transform: 'translateX(-2px)',
                  }}
                />
                {/* Label de l'année */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y1 - 35}px`,
                    transform: 'translateX(-35px)',
                    width: '70px',
                    height: '26px',
                    backgroundColor: '#0b0f19',
                    border: '2px solid #fbbf24',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.3)',
                  }}
                >
                  {currentYear}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* 🔹 PAS DE DONNÉES */}
      {datasets.length === 0 && (
        <div className="graphview-placeholder">
          <p>Select a mode and activate areas or groups to see temperature anomaly trends.</p>
        </div>
      )}
    </div>
  );
}
