# Claude Certification Study Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Archive the authorized Developer Foundations course locally and provide one concise runnable notebook per course module.

**Architecture:** Mirror five numbered module folders under `course extraction/` and `notebooks/`; each archive module has an index plus one Markdown file per navigation section. All notebooks use the dependency-free root `study_support.py` helper and the single root `.env`.

**Tech Stack:** Markdown, Jupyter Notebook JSON, Python standard library

**Spec:** `Developer foundations example guide.pdf`

## Global Constraints

- Preserve source attribution and never invent unavailable course text.
- Never store an API key outside the ignored root `.env`.
- Prefer standard-library examples and one lightweight verification script.

---

### Task 1: Archive the exam blueprint and public course index

**Files:**
- Create: `archive/exam-guide.md`
- Create: `course extraction/README.md`
- Create: five numbered module folders with `README.md` indexes and one Markdown file per navigation section

**Interfaces:**
- Consumes: the local exam-guide PDF and the five public Skilljar module pages
- Produces: source-grounded objectives used by the notebooks

- [ ] **Step 1: Transcribe the weighted blueprint and module objectives**

```text
Record exact domain and skill weights; label authenticated lesson bodies pending until accessible.
```

- [ ] **Step 2: Check attribution and status markers**

```bash
rg -n "Source|Status|Weight" archive 'course extraction'
```

### Task 2: Add the shared notebook runtime

**Files:**
- Create: `.env.example`
- Create: `.gitignore`
- Create: `study_support.py`

**Interfaces:**
- Produces: `load_anthropic_api_key() -> str` and `messages_create(payload: dict) -> dict`

- [ ] **Step 1: Verify missing-key behavior**

```bash
env -u ANTHROPIC_API_KEY python3 -c 'import study_support; study_support.load_anthropic_api_key()'
```

Expected: a clear `RuntimeError` naming `.env.example`, `.env`, and `ANTHROPIC_API_KEY`.

### Task 3: Build one practical notebook per module

**Files:**
- Create: one notebook inside each matching numbered module folder under `notebooks/`

**Interfaces:**
- Consumes: public objectives, exam blueprint, and `study_support.py`
- Produces: five notebooks whose offline exercises execute without network access

- [ ] **Step 1: Add terse explanation, experiment, exercise, and self-check cells**

```python
from study_support import load_anthropic_api_key
assert callable(load_anthropic_api_key)
```

- [ ] **Step 2: Parse and execute offline cells**

```bash
jupyter nbconvert --to notebook --execute --inplace notebooks/*/*.ipynb
```

### Task 4: Complete the authenticated archive

**Files:**
- Modify: `course extraction/*/*.md`
- Modify: `notebooks/*/*.ipynb` only where authenticated lessons add source-backed material

**Interfaces:**
- Consumes: the user-authorized, signed-in Skilljar lesson pages
- Produces: complete lesson Markdown preserving headings, code, links, and attribution

- [ ] **Step 1: Export each authenticated lesson**

```text
After the user completes Partner SSO in the visible in-app browser, enumerate lessons and archive each page under its module heading.
```

- [ ] **Step 2: Verify completeness against the Skilljar lesson index**

```bash
rg -n "authenticated lessons pending" 'course extraction'
```

Expected after completion: no matches.
