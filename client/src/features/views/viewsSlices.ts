import { createSlice } from "@reduxjs/toolkit";

interface ViewsState {
  graph: boolean;
  histogram: boolean;
  heatmap: boolean;
}

const initialState: ViewsState = {
  graph: false,
  histogram: false,
  heatmap: false
};

const viewsSlice = createSlice({
  name: "views",
  initialState,
  reducers: {
    toggleGraph(state) {
      state.graph = !state.graph;
    },
    toggleHistogram(state) {
      state.histogram = !state.histogram;
    },
    toggleHeatmap(state) {
      state.heatmap = !state.heatmap;
    }
  }
});

export const { toggleGraph, toggleHistogram, toggleHeatmap } = viewsSlice.actions;
export default viewsSlice.reducer;
