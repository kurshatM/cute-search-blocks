/**
 * Cute Search Blocks — Content Script
 * Scrapes Google search results, categorizes them, and renders a cute grid.
 */

(() => {
  'use strict';

  // ── Google Selectors (resilient, with fallbacks) ────────────────────
  // Google frequently changes class names, so we try several. Matching all
  // of them in one query keeps results in document order.
  const RESULT_SELECTOR = [
    'div.g:not(.g-blk)',               // Classic organic result
    'div[data-sokoban-container]',      // Newer organic result wrapper
    'div.tF2Cxc',                       // Inner result card
    'div.N54PNb',                       // Another result variant
  ].join(',');

  const CONTAINER_SELECTORS = ['#search', '#rso'];

  const TITLE_SELECTORS = ['h3', '[role="heading"]', 'a[href] div[role="link"]'];

  const SNIPPET_SELECTORS = [
    '[data-sncf]',
    '.VwiC3b',
    '[style*="-webkit-line-clamp"]',
    '.lEBKkf',
    '.s3v9rd',
    'span.aCOpRe',
    'div.IsZvec',
  ];

  // Blocks inside these wrappers duplicate or aren't organic results.
  const EXCLUDED_ANCESTORS = '.related-question-pair';

  const GRID_ID = 'cute-blocks-grid';
  const TOGGLE_ID = 'cute-blocks-toggle';
  const HIDDEN_CLASS = 'cute-blocks-original-hidden';

  // ── Scraper ─────────────────────────────────────────────────────────
  function queryFirst(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function findResultsContainer() {
    return queryFirst(document, CONTAINER_SELECTORS);
  }

  function scrapeResults(container) {
    const results = [];
    const seen = new Set();

    for (const el of container.querySelectorAll(RESULT_SELECTOR)) {
      if (el.closest(EXCLUDED_ANCESTORS)) continue;

      const titleEl = queryFirst(el, TITLE_SELECTORS);
      const title = titleEl?.textContent.trim();
      if (!title) continue;

      // Prefer the link wrapping the title over e.g. sitelinks or translate links.
      const anchor = titleEl.closest('a[href^="http"]') || el.querySelector('a[href^="http"]');
      if (!anchor || seen.has(anchor.href)) continue;

      let domain;
      try { domain = new URL(anchor.href).hostname.replace(/^www\./, ''); } catch { continue; }

      seen.add(anchor.href);
      results.push({
        title,
        url: anchor.href,
        domain,
        snippet: queryFirst(el, SNIPPET_SELECTORS)?.textContent.trim() ?? '',
      });
    }

    return results;
  }

  // ── Card Builder ────────────────────────────────────────────────────
  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return h >>> 0;
  }

  // Pick 3-4 doodles deterministically per URL so re-renders look stable.
  function pickIcons(icons, seed) {
    const count = Math.min(3 + (seed & 1), icons.length);
    const start = (seed >>> 1) % icons.length;
    return Array.from({ length: count }, (_, i) => icons[(start + i) % icons.length]);
  }

  function escapeHtml(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  function buildCard(result) {
    const category = CuteCategories.classify(result);
    const label = CuteCategories.LABELS[category];
    const doodles = pickIcons(CuteIcons.forCategory(category), hashString(result.url))
      .map(svg => `<div class="cute-doodle-icon">${svg}</div>`)
      .join('');
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.domain)}&sz=64`;
    const snippet = result.snippet
      ? `<div class="cute-block-snippet">${escapeHtml(result.snippet)}</div>`
      : '';

    const card = document.createElement('a');
    card.className = 'cute-block-card';
    card.href = result.url;
    card.dataset.category = category;
    card.innerHTML = `
      ${doodles}
      <div class="cute-block-header">
        <img class="cute-block-favicon" src="${faviconUrl}" alt="" loading="lazy">
        <span class="cute-block-domain">${escapeHtml(result.domain)}</span>
      </div>
      <div class="cute-block-title">${escapeHtml(result.title)}</div>
      ${snippet}
      <span class="cute-block-tag">${escapeHtml(label)}</span>
    `;

    // Inline onerror handlers are blocked by Google's CSP; attach it here.
    card.querySelector('img').addEventListener('error', e => { e.target.hidden = true; });

    return card;
  }

  // ── Render / Toggle ─────────────────────────────────────────────────
  let rendered = null; // { grid, container, signature }
  let isCuteView = true;

  function teardown() {
    if (!rendered) return;
    rendered.grid.remove();
    rendered.container.classList.remove(HIDDEN_CLASS);
    rendered = null;
  }

  function applyView() {
    if (rendered) {
      rendered.grid.classList.toggle(HIDDEN_CLASS, !isCuteView);
      rendered.container.classList.toggle(HIDDEN_CLASS, isCuteView);
    }
    const btn = document.getElementById(TOGGLE_ID);
    if (btn) {
      btn.innerHTML = isCuteView
        ? '<span class="toggle-icon" aria-hidden="true">✨</span> Cute View'
        : '<span class="toggle-icon" aria-hidden="true">🔍</span> Standard View';
      btn.classList.toggle('is-standard', !isCuteView);
      btn.setAttribute('aria-pressed', String(isCuteView));
    }
  }

  function ensureToggle() {
    if (document.getElementById(TOGGLE_ID)) return;
    const btn = document.createElement('button');
    btn.id = TOGGLE_ID;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      isCuteView = !isCuteView;
      applyView();
    });
    document.body.appendChild(btn);
  }

  /**
   * Bring the grid in line with the current page: render when results
   * appear, re-render when they change (navigation, "more results"), and
   * clean up when they disappear. Safe to call repeatedly.
   */
  function sync() {
    const container = findResultsContainer();
    const results = container ? scrapeResults(container) : [];
    const signature = results.map(r => r.url).join('\n');

    if (rendered && rendered.grid.isConnected &&
        rendered.container === container && rendered.signature === signature) {
      return;
    }

    teardown();
    if (results.length === 0) {
      document.getElementById(TOGGLE_ID)?.remove();
      return;
    }

    const grid = document.createElement('div');
    grid.id = GRID_ID;
    grid.append(...results.map(buildCard));
    container.before(grid);

    rendered = { grid, container, signature };
    ensureToggle();
    applyView();
  }

  // ── Initialization ──────────────────────────────────────────────────
  // Google loads and swaps results dynamically; re-sync at most once per
  // frame after DOM changes. Our own writes trigger one no-op sync.
  let syncQueued = false;
  new MutationObserver(() => {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(() => {
      syncQueued = false;
      sync();
    });
  }).observe(document.body, { childList: true, subtree: true });

  sync();
})();
