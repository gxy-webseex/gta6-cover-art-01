// Fixed scenes for screenshots: ?shot=editor shows the editor with a composed cover; ?shot=cover shows the
// cover alone (the app's own drawing of the exported cover). Query: hero/a/b pick the sample photos,
// caption/subtitle the words, grade the preset, size the export size. window.__shotReady is set once painted.
export async function runShot(shot, query, compose) {
  await compose({
    hero: query.get('hero') ?? 'pier',
    a: query.get('a') ?? 'boulevard',
    b: query.get('b') ?? 'pier',
    heroOy: Number(query.get('heroOy') ?? 0),
    aOy: Number(query.get('aOy') ?? 0),
    bOy: Number(query.get('bOy') ?? 0),
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? '1080x1080',
    caption: query.get('caption') ?? 'Sunset Heist',
    subtitle: query.get('subtitle') ?? 'One last score',
  });
  if (shot === 'cover') document.body.classList.add('shot-cover');
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
