import "./SidePanel.css";
import SelectionMode from "./SelectionMode";
import ViewSelector from "./ViewSelector";

export default function SidePanel() {
  return (
    <aside className="sidebar">
      <div className="sidebar-T">Control Panel</div>
      <SelectionMode />
      <ViewSelector />
    </aside>
  );
}
