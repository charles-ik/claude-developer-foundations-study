# Course Content HTML

Open [`index.html`](index.html) to start the local study library. It works from the filesystem without a server.

Regenerate the pages after changing the authoritative archive or the separate flashcard dataset:

```bash
node "course content HTML/build.mjs"
node "course content HTML/build.mjs" --verify
```

The generator reads `course extraction/` and `archive/exam-guide.md` without modifying them. Flashcards are supplied through `data/flashcards.json`; the generated `assets/flashcards-data.js` keeps the local-file experience server-free and covers all 27 detailed exam objectives. Diagrams include their Mermaid source and a build-time SVG rendering, so no network runtime is required.
