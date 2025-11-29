import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface animationState {
  isPlaying: boolean;
  speed: number; // Vitesse de l'animation en ms
}
const initialState: animationState = {
  isPlaying: false,
  speed: 1,
};
export const animationSlice = createSlice({
  name: "animation",
  initialState,
    reducers: {
    playAnimation: (state) => {
        state.isPlaying = true;
    },
    pauseAnimation: (state) => {
        state.isPlaying = false;
    },
    
    backAnimation: (state) => {
        state.isPlaying = false;
    }
    ,
    setSpeed: (state, action: PayloadAction<number>) => {
        let Newspeed = action.payload;
        Newspeed = Math.max(0.5, Math.min(3,Newspeed)); // Vitesse minimale de 0.1x
        state.speed = Newspeed;
    }
    },
});
export const { playAnimation, pauseAnimation, backAnimation, setSpeed } = animationSlice.actions;
export default animationSlice.reducer;

