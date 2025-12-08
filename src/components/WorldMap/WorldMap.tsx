// src/components/WorldMap/WorldMap.tsx
// -----------------------------------------------
// 🌍 WorldMap.tsx — heatmap + sélection lat/zones + hover info
// -----------------------------------------------
import type React from "react";
import {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useYear } from "../../hooks/useYear";
import { useData, interpolateSmooth } from "../../hooks/useData";
import { useSelections } from "../../hooks/useSelection";
import earth from "../../assets/earth.png";

// Dimensions logiques du canvas (pas le CSS)
const WIDTH = 1500;
const HEIGHT = 700;

// Grille low-res (pour la heatmap interpolée)
const GRID_W = 90; // 360 / 4
const GRID_H = 45; // 180 / 4

// Type pour le tooltip de hover
interface HoverTooltip {
  x: number;        // position en px dans le container
  y: number;
  label: string;    // ex: "Zone 1"
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
  anomaly: number | null; // anomalie moyenne, ou null si pas de data
}

export default function WorldMap() {
  // Canvas principal (carte + heatmap)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Canvas transparent au-dessus (lignes / rectangles de sélection)
  const overlayRef = useRef<HTMLCanvasElement>(null);
  // Heatmap basse résolution
  const heatmapRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));

  const { currentYear } = useYear();
  const { tempData } = useData();
  const {
    mode,                // "areas" | "latitudes"
    selectedLatitudes,
    areas,               // liste des zones (Zone 1, Zone 2, ...)
    createAreaFromCells, // appelé quand on termine un drag
    addLatitude,
  } = useSelections();

  // 🟢 état local pour le drag de rectangle (mode "areas")
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(
    null
  );

  // 🟡 état local pour le hover d'une zone
  const [hoverAreaId, setHoverAreaId] = useState<number | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip | null>(null);

  // ------------------------------------------------
  // 1) GLOBAL MIN/MAX calculés une fois (palette)
  // ------------------------------------------------
  const { GLOBAL_MIN, GLOBAL_MAX } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const cell of tempData.tempanomalies) {
      for (const d of cell.data) {
        if (d.value === "NA") continue;
        const v = d.value as number;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }

    if (!isFinite(min) || !isFinite(max)) {
      return { GLOBAL_MIN: -3, GLOBAL_MAX: 4 };
    }

    // léger shift possible si tu veux
    return { GLOBAL_MIN: min, GLOBAL_MAX: max };
  }, [tempData]);

  // ------------------------------------------------
  // 2) PALETTE DYNAMIQUE BASÉE SUR min/max
  // ------------------------------------------------
  const PALETTE = useMemo(
    () => [
      { t: GLOBAL_MIN,                                   c: [0, 0, 130] },
      { t: GLOBAL_MIN + (GLOBAL_MAX - GLOBAL_MIN) * 0.25, c: [0, 120, 255] },
      { t: GLOBAL_MIN + (GLOBAL_MAX - GLOBAL_MIN) * 0.50, c: [255, 255, 255] },
      { t: GLOBAL_MIN + (GLOBAL_MAX - GLOBAL_MIN) * 0.75, c: [255, 180, 0] },
      { t: GLOBAL_MAX,                                   c: [200, 0, 0] },
    ],
    [GLOBAL_MIN, GLOBAL_MAX]
  );

  // ------------------------------------------------
  // 3) Couleur interpolée pour une valeur
  // ------------------------------------------------
  function colorForValue(value: number | null): [number, number, number, number] {
    if (value === null) return [0, 0, 0, 0];

    const t = Math.max(GLOBAL_MIN, Math.min(GLOBAL_MAX, value));

    for (let i = 0; i < PALETTE.length - 1; i++) {
      const p1 = PALETTE[i];
      const p2 = PALETTE[i + 1];

      if (t >= p1.t && t <= p2.t) {
        const f = (t - p1.t) / (p2.t - p1.t);

        const r = p1.c[0] + f * (p2.c[0] - p1.c[0]);
        const g = p1.c[1] + f * (p2.c[1] - p1.c[1]);
        const b = p1.c[2] + f * (p2.c[2] - p1.c[2]);

        return [r | 0, g | 0, b | 0, 200];
      }
    }

    return [0, 0, 0, 0];
  }

  // ------------------------------------------------
  // 4) LOW RES HEATMAP AVEC INTERPOLATION
  // ------------------------------------------------
  function drawLowRes() {
    const heat = heatmapRef.current;
    heat.width = GRID_W;
    heat.height = GRID_H;

    const ctx = heat.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = ctx.getImageData(0, 0, GRID_W, GRID_H);
    const buf = img.data;

    tempData.tempanomalies.forEach((cell) => {
      const gx = Math.floor((cell.lon + 180) / 4);
      const gy = Math.floor((90 - cell.lat) / 4);

      const snapX = Math.min(Math.max(gx, 0), GRID_W - 1);
      const snapY = Math.min(Math.max(gy, 0), GRID_H - 1);

      const interpolated = interpolateSmooth(cell.data, currentYear);

      const [r, g, b, a] = colorForValue(interpolated);
      const idx = (snapY * GRID_W + snapX) * 4;

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    });

    ctx.putImageData(img, 0, 0);
  }

  // ------------------------------------------------
  // 5) Calcul des métriques (bbox + anomalie moyenne) pour une zone
  // ------------------------------------------------
  function computeAreaMetrics(areaId: number) {
    const area = areas.find((a) => a.id === areaId);
    if (!area) return null;

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

    // anomalie moyenne sur cette zone (année courante)
    const anomalies: number[] = [];
    cells.forEach((cell) => {
      const v = interpolateSmooth(cell.data, currentYear);
      if (v !== null) {
        anomalies.push(v as number);
      }
    });

    const anomaly =
      anomalies.length > 0
        ? anomalies.reduce((acc, v) => acc + v, 0) / anomalies.length
        : null;

    return { area, latMin, latMax, lonMin, lonMax, anomaly };
  }

  // ------------------------------------------------
  // 6) DESSIN DE L'OVERLAY (lignes + ZONES)
  // ------------------------------------------------
  const drawOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // ----- mode latitudes : lignes pointillées -----
    if (mode === "latitudes") {
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "rgba(239,68,68,0.9)";
      ctx.lineWidth = 2;

      selectedLatitudes.forEach((lat) => {
        const y = ((90 - lat) / 180) * HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      });
      ctx.restore();

      // petites annotations de latitude tous les 30°
      ctx.fillStyle = "white";
      ctx.font = "12px system-ui, sans-serif";
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = ((90 - lat) / 180) * HEIGHT;
        ctx.fillText(`${lat}°`, 8, y - 4);
      }
    }

    // ----- mode areas : ZONES (rectangles remplis) ----- 
    if (mode === "areas") {
      const cellW = (4 / 360) * WIDTH;
      const cellH = (4 / 180) * HEIGHT;

      areas.forEach((area) => {
        const cells = area.cellIds
          .map((id) => tempData.tempanomalies[id])
          .filter(Boolean);
        if (cells.length === 0) return;

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        cells.forEach((cell) => {
          const x = ((cell.lon + 180) / 360) * WIDTH - cellW / 2;
          const y = ((90 - cell.lat) / 180) * HEIGHT - cellH / 2;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        });

        const w = maxX - minX + cellW;
        const h = maxY - minY + cellH;

        const isHover = hoverAreaId === area.id;

        ctx.save();
        ctx.lineWidth = isHover ? 3 : 2;
        ctx.strokeStyle = isHover
          ? "rgba(251,191,36,0.95)" // jaune doré NASA style
          : "rgba(56,189,248,0.95)";
        ctx.fillStyle = isHover
          ? "rgba(251,191,36,0.25)"
          : "rgba(255, 26, 1, 0.18)";
        ctx.beginPath();
        ctx.rect(minX, minY, w, h);
        ctx.fill();
        ctx.stroke();

        // label "Zone N"
        ctx.fillStyle = "#ffffff";
        ctx.font = "13px system-ui, sans-serif";
        ctx.fillText(area.name, minX + 6, minY + 16);
        ctx.restore();
      });

      // rectangle en cours de dessin (drag)
      if (dragStart && dragCurrent) {
        const x1 = dragStart.x;
        const y1 = dragStart.y;
        const x2 = dragCurrent.x;
        const y2 = dragCurrent.y;

        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);

        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, w, h);
        ctx.restore();
      }
    }
  }, [mode, selectedLatitudes, areas, dragStart, dragCurrent, hoverAreaId, tempData]);

  // ------------------------------------------------
  // 7) DESSIN PRINCIPAL (carte + heatmap)
  // ------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = earth;

    img.onload = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

      drawLowRes();

      // 🔥 STYLE NASA (blur léger sur la heatmap)
      ctx.filter = "blur(1px)";
      ctx.drawImage(heatmapRef.current, 0, 0, WIDTH, HEIGHT);
      ctx.filter = "none";

      // on redessine les overlays par-dessus
      drawOverlay();
    };
  }, [currentYear, tempData, GLOBAL_MIN, GLOBAL_MAX, drawOverlay]);

  // Quand la sélection change (zones / latitudes / hover), on rafraîchit l'overlay
  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // ------------------------------------------------
  // 8) UTILS : coord souris en coordonnées CANVAS
  // ------------------------------------------------
  function getMousePos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  }

  // ------------------------------------------------
  // 9) INTERACTIONS : mode LATITUDES
  // ------------------------------------------------
  function handleClickLat(e: React.MouseEvent<HTMLCanvasElement>) {
    if (mode !== "latitudes") return;
    const { y } = getMousePos(e);

    const lat = 90 - (y / HEIGHT) * 180;
    // on colle aux pas de 4° et on limite [-88, 88]
    const snapped = Math.round(lat / 4) * 4;
    const clamped = Math.max(-88, Math.min(88, snapped));

    addLatitude(clamped);
  }

  // ------------------------------------------------
  // 10) INTERACTIONS : mode AREAS (drag + hover)
  // ------------------------------------------------

  // MouseDown : début du drag
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (mode !== "areas") return;
    const pos = getMousePos(e);
    setDragStart(pos);
    setDragCurrent(pos);
    setHoverAreaId(null);
    setHoverTooltip(null);
  }

  // MouseMove : soit on dessine, soit on survole
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (mode !== "areas") return;

    const posCanvas = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const xClient = e.clientX - rect.left;
    const yClient = e.clientY - rect.top;

    // Si on est en train de drag → on met à jour le rectangle
    if (dragStart) {
      setDragCurrent(posCanvas);
      setHoverAreaId(null);
      setHoverTooltip(null);
      return;
    }

    // Sinon, on est en hover → on teste les zones
    const hit = hitTestArea(posCanvas.x, posCanvas.y);
    if (!hit) {
      setHoverAreaId(null);
      setHoverTooltip(null);
      return;
    }

    const metrics = computeAreaMetrics(hit.id);
    if (!metrics) {
      setHoverAreaId(null);
      setHoverTooltip(null);
      return;
    }

    setHoverAreaId(hit.id);
    setHoverTooltip({
      x: xClient,
      y: yClient,
      label: metrics.area.name,
      latMin: metrics.latMin,
      latMax: metrics.latMax,
      lonMin: metrics.lonMin,
      lonMax: metrics.lonMax,
      anomaly: metrics.anomaly,
    });
  }

  // hit-test d'une zone à partir d'une position canvas
  function hitTestArea(x: number, y: number): { id: number } | null {
    const cellW = (4 / 360) * WIDTH;
    const cellH = (4 / 180) * HEIGHT;

    for (const area of areas) {
      const cells = area.cellIds
        .map((id) => tempData.tempanomalies[id])
        .filter(Boolean);
      if (cells.length === 0) continue;

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      cells.forEach((cell) => {
        const cx = ((cell.lon + 180) / 360) * WIDTH - cellW / 2;
        const cy = ((90 - cell.lat) / 180) * HEIGHT - cellH / 2;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
      });

      const w = maxX - minX + cellW;
      const h = maxY - minY + cellH;

      if (x >= minX && x <= minX + w && y >= minY && y <= minY + h) {
        return { id: area.id };
      }
    }

    return null;
  }

  // MouseUp : fin du drag → création d'une nouvelle zone
  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (mode !== "areas") return;
    if (!dragStart) return;

    const end = getMousePos(e);

    const x1 = dragStart.x;
    const y1 = dragStart.y;
    const x2 = end.x;
    const y2 = end.y;

    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);

    // Conversion en lat / lon
    const lonMin = (left / WIDTH) * 360 - 180;
    const lonMax = (right / WIDTH) * 360 - 180;

    const latMax = 90 - (top / HEIGHT) * 180;
    const latMin = 90 - (bottom / HEIGHT) * 180;

    // On récupère tous les indices de cellules touchées
    const zoneCellIds: number[] = [];
    tempData.tempanomalies.forEach((cell, idx) => {
      if (
        cell.lat <= latMax &&
        cell.lat >= latMin &&
        cell.lon >= lonMin &&
        cell.lon <= lonMax
      ) {
        zoneCellIds.push(idx);
      }
    });

    if (zoneCellIds.length > 0) {
      // 1 drag = 1 Zone N
      createAreaFromCells(zoneCellIds);
    }

    setDragStart(null);
    setDragCurrent(null);
  }

  function handleMouseLeave() {
    if (dragStart) {
      setDragStart(null);
      setDragCurrent(null);
    }
    setHoverAreaId(null);
    setHoverTooltip(null);
  }

  // ------------------------------------------------
  // 11) JSX (carte + overlay + tooltip NASA-style)
  // ------------------------------------------------
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: WIDTH,
        margin: "0 auto",
      }}
    >
      {/* Canvas principal */}
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          borderRadius: "16px",
          overflow: "hidden",
        }}
        onClick={handleClickLat}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* Overlay transparent pour la sélection / zones */}
      <canvas
        ref={overlayRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Tooltip NASA-style pour les zones */}
      {hoverTooltip && (
        <div
          className="worldmap-tooltip"
          style={{
            position: "absolute",
            left: hoverTooltip.x + 12,
            top: hoverTooltip.y - 12,
          }}
        >
          <div className="worldmap-tooltip-title">{hoverTooltip.label}</div>
          <div className="worldmap-tooltip-line">
            Lat: {hoverTooltip.latMin.toFixed(0)}° →{" "}
            {hoverTooltip.latMax.toFixed(0)}°
          </div>
          <div className="worldmap-tooltip-line">
            Lon: {hoverTooltip.lonMin.toFixed(0)}° →{" "}
            {hoverTooltip.lonMax.toFixed(0)}°
          </div>
          <div className="worldmap-tooltip-line">
            Anomaly:{" "}
            {hoverTooltip.anomaly !== null
              ? `${hoverTooltip.anomaly.toFixed(2)} °C`
              : "no data"}
          </div>
        </div>
      )}
    </div>
  );
}
