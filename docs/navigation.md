---
description: The single maintenance entry point for site navigation, and the rules for updating the sidebars.
---

# Navigation guide

Each locale owns exactly one sidebar, and the pair is the single source of truth for navigation:

- [`docs/.vitepress/sidebar.en.json`](https://github.com/cuihairu/hello-python/blob/main/docs/.vitepress/sidebar.en.json) — the English site, paths without a locale prefix. This file is the authority for page structure: add a page here first.
- [`docs/.vitepress/sidebar.zh.json`](https://github.com/cuihairu/hello-python/blob/main/docs/.vitepress/sidebar.zh.json) — the same structure for the Chinese site, with every link prefixed by `/zh/`.

`docs/.vitepress/config.mts` imports both and mounts them under `themeConfig.locales`. Locale resolution is VitePress' own: English pages live at the site root, Chinese pages under `/zh/`, and the language switcher comes from the `locales` config. There is no hand-rolled switcher, no `*.zh.md` mirror scheme, and no hand-written language banner in this repository.

The repo keeps no hand-written `SUMMARY.md` copy. If some other directory listing is ever added, link it to a sidebar or mark it clearly as derived content — never maintain a second editable navigation.

When you change the navigation:

1. Edit `sidebar.en.json` first, then apply the identical structural change to `sidebar.zh.json` with the `/zh/` prefix.
2. Confirm every link target resolves to a real page in its own locale.
3. Keep exactly one entry per page within a grouping; do not list the same link twice inside one group. Reusing a route across different groups is fine when a page genuinely needs two entry points.
4. The home page is reached from the top nav (`/` or `/zh/`) and is deliberately absent from both sidebars.
5. Re-run the documentation build and the internal link checks afterwards.

In-body links between pages are still maintained per page, from each page's own angle; the sidebars are not a substitute for content relationships.
