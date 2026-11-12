/**
 * KNLA PUBLIC API – Google Apps Script
 * ------------------------------------------------------------
 * Serves the Library Catalogue and Archives catalogue from a
 * Google Sheet to the public website on GitHub Pages.
 *
 * SETUP
 * 1. In the MoE Shared Drive "KNLA Website", create a Google Sheet
 *    named "KNLA Catalogue".
 * 2. Make two tabs named exactly:  Catalogue   and   Archives
 *    Import data/catalogue-sheet-template.csv and
 *    data/archives-sheet-template.csv (File → Import → Replace current sheet).
 *    Row 1 must be the column headers.
 * 3. In the Sheet: Extensions → Apps Script. Delete the sample code
 *    and paste this whole file.
 * 4. Deploy → New deployment → type "Web app"
 *       Execute as:      Me
 *       Who has access:  Anyone
 *    Copy the Web App URL (ends in /exec) into assets/config.js.
 * 5. After any change to this code: Deploy → Manage deployments →
 *    Edit (pencil) → Version: New version → Deploy.
 *
 * SECURITY
 * - This script is READ-ONLY and only exposes the tabs listed in
 *   PUBLIC_TABLES. Never add tabs with personal data (members,
 *   requests, payments) to that list.
 * - Columns whose header starts with "_" (e.g. "_StaffNotes") are
 *   hidden from the public, so staff can keep internal notes.
 */

const PUBLIC_TABLES = ["Catalogue", "Archives"];
const CACHE_SECONDS = 300; // 5 minutes – edits in the Sheet show on the site within 5 min

function doGet(e) {
  const table = (e && e.parameter && e.parameter.table) || "";

  if (PUBLIC_TABLES.indexOf(table) === -1) {
    return json_({ error: "Unknown table" });
  }

  // Try the cache first (faster for visitors, fewer Sheet reads)
  const cache = CacheService.getScriptCache();
  const cached = cache.get("table:" + table);
  if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(table);
  if (!sheet) return json_({ error: "Tab not found: " + table });

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return json_([]);

  const headers = values[0].map(function (h) { return String(h).trim(); });
  const rows = values.slice(1)
    .filter(function (r) { return r.some(function (c) { return String(c).trim() !== ""; }); })
    .map(function (r) {
      const obj = {};
      headers.forEach(function (h, i) {
        if (h && h.charAt(0) !== "_") obj[h] = r[i];
      });
      return obj;
    });

  const out = JSON.stringify(rows);
  try { cache.put("table:" + table, out, CACHE_SECONDS); } catch (err) { /* over 100 KB – skip cache */ }
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

/** Run this manually from the editor after big edits to show changes immediately. */
function clearCache() {
  CacheService.getScriptCache().removeAll(PUBLIC_TABLES.map(function (t) { return "table:" + t; }));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
