import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Hook 1 : dispatch typé
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook 2 : selector typé
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);