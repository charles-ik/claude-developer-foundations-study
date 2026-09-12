import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(outputDir, "..");
const sourceDir = path.join(projectDir, "course extraction");
const archiveDir = path.join(projectDir, "archive");
const flashcardsPath = path.join(outputDir, "data", "flashcards.json");

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23101822'/%3E%3Cpath d='M9 8h14v4h-5v12h-4V12H9z' fill='%23f4b740'/%3E%3Ccircle cx='24' cy='23' r='3' fill='%2378e0c0'/%3E%3C/svg%3E";

const diagrams = [
  {
    id: "m1-request-lifecycle",
    moduleDir: "01-mso-foundations",
    targetFile: "05-technical-substrate.md",
    title: "Claude request / response lifecycle",
    description:
      "A compact visual recap of the access patterns introduced in MSO Foundations.",
    direction: "LR",
    nodes: [
      { id: "intent", label: "User intent", x: 24, y: 84, shape: "round" },
      { id: "model", label: "Choose model\nand reasoning", x: 190, y: 84, shape: "rect" },
      { id: "request", label: "Build prompt\n+ context", x: 382, y: 84, shape: "rect" },
      { id: "access", label: "SDK or REST\n(sync / stream)", x: 574, y: 84, shape: "rect" },
      { id: "result", label: "Response\n+ eval", x: 766, y: 84, shape: "round" },
    ],
    edges: [
      ["intent", "model", ""],
      ["model", "request", ""],
      ["request", "access", ""],
      ["access", "result", ""],
    ],
  },
  {
    id: "m2-tool-loop",
    moduleDir: "02-production-grade-prompting-agents-tool-use",
    targetFile: "04-tool-use-and-schema-design.md",
    title: "Prompt → tool call → tool result",
    description:
      "The application-owned loop that turns a tool schema into an agentic action.",
    direction: "TD",
    nodes: [
      { id: "prompt", label: "Prompt +\ntool schema", x: 345, y: 16, shape: "rect" },
      { id: "decide", label: "Claude selects\na tool", x: 345, y: 92, shape: "decision" },
      { id: "call", label: "Application\nexecutes call", x: 345, y: 174, shape: "rect" },
      { id: "result", label: "Tool result\nreturns", x: 345, y: 256, shape: "rect" },
      { id: "continue", label: "Claude continues\nor answers", x: 345, y: 338, shape: "round" },
    ],
    edges: [
      ["prompt", "decide", ""],
      ["decide", "call", "tool_use"],
      ["call", "result", ""],
      ["result", "continue", ""],
    ],
  },
  {
    id: "m3-claude-code-mcp",
    moduleDir: "03-claude-code-mcp-integration",
    targetFile: "05-mcp-servers.md",
    title: "Claude Code / MCP configuration flow",
    description:
      "Where packaging, transport, scope, and enterprise access meet.",
    direction: "LR",
    nodes: [
      { id: "workflow", label: "Claude Code\nworkflow", x: 24, y: 84, shape: "round" },
      { id: "plugin", label: "Plugin\npackage", x: 192, y: 84, shape: "rect" },
      { id: "server", label: "MCP server\n(tools / resources)", x: 382, y: 84, shape: "rect" },
      { id: "transport", label: "Match\ntransport", x: 580, y: 84, shape: "decision" },
      { id: "access", label: "Scoped\nenterprise access", x: 770, y: 84, shape: "round" },
    ],
    edges: [
      ["workflow", "plugin", ""],
      ["plugin", "server", ""],
      ["server", "transport", ""],
      ["transport", "access", ""],
    ],
  },
  {
    id: "m4-production-loop",
    moduleDir: "04-production-engineering-evals-security",
    targetFile: "06-security.md",
    title: "Production hardening loop",
    description:
      "A study aid connecting the module's eval, trace, failure, and security decisions.",
    direction: "LR",
    nodes: [
      { id: "define", label: "Define\nsuccess", x: 24, y: 84, shape: "round" },
      { id: "eval", label: "Run evals\n+ tests", x: 196, y: 84, shape: "rect" },
      { id: "trace", label: "Trace the\nseam", x: 376, y: 84, shape: "rect" },
      { id: "recover", label: "Retry or\nstop safely", x: 556, y: 84, shape: "rect" },
      { id: "secure", label: "Enforce trust\nboundary", x: 748, y: 84, shape: "round" },
    ],
    edges: [
      ["define", "eval", ""],
      ["eval", "trace", ""],
      ["trace", "recover", ""],
      ["recover", "secure", ""],
    ],
  },
  {
    id: "m5-accelerator-lifecycle",
    moduleDir: "05-accelerators-ip-contribution",
    targetFile: "03-contributing-back.md",
    title: "Accelerator / IP contribution lifecycle",
    description:
      "How a working private build becomes a reusable, reviewable shared asset.",
    direction: "TD",
    nodes: [
      { id: "build", label: "Working\nbuild", x: 345, y: 16, shape: "round" },
      { id: "package", label: "Package +\ndocument", x: 345, y: 92, shape: "rect" },
      { id: "channel", label: "Choose\ncontribution channel", x: 345, y: 174, shape: "decision" },
      { id: "verify", label: "Example +\ntest + rights", x: 345, y: 256, shape: "rect" },
      { id: "shared", label: "Maintainer-accepted\nshared asset", x: 345, y: 338, shape: "round" },
    ],
    edges: [
      ["build", "package", ""],
      ["package", "channel", ""],
      ["channel", "verify", ""],
      ["verify", "shared", ""],
    ],
  },
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  return stripInlineMarkdown(value)
    .toLowerCase()
    .replace(/\t/g, " ")
    .replace(/[^\p{L}\p{N}\- ]/gu, "")
    .replace(/ /g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripInlineMarkdown(value) {
  return String(value)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tableCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return [];
  const withoutOuter = trimmed.endsWith("|")
    ? trimmed.slice(1, -1)
    : trimmed.slice(1);
  return withoutOuter.split("|").map((cell) => cell.trim());
}

function extractLinks(value) {
  return [...String(value).matchAll(/\[([^\]]*)\]\(([^)]+)\)/g)].map(
    (match) => ({ text: match[1], href: match[2].trim() }),
  );
}

