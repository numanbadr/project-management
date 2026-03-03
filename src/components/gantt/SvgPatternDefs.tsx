export function SvgPatternDefs() {
  return (
    <defs>
      {/* Striped red pattern for delayed tasks */}
      <pattern
        id="pattern-delayed"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect width="8" height="8" fill="#fecaca" />
        <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="4" />
      </pattern>

      {/* Dotted green pattern for early completion */}
      <pattern
        id="pattern-early"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <rect width="8" height="8" fill="#dcfce7" />
        <circle cx="4" cy="4" r="1.5" fill="#22c55e" />
      </pattern>

      {/* Light gray for scheduled-only (not started) */}
      <pattern
        id="pattern-scheduled"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <rect width="8" height="8" fill="#e2e8f0" />
        <line x1="0" y1="4" x2="8" y2="4" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
      </pattern>
    </defs>
  );
}
