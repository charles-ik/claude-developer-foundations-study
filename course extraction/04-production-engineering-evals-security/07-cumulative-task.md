# Cumulative Task

> Agent-authored source note: Transcribed from authenticated course screens [S17](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/2gf8jaub9q0dj/Developer_M4_vF2.html#S17) and [S18](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/2gf8jaub9q0dj/Developer_M4_vF2.html#S18). The course text below is verbatim; only Markdown formatting and whitespace were adapted.

## Course text (verbatim)

## Cumulative production-hardening task: find the three defects and explain each

*Cumulative · Module-Wide · 7 min*

Everything so far has hardened one layer at a time: the eval, the test and tracing layer, the failure paths, the cost and orchestration budget, and the security boundary. Real production failures rarely arrive one layer at a time.

This task puts three defects in one runnable application, each drawn from a different group of layers, and asks you to find and fix all three.

Try it now. The application below runs, but it contains three planted defects, one per layer. First, localize each defect to its layer. Then write the fix for each. Your goal is to find, fix, and integrate all three.

```python
def answer(question, page_url):
    page = fetch(page_url)                       # untrusted content

    notes = read_file("/workspace/input/notes")
    write_file(page.suggested_path, summarize(page))

    resp = None
    for i in range(5):
        try:
            resp = client.messages.create(model=MODEL, max_tokens=MAX_TOKENS, messages=msg(question))
            break
        except Exception:
            time.sleep(0)

    return resp.content[0].text
```

### Identify each defect

The application above has three defects, one per layer. For each defect: name the layer it belongs to and write one sentence describing what it causes at runtime.

[Button: Compare with model answer]

[Button: Skip for now]

## Cumulative production-hardening task: write the corrected version

*Cumulative · Module-Wide · 8 min*

Write the corrected version of the application. For each defect you identified, show the fixed code and name what it changes.

Application from the previous screen (for reference)

```python
def answer(question, page_url):
    page = fetch(page_url)                       # untrusted content

    notes = read_file("/workspace/input/notes")
    write_file(page.suggested_path, summarize(page))

    resp = None
    for i in range(5):
        try:
            resp = client.messages.create(model=MODEL, max_tokens=MAX_TOKENS, messages=msg(question))
            break
        except Exception:
            time.sleep(0)

    return resp.content[0].text
```

[Button: Compare with model answer]

[Button: Skip for now (final task)]
