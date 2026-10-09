[English](README.md) | [中文](README.zh.md)

<div align="center">

<p align="center"><img src="docs/public/logo.svg" width="64" height="64" alt="logo" /> </p>

# Hello Python

<p align="center">
  <img src="docs/public/badges/topic.svg" alt="topic" />
  <img src="docs/public/badges/docs.svg" alt="docs" />
  <img src="docs/public/badges/license.svg" alt="license" />
  <img src="docs/public/badges/langs.svg" alt="langs" />
</p>

A Python knowledge base · [Read online](https://cuihairu.github.io/hello-python/)

</div>

---

A Python knowledge site that goes from syntax basics to engineering practice, covering data structures, object-oriented programming, concurrent programming, the standard library, testing, and packaging.

Knowledge base: [Core concepts](https://cuihairu.github.io/hello-python/knowledge/core-concepts) · [Books](https://cuihairu.github.io/hello-python/knowledge/books) · [Official docs](https://cuihairu.github.io/hello-python/knowledge/official-docs) · [Scenarios](https://cuihairu.github.io/hello-python/knowledge/scenarios) · [Pitfalls](https://cuihairu.github.io/hello-python/knowledge/pitfalls)

## Local development

```bash
npm install          # Install dependencies
npm run docs:dev     # Start the dev server
npm run docs:build   # Build to docs/.vitepress/dist
npm run docs:preview # Preview the build output locally
```

## Directory structure

```text
docs/
├── basics/          # Getting started: environment, syntax, types, control flow, functions
├── datastructures/  # Data structures: lists, dicts, strings, iterators
├── advanced/        # Advanced: OOP, magic methods, decorators, type annotations
├── concurrency/     # Concurrency: threading, asyncio, multiprocessing
├── engineering/     # Engineering: standard library, testing, logging, packaging
├── internals/       # CPython source walkthroughs (with file and line references)
└── .vitepress/      # VitePress config and theme
```

## License

This work is published under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license.
