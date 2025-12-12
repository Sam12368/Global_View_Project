// @ts-ignore: allow importing svg without type declarations
import logo from "../../assets/24390.svg";
import { useTheme } from "../../hooks/useTheme";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <img src={logo} alt="Logo" className="logo-circle" style={{ width: 50, height: 50 }} />
      <div className="app-title" style={{ fontWeight: "bold", fontSize: "1.7rem" }}>GLOBAL TEMPERATURE</div>
      <button 
        onClick={toggleTheme}
        className="theme-toggle-btn"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
