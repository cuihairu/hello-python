---
description: "The full Python face of the gc module: enabling and disabling plus thresholds, collect and stats, the observation API, debug flags and the garbage list, callback subscription, freeze and the permanent generation, with citations carrying file line numbers."
---

# The gc module: the Python face of garbage collection

The C-side algorithm of generational collection was walked through in [memory management](/internals/memory-management); this page reads the layer it exposes to Python — which mechanism in `Python/gc.c` each function in `Modules/gcmodule.c` lands on, and how to use them to observe and control the running collector. The line-number convention matches the rest of the subpages (3.14 branch commit `66df30d15c9052785ed6463663e70d38107a9edf`).

## Module layout

The method table `GcMethods[]` (`Modules/gcmodule.c:520`) holds 18 functions. Module initialization `gcmodule_exec` (`:543`) hangs on two shared state lists: `gc.garbage` (`:550`) and `gc.callbacks` (`:554`), both pointing at the same data inside the interpreter's GCState — the module attributes are just the entry points to them. The `DEBUG_*` constants are exported in a batch from `:558`, with their values defined from `Include/internal/pycore_gc.h:125`. Generations are the compile-time constant `NUM_GENERATIONS` 3 (`Include/internal/pycore_interp_structs.h:200`).

## Enabling, disabling, and thresholds

`gc.enable` (`Modules/gcmodule.c:35`), `gc.disable` (`:49`), and `gc.isenabled` (`:63`) read and write the GCState switch directly. Note that disable only stops **automatic** triggers; a manual `collect()` is unaffected.

`gc.set_threshold` (`:156`) writes the three arguments into the threshold fields of each generation in GCState (from `:163`); the docs say outright that setting threshold0 to zero turns off automatic collection (`:152`) — a finer control than disable: allocation counts keep accumulating as usual, they just never reach the trigger line. `gc.get_threshold` (`:192`) reads back the same state. `gc.get_count` (`:216`) returns the current counts of the three generations, reading a snapshot of the counters plus the not-yet-booked allocation count (from `:225`), so the numbers you get may be slightly larger than at the previous moment.

```python
import gc

saved = gc.get_threshold()
gc.set_threshold(100, 10, 10)
print(gc.get_threshold()[0])
gc.disable()
print(gc.isenabled())
gc.enable()
gc.set_threshold(*saved)
print(gc.get_threshold() == saved)
```

```text
100
False
True
```

## collect: trigger one collection manually

`gc.collect(generation=2)` (`Modules/gcmodule.c:84`) collects all three generations by default (the clinic default argument is `NUM_GENERATIONS - 1`, `:72`); an out-of-range generation raises `ValueError` (`:89`); it ends at `_PyGC_Collect` in `Python/gc.c`, with the reason flagged as manual (`:94`). The return value is the number of unreachable objects collected this round.

Turning automatic collection fully off (`threshold0 = 0`) and driving reclamation with manual `collect` is the standard posture for embedded and latency-sensitive work: the timing of collection moves from "the allocation count hits the line" to "your code decides."

```python
import gc

n = gc.collect()
stats = gc.get_stats()
print(isinstance(n, int))
print(sorted(stats[0]))
```

```text
True
['collected', 'collections', 'uncollectable']
```

`gc.get_stats` (`:371`) returns one dict per generation; the three keys are that generation's running totals — number of collections, objects collected, and uncollectable objects. It snapshots the values first, so that allocations made while the result list is being built do not pollute the reading (comment from `:377`).

## Observing: who is tracked, who references whom

`gc.get_objects` (`:340`) lists all tracked objects, optionally filtered by generation; an out-of-range or negative generation raises `ValueError` (`:347`, `:354`), and there is an audit point `PySys_Audit("gc.get_objects")` at the entry (`:343`).

`gc.is_tracked` (`:424`) lands on `PyObject_GC_IsTracked`: atomic objects (`int`, `str`) and the empty tuple singleton are not GC-tracked — they can never take part in a cycle, so there is no point putting them on the `PyGC_Head` roster described in [memory management](/internals/memory-management). Note that the tuple rule changed in 3.14: on this branch every non-empty tuple is tracked (`Objects/tupleobject.c:88` TRACKs uniformly, with `:64` noting the empty singleton as the exception); up to and including 3.12 the rule was "tracked only if it contains a tracked member."

