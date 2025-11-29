import { useViews } from "../../hooks/useViews";
import "./ViewSelector.css";

const ViewSelector: React.FC = () => {
	const { graphViewVisible, histogramViewVisible, heatmapViewVisible, showView, hideView, Views } = useViews();

	return (
		<div className="sidebar-block">
			<div className="sidebar-title">Add View</div>
			<div className="checkbox-row">
				<input type="checkbox" checked={graphViewVisible} onChange={e => e.target.checked ? showView(Views.GRAPH) : hideView(Views.GRAPH)} />
				<span>Graph</span>
			</div>
			<div className="checkbox-row">
				<input type="checkbox" checked={histogramViewVisible} onChange={e => e.target.checked ? showView(Views.HISTOGRAM) : hideView(Views.HISTOGRAM)} />
				<span>Histogram</span>
			</div>
			<div className="checkbox-row">
				<input type="checkbox" checked={heatmapViewVisible} onChange={e => e.target.checked ? showView(Views.HEATMAP) : hideView(Views.HEATMAP)} />
				<span>Heatmap</span>
			</div>
		</div>
	);
};

export default ViewSelector;



