function CameraView() {
  return (
    <div>
      <h3>Live Camera</h3>
      <img
        src="http://10.253.212.123:8080/video"
        width={900}
        alt="camera"
      />
    </div>
  );
}

export default CameraView;