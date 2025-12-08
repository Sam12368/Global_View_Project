// src/components/SidePanel/SelectionMode.tsx
// --------------------------------------
// 🎛️ SelectionMode.tsx
// --------------------------------------
import "./SelectionMode.css";
import { useSelections } from "../../hooks/useSelection";
import { useData } from "../../hooks/useData";
import { useState } from "react";

export default function SelectionMode() {
  const {
    mode,
    setMode,
    selectedLatitudes,
    clearLatitudes,
    areas,
    clearAreas,
    removeLatitude,
    removeArea,
    groups,
    createGroupFromAreas,
    removeGroup,
    clearGroups,
  } = useSelections();

  const { tempData } = useData();

  // quelles zones sont cochées pour former un groupe
  const [selectedAreaIdsForGroup, setSelectedAreaIdsForGroup] = useState<
    number[]
  >([]);

  function toggleAreaInGroup(areaId: number) {
    setSelectedAreaIdsForGroup((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  }

  function handleCreateGroup() {
    if (selectedAreaIdsForGroup.length === 0) return;

    createGroupFromAreas(selectedAreaIdsForGroup);

    // reset sélection de checkboxes
    setSelectedAreaIdsForGroup([]);
  }

  return (
    <div className="selection-block">
      <div className="sidebar-title">Selection</div>

      {/* Switch mode areas / latitudes */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === "areas" ? "active" : ""}`}
          onClick={() => setMode("areas")}
        >
          Areas
        </button>
        <button
          className={`mode-btn ${mode === "latitudes" ? "active" : ""}`}
          onClick={() => setMode("latitudes")}
        >
          Latitudes
        </button>
      </div>

      {/* ---------- LATITUDES ---------- */}
      {mode === "latitudes" && (
        <div className="selection-section">
          <div className="section-label">Selected latitudes</div>
          {selectedLatitudes.length === 0 ? (
            <div className="empty">
              Click on the map horizontally to add a latitude.
            </div>
          ) : (
            <ul className="selection-list">
              <li className="selection-item">
                <span className="pill">
                  Latitudes: {selectedLatitudes.length}
                </span>
                <button className="remove-chip" onClick={clearLatitudes}>
                  Clear all ×
                </button>
              </li>

              {selectedLatitudes
                .slice()
                .sort((a, b) => a - b)
                .map((lat) => (
                  <li key={lat} className="selection-item">
                    <span className="pill">{lat}°</span>
                    <button
                      className="remove-chip"
                      onClick={() => removeLatitude(lat)}
                    >
                      ×
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {/* ---------- ZONES (AREAS) ---------- */}
      {mode === "areas" && (
        <>
          <div className="selection-section">
            <div className="section-label">Zones</div>
            {areas.length === 0 ? (
              <div className="empty">
                Click and drag on the map to draw a rectangular zone.
              </div>
            ) : (
              <ul className="selection-list">
                <li className="selection-item">
                  <span className="pill">Zones: {areas.length}</span>
                  <button className="remove-chip" onClick={clearAreas}>
                    Clear all ×
                  </button>
                </li>

                {areas
                  .slice()
                  .sort((a, b) => a.id - b.id)
                  .map((area, index) => {
                    const label = `Zone ${index + 1}`;

                    const cells = area.cellIds
                      .map((id) => tempData.tempanomalies[id])
                      .filter(Boolean);

                    if (cells.length === 0) return null;

                    const lats = cells.map((c) => c.lat);
                    const lons = cells.map((c) => c.lon);

                    const latMin = Math.min(...lats);
                    const latMax = Math.max(...lats);
                    const lonMin = Math.min(...lons);
                    const lonMax = Math.max(...lons);

                    const checked = selectedAreaIdsForGroup.includes(area.id);

                    return (
                      <li
                        key={area.id}
                        className="selection-item selection-item-zone"
                      >
                        <label className="zone-row">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAreaInGroup(area.id)}
                          />
                          <div className="zone-info">
                            <span className="zone-name">{label}</span>
                            <span className="zone-sub">
                              lat {latMin}° → {latMax}°
                            </span>
                            <span className="zone-sub">
                              lon {lonMin}° → {lonMax}°
                            </span>
                          </div>
                        </label>

                        <button
                          className="remove-chip zone-remove"
                          onClick={() => removeArea(area.id)}
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          {/* ---------- GROUPES DE ZONES ---------- */}
          <div className="selection-section">
            <div className="section-label">Groups of areas</div>

            <div className="group-actions">
              <button
                className="group-btn"
                disabled={selectedAreaIdsForGroup.length === 0}
                onClick={handleCreateGroup}
              >
                Create group from selected zones
              </button>
              {groups.length > 0 && (
                <button className="group-btn ghost" onClick={clearGroups}>
                  Clear all groups
                </button>
              )}
            </div>

            {groups.length === 0 ? (
              <div className="empty">
                Select some zones above (checkboxes) and click
                <br />
                <strong>"Create group from selected zones"</strong>.
              </div>
            ) : (
              <ul className="selection-list">
                {groups
                  .slice()
                  .sort((a, b) => a.id - b.id)
                  .map((group, index) => (
                    <li
                      key={group.id}
                      className="selection-item selection-item-group"
                    >
                      <div className="group-info">
                        <span className="pill">
                          Group {index + 1}
                        </span>
                        <span className="group-sub">
                          {group.areaIds.length} zone(s)
                        </span>
                      </div>
                      <button
                        className="remove-chip group-remove"
                        onClick={() => removeGroup(group.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
