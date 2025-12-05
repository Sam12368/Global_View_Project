import "./HistogramView.css";
import { useData } from "../../hooks/useData";
import { useSelections } from "../../hooks/useSelection";
import { useYear } from "../../hooks/useYear";
import { useMemo, useState } from "react";

export default function HistogramView() {
  const { tempData, getValue } = useData();
  const { selectedLatitudes, mode } = useSelections();
  const { currentYear } = useYear();
  const [selectedLongitude, setSelectedLongitude] = useState<number | null>(null);

  // Calculer les données moyennes par longitude pour les latitudes sélectionnées
  const histogramData = useMemo(() => {
    if (mode !== "latitudes" || selectedLatitudes.length === 0) return [];

    const longitudes = Array.from(new Set(tempData.tempanomalies.map(a => a.lon))).sort((a, b) => a - b);
    
    return longitudes.map(lon => {
      let sum = 0;
      let count = 0;

      tempData.tempanomalies.forEach(area => {
        if (area.lon === lon && selectedLatitudes.includes(area.lat)) {
          const value = getValue(area, currentYear);
          if (value !== null) {
            sum += value;
            count++;
          }
        }
      });

      return {
        longitude: lon,
        avgValue: count > 0 ? sum / count : null
      };
    }).filter(d => d.avgValue !== null);
  }, [tempData, selectedLatitudes, currentYear, mode, getValue]);

  if (mode !== "latitudes" || selectedLatitudes.length === 0) {
    return (
      <div className="histogram-view">
        <h3>Longitude Histogram</h3>
        <p className="empty-message">Select latitudes to view the histogram.</p>
      </div>
    );
  }

  if (histogramData.length === 0) {
    return (
      <div className="histogram-view">
        <h3>Longitude Histogram</h3>
        <p className="empty-message">No data available for selected latitudes at year {currentYear}.</p>
      </div>
    );
  }

  // Dimensions
  const width = 700;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Échelles
  const values = histogramData.map(d => d.avgValue!);
  const minValue = Math.min(...values, -2);
  const maxValue = Math.max(...values, 2);
  
  const barWidth = chartWidth / histogramData.length;
  const xScale = (index: number) => index * barWidth + barWidth / 2;
  const yScale = (value: number) => chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
  const zeroY = yScale(0);

  const handleBarClick = (longitude: number) => {
    setSelectedLongitude(longitude === selectedLongitude ? null : longitude);
  };

  return (
    <div className="histogram-view">
      <h3>Longitude Histogram (Year: {currentYear})</h3>
      <svg width={width} height={height} className="histogram-svg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          
          {/* Ligne de référence à 0 */}
          <line
            x1={0}
            y1={zeroY}
            x2={chartWidth}
            y2={zeroY}
            stroke="#666"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* Axes */}
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#333" strokeWidth={2} />
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" strokeWidth={2} />

          {/* Labels Y */}
          {[-2, -1, 0, 1, 2].map(value => (
            <text
              key={value}
              x={-10}
              y={yScale(value) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#666"
            >
              {value}°C
            </text>
          ))}

          {/* Barres */}
          {histogramData.map((d, i) => {
            const barHeight = Math.abs(yScale(d.avgValue!) - zeroY);
            const barY = d.avgValue! >= 0 ? yScale(d.avgValue!) : zeroY;
            const isSelected = d.longitude === selectedLongitude;
            const color = d.avgValue! >= 0 ? "#FDB863" : "#4292C6";

            return (
              <g key={d.longitude}>
                <rect
                  x={i * barWidth}
                  y={barY}
                  width={barWidth - 2}
                  height={barHeight}
                  fill={color}
                  fillOpacity={isSelected ? 0.9 : 0.7}
                  stroke={isSelected ? "#000" : "none"}
                  strokeWidth={isSelected ? 2 : 0}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleBarClick(d.longitude)}
                />
                {/* Label longitude (tous les 10) */}
                {i % 10 === 0 && (
                  <text
                    x={xScale(i)}
                    y={chartHeight + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#666"
                    transform={`rotate(-45, ${xScale(i)}, ${chartHeight + 15})`}
                  >
                    {d.longitude}°
                  </text>
                )}
              </g>
            );
          })}

          {/* Label X axis */}
          <text
            x={chartWidth / 2}
            y={chartHeight + 50}
            textAnchor="middle"
            fontSize="12"
            fill="#333"
            fontWeight="bold"
          >
            Longitude
          </text>

          {/* Label Y axis */}
          <text
            x={-chartHeight / 2}
            y={-40}
            textAnchor="middle"
            fontSize="12"
            fill="#333"
            fontWeight="bold"
            transform={`rotate(-90, -40, ${chartHeight / 2})`}
          >
            Temperature Anomaly (°C)
          </text>
        </g>
      </svg>
      
      <div className="histogram-info">
        <small>
          {selectedLatitudes.length} latitude(s) selected
          {selectedLongitude !== null && ` · Selected: ${selectedLongitude}°`}
        </small>
      </div>
    </div>
  );
}
