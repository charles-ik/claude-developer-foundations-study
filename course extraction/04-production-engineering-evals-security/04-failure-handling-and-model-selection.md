# Failure Handling & Model Selection

> Agent-authored source note: Transcribed from authenticated course screens [S08](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/2gf8jaub9q0dj/Developer_M4_vF2.html#S08), [S09](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/2gf8jaub9q0dj/Developer_M4_vF2.html#S09), [S10](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/2gf8jaub9q0dj/Developer_M4_vF2.html#S10), [S10A](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/2gf8jaub9q0dj/Developer_M4_vF2.html#S10A), and [S10B](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/2gf8jaub9q0dj/Developer_M4_vF2.html#S10B). The course text below is verbatim; only Markdown formatting and whitespace were adapted.

## Course text (verbatim)

## Surviving production failure: tool errors

*Teaching · Failure Handling · 12 min*

Your tests now tell you a failure exists and the trace tells you where it happens. The next question is what the system does the moment a failure happens in live traffic.

Production introduces failures a prototype never sees. The difference between a resilient system and a fragile one is whether you decided in advance how each kind of failure is handled.

### Every failure starts with one question: is it retriable or terminal?

The test is a single question: would waiting and trying the exact same request again plausibly work? If yes, it is retriable. If not, it is terminal. A rate limit clears with time; a malformed request will fail identically until the request itself is fixed.

Production traffic produces failures development never shows you: rate-limit responses, timeouts, malformed tool results, and transient network errors. The first decision for any failure is whether a later attempt is likely to succeed. If so, the failure is retriable. If not, retrying only wastes time and budget, making it terminal. A rate-limit response or a temporary server overload is retriable, because the same request will probably go through in a moment. A malformed request or an authentication failure is terminal, because retrying the identical bad request changes nothing. Every subsequent handling decision depends on which bucket a failure lands in. On the Anthropic API, the status code tells you the bucket. A 429 means you hit a rate limit and a 529 means the service is temporarily overloaded, both are retriable. A 400 means a bad request and a 401 means an auth failure, both are terminal. Server errors in the 5xx range, including a 500 internal error and a 504 timeout, are also retriable, because they are Anthropic-side faults that typically resolve on retry.

```python
RETRIABLE = {429, 529, 500, 502, 503, 504}   # rate limit, overload, transient
TERMINAL  = {400, 401, 403, 404}             # bad request, auth, missing

def is_retriable(status):
    return status in RETRIABLE   # everything else fails fast
```

The reason this one distinction carries so much weight is that it determines whether waiting helps. A retriable error is one where the cause is transient: the service was momentarily over capacity, a connection dropped, or you briefly exceeded a per-minute limit. Time alone resolves it, so a later attempt is likely to succeed. A terminal error is one where the cause is in the request itself: a malformed body, an expired key, a model name that does not exist. Time changes nothing, because each request will produce an identical error. Retrying a terminal error wastes the retry budget and hides the actual problem behind a wall of identical failures. Each unnecessary retry consumes retry budget and increases the latency that a retriable failure elsewhere in the flow might have needed. Correct classification preserves the retry budget for failures that need it.

A few statuses sit on the line and are worth calling out. A timeout is usually retriable because the work may simply have taken longer than the client was willing to wait. Repeated timeouts on expensive requests is a signal to fix the request itself, not to retry it. A 500 from the service is retriable, because it is a server-side fault that often clears. A 403 is terminal, because it is a permissions problem that a retry cannot fix. When you are unsure, the safe default is to treat an error as terminal and raise it. A failure incorrectly classified as terminal fails loudly and gets fixed. A failure incorrectly classified as retriable hammers a service and hides the real problem behind a wall of retries.

### The SDK already retries some failures, so know what it covers before you write your own

Before you build a retry loop by hand, check what the SDK does for you. The Anthropic client libraries automatically retry transient failures with progressive retry delays, up to a configurable number of attempts. The point of knowing this is to avoid adding your own retries on top of the ones the SDK is already running. Two retry loops wrapped around the same call multiply attempts against a rate limit rather than capping them. Decide where the retry lives: either let the SDK handle transient cases and reserve your own code for application-specific fallbacks, or turn the SDK retries down and own the full path yourself. Running both layers retrying the same failure without either knowing about the other is the pattern to avoid.

The API also returns rate-limit headers on each response that tell you how much of your limit remains and when it resets. The most useful is retry-after, which a 429 or 529 response includes to tell you how long to wait before trying again. Honoring that value is more precise than guessing with backoff alone, because the service is telling you exactly when capacity returns. The corrected retry code later in this module reads retry-after first and falls back to exponential backoff only when the header is absent. Treat the header as the authoritative wait time when it is present, and treat your own backoff as the fallback when it is not. The specific header names and limit values are version-pinned, so confirm them against the reference layer at build time.

### Tool errors must come back to Claude explicitly rather than dropped

When your code runs a tool and that tool fails, the result should be returned to Claude with is_error explicitly set to true. It should not return as a silent empty result. With the error returned, the model can react: try a different approach, ask for clarification, or stop. A tool that drops its own error and returns nothing produces a confident yet wrong answer downstream. This is because the model treats the empty result as valid data and continues reasoning on top of it. A visible failure is far easier to catch than a confident but incorrect answer built on missing data.

```python
def run_tool(tool_use):
    try:
        result = execute(tool_use)
        return {"type": "tool_result", "tool_use_id": tool_use.id,
                "content": result}
    except Exception as e:
        # surface the error so Claude can react, do NOT return empty
        return {"type": "tool_result", "tool_use_id": tool_use.id,
                "is_error": True, "content": f"Tool failed: {e}"}

def run_tool(tool_use):
# A refusal is a 200 at the HTTP layer, the retriable classifier will not catch it
if response.stop_reason == "refusal":
    raise ValueError("Model refused the request. Review input before retrying.")
```

With is_error set, the model knows the tool failed and can react. Without it, the model treats the empty result as valid data and continues on a false premise.

### The error-handling decision table you can keep open while you build

| Error type | Retriable or fail-fast | Backoff strategy | Fallback behavior |
|---|---|---|---|
| Rate limit (429) | Retriable | Exponential backoff with jitter, honor retry-after, capped attempts. | After the cap, raise a clean error or route to a cached or simpler result. |
| Overloaded (529) | Retriable | Backoff; a 529 reflects Anthropic-side load, so it is not a rate-limit signal. | Fail over to a fallback path or return a graceful error if it persists. |
| Bad request (400) | Fail fast | No retry. The identical request will fail again. | Fix or reject the input and surface the error to the caller. |
| Tool result error | Depends on the tool | Retry only if the underlying cause is transient. | Return the error flag to Claude so the model can react, never silence it. |
| Refusal (200, stop_reason: "refusal") | Fail fast | No retry. The model made a content decision, not a transient error. | Raise the refusal to the caller. Log it. Do not silently retry or treat it as valid output. |

**Handles well**

Keeps one bad response from cascading into an outage by handling each failure type by name.

**Adds cost or complexity**

Every failure path is code you write, test, and maintain on top of the happy path.

**Use a different approach**

Do not retry a terminal error. Retrying a 400 does nothing but waste the retry budget.

## The call that never failed in development

*Watch Out · Failure Handling · 6 min*

**Setup**

In development, you called the endpoint a few dozen times and it returned cleanly every time, so there was no obvious reason to write an error path. That is the trap. Development traffic is low volume, runs on a stable connection, and rarely hits the conditions that cause a call to fail: rate limits, timeouts, transient network drops, or a malformed response underload. None of those show up when you are testing by hand, so the code that handles them never gets written. The first time the call fails is in production, and the failure appears as an unhandled exception rather than a recoverable error.

### Anecdote: the first rate-limit response took the whole request down

A developer building a customer-facing feature called the API in a loop. Every development run returned successfully because development traffic never came close to a rate limit. The code was written without any error handling, because up until now, nothing had ever failed there.

```python
results = []                      # collect each response

for item in batch:
# shipped version, no error path
    resp = client.messages.create(model=MODEL, max_tokens=MAX_TOKENS, messages=msg(item))
    results.append(resp.content)    # assumes every call returns 200
```

The feature shipped. At the first traffic peak the API returned a rate-limit response, the unhandled error was raised and the whole request failed instead of waiting a moment and trying again. To the user it looked like the feature was simply broken. The developer's first instinct was to add immediate retries in a tight loop. This made it worse: each instant retry counted as another request against the same limit, deepening it. The real fix was the distinction from the teaching screen. The rate-limit response was retriable, so it needed exponential backoff with a capped number of attempts and a retry that honored the retry-after value when the response included one. Development never produced the failure, so the path that would know how to handle one was never written.

**Why this broke**

A retriable failure met code that had no error path, then met a hammering retry that deepened the limit. Sort the error as retriable, then back off with a cap, before traffic finds the gap for you.

## Repair the broken error and retry path

*Checkpoint · Failure Handling · 8 min*

The block below has one defect. Identify it and write the corrected version.

Broken code shown to the learner

```python
def call_with_retry(make_call, max_attempts=5):
    for attempt in range(max_attempts):
        try:
            return make_call()
        except Exception:
            time.sleep(0)
    raise RetryBudgetExhausted()
```

[Button: Compare with model answer]

[Button: Skip for now]

## Model selection in production

*Teaching · Model Selection · 10 min*

The previous screens kept a system inside its cost budget once the model was chosen. This screen handles the choice that sets that budget in the first place: which Claude model runs the workload.

Cost management optimizes spend within a model. Model selection determines the baseline that optimization works from.

### The model family and its capability tiers

Claude is a family of models that trade cost, latency, and capability against each other: Fable is the most capable for the most demanding reasoning, coding, and agentic work; Opus handles demanding work above the Sonnet envelope; Sonnet is the balanced default for most production workloads; Haiku is built for speed and cost efficiency on tasks that fit its envelope. The same prompt runs on any of them, so model choice is a lever you set per workload and can change without rewriting the application. Confirm the current lineup and model IDs against platform.claude.com at build time.

### The latency, cost, and quality trade-off

Upgrading model tier trades quality at the price of higher per-token cost and usually higher latency. Downgrading the model tier buys speed and lower cost at the risk of a quality drop. A higher-tier model can also process a request faster and cheaper if it reaches a conclusion in fewer tokens than a lower-tier model would. The cost of a mistake belongs in that calculation: saving a few dollars a day on a lower-tier model is not a sound trade if the quality drop introduces errors that carry significant downstream cost. There is no globally correct choice, only the right choice for a task at a quality standard. The discipline is to make the trade-off measurable rather than reaching for the most capable model by default. This is the most common and most expensive model-selection mistake in production. The default is to start with Sonnet, move up to Opus only when an eval shows Sonnet missing the quality bar, and move down to Haiku only when an eval shows the quality drop is acceptable for the task.

### Routing: a default model plus an override on a task signal

A system does not have to use one model for everything. A common production pattern is a default model with an override: route the bulk of traffic to a balanced default, and send specific request types to a larger or smaller model based on a cheap signal read from the request, such as task type, input length, or a difficulty classification. This is the same routing idea used for retrieval, applied to model choice: you pay for the more capable model only on the requests that need it. Where every request is the same shape, skip the router and pin one model.

### When to step up and when to step down

Step up a tier when an eval shows the current model failing on the hardest cases your traffic contains and the cost of a wrong answer is high. Step down a tier when an eval shows a cheaper model holding the quality bar on the bulk of traffic, freeing budget and latency. In both directions the eval is the instrument: a model change is promoted on a measured score against your cases. This is why the eval you built earlier is also the gate for a model decision.

**Handles well**

Matching each workload to the cheapest model that meets its quality bar, measured on an eval rather than assumed.

**Adds cost or complexity**

Routing adds a classification step and a second model path to maintain.

**Use a different approach**

For uniform traffic at one quality bar, pin a single model and skip the router.

## Choose the model and name the deciding constraint

*Checkpoint · Model Selection · 2 min*

**For each scenario, pick the model tier (Opus, Sonnet, or Haiku) and identify the one constraint that drives the decision.**

**Scenario 1.** A high-volume classification step labels millions of short messages per day; an eval shows Haiku holding the quality bar. Which choice is best?

A

Opus, the deciding constraint is reasoning depth on ambiguous messages

B

Sonnet, the deciding constraint is balancing quality and speed across volume

C

Haiku, the deciding constraint is cost-at-volume, since the eval confirms the quality bar still holds

D

Opus, the deciding constraint is consistency across millions of requests

**Scenario 2.** A multi-step agent plans a dependent refactor where a wrong early step is expensive; an eval shows Sonnet missing the bar on the hardest cases. Which choice is best?

A

Sonnet, the deciding constraint is cost efficiency on a long agent run

B

Opus, the deciding constraint is quality on hard reasoning where the cost of a wrong answer is high

C

Haiku, the deciding constraint is speed across many sequential steps

D

Sonnet, the deciding constraint is latency on dependent steps

**Scenario 3.** Mixed traffic: most requests are simple lookups, a few are complex synthesis. Which approach is best?

A

Opus for everything, the deciding constraint is guaranteeing quality on the complex requests

B

Haiku for everything, the deciding constraint is minimizing cost across all traffic

C

Sonnet for everything, the deciding constraint is a single balanced model for mixed needs

D

Route: a Sonnet (or Haiku) default with an Opus override on the complex requests, the deciding constraint is that traffic is mixed

[Button: Submit]

[Button: Skip for now]
