// Draws the poster: three photo panels with the colour grade, a stylised sun on the hero panel for the
// sunset grade, a white poster frame, and the caption band with bold outlined lettering.
import { panelRects } from './layout.js';
import { gradeTint } from './grade.js';

/** Draws the whole poster from `state` onto the canvas's 2D context, at the canvas's own size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const { panels, band } = panelRects(w, h);
  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);
  for (const panel of panels) {
    drawPanel(ctx, panel, state.panels[panel.key], state.grade);
  }
  drawSun(ctx, panels[0], state.grade);
  drawCaptionBand(ctx, w, h, band, state.title, state.subtitle, state.titleScale);
  const frame = Math.max(4, Math.round(w * 0.006));
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.lineWidth = frame;
  ctx.strokeRect(frame / 2, frame / 2, w - frame, h - frame);
}

/** Draws one panel: its photo cover-fit with zoom and pan, the grade's filter and tint, or a gradient fill. */
function drawPanel(ctx, rect, panel, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  const img = panel.photo;
  if (img) {
    const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
    const scale = base * panel.zoom;
    const pw = img.naturalWidth * scale;
    const ph = img.naturalHeight * scale;
    const cx = rect.x + rect.w / 2 + panel.ox * rect.w;
    const cy = rect.y + rect.h / 2 + panel.oy * rect.h;
    ctx.filter = grade.filter;
    ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
    ctx.filter = 'none';
  } else {
    const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    grad.addColorStop(0, '#3b1d5e');
    grad.addColorStop(0.55, '#c22e7a');
    grad.addColorStop(1, '#ff7a3d');
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  gradeTint(ctx, rect, grade);
  const shade = ctx.createLinearGradient(rect.x, rect.y + rect.h * 0.6, rect.x, rect.y + rect.h);
  shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.fillStyle = shade;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

/** A retro sun — a gradient disc with dark slit lines — in the hero panel's top corner, sunset grade only. */
function drawSun(ctx, hero, grade) {
  if (!grade.sun) return;
  const r = hero.w * 0.11;
  const cx = hero.x + hero.w - r * 1.35;
  const cy = hero.y + r * 1.35;
  ctx.save();
  const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  grad.addColorStop(0, '#ffd76a');
  grad.addColorStop(0.5, '#ff7a3d');
  grad.addColorStop(1, '#ff2e88');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(20, 8, 31, 0.55)';
  for (let i = 0; i < 3; i += 1) {
    const y = cy + r * (0.05 + i * 0.22);
    const half = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)));
    ctx.fillRect(cx - half, y, half * 2, r * 0.07);
  }
  ctx.restore();
}

/** The caption band: a dark plum strip with a magenta top edge, a big outlined title and a gold subtitle. */
function drawCaptionBand(ctx, w, h, band, title, subtitle, titleScale) {
  const y = h - band;
  const grad = ctx.createLinearGradient(0, y, 0, h);
  grad.addColorStop(0, '#1c0b2e');
  grad.addColorStop(1, '#0d0518');
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, w, band);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, y, w, Math.max(3, band * 0.04));
  const text = title.trim().toUpperCase();
  const sub = subtitle.trim();
  const cx = w / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  if (text) {
    let size = band * 0.52 * titleScale;
    const font = (s) => `900 ${s}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
    ctx.font = font(size);
    while (ctx.measureText(text).width > w * 0.92 && size > 10) {
      size -= 2;
      ctx.font = font(size);
    }
    const ty = y + band * (sub ? 0.38 : 0.52);
    ctx.fillStyle = '#ff2e88';
    ctx.fillText(text, cx + size * 0.03, ty + size * 0.03);
    ctx.strokeStyle = '#0d0518';
    ctx.lineWidth = Math.max(3, size * 0.14);
    ctx.strokeText(text, cx, ty);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, cx, ty);
  }
  if (sub) {
    const size = band * 0.2;
    ctx.font = `700 ${size}px "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = '#ffd76a';
    ctx.fillText(sub.toUpperCase(), cx, y + band * 0.78);
  }
}
