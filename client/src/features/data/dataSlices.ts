import { createSlice } from "@reduxjs/toolkit";

const dataSlice = createSlice({
  name: "data",
  initialState: {
    tempData: null,
  },
  reducers: {}
});

export default dataSlice.reducer;

