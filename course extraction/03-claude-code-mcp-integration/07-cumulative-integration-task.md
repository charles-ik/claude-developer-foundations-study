# 07 Cumulative Integration Task

Status: Complete — 2 of 2 authenticated SCORM screens archived.

Module: [Claude Code, MCP & Integration](README.md)

Source attribution: Anthropic Academy, *Claude Certified Developer - Foundations Prep Course*, Module 3. Course text below is a verbatim transcription of selectable screen content; only Markdown structure, link targets, and minimal whitespace were added.

Course URL: https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/claude-code-mcp-integration/486744/scorm/173ln01ww7hgd

SCORM content URL: https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html

## Section index

1. [Cumulative integration task: checkpoint](#s18) — [SCORM screen](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html#S18)
2. [Cumulative integration task: assembly](#s19) — [SCORM screen](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html#S19)

---

<a id="s18"></a>

## Screen 18 — Cumulative integration task: checkpoint

*Cumulative · Cumulative Integration Task · 6 min*

Source: [authenticated course lesson](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/claude-code-mcp-integration/486744/scorm/173ln01ww7hgd) · [SCORM content screen](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html#S18)

The integration below has three bugs planted across the layers this module covers: one in the Claude Code configuration layer, one in the plugin or packaging layer, and one in the MCP or authentication layer.

For each file: identify the bug and write one sentence describing what it does or fails to do at runtime.

File 1: .claude/settings.json

```text
{ "permissions": { "defaultMode": "bypassPermissions", "deny": ["Read(.env.production)"] } }
```

File 2: .claude/skills/migration-validate/SKILL.md

```text
---
name: migration-validate
description: Validates migration scripts before they run against production.
---
## Steps
1. Run: /Users/priya/scripts/validate-migration.sh
2. Report validation results.
```

File 3: .mcp.json

```text
{
  "mcpServers": {
    "data-warehouse": {
      "type": "http",
      "url": "https://warehouse.internal/mcp",
      "headers": {
        "Authorization": "Bearer sk-prod-warehouse-abc123"
      }
    }
  }
}
```

*[Response field: Your bug diagnosis for all three files]*

- **Interactive control:** Reveal model answer *(disabled until completed)*
- **Interactive control:** Skip for now
**Model answer**

**File 1 (settings.json):** `defaultMode` is `bypassPermissions`; removes every confirmation prompt on a production workstation, including for destructive operations. The deny rule for `.env.production` is correct; only the mode is wrong.

**File 2 (SKILL.md):** Step 1 uses an absolute path `/Users/priya/scripts/validate-migration.sh`; this path exists only on the author’s machine and will not resolve on any teammate’s machine after they clone the project.

**File 3 (.mcp.json):** The API key `sk-prod-warehouse-abc123` is committed inline in the Authorization header; it enters repository history where it cannot be removed by overwriting the file in a later commit, and must be treated as compromised.

How many did you catch?

- **Interactive control:** All three correct
- **Interactive control:** Missed the API key (Bug 3)
- **Interactive control:** Two of three correct
- **Interactive control:** One of three correct

---

<a id="s19"></a>

## Screen 19 — Cumulative integration task: assembly

*Cumulative · Cumulative Integration Task · 6 min*

Source: [authenticated course lesson](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/claude-code-mcp-integration/486744/scorm/173ln01ww7hgd) · [SCORM content screen](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html#S19)

Now write the corrected version of all three files.

Produce the complete corrected content for settings.json, SKILL.md, and .mcp.json.

*[Response field: Your corrected files]*

- **Interactive control:** Reveal model answer *(disabled until completed)*
- **Interactive control:** Skip for now
**Model answer**

File 1: settings.json (corrected)

```text
{ "permissions": { "defaultMode": "acceptEdits", "deny": ["Read(.env.production)"] } }
```

File 2: SKILL.md (corrected)

```text
---
name: migration-validate
description: Validates migration scripts before they run against production.
---
## Steps
1. Run: $CLAUDE_PROJECT_DIR/scripts/validate-migration.sh
2. Report validation results.
```

File 3: .mcp.json (corrected)

```text
{
  "mcpServers": {
    "data-warehouse": {
      "type": "http",
      "url": "https://warehouse.internal/mcp",
      "headers": {
        "Authorization": "Bearer ${WAREHOUSE_MCP_TOKEN}"
      }
    }
  }
}
```

settings.json sets `defaultMode` to `acceptEdits` inside `permissions`; auto-approves file edits and common filesystem commands but gates destructive shell commands, the right tradeoff for a production migration workstation. The skill uses `$CLAUDE_PROJECT_DIR` so the path resolves from the project root on any machine after cloning. The MCP configuration references the credential as an environment variable so it is never committed to repository history.

How did your assembly compare?

- **Interactive control:** Correct assembly
- **Interactive control:** Missing permission fix
- **Interactive control:** Missing path fix
- **Interactive control:** Missing secret fix
