function Grid({ grid, path, setStart, setEnd, start, end }) {

  const handleClick = (row, col) => {
    if (!start) {
      setStart([row, col]);
    } else if (!end) {
      setEnd([row, col]);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Maze Grid</h2>
      <p>Click once = Start, Click again = End</p>

      {grid.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex" }}>
          {row.map((cell, colIndex) => {

            // 🔥 CORRECT PATH CHECK
            const isPath = path?.some(
              ([r, c]) => r === rowIndex && c === colIndex
            );

            let bgColor = "white";

            // 🔥 PRIORITY ORDER (IMPORTANT)
            if (grid[rowIndex][colIndex] === 1) {
              bgColor = "black"; // wall
            }
            else if (start && rowIndex === start[0] && colIndex === start[1]) {
              bgColor = "blue"; // start
            }
            else if (end && rowIndex === end[0] && colIndex === end[1]) {
              bgColor = "red"; // end
            }
            else if (isPath) {
              bgColor = "green"; // path ✅
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`} // 🔥 important
                onClick={() => handleClick(rowIndex, colIndex)}
                style={{
                  width: "40px",
                  height: "40px",
                  border: "1px solid gray",
                  backgroundColor: bgColor,
                  cursor: "pointer"
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Grid;