# 06 Module Wrap-up

Source: [Authenticated MSO Foundations lesson](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/mso-foundations/486742/scorm/1zuxexjatih0p)

## Screen 6 — Module quiz

**QUIZ MODULE 1 · 5 MIN**

Try it now. Here are some multiple-choice questions to test your understanding of the course so far.

### QUESTION 1

A teammate says two identical prompts must return identical text. What is the most accurate response?

- **A** That is true, the model is deterministic.
- **B** Not necessarily, the model samples each next token from a probability distribution, so wording can vary even when both answers are correct.
- **C** That is only true if streaming is off.
- **D** That is only true on the largest model.

### QUESTION 2

Which statement best separates model choice from reasoning mode?

- **A** They are the same setting.
- **B** Extended thinking is a different model.
- **C** Model choice picks which member of the family runs; extended thinking is a per-call setting that any supporting model can run with on or off.
- **D** Reasoning mode is fixed per account.

### QUESTION 3

A short, well-specified classification task returns the right answer zero-shot. What does adding three examples most likely do?

- **A** Improves accuracy substantially.
- **B** Adds token cost on every call for little or no gain.
- **C** Changes the model being used.
- **D** Disables sampling.

### QUESTION 4

You must process thousands of inputs offline at the lowest cost. Which shape fits?

- **A** Synchronous calls in a loop.
- **B** Streaming.
- **C** Batch submission with polling.
- **D** A larger context window.

**Interactive label:** Submit quiz

**Interactive label:** Skip for now

**Skipped-state detail:** Move on if you need to, but return before the cumulative task.

## Screen 7 — Exercise: predict the behavior

**EXERCISE PREDICT THE BEHAVIOR · 6 MIN**

Try it now. Each scenario below presents a configuration drawn from one of this module’s four foundations, sampling, prompting mode, request shape, and the context budget. For each one, select the answer that predicts the correct behavior and identifies the reason why. Partial credit is available when you answer three of four correctly.

### SCENARIO 1

Consider a classification task run at temperature 0 versus the same task run at a high temperature. Predict how the outputs differ across repeated runs.

- **A** At a low temperature, the model concentrates probability on the most likely tokens, so repeated runs return the same label far more consistently, though never with guaranteed determinism, even at temperature 0. At a high temperature, the distribution spreads out, so wording and even the chosen label can vary. For a classifier you want the low-temperature, repeatable behavior.
- **B** Both configurations return identical output every run, because temperature only affects response length, not which tokens are chosen.
- **C** The high-temperature run is more accurate, because spreading the distribution lets the model consider more of the correct answers.
- **D** Temperature has no effect on a classification task, because classification always returns a fixed label regardless of sampling.

### SCENARIO 2

Consider a task that keeps returning output in the wrong structure under a zero-shot prompt. Predict what changes if you switch to multi-shot.

- **A** Switching to multi-shot retrains the model on the new structure, so the change is permanent across every future call once the examples are sent.
- **B** Adding two or three correct input-output examples shows the model the exact structure to match, which usually fixes a structure problem that more instruction text did not. The cost is extra tokens on every call, so add the fewest examples that make the output reliable.
- **C** Multi-shot will not help a structure problem; only raising the temperature changes the shape of the output.
- **D** Multi-shot lowers the token cost per call, because examples let the model produce shorter responses.

### SCENARIO 3

Consider a pipeline that must process 50,000 documents overnight with no user waiting. Predict which request shape fits and why.

- **A** A synchronous loop fits best, because calling the API once per document is the simplest pattern and avoids the overhead of submitting a batch.
- **B** Streaming fits best, because sending the response in pieces lets the pipeline start processing each document sooner.
- **C** The batch pattern fits: submit the requests in a batch and poll for completion, accepting longer latency for a lower per-token cost. A synchronous loop would hit rate limits and tie up the application, and streaming buys nothing because no user is watching.
- **D** A larger context window fits best, because fitting all 50,000 documents into one request avoids making repeated calls.

### SCENARIO 4

Consider a long multi-turn agent session whose context window keeps filling. Predict the symptoms and name the budget at fault.

- **A** The model silently drops the oldest turns to make room, so the session continues but quietly loses early context without any error.
- **B** The context window is a fixed token budget; as history and tool results accumulate it fills. An input that is already oversized is rejected with an error before generation, while a request that fits on input but reaches the ceiling mid-generation comes back with truncated output and a model_context_window_exceeded stop reason. The symptom is a session that ran fine in testing failing once inputs grow, which is why the application must trim or summarize history.
- **C** The symptom is slower sampling, and the budget at fault is the temperature setting, which must be lowered as the session grows.
- **D** There is no fixed budget; the window expands automatically to hold whatever history accumulates, so a long session never fails for this reason.

**Interactive label:** Submit

**Interactive label:** Skip for now

**Skipped-state detail:** You can come back to this checkpoint any time before the recap using the sidebar.

## Screen 8 — Recap: five takeaways

**RECAP FIVE TAKEAWAYS · 2 MIN**

### 1. Tokens are the unit of input, output, and cost.

Think and budget in tokens rather than words, since that is what the API meters and the context window measures.

### 2. The context window is a fixed token budget that holds the whole request at once.

An oversized input errors before generation, while hitting the ceiling mid-generation returns truncated output with a model_context_window_exceeded stop reason, so managing history is the application's job.

### 3. Sampling makes generation non-deterministic.

The same prompt can return different wording on each run, so testing on exact text is unreliable. This is what evals are built for.

### 4. Model choice and reasoning mode are separate, composable levers.

Pick the smallest model and the simplest reasoning and prompting that meet your eval and add capability only where the eval says you need it.

### 5. A developer reaches Claude over a REST API, usually through an SDK.

Choose between synchronous, streaming, async/await, or batch based on whether a user is waiting and whether the workload is real-time or bulk offline.

**What comes next:** Module 2 puts these foundations to work across prompting craft, tool schemas, streaming, context engineering, and agent construction.

### SOURCES

Claude 101 (Skilljar), Building with the Claude API (Skilljar), AI Fluency: Framework & Foundations (Skilljar), [platform.claude.com/docs](https://platform.claude.com/docs). Verify product specifics at publish time.

### You can now speak the shared vocabulary of the Developer course.

Tokens, context, sampling, model tiers, prompting modes, and the transport mechanics of the API now have names, so the rest of the course can build on them directly.

## Screen 9 — Congrats! You’ve successfully completed this module.

**MODULE COMPLETE DEVELOPER PATH · 2 MIN**

You can now explain tokens, the context window, sampling, and non-determinism, distinguish model choice from reasoning mode, choose the right prompting mode for the job, and describe how a developer reaches Claude over SDKs, REST, streaming, and async patterns. These foundations are the shared vocabulary the rest of the Developer course builds on.

**0 of 2 checkpoints passed**

### M1 — MSO Foundations

Tokens, context, sampling, model tiers, prompting modes, and the technical substrate.

**YOU ARE HERE**

### M2 — Production-Grade Prompting, Agents & Tool-use

Prompting craft, extended thinking, tool schemas, streaming, context engineering, and agent construction.

**UP NEXT**

### M3 — Claude Code, MCP & Integration

Permission modes, durable project context, plugin packaging, and MCP integration without leaking credentials.

### M4 — Production Engineering, Evals, and Security

Evals, tracing, failure handling, cost and orchestration budgets, and security boundaries that hold in production.

### M5 — Accelerators and IP Contribution

Package accelerators, prepare verifiable contributions, choose deployment platforms, and mark trust boundaries.

**Interactive label:** Review module

**Interactive label:** Start over
