// src/hooks/useSelection.ts
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setMode,
  addLatitude,
  removeLatitude,
  clearLatitudes,
  createAreaFromCells,
  removeArea,
  clearAreas,
  createGroupFromAreas,
  removeGroup,
  clearGroups,
  toggleActiveGroup,
  setHighlightedCells,
  clearHighlight,
  type SelectionMode,
} from "../features/selection/selectionSlices";

/**
 * Hook custom qui encapsule toute la logique de sélection :
 * - mode (areas / latitudes)
 * - zones (areas)
 * - groupes
 * - groupes actifs pour comparaison
 * - fonctions qui dispatchent les bonnes actions Redux
 */
export function useSelections() {
  const state = useAppSelector((s) => s.selection);
  const dispatch = useAppDispatch();

  return {
    // ÉTAT LECTURE
    mode: state.mode,
    selectedLatitudes: state.selectedLatitudes,
    areas: state.areas,               // Zones (Zone 1, Zone 2, ...)
    groups: state.groups,             // Group 1 = ensemble de zones
    activeGroupIds: state.activeGroupIds, // groupes cochés pour graphes
    highlightedCellIds: state.highlightedCellIds, // cellules en surbrillance

    // ACTIONS : MODE
    setMode: (mode: SelectionMode) => dispatch(setMode(mode)),

    // ACTIONS : LATITUDES
    addLatitude: (lat: number) => dispatch(addLatitude(lat)),
    removeLatitude: (lat: number) => dispatch(removeLatitude(lat)),
    clearLatitudes: () => dispatch(clearLatitudes()),

    // ACTIONS : ZONES (AREAS)
    createAreaFromCells: (cellIds: number[]) =>
      dispatch(createAreaFromCells(cellIds)),
    removeArea: (areaId: number) => dispatch(removeArea(areaId)),
    clearAreas: () => dispatch(clearAreas()),

    // ACTIONS : GROUPES
    createGroupFromAreas: (areaIds: number[]) =>
      dispatch(createGroupFromAreas({ areaIds })),
    removeGroup: (groupId: number) => dispatch(removeGroup(groupId)),
    clearGroups: () => dispatch(clearGroups()),

    // ACTIONS : GROUPES ACTIFS
    toggleActiveGroup: (groupId: number) => dispatch(toggleActiveGroup(groupId)),

    // ACTIONS : HIGHLIGHT
    setHighlightedCells: (cellIds: number[]) => dispatch(setHighlightedCells(cellIds)),
    clearHighlight: () => dispatch(clearHighlight()),
  };
}
