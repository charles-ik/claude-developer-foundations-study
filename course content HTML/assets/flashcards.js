(() => {
  const root = document.querySelector("[data-flashcard-root]");
  if (!root) return;
  const raw = window.FLASHCARD_DATA || { cards: [] };
  const cards = (Array.isArray(raw) ? raw : raw.cards || []).map((card, index) => ({
    id: String(card.id || `card-${index + 1}`),
    question: String(card.question || card.front || card.prompt || ""),
    answer: String(card.answer || card.back || ""),
    explanation: card.explanation ? String(card.explanation) : card.answerNotes ? String(card.answerNotes) : "",
    moduleId: String(card.moduleId || card.moduleOrder || card.module?.id || card.module || "all"),
    moduleTitle: String(card.moduleTitle || card.module?.title || card.moduleName || card.module || "Course archive"),
    sectionTitle: String(card.sectionTitle || card.lesson || card.source?.heading || card.section?.title || card.section || "Lesson section"),
    localHref: String(card.localHref || card.source?.localHref || card.href || ""),
    sourceHref: String(card.sourceHref || card.source?.courseUrl || card.source?.href || card.sourceUrl || ""),
    sourceKind: String(card.sourceKind || card.source?.kind || "authenticated-course"),
    objectives: Array.isArray(card.objectives) ? card.objectives.map(String) : Array.isArray(card.examObjectives) ? card.examObjectives.map(String) : card.objective ? [String(card.objective)] : [],
  })).filter((card) => card.question && card.answer);
  const moduleFilter = document.querySelector("[data-module-filter]");
  const statusFilter = document.querySelector("[data-status-filter]");
  const progressCount = document.querySelector("[data-progress-count]");
  const progressBar = document.querySelector("[data-progress-bar]");
  const storageKey = "ccdv-f-flashcard-progress-v1";
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { progress = {}; }
  const state = { module: "all", status: "all", index: 0, revealed: false, draft: "" };
  const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch {} };
  const statusOf = (card) => progress[card.id] || "unseen";
  const filteredCards = () => cards.filter((card) => (state.module === "all" || card.moduleId === state.module || card.moduleTitle === state.module) && (state.status === "all" || statusOf(card) === state.status));
  const currentCard = () => filteredCards()[state.index];
  const fillModules = () => {
    if (!moduleFilter) return;
    const modules = [...new Map(cards.map((card) => [card.moduleId, card.moduleTitle])).entries()];
    moduleFilter.innerHTML = '<option value="all">All modules</option>' + modules.map(([id, title]) => `<option value="${escapeHtml(id)}">${escapeHtml(title)}</option>`).join("");
  };
  const updateProgress = () => {
    const known = cards.filter((card) => statusOf(card) === "known").length;
    const reviewed = cards.filter((card) => statusOf(card) !== "unseen").length;
    if (progressCount) progressCount.textContent = `${reviewed} / ${cards.length} reviewed · ${known} known`;
    if (progressBar) progressBar.style.width = cards.length ? `${Math.round((reviewed / cards.length) * 100)}%` : "0%";
  };
  const render = () => {
    const matches = filteredCards();
    state.index = matches.length ? Math.min(state.index, matches.length - 1) : 0;
    const card = matches[state.index];
    updateProgress();
    if (!card) {
      root.innerHTML = cards.length ? '<div class="flashcard-empty"><strong>No cards match these filters.</strong>Change the module or status filter to continue.</div>' : '<div class="flashcard-empty"><strong>Flashcards are not loaded yet.</strong>The generated card dataset will appear here when it is added to the study library.</div>';
      return;
    }
    const status = statusOf(card);
    const sourceLabel = card.sourceKind === "exam-guide-only" ? "Exam guide supplement" : "Course-backed card";
    const sourceLinks = [card.localHref ? `<a href="${escapeHtml(card.localHref)}">Open local source ↗</a>` : "", card.sourceHref ? `<a href="${escapeHtml(card.sourceHref)}" target="_blank" rel="noreferrer">Authenticated source ↗</a>` : ""].filter(Boolean).join("");
    const objectives = card.objectives.length ? `<div class="flashcard-objectives">Exam coverage: ${card.objectives.map(escapeHtml).join(" · ")}</div>` : "";
    root.innerHTML = `<article class="flashcard-shell"><div class="flashcard-topline"><span class="flashcard-id">Card ${state.index + 1} of ${matches.length} · ${escapeHtml(card.moduleTitle)}</span><span class="flashcard-status ${status === "known" ? "known" : status === "review" ? "review" : ""}">${status === "known" ? "Known" : status === "review" ? "Needs review" : "Unseen"}</span></div><div class="flashcard-provenance">${escapeHtml(sourceLabel)}</div><h2 class="flashcard-question">${escapeHtml(card.question)}</h2><label class="sr-only" for="flashcard-draft">Your answer</label><textarea id="flashcard-draft" class="flashcard-answer-input" placeholder="Write a short answer before revealing it…">${escapeHtml(state.draft)}</textarea><div class="flashcard-actions"><button class="primary-action" type="button" data-card-action="reveal">${state.revealed ? "Answer shown" : "Submit / reveal answer"}</button><button type="button" data-card-action="known" aria-pressed="${status === "known"}">Mark known</button><button type="button" data-card-action="review" aria-pressed="${status === "review"}">Needs review</button></div>${state.revealed ? `<div class="flashcard-answer"><h3>Archived answer</h3><p>${escapeHtml(card.answer)}</p>${card.explanation ? `<p>${escapeHtml(card.explanation)}</p>` : ""}</div>` : ""}${sourceLinks ? `<div class="flashcard-source"><span>${escapeHtml(card.sectionTitle)}</span>${sourceLinks}</div>` : ""}${objectives}<div class="flashcard-nav"><button type="button" data-card-action="previous">← Previous</button><button type="button" data-card-action="next">Next →</button></div></article>`;
    root.querySelector("#flashcard-draft")?.addEventListener("input", (event) => { state.draft = event.target.value; });
  };
  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-card-action]");
    if (!button) return;
    const matches = filteredCards();
    if (button.dataset.cardAction === "reveal") state.revealed = true;
    if (button.dataset.cardAction === "known" || button.dataset.cardAction === "review") {
      const card = matches[state.index];
      if (card) { progress[card.id] = button.dataset.cardAction; persist(); state.revealed = true; }
    }
    if (button.dataset.cardAction === "next") { state.index = matches.length ? (state.index + 1) % matches.length : 0; state.revealed = false; state.draft = ""; }
    if (button.dataset.cardAction === "previous") { state.index = matches.length ? (state.index - 1 + matches.length) % matches.length : 0; state.revealed = false; state.draft = ""; }
    render();
  });
  moduleFilter?.addEventListener("change", () => { state.module = moduleFilter.value; state.index = 0; state.revealed = false; state.draft = ""; render(); });
  statusFilter?.addEventListener("change", () => { state.status = statusFilter.value; state.index = 0; state.revealed = false; state.draft = ""; render(); });
  document.addEventListener("keydown", (event) => {
    if (document.activeElement?.tagName === "TEXTAREA" || !cards.length) return;
    if (event.key === "ArrowRight") root.querySelector('[data-card-action="next"]')?.click();
    if (event.key === "ArrowLeft") root.querySelector('[data-card-action="previous"]')?.click();
    if (event.key.toLowerCase() === "r") { state.revealed = true; render(); }
  });
  fillModules();
  render();
})();
