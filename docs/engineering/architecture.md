---
description: How the documentation site, source data, quality gates and release flow are separated.
---

# Source architecture

This page describes the repository's executable and publishing architecture at the responsibility level. A layer is a contract over shared state and change flow, not a directory name: documentation, language, interaction and quality gates are separated because they change on different triggers and are validated by different tools.

## Layers

| Layer | Responsibility | Representative implementation | State |
|---|---|---|---|
| L1 Static content | Owns bilingual teaching and reference prose, code examples and page metadata. | `docs/glossary.md:7`; `docs/engineering/testing.md:28` | Working-tree files; built output is stateless. |
| L2 Site runtime | Converts Markdown into routes and locale metadata, injects SEO links and mounts the custom theme. | `docs/.vitepress/config.mts:2`; `docs/.vitepress/config.mts:96` | Build-time configuration, then generated static HTML/JS. |
| L3 Bilingual route contract | Maps one canonical page to a same-structure `/zh/` route and keeps navigation as the single source of truth. | `docs/navigation.md:7`; `docs/.vitepress/config.mts:91` | Two sidebar JSON files plus paired Markdown paths. |
| L4 Timeline interaction | Selects locale-specific data, filters and expands events, and animates visible eras. | `docs/.vitepress/theme/components/DevTimeline.vue:16`; `docs/timeline.md:24` | Component `ref` state in browser memory. |
| L5 Python examples | Supplies an importable fixture for executable documentation examples. | `docs/engineering/_examples/cfg.py:1`; `docs/engineering/testing.md:30` | Import-time module objects; subprocesses read it via `PYTHONPATH`. |
| L6 Quality commands | Parse Markdown, TypeScript-like data, anchors and URLs; execute code blocks in disposable subprocesses. | `scripts/check_anchors.py:52`; `scripts/check_timeline.py:197`; `scripts/check_links.py:54`; `scripts/verify_blocks.py:67` | In-memory parse results; one temporary Python file per code block. |
| L7 Release flow | Fails on dead links, invalid anchors, broken bilingual timeline data or changed code-block output before static publishing. | `README.md:30`; `package.json:7`; `docs/.vitepress/config.mts:91` | Lockfile inputs, then immutable built assets under the ignored dist tree. |

## Interfaces and ownership

- **Content to runtime:** VitePress discovers Markdown, reads `description` front matter and emits routes; it does not parse teaching semantics. `config.mts` imports both sidebars once at `docs/.vitepress/config.mts:2` and mounts locale theme data from `docs/.vitepress/config.mts:175`.
- **Runtime to component:** the timeline pages import one component at `docs/timeline.md:24` and `docs/zh/timeline.md:24`; the component chooses `TIMELINE` or `TIMELINE_ZH` in `DevTimeline.vue:16`. The page owns no timeline logic.
- **Component to schema:** `TimelineEvent` and `TimelineEra` are declared at `timeline.ts:10` and `timeline.ts:20`; all mutable UI text is in the component (`DevTimeline.vue:24`), while historical event copy remains in paired data arrays.
- **Checker contracts:** `check_anchors.py` extracts fenced headings and slugifies them (`check_anchors.py:16`, `check_anchors.py:27`); `check_links.py` strips fences and extracts external links (`check_links.py:26`, `check_links.py:29`); `check_timeline.py` reads one paired TypeScript file and explicit locale constants (`check_timeline.py:17`, `check_timeline.py:20`); `verify_blocks.py` copies Python blocks to temporary files and invokes `sys.executable` (`verify_blocks.py:44`, `verify_blocks.py:55`).
- **Examples to checker:** documentation's `from cfg import parse_port` resolves through the checker's injected `PYTHONPATH` at `verify_blocks.py:50`; the fixture documents that purpose at `cfg.py:1`.
- **Release inputs:** package scripts publish only build and preview commands (`package.json:5-11`); README names the Python and build gates (`README.md:30-39`); external-link policy permits soft network failures while CI remains authoritative (`check_links.py:6`).

## Configuration inputs

VitePress site configuration lives in `config.mts`, including locales, path behavior, dead-link enforcement, canonical/alternate generation and theme metadata (`config.mts:35-108`, `config.mts:110-157`). Sidebar navigation is intentionally split into `sidebar.en.json` and `sidebar.zh.json` (`config.mts:2`). Timeline schema, labels, eras and events are paired in `timeline.ts:27-219`; the checker encodes the same required and optional fields at `check_timeline.py:25-27`. No environment variables, Redis, MySQL or persistent server-side service is part of these boundaries.

## Lifecycle

1. **Author:** edit paired Markdown and update both sidebars first (`navigation.md:16-22`).
2. **Validate:** run the four Python commands and docs build (`README.md:32-39`). Python examples execute in temporary files with a 30-second cap (`verify_blocks.py:55`).
3. **Build:** VitePress compiles pages, rejects dead internal links (`config.mts:91`), derives canonical and hreflang URLs (`config.mts:43-70`) and emits static output kept out of git via `.gitignore` (`.gitignore:166`).
4. **Consume:** users receive static pages; the timeline component hydrates and keeps filter/expand state only in browser memory (`DevTimeline.vue:30-37`).

There is no dedicated wire protocol. Internal calls are direct imports; Python verification is a local subprocess contract; the only network path is the external-link HEAD/GET probe (`check_links.py:37`). Text placement follows the source contract: page copy in locale Markdown, localized timeline event copy in `timeline.ts`, and component interface strings in `DevTimeline.vue:23`.
