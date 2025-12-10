// src/components/ViewsGrid/ViewsGrid.tsx
import "./ViewsGrid.css";
import { useViews } from "../../hooks/useViews";
import GraphView from "./GraphView";
import HistogramView from "./HistogramView";
import HeatmapView from "./HeatmapView";

const ViewsGrid: React.FC = () => {
  const { graphViewVisible, histogramViewVisible, heatmapViewVisible } =
    useViews();

  const any = graphViewVisible || histogramViewVisible || heatmapViewVisible;

  if (!any) {
    return (
      <div className="viewsgrid-root">
        <p className="viewsgrid-placeholder">
          No view selected yet. Use the right panel to toggle Graph / Histogram.
        </p>
      </div>
    );
  }

  return (
    <div className="viewsgrid-root">
      {graphViewVisible && (
        <div className="viewsgrid-card">
          <GraphView />
        </div>
      )}

      {histogramViewVisible && (
        <div className="viewsgrid-card">
          <HistogramView />
        </div>
      )}

      {heatmapViewVisible && (
        <div className="viewsgrid-card">
          <HeatmapView />
        </div>
      )}
    </div>
  );
};

export default ViewsGrid;
