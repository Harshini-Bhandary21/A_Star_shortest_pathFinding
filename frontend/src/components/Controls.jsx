function Controls({ onDetect, onSolve, onStart }) {
  return (
    <div>
      <button onClick={onDetect}>Detect Maze</button>
      <button onClick={onSolve}>Solve Path</button>
      <button onClick={onStart}>Start Robot</button>
    </div>
  );
}

export default Controls;