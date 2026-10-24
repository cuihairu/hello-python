---
description: Immediate reclamation via reference counting, three-tier pymalloc pools, generational GC thresholds and algorithms, and how the three mechanisms divide the work, with citations carrying file line numbers.
---

# Memory Management

Line numbers correspond to 3.14 branch commit `66df30d15c9052785ed6463663e70d38107a9edf` (checked out 2026-10-04); for the cloning method and reading prerequisites, see the [overview](/internals/cpython-source).

## Reference counting first

Reference counting decides the lifetime of the large majority of objects: `Py_INCREF` / `Py_DECREF` (`Include/refcount.h:252`, `:327`) are inlined in the hot path, and a decrement to zero calls `tp_dealloc` to release immediately. Immortal objects skip counting altogether (see [core data structures](/internals/object-model)). The payoff of this design is immediacy and determinism; the cost is one atomic operation per assignment, and cycles need a second mechanism.

## pymalloc: pools for small objects

Object allocation is tiered: a request over 512 bytes goes straight to `malloc`, anything smaller goes to pymalloc (the threshold is `SMALL_REQUEST_THRESHOLD`, `Include/internal/pycore_obmalloc.h:157`). pymalloc manages in three tiers: arena at 256 KiB (`Include/internal/pycore_obmalloc.h:213`, configurable to 1 MiB, see `:211`), pool at 4 KiB (`:230`, which must equal the system page size), and block aligned on 16 bytes (`:132`). The entry point is `_PyObject_Malloc` (`Objects/obmalloc.c:2329`), which goes to `pymalloc_alloc` (`:2281`): find the size class for the request and cut a block out of a pool of that size; when a pool is exhausted, take a new page from the arena, and only when the arena is exhausted does it ask the system for memory for real (`:1974`). The reverse lookup from address back to arena (needed at free time) goes through an arena index tree (`:1779`). Blocks of the same size are stored contiguously, so fragmentation stays contained inside pools.

## Generational GC: cycles only

Only objects with a `PyGC_Head` prefix are under GC management (`Include/internal/pycore_interp_structs.h:161`, header struct at `:169`) — the container types that can form cycles. The GC head hangs in front of the object's memory, and `_Py_AS_GC` reaches it with a negative offset (`Include/internal/pycore_gc.h:17`).

Three generations, with default thresholds of 2000/10/10 (`Include/internal/pycore_interp_structs.h:271`). Note this is not the 700 from older material: `gc.get_threshold()` on this branch truthfully returns `(2000, 10, 10)`, and it is changeable at runtime (`Modules/gcmodule.c:163`). The trigger logic is in `gc_select_generation` (`Python/gc.c:1258`): scan from old to new for the first generation whose count is over threshold, where a full collection additionally requires that "objects promoted last round / total long-lived objects" exceed 25% (the long comment from `Python/gc.c:1270` derives this heuristic, preventing full collections from degrading linearly with the number of long-lived objects).

The algorithm itself lives in `gc_collect_main` (`Python/gc.c:1313`): first subtract one from the reference count of every object in the generation (subtract_refs), then walk from external roots — anything whose count does not return to zero is unreachable (`move_unreachable`, comments at `Python/gc.c:32` and `:190`); unreachable objects without `__del__` are released directly, and those with `__del__` go into `gc.garbage`. Survivors are promoted to the oldest generation. The manual entry point is `PyGC_Collect` (`Python/gc.c:1671`), the allocation-side hook is `_PyObject_GC_New` (`Python/gc.c:1907`), and each allocation adds one to the generation-zero count (`:1865`).

Division of labour: reference counting handles over ninety percent of reclamation, and generational GC exists only for cycles. CPython does no moving compaction; heap fragmentation is softened by pymalloc's size-class pools. That is the fundamental difference from JVM-style runtimes. The collector's Python-facing enable/disable, observation, and debugging interfaces (`gc.collect`, `gc.callbacks`, `gc.freeze`, and so on) get their own page in [gc module](/internals/gc-module).

## References

- [Python official docs · gc module](https://docs.python.org/3/library/gc.html)
- [CPython repository · obmalloc](https://github.com/python/cpython)
- [CPython developer guide](https://devguide.python.org/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [cpython-source](cpython-source.md)
- [gc-module](gc-module.md)
- [object-model](object-model.md)
