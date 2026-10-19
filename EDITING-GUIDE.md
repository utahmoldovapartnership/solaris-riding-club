# Solaris Riding Club — editing & hosting guide

**Live website:** https://solaris-riding-club.vercel.app/

## One-tap access to the website (iPhone)
Open **https://solaris-riding-club.vercel.app/** in Safari → tap the **Share** button
→ **Add to Home Screen**. You now have an app-style icon that opens the landing page in
a single tap. (On Android Chrome: menu ⋮ → **Add to Home screen**.)

The live link is also shown at the very top of the Pages CMS editor, under
**"🌐 Your website — open it any time."**

---


The website now has a friendly **edit view** so the client can change the copy,
prices and images herself — no code. This document explains how it all fits
together and the exact steps to turn it on.

---

## How it works (the short version)

- All editable content lives in **`content/site.json`** (text in English + Russian,
  prices, image names, contact details).
- When someone saves an edit, it is committed to GitHub, and **Vercel** rebuilds the
  site automatically (runs `node build.js`, which turns `content/site.json` into
  `index.html`). A minute later the change is live.
- The client never touches code — she uses **Pages CMS**, a free editor that shows
  nice forms. She signs in with her **GitHub account** and clicks **Save**.

```
Client edits in Pages CMS  →  saved to GitHub  →  Vercel rebuilds  →  live site updates
```

---

## Part A — One-time setup (do this once)

### 1) Put the site live on Vercel
1. Go to **https://vercel.com** and sign in with GitHub.
2. **Add New → Project → Import** the repo `utahmoldovapartnership/solaris-riding-club`.
3. Vercel reads `vercel.json` automatically (Build command `node build.js`, Output `.`).
   Framework preset: **Other**. Just click **Deploy**.
4. You get a live URL like `https://solaris-riding-club.vercel.app`.
   (Optional: add a custom domain later under the project's **Settings → Domains**.)

### 2) Connect the editor (Pages CMS)
1. Go to **https://app.pagescms.org** and **sign in with GitHub**.
2. Authorize/install the Pages CMS GitHub app and give it access to the
   `solaris-riding-club` repository.
3. Open the repo inside Pages CMS. It reads `.pages.yml` and shows one entry:
   **"Website content"** with all the editable sections.

### 3) Give the client access
1. On GitHub, open the repo → **Settings → Collaborators → Add people**, and invite
   the client's GitHub username (she'll need a free GitHub account; she accepts the
   email invite).
2. Send her the edit link (below). When she signs in with her GitHub, she'll see the
   site and can edit.

---

## The edit link (share this with the client)

```
https://app.pagescms.org/utahmoldovapartnership/solaris-riding-club/main
```

(If that exact path changes, the client can always start at **https://app.pagescms.org**,
sign in with GitHub, and pick **solaris-riding-club**.)

Works on a **phone or computer browser** — the editor is mobile-friendly.

---

## Part B — How the client edits (send her this)

1. Open the edit link and **Sign in with GitHub**.
2. Click **Website content**. You'll see sections: Hero, About, The herd,
   Experiences, Prices, Gallery, Visiting, Contact.
3. Open a section and change the text. Every text box has **English** and **Russian** —
   edit both so the site stays bilingual.
4. **To change a photo:** click the photo field, then upload a new image (or pick an
   existing one). Landscape photos work best for the hero and experience cards.
5. **To change a price:** open **Prices → Price rows** and edit the **Price** number
   (e.g. `400`, or `1 000–2 000`).
6. Click **Save** (top right). Your change is saved; the website updates by itself in
   about a minute. Refresh the public site to see it.

Tip: small edits are safest. If something ever looks off, previous versions are kept in
GitHub and can be restored.

---

## For developers

- Edit content in `content/site.json`, then run the build:
  ```bash
  node build.js
  ```
  This regenerates `index.html`. No dependencies required (Node 14+).
- `.pages.yml` defines the CMS forms. If you add a field to `site.json`, add it here too
  and use it in `build.js`.
- Images live in `assets/img/`. The original full-size photos are in `Media/`
  (ignored by Vercel via `.vercelignore`).
- The page is fully static and also works when served from any static host.
