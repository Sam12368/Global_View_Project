import "./SelectionMode.css";

export default function SelectionMode() {
  return (
    <div className="sidebar-block">
      <div className="sidebar-title">Selection Mode</div>
      <div className="toggle-row">
        <div className="toggle-label">Area</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div className="fake-toggle" />
          <button className="small-plus-btn">+</button>
        </div>
      </div>
      <div className="toggle-row">
        <div className="toggle-label">Latitudes</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div className="fake-toggle" />
          <button className="small-plus-btn">+</button>
        </div>
      </div>
    </div>
  );
}

