import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "../features/data/dataSlices";
import yearReducer from "../features/year/yearSlices";
import animationReducer from "../features/animation/animationSlices";
import viewsReducer from "../features/views/viewsSlices";
import selectionReducer from "../features/selection/selectionSlices";

export const store = configureStore({
  reducer: {
    data: dataReducer,
    year: yearReducer,
    animation: animationReducer,
    views: viewsReducer,
    selection: selectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
