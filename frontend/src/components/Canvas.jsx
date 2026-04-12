import React, { useEffect, useRef } from "react";

const Canvas = ({ path, start, end }) => {
  const canvasRef = useRef(null);

  const rows = 4;
  const cols = 6;
  const cellSize = 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#ccc";
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(cols * cellSize, i * cellSize);
      ctx.stroke();
    }

    for (let j = 0; j <= cols; j++) {
      ctx.beginPath();
      ctx.moveTo(j * cellSize, 0);
      ctx.lineTo(j * cellSize, rows * cellSize);
      ctx.stroke();
    }

    // Draw start
    ctx.fillStyle = "green";
    ctx.fillRect(start[1] * cellSize, start[0] * cellSize, cellSize, cellSize);

    // Draw end
    ctx.fillStyle = "red";
    ctx.fillRect(end[1] * cellSize, end[0] * cellSize, cellSize, cellSize);

    // Draw path (line)
    if (path.length > 0) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 4;
      ctx.beginPath();

      for (let i = 0; i < path.length; i++) {
        const [r, c] = path[i];

        const x = c * cellSize + cellSize / 2;
        const y = r * cellSize + cellSize / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }
  }, [path, start, end]);

  return (
    <canvas
      ref={canvasRef}
      width={cols * cellSize}
      height={rows * cellSize}
      style={{
        border: "2px solid black",
        marginTop: "20px",
      }}
    />
  );
};

export default Canvas;
