import "./AppLayout.css";
import Header from "./Header";
import SidePanel from "../SidePanel/SidePanel";
import WorldMap from "../WorldMap/WorldMap";
import AnimationBar from "../AnimationBar/AnimationBar";
import ViewsGrid from "../ViewsGrid/ViewsGrid";
import { useTheme } from "../../hooks/useTheme";
import { useEffect } from "react";

export const AppLayout = () => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      <Header />

      {/* 2 colonnes : 1 = SidePanel, 2 = main-panel */}
      <div className="app-layout">
        {/* COLONNE GAUCHE */}
        <SidePanel />

        {/* COLONNE DROITE */}
        <main className="main-panel">
          <WorldMap />
          <AnimationBar />
          <ViewsGrid />
        </main>
      </div>
    </div>
  );
};
