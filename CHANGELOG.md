# Changelog

## Unreleased

### Added

- A double-click start page, macOS/Windows studio launchers, default-browser opening, and clone-to-study instructions with local progress guidance.

- Source-backed practice studio with 90 questions across three mock tests, quick practice, saved sessions, missed-question review, and an optional local OpenRouter/OpenAI/Gemini tutor.

- Complete course archive, generated HTML library, flashcards, exam-guide notes, and five executable study notebooks.

### Changed

- README now starts with explicit download, double-click startup, AI launcher, and resume instructions.
- Notebook lesson links now open the corresponding local HTML page and exact heading.
- All five notebooks now require one centrally configured OpenRouter API key, call Claude through the Anthropic SDK, and interleave shorter runnable snippets with certification-grounded explanations.

### Fixed

- Checked incorrect answers now retain their light-red feedback colour instead of being overridden by the selection highlight.
- AI tutor responses render safe Markdown, including cached responses, with headings, lists, tables, emphasis, and code.
