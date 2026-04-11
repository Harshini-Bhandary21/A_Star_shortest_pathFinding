export default function Grid({ grid, path }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, 60px)`,
      }}
    >
      {grid.map((row, i) =>
        row.map((cell, j) => {
          const isPath = path.some((p) => p[0] === i && p[1] === j);

          return (
            <div
              key={`${i}-${j}`}
              className="cell"
              style={{
                backgroundColor:
                  cell === 1 ? "black" : isPath ? "limegreen" : "white",
              }}
            />
          );
        }),
      )}
    </div>
  );
}
