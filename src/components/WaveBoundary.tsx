export default function WaveBoundary() {
  return (
    <div className="wave-boundary-container">
      <svg
        className="wave-boundary-svg"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="wave-boundary-path"
          d="M0,30 Q300,10 600,30 T1200,30"
        />
      </svg>
    </div>
  );
}
