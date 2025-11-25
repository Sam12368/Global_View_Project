import { createSlice,type PayloadAction } from "@reduxjs/toolkit";

interface AnimationState {
  isPlaying: boolean;
  speed: number;
}

const initialState: AnimationState = {
  isPlaying: false,
  speed: 1,
};

const animationSlice = createSlice({
  name: "animation",
  initialState,
  reducers: {
    play(state) {
      state.isPlaying = true;
    },
    pause(state) {
      state.isPlaying = false;
    },
    setSpeed(state, action: PayloadAction<number>) {
      state.speed = action.payload;
    }
  }
});

export const { play, pause, setSpeed } = animationSlice.actions;
export default animationSlice.reducer;
