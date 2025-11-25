import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SelectionState {
  selectedAreas: number[];
  selectedLatitudes: number[];
}

const initialState: SelectionState = {
  selectedAreas: [],
  selectedLatitudes: []
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    addLatitude(state, action: PayloadAction<number>) {
      if (!state.selectedLatitudes.includes(action.payload)) {
        state.selectedLatitudes.push(action.payload);
      }
    },
    selectArea(state, action: PayloadAction<number>) {
      if (!state.selectedAreas.includes(action.payload)) {
        state.selectedAreas.push(action.payload);
      }
    }
  }
});

export const { addLatitude, selectArea } = selectionSlice.actions;
export default selectionSlice.reducer;
