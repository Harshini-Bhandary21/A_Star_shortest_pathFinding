import axios from "axios";

const BASE = "http://127.0.0.1:5000";

// 🔹 Detect Maze
export const detectMaze = () =>
  axios.get(`${BASE}/detect`);


// 🔹 Solve Maze
export const solveMaze = (grid, start, end) =>
  axios.post(`${BASE}/solve`, {
    grid,
    start,
    end
  });


// 🔹 Start Robot
export const startRobot = (commands) =>
  axios.post(`${BASE}/start`, {
    commands
  });