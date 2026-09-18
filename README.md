# Claude Certified Developer — Foundations study workspace

An unofficial study resource for the Claude Certified Developer – Foundations certification (`CCDV-F`). It combines an authenticated course archive, an offline HTML reading library, concise code-first notebooks, flashcards, and the supplied exam guide.

## Start here

- [HTML study library](course%20content%20HTML/index.html) — searchable local reading experience for all 108 course screens
- [Practice studio](course%20content%20HTML/exams.html) — three 30-question mock tests, quick practice, a review queue, and an optional AI tutor; [setup and usage](course%20content%20HTML/README.md#practice-studio)
- [Flashcards](course%20content%20HTML/flashcards.html) — 65 cards covering the detailed exam objectives
- [Exam-guide notes](archive/exam-guide.md) and [source PDF](Developer%20foundations%20example%20guide.pdf)
- [Complete Markdown course archive](course%20extraction/README.md) — 44 ordered sections across five modules

| Module | Archive | HTML | Notebook |
|---|---|---|---|
| 1. MSO Foundations | [Markdown](course%20extraction/01-mso-foundations/README.md) | [Read](course%20content%20HTML/01-mso-foundations/index.html) | [Lab](notebooks/01_mso_foundations.ipynb) |
| 2. Production-Grade Prompting, Agents & Tool Use | [Markdown](course%20extraction/02-production-grade-prompting-agents-tool-use/README.md) | [Read](course%20content%20HTML/02-production-grade-prompting-agents-tool-use/index.html) | [Lab](notebooks/02_production_grade_prompting_agents_tool_use.ipynb) |
| 3. Claude Code, MCP & Integration | [Markdown](course%20extraction/03-claude-code-mcp-integration/README.md) | [Read](course%20content%20HTML/03-claude-code-mcp-integration/index.html) | [Lab](notebooks/03_claude_code_mcp_integration.ipynb) |
| 4. Production Engineering, Evals & Security | [Markdown](course%20extraction/04-production-engineering-evals-security/README.md) | [Read](course%20content%20HTML/04-production-engineering-evals-security/index.html) | [Lab](notebooks/04_production_engineering_evals_security.ipynb) |
| 5. Accelerators & IP Contribution | [Markdown](course%20extraction/05-accelerators-ip-contribution/README.md) | [Read](course%20content%20HTML/05-accelerators-ip-contribution/index.html) | [Lab](notebooks/05_accelerators_ip_contribution.ipynb) |

## Use the notebooks

Offline exercises run without credentials. Optional live API cells share the root [`study_support.py`](study_support.py) loader:

```bash
cp .env.example .env
# Set ANTHROPIC_API_KEY in .env; never commit that file.
jupyter notebook
```

## Regenerate the HTML library

```bash
node "course content HTML/build.mjs"
node "course content HTML/build.mjs" --verify
```

See the [HTML-library notes](course%20content%20HTML/README.md) for its source and generated-file boundaries. Project history is recorded in the [changelog](CHANGELOG.md).

## Content note

This repository is an unofficial study aid and is not an official Anthropic resource. Course material and referenced product names belong to their respective owners.
