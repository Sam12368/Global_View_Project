import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

interface YearState {
  currentYear: number;
}
const initialState: YearState = {
  currentYear: 1880,
};
export const yearSlice = createSlice({
  name: 'year',
  initialState, 
    reducers: {
    setYear: (state, action: PayloadAction<number>) => {
      state.currentYear = action.payload;
    }
    ,
    nextYear: (state) => {
      state.currentYear =Math.min(state.currentYear + 1, 2025);
    },
    prevYear: (state) => {
      state.currentYear = Math.max(state.currentYear - 1, 1880);
    }
    },
});

export const { setYear, nextYear, prevYear } = yearSlice.actions;
export const selectCurrentYear = (state: RootState) => state.year.currentYear;
export default yearSlice.reducer;