function firstHeading(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? stripInlineMarkdown(match[1]) : fallback;
}

function parseDurations() {
  const manifest = read(path.join(sourceDir, "README.md"));
  const durations = new Map();
  for (const line of manifest.split(/\r?\n/)) {
    const cells = tableCells(line);
    const moduleLink = cells
      .flatMap((cell) => extractLinks(cell))
      .find((link) => /^\.\/[^/]+\/README\.md$/.test(link.href));
    if (moduleLink && cells.length >= 4) {
      const moduleDir = moduleLink.href.split("/")[1];
      durations.set(moduleDir, cells[3]);
    }
  }
  return durations;
}

function isScreenId(value) {
  return /^(?:S\d+[A-Z]*|CERT)$/i.test(value.trim());
}

function deriveScreenId(href, fallbackOrder) {
  const hash = String(href).split("#")[1] || "";
  if (hash.toUpperCase() === "CERT") return "CERT";
  const sourceId = hash.match(/^s(\d+[a-z]*)$/i);
  if (sourceId) return `S${sourceId[1].toUpperCase()}`;
  const numbered = hash.match(/^screen-(\d+)/i);
  if (numbered) return `S${numbered[1].padStart(2, "0")}`;
  return `SCREEN-${fallbackOrder}`;
}

function parseScreenManifest(moduleDir, readme) {
  const screens = [];
  for (const line of readme.split(/\r?\n/)) {
    const cells = tableCells(line);
    if (!cells.length) continue;
    const localCellIndex = cells.findIndex((cell) =>
      extractLinks(cell).some(
        (link) => link.href.includes(".md#") && !/^https?:\/\//i.test(link.href),
      ),
    );
    if (localCellIndex < 0) continue;
    const localLink = extractLinks(cells[localCellIndex]).find(
      (link) => link.href.includes(".md#") && !/^https?:\/\//i.test(link.href),
    );
    if (!localLink) continue;

    const rawCandidates = cells
      .slice(0, localCellIndex)
      .map(stripInlineMarkdown)
      .filter(
        (candidate) =>
          candidate &&
          !/^\d+$/.test(candidate) &&
          !isScreenId(candidate) &&
          !/^(?:Complete|Status|Archived)$/i.test(candidate),
      );
    const title = rawCandidates.at(-1) || stripInlineMarkdown(localLink.text);
    const externalLinks = cells.flatMap((cell) =>
      extractLinks(cell).filter((link) => /^https?:\/\//i.test(link.href)),
    );
    const sourceLink =
      externalLinks.find((link) => link.href.includes("#")) || externalLinks[0];
    const sourceRel = path.posix.normalize(
      path.posix.join(moduleDir, localLink.href.split("#")[0]),
    );
    const anchor = localLink.href.split("#")[1] || "";
    screens.push({
      order: screens.length + 1,
      screenId: deriveScreenId(
        sourceLink?.href?.includes("#") ? sourceLink.href : localLink.href,
        screens.length + 1,
      ),
      title,
      sourceRel,
      anchor,
      sourceUrl: sourceLink?.href || "",
    });
  }
  return screens;
}

function parseModule(moduleDir) {
  const modulePath = path.join(sourceDir, moduleDir);
  const readme = read(path.join(modulePath, "README.md"));
  const sectionFiles = fs
    .readdirSync(modulePath)
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .sort();
  const sections = sectionFiles.map((file) => {
    const sourceRel = path.posix.join(moduleDir, file);
    return {
      file,
      sourceRel,
      pageRel: sourceRel.replace(/\.md$/, ".html"),
      title: firstHeading(read(path.join(modulePath, file)), file),
    };
  });
  const external = [...readme.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)].map(
    (match) => match[1],
  );
  const screens = parseScreenManifest(moduleDir, readme);
  for (const section of sections) {
    section.screens = screens.filter((screen) => screen.sourceRel === section.sourceRel);
  }
  return {
    id: moduleDir.slice(0, 2),
    dir: moduleDir,
    title: firstHeading(readme, moduleDir),
    sourceUrl: external[0] || "",
    status:
      readme.match(/(?:Status|Archive status|Extraction status):\s*([^\n]+)/i)?.[1]?.replace(
        /\*\*/g,
        "",
      ) || "Complete",
    duration: parseDurations().get(moduleDir) || "",
    sourceRel: path.posix.join(moduleDir, "README.md"),
    pageRel: path.posix.join(moduleDir, "index.html"),
    sections,
    screens,
  };
}

function buildModel() {
  const modules = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => parseModule(entry.name))
    .sort((a, b) => a.dir.localeCompare(b.dir));
  const screens = modules.flatMap((module) =>
    module.screens.map((screen, index) => ({
      ...screen,
      moduleDir: module.dir,
      moduleTitle: module.title,
      pageRel: screen.sourceRel.replace(/\.md$/, ".html"),
      moduleOrder: Number(module.id),
      moduleScreenOrder: index + 1,
    })),
  );
  const sourceToOutput = new Map();
  sourceToOutput.set("README.md", "index.html");
  for (const module of modules) {
    sourceToOutput.set(module.sourceRel, module.pageRel);
    for (const section of module.sections) sourceToOutput.set(section.sourceRel, section.pageRel);
  }
  return { modules, screens, sourceToOutput };
}

