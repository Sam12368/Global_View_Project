import "./HeatmapView.css";
import { useData } from "../../hooks/useData";
import { useYear } from "../../hooks/useYear";
import { useSelections } from "../../hooks/useSelection";
import { useMemo } from "react";

export default function HeatmapView() {
  const { tempData, getValue, getColor } = useData();
  const { currentYear, setYear } = useYear();
  const { addLatitude, removeLatitude, selectedLatitudes } = useSelections();

  // Calculer les données moyennes par latitude et année
  const heatmapData = useMemo(() => {
    const latitudes = Array.from(new Set(tempData.tempanomalies.map(a => a.lat))).sort((a, b) => b - a);
    const years = Array.from({ length: 2025 - 1880 + 1 }, (_, i) => 1880 + i);

    return latitudes.map(lat => {
      const yearValues = years.map(year => {
        let sum = 0;
        let count = 0;

        tempData.tempanomalies.forEach(area => {
          if (area.lat === lat) {
            const value = getValue(area, year);
            if (value !== null) {
              sum += value;
              count++;
            }
          }
        });

        return count > 0 ? sum / count : null;
      });

      return { latitude: lat, yearValues };
    });
  }, [tempData, getValue]);

  // Dimensions
  const cellWidth = 4;
  const cellHeight = 4;
  const years = Array.from({ length: 2025 - 1880 + 1 }, (_, i) => 1880 + i);
  const latitudes = heatmapData.map(d => d.latitude);
  
  const width = years.length * cellWidth + 80;
  const height = latitudes.length * cellHeight + 60;
  const margin = { top: 30, right: 20, bottom: 30, left: 50 };

  const handleCellClick = (lat: number, year: number) => {
    setYear(year);
    if (selectedLatitudes.includes(lat)) {
      removeLatitude(lat);
    } else {
      addLatitude(lat);
    }
  };

  return (
    <div className="heatmap-view">
      <h3>Temperature Anomaly Heatmap</h3>
      <div className="heatmap-container">
        <svg width={width} height={height} className="heatmap-svg">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            
            {/* Cellules de la heatmap */}
            {heatmapData.map((row, latIndex) => (
              <g key={row.latitude}>
                {row.yearValues.map((value, yearIndex) => {
                  if (value === null) return null;
                  
                  const year = years[yearIndex];
                  const x = yearIndex * cellWidth;
                  const y = latIndex * cellHeight;
                  const color = getColor({ lat: row.latitude, lon: 0, data: [{ year, value }] }, year);
                  const isCurrentYear = year === currentYear;
                  const isSelectedLat = selectedLatitudes.includes(row.latitude);

                  return (
                    <rect
                      key={yearIndex}
                      x={x}
                      y={y}
                      width={cellWidth}
                      height={cellHeight}
                      fill={color}
                      stroke={isCurrentYear || isSelectedLat ? "#000" : "none"}
                      strokeWidth={isCurrentYear && isSelectedLat ? 2 : 1}
                      opacity={color === "rgba(0,0,0,0)" ? 0 : 0.9}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCellClick(row.latitude, year)}
                    />
                  );
                })}
                
                {/* Label latitude */}
                {latIndex % 5 === 0 && (
                  <text
                    x={-5}
                    y={latIndex * cellHeight + cellHeight / 2 + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#666"
                  >
                    {row.latitude}°
                  </text>
                )}
              </g>
            ))}

            {/* Labels années (tous les 20 ans) */}
            {years.filter((_, i) => i % 20 === 0).map((year, i) => {
              const index = years.indexOf(year);
              return (
                <text
                  key={year}
                  x={index * cellWidth + cellWidth / 2}
                  y={-10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {year}
                </text>
              );
            })}

            {/* Ligne verticale pour l'année courante */}
            <line
              x1={years.indexOf(currentYear) * cellWidth}
              y1={0}
              x2={years.indexOf(currentYear) * cellWidth}
              y2={latitudes.length * cellHeight}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4 4"
            />

            {/* Label année courante */}
            <text
              x={years.indexOf(currentYear) * cellWidth + cellWidth / 2}
              y={latitudes.length * cellHeight + 20}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#ef4444"
            >
              {currentYear}
            </text>

            {/* Axes */}
            <line
              x1={0}
              y1={latitudes.length * cellHeight}
              x2={years.length * cellWidth}
              y2={latitudes.length * cellHeight}
              stroke="#333"
              strokeWidth={1}
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={latitudes.length * cellHeight}
              stroke="#333"
              strokeWidth={1}
            />
          </g>
        </svg>
      </div>
      
      <div className="heatmap-info">
        <small>
          Click on a cell to select latitude and year
          {selectedLatitudes.length > 0 && ` · ${selectedLatitudes.length} latitude(s) selected`}
        </small>
      </div>
    </div>
  );
}
