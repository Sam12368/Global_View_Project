import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setMode, 
    addArea, addGroup,
     addLatitude, addZoneToGroup,
     removeArea,removeGroup,removeLatitude,
     removeZoneFromGroup } from "../features/selection/selectionSlices";

     export function useSelections() {
        const state = useAppSelector(state=> state.selection);
        const dispatch = useAppDispatch();

        return {
            mode: state.mode,
            selectedAreas: state.selectedAreas,
            selectedLatitudes: state.selectedLatitudes,
            groups: state.groups,
            setMode: (mode: "areas" | "latitudes") => dispatch(setMode(mode)),
            addArea: (id: number) => dispatch(addArea(id)),
            removeArea: (id: number) => dispatch(removeArea(id)),
            addLatitude: (lat: number) => dispatch(addLatitude(lat)),
            removeLatitude: (lat: number) => dispatch(removeLatitude(lat)),
            addGroup: () => dispatch(addGroup()),
            removeGroup: (id: number) => dispatch(removeGroup(id)),
            addZoneToGroup: (groupId: number, zoneId: number) => dispatch(addZoneToGroup({groupId, zoneId})),
            removeZoneFromGroup: (groupId: number, zoneId: number) => dispatch(removeZoneFromGroup({groupId, zoneId})),
        };
     }