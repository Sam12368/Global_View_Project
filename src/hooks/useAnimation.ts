import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  playAnimation,
  pauseAnimation,
  backAnimation as stopAnimation,
  setSpeed,
} from "../features/animation/animationSlices";

export function useAnimation() {
  const state = useAppSelector((state) => state.animation);
  const dispatch = useAppDispatch();

  return {
    // --- lecture du state ---
    playing: state.isPlaying,
    speed: state.speed,

    // --- actions ---
    play: () => dispatch(playAnimation()),
    pause: () => dispatch(pauseAnimation()),
    stop: () => dispatch(stopAnimation()),
    setSpeed: (value: number) => dispatch(setSpeed(value)),
  };
}