function relativeHref(fromPageRel, targetPageRel) {
  const fromDir = path.posix.dirname(fromPageRel);
  const relative = path.posix.relative(fromDir, targetPageRel);
  return relative || path.posix.basename(targetPageRel);
}

function rewriteHref(rawHref, context, model) {
  const href = String(rawHref).trim();
  if (!href || href.startsWith("#") || /^(?:https?:|mailto:|tel:|data:)/i.test(href)) {
    return href;
  }
  const hashIndex = href.indexOf("#");
  const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  let decodedPath = pathPart;
  try {
    decodedPath = decodeURIComponent(pathPart);
  } catch {
    decodedPath = pathPart;
  }
  const targetAbs = path.resolve(path.dirname(context.sourceAbs), decodedPath || ".");
  const targetSourceRel = path.relative(sourceDir, targetAbs).split(path.sep).join("/");
  const outputTarget = model.sourceToOutput.get(targetSourceRel);
  if (outputTarget) return `${relativeHref(context.pageRel, outputTarget)}${hash}`;
  const outputAbs = path.join(outputDir, context.pageRel);
  const projectRelative = path.relative(path.dirname(outputAbs), targetAbs).split(path.sep).join("/");
  return `${projectRelative || path.basename(targetAbs)}${hash}`;
}

function renderInline(value, context, model) {
  const tokens = [];
  const stash = (html) => {
    const token = `\u0000${tokens.length}\u0000`;
    tokens.push(html);
    return token;
  };
  let text = String(value);
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_, alt, src) => {
    const href = rewriteHref(src, context, model);
    return stash(`<img src="${escapeHtml(href)}" alt="${escapeHtml(alt)}" loading="lazy">`);
  });
  text = text.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${escapeHtml(code)}</code>`));
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_, label, href) => {
    const resolved = rewriteHref(href, context, model);
    const external = /^(?:https?:|mailto:|tel:)/i.test(resolved);
    const target = external ? ' target="_blank" rel="noreferrer"' : "";
    return stash(`<a href="${escapeHtml(resolved)}"${target}>${renderInline(label, context, model)}</a>`);
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, (_, content) => stash(`<strong>${renderInline(content, context, model)}</strong>`));
  text = text.replace(/__([^_]+)__/g, (_, content) => stash(`<strong>${renderInline(content, context, model)}</strong>`));
  text = text.replace(/~~([^~]+)~~/g, (_, content) => stash(`<del>${renderInline(content, context, model)}</del>`));
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, (_, content) => stash(`<em>${renderInline(content, context, model)}</em>`));
  text = text.replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, (_, content) => stash(`<em>${renderInline(content, context, model)}</em>`));
  return escapeHtml(text).replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}

function isTableDelimiter(line) {
  const cells = tableCells(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderTable(lines, context, model) {
  const rows = lines.map(tableCells);
  const header = rows[0] || [];
  const body = rows.slice(2);
  return `<div class="table-scroll"><table><thead><tr>${header
    .map((cell) => `<th scope="col">${renderInline(cell, context, model)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${renderInline(cell, context, model)}</td>`)
          .join("")}</tr>`,
    )
    .join("")}</tbody></table></div>`;
}

function renderList(lines, ordered, context, model) {
  const tag = ordered ? "ol" : "ul";
  const pattern = ordered ? /^\s*\d+\.\s+(.+)$/ : /^\s*[-*+]\s+(.+)$/;
  const items = [];
  for (const line of lines) {
    const match = line.match(pattern);
    if (match) items.push(match[1]);
    else if (items.length) items[items.length - 1] += ` ${line.trim()}`;
  }
  return `<${tag}>${items.map((item) => `<li>${renderInline(item, context, model)}</li>`).join("")}</${tag}>`;
}

