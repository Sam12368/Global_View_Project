import "./ViewsGrid.css";
import { useViews } from "../../hooks/useViews";
import GraphView from "./GraphView";
import HistogramView from "./HistogramView";
import HeatmapView from "./HeatmapView";

const ViewsGrid: React.FC = () => {
  const { graphViewVisible, histogramViewVisible, heatmapViewVisible } = useViews();
  const any = graphViewVisible || histogramViewVisible || heatmapViewVisible;

  if (!any) {
    return (
      <div className="viewsgrid-root">
        <p className="viewsgrid-placeholder">
          Aucune vue sélectionnée pour l’instant.
        </p>
      </div>
    );
  }

  return (
    <div className="viewsgrid-root">
      {graphViewVisible && <GraphView />}
      {histogramViewVisible && <HistogramView />}
      {heatmapViewVisible && <HeatmapView />}
    </div>
  );
};

export default ViewsGrid;

