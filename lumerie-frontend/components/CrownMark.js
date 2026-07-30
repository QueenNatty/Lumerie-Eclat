export default function CrownMark({ className = "crown-mark" }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 32 L4 14 L16 24 L32 6 L48 24 L60 14 L60 32 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="4" cy="10" r="3" fill="currentColor" />
      <circle cx="32" cy="4" r="3" fill="currentColor" />
      <circle cx="60" cy="10" r="3" fill="currentColor" />
    </svg>
  );
}