function renderMarkdown(markdown, context, model) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  let html = "";
  let screenBlock = null;
  let pendingAnchor = "";
  const seenHeadings = new Map();
  const screenByAnchor = new Map(
    (context.screens || []).map((screen) => [screen.anchor.toLowerCase(), screen]),
  );

  const closeScreen = () => {
    if (screenBlock) {
      html += "</section>";
      screenBlock = null;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;

    const anchorMatch = line.match(/^<a\s+id=["']([^"']+)["']\s*><\/a>\s*$/i);
    if (anchorMatch) {
      const id = anchorMatch[1];
      pendingAnchor = id;
      html += `<span class="source-anchor" id="${escapeHtml(id)}" aria-hidden="true"></span>`;
      continue;
    }

    const codeMatch = line.match(/^```\s*([\w+-]*)\s*$/);
    if (codeMatch) {
      const code = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      const language = codeMatch[1] ? ` class="language-${escapeHtml(codeMatch[1])}"` : "";
      html += `<pre><code${language}>${escapeHtml(code.join("\n"))}</code></pre>`;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const baseId = slugify(headingText) || `heading-${i + 1}`;
      const count = seenHeadings.get(baseId) || 0;
      seenHeadings.set(baseId, count + 1);
      const headingId = count ? `${baseId}-${count + 1}` : baseId;
      const screen = !context.noScreens && level >= 1
        ? screenByAnchor.get((pendingAnchor || headingId).toLowerCase()) || screenByAnchor.get(headingId.toLowerCase())
        : null;
      if (screen) {
        closeScreen();
        screenBlock = screen;
        html += `<section class="screen-block" data-screen="${escapeHtml(screen.screenId)}"><div class="screen-label"><span>${escapeHtml(screen.screenId)}</span><span>LESSON ${screen.moduleScreenOrder || screen.order}</span></div>`;
      }
      pendingAnchor = "";
      const className = level === 1 ? " class=\"section-title\"" : "";
      html += `<h${level} id="${escapeHtml(headingId)}"${className}>${renderInline(headingText, context, model)}</h${level}>`;
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      html += "<hr>";
      continue;
    }

    if (line.trim().startsWith("|") && i + 1 < lines.length && isTableDelimiter(lines[i + 1])) {
      const tableLines = [line, lines[i + 1]];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }
      i -= 1;
      html += renderTable(tableLines, context, model);
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && (/^\s*>/.test(lines[i]) || !lines[i].trim())) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      i -= 1;
      html += `<blockquote>${renderMarkdown(quoteLines.join("\n"), { ...context, noScreens: true }, model)}</blockquote>`;
      continue;
    }

    const unordered = /^\s*[-*+]\s+/.test(line);
    const ordered = /^\s*\d+\.\s+/.test(line);
    if (unordered || ordered) {
      const listLines = [line];
      const matcher = unordered ? /^\s*[-*+]\s+/ : /^\s*\d+\.\s+/;
      i += 1;
      while (i < lines.length && (matcher.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        listLines.push(lines[i]);
        i += 1;
      }
      i -= 1;
      html += renderList(listLines, ordered, context, model);
      continue;
    }

    const paragraph = [line];
    i += 1;
    while (i < lines.length && lines[i].trim()) {
      const next = lines[i];
      if (
        /^```/.test(next) ||
        /^#{1,6}\s+/.test(next) ||
        /^<a\s+id=/i.test(next) ||
        /^\s*[-*+]\s+/.test(next) ||
        /^\s*\d+\.\s+/.test(next) ||
        /^\s*>/.test(next) ||
        /^\s*---+\s*$/.test(next) ||
        (next.trim().startsWith("|") && i + 1 < lines.length && isTableDelimiter(lines[i + 1]))
      ) break;
      paragraph.push(next);
      i += 1;
    }
    i -= 1;
    html += `<p>${paragraph
      .map((part, index) => `${renderInline(part.replace(/\s+$/, ""), context, model)}${index < paragraph.length - 1 ? " " : ""}`)
      .join("")}</p>`;
  }
  closeScreen();
  return html;
}

function diagramSource(diagram) {
  const nodes = diagram.nodes.map((node) => {
    if (node.shape === "decision") return `${node.id}{"${node.label.replaceAll("\n", " ")}"}`;
    if (node.shape === "round") return `${node.id}(["${node.label.replaceAll("\n", " ")}"])`;
    return `${node.id}["${node.label.replaceAll("\n", " ")}"]`;
  });
  const edges = diagram.edges.map(([from, to, label]) =>
    label ? `${from} -->|${label}| ${to}` : `${from} --> ${to}`,
  );
  return [`flowchart ${diagram.direction}`, ...nodes, ...edges].join("\n");
}

function wrapSvgText(label, x, y, maxChars = 20) {
  const lines = [];
  for (const segment of label.split(/\n/)) {
    let current = "";
    for (const word of segment.split(/\s+/).filter(Boolean)) {
      if (current && current.length + word.length + 1 > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = `${current}${current ? " " : ""}${word}`;
      }
    }
    if (current) lines.push(current);
  }
  return lines
    .map((line, index) => `<tspan x="${x}" dy="${index ? 18 : 0}">${escapeHtml(line)}</tspan>`)
    .join("");
}