`gc.get_referents` (`:303`) and `gc.get_referrers` (`:255`) are the two directions of a reference edge: the former lists whom an object directly references, the latter reverse-looks up whom references it directly. Return order is not guaranteed — sort before asserting across versions. referrers requires a linear scan of the whole heap, so it belongs in debugging tools, never on a hot path.

```python
import gc

target = ["secret"]
holder = [target, "label"]
print(gc.is_tracked([]), gc.is_tracked(3.14), gc.is_tracked("abc"))
print(sorted(type(x).__name__ for x in gc.get_referents(holder)))
print(holder in gc.get_referrers(target))
```

```text
True False False
['list', 'str']
True
```

## Debug flags and the garbage list

`gc.set_debug` (`:116`) / `gc.get_debug` (`:131`) operate on five flags, defined from `Include/internal/pycore_gc.h:125`: `DEBUG_STATS` (1<<0) prints collection statistics, `DEBUG_COLLECTABLE` (1<<1) and `DEBUG_UNCOLLECTABLE` (1<<2) print object listings, `DEBUG_SAVEALL` (1<<5) shoves every object that would be freed into `gc.garbage`, and `DEBUG_LEAK` is a combination of the flags other than STATS (`:129`).

After PEP 442, cycles containing `__del__` are collected normally, so `gc.garbage` is an empty list in normal use; it is only populated when the SAVEALL flag is on or an old-style finalizer is present — the comment at `Python/gc.c:974` says that under SAVEALL every object reaching a finalizer is tabled, and `:1039` is the point where it lands there before release.

```python
import gc

a, b = [], []
a.append(b)
b.append(a)
ids = {id(a), id(b)}
del a, b
gc.set_debug(gc.DEBUG_SAVEALL)
try:
    gc.collect()
    print(ids.issubset({id(o) for o in gc.garbage}))
finally:
    gc.set_debug(0)
    gc.garbage.clear()
```

```text
True
```

## callbacks: subscribing to collection events

`gc.callbacks` is hung out at module initialization (`Modules/gcmodule.c:554`); the list itself is created early in interpreter startup (`Python/gc.c:142`). Each collection fires two rounds of calls — `phase="start"` at the beginning (`Python/gc.c:1358`) and `phase="stop"` at the end (`:1527`, from 3.14; up to and including 3.12 the closing phase was called `"end"`, which matters if you subscribe to callbacks across versions) — the latter carrying this round's collection statistics. The call site is `_PyGC_InvokeGCCallbacks` at `Python/gc.c:1197`, which short-circuits outright on an empty table (`:1216`); an exception raised inside a callback does not blow up the interpreter — it is recorded via `PyErr_FormatUnraisable` and execution continues (`:1222`, `:1230`).

```python
import gc

events = []

def note(phase, info):
    events.append(phase)

gc.callbacks.append(note)
try:
    gc.collect(2)
finally:
    gc.callbacks.remove(note)
print(len(events), events[0])
```

```text
2 start
```

## freeze: saving copy-on-write for fork

`gc.freeze` (`Modules/gcmodule.c:458`) moves all currently tracked objects into the permanent generation (the `permanent_generation` initialized at `Python/gc.c:126`); later collections no longer touch them. The clinic comment (from `:447`) states the purpose: call it before a POSIX `fork()` so the child does not lose memory pages shared with the parent because GC writes touch them. `gc.unfreeze` (`:475`) moves the permanent generation back to the oldest generation in bulk. `gc.get_freeze_count` (`:490`) reads the object count of the permanent generation.

Version note: `gc.is_finalized` (`:440`, deciding whether an object has already been finalized by GC) was added in 3.13, and `gc.get_freeze_count` in 3.14 — on older interpreters probe with `hasattr` first before using them.

## References

- [Python official docs · gc](https://docs.python.org/3/library/gc.html)
- [Python official docs · weakref](https://docs.python.org/3/library/weakref.html)
- [CPython repository](https://github.com/python/cpython)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [cpython-source](cpython-source.md)
- [memory-management](memory-management.md)
