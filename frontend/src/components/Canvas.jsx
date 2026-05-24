import { useEffect, useRef } from "react";

function Canvas({ path }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!path) return;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;

    path.forEach(([x, y], i) => {
      if (i === 0) return;

      ctx.beginPath();
      ctx.moveTo(path[i - 1][1] * 50 + 25, path[i - 1][0] * 50 + 25);
      ctx.lineTo(y * 50 + 25, x * 50 + 25);
      ctx.stroke();
    });
  }, [path]);

  return <canvas ref={canvasRef} width={300} height={300} />;
}

export default Canvas;