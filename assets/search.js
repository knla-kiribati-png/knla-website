// Shared catalogue / archives search.
// Loads records from the Apps Script API (Google Sheet) if configured,
// otherwise from the local sample JSON file.

(function () {
  "use strict";

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function safeUrl(u) {
    u = String(u || "").trim();
    return /^https?:\/\//i.test(u) ? u : "";
  }

  // Bookmarks are saved in the visitor's own browser only.
  function readStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; }
  }
  function writeStore(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage blocked */ }
  }

  async function loadRecords(table, fallbackUrl) {
    var api = (window.KNLA_CONFIG && window.KNLA_CONFIG.API_URL) || "";
    if (api) {
      try {
        var r = await fetch(api + "?table=" + encodeURIComponent(table));
        if (r.ok) {
          var data = await r.json();
          if (Array.isArray(data)) return data;
        }
      } catch (e) {
        console.warn("API unavailable, using sample data:", e);
      }
    }
    var res = await fetch(fallbackUrl);
    return res.json();
  }

  /**
   * opts: {
   *   root: element, table: "Catalogue", fallback: "../data/catalogue.json",
   *   idField, searchFields: [], filterField, filterLabel,
   *   bookmarkKey (optional), renderItem(record, helpers) -> html
   * }
   */
  async function initSearch(opts) {
    var root = opts.root;
    var input = root.querySelector("[data-search]");
    var select = root.querySelector("[data-filter]");
    var onlyBm = root.querySelector("[data-only-bookmarks]");
    var list = root.querySelector("[data-results]");
    var count = root.querySelector("[data-count]");

    list.innerHTML = '<div class="empty">Loading…</div>';

    var records;
    try {
      records = await loadRecords(opts.table, opts.fallback);
    } catch (e) {
      list.innerHTML = '<div class="empty">Could not load records. Please try again later.</div>';
      return;
    }

    // Build filter dropdown from the data
    if (select && opts.filterField) {
      var values = Array.from(new Set(records.map(function (r) { return r[opts.filterField]; }).filter(Boolean))).sort();
      select.innerHTML = '<option value="">All ' + esc(opts.filterLabel) + "</option>" +
        values.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + "</option>"; }).join("");
    }

    var bookmarks = opts.bookmarkKey ? readStore(opts.bookmarkKey) : [];

    function isBookmarked(id) { return bookmarks.indexOf(String(id)) !== -1; }

    function render() {
      var q = (input.value || "").trim().toLowerCase();
      var terms = q.split(/\s+/).filter(Boolean);
      var f = select ? select.value : "";
      var bmOnly = onlyBm && onlyBm.checked;

      var hits = records.filter(function (r) {
        if (f && r[opts.filterField] !== f) return false;
        if (bmOnly && !isBookmarked(r[opts.idField])) return false;
        if (!terms.length) return true;
        var hay = opts.searchFields.map(function (k) { return r[k] || ""; }).join(" ").toLowerCase();
        return terms.every(function (t) { return hay.indexOf(t) !== -1; });
      });

      count.textContent = hits.length + " of " + records.length + " records";

      if (!hits.length) {
        list.innerHTML = '<div class="empty">No records match your search.</div>';
        return;
      }

      list.innerHTML = hits.map(function (r) {
        return opts.renderItem(r, { esc: esc, safeUrl: safeUrl, isBookmarked: isBookmarked });
      }).join("");
    }

    list.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-bookmark]");
      if (!btn || !opts.bookmarkKey) return;
      var id = btn.getAttribute("data-bookmark");
      var i = bookmarks.indexOf(id);
      if (i === -1) bookmarks.push(id); else bookmarks.splice(i, 1);
      writeStore(opts.bookmarkKey, bookmarks);
      render();
    });

    input.addEventListener("input", render);
    if (select) select.addEventListener("change", render);
    if (onlyBm) onlyBm.addEventListener("change", render);
    render();
  }

  window.KNLA = { initSearch: initSearch };
})();
