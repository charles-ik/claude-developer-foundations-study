# Key Takeaways

> Agent-authored source note: Transcribed from authenticated course screens [S19](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/2gf8jaub9q0dj/Developer_M4_vF2.html#S19) and [S19B](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/2gf8jaub9q0dj/Developer_M4_vF2.html#S19B). The course text below is verbatim; only Markdown formatting and whitespace were adapted.

## Course text (verbatim)

## Key takeaways

*Recap · Module 4 · 3 min*

1

#### Set the standard before you build it.

An eval turns "done" from a feeling into a score on a fixed set of cases. The grading method must match the output: exact match when there is one correct form, a code check for structured output, and a judge for open-ended quality, which you calibrate against human-labelled cases before you trust it. You write the eval first because identifying the expected behavior forces you to define success while the design can still change.

2

#### Match the test to the failure, and trace so you know where it happened.

Unit, functional, integration, and end-to-end tests each catch a different break, and most silent failures hide at the integration seam where two passing components hand off. A trace shows which step produced the bad result, which turns a day of investigation into a short fix. The same instinct drives the retrieval choice: fetch once for single-fact lookups, search across iterations when the question is genuinely multi-step.

3

#### Sort every failure, then handle them individually.

The first question for any failure is whether waiting and retrying could resolve the issue. Retriable failures get exponential backoff, with a cap and a retry budget, never an immediate loop that only deepens the problem. Tool failures come back to the model with the error flag set, not hidden behind an empty result that the model mistakes for data. Every failure a retry cannot fix requires a named fallback. Otherwise, an unhandled exception becomes the default behavior, which is how one bad response takes down the whole flow.

4

#### Measure cost and latency per call, and fan out only when a task truly splits.

You cannot budget what you do not measure, so instrument token cost, latency, and error rate on every call. Then tune a chosen lever instead of guessing from the invoice. An orchestrator-worker pattern multiplies token cost by the number of subagents, roughly fifteen times in Anthropic's reported case. It earns that cost only on tasks that split into independent parallel parts, not on tightly coupled work that a single agent can handle for a fraction of the cost.

5

#### Treat fetched content as data and enforce the boundary with a hook.

A model reads everything in its context together, as one stream of tokens with no built-in line between trusted instructions and untrusted data. An instruction hidden in fetched content can influence the agent's behavior. Trusting your own users does not help, because the injection arrives through the content the agent reads. Examine untrusted input as data, scope the agent's identity to least privilege, keep secrets out of committed config, and enforce the action boundary with a hook that blocks and logs before the tool runs. That boundary is what a regulated review can control and inspect.

**What comes next**

The next module turns the production-ready systems you can now build into reusable accelerators and contributed intellectual property. It covers how to package a working build as a parameterized template, MCP server, or portable eval suite, contribute it back through a channel a maintainer accepts, and then choose, version-pin, and defend where it runs across the first-party API, Amazon Bedrock, and Google Vertex AI so a model change or a residency review does not break production. The next module covers the deployment platform specifics this module set aside.

### Anthropic public references (time-sensitive)

| ID | Source | Type | Used for |
|---|---|---|---|
| S1 | [https://platform.claude.com/docs](https://platform.claude.com/docs) | Product documentation | Eval tooling and grading methods, test levels, API error and status codes, retry and backoff guidance, tool-result error flag, observability and prompt caching, IAM and prompt-injection defenses. |
| S2 | [code.claude.com](https://code.claude.com/) | Product documentation | Claude Code hook lifecycle events (PreToolUse) and guardrail patterns. |
| S3 | [anthropic.com](https://anthropic.com/) and Anthropic multi-agent research writing | Engineering and research writing | Orchestrator-worker pattern and its roughly 15x token cost, agentic search versus RAG and the Claude Code retrieval finding, prompt-injection defenses. |
| S4 | Building with the Claude API (Skilljar) | Anthropic course | Eval pipeline, code and model graders, RAG and retrieval mechanics, workflow patterns, prompt caching. Stable conceptual material only. |
| S5 | Claude Code 101 In Action (Skilljar) | Anthropic course | Claude Code hooks and configuration carried from the prior module. |

### You can now prove a Claude feature holds under production traffic.

Evals, tests and traces, failure handling, cost and orchestration discipline, and a security boundary; each layer closes one way development hides what production reveals.

## Key terms from this module

*Glossary · Key Terms · 3 min*

Alphabetical. Click a term to expand its definition.

### Agentic search

Letting the model issue its own queries, read the results, and refine across several rounds instead of fetching a fixed set of context once. It handles multi-step questions and changing corpora at higher token and latency cost and avoids the staleness and infrastructure of a maintained index.

### Eval

A set of input cases, expected behaviors, and grades that defines what a feature must do before it ships. Running an eval produces a score on a holdout set, which turns "done" from a judgment call into a number you can track as you change the prompt, tools, or model.

### Exponential backoff

A retry strategy that waits a growing interval between attempts, up to a cap and a fixed number of tries, often with random jitter. It prevents immediate retries from deepening a rate limit, and it honors a retry-after value when the response provides one.

### Hook-based guardrail

A check that runs at a fixed point in the Claude Code agent lifecycle, such as PreToolUse before a tool call, and can block an action and log it. Unlike a prompt instruction, a hook is an enforced control that runs before the protected action, which is the distinction a regulated review cares about.

### Integration test

A test that exercises the seam where two components hand off, such as retrieval output passed into a model call. It catches the silent failures that unit and functional tests miss, because each component can pass alone while the handoff between them is wrong.

### LLM-as-judge

A grading method that uses a second model call with a rubric to score open-ended outputs that no code rule can check. It returns a score with reasoning, and it is only trustworthy after you calibrate it against human-labeled cases and measure agreement.

### Orchestrator-worker pattern

A multi-agent shape where a lead agent plans a task, spawns subagents that work in parallel each with its own context and compiles their results. It helps on broad tasks that split into independent parts, at roughly fifteen times the token cost of a single chat in Anthropic's reported case.

### Prompt injection

An attack where instructions hidden inside content the agent fetches are treated as commands, because the model reads its whole context as one stream with no built-in boundary between trusted instructions and untrusted data. The defense is to treat fetched content as data and enforce the action boundary outside the prompt.

### Retriable versus terminal error

The first distinction for any production failure. A retriable error, such as a rate limit or overload, is likely to succeed on a later attempt and gets backoff. A terminal error, such as a bad request, will fail again identically and should fail fast instead of wasting the retry budget.
