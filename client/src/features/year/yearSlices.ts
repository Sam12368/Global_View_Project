import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface YearState {
  currentYear: number;
}

const initialState: YearState = {
  currentYear: 1880,
};

const yearSlice = createSlice({
  name: "year",
  initialState,
  reducers: {
    setYear: (state, action: PayloadAction<number>) => {
      state.currentYear = action.payload;
    }
  }
});

export const { setYear } = yearSlice.actions;
export default yearSlice.reducer;
