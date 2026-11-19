// Colour grades: a canvas filter for the photo plus a tint overlay, applied when a panel is drawn.
// Sunset is warm orange into pink; Neon is cyan into magenta; Noir is high-contrast black and white.
export const GRADES = {
  sunset: {
    label: 'Sunset',
    filter: 'saturate(1.35) contrast(1.08) brightness(1.03)',
    tint: [
      [0, 'rgba(255, 150, 60, 0.10)'],
      [0.55, 'rgba(255, 110, 80, 0.12)'],
      [1, 'rgba(200, 40, 120, 0.38)'],
    ],
    sun: true,
  },
  neon: {
    label: 'Neon',
    filter: 'saturate(1.55) contrast(1.15)',
    tint: [
      [0, 'rgba(0, 229, 255, 0.20)'],
      [0.5, 'rgba(120, 80, 255, 0.10)'],
      [1, 'rgba(255, 0, 160, 0.30)'],
    ],
    sun: false,
  },
  noir: {
    label: 'Noir',
    filter: 'grayscale(1) contrast(1.28) brightness(1.06)',
    tint: [
      [0, 'rgba(0, 0, 0, 0.05)'],
      [1, 'rgba(0, 0, 0, 0.30)'],
    ],
    sun: false,
  },
  none: { label: 'Original', filter: 'none', tint: [], sun: false },
};

/** Paints a grade's tint overlay over a panel rectangle. */
export function gradeTint(ctx, rect, grade) {
  if (!grade.tint.length) return;
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  for (const [stop, color] of grade.tint) grad.addColorStop(stop, color);
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}
