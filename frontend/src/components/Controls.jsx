export default function Controls({ detect, solve, start }) {
  return (
    <div>
      <button onClick={detect}>Detect</button>
      <button onClick={solve}>Solve</button>
      <button onClick={start}>Start Journey</button>
    </div>
  );
}
