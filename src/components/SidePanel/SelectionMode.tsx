import "./SelectionMode.css";
import { useSelections } from "../../hooks/useSelection";

export default function SelectionMode() {
  const { mode, setMode, selectedAreas, selectedLatitudes, groups, addGroup } = useSelections();

  return (
    <div className="sidebar-block">
      <div className="sidebar-title">Selection Mode</div>
      
      {/* Mode Areas */}
      <div className="toggle-row">
        <div className="toggle-label">Area</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={mode === "areas"} 
              onChange={() => setMode("areas")}
            />
            <span className="toggle-slider"></span>
          </label>
          <button className="small-plus-btn" onClick={addGroup} disabled={mode !== "areas"}>
            +
          </button>
        </div>
      </div>

      {/* Mode Latitudes */}
      <div className="toggle-row">
        <div className="toggle-label">Latitudes</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={mode === "latitudes"} 
              onChange={() => setMode("latitudes")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Affichage des sélections */}
      {mode === "areas" && selectedAreas.length > 0 && (
        <div className="selection-info">
          <small>{selectedAreas.length} zone(s) sélectionnée(s)</small>
        </div>
      )}

      {mode === "latitudes" && selectedLatitudes.length > 0 && (
        <div className="selection-info">
          <small>{selectedLatitudes.length} latitude(s) sélectionnée(s)</small>
        </div>
      )}

      {/* Affichage des groupes */}
      {mode === "areas" && groups.length > 0 && (
        <div className="groups-list">
          <div className="groups-title">Groupes:</div>
          {groups.map(group => (
            <div key={group.id} className="group-item" style={{ borderLeft: `3px solid ${group.color}` }}>
              <span>{group.name}</span>
              <small>({group.zoneIds.length} zones)</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