function renderDiagramSvg(diagram) {
  const width = 920;
  const height = diagram.direction === "TD" ? 420 : 220;
  const nodeWidth = 140;
  const nodeHeight = 54;
  const nodeById = new Map(diagram.nodes.map((node) => [node.id, node]));
  const markerId = `${diagram.id}-arrow`;
  const lines = diagram.edges
    .map(([fromId, toId, label]) => {
      const from = nodeById.get(fromId);
      const to = nodeById.get(toId);
      const vertical = diagram.direction === "TD";
      const x1 = vertical ? from.x + nodeWidth / 2 : from.x + nodeWidth;
      const y1 = vertical ? from.y + nodeHeight : from.y + nodeHeight / 2;
      const x2 = vertical ? to.x + nodeWidth / 2 : to.x;
      const y2 = vertical ? to.y : to.y + nodeHeight / 2;
      const labelX = (x1 + x2) / 2;
      const labelY = (y1 + y2) / 2 - 6;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="diagram-edge" marker-end="url(#${markerId})" />${label ? `<text x="${labelX}" y="${labelY}" class="diagram-edge-label">${escapeHtml(label)}</text>` : ""}`;
    })
    .join("");
  const nodes = diagram.nodes
    .map((node) => {
      const centerX = node.x + nodeWidth / 2;
      const centerY = node.y + nodeHeight / 2;
      const shape =
        node.shape === "decision"
          ? `<polygon points="${centerX},${node.y - 4} ${node.x + nodeWidth + 4},${centerY} ${centerX},${node.y + nodeHeight + 4} ${node.x - 4},${centerY}" class="diagram-node diagram-decision" />`
          : `<rect x="${node.x}" y="${node.y}" width="${nodeWidth}" height="${nodeHeight}" rx="${node.shape === "round" ? 26 : 10}" class="diagram-node" />`;
      return `${shape}<text x="${centerX}" y="${centerY - 7}" class="diagram-node-label">${wrapSvgText(node.label, centerX)}</text>`;
    })
    .join("");
  return `<svg class="diagram-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(diagram.title)}"><defs><marker id="${markerId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="diagram-arrow" /></marker></defs>${lines}${nodes}</svg>`;
}

function renderDiagram(diagram) {
  const source = diagramSource(diagram);
  if (!/^flowchart\s+(?:TD|LR)\n/.test(source)) throw new Error(`Invalid Mermaid flowchart: ${diagram.id}`);
  return `<section class="study-aid diagram-aid" data-diagram-id="${escapeHtml(diagram.id)}"><div class="aid-eyebrow">AGENT-AUTHORED STUDY AID</div><h2>${escapeHtml(diagram.title)}</h2><p>${escapeHtml(diagram.description)}</p><figure class="diagram-figure" aria-labelledby="${escapeHtml(diagram.id)}-caption">${renderDiagramSvg(diagram)}<figcaption id="${escapeHtml(diagram.id)}-caption">Visual recap; the archived lesson text above remains the source of truth.</figcaption></figure><details class="diagram-source"><summary>Show Mermaid source</summary><pre><code class="language-mermaid">${escapeHtml(source)}</code></pre></details></section>`;
}

function assetHref(pageRel, assetName) {
  return relativeHref(pageRel, path.posix.join("assets", assetName));
}

function pageLink(pageRel, label, targetRel, className = "") {
  return `<a${className ? ` class="${className}"` : ""} href="${escapeHtml(relativeHref(pageRel, targetRel))}">${label}</a>`;
}

function sidebar(model, pageRel, current) {
  const home = relativeHref(pageRel, "index.html");
  const flashcards = relativeHref(pageRel, "flashcards.html");
  const exam = relativeHref(pageRel, "exam-guide.html");
  const moduleNav = model.modules
    .map((module) => {
      const moduleCurrent = current === `module:${module.dir}` || current.startsWith(`section:${module.dir}/`);
      const sectionLinks = module.sections
        .map((section, index) => {
          const active = current === `section:${section.sourceRel}`;
          const count = section.screens.length;
          return `<a class="nav-section${active ? " is-active" : ""}" href="${escapeHtml(relativeHref(pageRel, section.pageRel))}"${active ? ' aria-current="page"' : ""}><span class="nav-section-number">${String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(section.title)}</span><small>${count} ${count === 1 ? "screen" : "screens"}</small></a>`;
        })
        .join("");
      return `<div class="nav-module${moduleCurrent ? " is-current" : ""}"><a class="nav-module-heading" href="${escapeHtml(relativeHref(pageRel, module.pageRel))}"${moduleCurrent ? ' aria-current="page"' : ""}><span class="module-code">M${escapeHtml(module.id)}</span><span>${escapeHtml(module.title)}</span><small>${module.screens.length} screens</small></a><div class="nav-sections">${sectionLinks}</div></div>`;
    })
    .join("");
  return `<aside class="sidebar" id="library-nav" aria-label="Course navigation"><div class="sidebar-heading"><a href="${escapeHtml(home)}" class="sidebar-home"><span class="sidebar-mark">CCDV</span><span>Course library</span></a><button class="sidebar-close" type="button" data-nav-close aria-label="Close course navigation">×</button></div><nav>${moduleNav}</nav><div class="sidebar-footer"><a class="nav-special${current === "flashcards" ? " is-active" : ""}" href="${escapeHtml(flashcards)}"${current === "flashcards" ? ' aria-current="page"' : ""}><span>◇</span><span>Flashcards</span><small>generated study aid</small></a><a class="nav-special${current === "exam" ? " is-active" : ""}" href="${escapeHtml(exam)}"${current === "exam" ? ' aria-current="page"' : ""}><span>□</span><span>Exam blueprint</span><small>supplement</small></a><p>5 modules · 44 sections · 108 screens</p></div></aside>`;
}

function topbar(model, pageRel) {
  const home = relativeHref(pageRel, "index.html");
  return `<header class="topbar"><div class="topbar-inner"><button class="nav-toggle" type="button" data-nav-toggle aria-controls="library-nav" aria-expanded="false"><span></span><span></span><span></span><span class="sr-only">Open course navigation</span></button><a class="wordmark" href="${escapeHtml(home)}"><span class="wordmark-code">CCDV-F</span><span class="wordmark-label">FOUNDATIONS / LOCAL ARCHIVE</span></a><div class="topbar-tools"><form class="search-form" role="search" data-search-form><label class="sr-only" for="course-search">Search course content</label><input id="course-search" type="search" placeholder="Search lessons" autocomplete="off" data-search-input><kbd>/</kbd><div class="search-results" data-search-results hidden></div></form><a class="topbar-link" href="${escapeHtml(relativeHref(pageRel, "flashcards.html"))}">Flashcards</a><span class="archive-count">${model.screens.length} screens</span></div></div></header><div class="nav-scrim" data-nav-close></div>`;
}

function template(model, options) {
  const { pageRel, title, current, content, bodyClass = "", scripts = [] } = options;
  const scriptsHtml = [...scripts, "script.js"]
    .map((script) => `<script src="${escapeHtml(assetHref(pageRel, script))}" defer></script>`)
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#101822"><meta name="description" content="Local Claude Certified Developer Foundations course archive."><title>${escapeHtml(title)} · CCDV-F Foundations</title><link rel="icon" type="image/svg+xml" href="${FAVICON}"><link rel="stylesheet" href="${escapeHtml(assetHref(pageRel, "styles.css"))}">${scriptsHtml}</head><body class="${escapeHtml(bodyClass)}" data-current="${escapeHtml(current)}"><a class="skip-link" href="#main-content">Skip to content</a>${topbar(model, pageRel)}<div class="app-layout">${sidebar(model, pageRel, current)}<main id="main-content" class="main-content">${content}</main></div></body></html>`;
}

function pageHeader(module, pageRel, screenCount, sourceUrl, label = "Course archive") {
  const sourceLink = sourceUrl
    ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">Authenticated source ↗</a>`
    : "";
  return `<div class="breadcrumbs"><a href="${escapeHtml(relativeHref(pageRel, "index.html"))}">Library</a><span>/</span><a href="${escapeHtml(relativeHref(pageRel, module.pageRel))}">Module ${escapeHtml(module.id)}</a><span>/</span><span>${escapeHtml(label)}</span></div><div class="page-meta"><span class="meta-kicker">MODULE ${escapeHtml(module.id)}</span><span>${screenCount} ${screenCount === 1 ? "screen" : "screens"}</span>${sourceLink}</div>`;
}

function sectionContent(model, module, section) {
  const sourceAbs = path.join(sourceDir, section.sourceRel);
  const markdown = read(sourceAbs);
  const body = renderMarkdown(markdown, {
    sourceAbs,
    pageRel: section.pageRel,
    screens: section.screens,
  }, model);
  const diagram = diagrams.find(
    (candidate) => candidate.moduleDir === module.dir && candidate.targetFile === section.file,
  );
  const screenIndex = model.screens.findIndex((screen) => screen.sourceRel === section.sourceRel);
  const firstScreen = section.screens[0];
  const lastScreen = section.screens.at(-1);
  const previous = screenIndex > 0 ? model.screens[screenIndex - 1] : null;
  const nextIndex = screenIndex + section.screens.length;
  const next = nextIndex < model.screens.length ? model.screens[nextIndex] : null;
  const navigation = `<nav class="lesson-nav" aria-label="Lesson movement">${previous ? `<a class="lesson-nav-item previous" href="${escapeHtml(relativeHref(section.pageRel, previous.pageRel) + `#${previous.anchor}`)}"><span>← Previous screen</span><strong>${escapeHtml(previous.title)}</strong></a>` : "<span></span>"}${next ? `<a class="lesson-nav-item next" href="${escapeHtml(relativeHref(section.pageRel, next.pageRel) + `#${next.anchor}`)}"><span>Next screen →</span><strong>${escapeHtml(next.title)}</strong></a>` : "<span></span>"}</nav>`;
  const content = `${pageHeader(module, section.pageRel, section.screens.length, firstScreen?.sourceUrl || module.sourceUrl, `Section ${section.file.slice(0, 2)}`)}<article class="reader-copy">${body}</article>${diagram ? renderDiagram(diagram) : ""}${navigation}`;
  return template(model, {
    pageRel: section.pageRel,
    title: section.title,
    current: `section:${section.sourceRel}`,
    content,
    bodyClass: "reader-page",
  });
}

function moduleContent(model, module) {
  const sourceAbs = path.join(sourceDir, module.sourceRel);
  const body = renderMarkdown(read(sourceAbs), { sourceAbs, pageRel: module.pageRel, screens: [] }, model);
  const firstSection = module.sections[0];
  const content = `${pageHeader(module, module.pageRel, module.screens.length, module.sourceUrl, "Module index")}<article class="reader-copy module-index-copy">${body}</article><div class="module-start"><div><span class="aid-eyebrow">MODULE ${escapeHtml(module.id)}</span><h2>Ready to study?</h2><p>Start with the first navigation section and move through the archive in order.</p></div><a class="button-link" href="${escapeHtml(relativeHref(module.pageRel, firstSection.pageRel))}">Open first section <span>→</span></a></div>`;
  return template(model, {
    pageRel: module.pageRel,
    title: module.title,
    current: `module:${module.dir}`,
    content,
    bodyClass: "reader-page module-page",
  });
}

function indexContent(model) {
  const moduleCards = model.modules
    .map((module) => {
      const firstSection = module.sections[0];
      return `<a class="module-card" href="${escapeHtml(relativeHref("index.html", module.pageRel))}"><div class="module-card-top"><span class="module-card-code">M${escapeHtml(module.id)}</span><span class="module-card-duration">${escapeHtml(module.duration)}</span></div><h3>${escapeHtml(module.title)}</h3><p>${module.sections.length} sections · ${module.screens.length} authenticated screens</p><span class="module-card-cta">Open module <span>→</span></span><span class="module-card-first">First: ${escapeHtml(firstSection.title)}</span></a>`;
    })
    .join("");
  const content = `<div class="home-wrap"><div class="breadcrumbs"><span>Course library</span></div><section class="home-intro"><div class="eyebrow">CCDV-F · LOCAL STUDY LIBRARY</div><h1>Claude Certified Developer <em>Foundations</em></h1><p>Five archived modules, preserved lesson text, and focused study aids for working through the course in order.</p></section><section class="library-section" aria-labelledby="library-heading"><div class="section-heading"><div><span class="eyebrow">THE ARCHIVE</span><h2 id="library-heading">Course library</h2></div><span class="section-count">5 modules · 44 sections · 108 screens</span></div><div class="module-grid">${moduleCards}</div></section><section class="home-lower"><a class="supplement-card" href="exam-guide.html"><div><span class="eyebrow">SUPPLEMENT</span><h2>Exam blueprint</h2><p>Weighted domains, skill labels, and preparation emphasis from the supplied guide.</p></div><span class="arrow-box">↗</span></a><a class="study-card" href="flashcards.html"><div><span class="eyebrow">GENERATED STUDY AID</span><h2>Flashcards</h2><p>Filter by module, reveal answers, and keep local review progress.</p></div><span class="arrow-box">→</span></a></section><p class="home-footnote">Course wording is preserved from the authenticated archive. Study aids are clearly marked and never replace the lesson text.</p></div>`;
  return template(model, {
    pageRel: "index.html",
    title: "Course library",
    current: "home",
    content,
    bodyClass: "home-page",
  });
}

function examContent(model) {
  const sourceRel = "archive/exam-guide.md";
  const sourceAbs = path.join(projectDir, sourceRel);
  const pageRel = "exam-guide.html";
  const body = renderMarkdown(read(sourceAbs), { sourceAbs, pageRel, screens: [] }, model);
  const content = `<div class="breadcrumbs"><a href="index.html">Library</a><span>/</span><span>Supplement</span></div><div class="supplement-banner"><span class="eyebrow">SEPARATE SUPPLEMENT</span><strong>Exam blueprint · not course lesson text</strong><span>Use this page to orient revision priorities.</span></div><article class="reader-copy exam-copy">${body}</article>`;
  return template(model, {
    pageRel,
    title: "Exam blueprint",
    current: "exam",
    content,
    bodyClass: "reader-page supplement-page",
  });
}

function flashcardData() {
  if (!fs.existsSync(flashcardsPath)) return { cards: [] };
  try {
    const parsed = JSON.parse(read(flashcardsPath));
    return Array.isArray(parsed) ? { cards: parsed } : parsed;
  } catch (error) {
    throw new Error(`Could not parse ${flashcardsPath}: ${error.message}`);
  }
}

function prepareFlashcardData(data, model) {
  const cards = Array.isArray(data.cards) ? data.cards : [];
  const modulesByTitle = new Map(model.modules.map((module) => [module.title, module]));
  return {
    ...data,
    cards: cards.map((card) => {
      const source = card.source || {};
      const sourceRel = String(source.path || "").replace(/^course extraction\//, "");
      const targetPage = model.sourceToOutput.get(sourceRel) || (sourceRel === "archive/exam-guide.md" ? "exam-guide.html" : "");
      const module = modulesByTitle.get(card.module);
      return {
        ...card,
        moduleId: String(card.moduleOrder || module?.id || card.module || "all"),
        moduleTitle: String(card.module || "Course archive"),
        sectionTitle: String(card.lesson || source.heading || "Lesson section"),
        localHref: targetPage ? `${relativeHref("flashcards.html", targetPage)}${source.anchor ? `#${source.anchor}` : ""}` : "",
        sourceHref: source.courseUrl || source.href || "",
        sourceKind: source.kind || "authenticated-course",
        objectives: card.examObjectives || card.objectives || [],
        explanation: card.explanation || card.answerNotes || "",
      };
    }),
  };
}

function flashcardsContent(model, data) {
  const cardCount = Array.isArray(data.cards) ? data.cards.length : 0;
  const objectiveCount = Array.isArray(data.examObjectives) ? data.examObjectives.length : 27;
  const guideOnlyCount = Array.isArray(data.cards) ? data.cards.filter((card) => card.source?.kind === "exam-guide-only").length : 0;
  const content = `<div class="breadcrumbs"><a href="index.html">Library</a><span>/</span><span>Generated study aid</span></div><section class="flashcards-intro"><div class="eyebrow">GENERATED STUDY AID · SEPARATE FROM VERBATIM TEXT</div><h1>Flashcards</h1><p>Recall the idea first, then reveal the archived answer and trace it back to the lesson. ${cardCount} cards cover all ${objectiveCount} detailed exam objectives${guideOnlyCount ? `, including ${guideOnlyCount} exam-guide supplements` : ""}.</p></section><section class="flashcards-workspace" aria-label="Flashcard study area"><div class="flashcard-controls"><label>Module<select id="module-filter" data-module-filter><option value="all">All modules</option></select></label><label>Status<select id="status-filter" data-status-filter><option value="all">All cards</option><option value="unseen">Needs a pass</option><option value="review">Needs review</option><option value="known">Known</option></select></label><div class="flashcard-progress" aria-live="polite"><span data-progress-count>0 / 0 reviewed</span><div class="progress-track"><span data-progress-bar></span></div></div></div><div class="flashcard-root" data-flashcard-root><div class="flashcard-empty">Loading flashcards…</div></div></section>`;
  return template(model, {
    pageRel: "flashcards.html",
    title: "Flashcards",
    current: "flashcards",
    content,
    bodyClass: "study-aid-page flashcards-page",
    scripts: ["flashcards-data.js", "flashcards.js"],
  });
}

function writeOutput(model, data) {
  const preparedCards = prepareFlashcardData(data, model);
  fs.mkdirSync(path.join(outputDir, "assets"), { recursive: true });
  fs.mkdirSync(path.join(outputDir, "data"), { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), indexContent(model));
  fs.writeFileSync(path.join(outputDir, "exam-guide.html"), examContent(model));
  fs.writeFileSync(path.join(outputDir, "flashcards.html"), flashcardsContent(model, data));
  for (const module of model.modules) {
    fs.mkdirSync(path.join(outputDir, module.dir), { recursive: true });
    fs.writeFileSync(path.join(outputDir, module.pageRel), moduleContent(model, module));
    for (const section of module.sections) {
      fs.writeFileSync(path.join(outputDir, section.pageRel), sectionContent(model, module, section));
    }
  }
  const siteData = {
    modules: model.modules.map((module) => ({
      id: module.id,
      dir: module.dir,
      title: module.title,
      page: module.pageRel,
      sections: module.sections.map((section) => ({ title: section.title, page: section.pageRel })),
    })),
    screens: model.screens.map((screen, index) => ({
      id: screen.screenId,
      title: screen.title,
      module: screen.moduleTitle,
      section: screen.sourceRel.split("/").at(-1).replace(/\.md$/, ""),
      href: `${screen.pageRel}#${screen.anchor}`,
      source: screen.sourceUrl,
      order: index + 1,
    })),
  };
  fs.writeFileSync(path.join(outputDir, "assets", "site-data.js"), `window.COURSE_DATA = ${JSON.stringify(siteData)};\n`);
  fs.writeFileSync(path.join(outputDir, "assets", "flashcards-data.js"), `window.FLASHCARD_DATA = ${JSON.stringify(preparedCards)};\n`);
}

function walkFiles(dir, extension) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(full, extension));
    else if (!extension || entry.name.endsWith(extension)) files.push(full);
  }
  return files;
}

