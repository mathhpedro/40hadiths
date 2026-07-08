/**
 * Brand mark: an 8-pointed star (najmah / Rub el Hizb) — the union of an
 * axis-aligned square and a 45°-rotated one — a classic Islamic geometric
 * motif, with no depiction of animate beings.
 */
export function Logo({
  size = 44,
  bare = false,
  id = 'logo',
}: {
  size?: number
  bare?: boolean
  id?: string
}) {
  const star = (
    <g fillRule="evenodd">
      <path
        d="M9 9 H39 V39 H9 Z M24 3.5 L44.5 24 L24 44.5 L3.5 24 Z"
        fill={bare ? 'currentColor' : `url(#${id}-gold)`}
      />
      <circle cx="24" cy="24" r="5.4" fill={bare ? 'transparent' : `url(#${id}-tile)`} />
    </g>
  )

  if (bare) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        {star}
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={`${id}-tile`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0c5b43" />
          <stop offset="1" stopColor="#04241a" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4d98b" />
          <stop offset="0.55" stopColor="#e6c26a" />
          <stop offset="1" stopColor="#c79a3f" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="48" height="48" rx="13" fill={`url(#${id}-tile)`} />
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="12.25"
        fill="none"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.5"
      />
      {star}
    </svg>
  )
}
