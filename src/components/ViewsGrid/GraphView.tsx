import "./GraphView.css";
import { useData } from "../../hooks/useData";
import { useSelections } from "../../hooks/useSelection";
import { useYear } from "../../hooks/useYear";
import { useMemo, useRef } from "react";

export default function GraphView() {
  const { tempData, getValue } = useData();
  const { selectedAreas, selectedLatitudes, mode } = useSelections();
  const { currentYear, setYear } = useYear();
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculer les données moyennes par année
  const graphData = useMemo(() => {
    if (mode === "areas" && selectedAreas.length === 0) return [];
    if (mode === "latitudes" && selectedLatitudes.length === 0) return [];

    const years = Array.from({ length: 2025 - 1880 + 1 }, (_, i) => 1880 + i);
    
    return years.map(year => {
      let sum = 0;
      let count = 0;

      if (mode === "areas") {
        selectedAreas.forEach(areaIndex => {
          const area = tempData.tempanomalies[areaIndex];
          if (area) {
            const value = getValue(area, year);
            if (value !== null) {
              sum += value;
              count++;
            }
          }
        });
      } else if (mode === "latitudes") {
        tempData.tempanomalies.forEach(area => {
          if (selectedLatitudes.includes(area.lat)) {
            const value = getValue(area, year);
            if (value !== null) {
              sum += value;
              count++;
            }
          }
        });
      }

      return {
        year,
        avgValue: count > 0 ? sum / count : null
      };
    }).filter(d => d.avgValue !== null);
  }, [tempData, selectedAreas, selectedLatitudes, mode, getValue]);

  // Trouver min/max pour l'échelle
  const { minValue, maxValue } = useMemo(() => {
    if (graphData.length === 0) return { minValue: -2, maxValue: 2 };
    const values = graphData.map(d => d.avgValue!);
    return {
      minValue: Math.min(...values, -2),
      maxValue: Math.max(...values, 2)
    };
  }, [graphData]);

  if (graphData.length === 0) {
    return (
      <div className="graph-view">
        <h3>Temperature Anomaly Graph</h3>
        <p className="empty-message">No data selected. Select areas or latitudes to view the graph.</p>
      </div>
    );
  }

  // Dimensions du graphique
  const width = 600;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Échelles
  const xScale = (year: number) => ((year - 1880) / (2025 - 1880)) * chartWidth;
  const yScale = (value: number) => chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  // Générer le path pour la ligne
  const linePath = graphData.map((d, i) => {
    const x = xScale(d.year);
    const y = yScale(d.avgValue!);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Lignes de grille horizontales
  const gridLines = [-2, -1, 0, 1, 2].map(value => ({
    value,
    y: yScale(value)
  }));

  // Gérer le clic sur le graphique pour changer l'année
  const handleGraphClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - margin.left;
    
    // Calculer l'année correspondante
    const yearRatio = x / chartWidth;
    const clickedYear = Math.round(1880 + yearRatio * (2025 - 1880));
    
    // Limiter entre min et max
    if (clickedYear >= 1880 && clickedYear <= 2025) {
      setYear(clickedYear);
    }
  };

  return (
    <div className="graph-view">
      <h3>Temperature Anomaly Graph</h3>
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        className="graph-svg"
        onClick={handleGraphClick}
        style={{ cursor: 'pointer' }}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          
          {/* Grille horizontale */}
          {gridLines.map(({ value, y }) => (
            <g key={value}>
              <line
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke={value === 0 ? "#999" : "#ddd"}
                strokeWidth={value === 0 ? 1 : 0.5}
              />
              <text
                x={-10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#666"
              >
                {value}°C
              </text>
            </g>
          ))}

          {/* Axes */}
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#333" strokeWidth={2} />
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" strokeWidth={2} />

          {/* Labels d'années */}
          {[1880, 1920, 1960, 2000, 2025].map(year => (
            <text
              key={year}
              x={xScale(year)}
              y={chartHeight + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#666"
            >
              {year}
            </text>
          ))}

          {/* Ligne de température */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* Points sur la ligne (tous les 10 ans) */}
          {graphData.filter((d, i) => i % 10 === 0).map(d => (
            <circle
              key={d.year}
              cx={xScale(d.year)}
              cy={yScale(d.avgValue!)}
              r={3}
              fill="#2563eb"
            />
          ))}

          {/* Ligne verticale pour l'année courante */}
          <line
            x1={xScale(currentYear)}
            y1={0}
            x2={xScale(currentYear)}
            y2={chartHeight}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          
          {/* Label de l'année courante */}
          <text
            x={xScale(currentYear)}
            y={-5}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#ef4444"
          >
            {currentYear}
          </text>
        </g>
      </svg>
      
      <div className="graph-info">
        <small>
          {mode === "areas" ? `${selectedAreas.length} area(s)` : `${selectedLatitudes.length} latitude(s)`} selected
          · Range: {minValue.toFixed(2)}°C to {maxValue.toFixed(2)}°C
        </small>
      </div>
    </div>
  );
}