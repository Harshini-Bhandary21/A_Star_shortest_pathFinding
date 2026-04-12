import { useState } from "react";
import Grid from "../components/Grid";
import Controls from "../components/Controls";
import Canvas from "../components/Canvas";
import { detectMaze, solveMaze, startRobot } from "../services/api";

export default function Home() {
  const [path, setPath] = useState([]);
  const [start, setStart] = useState([0, 0]);
  const [end, setEnd] = useState([3, 5]);

  return (
    <div>
      <h1>Maze Solver</h1>

      <Controls
        detect={detectMaze}
        solve={async () => {
          const res = await solveMaze(start, end);
          setPath(res.data.path);
        }}
        start={startRobot}
      />

      <Grid
        path={path}
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
      />
      <Canvas path={path} start={start} end={end} />
    </div>
  );
}
