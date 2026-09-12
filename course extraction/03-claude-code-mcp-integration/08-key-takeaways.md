# 08 Key Takeaways

Status: Complete — 2 of 2 authenticated SCORM screens archived.

Module: [Claude Code, MCP & Integration](README.md)

Source attribution: Anthropic Academy, *Claude Certified Developer - Foundations Prep Course*, Module 3. Course text below is a verbatim transcription of selectable screen content; only Markdown structure, link targets, and minimal whitespace were added.

Course URL: https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/claude-code-mcp-integration/486744/scorm/173ln01ww7hgd

SCORM content URL: https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html

## Section index

1. [Seven key takeaways](#s20) — [SCORM screen](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html#S20)
2. [Key terms from this module](#s20b) — [SCORM screen](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html#S20B)

---

<a id="s20"></a>

## Screen 20 — Seven key takeaways

*Recap · Key Takeaways · 6 min*

Source: [authenticated course lesson](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/claude-code-mcp-integration/486744/scorm/173ln01ww7hgd) · [SCORM content screen](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html#S20)

One takeaway per section, tying the module together.

1

#### Permission mode is a risk decision, not a speed decision.

Claude Code gives you modes ranging from prompt-before-everything to prompt-for-nothing. Permission mode should match the risk profile of the work and environment, not the preference for fewer prompts. A bypass mode on a developer workstation against a live codebase removes every checkpoint between the agent and your files. A deny rule on the path that must not be touched, set at the project or enterprise level, covers the gap that a mode alone does not.

2

#### An AI code review gives you a set of findings to triage, not a verdict to apply.

Trust the findings the reviewer can prove from the diff in front of it, like a missing null check or an unclosed resource, and confirm them on the lines it cites. Treat any claim about runtime behavior or another system as a hypothesis to test, because the reviewer made that claim without the evidence that would prove it. Put the human gate at the point where a finding turns into an action that’s hard to reverse and raise the reviewer’s accuracy by giving it the conventions it would otherwise have to guess at.

3

#### A skill is portable, but “runs everywhere” is something you design for.

The same SKILL.md can run in Claude Code, on the Messages API, and through the Agent SDK, but each one loads and sandboxes it differently: filesystem discovery in Claude Code, beta headers and a code execution container on the API, and settingSources on the SDK. A skill scoped to a clear description and free of local-environment assumptions ports cleanly; one that assumes the terminal it was written in does not. In every runtime, subagents start clean: they do not automatically preload skills.

4

#### Durable context requires the right mechanism for each concern.

CLAUDE.md is the session-persistent project memory, but it dilutes with size. Rules files scope guidance to where it applies. Hooks enforce guardrails deterministically, not probabilistically. Subagents keep exploration work out of the main context. These four mechanisms each solve a different problem, so forcing all of them into CLAUDE.md produces a single file that is harder to maintain and easier to ignore.

5

#### A shareable setup requires portable components.

A plugin that references an absolute path to the author’s home directory will install on one machine and fail on all others. Skills, hooks, and plugin components that will be shared must reference paths relative to the project root, and any environment variable requirement must be documented or validated at install time. Test the install from a clean machine before distributing.

6

#### Transport and scope are independent decisions with dependent consequences.

stdio is for servers that run on your machine. HTTP is for anything hosted remotely or accessed by multiple developers. Local scope keeps a server personal; project scope shares it with the repo via .mcp.json. The combination must match the deployment intent: a shared team server requires HTTP transport and project or enterprise scope. A stdio server in .mcp.json is a configuration that looks shareable but is not.

7

#### Enterprise integration requires identifying the security requirements before deployment.

A regulated customer asks about identity, data residency, access logging, and configuration control. The answers come from OAuth for user-identity services, environment variables for service credentials, PostToolUse hooks for audit logging, and enterprise managed settings for configuration lock. None of these is hard to implement, but all of them are hard to retrofit after a production deployment has failed a security review.

**What comes next**

Module 4 covers production engineering, evaluations, and security: how to measure whether your Claude Code integrations work correctly at scale, how to build eval harnesses, and how to design production-grade safety guardrails. The permission modes, hooks, and authentication patterns from this module are the foundation those evaluations test against.

### Sources

- Claude 101 (Skilljar)
- Claude Code 101 In Action (Skilljar)
- Building with the Claude API (Skilljar)
- [code.claude.com](https://code.claude.com/)
- [platform.claude.com](https://platform.claude.com/)
- [docs.claude.com](https://docs.claude.com/)

### You can now run Claude Code safely, share it as a team asset, and connect it to real systems.

From permission modes to enterprise authentication, you now hold the configuration decisions that keep an integration working long after it leaves your machine.

---

<a id="s20b"></a>

## Screen 21 — Key terms from this module

*Glossary · Key Terms · 3 min*

Source: [authenticated course lesson](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/claude-code-mcp-integration/486744/scorm/173ln01ww7hgd) · [SCORM content screen](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html#S20B)

Alphabetical. Click a term to expand its definition.

#### Claude Agent SDK

A programmable interface that exposes the same agent loop Claude Code runs in the terminal. It allows developers to invoke the loop from code, set the permission mode and available tools, and run tasks without an interactive session. The same permission model and deny rules that apply in the terminal apply in the SDK.

#### CLAUDE.md

A Markdown file placed at the root of a Claude Code project. Its contents are prepended to the context window at the start of every session. It holds the universal project constraints, conventions, and commands that should apply unconditionally across all sessions. Files that grow beyond roughly 200-300 lines risk diluting critical rules through content weight.

#### Hook

A command bound to a lifecycle event in Claude Code's execution (PreToolUse, PostToolUse, UserPromptSubmit, Stop). Unlike instructions in CLAUDE.md, hooks run deterministically at the configured event regardless of what the model decides. A PreToolUse hook can exit with code 2 to block a tool call before it runs.

#### MCP (Model Context Protocol)

An open communication layer that allows an MCP client such as Claude Code to connect to an MCP server that exposes tools, resources, and prompts. The protocol defines how the client discovers and calls the server's tools. Using MCP moves tool definition and maintenance out of individual application code and into a reusable server that any MCP client can attach to.

#### MCP transport

The communication channel between an MCP client and an MCP server. stdio runs the server as a local subprocess on the same machine as the client. HTTP connects to a remotely hosted server over a network. The choice of transport determines where the server can run and who can connect to it.

#### Permission mode

A setting in Claude Code that controls how often the agent stops to request confirmation before executing tool calls. Modes range from default (prompts before nearly every action) to bypass modes (no prompts at all). Deny rules override any mode; a deny rule at the enterprise settings level cannot be bypassed by any individual configuration.

#### Plugin

A versioned bundle of Claude Code components (skills, hooks, subagents, and MCP server configurations) distributed through a marketplace. Installing a plugin gives the recipient the same setup as the author in a single step. Enterprise administrators can deploy plugins organization-wide through managed settings.

#### Rules instruction file

A file that scopes guidance to a specific path or condition in Claude Code. Unlike CLAUDE.md, which loads for every session unconditionally, a rules file activates only when Claude Code is working in the directory it supervises. Used to keep path-specific guidance out of the main project memory file.

#### Subagent

A separate execution context launched by Claude Code to handle a delegated task. A subagent does not inherit the main conversation's context or accumulated files; it starts clean, performs the task, and returns only a summary. Using subagents for exploratory or investigative work keeps the main session context from filling with content that will not be reused.
