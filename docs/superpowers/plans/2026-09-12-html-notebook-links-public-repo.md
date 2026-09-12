# HTML Notebook Links and Public Repository Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Execute these two tasks inline and in order; do not publish until the link gate passes.

**Goal:** Point all notebook-local lesson references at the generated HTML site, verify the complete offline workspace, then publish it as a new public GitHub repository.

**Architecture:** Treat `course extraction/` as the source archive and `course content HTML/` as the notebook-facing reading surface. Rewrite only notebook links, rebuild and verify the HTML site, then create one audited initial Git commit and public remote.

**Tech Stack:** Jupyter JSON, Node.js standard library generator, Python standard library validation, Git, GitHub CLI.

**Spec:** Current user request, with the existing workspace contract documented in `README.md` and `course content HTML/README.md`.

## Global Constraints

- Keep the five notebooks flat under `notebooks/`.
- Local notebook lesson links must target `course content HTML/**/*.html` with an existing anchor; no local Markdown/archive links remain.
- Preserve intentionally separate authenticated external course URLs.
- Never stage `.env`, secrets, caches, temporary files, or notebook outputs containing credentials.
- Publish the complete non-sensitive workspace as a new public repository only after verification passes.

---

### Task 1: Convert and verify notebook lesson links

**Files:**
- Modify: `notebooks/*.ipynb`
- Verify: `course content HTML/build.mjs`

**Interfaces:**
- Consumes: existing Markdown lesson paths/anchors and generated HTML pages.
- Produces: notebook-local `../course%20content%20HTML/<module>/<lesson>.html#<anchor>` links.

- [ ] Inventory every local link in notebook Markdown cells and link-bearing code/data.
- [ ] Map each lesson Markdown target to the same module/file/anchor in generated HTML and fail if the target or `id` is absent.
- [ ] Apply the minimal JSON link substitutions; preserve external Skilljar links.
- [ ] Run `node "course content HTML/build.mjs" --verify`.
- [ ] Parse all notebooks, confirm no forbidden local paths remain, validate every HTML anchor, and execute all offline cells.

### Task 2: Audit, initialize, and publish

**Files:**
- Modify: `README.md`, `.gitignore`
- Create: `.git/` and the GitHub repository.

**Interfaces:**
- Consumes: the verified workspace from Task 1.
- Produces: one public GitHub repository with a single initial commit.

- [ ] Update the root README with the project purpose, archive/HTML/notebook/flashcard/exam-guide navigation, API-key setup, HTML build commands, and an unofficial-study-aid ownership note; validate every relative link.
- [ ] Expand `.gitignore` only for discovered generated/cache files.
- [ ] Initialize Git on its normal default branch and inspect every staged path plus staged secret scan.
- [ ] Create one initial commit with message `Initial Claude Developer Foundations study workspace`.
- [ ] Confirm `gh auth status`; if authenticated, create `claude-developer-foundations-study` as public and push the current branch.
- [ ] Verify the remote URL and public visibility; otherwise report only the minimum authentication action required.

## Self-review

- [ ] Both tasks cover every user requirement in sequence.
- [ ] No placeholders or speculative files/dependencies are introduced.
- [ ] Publishing is blocked unless link, build, notebook, staging, and secret checks pass.
