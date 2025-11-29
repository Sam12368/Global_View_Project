import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SelectionMode = "areas" | "latitudes";

interface GroupSelection {
  id: number;
  name: string;
  color: string;
  zoneIds: number[];
}

interface SelectionState {
  mode: SelectionMode;
  selectedAreas: number[];      // OK
  selectedLatitudes: number[];   //  OK
  groups: GroupSelection[];      // OK
  nextGroupId: number;           // générateur d’ID
}

const initialState: SelectionState = {
  mode: "areas",
  selectedAreas: [],
  selectedLatitudes: [],
  groups: [],
  nextGroupId: 1,
};

export const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {

    // 🔵 1. Mode de sélection (areas ou latitudes)
    setMode: (state, action: PayloadAction<SelectionMode>) => {
      state.mode = action.payload;
    },

    // 🔵 2. Sélection simple : une zone = un number
    addArea: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (!state.selectedAreas.includes(id)) {
        state.selectedAreas.push(id);
      }
    },

    removeArea: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.selectedAreas = state.selectedAreas.filter(a => a !== id);
    },

    // 🔵 3. Sélection de latitude
    addLatitude: (state, action: PayloadAction<number>) => {
      const lat = action.payload;
      if (!state.selectedLatitudes.includes(lat)) {
        state.selectedLatitudes.push(lat);
      }
    },

    removeLatitude: (state, action: PayloadAction<number>) => {
      const lat = action.payload;
      state.selectedLatitudes = state.selectedLatitudes.filter(l => l !== lat);
    },

    // 🔵 4. Groupes
    addGroup: (state) => {
      state.groups.push({
        id: state.nextGroupId,
        name: `Group ${state.nextGroupId}`,
        color: randomColor(),
        zoneIds: [],
      });
      state.nextGroupId++;
    },

    removeGroup: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.groups = state.groups.filter(g => g.id !== id);
    },

    addZoneToGroup: (
      state,
      action: PayloadAction<{ groupId: number; zoneId: number }>
    ) => {
      const { groupId, zoneId } = action.payload;
      const group = state.groups.find(g => g.id === groupId);
      if (group && !group.zoneIds.includes(zoneId)) {
        group.zoneIds.push(zoneId);
      }
    },

    removeZoneFromGroup: (
      state,
      action: PayloadAction<{ groupId: number; zoneId: number }>
    ) => {
      const { groupId, zoneId } = action.payload;
      const group = state.groups.find(g => g.id === groupId);
      if (group) {
        group.zoneIds = group.zoneIds.filter(z => z !== zoneId);
      }
    },
  },
});

function randomColor() {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16)}`;
}

export const {
  setMode,
  addArea,
  removeArea,
  addLatitude,
  removeLatitude,
  addGroup,
  removeGroup,
  addZoneToGroup,
  removeZoneFromGroup,
} = selectionSlice.actions;

export default selectionSlice.reducer;
