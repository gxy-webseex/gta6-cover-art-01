// The editor's state and actions: one photo, zoom and pan per panel, a global grade, the caption, and the
// export size. The preview canvas is drawn at the export size and scaled down by CSS; export draws the same
// poster to a fresh canvas and saves it as a PNG.
import { drawCover } from './cover.js';
import { GRADES } from './grade.js';
import { EXPORT_SIZES, panelRects } from './layout.js';

const PANEL_KEYS = ['hero', 'a', 'b'];

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function blankPanel() {
  return { photo: null, photoKey: '', zoom: 1, ox: 0, oy: 0 };
}

/** Creates the editor for a preview canvas and returns its state and actions. */
export function createEditor(canvas) {
  const state = {
    panels: { hero: blankPanel(), a: blankPanel(), b: blankPanel() },
    grade: GRADES.sunset,
    gradeKey: 'sunset',
    title: 'Sunset Heist',
    subtitle: 'One last score',
    titleScale: 1,
    size: EXPORT_SIZES[0],
    selected: 'hero',
    photos: [], // { key, name, img }
  };

  function redraw() {
    canvas.width = state.size.width;
    canvas.height = state.size.height;
    drawCover(canvas, state);
  }

  /** Clamps a panel's pan so its photo still covers the whole panel. */
  function clampPan(key) {
    const panel = state.panels[key];
    const rect = panelRects(state.size.width, state.size.height).panels.find((p) => p.key === key);
    if (!panel.photo || !rect) return;
    const base = Math.max(rect.w / panel.photo.naturalWidth, rect.h / panel.photo.naturalHeight);
    const pw = panel.photo.naturalWidth * base * panel.zoom;
    const ph = panel.photo.naturalHeight * base * panel.zoom;
    const maxOx = Math.max(0, (pw - rect.w) / 2 / rect.w);
    const maxOy = Math.max(0, (ph - rect.h) / 2 / rect.h);
    panel.ox = Math.max(-maxOx, Math.min(maxOx, panel.ox));
    panel.oy = Math.max(-maxOy, Math.min(maxOy, panel.oy));
  }

  /** Finds which panel a point on the preview canvas (in canvas pixels) falls in. */
  function panelAt(x, y) {
    const { panels } = panelRects(state.size.width, state.size.height);
    return panels.find((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
  }

  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const hit = panelAt(x, y);
    if (!hit) return;
    state.selected = hit.key;
    if (typeof state.onSelect === 'function') state.onSelect(hit.key);
    drag = { key: hit.key, x, y, ox: state.panels[hit.key].ox, oy: state.panels[hit.key].oy };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const panelRect = panelRects(state.size.width, state.size.height).panels.find((p) => p.key === drag.key);
    const panel = state.panels[drag.key];
    panel.ox = drag.ox + (x - drag.x) / panelRect.w;
    panel.oy = drag.oy + (y - drag.y) / panelRect.h;
    clampPan(drag.key);
    redraw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });

  return {
    state,
    redraw,
    /** Registers a photo (an image with a key and a name) and returns its entry. */
    addPhoto(img, key, name) {
      const entry = { key, name, img };
      state.photos.push(entry);
      return entry;
    },
    /** Puts a photo entry into a panel, resetting its crop. */
    setPhoto(key, entry) {
      const panel = state.panels[key];
      panel.photo = entry.img;
      panel.photoKey = entry.key;
      panel.zoom = 1;
      panel.ox = 0;
      panel.oy = 0;
      redraw();
    },
    /** Puts the same photo entry into every panel. */
    fillAll(entry) {
      for (const key of PANEL_KEYS) this.setPhoto(key, entry);
    },
    selectPanel(key) {
      state.selected = key;
      if (typeof state.onSelect === 'function') state.onSelect(key);
    },
    setZoom(value) {
      state.panels[state.selected].zoom = value;
      clampPan(state.selected);
      redraw();
    },
    /** Moves a panel's photo by fractions of the panel (positive y shows more of the photo's top). */
    setPan(key, ox, oy) {
      state.panels[key].ox = ox;
      state.panels[key].oy = oy;
      clampPan(key);
      redraw();
    },
    setGrade(key) {
      state.grade = GRADES[key];
      state.gradeKey = key;
      redraw();
    },
    setSize(index) {
      state.size = EXPORT_SIZES[index];
      for (const key of PANEL_KEYS) clampPan(key);
      redraw();
    },
    setTitle(text) {
      state.title = text;
      redraw();
    },
    setSubtitle(text) {
      state.subtitle = text;
      redraw();
    },
    setTitleScale(value) {
      state.titleScale = value;
      redraw();
    },
    /** Draws the poster at the export size and returns its PNG blob. */
    exportPNG() {
      const off = document.createElement('canvas');
      off.width = state.size.width;
      off.height = state.size.height;
      drawCover(off, state);
      return new Promise((resolve) => off.toBlob(resolve, 'image/png'));
    },
  };
}
