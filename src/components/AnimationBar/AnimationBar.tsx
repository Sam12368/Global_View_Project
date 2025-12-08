  import { useEffect, useState } from "react";
  import "./AnimationBar.css";
  import { useAnimation } from "../../hooks/useAnimation";
  import { useYear } from "../../hooks/useYear";

  export default function AnimationBar() {
    const { currentYear, setYear, next } = useYear();
    const { playing, play, pause, speed, setSpeed } = useAnimation();
    const min = 1880;
    const max = 2025;
    const [inputYear, setInputYear] = useState(currentYear);

    useEffect(() => {
      setInputYear(currentYear);
    }, [currentYear]);

    useEffect(() => {
      if (!playing) return;
      const baseDelay = 600;
      const delay = baseDelay / speed;
      const id = setInterval(() => {
        next();
      }, delay);
      return () => clearInterval(id);
    }, [playing, speed, next]);

    useEffect(() => {
      if (currentYear >= max && playing) {
        pause();
      }
    }, [currentYear, max, playing, pause]);

    return (
      <section className="animation-shell">
        <div className="animation-bar-slider-row">
          <input
            type="range"
            min={min}
            max={max}
            value={currentYear}
            onChange={(e) => setYear(Number(e.target.value))}
            className="anim-slider-input"
          />
        </div>
        <div className="animation-bar-controls-row">
          <div className="animation-bar-controls-left">
            <button className="anim-btn" type="button" onClick={() => (playing ? pause() : play())}>
              {playing ? "⏸" : "▶"}
            </button>
            <button className="anim-btn" type="button" onClick={() => setYear(min)}>
              ⟲
            </button>
            <span className="animation-bar-speed">
              speed :
              <button className="anim-btn" type="button" onClick={() => setSpeed(speed >= 3 ? 1 : speed + 0.5)}>
                {speed}x
              </button>
            </span>
          </div>
          <div className="animation-bar-controls-center">
            <label htmlFor="year-input" style={{ marginRight: 8 }}>Year</label>
            <input
              id="year-input"
              type="number"
              min={min}
              max={max}
              value={inputYear}
              onChange={e => setInputYear(Number(e.target.value))}
              onBlur={() => setYear(Number(inputYear))}
              style={{ width: 80, fontSize: "1rem", borderRadius: 6, border: "1px solid #bbb", padding: "4px 8px" }}
            />
          </div>
        </div>
      </section>
    );
  };



