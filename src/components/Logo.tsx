export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg className="nav__logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" fill="#c8ff3a" />
      <path
        d="M6 20c2.5-9 5-12 7-12 1.8 0 .6 9 3 9 1.8 0 2-4.5 4-4.5 1.2 0 1.5 2 3 2"
        fill="none"
        stroke="#0c0d0a"
        strokeWidth="2.6"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <rect x="6" y="24" width="14" height="2.6" fill="#0c0d0a" />
    </svg>
  )
}
