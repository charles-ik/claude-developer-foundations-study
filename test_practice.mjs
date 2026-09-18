// Runnable app-state regression checks, using only Node's standard library.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const bank = JSON.parse(fs.readFileSync(new URL('./course content HTML/data/exams.json', import.meta.url)));
const script = fs.readFileSync(new URL('./course content HTML/assets/exams.js', import.meta.url), 'utf8');
const vendor = fs.readFileSync(new URL('./course content HTML/assets/vendor/markdown-it.min.js', import.meta.url), 'utf8');
const storage = new Map();
function boot(responseText = null) {
  const elements = new Map();
  const element = name => {
    if (!elements.has(name)) elements.set(name, { innerHTML: '', textContent: '', value: '', hidden: true, disabled: false, style: {}, listeners: {}, classList: { toggle() {}, add() {}, remove() {} }, focus() {}, setAttribute() {}, showModal() {}, close() {}, addEventListener(event, fn) { this.listeners[event] = fn; }, querySelector(selector) { return element(selector); }, querySelectorAll() { return []; } });
    return elements.get(name);
  };
  const document = { ...element('document'), querySelector: element, querySelectorAll() { return []; } };
  const root = element('#workspace'); let inputs = [];
  root.querySelectorAll = selector => selector.includes('input') ? inputs.map(value => ({ value })) : [];
  const context = { atob, btoa, TextDecoder, TextEncoder, document, window: { EXAM_DATA: bank, scrollTo() {} }, localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) }, location: { protocol: responseText === null ? 'file:' : 'http:' }, fetch: async url => ({ ok: true, json: async () => url === '/api/config' ? { providers: { openrouter: { configured: true, model: 'test-model' } } } : { text: responseText } }), confirm: () => true, setTimeout, clearTimeout, AbortController };
  vm.createContext(context); vm.runInContext(vendor, context); context.window.markdownit = context.markdownit;
  vm.runInContext(script, context);
  return {
    root, element,
    click(action, extra = {}) { document.listeners.click({ target: { closest: () => ({ dataset: { action, ...extra } }) } }); document.listeners.click({ target: { closest: () => ({ dataset: { action: 'confirm-run' } }) } }); },
    select(values) { inputs = values; root.listeners.change({ target: { name: 'answer' } }); },
    get state() { return JSON.parse(storage.get('ccdv-f-exam-studio-v1')); },
    set(name, value) { element(name).value = value; },
  };
}
let ui = boot();
// Complete all three sets with their canonical keys, preserving state on reload.
for (let test = 1; test <= 3; test++) {
  ui.click('start', { test: String(test), mode: 'mock' });
  const qs = bank.questions.filter(q => q.test === test);
  for (let i = 0; i < qs.length; i++) {
    assert(!ui.root.innerHTML.includes('Correct answer:'), 'mock leaked an explanation');
    assert(!ui.root.innerHTML.includes('data-action="tutor"'), 'mock enabled the tutor');
    ui.select(qs[i].correct);
    if (i === 0) {
      ui.click('flag', { id: qs[i].id });
      ui = boot(); ui.click('resume');
      assert.deepEqual(ui.state.active.answers[qs[i].id], qs[i].correct);
      assert(ui.state.flags.includes(qs[i].id));
    }
    if (i < qs.length - 1) ui.click('next');
  }
  ui.click('finish');
  assert(ui.root.innerHTML.includes('100% correct'));
  assert.equal(ui.state.active, null);
  assert.equal(ui.state.history.length, test);
}
// Incomplete multi-select earns zero; wrong selections enter the review queue.
const multi = bank.questions.find(q => q.correct.length > 1);
ui.click('start', { test: String(multi.test), mode: 'study' });
const index = bank.questions.filter(q => q.test === multi.test).indexOf(multi);
ui.click('jump', { index: String(index) });
ui.select([multi.correct[0]]); ui.click('check');
assert(!ui.state.active.checked.includes(multi.id));
const wrong = [0, 1, 2, 3].filter(i => !multi.correct.includes(i));
ui.select(wrong); ui.click('check');
assert.equal(ui.state.outcomes[multi.id], false);
assert(ui.root.innerHTML.includes('Not quite.'));
ui.select(multi.correct); // Feedback locks the submitted selection.
assert.deepEqual(ui.state.active.answers[multi.id], wrong);
ui.click('finish');
assert(ui.root.innerHTML.includes('0% correct'));
assert(ui.state.outcomes['t1-q01'] === false || multi.test !== 1); // Unanswered counts as wrong.
ui.click('missed');
assert.equal(ui.state.active.mode, 'study');
const first = bank.questions.find(q => q.id === ui.state.active.ids[0]);
ui.select(first.correct); ui.click('check');
assert.equal(ui.state.outcomes[first.id], true);
// Valid persisted state must survive; corrupt JSON must not prevent startup.
assert.equal(boot().state.active.title, 'Missed-question practice');
storage.set('ccdv-f-exam-studio-v1', '{bad');
ui = boot(); assert(ui.root.innerHTML.includes('Three full practice tests'));
ui.set('#quick-module', 'all'); ui.click('quick');
assert.equal(ui.state.active.ids.length, 10);
assert.equal(new Set(ui.state.active.ids).size, 10);
assert(!storage.get('ccdv-f-exam-studio-v1').includes('apiKey'));
ui.click('reset-progress'); assert.equal(ui.state.active, null); assert.equal(ui.state.history.length, 0); assert.equal(ui.state.flags.length, 0);
console.log('PASS: all 90 answer keys, exact scoring, mock isolation, resume, flags, history, partial/incorrect multi-select, locked feedback, missed retries, corrupt storage, and unique quick practice.');

// Exercise the live-response and cached-response rendering paths with no API call.
const markdownSample = '# Explanation\n\n**Bold** and *emphasis*, with `code`.\n\n- First\n  - Nested\n\n1. Step\n\n> Course quote\n\n```js\nconst value = "<safe>";\n```\n\n| Choice | Result |\n| --- | --- |\n| A | Correct |\n\n[Source](https://example.com)\n\n<script>alert(1)</script>\n\n[Bad](javascript:alert(1))\n\n![image](https://example.com/tracker.png)';
ui = boot(markdownSample);
await new Promise(resolve => setImmediate(resolve));
ui.click('start', { test: '1', mode: 'study' });
ui.select([1]); ui.click('check');
ui.click('tutor', { kind: 'explain' });
await new Promise(resolve => setImmediate(resolve));
const rendered = ui.element('#tutor-output').innerHTML;
for (const tag of ['h1', 'strong', 'em', 'code', 'ul', 'ol', 'blockquote', 'pre', 'table']) assert(rendered.includes(`<${tag}`), tag);
assert(rendered.includes('&lt;script&gt;'));
assert(!rendered.includes('<script>') && !rendered.includes('<img') && !rendered.includes('href="javascript:'));
assert(rendered.includes('rel="noopener noreferrer"'));
ui.click('flag', { id: 't1-q01' });
assert.equal(ui.element('#tutor-output').innerHTML, rendered, 'cached tutor response lost Markdown formatting');
console.log('PASS: live/cached tutor Markdown, nested lists, code, tables, safe links, escaped HTML, and disabled images.');
