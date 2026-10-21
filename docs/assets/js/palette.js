(function () {
  'use strict';
  var palettes = [
    { id: 'blue', ms: 'Biru Rasmi', en: 'Official Blue', colors: ['#124FA3', '#0B2D5A', '#D82932', '#F5BF29'], paper: '#F5F8FD', soft: '#EAF0FA' },
    { id: 'green', ms: 'Hijau Hutan', en: 'Forest Green', colors: ['#267B4C', '#103F2D', '#C8410B', '#EBBB4A'], paper: '#F7FAF5', soft: '#EAF3E9' },
    { id: 'teal', ms: 'Teal Laut', en: 'Ocean Teal', colors: ['#247C78', '#144C49', '#E71951', '#F4A000'], paper: '#FFF9F3', soft: '#E8F4F1' },
    { id: 'purple', ms: 'Ungu Diraja', en: 'Royal Purple', colors: ['#5C3CC5', '#30216B', '#DA247C', '#F2C54B'], paper: '#FBF8FF', soft: '#F0EAF9' },
    { id: 'brick', ms: 'Bata Senja', en: 'Sunset Brick', colors: ['#B8472C', '#562315', '#284CDB', '#E0A724'], paper: '#FFF8F3', soft: '#FAEBE4' },
    { id: 'grey', ms: 'Kelabu Korporat', en: 'Corporate Grey', colors: ['#344256', '#101A2E', '#2584BC', '#E9B500'], paper: '#F7F8FA', soft: '#E9EDF2' }
  ];
  var key = 'moodify-palette';
  var saved = 'teal';
  try { saved = localStorage.getItem(key) || saved; } catch (e) { /* Use in-memory selection if storage is unavailable. */ }
  saved = ({ a: 'teal', b: 'blue', c: 'purple' })[saved] || saved;
  if (!palettes.some(function (p) { return p.id === saved; })) saved = 'teal';
  var box = document.createElement('div');
  box.className = 'palette-picker';
  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'palette-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'moodify-palette-panel');
  var icon = document.createElement('span');
  icon.className = 'palette-toggle__icon';
  icon.setAttribute('aria-hidden', 'true');
  for (var i = 0; i < 4; i++) icon.appendChild(document.createElement('i'));
  toggle.appendChild(icon);
  var panel = document.createElement('div');
  panel.id = 'moodify-palette-panel';
  panel.className = 'palette-panel';
  panel.hidden = true;
  var heading = document.createElement('h2');
  heading.id = 'moodify-palette-title';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-labelledby', heading.id);
  panel.appendChild(heading);
  var choices = palettes.map(function (p) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'palette-option';
    button.dataset.paletteChoice = p.id;
    var swatch = document.createElement('span');
    swatch.className = 'palette-swatch';
    swatch.setAttribute('aria-hidden', 'true');
    p.colors.forEach(function (color) { var part = document.createElement('i'); part.style.backgroundColor = color; swatch.appendChild(part); });
    var label = document.createElement('span');
    button.appendChild(swatch); button.appendChild(label);
    button.addEventListener('click', function () {
      saved = p.id;
      apply();
      try { localStorage.setItem(key, saved); } catch (e) { /* Keep the page usable without storage. */ }
    });
    panel.appendChild(button);
    return { button: button, label: label, palette: p };
  });
  box.appendChild(toggle); box.appendChild(panel); document.body.appendChild(box);
  function language() { return document.documentElement.lang.indexOf('en') === 0 ? 'en' : 'ms'; }
  function refreshText() {
    var lang = language();
    heading.textContent = lang === 'en' ? 'COLOUR PALETTE' : 'PALET WARNA';
    toggle.setAttribute('aria-label', lang === 'en' ? 'Choose a colour palette' : 'Pilih palet warna');
    toggle.title = toggle.getAttribute('aria-label');
    choices.forEach(function (c) { c.label.textContent = c.palette[lang]; });
  }
  function apply() {
    var p = palettes.filter(function (p) { return p.id === saved; })[0];
    document.documentElement.dataset.palette = saved;
    var vars = { '--paper': p.paper, '--surface': '#FFFFFF', '--ink': p.colors[1], '--ink-soft': '#4B5869', '--cobalt': p.colors[0], '--cobalt-dark': p.colors[1], '--lagoon': p.colors[0], '--apricot': p.colors[3], '--apricot-ink': '#302512', '--border': '#D8DFE7', '--border-strong': '#8492A4', '--control': p.colors[1], '--focus': p.colors[0], '--ok-bg': p.soft, '--ok-border': p.colors[0], '--ok-ink': p.colors[1], '--info-bg': p.soft, '--info-border': p.colors[0], '--info-ink': p.colors[1], '--palette-soft': p.soft };
    Object.keys(vars).forEach(function (k) { document.documentElement.style.setProperty(k, vars[k]); });
    choices.forEach(function (c) { c.button.setAttribute('aria-pressed', c.palette.id === saved ? 'true' : 'false'); });
    Array.prototype.forEach.call(icon.children, function (part, i) { part.style.backgroundColor = p.colors[i]; });
  }
  function close() { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', function () { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); });
  document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); toggle.focus(); }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !panel.hidden) {
      e.preventDefault();
      var index = choices.findIndex(function (c) { return c.button === document.activeElement; });
      var next = e.key === 'ArrowDown' ? (index + 1) % choices.length : (index <= 0 ? choices.length - 1 : index - 1);
      choices[next].button.focus();
    }
  });
  refreshText(); apply();
  window.MOODIFY_PALETTE = { refreshText: refreshText };
  new MutationObserver(refreshText).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}());
