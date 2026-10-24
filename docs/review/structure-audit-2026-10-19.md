# hello-python documentation structure audit (2026-10-19)

Audit scope: `docs/**/*.md` in the working tree (excluding the build output `docs/.vitepress/dist`), plus the root readme files and the VitePress config. All statistics were computed from the current working-tree files; lines are counted by newline delimiter. The `main` working tree was clean at the start.

## Quantitative facts

### Directories one level below docs

| Directory | Markdown files | Total lines | Notes |
|---|---:|---:|---|
| `advanced/` | 10 | 2,128 | Topic chapters |
| `basics/` | 5 | 841 | Topic chapters |
| `concurrency/` | 4 | 778 | Topic chapters |
| `datastructures/` | 4 | 872 | Topic chapters |
| `engineering/` | 5 | 889 | Topic chapters; also holds `_examples/` code and `__pycache__/` |
| `internals/` | 10 | 558 | Topic chapters |
| `knowledge/` | 6 | 432 | Roundups, references, and indexes |
| `docs/` root | 3 | 382 | `index.md` 300 lines, `glossary.md` 48 lines, `timeline.md` 34 lines |
| `.vitepress/` | 0 | 0 | Config, theme, and generated dist (dist excluded from counts) |
| `public/` | 0 | 0 | Static assets |
| **Total** | **47** | **6,880** | Excludes `.vitepress/dist` |

### Organization axes

| Organization | Entries | Naming pattern | Numbered? | Numbering contiguous? |
|---|---:|---|---|---|
| Topic directories (`basics`, `datastructures`, `advanced`, `concurrency`, `engineering`, `internals`) | 38 articles | Directories by knowledge domain; filenames mostly lowercase English kebab-case | No | N/A |
| Knowledge/index directory (`knowledge/`) | 6 articles | `index`, concepts/books/docs/scenarios/pitfalls | No | N/A |
| Root-level entry/cross-cutting reference pages (`index.md`, `timeline.md`, `glossary.md`) | 3 articles | Named by page function | No | N/A |
| Numbered chapters (`01-…06-`) | 0 in the current working tree | Config comments claim these are parallel numbered directories written externally | Numbering rules exist in the config; the directories are absent | No sortable entries; not evidence of a gap in existing content |
| Standalone guide/API/history directories | 0 | No separate directory axis found | No | N/A |

So there are 3 actual content organizations (topic chapters, the knowledge index, and root-level cross-cutting pages), plus a config exclusion rule for a "numbered directory" family that has no such directory in the working tree. `internals/` is a source-implementation topic, not a standalone API directory; the timeline lives on a single page and does not form a history directory axis.

### Sidebar reconciliation

Read `docs/.vitepress/sidebar.json` (imported by `docs/.vitepress/config.mts:2,97`): 46 sidebar links; configured but file missing **0**; file present but not in the sidebar **1**. First 10 entries (fewer than 10 exist, so listing what there is):

