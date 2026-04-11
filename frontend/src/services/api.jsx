import axios from "axios";

export const getSolution = async () => {
  const res = await axios.get("http://127.0.0.1:5000/solve");
  return res.data;
};
