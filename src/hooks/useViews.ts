import { useAppDispatch, useAppSelector } from "../app/hooks";
import { hideView,showView,AllViews,setLayoutOrder } from "../features/views/viewsSlices";
import { type ViewType, Views } from "../features/views/viewsSlices";

export function useViews() {
    const state = useAppSelector(state=> state.views);
    const dispatch = useAppDispatch();
    return {
        graphViewVisible: state.graphVisible,
        histogramViewVisible: state.histogramVisible,
        heatmapViewVisible: state.heatmapVisible,
        layout: state.layout,
        showView: (view: ViewType) => dispatch(showView(view)),
        hideView: (view: ViewType) => dispatch(hideView(view)),
        setLayoutOrder: (layout: ViewType[]) => dispatch(setLayoutOrder(layout)),
        AllViews: (view: ViewType) => dispatch(AllViews(view)),   
        Views,  // Expose the Views constant for easy access
    };
}
