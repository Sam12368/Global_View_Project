import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useData = () => useSelector((state: RootState) => state.data);
export const useYear = () => useSelector((state: RootState) => state.year);
export const useSelection = () => useSelector((state: RootState) => state.selection);
export const useViews = () => useSelector((state: RootState) => state.views);
export const useAnimation = () => useSelector((state: RootState) => state.animation);