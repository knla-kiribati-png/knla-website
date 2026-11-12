# KNLA Website – Stage 1

Kiribati National Library and Archives website: static pages hosted on **GitHub Pages**, with the catalogue data kept in a **Google Sheet** (MoE Google Workspace) and served by **Google Apps Script**.

## What's in this folder

| Path | What it is |
|---|---|
| `index.html` | Home page |
| `library/index.html` | Library: catalogue search (OPAC + bookmarks + online copies), hours/rules/fees, membership, other resources |
| `archives/index.html` | Archives: archives search + metadata, access rules/fees, access requests |
| `assets/style.css` | Design for all pages |
| `assets/search.js` | Search code shared by Library and Archives |
| `assets/config.js` | **The one setting you edit**: the Apps Script URL |
| `data/*.json` | Sample data, used until the Google Sheet is connected |
| `data/*-sheet-template.csv` | Column layouts to import into the Google Sheet |
| `apps-script/Code.gs` | Backend code to paste into the Google Sheet's Apps Script |

Anything marked **[EDIT]** in red on the pages is placeholder text to replace with real KNLA information.

---

## Step 1 – Put the site on GitHub Pages

1. Create a GitHub account/organization with a Ministry email (e.g. organization `knla-kiribati`).
2. Create a new **public** repository, e.g. `knla-website`.
3. Click **Add file → Upload files**, drag in **everything in this folder** (keep the folders), and commit.
4. Go to **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
5. After 1–2 minutes the site is live at `https://knla-kiribati.github.io/knla-website/`.

The search works right away using the sample data.

## Step 2 – Create the Google Sheet (MoE Workspace)

1. In Google Drive (moe.gov.ki account) create a **Shared Drive** called `KNLA Website`.
2. Inside it, create a Google Sheet called `KNLA Catalogue`.
3. Rename the first tab to `Catalogue`; add a second tab `Archives`.
4. In each tab: **File → Import → Upload** the matching CSV from `data/` → *Replace current sheet*.
5. Replace the sample rows with real records. Keep row 1 headers exactly as they are.

**Columns**

- `Catalogue`: ID, Title, Author, Year, Subject, Type, CallNumber, Status, OnlineCopy
  - `Status`: *Available*, *On loan* or *Reference only*
  - `OnlineCopy`: a Google Drive link to the PDF (file shared as "Anyone with the link – Viewer"), or leave blank
- `Archives`: RefNo, Title, Creator, DateRange, Series, Format, Extent, Access, Description
  - `Access`: *Open* or *Restricted*
- Add a column whose name starts with `_` (e.g. `_StaffNotes`) for internal notes – it is never shown publicly.

## Step 3 – Connect the Sheet to the website

1. In the Sheet: **Extensions → Apps Script**, paste the contents of `apps-script/Code.gs`, save.
2. **Deploy → New deployment** → type **Web app** → Execute as **Me** → Who has access **Anyone** → Deploy → authorise.
3. Copy the **Web app URL** (ends in `/exec`).
4. On GitHub, open `assets/config.js` → edit (pencil) → paste the URL into `API_URL: ""` → commit.
5. Reload the website – the search now shows the real Sheet data (changes appear within ~5 minutes).

> If "Anyone" is not offered in step 2, the MoE Workspace admin has blocked public web apps. Ask them to allow it for this project.

## Step 4 – Custom domain (later)

1. Ask the .gov.ki DNS administrator to add a CNAME record: `knla.gov.ki` → `knla-kiribati.github.io`
   (for a root domain they may need GitHub's A records instead – see GitHub docs "Managing a custom domain").
2. In **Settings → Pages → Custom domain**, enter `knla.gov.ki` and tick **Enforce HTTPS**.
3. Library and Archives will be at `knla.gov.ki/library/` and `knla.gov.ki/archives/`.
   `library.knla.gov.ki` / `archives.knla.gov.ki` can redirect there later.

## Coming next

- **Stage 3** – Online membership and archive access request forms → saved to a private Sheet.
- **Stage 4** – Staff dashboard (moe.gov.ki logins only): confirm payment → automatic PDF receipt email → approval to borrow / access email.

## Notes

- Bookmarks are saved in each visitor's own browser (no login needed).
- Never put personal data (members, requests, payments) in the `Catalogue` or `Archives` tabs or in this GitHub repository – the repository is public.
