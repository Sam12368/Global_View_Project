import "./ViewsGrid.css";
import { useViews } from "../../hooks/useViews";

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
      {graphViewVisible && (
        <div className="viewsgrid-card">
          <h3>Graph View</h3>
          <p>(à implémenter)</p>
        </div>
      )}
      {histogramViewVisible && (
        <div className="viewsgrid-card">
          <h3>Histogram View</h3>
          <p>(à implémenter)</p>
        </div>
      )}
      {heatmapViewVisible && (
        <div className="viewsgrid-card">
          <h3>Heatmap View</h3>
          <p>(à implémenter)</p>
        </div>
      )}
    </div>
  );
};

export default ViewsGrid;
