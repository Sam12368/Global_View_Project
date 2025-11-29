import logo from "../../assets/24390.svg.svg";

export default function Header() {
  return (
    <header className="app-header">
      <img src={logo} alt="Logo" className="logo-circle" style={{ width: 50, height: 50 }} />
      <div className="app-title" style={{ fontWeight: "bold", fontSize: "1.7rem" }}>GLOBAL TEMPERATURE</div>
    </header>
  );
}
