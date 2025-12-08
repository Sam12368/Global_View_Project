// src/components/ViewsGrid/ViewsGrid.tsx
import "./ViewsGrid.css";
import { useViews } from "../../hooks/useViews";
//import GraphView from "./GraphView";

const ViewsGrid: React.FC = () => {
  const { graphViewVisible, histogramViewVisible, heatmapViewVisible } =
    useViews();

  const any = graphViewVisible || histogramViewVisible || heatmapViewVisible;

  if (!any) {
    return (
      <div className="viewsgrid-root">
        <p className="viewsgrid-placeholder">
          No view selected yet. Use the right panel to toggle Graph / Histogram / Heatmap.
        </p>
      </div>
    );
  }

  return (
    <div className="viewsgrid-root">
      {graphViewVisible && (
        <div className="viewsgrid-card">
          <h3>Graph View</h3>
        </div>
      )}

      {histogramViewVisible && (
        <div className="viewsgrid-card">
          <h3>Histogram View</h3>
          <p>(to implement later)</p>
        </div>
      )}

      {heatmapViewVisible && (
        <div className="viewsgrid-card">
          <h3>Heatmap View</h3>
          <p>(to implement later)</p>
        </div>
      )}
    </div>
  );
};

export default ViewsGrid;
