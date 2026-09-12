# Claude Certified Developer - Foundations exam guide

> Source: [`Developer foundations example guide.pdf`](../Developer%20foundations%20example%20guide.pdf), version 1.0, effective July 2026. Exam code `CCDV-F`.

## Exam at a glance

| Item | Value |
|---|---|
| Questions | 53 multiple-choice and multiple-response items |
| Time | 120 minutes |
| Passing score | 720 on a 100-1,000 scaled range |
| Fee | $125 USD |
| Credential validity | 12 months |

## Blueprint

| Domain | Weight | Skills |
|---|---:|---|
| 1. Agents and Workflows | 14.7% | Agent Architecture 4.5%; Agent Construction with Claude 5.3%; Agent Patterns and Frameworks 4.9% |
| 2. Applications and Integration | 33.1% | Understanding Requirements 3.4%; Systems Life Cycle 2.8%; Claude API Mechanics 6.8%; Software Engineering Foundations 7.4%; Claude Application Design 8.6%; Configuration Management 4.1% |
| 3. Claude Code | 3.1% | Claude Code Operation 3.1% |
| 4. Eval, Testing, and Debugging | 2.6% | Debugging and Error Handling 2.6% |
| 5. Model Selection and Optimization | 16.8% | LLM Fundamentals 5.2%; Technical Fundamentals 6.1%; Model Selection and Tradeoffs 2.7%; Cost and Token Management 2.8% |
| 6. Prompt and Context Engineering | 11.0% | Context Engineering 3.8%; Prompt Engineering 4.6%; Output Handling 2.6% |
| 7. Security and Safety | 8.1% | AI Application Security 3.2%; Guardrails and Safe Deployment 2.3%; Claude Hooks 1.0%; Identity, Secrets, and Key Management 1.6% |
| 8. Tools and MCPs | 10.6% | Tool Implementation 4.4%; MCP Server Development 2.1%; Agentic Customization 4.1% |

## Detailed objectives

### 1. Agents and Workflows

- Decide between deterministic workflows and agents.
- Explain manager/supervisor hierarchies and when subagents improve execution.
- Construct agents with the Agent SDK, custom loops, hosted or self-hosted deployment, and deterministic hooks.
- Apply tool-use loops, memory, context-window management, and frameworks such as Strands, LangGraph, and PydanticAI.

### 2. Applications and Integration

- Translate business needs into functional and infrastructure requirements and manage the system life cycle.
- Use Messages API messages, tools, streaming, vision, thinking, prompt caching, third-party vendors, data-access patterns, and Message Batches.
- Apply REST, JSON, async programming, version control, SDLC practices, code review, and refactoring.
- Design across Claude Code, Desktop, claude.ai, API, and SDK interfaces; preserve content boundaries, sound schemas, session hygiene, and plugin management.
- Manage `CLAUDE.md`, `settings.json`, pinned model versions, prompt versions, and plugin dependencies.

### 3. Claude Code

- Use Rules, Skills, Commands, Agents, Agent Memory, session management, built-in and custom slash commands, headless/streaming/auto modes, `CLAUDE.md` hierarchy, repository initialization, and `settings.json`.

### 4. Eval, Testing, and Debugging

- Identify error types, select recovery strategies, analyze traces, and isolate integration-layer failures from model-output failures.

### 5. Model Selection and Optimization

- Explain tokens, context windows, sampling, non-determinism, and next-token generation.
- Distinguish model choice from fast mode, extended/adaptive thinking, and effort levels.
- Choose zero-, single-, or multi-shot prompting.
- Integrate REST-wrapping SDKs and websockets.
- Compare Opus, Sonnet, and Haiku on capability, latency, and cost; account for breaking model-release changes.
- Track tokens and cost; use prompt caching and cache checkpoints appropriately.

### 6. Prompt and Context Engineering

- Prevent drift and bloat with pruning, compaction, subagents, and multi-step context isolation.
- Write clear instructions and examples; place system and user instructions deliberately; constrain and iteratively refine output; sanitize input.
- Validate structured output, parse defensively, and remain skeptical of confident output.

### 7. Security and Safety

- Treat retrieved/user content as untrusted; mitigate prompt injection, jailbreaks, leakage, and unsafe PII handling.
- Layer guardrails with privacy, identity/access management, and least privilege.
- Use hooks to prevent destructive actions.
- Protect credentials and API keys; validate identity, require approval, verify access levels, and monitor authorized access.

### 8. Tools and MCPs

- Design tool schemas and descriptions, error handling, dispatch, client/server execution, approvals, and minimal tool sets.
- Author and deploy MCP tools, resources, and prompts over appropriate transports.
- Choose among built-in tools, custom tools, Skills, and MCP servers based on reuse, portability, control, and maintenance needs.

## Exam-guide sample-question takeaways

- Prefer Message Batches for high-volume, latency-tolerant overnight work when cost matters.
- Isolate untrusted content from trusted instructions and enforce least-privilege controls against prompt injection.
- Use an MCP server when an internal capability must be reusable and independently maintained across applications.

## Preparation emphasis

The three largest domains account for 64.6%: Applications and Integration (33.1%), Model Selection and Optimization (16.8%), and Agents and Workflows (14.7%). Build at least one application that exercises API integration, tools, prompting/context management, simple security controls, and evals.
