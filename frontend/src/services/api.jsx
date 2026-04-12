import axios from "axios";

const API = "http://127.0.0.1:5000";

export const detectMaze = () => axios.get(`${API}/detect`);
export const solveMaze = (start, end) =>
  axios.post(`${API}/solve`, { start, end });
export const startRobot = () => axios.get(`${API}/start`);