function assertBalanced(text, open, close, label) {
  let depth = 0;
  for (const character of text) {
    if (character === open) depth += 1;
    if (character === close) depth -= 1;
    if (depth < 0) throw new Error(`Unbalanced ${label}`);
  }
  if (depth !== 0) throw new Error(`Unbalanced ${label}`);
}

function verify(model, data) {
  const htmlFiles = walkFiles(outputDir, ".html");
  const expectedHtml = 1 + 1 + 1 + model.modules.length + model.modules.reduce((sum, module) => sum + module.sections.length, 0);
  if (htmlFiles.length !== expectedHtml) throw new Error(`Expected ${expectedHtml} HTML pages, found ${htmlFiles.length}`);
  if (model.modules.length !== 5) throw new Error(`Expected 5 modules, found ${model.modules.length}`);
  const sectionCount = model.modules.reduce((sum, module) => sum + module.sections.length, 0);
  if (sectionCount !== 44) throw new Error(`Expected 44 sections, found ${sectionCount}`);
  if (model.screens.length !== 108) throw new Error(`Expected 108 screens, found ${model.screens.length}`);
  if (model.screens.some((screen) => !screen.sourceUrl)) throw new Error("An authenticated screen is missing its exact course URL");

  const hrefPattern = /href="([^"]+)"/g;
  let screenBlockCount = 0;
  for (const file of htmlFiles) {
    const pageRel = path.relative(outputDir, file).split(path.sep).join("/");
    const html = read(file);
    screenBlockCount += (html.match(/data-screen=/g) || []).length;
    if (html.includes("file:///") || /href="[^"]*\.md(?:#|\")/.test(html)) {
      throw new Error(`Source-machine or Markdown link remains in ${pageRel}`);
    }
    for (const match of html.matchAll(hrefPattern)) {
      const href = match[1];
      if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(href)) continue;
      const [targetPath, targetHash] = href.split("#");
      const targetAbs = path.resolve(path.dirname(file), targetPath || path.basename(file));
      if (!fs.existsSync(targetAbs)) throw new Error(`Broken local link ${href} in ${pageRel}`);
      if (targetHash) {
        const targetHtml = read(targetAbs);
        if (!new RegExp(`id="${targetHash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(targetHtml)) {
          throw new Error(`Missing anchor #${targetHash} in ${pageRel}`);
        }
      }
    }
  }
  if (screenBlockCount !== model.screens.length) {
    throw new Error(`Expected ${model.screens.length} screen blocks, found ${screenBlockCount}`);
  }

  for (const screen of model.screens) {
    const page = path.join(outputDir, screen.pageRel);
    if (!new RegExp(`id="${screen.anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(read(page))) {
      throw new Error(`Screen anchor missing: ${screen.sourceRel}#${screen.anchor}`);
    }
  }

  for (const diagram of diagrams) {
    const pageRel = path.posix.join(diagram.moduleDir, diagram.targetFile.replace(/\.md$/, ".html"));
    const html = read(path.join(outputDir, pageRel));
    if (!html.includes(`data-diagram-id="${diagram.id}"`) || !html.includes("flowchart ") || !html.includes("<svg")) {
      throw new Error(`Diagram missing or unrendered: ${diagram.id}`);
    }
  }

  assertBalanced(read(path.join(outputDir, "assets", "styles.css")), "{", "}", "CSS braces");
  const cards = Array.isArray(data.cards) ? data.cards : [];
  if (cards.length) {
    if (cards.some((card) => !(card.id || card.question || card.front) || !(card.answer || card.back))) {
      throw new Error("Every flashcard needs an id, question/front, and answer/back");
    }
    if (!read(path.join(outputDir, "flashcards.html")).includes("data-module-filter")) {
      throw new Error("Flashcard filters are missing");
    }
    const objectiveIds = new Set((data.examObjectives || []).map((objective) => objective.id));
    const coveredObjectiveIds = new Set(cards.flatMap((card) => card.examObjectives || card.objectives || []));
    if (objectiveIds.size !== 27 || [...objectiveIds].some((id) => !coveredObjectiveIds.has(id))) {
      throw new Error(`Flashcards do not cover all 27 detailed exam objectives`);
    }
    const prepared = read(path.join(outputDir, "assets", "flashcards-data.js"));
    if (!prepared.includes("localHref") || !prepared.includes("sourceHref")) {
      throw new Error("Flashcard source traceability was not prepared");
    }
    for (const card of prepareFlashcardData(data, model).cards) {
      if (!card.localHref) throw new Error(`Flashcard ${card.id} is missing a local source link`);
      const [targetPath, targetHash] = card.localHref.split("#");
      const targetAbs = path.resolve(outputDir, targetPath);
      if (!fs.existsSync(targetAbs)) throw new Error(`Flashcard ${card.id} points to a missing source page`);
      if (targetHash && !new RegExp(`id="${targetHash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(read(targetAbs))) {
        throw new Error(`Flashcard ${card.id} points to a missing source anchor`);
      }
    }
  }
  console.log(`Verified ${model.modules.length} modules, ${sectionCount} sections, ${model.screens.length} screens, ${diagrams.length} diagrams, and ${cards.length} flashcards across ${htmlFiles.length} HTML pages.`);
}

const model = buildModel();
const data = flashcardData();
writeOutput(model, data);
if (process.argv.includes("--verify")) verify(model, data);
else console.log(`Built ${model.modules.length} modules, ${model.screens.length} screens, and ${diagrams.length} study-aid diagrams.`);
