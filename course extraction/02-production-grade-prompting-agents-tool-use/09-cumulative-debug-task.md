# Cumulative Debug Task

Sources: [S22](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/3fpv056zo4wp4/Developer_M2_vF2.html#S22) · [S23](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/3fpv056zo4wp4/Developer_M2_vF2.html#S23)

## S22 — Identify

**Cumulative · Debug Task · 8 min**

### Cumulative debug task · Identify each bug

The agent implementation below has four planted bugs, one in each of four layers: the schema layer, the streaming layer where the response is assembled and committed, the context layer where the message structure is built, and the memory layer.

Work through the two stages below. This screen covers Stage 1: identify each bug. Stage 2, writing the corrected version, is on the next screen.

**Buggy implementation**

```python
# --- TOOL DEFINITIONS ---
tools = [
  {
    "name": "get_customer_data",
    "description": "Gets data.",
    "input_schema": { "type": "object", "properties": { "id": {"type":"string"} }, "required": ["id"] }
  }
]

# --- AGENT LOOP ---
def run_agent(user_request, session_history):
  messages = session_history + [{"role":"user","content":user_request}]
  while True:
    blocks = {}
    stop_seen = False
    with client.messages.stream(
        model=model, max_tokens=4096, tools=tools, messages=messages,
        thinking={"type": "adaptive"}
    ) as stream:
      for event in stream:
        if event.type == "content_block_start":
          blocks[event.index] = init_block(event)
        elif event.type == "content_block_delta":
          apply_delta(blocks[event.index], event.delta)
        elif event.type == "message_stop":
          stop_seen = True
    assistant_content = [b for b in assemble(blocks) if b["type"] != "thinking"]
    messages.append({"role": "assistant", "content": assistant_content})
    response = finalize(blocks)
    if response.stop_reason == "end_turn":
      return response
    for block in response.content:
      if block.type == "tool_use":
        result = execute_tool(block.name, block.input)
        messages.append({"role":"user","content":[{"type":"tool_result",
                         "tool_use_id":block.id,"content":result}]})

# --- MEMORY ---
def build_session_history(prior_sessions):
  # Concatenating all prior session transcripts in-context
  full_history = []
  for session in prior_sessions:
    full_history.extend(session["messages"])
  return full_history
```

#### Stage 1: Identify each bug

The implementation above has four bugs, one in each of four layers. For each bug: name the layer it belongs to and write one sentence describing what it causes at runtime.

- **Response field:** Name each of the four bugs by layer, and describe what each one causes at runtime…
- **Interactive control:** Reveal model answer
- **Interactive control:** Skip for now

**Model answer: Stage 1 · self-assess**

Bug 1 (vague description "Gets data."): Schema layer: Claude cannot distinguish this tool from any other retrieval tool and selects on surface-level matching rather than intent.

Bug 2 (turn committed before message_stop; thinking block stripped): Streaming layer: An interrupted stream writes a partial, possibly half-built tool_use, block into history; the stripped thinking block breaks the carry-back rule and the API rejects the next request because the signature no longer matches.

Bug 3 (only tool_result appended; no preceding assistant tool_use turn): Context layer: The API sees a tool_result referencing a tool_use block it never received as a complete assistant turn and rejects the request.

Bug 4 (all prior session transcripts concatenated in-context): Memory layer: The context window grows with every session and fills before the agent can process the current request by session four or five.

- **Interactive control:** I found all four · pass
- **Interactive control:** I missed one or more · retry

## S23 — Fix

**Cumulative · Debug Task · 10 min**

### Cumulative debug task · Write the corrected version

Stage 2: write the corrected version of each bug identified on the previous screen. For each one, show the fixed code and name what it changes.

**Buggy implementation (for reference)**

```python
# --- TOOL DEFINITIONS ---
tools = [
  {
    "name": "get_customer_data",
    "description": "Gets data.",
    "input_schema": { "type": "object", "properties": { "id": {"type":"string"} }, "required": ["id"] }
  }
]

# --- AGENT LOOP ---
def run_agent(user_request, session_history):
  messages = session_history + [{"role":"user","content":user_request}]
  while True:
    blocks = {}
    stop_seen = False
    with client.messages.stream(
        model=model, max_tokens=4096, tools=tools, messages=messages,
        thinking={"type": "adaptive"}
    ) as stream:
      for event in stream:
        if event.type == "content_block_start":
          blocks[event.index] = init_block(event)
        elif event.type == "content_block_delta":
          apply_delta(blocks[event.index], event.delta)
        elif event.type == "message_stop":
          stop_seen = True
    assistant_content = [b for b in assemble(blocks) if b["type"] != "thinking"]
    messages.append({"role": "assistant", "content": assistant_content})
    response = finalize(blocks)
    if response.stop_reason == "end_turn":
      return response
    for block in response.content:
      if block.type == "tool_use":
        result = execute_tool(block.name, block.input)
        messages.append({"role":"user","content":[{"type":"tool_result",
                         "tool_use_id":block.id,"content":result}]})

# --- MEMORY ---
def build_session_history(prior_sessions):
  # Concatenating all prior session transcripts in-context
  full_history = []
  for session in prior_sessions:
    full_history.extend(session["messages"])
  return full_history
```

- **Response field:** Write the corrected version of each of the four bugs, and name what each fix changes…
- **Interactive control:** Reveal model answer
- **Interactive control:** Skip for now

**Model answer: Stage 2 · self-assess**

Bug 1 fix: Schema layer: Replace the description with one that states intent and an exclusion:

```
"Use this to retrieve full account and contact details for a customer by customer ID. Do not use this for order history or transaction records."
```

Bug 2 fix: Streaming layer: Keep all blocks including the thinking block. Gate the commit on stop_seen and raise on interruption:

```python
assistant_content = assemble(blocks)	# keep all blocks including thinking
if stop_seen:
	messages.append({"role": "assistant", "content": assistant_content})
else:
	raise StreamInterruptedError(
    	"Discarding partial turn; retry from last complete turn."
	)
```

Bug 3 fix: Context layer: Bug 3 is resolved once Bug 2 is fixed. The full assistant turn, including the tool_use block, is now appended before the tool_result, satisfying the pairing rule.

Bug 4 fix: Memory layer: Use external storage and inject only a summary at session start rather than concatenating full transcripts:

```python
def build_session_history(prior_sessions):
	if not prior_sessions:
    	return []
	summary = load_session_summary(prior_sessions[-1]["id"])   # from external store
	return [{"role": "user", "content": f"Session context: {summary}"}]
```

- **Interactive control:** My fixes match · pass
- **Interactive control:** Not quite · retry
