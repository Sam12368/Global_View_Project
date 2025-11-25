import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "../features/data/dataSlices";
import yearReducer from "../features/year/yearSlices";
import selectionReducer from "../features/selection/selectionSlices";
import viewsReducer from "../features/views/viewsSlices";
import animationReducer from "../features/animation/animationSlices";

export const store = configureStore({
  reducer: {
    data: dataReducer,
    year: yearReducer,
    selection: selectionReducer,
    views: viewsReducer,
    animation: animationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