- Configured but file missing: none.
- File present but not in the sidebar: `docs/index.md` (homepage content is reached via nav's `/` route, see `docs/.vitepress/config.mts:84`; so this is explainable, not necessarily an omission).

The 46 sidebar items cover 46 pages; `knowledge/index.md` is counted as the `/knowledge/` entry. Sidebar config file: `docs/.vitepress/sidebar.json`.

## Issue list and evidence

### 1. Numbering gaps, skips, duplicates: none found (low)

Scanning current Markdown filenames for leading-digit / numeric-prefix patterns: 0 files match numbered-chapter naming, so there are no gaps, skips, or duplicate numbers to list. The config comment does describe a numbering scheme: `docs/.vitepress/config.mts:26-27` (`01-…06-`), but those directories are not in the current working tree; nonexistent numbering ranges cannot be treated as missing content. Numbers in chapter titles and example code are not evidence of file numbering.

### 2. Same-topic content landing in different topic directories (medium)

- "Pitfalls / common traps" appear in both `docs/advanced/pitfalls.md` and `docs/knowledge/pitfalls.md`; the latter is mostly a knowledge-index-style digest, with overlapping topic words, though possibly serving a different purpose.
- The adjacent "CPython and the standard library" topics land in `docs/internals/implementation-boundary.md` and `docs/engineering/stdlib.md`; the former focuses on the implementation boundary, the latter on engineering choices, and cross-links make this explainable.
- "Object model / data structures": `docs/internals/object-model.md` vs `docs/datastructures/*` cover the runtime implementation and the language-usage level respectively — closely related but at different levels.

The evidence shows cross-topic references/digests, not enough to outright declare duplication or require merging; first you need section-boundary labeling and index cross-links.

### 3. Slightly inconsistent naming style (low)

File paths are overall uniform lowercase English kebab-case, but the directory `datastructures` lacks a separator, while other multi-word directories use single words or word boundaries (e.g. `internals`, `engineering`; there is currently no compound directory that would form a stable parallel rule with it). The filename `dataclass.md` runs words together while `string-formatting.md` and friends use hyphens; page titles mix Chinese, English terms, and capitalization — for example, the title of `docs/internals/gc-module.md` contains `gc` and `docs/advanced/dataclass.md` contains `dataclass`. These are local convention differences that do not affect lookup or routing.

### 4. Content entry points vs. the sidebar (low)

`docs/index.md` is 300 lines and not separately listed in the sidebar (see table above); it is the homepage reached via nav `/`, which matches common homepage organization. The root also has bilingual readmes: `README.md:1` and `README.zh.md:1` link to each other explicitly — this is a bilingual project entry pair, not something to clean up as duplicate files. All topic pages are in the sidebar.

### 5. Dead links and build: not verified

Tried `npm run docs:build`; it failed because the environment lacks a local VitePress executable: `sh: 1: vitepress: not found` (the script and dependency are declared in `package.json`). So body links and the build cannot be judged for dead links from this run; the config `ignoreDeadLinks: false` (`docs/.vitepress/config.mts:38`) means that once dependencies are installed, a build can serve as link verification. The current `.vitepress/dist` is an existing build artifact and cannot substitute for verifying a build from the current sources.

### 6. Root directory and non-content miscellany (medium/low)

- Root-level Markdown consists of `README.md` and `README.zh.md`, a paired bilingual readme with explicit cross-links, reasonably kept; there is no extra ad-hoc root-level Markdown.
- `docs/engineering/_examples/__pycache__/cfg.cpython-314.pyc` is Python bytecode cache, regenerable miscellany; the path is visible via `rg --files`. Whether it is tracked / whether it would enter a release package should be checked against `.gitignore` and the Git index at cleanup time; this report does not claim the site is already polluted by it.
- `docs/.vitepress/dist/` holds a large amount of generated HTML/JS/assets. It is an output directory, not a content source; VitePress is not currently configured to use it for doc navigation. The version-control strategy should be confirmed, but it must not be mixed into the content-directory statistics.
- `docs/.vitepress/config.mts:26-27` still excludes the nonexistent `01-…06-` directories — a config-vs-reality inconsistency; possibly reserved for an external directory, so confirm the origin before removing it.

## Judgment and recommendations

There really are **3 content organization axes**; I do not recommend collapsing to a single directory or moving all reference material into tutorial chapters. I suggest settling on **2 logical layers**: the first layer organizes learnable chapters by topic; the second is cross-topic reference/navigation (the knowledge index, glossary, timeline, and homepage), presented as clear sidebar groups. The physical layout can keep the topic directories and root-level cross-cutting pages; logical convergence does not require mechanically moving files. `knowledge/` can be treated as the cross-cutting reference layer rather than a second numbering scheme competing with the topic chapters. There are no standalone guide, API, or history directories, and no new categories should be invented for the sake of "tidiness".

| Judgment | Severity | Rationale |
|---|---|---|
| Config-reserved numbered directories inconsistent with the current tree | Medium | Readers/maintainers might think the site has a second chapter set; but it does not affect the current sidebar, and it may serve external input. Evidence `docs/.vitepress/config.mts:26-27`. |
| Near-duplicate topics across directories need explicit boundaries | Medium | `advanced/pitfalls` and `knowledge/pitfalls` share a name and are easy to mistake for duplicates; the actual content roles were not verified to the point of duplication. Paths in issue 2. |
| Naming details not fully consistent | Low | Mostly `datastructures` and `dataclass` running words together; renaming would create old-link migration cost for limited benefit. Paths in issue 3. |
| Existing sidebar and content coverage | Not a problem | All 46 links exist; the only page not listed is the homepage. Evidence `sidebar.json`, `docs/index.md`. |

### Actually not messy; nothing to move

- The six main knowledge domains each have their own directory with intuitive responsibilities; the 38 topic articles carry no numbering burden.
- Every topic chapter is currently in the sidebar, and every link target exists.
- The six pages of `knowledge/` form a self-contained reference/index group whose content can link into the topic chapters; no need to break it up.
- Homepage, glossary, and timeline are reasonable root-level cross-cutting pages; no need to stuff them into some teaching topic directory.
- `README.md`/`README.zh.md` are a language-paired entry, not duplicate documentation.
- No actually existing numbering gaps or duplicate ordinals were found, nor any basis for adding API/guide/history directories.

## Three-phase wrap-up plan

| Phase | Action list | Blast radius | Risk (existing links/search/external links) | User decision |
|---|---|---|---|---|
| Phase 1: mechanical tidy-up (target: within 1 hour) | Check whether `__pycache__` is tracked and confirm ignore rules; review and settle the version-control policy for regenerable `.vitepress/dist`; build an inventory of existing files/links; change no paths, change no body links. | Git miscellany, ignore rules, build artifacts | Low; URLs untouched. Deleting committed artifacts could affect anyone depending on in-repo dist — verify how it is consumed first. | **Needs a decision**: whether the repo tracks dist, and whether cleaning tracked caches is allowed. |
| Phase 2: sidebar and redirects | Keep existing paths; fine-tune sidebar hierarchy/titles to separate "learning chapters" from "reference tools"; if a rename is decided, add old-path redirects first and verify in-site links. Whether to keep the numbered exclusion rule: decide after tracing its origin. | `docs/.vitepress/sidebar.json`, `config.mts`, plus redirect config if needed | Title-only sidebar tweaks are low risk; changing URLs affects in-site bookmarks, the search index, and external links — redirects lower but do not eliminate the risk. | **Needs a decision**: sidebar information architecture; whether the numbered directories come from an external source; any public path rename. |
| Phase 3: deep content restructuring | Draw an explicit "deep explanation / quick-reference digest" boundary between `advanced/pitfalls` and `knowledge/pitfalls`; choose cross-linking, merging, or deduplication based on actual content overlap; sync directories, the sidebar, in-site references, and historical URL redirects. | The two pitfalls docs and everything referencing them; possibly the knowledge index | Medium to high; merging/deleting pages changes search entry points and external link landing spots — redirects must be kept and build/dead-link checks run. | **Must decide**: whether to merge the content, which canonical page to keep, and the long-term redirect policy for old URLs. |

## The three things to do first

1. Find out whether the `01-…06-` directory convention targeted by `srcExclude` is still used by any out-of-repo process, then decide whether to keep or delete that exclusion rule.
2. Run `npm run docs:build` once in an environment with dependencies installed to confirm dead links, the current source pages, and the local search index; this report could not verify them.
3. Give the two pitfalls pages explicit roles (full topic vs. quick index): cross-link and label the boundary first, and merge only after substantive duplication is confirmed.

## A→B→C wrap-up record (2026-10-19)

This section records the outcome of this round of work; the text above is the pre-change audit baseline, with some numbers counted from the working tree as it stood at the time.

### A. Single source of truth for navigation

- `git ls-files 'SUMMARY.md' 'docs/**SUMMARY*'` produced no output: the repo has no hand-written `SUMMARY.md` or similar table-of-contents copy, so there is no copy to rewrite.
- `docs/.vitepress/config.mts:2,108-109` imports and uses `docs/.vitepress/sidebar.json`; `docs/navigation.md:7-11` explicitly makes it the single source of truth and spells out the update order, target validation, same-sidebar dedup rules, and the homepage route rule.
- `docs/.vitepress/sidebar.json:194-197` hooks the navigation maintenance note into the sidebar. Across the whole sidebar: 47 links, 47 unique URLs, 0 duplicates, 0 dead targets; cross-group route reuse is not treated as duplication.

### B. Cross-axis duplication and different angles

| Category | Two pieces of pre-change evidence | Handling and post-change evidence |
| --- | --- | --- |
| True duplication, 1 group (6 facts) | `docs/advanced/pitfalls.md` explains the principle and the idiom item by item for “可变默认参数” (mutable default arguments), “`is` 当 `==` 用” (using `is` as `==`), “字符串比较不归一” (string comparison without normalization), “浅拷贝当深拷贝” (shallow copy treated as deep copy), “遍历中改容器” (mutating a container while iterating it), “资源释放赌 `__del__`” (gambling resource release on `__del__`); `docs/knowledge/pitfalls.md` previously also restated the principle and mitigation for each matching entry, e.g. “默认值在函数定义时求值一次……所有调用共享同一个对象” (default values are evaluated once at function definition time... all calls share the same object) and “默认值在定义时求值一次并绑定在函数对象上，所有调用共享” (default values are evaluated once at definition time and bound onto the function object, shared by all calls). | Kept the topic page as the authoritative source of detail; deleted no file. `docs/knowledge/pitfalls.md:7,11,15,20,21,46` now each carry a summary of the key point and point back to `/advanced/pitfalls`; the topic page `docs/advanced/pitfalls.md:7` states that it expands causes, reproduction, and handling, with the cross-links kept. |
| Different angle, 1 group (kept) | `docs/internals/implementation-boundary.md` discussed `sys.implementation`, the stable ABI, and portability; `docs/engineering/stdlib.md` went module by module through everyday use of collections, itertools, functools, and friends; the two did not repeat the same fact. | Both kept. `docs/internals/implementation-boundary.md:10` and `docs/engineering/stdlib.md:7` cross-link and label the "implementation boundary / portability" and "everyday selection" angles. |
| Different angle, 2 groups (kept) | `docs/internals/object-model.md` covered the CPython memory layout of `PyObject`, the compact dict, and the list pointer array; `docs/datastructures/list-tuple.md` and `docs/datastructures/dict-set.md` covered container operations, semantics, and use cases at the Python language level. | Kept both the implementation notes and the language-usage pages. `docs/internals/object-model.md:7`, `docs/datastructures/list-tuple.md:7`, and `docs/datastructures/dict-set.md:7` cross-link and label the two viewpoints. |

### C. Positioning and sidebar verification

- `README.md:22` and `README.zh.md:22` were repositioned to personal study notes, insights, and game-developer experience sharing, explicitly not a course or learning path; the two directory trees, at `README.md:51-64` and `README.zh.md:51-64`, list only directories/files that exist.
- Both README directory trees now list the actually existing `index.md`, `glossary.md`, `navigation.md`, `public/`, and `.vitepress/`, with no nonexistent directories; no distorted article counts are stated. The “38 个内容页” (38 content pages) mentioned in the knowledge index matches the six topic directories' actual 5+4+10+4+5+10=38 articles.
- The site description in `docs/.vitepress/config.mts:8` and `docs/public/site.webmanifest:4`, the homepage copy in `docs/index.md:6-7`, and the index explanation in `docs/knowledge/index.md:7,31-35` were synced to the developer-notes positioning, with no prescribed reading order.
- Sidebar groups use “基础语法与环境” (basic syntax and environment) and “语言特性” (language features); the homepage action copy is “浏览笔记” (browse the notes); no learning path or numbered-chapter structure was introduced.
- The original 46 items of `docs/.vitepress/sidebar.json` all resolve with no same-sidebar duplicates; this round added 1 navigation note, for 47 items, all targets existing. Dead config entries deleted: 0; the important homepage is still reached via the `/` route. No stale "N-lecture" numbers in the sidebar.

### Acceptance record

- `pnpm docs:build`: passed; VitePress built and rendered to completion; only the pre-existing large-bundle notices.
- `python3 scripts/check_anchors.py`: 49 files checked, 0 bad anchors. The VitePress build config has `ignoreDeadLinks: false`, so the build also validates page targets; a separate script check confirmed the sidebar targets at 47/47 existing, 0 dead targets.
- `git diff --diff-filter=D --name-only`: 0 Markdown deletions; this round deleted no Markdown files and changed no URLs.
