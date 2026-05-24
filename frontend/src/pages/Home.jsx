import { useState } from "react";
import Grid from "../components/Grid";
import Controls from "../components/Controls";
import CameraView from "../components/CameraView";
import Canvas from "../components/Canvas";
import { detectMaze, solveMaze, startRobot } from "../services/api";

/* ─── Inline styles & keyframes injected once ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0B1120;
    --card:     #1E293B;
    --card2:    #162032;
    --blue:     #3B82F6;
    --cyan:     #06B6D4;
    --green:    #22C55E;
    --red:      #EF4444;
    --white:    #F8FAFC;
    --gray:     #94A3B8;
    --glow-b:   0 0 24px #3B82F640;
    --glow-c:   0 0 24px #06B6D440;
    --glow-g:   0 0 20px #22C55E60;
  }

  body { background: var(--bg); color: var(--white); font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-border {
    0%,100% { box-shadow: 0 0 0 0 #3B82F640; }
    50%      { box-shadow: 0 0 0 8px #3B82F600; }
  }
  @keyframes scan {
    0%   { background-position: 0 0; }
    100% { background-position: 0 100px; }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes dash {
    to { stroke-dashoffset: 0; }
  }
  @keyframes blip {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.4; transform: scale(0.85); }
  }
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }

  .fade-up { animation: fadeUp 0.6s ease both; }
  .fade-up-1 { animation: fadeUp 0.6s 0.1s ease both; }
  .fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
  .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
  .fade-up-4 { animation: fadeUp 0.6s 0.4s ease both; }
  .fade-up-5 { animation: fadeUp 0.6s 0.5s ease both; }
  .fade-up-6 { animation: fadeUp 0.6s 0.6s ease both; }
  .fade-up-7 { animation: fadeUp 0.6s 0.7s ease both; }
  .fade-up-8 { animation: fadeUp 0.6s 0.8s ease both; }

  .card-hover {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px #06B6D420;
  }
`;

function injectCSS(css) {
  if (typeof document !== "undefined" && !document.getElementById("maze-global-css")) {
    const el = document.createElement("style");
    el.id = "maze-global-css";
    el.textContent = css;
    document.head.appendChild(el);
  }
}
injectCSS(GLOBAL_CSS);

/* ─── Sub-components ─── */

function HeroBadge({ label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#3B82F610", border: "1px solid #3B82F640",
      borderRadius: 999, padding: "4px 14px", fontSize: 12,
      color: "#3B82F6", fontFamily: "Orbitron", letterSpacing: 2,
      textTransform: "uppercase", marginBottom: 18,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", animation: "blip 1.4s infinite" }} />
      {label}
    </span>
  );
}

function SectionTitle({ title, accent }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 3, height: 28, background: `linear-gradient(to bottom, ${accent}, transparent)`, borderRadius: 2 }} />
        <h2 style={{ fontFamily: "Orbitron", fontSize: 22, fontWeight: 700, color: "#F8FAFC", letterSpacing: 1 }}>{title}</h2>
      </div>
      <div style={{ height: 1, background: `linear-gradient(to right, ${accent}60, transparent)`, marginLeft: 15 }} />
    </div>
  );
}

