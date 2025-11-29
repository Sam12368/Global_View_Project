import { createSlice } from "@reduxjs/toolkit";
import type { TempAnomalyData } from "./dataTypes";

// importer le JSON
import JSONdata from "../../assets/tempanomaly_4x4grid_v2.json";

export interface DataState {
  tempData: TempAnomalyData;
}

const initialState: DataState = {
  tempData: JSONdata as TempAnomalyData, // typage du JSON
  
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    // aucun reducer : données statiques
  },
});

export const {} = dataSlice.actions;
export default dataSlice.reducer;