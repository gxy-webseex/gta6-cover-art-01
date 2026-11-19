// Wires the page: load photos, pick a panel and its photo, crop with drag and zoom, write the caption, pick
// a grade and an export size, export the PNG. A `?shot=` query sets up a fixed scene for a screenshot instead
// (./shots.js). window.__exportPNG is a hook for checks: it returns the exported PNG as a data URL.
import { createEditor, loadImage } from './editor.js';
import { EXPORT_SIZES } from './layout.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const editor = createEditor(canvas);
const { state } = editor;

const thumbs = document.getElementById('thumbs');
const zoom = document.getElementById('zoom');
const panelPicker = document.getElementById('panelPicker');
const gradePicker = document.getElementById('gradePicker');
const sizePicker = document.getElementById('sizePicker');

function syncPanelUI() {
  panelPicker.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.panel === state.selected));
  zoom.value = String(state.panels[state.selected].zoom);
  thumbs.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.key === state.panels[state.selected].photoKey));
}
state.onSelect = syncPanelUI;

/** Adds a photo entry's thumbnail; clicking it puts the photo in the selected panel. */
function addThumb(entry) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'thumb';
  button.dataset.key = entry.key;
  button.title = entry.name;
  const img = document.createElement('img');
  img.src = entry.img.src;
  img.alt = entry.name;
  button.append(img);
  button.addEventListener('click', () => {
    editor.setPhoto(state.selected, entry);
    syncPanelUI();
  });
  thumbs.append(button);
}

async function addSample(key, name) {
  if (state.photos.some((p) => p.key === key)) return state.photos.find((p) => p.key === key);
  const img = await loadImage(`samples/${key}.jpg`);
  const entry = editor.addPhoto(img, key, name);
  addThumb(entry);
  return entry;
}

document.getElementById('photos').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const img = await loadImage(URL.createObjectURL(file));
    const entry = editor.addPhoto(img, `upload-${Date.now()}-${file.name}`, file.name);
    addThumb(entry);
    editor.setPhoto(state.selected, entry);
  }
  syncPanelUI();
});
document.querySelectorAll('[data-sample]').forEach((button) => {
  button.addEventListener('click', async () => {
    const entry = await addSample(button.dataset.sample, `Sample: ${button.dataset.sample}`);
    editor.setPhoto(state.selected, entry);
    syncPanelUI();
  });
});
panelPicker.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-panel]');
  if (!button) return;
  editor.selectPanel(button.dataset.panel);
  syncPanelUI();
});
zoom.addEventListener('input', () => editor.setZoom(Number(zoom.value)));
gradePicker.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-grade]');
  if (!button) return;
  editor.setGrade(button.dataset.grade);
  gradePicker.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === button));
});
sizePicker.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-size]');
  if (!button) return;
  editor.setSize(Number(button.dataset.size));
  sizePicker.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === button));
});
document.getElementById('title').addEventListener('input', (e) => editor.setTitle(e.target.value));
document.getElementById('subtitle').addEventListener('input', (e) => editor.setSubtitle(e.target.value));
document.getElementById('titleSize').addEventListener('input', (e) => editor.setTitleScale(Number(e.target.value)));
document.getElementById('export').addEventListener('click', async () => {
  const blob = await editor.exportPNG();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cover-${state.size.width}x${state.size.height}.png`;
  a.click();
  status.textContent = `Saved cover-${state.size.width}x${state.size.height}.png`;
});

window.__exportPNG = async () => {
  const blob = await editor.exportPNG();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async ({ hero, a, b, heroOy, aOy, bOy, grade, size, caption, subtitle }) => {
    const heroPhoto = await addSample(hero, `Sample: ${hero}`);
    const aPhoto = await addSample(a, `Sample: ${a}`);
    const bPhoto = await addSample(b, `Sample: ${b}`);
    editor.setGrade(grade);
    editor.setSize(Math.max(0, EXPORT_SIZES.findIndex((s) => `${s.width}x${s.height}` === size)));
    editor.setPhoto('hero', heroPhoto);
    editor.setPhoto('a', aPhoto);
    editor.setPhoto('b', bPhoto);
    editor.setPan('hero', 0, heroOy);
    editor.setPan('a', 0, aOy);
    editor.setPan('b', 0, bOy);
    editor.setTitle(caption);
    editor.setSubtitle(subtitle);
    document.getElementById('title').value = caption;
    document.getElementById('subtitle').value = subtitle;
    editor.selectPanel('hero');
    syncPanelUI();
  });
} else {
  addSample('pier', 'Sample: pier').then((entry) => editor.fillAll(entry));
  editor.redraw();
  syncPanelUI();
}
