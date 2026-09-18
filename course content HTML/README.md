# Course Content HTML

Open [`index.html`](index.html) to start the local study library. It works from the filesystem without a server.

Regenerate the pages after changing the authoritative archive or the separate flashcard dataset:

```bash
node "course content HTML/build.mjs"
node "course content HTML/build.mjs" --verify
```

The generator reads `course extraction/` and `archive/exam-guide.md` without modifying them. Flashcards are supplied through `data/flashcards.json`; the generated `assets/flashcards-data.js` keeps the local-file experience server-free and covers all 27 detailed exam objectives. Diagrams include their Mermaid source and a build-time SVG rendering, so no network runtime is required.

## Practice studio

Open [`exams.html`](exams.html) for three authored 30-question mock tests, or a random 10-question practice round. Each full set covers all five course modules and includes single-answer and multiple-answer questions. These are unofficial study aids built from the archive, not official exam questions, exact blueprint-weighted papers, or a prediction of the certification’s scaled score.

- **Mock mode:** untimed, with answers and AI help held until submission. All correct choices must match; there is no partial credit. Incomplete or unanswered questions count as incorrect.
- **Study mode:** check each answer immediately, read its explanation and supporting course excerpt, or ask for an AI hint before answering.
- **Review:** incorrect and unanswered items enter the queue automatically. A correct practice answer clears the missed status. Manual flags remain until you remove them. Filter the queue by module or status and practise the filtered set.
- **Progress:** one unfinished session, the latest outcome per question, flags, and the most recent 50 completed sessions are stored in this browser. Save & exit, then resume later. Storage is specific to the browser and URL origin; `localhost`, `127.0.0.1`, different ports, and file URLs do not share progress. Settings include a confirmed reset. Browser-entered API keys are never included in progress storage.

### Run with the AI tutor

From the repository root, using Python 3.10 or later (standard library only):

```bash
python3 practice_server.py
```

Open [the local practice studio](http://127.0.0.1:8765/exams.html). Use `--port 8766` if the default port is occupied. Keep the server running while studying with AI; stop it with Ctrl+C.

The server reads the existing root `.env` without overwriting process environment variables. Your configured `OPENROUTER_API_KEY` works automatically with the default `anthropic/claude-sonnet-4.6` model; `CLAUDE_MODEL` overrides it. In AI tutor settings, choose a provider and enter a model ID available to that account. OpenAI and Gemini require an explicit model ID. You may supply a key for the current tab or configure it locally:

```dotenv
OPENROUTER_API_KEY=your-openrouter-key
CLAUDE_MODEL=anthropic/claude-sonnet-4.6
# Optional direct providers; set a model available to your account:
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=your-openai-model-id
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=your-gemini-model-id
```

Do not commit `.env`. An OpenAI API key is required for the OpenAI provider; ChatGPT/Codex account credentials are not API keys. Each tutor request may incur provider charges. Requests use the documented [OpenRouter chat API](https://openrouter.ai/docs/quickstart), [OpenAI chat API](https://developers.openai.com/api/reference/resources/chat), and [Gemini OpenAI-compatible API](https://ai.google.dev/gemini-api/docs/openai).

The tutor receives the current question, selected choices, the student's current request, and the exact cited course excerpt. Explanation mode also supplies the fixed answer key and rationale. Hint mode omits the answer key and asks for a conceptual nudge. Each request is independent; previous tutor messages are not sent. AI text is displayed as text, never executed or used to change scoring. Models can still make mistakes or reveal more than requested; the archived excerpt and fixed key remain the reference. Unrelated queries should be identified as unsupported by the supplied excerpt.

The server binds only to `127.0.0.1`, serves the HTML-library directory, rejects cross-origin tutor requests, allows only the three fixed provider endpoints, and does not forward keys across redirects. Keys supplied in the UI remain only in tab memory; server keys stay on the server. Forget entered keys does not unset server environment keys. There is no cloud account, shared database, or hosted proxy. This server is for local personal use.

### Question sources and maintenance

`data/exams.json` is the editable question bank. Each question records its correct choice indexes, authored explanation, module, topic, source Markdown path, heading anchor, and verbatim supporting excerpt. `assets/exams-data.js` is generated for offline use; do not edit it by hand. `exams.html`, `assets/exams.js`, and `assets/exams.css` are maintained directly. The existing library generator adds practice navigation and verifies every stored excerpt against the source Markdown and every citation against the generated HTML heading. It fails if the archive drifts from those citations. These checks establish traceability; question wording and answer correctness still require editorial review against the excerpt.

```bash
node "course content HTML/build.mjs" --verify
python3 test_practice.py
node test_practice.mjs
# Optional: check routes of a running local server without calling an AI provider.
python3 test_practice.py --http
```

Checks cover all 90 answer keys, the three complete mixed-format sets, source links, exact scoring, saved-session restoration, mock answer isolation, locked study feedback, review retries, corrupt storage recovery, provider request formats, and request validation. The local-file experience supports the tests and static explanations without a server; AI requires `practice_server.py`.
