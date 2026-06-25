export default function Logo({ className = "h-6 w-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Diamond Face */}
      <path d="M16 4 L27 9.5 L16 15 L5 9.5 Z" className="fill-brand-500 transition-colors" />
      {/* Middle Layer */}
      <path
        d="M5 15.5 L16 21 L27 15.5"
        className="stroke-brand-600 transition-colors"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom Layer */}
      <path
        d="M5 21.5 L16 27 L27 21.5"
        className="stroke-brand-700 transition-colors"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