function ArchDiagram() {
  const steps = [
    { label: "Camera Input", icon: "📷", color: "#3B82F6" },
    { label: "OpenCV Processing", icon: "🔬", color: "#06B6D4" },
    { label: "Grid Generation", icon: "⊞", color: "#06B6D4" },
    { label: "A* Algorithm", icon: "✦", color: "#3B82F6" },
    { label: "Path Visualization", icon: "🗺", color: "#22C55E" },
    { label: "Command Generation", icon: "⚙", color: "#22C55E" },
    { label: "Flask API", icon: "🐍", color: "#06B6D4" },
    { label: "Bluetooth HC-05", icon: "📡", color: "#3B82F6" },
    { label: "Arduino Controller", icon: "🤖", color: "#06B6D4" },
    { label: "Robot Movement", icon: "🚗", color: "#22C55E" },
  ];

  return (
    <div style={{ position: "relative", padding: "24px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }} className={`fade-up-${Math.min(i, 8)}`}>
            <div className="card-hover" style={{
              background: "#1E293B",
              border: `1px solid ${s.color}40`,
              borderRadius: 10,
              padding: "10px 28px",
              minWidth: 220,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: `0 0 16px ${s.color}20`,
              cursor: "default",
            }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span style={{ fontFamily: "Orbitron", fontSize: 12, color: s.color, letterSpacing: 0.5 }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 2, height: 22, background: `linear-gradient(to bottom, ${s.color}80, ${steps[i + 1].color}80)` }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AStarFormula() {
  return (
    <div style={{ background: "#0B1120", border: "1px solid #3B82F630", borderRadius: 12, padding: "24px 28px", fontFamily: "monospace" }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: "#94A3B8", fontSize: 12, textTransform: "uppercase", letterSpacing: 2 }}>Cost Function</span>
      </div>
      {[
        { expr: "f(n) = g(n) + h(n)", color: "#F8FAFC", size: 20 },
        { expr: "g(n) = Actual cost from source", color: "#06B6D4", size: 13 },
        { expr: "h(n) = Estimated cost to destination", color: "#3B82F6", size: 13 },
        { expr: "f(n) = Total evaluation score", color: "#22C55E", size: 13 },
      ].map((r, i) => (
        <div key={i} style={{ padding: "6px 0", borderBottom: i < 3 ? "1px solid #1E293B" : "none" }}>
          <span style={{ color: r.color, fontSize: r.size, fontWeight: i === 0 ? 700 : 400 }}>{r.expr}</span>
        </div>
      ))}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #1E293B20" }}>
        <div style={{ color: "#94A3B8", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Manhattan Heuristic</div>
        <div style={{ fontSize: 18, color: "#06B6D4", fontWeight: 700 }}>h(n) = |x₁ − x₂| + |y₁ − y₂|</div>
      </div>
    </div>
  );
}

function CommandTable() {
  const rows = [
    { cmd: "F", action: "Forward", color: "#22C55E" },
    { cmd: "B", action: "Backward", color: "#EF4444" },
    { cmd: "L", action: "Left Turn", color: "#3B82F6" },
    { cmd: "R", action: "Right Turn", color: "#06B6D4" },
    { cmd: "S", action: "Stop", color: "#94A3B8" },
  ];
  return (
    <div style={{ overflow: "hidden", borderRadius: 12, border: "1px solid #1E293B" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#162032" }}>
            <th style={{ padding: "10px 18px", textAlign: "left", color: "#94A3B8", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Orbitron" }}>CMD</th>
            <th style={{ padding: "10px 18px", textAlign: "left", color: "#94A3B8", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Orbitron" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: "1px solid #1E293B", background: i % 2 ? "#0B1120" : "#111827" }}>
              <td style={{ padding: "10px 18px" }}>
                <span style={{
                  display: "inline-block", width: 32, height: 32, lineHeight: "32px", textAlign: "center",
                  background: `${r.color}18`, border: `1px solid ${r.color}50`,
                  borderRadius: 6, fontFamily: "Orbitron", fontWeight: 700, color: r.color, fontSize: 14,
                }}>{r.cmd}</span>
              </td>
              <td style={{ padding: "10px 18px", color: "#F8FAFC", fontSize: 14 }}>{r.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ value, label, color, delay }) {
  return (
    <div className={`card-hover fade-up-${delay}`} style={{
      background: "#1E293B",
      border: `1px solid ${color}30`,
      borderRadius: 14,
      padding: "22px 20px",
      textAlign: "center",
      flex: 1,
      minWidth: 120,
      animation: `countUp 0.5s ${delay * 0.1}s ease both`,
    }}>
      <div style={{ fontFamily: "Orbitron", fontSize: 28, fontWeight: 800, color, marginBottom: 6 }}>{value}</div>
      <div style={{ color: "#94A3B8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function TechBadge({ name, color }) {
  return (
    <span style={{
      background: `${color}14`, border: `1px solid ${color}40`,
      borderRadius: 8, padding: "6px 14px",
      color, fontSize: 13, fontWeight: 500,
      transition: "all 0.2s",
    }}>{name}</span>
  );
}

function FeatureCard({ icon, title, desc, color, delay }) {
  return (
    <div className={`card-hover fade-up-${delay}`} style={{
      background: "#1E293B",
      border: `1px solid ${color}25`,
      borderRadius: 14,
      padding: "22px 20px",
      flex: "1 1 220px",
    }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "Orbitron", fontSize: 13, fontWeight: 600, color, marginBottom: 8, letterSpacing: 0.3 }}>{title}</div>
      <div style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function AppCard({ title, items, color }) {
  return (
    <div className="card-hover" style={{
      background: "#1E293B",
      border: `1px solid ${color}25`,
      borderRadius: 14,
      padding: "20px",
      flex: "1 1 180px",
    }}>
      <div style={{ fontFamily: "Orbitron", fontSize: 12, color, marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>{title}</div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 13 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GridExample() {
  const grid = [[0,1,0,0],[0,0,0,1],[1,0,0,0],[0,0,1,0]];
  const path = [[0,0],[1,0],[1,1],[1,2],[2,2],[3,2]]; // fake path
  const pathSet = new Set(path.map(([r,c]) => `${r},${c}`));

  return (
    <div style={{ display: "inline-block", background: "#0B1120", borderRadius: 12, padding: 16, border: "1px solid #1E293B" }}>
      {grid.map((row, r) => (
        <div key={r} style={{ display: "flex" }}>
          {row.map((cell, c) => {
            const isPath = pathSet.has(`${r},${c}`);
            const isStart = r === 0 && c === 0;
            const isEnd = r === 3 && c === 2; // last path cell
            return (
              <div key={c} style={{
                width: 44, height: 44, margin: 3,
                borderRadius: 8,
                background: cell === 1 ? "#1E293B" : isStart ? "#22C55E30" : isEnd ? "#EF444430" : isPath ? "#3B82F620" : "#162032",
                border: `2px solid ${cell === 1 ? "#1E293B" : isStart ? "#22C55E" : isEnd ? "#EF4444" : isPath ? "#3B82F660" : "#1E293B40"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
                transition: "all 0.3s",
              }}>
                {cell === 1 ? <span style={{ fontSize: 18, opacity: 0.5 }}>█</span> :
                  isStart ? <span>🟢</span> : isEnd ? <span>🔴</span> : isPath ? <span style={{ color: "#3B82F6", fontSize: 10 }}>◆</span> : null}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ display: "flex", gap: 16, marginTop: 10, padding: "0 4px" }}>
        {[["#22C55E","Start"],["#EF4444","End"],["#3B82F6","Path"],["#1E293B","Wall"]].map(([c,l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94A3B8" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c, opacity: 0.8 }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function Home() {
  const [grid, setGrid] = useState([]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [path, setPath] = useState([]);
  const [commands, setCommands] = useState([]);

  const handleDetect = async () => {
    try {
      const res = await detectMaze();
      const detectedGrid = res.data.grid || res.data;
      if (!detectedGrid || detectedGrid.length === 0) { alert("❌ Maze not detected properly"); return; }
      setGrid(detectedGrid); setStart(null); setEnd(null); setPath([]); setCommands([]);
    } catch (err) { console.error("Detect error:", err); alert("❌ Backend error while detecting maze"); }
  };

  const handleSolve = async () => {
    if (!start || !end) { alert("⚠️ Select start and end points"); return; }
    if (grid.length === 0) { alert("⚠️ Detect maze first"); return; }
    try {
      const res = await solveMaze(grid, start, end);
      if (!res.data.path || res.data.path.length === 0) { alert("❌ No path found"); return; }
      const fixedPath = res.data.path.map(p => [p[0], p[1]]);
      setPath(fixedPath); setCommands(res.data.commands || []);
    } catch (err) { console.error("Solve error:", err); alert("❌ Error solving maze"); }
  };

  const handleStartRobot = async () => {
    if (!commands || commands.length === 0) { alert("⚠️ Solve path first"); return; }
    try { const res = await startRobot(commands); console.log("✅ Robot Started:", res.data); }
    catch (err) { console.error("❌ Robot Error:", err); }
  };

  const s = {
    page: {
      minHeight: "100vh",
      background: "var(--bg)",
      padding: 0,
    },
    topBar: {
      background: "#1E293B90",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #1E293B",
      padding: "12px 40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    logo: {
      fontFamily: "Orbitron",
      fontWeight: 900,
      fontSize: 18,
      background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: 2,
    },
    heroBg: {
      position: "relative",
      overflow: "hidden",
      padding: "80px 40px 64px",
      textAlign: "center",
      background: "radial-gradient(ellipse 80% 60% at 50% -10%, #3B82F615, transparent)",
    },
    heroGrid: {
      position: "absolute",
      inset: 0,
      backgroundImage: "linear-gradient(#1E293B40 1px, transparent 1px), linear-gradient(90deg, #1E293B40 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
    },
    heroTitle: {
      fontFamily: "Orbitron",
      fontSize: "clamp(28px, 5vw, 52px)",
      fontWeight: 900,
      lineHeight: 1.15,
      marginBottom: 18,
      background: "linear-gradient(135deg, #F8FAFC 30%, #06B6D4)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      position: "relative",
    },
    heroSub: {
      color: "#94A3B8",
      fontSize: "clamp(14px, 2vw, 17px)",
      maxWidth: 640,
      margin: "0 auto 40px",
      lineHeight: 1.7,
      position: "relative",
    },
    section: {
      padding: "60px 40px",
      maxWidth: 1100,
      margin: "0 auto",
    },
    divider: {
      height: 1,
      background: "linear-gradient(to right, transparent, #1E293B, transparent)",
      margin: "0 40px",
    },
    card: {
      background: "#1E293B",
      border: "1px solid #1E293B",
      borderRadius: 16,
      padding: "28px",
    },
    mazeBox: {
      background: "#1E293B",
      border: "1px solid #3B82F630",
      borderRadius: 18,
      padding: "28px",
      boxShadow: "0 0 40px #3B82F610",
    },
  };

  return (
    <div style={s.page}>

      {/* ── TOP BAR ── */}
      <div style={s.topBar}>
        <div style={s.logo}>MAZE·AI</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Computer Vision", "A* Pathfinding", "Arduino"].map(t => (
            <span key={t} style={{ background: "#0B1120", border: "1px solid #1E293B", borderRadius: 999, padding: "4px 12px", fontSize: 11, color: "#94A3B8", fontFamily: "Orbitron", letterSpacing: 1 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={s.heroBg}>
        <div style={s.heroGrid} />
        <div style={{ position: "relative" }}>
          <HeroBadge label="Autonomous Navigation System" />
          <h1 style={s.heroTitle} className="fade-up">
            Maze Solver Robot<br />Using AI & Computer Vision
          </h1>
          <p style={s.heroSub} className="fade-up-1">
            An intelligent autonomous system that captures a maze with a camera, computes the shortest path using the A* algorithm, and wirelessly controls a physical robot via Bluetooth — in real time.
          </p>
          {/* Stat pills */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }} className="fade-up-2">
            {[["A*","Algorithm"],["HC-05","Bluetooth"],["OpenCV","Vision"],["React","Frontend"]].map(([v,l]) => (
              <div key={l} style={{ background: "#1E293B", border: "1px solid #1E293B", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron", fontSize: 15, fontWeight: 700, color: "#06B6D4" }}>{v}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAZE CONTROLS ── */}
      <div style={{ padding: "0 40px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={s.mazeBox} className="fade-up-3">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 10px #22C55E", animation: "blip 1.4s infinite" }} />
            <span style={{ fontFamily: "Orbitron", fontSize: 14, letterSpacing: 2, color: "#22C55E", textTransform: "uppercase" }}>Live Control Panel</span>
          </div>

          <Controls onDetect={handleDetect} onSolve={handleSolve} onStart={handleStartRobot} />
          <CameraView />

          {grid.length > 0 ? (
            <div style={{ marginTop: 24 }}>
              <Grid grid={grid} path={path} setStart={setStart} setEnd={setEnd} start={start} end={end} />
            </div>
          ) : (
            <div style={{
              marginTop: 24, padding: "32px", textAlign: "center",
              background: "#0B1120", borderRadius: 12, border: "1px dashed #1E293B",
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔲</div>
              <p style={{ color: "#94A3B8", fontSize: 14 }}>Click <strong style={{ color: "#3B82F6" }}>Detect Maze</strong> to generate the grid from camera</p>
            </div>
          )}

          <Canvas path={path} />

          {commands.length > 0 && (
            <div style={{ marginTop: 20, padding: "16px 20px", background: "#0B1120", borderRadius: 12, border: "1px solid #22C55E30" }}>
              <div style={{ fontFamily: "Orbitron", fontSize: 11, color: "#22C55E", marginBottom: 10, letterSpacing: 2 }}>GENERATED COMMANDS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {commands.map((cmd, i) => (
                  <span key={i} style={{
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    background: cmd === "F" ? "#22C55E18" : cmd === "B" ? "#EF444418" : cmd === "L" ? "#3B82F618" : cmd === "R" ? "#06B6D418" : "#94A3B818",
                    border: `1px solid ${cmd === "F" ? "#22C55E" : cmd === "B" ? "#EF4444" : cmd === "L" ? "#3B82F6" : cmd === "R" ? "#06B6D4" : "#94A3B8"}50`,
                    borderRadius: 8,
                    fontFamily: "Orbitron", fontWeight: 700, fontSize: 13,
                    color: cmd === "F" ? "#22C55E" : cmd === "B" ? "#EF4444" : cmd === "L" ? "#3B82F6" : cmd === "R" ? "#06B6D4" : "#94A3B8",
                  }}>{cmd}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={s.divider} />

      {/* ── PROJECT OVERVIEW ── */}
      <div style={s.section}>
        <SectionTitle title="Project Overview" accent="#3B82F6" />
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <StatCard value="A*" label="Algorithm" color="#3B82F6" delay={1} />
          <StatCard value="CV" label="Computer Vision" color="#06B6D4" delay={2} />
          <StatCard value="BT" label="Bluetooth" color="#22C55E" delay={3} />
          <StatCard value="RT" label="Real-Time" color="#EF4444" delay={4} />
        </div>
        <div style={{ marginTop: 28, ...s.card }}>
          <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.85 }}>
            The Maze Solver Robot is an intelligent autonomous navigation system combining <span style={{ color: "#3B82F6" }}>Computer Vision</span>, <span style={{ color: "#06B6D4" }}>Artificial Intelligence</span>, <span style={{ color: "#22C55E" }}>Pathfinding Algorithms</span>, <span style={{ color: "#F8FAFC" }}>Web Technologies</span>, and <span style={{ color: "#EF4444" }}>Embedded Systems</span> to solve mazes automatically.
          </p>
          <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.85, marginTop: 14 }}>
            The system captures a maze image using a camera, converts it into a digital grid, computes the shortest path using the A* algorithm, visualizes the solution on the web interface, and sends movement commands wirelessly to a physical robot via Bluetooth.
          </p>
        </div>
      </div>

      <div style={s.divider} />

      {/* ── SYSTEM ARCHITECTURE ── */}
      <div style={s.section}>
        <SectionTitle title="System Architecture" accent="#06B6D4" />
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 280px" }}>
            <ArchDiagram />
          </div>
          <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { step: "01", title: "Capture & Process", desc: "Camera captures maze image. OpenCV converts it to grayscale, applies thresholding and contour detection to extract a binary grid.", color: "#3B82F6" },
              { step: "02", title: "AI Pathfinding", desc: "A* algorithm evaluates nodes using f(n) = g(n) + h(n) with Manhattan distance heuristic to find the optimal path.", color: "#06B6D4" },
              { step: "03", title: "Command Generation", desc: "Path coordinates are translated into directional commands (F/B/L/R) based on robot orientation and movement logic.", color: "#22C55E" },
              { step: "04", title: "Wireless Execution", desc: "Commands are sent via PySerial over Bluetooth HC-05 to the Arduino controller, driving motors through L298N.", color: "#EF4444" },
            ].map((item, i) => (
              <div key={i} className={`card-hover fade-up-${i + 1}`} style={{ ...s.card, border: `1px solid ${item.color}25`, display: "flex", gap: 16 }}>
                <div style={{ fontFamily: "Orbitron", fontSize: 24, fontWeight: 900, color: `${item.color}30`, flexShrink: 0, lineHeight: 1 }}>{item.step}</div>
                <div>
                  <div style={{ fontFamily: "Orbitron", fontSize: 13, color: item.color, marginBottom: 6, letterSpacing: 0.5 }}>{item.title}</div>
                  <div style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.divider} />

      {/* ── A* ALGORITHM ── */}
      <div style={s.section}>
        <SectionTitle title="A* Pathfinding Algorithm" accent="#3B82F6" />
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px" }}>
            <AStarFormula />
            <div style={{ marginTop: 20, ...s.card }}>
              <div style={{ fontFamily: "Orbitron", fontSize: 12, color: "#94A3B8", marginBottom: 14, letterSpacing: 2, textTransform: "uppercase" }}>Path → Commands</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[["(0,0)→(0,1)","RIGHT","F"],["(0,1)→(1,1)","DOWN","F"],["(1,1)→(2,1)","DOWN","F"]].map(([move, dir, cmd], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                    <span style={{ color: "#3B82F6", fontFamily: "monospace" }}>{move}</span>
                    <span style={{ color: "#94A3B8" }}>→</span>
                    <span style={{ color: "#06B6D4" }}>{dir}</span>
                    <span style={{ color: "#94A3B8" }}>→</span>
                    <span style={{ background: "#22C55E18", border: "1px solid #22C55E40", borderRadius: 4, padding: "1px 8px", color: "#22C55E", fontFamily: "Orbitron", fontWeight: 700, fontSize: 12 }}>{cmd}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ ...s.card, marginBottom: 20 }}>
              <div style={{ fontFamily: "Orbitron", fontSize: 12, color: "#94A3B8", marginBottom: 14, letterSpacing: 2, textTransform: "uppercase" }}>Grid Visualization</div>
              <GridExample />
            </div>
            <CommandTable />
          </div>
        </div>
      </div>

      <div style={s.divider} />

      {/* ── TECHNOLOGIES ── */}
      <div style={s.section}>
        <SectionTitle title="Technologies Used" accent="#06B6D4" />
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <AppCard title="Frontend" color="#3B82F6" items={["React.js","JavaScript","HTML5 / CSS3","Axios"]} />
          <AppCard title="Backend" color="#06B6D4" items={["Python","Flask","Flask-CORS","PySerial"]} />
          <AppCard title="Computer Vision" color="#22C55E" items={["OpenCV","NumPy","Grayscale / Threshold","Contour Detection"]} />
          <AppCard title="Hardware" color="#EF4444" items={["Arduino Uno","HC-05 Bluetooth","L298N Motor Driver","DC Geared Motors"]} />
        </div>
        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            ["React","#3B82F6"],["Python","#06B6D4"],["Flask","#06B6D4"],["OpenCV","#22C55E"],
            ["Arduino","#EF4444"],["A*","#3B82F6"],["Bluetooth","#94A3B8"],["NumPy","#06B6D4"],
          ].map(([n,c]) => <TechBadge key={n} name={n} color={c} />)}
        </div>
      </div>

      <div style={s.divider} />

      {/* ── FEATURES ── */}
      <div style={s.section}>
        <SectionTitle title="Key Features" accent="#22C55E" />
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <FeatureCard icon="📷" title="Intelligent Maze Detection" desc="Automatically converts camera image into a navigable binary grid using OpenCV processing pipeline." color="#3B82F6" delay={1} />
          <FeatureCard icon="✦" title="AI-Based Path Planning" desc="Uses A* algorithm with Manhattan heuristic for optimal and efficient path calculation." color="#06B6D4" delay={2} />
          <FeatureCard icon="🗺" title="Real-Time Visualization" desc="Displays shortest path on the web interface before physical execution begins." color="#22C55E" delay={3} />
          <FeatureCard icon="📡" title="Wireless Control" desc="Commands transmitted over Bluetooth HC-05 to Arduino without any physical cables." color="#EF4444" delay={4} />
          <FeatureCard icon="⚙" title="Dynamic Maze Support" desc="Works with any maze layout without reprogramming — fully data-driven system." color="#06B6D4" delay={5} />
          <FeatureCard icon="🤖" title="Autonomous Navigation" desc="Robot follows generated instructions without manual intervention from start to destination." color="#3B82F6" delay={6} />
        </div>
      </div>

      <div style={s.divider} />

      {/* ── CHALLENGES & SOLUTIONS ── */}
      <div style={s.section}>
        <SectionTitle title="Challenges & Solutions" accent="#EF4444" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {[
            { challenge: "Motor Calibration", solution: "Motor timing calibration with dynamic command adjustment to prevent drift.", color: "#EF4444" },
            { challenge: "Bluetooth Stability", solution: "Connection stabilization via retry logic and stable serial communication protocols.", color: "#3B82F6" },
            { challenge: "Image Accuracy", solution: "Improved lighting handling through adaptive thresholding techniques in OpenCV.", color: "#06B6D4" },
            { challenge: "Robot Alignment", solution: "Precise turns achieved via multiple calibration iterations and orientation tracking.", color: "#22C55E" },
            { challenge: "Real-Time Sync", solution: "Backend API error handling ensures synchronization between path generation and execution.", color: "#EF4444" },
          ].map((item, i) => (
            <div key={i} className={`card-hover fade-up-${Math.min(i + 1, 8)}`} style={{ ...s.card, border: `1px solid ${item.color}25` }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, padding: "3px 10px", background: `${item.color}15`, border: `1px solid ${item.color}40`, borderRadius: 999, color: item.color, fontFamily: "Orbitron", letterSpacing: 1 }}>CHALLENGE</span>
              </div>
              <div style={{ fontWeight: 600, color: "#F8FAFC", marginBottom: 8, fontSize: 15 }}>{item.challenge}</div>
              <div style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.7 }}>✓ {item.solution}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.divider} />

      {/* ── APPLICATIONS ── */}
      <div style={s.section}>
        <SectionTitle title="Applications" accent="#3B82F6" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {[
            ["🏭","Warehouse Automation","#3B82F6"],
            ["🔧","Industrial Robotics","#06B6D4"],
            ["🚨","Search & Rescue","#EF4444"],
            ["📦","Autonomous Delivery","#22C55E"],
            ["📚","Educational Robotics","#3B82F6"],
            ["🔬","Research Platforms","#06B6D4"],
            ["🚚","Smart Logistics","#22C55E"],
          ].map(([icon, label, color], i) => (
            <div key={i} className="card-hover" style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#1E293B", border: `1px solid ${color}25`,
              borderRadius: 12, padding: "12px 18px", flex: "1 1 180px",
            }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ color: "#F8FAFC", fontSize: 13, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.divider} />

      {/* ── FUTURE ENHANCEMENTS ── */}
      <div style={s.section}>
        <SectionTitle title="Future Enhancements" accent="#06B6D4" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {[
            ["📍","Live Robot Tracking"],["🧠","ML Path Optimization"],["🗺","SLAM Integration"],
            ["☁","IoT Cloud Support"],["📱","Mobile App"],["🤖","Multi-Robot Coordination"],
            ["🎙","Voice Navigation"],["🚧","Dynamic Obstacle Avoidance"],
          ].map(([icon, label], i) => (
            <div key={i} className="card-hover" style={{
              background: "#1E293B", border: "1px solid #1E293B",
              borderRadius: 12, padding: "16px 18px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ color: "#94A3B8", fontSize: 13 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #1E293B", padding: "28px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "gap" }}>
        <div style={{ fontFamily: "Orbitron", fontWeight: 800, fontSize: 14, background: "linear-gradient(90deg,#3B82F6,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MAZE·AI</div>
        <div style={{ color: "#94A3B8", fontSize: 12 }}>Autonomous Navigation · Computer Vision · A* Pathfinding · Embedded Systems</div>
      </div>

    </div>
  );
}
