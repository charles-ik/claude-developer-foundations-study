# Claude Developer Foundations — study guide & practice studio

## Quick start

1. **Clone this repository or download and extract its ZIP.** Open the resulting folder on your computer.
2. **Start studying immediately:** double-click **`START_HERE.html`**, then click **Open study guide HTML pages** or **Open quiz practice studio**. It opens in your default browser. No VS Code, Python, or API key is needed for offline study.
3. **For the AI-enabled studio:** install Python 3.10+, then double-click **`Open Study Studio.command`** (macOS) or **`Open Study Studio.bat`** (Windows). On Linux, run **`python3 practice_server.py --open`** from the repository folder. Keep the terminal open while studying; add your own key in **AI tutor settings**.
4. **Resume later:** reopen using the same launcher or HTML file, browser profile, and address, then click **Resume session**. Answers and review flags save on your computer automatically.

If an HTML file opens in an editor, right-click it → **Open With** → your browser. Open the downloaded files locally; GitHub displays their source instead of running the app.

## 1. Get your copy

```bash
git clone https://github.com/charles-ik/claude-developer-foundations-study.git
cd claude-developer-foundations-study
```

Alternatively, choose **Code → Download ZIP** on GitHub and extract the entire folder. Keep the files and folders together.

## 2. Open it — no VS Code required

**For offline study, double-click `START_HERE.html` in Finder or File Explorer.** It opens in your default browser and provides two buttons:

- **Open study guide HTML pages** — the searchable course library and flashcards.
- **Open quiz practice studio** — mock tests, quick practice, explanations, and review flags.

No Python, Node.js, API key, or editor is needed for offline study. If HTML files open in an editor, right-click `START_HERE.html`, choose **Open With**, and select Chrome, Edge, Firefox, or Safari. GitHub displays HTML source rather than running the app, so use the files in your downloaded copy.

## 3. Recommended for regular use: the local studio

