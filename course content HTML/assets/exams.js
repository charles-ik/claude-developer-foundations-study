(() => {
  'use strict';
  const bank = window.EXAM_DATA;
  const root = document.querySelector('#workspace');
  if (!bank?.questions?.length) { root.textContent = 'Question data is missing. Run node "course content HTML/build.mjs" --verify.'; return; }
  const byId = new Map(bank.questions.map(q => [q.id, q]));
  const modules = ['MSO foundations', 'Prompting, agents & tools', 'Claude Code & MCP', 'Production engineering', 'Accelerators & deployment'];
  const key = 'ccdv-f-exam-studio-v1';
  const empty = () => ({ version: 1, active: null, flags: [], outcomes: {}, history: [], provider: 'openrouter', models: {} });
  const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const equal = (a, b) => a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);
  const validAnswers = answers => answers && typeof answers === 'object' && !Array.isArray(answers) && Object.entries(answers).every(([id, values]) => byId.has(id) && Array.isArray(values) && values.every(v => Number.isInteger(v) && v >= 0 && v < 4));
  const validAttempt = a => a && Array.isArray(a.ids) && a.ids.length > 0 && new Set(a.ids).size === a.ids.length && a.ids.every(id => byId.has(id)) && validAnswers(a.answers) && Array.isArray(a.checked) && a.checked.every(id => a.ids.includes(id)) && Number.isInteger(a.index) && a.index >= 0 && a.index < a.ids.length && ['mock', 'study'].includes(a.mode) && typeof a.title === 'string' && Number.isFinite(a.startedAt);
  let state = empty();
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved?.version === 1) {
      state.flags = Array.isArray(saved.flags) ? saved.flags.filter(id => byId.has(id)) : [];
      state.outcomes = saved.outcomes && typeof saved.outcomes === 'object' ? Object.fromEntries(Object.entries(saved.outcomes).filter(([id, value]) => byId.has(id) && typeof value === 'boolean')) : {};
      state.active = validAttempt(saved.active) ? saved.active : null;
      state.history = Array.isArray(saved.history) ? saved.history.filter(a => validAttempt(a) && a.submitted).slice(0, 50) : [];
      state.provider = ['openrouter', 'openai', 'gemini'].includes(saved.provider) ? saved.provider : 'openrouter';
      state.models = saved.models && typeof saved.models === 'object' && !Array.isArray(saved.models) ? saved.models : {};
    }
  } catch { document.querySelector('#storage-warning').hidden = false; }
  let pendingConfirmation = null;
  function confirmAction(message, action) {
    pendingConfirmation = action;
    document.querySelector('#confirmation-message').textContent = message;
    document.querySelector('#confirmation').showModal();
  }
  let screen = 'home', attempt = null, reviewFilter = 'all', reviewModule = 'all';
  let config = null, credentials = {}, tutor = {}, requestSequence = 0, controller = null;
  const persist = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { document.querySelector('#storage-warning').hidden = false; } };
  const queue = () => bank.questions.filter(q => state.flags.includes(q.id) || state.outcomes[q.id] === false);
  const selected = q => attempt.answers[q.id] || [];
  const correct = (q, a = attempt) => equal(a.answers[q.id] || [], q.correct);
  const score = a => a.ids.filter(id => correct(byId.get(id), a)).length;
  const href = q => `${q.source.path.replace(/\.md$/, '.html')}#${q.source.anchor}`;
  const isRevealed = q => Boolean(attempt.submitted || attempt.checked.includes(q.id));
  const answered = (a, id) => a.answers[id]?.length === byId.get(id).correct.length;
  const answeredCount = a => a.ids.filter(id => answered(a, id)).length;
  const percent = a => Math.round(score(a) / a.ids.length * 100);
  function move(view) {
    controller?.abort(); controller = null; requestSequence++;
    screen = view; render(); root.focus(); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function saveAttempt() { if (state.active?.startedAt === attempt?.startedAt) state.active = attempt; persist(); }
  function start(ids, mode, title) {
    if (!ids.length) return;
    if (state.active && !state.active.submitted) { confirmAction('Start a new session? This replaces your unfinished session. Your review queue and completed tests will stay saved.', () => { state.active = null; start(ids, mode, title); }); return; }
    attempt = { ids, mode, title, answers: {}, checked: [], index: 0, startedAt: Date.now(), submitted: false };
    state.active = attempt; tutor = {}; persist(); move('question');
  }
  function finish(confirmed = false) {
    const left = attempt.ids.length - answeredCount(attempt);
    if (left && !confirmed) { confirmAction(`${left} question${left === 1 ? ' is' : 's are'} incomplete or unanswered and will count as incorrect. Submit this test?`, () => finish(true)); return; }
    attempt.submitted = true; attempt.completedAt = Date.now();
    attempt.ids.forEach(id => { state.outcomes[id] = correct(byId.get(id)); });
    state.history.unshift(JSON.parse(JSON.stringify(attempt))); state.history = state.history.slice(0, 50);
    state.active = null; persist(); move('results');
  }
  function feedback(q) {
    return `<section class="feedback ${correct(q) ? '' : 'wrong'}" aria-live="polite"><h3>${correct(q) ? 'Correct. Nicely reasoned.' : selected(q).length ? 'Not quite. Here’s the distinction.' : 'This question was unanswered.'}</h3><p class="your-answer"><strong>Correct answer${q.correct.length > 1 ? 's' : ''}:</strong> ${q.correct.map(i => `${'ABCD'[i]}. ${esc(q.options[i])}`).join('<br>')}</p><p>${esc(q.explanation)}</p><button class="flag" data-action="flag" data-id="${q.id}" aria-pressed="${state.flags.includes(q.id)}">${state.flags.includes(q.id) ? '⚑ Saved for review' : '⚑ Mark for review'}</button><details class="source"><summary>Read the supporting course excerpt</summary><blockquote>${esc(q.source.excerpt)}</blockquote><a href="${esc(href(q))}" target="_blank" rel="noopener">Open the archived lesson ↗</a><p class="small">${esc(q.source.heading)} · Module ${q.module}</p></details></section>`;
  }
  function home() {
    const history = state.history;
    const attempted = Object.keys(state.outcomes).length;
    root.innerHTML = `<section class="hero"><div><span class="eyebrow">PRACTICE WITH PURPOSE</span><h1>Know it.<br>Then put it to the test.</h1><p>Turn the course into working knowledge. Try a full mock, take a quick practice round, or revisit the questions that need another look.</p></div><div class="hero-note"><strong>90</strong><span>questions, grounded in your archive</span><div class="progress"><span style="width:${Math.round(attempted / 90 * 100)}%"></span></div><span>Every answer has a source.</span></div></section>
      ${state.active ? `<div class="notice resume"><p><strong>Your session is waiting.</strong><br>${esc(state.active.title)} · ${answeredCount(state.active)} of ${state.active.ids.length} answered</p><button class="primary" data-action="resume">Resume session →</button></div>` : ''}
      <div class="stat-strip"><div><strong>${history.length}</strong>sessions completed</div><div><strong>${attempted} / 90</strong>questions attempted</div><div><strong>${queue().length}</strong>to revisit</div></div>
      <div class="section-heading"><h2>Three full practice tests</h2><p class="small">30 questions each · All five modules</p></div>
      <div class="tests">${bank.tests.map((test, i) => `<article class="test-card ${i === 0 ? 'featured' : ''}"><div class="test-number">0${test.id}<span>${i === 0 ? 'START HERE' : 'MOCK TEST'}</span></div><h3>${esc(test.title)}</h3><p>${esc(test.description)}</p><div class="meta">30 QUESTIONS &nbsp; · &nbsp; SINGLE + MULTIPLE ANSWER</div><button class="${i === 0 ? 'primary' : ''}" data-action="start" data-test="${test.id}" data-mode="mock">Start mock test →</button><button class="quiet" data-action="start" data-test="${test.id}" data-mode="study">Study with instant feedback</button></article>`).join('')}</div>
      <p class="status-line">Mock tests are untimed. Answers and the tutor unlock on submission. Study mode includes feedback and hints as you go.</p>
      <div class="practice-row"><section class="practice-box"><span class="eyebrow">TEN QUESTIONS. A FRESH MIX.</span><h3 style="margin-top:9px">A little practice goes a long way.</h3><p>A random selection with feedback after each answer.</p><div class="button-row"><label>Focus area<select id="quick-module"><option value="all">All five modules</option>${modules.map((m, i) => `<option value="${i + 1}">${i + 1}. ${m}</option>`).join('')}</select></label><button class="primary" data-action="quick">Quick practice →</button></div></section><section class="practice-box"><span class="eyebrow">CLOSE THE GAPS</span><h3 style="margin-top:9px">Your personal review queue.</h3><p>Missed answers appear here automatically. Flag anything you want to revisit, even if you got it right.</p><button data-action="review">Review ${queue().length} question${queue().length === 1 ? '' : 's'} →</button> <button class="quiet" data-action="settings">Set up AI tutor</button></section></div>
      ${history.length ? `<section class="history"><div class="section-heading"><h2>Recent sessions</h2><span class="small">Practice scores, not scaled exam scores</span></div>${history.slice(0, 5).map((a, i) => `<div class="history-row"><span>${esc(a.title)}<br><span class="small">${new Date(a.completedAt).toLocaleDateString()} · ${a.mode === 'study' ? 'Study mode' : 'Mock mode'}</span></span><button class="quiet" data-action="history" data-index="${i}">${score(a)} / ${a.ids.length} · ${percent(a)}% ↗</button></div>`).join('')}</section>` : ''}`;
  }
  function question() {
    const q = byId.get(attempt.ids[attempt.index]);
    const revealed = isRevealed(q);
    const disabledAI = attempt.mode === 'mock' && !attempt.submitted;
    root.innerHTML = `<div class="test-header"><div><span class="eyebrow">${attempt.submitted ? 'ANSWER REVIEW' : attempt.mode === 'mock' ? 'MOCK TEST · ANSWERS AT THE END' : 'STUDY MODE · LEARN AS YOU GO'}</span><h1>${esc(attempt.title)}</h1></div><button data-action="${attempt.submitted ? 'results' : 'home'}">${attempt.submitted ? '← Results' : 'Save & exit'}</button></div>
      <div class="test-layout"><article class="question-card"><div class="question-top"><span>QUESTION ${String(attempt.index + 1).padStart(2, '0')} / ${attempt.ids.length} &nbsp; · &nbsp; MODULE ${q.module}</span><button class="flag" data-action="flag" data-id="${q.id}" aria-pressed="${state.flags.includes(q.id)}">${state.flags.includes(q.id) ? '⚑ Flagged' : '⚑ Flag for review'}</button></div><span class="eyebrow">${esc(q.topic)}</span><h2 id="question-prompt" style="margin-top:12px">${esc(q.prompt)}</h2><p class="select-hint" id="select-hint">${q.correct.length > 1 ? `Select ${q.correct.length} answers. All correct choices are required; no partial credit.` : 'Select one answer.'}</p><fieldset aria-labelledby="question-prompt" aria-describedby="select-hint" ${revealed ? 'disabled' : ''}>${q.options.map((option, i) => `<label class="answer ${revealed ? `disabled ${q.correct.includes(i) ? 'correct' : selected(q).includes(i) ? 'incorrect' : ''}` : ''}"><input type="${q.correct.length > 1 ? 'checkbox' : 'radio'}" name="answer" value="${i}" ${selected(q).includes(i) ? 'checked' : ''}><span class="option-letter">${'ABCD'[i]}</span><span>${esc(option)}</span>${revealed && (q.correct.includes(i) || selected(q).includes(i)) ? `<span class="answer-status">${q.correct.includes(i) ? '✓ Correct' : '✕ Yours'}</span>` : ''}</label>`).join('')}</fieldset>
      ${revealed ? feedback(q) : ''}<div class="question-actions"><button data-action="previous" ${attempt.index === 0 ? 'disabled' : ''}>← Previous</button><div class="button-row">${attempt.mode === 'study' && !revealed ? `<button class="primary" data-action="check" ${selected(q).length === q.correct.length ? '' : 'disabled'}>Check answer</button>` : ''}${attempt.index < attempt.ids.length - 1 ? '<button data-action="next">Next →</button>' : `<button class="primary" data-action="${attempt.submitted ? 'results' : 'finish'}">${attempt.submitted ? 'Back to results' : 'Finish session'}</button>`}</div></div></article>
      <aside class="test-side"><section class="navigator"><h3>Your progress</h3><p>${answeredCount(attempt)} of ${attempt.ids.length} answered${!attempt.submitted ? ' · Saved automatically' : ''}</p><div class="progress"><span style="width:${answeredCount(attempt) / attempt.ids.length * 100}%"></span></div><div class="question-grid">${attempt.ids.map((id, i) => `<button data-action="jump" data-index="${i}" class="${i === attempt.index ? 'current' : ''} ${answered(attempt, id) ? 'answered' : ''} ${state.flags.includes(id) ? 'flagged' : ''} ${attempt.submitted && !correct(byId.get(id)) ? 'missed' : ''}" ${i === attempt.index ? 'aria-current="step"' : ''} aria-label="Question ${i + 1}${answered(attempt, id) ? ', answered' : ', incomplete or unanswered'}${state.flags.includes(id) ? ', flagged' : ''}">${i + 1}</button>`).join('')}</div><div class="legend">Green: answered &nbsp; · &nbsp; Gold dot: flagged${attempt.submitted ? '<br>Rose: missed or unanswered' : ''}</div>${!attempt.submitted ? '<button class="primary" data-action="finish">Submit test</button>' : ''}</section>
      <section class="tutor"><div class="tutor-heading"><h3>AI study partner</h3><button class="icon-button" data-action="settings" aria-label="AI tutor settings">⚙</button></div><p>${disabledAI ? 'Keep this attempt independent. The tutor unlocks when you submit.' : 'Think it through together. Grounded in this question’s course excerpt.'}</p>${!disabledAI ? `<div class="button-row"><button data-action="tutor" data-kind="${revealed ? 'explain' : 'hint'}">${revealed ? 'Explain my answer' : 'Give me a hint'}</button></div><label for="tutor-question">${revealed ? 'Ask about this answer' : 'Ask for a nudge'}<textarea id="tutor-question" maxlength="1000" placeholder="${revealed ? 'Why is my choice wrong?' : 'Help me understand the concept…'}"></textarea></label><button data-action="tutor" data-kind="${revealed ? 'explain' : 'hint'}" style="margin-top:10px;font-size:11px">Ask tutor →</button><p class="small" style="margin-top:12px">AI can be wrong. The cited lesson and fixed answer key remain the reference.</p><div id="tutor-output" class="tutor-output" role="status" aria-live="polite"></div>` : ''}</section></aside></div>`;
    if (!disabledAI) {
      const cache = tutor[q.id];
      if (cache) { document.querySelector('#tutor-output').textContent = cache.text; document.querySelector('#tutor-output').classList.toggle('error', cache.error); }
    }
  }
  function results() {
    const missed = attempt.ids.filter(id => !correct(byId.get(id)));
    root.innerHTML = `<span class="eyebrow">SESSION COMPLETE</span><h1>Make the next attempt count.</h1><div class="score-banner"><div class="score-number">${score(attempt)}<small> / ${attempt.ids.length}</small></div><div><h2>${percent(attempt)}% correct</h2><p class="small">${esc(attempt.title)} · ${attempt.mode === 'study' ? 'Study mode (feedback and hints available)' : 'Mock mode'}<br>Exact-match scoring; unanswered questions count as incorrect. This is a practice percentage, not a certification pass prediction.</p><div class="button-row"><button class="primary" data-action="missed" ${missed.length ? '' : 'disabled'}>Practise ${missed.length} missed</button><button data-action="answers">Review all answers</button><button class="quiet" data-action="home">Back to studio</button></div></div></div><div class="module-scores">${modules.map((m, i) => { const qs = attempt.ids.map(id => byId.get(id)).filter(q => q.module === i + 1); return `<div class="module-score">${i + 1}. ${m}<strong>${qs.length ? `${qs.filter(q => correct(q)).length} / ${qs.length}` : '—'}</strong></div>`; }).join('')}</div><div class="section-heading"><h2>${missed.length ? 'Where to focus next' : 'All answers correct'}</h2><span class="small">Select a question for the explanation</span></div><div class="review-list">${(missed.length ? missed : attempt.ids).map(id => { const q = byId.get(id); return `<article class="review-item"><div><span class="eyebrow">MODULE ${q.module} · ${esc(q.topic)}</span><h3>${esc(q.prompt)}</h3><span class="small">${state.flags.includes(id) ? '⚑ Flagged · ' : ''}${correct(q) ? 'Correct' : selected(q).length ? 'Incorrect' : 'Unanswered'}</span></div><button data-action="inspect" data-id="${id}">Review →</button></article>`; }).join('')}</div>`;
  }
  function review() {
    const questions = queue().filter(q => (reviewFilter === 'all' || (reviewFilter === 'flagged' ? state.flags.includes(q.id) : state.outcomes[q.id] === false)) && (reviewModule === 'all' || q.module === Number(reviewModule)));
    root.innerHTML = `<span class="eyebrow">YOUR REVIEW QUEUE</span><h1>A second look.<br>A stronger understanding.</h1><p class="muted">Missed questions stay here until you answer them correctly in practice. Flags stay until you remove them.</p><div class="button-row" style="margin:25px 0"><label>Show<select id="review-filter">${[['all', 'Missed + flagged'], ['missed', 'Missed questions'], ['flagged', 'Flagged questions']].map(([v, l]) => `<option value="${v}" ${reviewFilter === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label><label>Module<select id="review-module"><option value="all">All modules</option>${modules.map((m, i) => `<option value="${i + 1}" ${reviewModule === String(i + 1) ? 'selected' : ''}>${i + 1}. ${m}</option>`).join('')}</select></label><button class="primary" data-action="practice-queue" ${questions.length ? '' : 'disabled'} style="align-self:end">Practise these ${questions.length} →</button></div><div class="review-list">${questions.length ? questions.map(q => `<article class="review-item"><div><span class="eyebrow">${esc(q.topic)} · MODULE ${q.module}</span><h3>${esc(q.prompt)}</h3><span class="small">${state.outcomes[q.id] === false ? 'Missed on last attempt' : 'Flagged for another look'}</span></div><button class="flag" data-action="flag" data-id="${q.id}" aria-pressed="${state.flags.includes(q.id)}">${state.flags.includes(q.id) ? 'Unflag' : 'Flag'}</button></article>`).join('') : '<div class="empty"><h2>A clear page.</h2><p>No questions match these filters. Take a test or flag a question to build your review queue.</p><button data-action="home">Go to practice →</button></div>'}</div>`;
  }
  function render() {
    document.querySelector('#review-count').textContent = queue().length;
    document.querySelectorAll('.rail-link[data-action]').forEach(button => button.classList.toggle('active', button.dataset.action === (screen === 'review' ? 'review' : 'home')));
    ({ home, question, results, review })[screen]();
  }
  function showConnection() {
    const provider = document.querySelector('#provider').value;
    document.querySelector('#connection-status').textContent = config ? `${config.providers[provider].configured ? 'A key is configured on your local server. Leave the key blank to use it.' : 'No local key for this provider. Enter an API key above.'}\n${provider === 'openai' ? 'Use an OpenAI API key; a ChatGPT/Codex subscription is not an API key.' : 'Choose a model available to your provider account.'}` : 'For AI, run: python3 practice_server.py\nThen open http://127.0.0.1:8765/exams.html. Offline tests and explanations still work.';
  }
  function settings() {
    document.querySelector('#provider').value = state.provider;
    document.querySelector('#model').value = state.models[state.provider] || config?.providers[state.provider]?.model || (state.provider === 'openrouter' ? 'anthropic/claude-sonnet-4.6' : '');
    document.querySelector('#api-key').value = credentials[state.provider] || '';
    showConnection(); document.querySelector('#settings').showModal();
  }
  async function askTutor(kind) {
    const q = byId.get(attempt.ids[attempt.index]);
    if (attempt.mode === 'mock' && !attempt.submitted) return;
    if (!config) { settings(); return; }
    if (!credentials[state.provider] && !config.providers[state.provider].configured) { settings(); return; }
    const model = state.models[state.provider] || config.providers[state.provider].model;
    if (!model) { settings(); return; }
    controller?.abort(); controller = new AbortController(); const signal = controller.signal;
    const sequence = ++requestSequence;
    const output = document.querySelector('#tutor-output');
    output.classList.remove('error'); output.textContent = 'Reading the course excerpt…';
    const buttons = [...root.querySelectorAll('[data-action="tutor"]')]; buttons.forEach(b => { b.disabled = true; });
    const requestController = controller;
    const timeout = setTimeout(() => requestController.abort(), 65000);
    try {
      const response = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Practice-Request': '1' }, signal, body: JSON.stringify({ provider: state.provider, model, apiKey: credentials[state.provider] || '', questionId: q.id, selected: selected(q), mode: kind, message: document.querySelector('#tutor-question').value.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The tutor request failed. Try again.');
      if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('The provider returned no explanation. Try another model.');
      if (sequence !== requestSequence) return;
      tutor[q.id] = { text: data.text, error: false }; output.textContent = data.text;
    } catch (error) {
      if (sequence !== requestSequence) return;
      const text = error.name === 'AbortError' ? 'The tutor timed out. Your answer is saved; try again or choose another model.' : error.message;
      tutor[q.id] = { text, error: true }; output.textContent = text; output.classList.add('error');
    } finally { clearTimeout(timeout); if (sequence === requestSequence) buttons.forEach(b => { b.disabled = false; }); }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
    const { action, id } = button.dataset;
    if (action === 'confirm-cancel') { pendingConfirmation = null; document.querySelector('#confirmation').close(); return; }
    if (action === 'confirm-run') { const run = pendingConfirmation; pendingConfirmation = null; document.querySelector('#confirmation').close(); run?.(); return; }
    if (action === 'home' || action === 'review') { move(action); return; }
    if (action === 'settings') { settings(); return; }
    if (action === 'close-settings') { document.querySelector('#settings').close(); return; }
    if (action === 'reset-progress') { confirmAction('Reset all saved test answers, session history, and review flags on this browser?', () => { state = { ...empty(), provider: state.provider, models: state.models }; attempt = null; tutor = {}; persist(); document.querySelector('#settings').close(); move('home'); }); return; }
    if (action === 'forget-key') { credentials = {}; document.querySelector('#api-key').value = ''; document.querySelector('#connection-status').textContent = 'Entered keys cleared from this tab. Server environment keys are unchanged.'; return; }
    if (action === 'start') start(bank.questions.filter(q => q.test === Number(button.dataset.test)).map(q => q.id), button.dataset.mode, `Mock ${button.dataset.test} · ${bank.tests[Number(button.dataset.test) - 1].title}`);
    if (action === 'quick') {
      const module = document.querySelector('#quick-module').value;
      const pool = bank.questions.filter(q => module === 'all' || q.module === Number(module));
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      start(pool.slice(0, 10).map(q => q.id), 'study', 'Quick practice');
    }
    if (action === 'resume') { attempt = state.active; move('question'); }
    if (action === 'flag') { controller?.abort(); requestSequence++; state.flags = state.flags.includes(id) ? state.flags.filter(x => x !== id) : [...state.flags, id]; persist(); render(); }
    if (action === 'practice-queue') start(queue().filter(q => (reviewFilter === 'all' || (reviewFilter === 'flagged' ? state.flags.includes(q.id) : state.outcomes[q.id] === false)) && (reviewModule === 'all' || q.module === Number(reviewModule))).map(q => q.id), 'study', 'Review practice');
    if (action === 'history') { attempt = JSON.parse(JSON.stringify(state.history[Number(button.dataset.index)])); move('results'); }
    if (action === 'check') {
      const q = byId.get(attempt.ids[attempt.index]);
      if (selected(q).length !== q.correct.length || isRevealed(q)) return;
      attempt.checked.push(q.id); state.outcomes[q.id] = correct(q); delete tutor[q.id]; saveAttempt(); move('question');
    }
    if (action === 'previous' || action === 'next' || action === 'jump') { attempt.index = action === 'jump' ? Number(button.dataset.index) : attempt.index + (action === 'next' ? 1 : -1); saveAttempt(); move('question'); }
    if (action === 'finish') finish();
    if (action === 'results') move('results');
    if (action === 'answers' || action === 'inspect') { attempt.index = id ? attempt.ids.indexOf(id) : 0; move('question'); }
    if (action === 'missed') start(attempt.ids.filter(id => !correct(byId.get(id))), 'study', 'Missed-question practice');
    if (action === 'tutor') askTutor(button.dataset.kind);
  });
  root.addEventListener('change', event => {
    if (event.target.name === 'answer') {
      const q = byId.get(attempt.ids[attempt.index]); if (isRevealed(q)) return;
      attempt.answers[q.id] = [...root.querySelectorAll('input[name="answer"]:checked')].map(el => Number(el.value));
      controller?.abort(); requestSequence++; delete tutor[q.id];
      const output = root.querySelector('#tutor-output'); if (output) output.textContent = '';
      root.querySelectorAll('[data-action="tutor"]').forEach(b => { b.disabled = false; });
      saveAttempt();
      const check = root.querySelector('[data-action="check"]'); if (check) check.disabled = selected(q).length !== q.correct.length;
      // Keep native input focus while updating the progress indicators.
      const nav = root.querySelector('.navigator'); nav.querySelector('p').textContent = `${answeredCount(attempt)} of ${attempt.ids.length} answered · Saved automatically`;
      nav.querySelector('.progress span').style.width = `${answeredCount(attempt) / attempt.ids.length * 100}%`;
      nav.querySelector('.current').classList.toggle('answered', answered(attempt, q.id));
      nav.querySelector('.current').setAttribute('aria-label', `Question ${attempt.index + 1}, ${answered(attempt, q.id) ? 'answered' : 'incomplete or unanswered'}${state.flags.includes(q.id) ? ', flagged' : ''}`);
    }
    if (event.target.id === 'review-filter') { reviewFilter = event.target.value; render(); }
    if (event.target.id === 'review-module') { reviewModule = event.target.value; render(); }
  });
  document.querySelector('#provider').addEventListener('change', () => {
    const provider = document.querySelector('#provider').value;
    document.querySelector('#model').value = state.models[provider] || config?.providers[provider]?.model || '';
    document.querySelector('#api-key').value = credentials[provider] || ''; showConnection();
  });
  document.querySelector('#settings-form').addEventListener('submit', event => {
    event.preventDefault(); state.provider = document.querySelector('#provider').value;
    state.models[state.provider] = document.querySelector('#model').value.trim();
    credentials[state.provider] = document.querySelector('#api-key').value.trim();
    persist(); document.querySelector('#api-key').value = ''; document.querySelector('#settings').close();
  });
  render();
  if (location.protocol.startsWith('http')) fetch('/api/config').then(r => r.ok ? r.json() : null).then(data => { if (data?.providers) { config = data; if (document.querySelector('#settings').open) showConnection(); } }).catch(() => {});
})();
