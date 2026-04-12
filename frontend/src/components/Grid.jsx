export default function Grid({ path, start, end, setStart, setEnd }) {
  const rows = 4,
    cols = 6;

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: `repeat(${cols},60px)` }}
    >
      {[...Array(rows * cols)].map((_, i) => {
        const r = Math.floor(i / cols),
          c = i % cols;

        const isPath = path.some((p) => p[0] === r && p[1] === c);
        const isStart = start[0] === r && start[1] === c;
        const isEnd = end[0] === r && end[1] === c;

        return (
          <div
            key={i}
            onClick={() => setStart([r, c])}
            onDoubleClick={() => setEnd([r, c])}
            style={{
              width: 60,
              height: 60,
              border: "1px solid",
              background: isStart
                ? "green"
                : isEnd
                  ? "red"
                  : isPath
                    ? "yellow"
                    : "white",
            }}
          />
        );
      })}
    </div>
  );
}
