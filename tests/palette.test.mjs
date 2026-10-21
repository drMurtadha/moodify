import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { JSDOM } = await import(process.env.JSDOM_PATH || 'jsdom');
const code = fs.readFileSync(new URL('../docs/assets/js/palette.js', import.meta.url), 'utf8');
function mount(blocked = false) {
  const dom = new JSDOM('<html lang="ms-MY"><body></body></html>', { url: 'https://example.com', runScripts: 'outside-only' });
  if (blocked) Object.defineProperty(dom.window, 'localStorage', { get() { throw new dom.window.DOMException('blocked', 'SecurityError'); } });
  dom.window.eval(code);
  return dom.window;
}
test('six swatches; selected palette changes theme and persists', () => {
  const w = mount(), d = w.document;
  assert.equal(d.querySelectorAll('.palette-option').length, 6);
  d.querySelector('.palette-toggle').click();
  assert.equal(d.querySelector('.palette-panel').hidden, false);
  d.querySelector('[data-palette-choice="grey"]').click();
  assert.equal(d.documentElement.dataset.palette, 'grey');
  assert.equal(w.localStorage.getItem('moodify-palette'), 'grey');
  assert.equal(d.querySelector('[data-palette-choice="grey"]').getAttribute('aria-pressed'), 'true');
  assert.equal(d.documentElement.style.getPropertyValue('--cobalt'), '#344256');
});
test('works without browser storage and Escape returns focus', () => {
  const w = mount(true), d = w.document;
  d.querySelector('.palette-toggle').click();
  const option = d.querySelector('[data-palette-choice="blue"]'); option.click();
  assert.equal(d.documentElement.dataset.palette, 'blue');
  option.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(d.querySelector('.palette-panel').hidden, true);
  assert.equal(d.activeElement, d.querySelector('.palette-toggle'));
});
test('language labels change and outside click closes panel', async () => {
  const w = mount(), d = w.document;
  d.documentElement.lang = 'en'; await new Promise(r => w.setTimeout(r, 0));
  assert.equal(d.querySelector('[data-palette-choice="green"]').textContent, 'Forest Green');
  d.querySelector('.palette-toggle').click(); d.body.click();
  assert.equal(d.querySelector('.palette-panel').hidden, true);
});
