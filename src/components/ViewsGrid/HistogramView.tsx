// src/components/ViewsGrid/HistogramView.tsx
import "./HistogramView.css";
import { useData } from "../../hooks/useData";
import { useSelections } from "../../hooks/useSelection";
import { useYear } from "../../hooks/useYear";
import { useMemo, useState } from "react";

export default function HistogramView() {
  const { tempData, getInterpolatedValue } = useData();
  const { selectedLatitudes, setHighlightedCells } = useSelections();
  const { currentYear } = useYear();
  
  const [selectedLongitude, setSelectedLongitude] = useState<number | null>(null);

  // ============================================================
  // 🔹 CALCULER LES DONNÉES DE L'HISTOGRAMME
  // ============================================================
  const histogramData = useMemo(() => {
    // L'histogramme fonctionne dès qu'il y a des latitudes sélectionnées
    if (selectedLatitudes.length === 0) return [];

    // Récupérer toutes les longitudes uniques
    const longitudes = Array.from(
      new Set(tempData.tempanomalies.map((a) => a.lon))
    ).sort((a, b) => a - b);

    // Pour chaque longitude, calculer la moyenne pour les latitudes sélectionnées
    const result: Array<{
      longitude: number;
      avgValue: number;
      cellIds: number[];
      latitudes: number[];
    }> = [];

    longitudes.forEach((lon) => {
      const cellIds: number[] = [];
      const values: number[] = [];

      tempData.tempanomalies.forEach((cell, index) => {
        if (cell.lon === lon && selectedLatitudes.includes(cell.lat)) {
          cellIds.push(index);
          const val = getInterpolatedValue(cell, currentYear);
          if (val !== null) values.push(val);
        }
      });

      if (values.length > 0) {
        const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
        result.push({
          longitude: lon,
          avgValue,
          cellIds,
          latitudes: selectedLatitudes,
        });
      }
    });

    return result;
  }, [selectedLatitudes, tempData, currentYear, getInterpolatedValue]);

  // ============================================================
  // 🔹 CALCULER LES MIN/MAX POUR L'ÉCHELLE
  // ============================================================
  const { minValue, maxValue } = useMemo(() => {
    if (histogramData.length === 0) return { minValue: -2, maxValue: 2 };
    
    const values = histogramData.map((d) => d.avgValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Toujours inclure zéro dans l'échelle
    const finalMin = Math.min(min, 0);
    const finalMax = Math.max(max, 0);
    
    // Arrondir à des valeurs fixes pour éviter les changements
    return {
      minValue: Math.floor(finalMin),
      maxValue: Math.ceil(finalMax),
    };
  }, [histogramData]);

  // ============================================================
  // 🔹 GÉNÉRER LES GRADUATIONS DE L'ÉCHELLE Y
  // ============================================================
  const yAxisTicks = useMemo(() => {
    const ticks: number[] = [];
    
    // Pas fixe de 1°C
    for (let value = minValue; value <= maxValue; value += 1) {
      ticks.push(value);
    }
    
    return ticks;
  }, [minValue, maxValue]);

  // ============================================================
  // 🔹 GÉRER LE CLIC SUR UNE BARRE
  // ============================================================
  const handleBarClick = (longitude: number, cellIds: number[]) => {
    // Toggle : si déjà sélectionnée, on désélectionne
    if (selectedLongitude === longitude) {
      setSelectedLongitude(null);
      setHighlightedCells([]);
    } else {
      setSelectedLongitude(longitude);
      setHighlightedCells(cellIds);
    }
  };

  // ============================================================
  // 🔹 DIMENSIONS
  // ============================================================
  const width = 700;
  const height = 350;
  const margin = { top: 30, right: 30, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const barWidth = histogramData.length > 0 ? chartWidth / histogramData.length : 0;

  // Échelle Y
  const yScale = (value: number) => {
    const range = maxValue - minValue;
    if (range === 0) return chartHeight / 2;
    return chartHeight - ((value - minValue) / range) * chartHeight;
  };

  // Position Y de zéro
  const zeroY = yScale(0);

  // ============================================================
  // 🔹 RENDU
  // ============================================================
  if (selectedLatitudes.length === 0) {
    return (
      <div className="histogramview-container">
        <h2>📊 Longitude Histogram</h2>
        <div className="histogramview-placeholder">
          <p>⚠️ Select latitudes on the map to view the histogram.</p>
        </div>
      </div>
    );
  }

  if (histogramData.length === 0) {
    return (
      <div className="histogramview-container">
        <h2>📊 Longitude Histogram</h2>
        <div className="histogramview-placeholder">
          <p>No data available for year {currentYear}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="histogramview-container">
      <h2>📊 Longitude Histogram</h2>
      <p className="histogram-subtitle">
        Temperature anomalies by longitude for year {currentYear}
      </p>

      <div className="histogram-chart-wrapper">
        <svg width={width} height={height} className="histogram-svg">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            
            {/* Grille horizontale avec graduations intelligentes */}
            {yAxisTicks.map((value) => (
              <g key={value}>
                <line
                  x1={0}
                  y1={yScale(value)}
                  x2={chartWidth}
                  y2={yScale(value)}
                  stroke={value === 0 ? "#888" : "#333"}
                  strokeWidth={value === 0 ? 1.5 : 0.5}
                  strokeDasharray={value === 0 ? "0" : "2,2"}
                />
                <text
                  x={-10}
                  y={yScale(value) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94a3b8"
                  fontWeight={value === 0 ? "bold" : "normal"}
                >
                  {value.toFixed(1)}°C
                </text>
              </g>
            ))}

            {/* Barres */}
            {histogramData.map((data, index) => {
              const x = index * barWidth;
              const barHeight = Math.abs(yScale(data.avgValue) - zeroY);
              const y = data.avgValue >= 0 ? yScale(data.avgValue) : zeroY;
              const isSelected = selectedLongitude === data.longitude;
              
              let barColor = data.avgValue >= 0 ? "#ef4444" : "#3b82f6";
              if (isSelected) {
                barColor = "#fbbf24"; // jaune pour sélection
              }

              return (
                <g key={data.longitude}>
                  <rect
                    x={x + 2}
                    y={y}
                    width={barWidth - 4}
                    height={barHeight}
                    fill={barColor}
                    stroke={isSelected ? "#fff" : "none"}
                    strokeWidth={isSelected ? 2 : 0}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleBarClick(data.longitude, data.cellIds)}
                  />
                  
                  {/* Label de longitude (tous les 4 pour éviter surcharge) */}
                  {index % 4 === 0 && (
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 20}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94a3b8"
                    >
                      {data.longitude}°
                    </text>
                  )}

                  {/* Valeur au-dessus de la barre si sélectionnée */}
                  {isSelected && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#fbbf24"
                    >
                      {data.avgValue.toFixed(2)}°C
                    </text>
                  )}
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={chartHeight}
              stroke="#cbd5e1"
              strokeWidth={2}
            />
            <line
              x1={0}
              y1={chartHeight}
              x2={chartWidth}
              y2={chartHeight}
              stroke="#cbd5e1"
              strokeWidth={2}
            />

            {/* Labels des axes */}
            <text
              x={chartWidth / 2}
              y={chartHeight + 45}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill="#7aa2ff"
            >
              Longitude (°)
            </text>

            <text
              x={-chartHeight / 2}
              y={-40}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill="#7aa2ff"
              transform={`rotate(-90, -40, ${chartHeight / 2})`}
            >
              Temperature Anomaly (°C)
            </text>
          </g>
        </svg>

        {/* Info sélection */}
        {selectedLongitude !== null && (
          <div className="histogram-selection-info">
            <p>
              <strong>Selected Longitude:</strong> {selectedLongitude}°
              <br />
              <strong>Latitudes:</strong>{" "}
              {histogramData
                .find((d) => d.longitude === selectedLongitude)
                ?.latitudes.join(", ")}°
              <br />
              <strong>Avg Anomaly:</strong>{" "}
              {histogramData
                .find((d) => d.longitude === selectedLongitude)
                ?.avgValue.toFixed(2)}
              °C
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
