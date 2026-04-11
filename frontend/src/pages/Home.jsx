import { useState } from "react";
import { getSolution } from "../services/api";
import Grid from "../components/Grid";
import Controls from "../components/Controls";

export default function Home() {
  const [grid, setGrid] = useState([]);
  const [path, setPath] = useState([]);

  const handleSolve = async () => {
    const data = await getSolution();
    setGrid(data.grid);
    setPath(data.path);
  };

  return (
    <div className="container">
      <h1>Maze Solver 🚀</h1>

      <Controls onSolve={handleSolve} />

      {grid.length > 0 && <Grid grid={grid} path={path} />}
    </div>
  );
}
