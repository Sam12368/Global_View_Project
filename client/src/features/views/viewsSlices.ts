import { createSlice , type PayloadAction } from "@reduxjs/toolkit";

export const Views = {
    "GRAPH": "graph",
    "HISTOGRAM": "histogram",
    "HEATMAP": "heatmap",} as const;

export type ViewType = typeof Views[keyof typeof Views];

interface ViewsState {
    graphVisible: boolean;
    histogramVisible: boolean;
    heatmapVisible: boolean;
    layout: ViewType[];
}
const initialState: ViewsState = {
    graphVisible: false,
    histogramVisible: false, 
    heatmapVisible: false,
    layout: [Views.GRAPH, Views.HISTOGRAM, Views.HEATMAP],
};

export const viewsSlice = createSlice({
    name: "views",
    initialState,
    reducers: {
        showView: (state, action: PayloadAction<ViewType>) => {
            const view = action.payload;
            if (view === Views.GRAPH) {
                state.graphVisible = true;
            } else if (view === Views.HISTOGRAM) {
                state.histogramVisible = true;
            } else if (view === Views.HEATMAP) {
                state.heatmapVisible = true;

            } 

            if (!state.layout.includes(view)) {
                state.layout.push(view);
            }
              },

        hideView: (state, action: PayloadAction<ViewType>) => {
            const view = action.payload;
            if (view === Views.GRAPH) {
                state.graphVisible = false;
            } else if (view === Views.HISTOGRAM) {
                state.histogramVisible = false;
            } else if (view === Views.HEATMAP) {
                state.heatmapVisible = false;
            }
            state.layout = state.layout.filter(v => v !== view);


        }, 
        setLayoutOrder: (state, action: PayloadAction<ViewType[]>) => {
            state.layout = action.payload;
        }
        



    },}); 
export const { showView, hideView, setLayoutOrder } = viewsSlice.actions;
export default viewsSlice.reducer;
    
    
    
    
    