The local studio provides a consistent address for saved progress and enables the optional AI tutor. Install **Python 3.10 or later** from [python.org](https://www.python.org/downloads/), then use the launcher in the repository folder:

| Computer | Open the studio |
|---|---|
| macOS | Double-click **`Open Study Studio.command`**. |
| Windows | Double-click **`Open Study Studio.bat`**. |
| Linux | Run **`python3 practice_server.py --open`** in the repository folder. |

The launcher starts the server and opens [the practice studio](http://127.0.0.1:8765/exams.html) in your default browser. Use **Course library** in its sidebar to open the lessons. No Python packages are required for the studio.

Keep the terminal window open while studying. Stop the server with **Ctrl+C** when finished. Reopening the launcher reuses an already-running studio at the same address.

You can also start it from a terminal:

```bash
# macOS / Linux
python3 practice_server.py --open

# Windows
py -3 practice_server.py --open
```

To open directly into the reading library, add `--page index.html`. If the browser does not open automatically, visit the address printed in the terminal.

## How practice works

An unofficial study workspace you can clone and use on your own computer. It includes the archived course, 65 flashcards, three 30-question mock tests, quick practice, a review queue, and optional AI explanations grounded in the course material.

- **Mock tests:** 30 questions per set, covering all five modules. Untimed; answers and AI help unlock on submission.
- **Study mode:** get feedback after each question. Checked wrong choices appear in light red, and correct choices in green. Before checking, a selection is neutral.
- **Quick practice:** ten randomly selected questions, optionally focused on one module.
- **Review queue:** missed and unanswered questions are added automatically. Correctly retrying a question clears its missed status. Manual flags stay until you remove them.
- **Scoring:** multiple-answer questions require every correct choice and no incorrect choices. There is no partial credit; unanswered or incomplete questions count as incorrect.
- **Sources:** every question has a fixed answer key, an explanation, an exact course excerpt, and a link to the archived lesson.

These are authored practice questions, not official exam papers. The sets cover the course rather than precisely reproducing the exam’s domain weights. Practice percentages are not certification scaled scores or pass predictions. See the [supplied exam guide](archive/exam-guide.md) for the exam blueprint.

## Saving and resuming

Answers save automatically as you select them. **Save & exit** leaves your unfinished session ready for **Resume session**. The browser also remembers review flags, the latest outcome for each question, and up to 50 completed sessions. Flashcard progress is saved separately.

Progress stays in **browser storage on your own computer**. No account is required and no answers are synced to a cloud service. Reopen with the same browser profile and address each time—prefer the launcher and `http://127.0.0.1:8765/exams.html`.

Switching browsers, using private browsing, changing the port, moving an offline HTML file, or switching between `localhost`, `127.0.0.1`, and offline files does not share the same storage. Clearing browser data removes progress. If browser storage is unavailable, the studio displays a warning. A deliberate reset is available in AI tutor settings and requires confirmation.

## Optional: connect your AI study partner

Run the local studio, open **AI tutor settings**, choose a provider, enter a model ID available to your account, and paste your own API key:

| Provider | Credentials |
|---|---|
| OpenRouter | OpenRouter API key; supports Claude and other models. Default model: `anthropic/claude-sonnet-4.6`. |
| OpenAI | OpenAI API key and a compatible model ID. A ChatGPT or Codex subscription is not an API key. |
| Gemini | Gemini API key and a compatible model ID. |

Keys entered in the UI last only for that tab and are **not saved in browser storage**. To avoid entering a key each time, create a file named `.env` in the repository root with your preferred provider’s settings:

```dotenv
OPENROUTER_API_KEY=your-openrouter-api-key
CLAUDE_MODEL=anthropic/claude-sonnet-4.6

# Optional alternatives:
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=your-openai-model-id
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=your-gemini-model-id
```

`.env` is ignored by Git. Never share that file, commit credentials, or copy someone else’s key. Restart the local server after editing `.env`. **API usage may cost money**, billed by your provider.

The tutor can offer hints before you answer in study mode, explain mistakes afterward, and answer follow-up questions about the current item. Its Markdown is displayed with formatted headings, lists, emphasis, tables, and code. Raw HTML and embedded images are disabled.

A tutor request sends the current question, your selected choices, your current tutor message, and the cited course excerpt to the selected provider. Explanation mode also sends the fixed answer and rationale. Previous tutor messages are not sent. AI may still make mistakes; the fixed answer key and archived source remain the reference. The rest of the study app works without AI.

## Troubleshooting

| Problem | What to do |
|---|---|
| HTML opens in VS Code | Right-click `START_HERE.html` → **Open With** → your browser. |
| macOS launcher will not run | From Terminal in this folder, run `sh "Open Study Studio.command"`, or use the Python command above. |
| Python is missing or too old | Install Python 3.10+; on Windows, enable the installer’s PATH option or use `py -3`. |
| Local page cannot be reached | Start the launcher and keep its terminal open. Read any error shown there. |
| Port 8765 belongs to another program | Stop that program or run `python3 practice_server.py --port 8766 --open`. Use the same port on later visits to retain access to that port’s saved progress. |
| Progress seems missing | Check that you are using the same browser profile, launch method, and exact address. |
| AI rejects the request | Check the provider, model ID, API key, account credits, and network connection. Static explanations remain available. |

## Optional: run the coding notebooks

The five notebooks make real Claude API calls through OpenRouter and require an OpenRouter key. They are separate from the browser app; install their dependencies only if you want to run the labs.

```bash
python3 -m venv .venv
# macOS / Linux:
source .venv/bin/activate
# Windows PowerShell instead:
# .venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt notebook
python -m notebook
```

On Windows, use `py -3 -m venv .venv` for the first command. Add `OPENROUTER_API_KEY` to `.env`, then run the chosen notebook from top to bottom. `study_support.py` loads the shared configuration. API calls may incur charges.

| Module | Course archive | Notebook |
|---|---|---|
| 1. MSO Foundations | [Lessons](course%20extraction/01-mso-foundations/README.md) | [Lab](notebooks/01_mso_foundations.ipynb) |
| 2. Prompting, Agents & Tool Use | [Lessons](course%20extraction/02-production-grade-prompting-agents-tool-use/README.md) | [Lab](notebooks/02_production_grade_prompting_agents_tool_use.ipynb) |
| 3. Claude Code, MCP & Integration | [Lessons](course%20extraction/03-claude-code-mcp-integration/README.md) | [Lab](notebooks/03_claude_code_mcp_integration.ipynb) |
| 4. Production Engineering, Evals & Security | [Lessons](course%20extraction/04-production-engineering-evals-security/README.md) | [Lab](notebooks/04_production_engineering_evals_security.ipynb) |
| 5. Accelerators & IP Contribution | [Lessons](course%20extraction/05-accelerators-ip-contribution/README.md) | [Lab](notebooks/05_accelerators_ip_contribution.ipynb) |

## For contributors

The HTML is already built. Node.js is needed only to regenerate or verify it:

```bash
node "course content HTML/build.mjs" --verify
python3 test_practice.py
node test_practice.mjs
# After installing notebook dependencies:
python test_notebooks.py
```

The [HTML-library notes](course%20content%20HTML/README.md) describe generated files, the question bank, source verification, and local-server checks. Changes are recorded in [CHANGELOG.md](CHANGELOG.md).

This is an unofficial resource, not an Anthropic certification product. Course material and referenced product names belong to their respective owners. Some original course links require an authenticated course account; the locally archived lessons do not.
