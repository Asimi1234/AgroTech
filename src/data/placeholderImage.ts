const palette: Record<string, [string, string]> = {
  seed: ['#237237', '#8dca97'],
  fertilizer: ['#916640', '#d2b993'],
  equipment: ['#1c5b2e', '#57ac67'],
  'crop-protection': ['#194927', '#348f47'],
  produce: ['#a97f4c', '#e4d5bd'],
};

/**
 * Generates a self-contained SVG data URI so listing images stay small and work
 * offline. Swap for real CDN URLs when the Phase 2 backend supplies media.
 */
export const placeholderImage = (label: string, category: string): string => {
  const [from, to] = palette[category] ?? ['#237237', '#8dca97'];
  const safeLabel = label.replace(/[<>&]/g, '').slice(0, 22);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#g)"/>
    <text x="24" y="330" font-family="Inter,system-ui,sans-serif" font-size="22"
      font-weight="700" fill="#ffffff" opacity="0.92">${safeLabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
