(() => {
  const body = document.body;
  const nav = document.querySelector("#library-nav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const closeNav = () => {
    body.classList.remove("nav-open");
    nav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  };
  navToggle?.addEventListener("click", () => {
    const open = !body.classList.contains("nav-open");
    body.classList.toggle("nav-open", open);
    nav?.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll("[data-nav-close]").forEach((element) => element.addEventListener("click", closeNav));
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const data = window.COURSE_DATA || { screens: [] };
  const normalize = (value) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  const closeResults = () => {
    if (!results) return;
    results.hidden = true;
    results.innerHTML = "";
  };
  const renderResults = (query) => {
    if (!results) return;
    const needle = normalize(query);
    if (!needle) return closeResults();
    const terms = needle.split(/\s+/);
    const matches = data.screens
      .filter((screen) => terms.every((term) => normalize(`${screen.title} ${screen.module} ${screen.section}`).includes(term)))
      .slice(0, 8);
    results.hidden = false;
    results.innerHTML = matches.length
      ? matches.map((screen) => `<a class="search-result" href="${escapeHtml(screen.href)}"><strong>${escapeHtml(screen.title)}</strong><small>${escapeHtml(screen.id)} · ${escapeHtml(screen.module)} · ${escapeHtml(screen.section)}</small></a>`).join("")
      : '<div class="search-empty">No matching lesson screens.</div>';
  };
  input?.addEventListener("input", () => renderResults(input.value));
  input?.addEventListener("focus", () => { if (input.value) renderResults(input.value); });
  document.addEventListener("click", (event) => {
    if (results && input && !results.contains(event.target) && event.target !== input) closeResults();
  });
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName;
    if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
      event.preventDefault();
      input?.focus();
    }
    if (event.key === "Escape") {
      closeResults();
      if (document.activeElement === input) input.blur();
      closeNav();
    }
  });
})();
