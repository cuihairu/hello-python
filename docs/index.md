---
layout: home

hero:
  name: Hello Python
  text: Python development notes and experience sharing
  tagline: A game developer's notes on using Python in real projects — observations, trade-offs and gotchas along the way.
  actions:
    - theme: brand
      text: Read the notes
      link: /basics/setup
    - theme: alt
      text: Topic index
      link: /knowledge/
    - theme: alt
      text: GitHub
      link: https://github.com/cuihairu/hello-python

features:
  - title: Setup & Syntax
    details: Environment and toolchain, syntax, variables and types, control flow, functions and scope — notes on everyday usage.
    link: /basics/setup
    linkText: Setup notes
  - title: Advanced Syntax
    details: Lists, dicts and strings; iterators and generators; classes and magic methods; decorators and type hints; common pitfalls.
    link: /datastructures/list-tuple
    linkText: Data structure notes
  - title: Concurrency
    details: threading and the GIL, the asyncio event loop, multiprocessing — a comparison of the models and their trade-offs.
    link: /concurrency/threading
    linkText: Concurrency notes
  - title: Engineering Practice
    details: Standard library highlights, unittest and pytest, logging and debugging, environment management, packaging and publishing.
    link: /engineering/stdlib
    linkText: Engineering notes
  - title: Source Walkthrough
    details: "A CPython source walkthrough against the 3.14 branch: the object model, bytecode dispatch, the compilation pipeline, memory management, the GIL and import, with file-and-line citations."
    link: /internals/cpython-source
    linkText: Source notes
  - title: Origins
    details: Thirty-seven years of development history on one timeline — key moments across the language core, concurrency, ecosystem tooling and engineering practice; open a node to see why it happened when it did.
    link: /timeline
    linkText: View the timeline
---

## Further reading

- [Python official documentation · Tutorial](https://docs.python.org/3/tutorial/)
