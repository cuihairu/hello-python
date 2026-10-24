---
description: Python's development timeline from 1989 to 2026 — 30 nodes, each answering "why it happened when it did".
title: Timeline
---

<script setup>
import DevTimeline from './.vitepress/theme/components/DevTimeline.vue'
</script>

# Timeline

Every major capability in Python is an answer to a concrete problem. lambda and reduce came from early users' desire for functional expression; asyncio answered the need to standardize high concurrency inside a single thread; free threading is paying down the three decades of multicore debt the GIL left behind. This line runs from a Christmas holiday in 1989 all the way to 2026: 30 nodes in chronological order, each one answering "why now" first and then pointing to the matching chapter on this site.

## How to use this timeline

Filter first, then read. The field labels at the top group events into four areas — language core, concurrency, ecosystem, and engineering — with the count on the label itself. Select "Concurrency" alone and the line runs from multiprocessing in 2008 to free threading becoming official in 2025: over seventeen years, the answer to "what do we do about multicore" changed three times.

Open a node to see why. Each node is a year plus a one-line title; expand it for who did it, why it happened then, and the related chapter. One moment often holds more than one event: in October 2008 pip and multiprocessing landed one after the other, packaging and concurrency each moving forward in the same month — a sign the ecosystem had reached a critical mass.

Read by era. The four eras each carry an intro: Birth & Foundations, Community & Ecosystem Take Shape, The 3.x Bet & the Concurrency Turn, and Modernization & Speed. A year is taken at the point when the capability or mechanism landed, not when it became widely used — 3.0 cleared the historical debt, but the community spent ten years in pain; between landing and digestion sits a release cycle.

When you want the full sweep, "Read every event by era" at the bottom of the page is a plain-text form of the same data, independent of filtering and expansion, which makes it easy to compare against each chapter.

<DevTimeline />

## Further reading

- [Python version releases (whatsnew)](https://docs.python.org/3/whatsnew/3.13.html)
- [Python 3.14 whatsnew](https://docs.python.org/3/whatsnew/3.14.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [official-docs](/knowledge/official-docs.md)
