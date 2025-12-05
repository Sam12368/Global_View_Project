import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setYear, nextYear, prevYear,changeYearTo} from "../features/year/yearSlices";

export function useYear() {
  const currentYear = useAppSelector(state => state.year.currentYear);
  const dispatch = useAppDispatch();

  return {
    currentYear,
    setYear: (y: number) => dispatch(setYear(y)),
    changeYearTo: (y: number) => dispatch(changeYearTo(y)),
    next: () => dispatch(nextYear()),
    prev: () => dispatch(prevYear())
  };
}