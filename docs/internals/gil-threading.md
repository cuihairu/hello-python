---
description: The actual implementation of the GIL — locked integer plus mutex and condition variable, the 5 millisecond switch interval, thread state and PyGILState, and the layout changes in a free-threaded build, with citations carrying file line numbers.
---

# GIL and the Threading Model

Line numbers correspond to 3.14 branch commit `66df30d15c9052785ed6463663e70d38107a9edf` (checked out 2026-10-04); for the cloning method and reading prerequisites, see the [overview](/internals/cpython-source).

The GIL's implementation is plainer than the lore. `_gil_runtime_state` (`Include/internal/pycore_gil.h:22`) is at its core one `locked` integer plus a mutex and a condition variable. The implementation comment from `Python/ceval_gil.c:13` explains the whole mechanism: the lock-holding thread's eval loop periodically checks the interrupt flag, and a waiting thread waits on the condition variable for the full `interval` microseconds before setting a yield request; the default switch interval is 5000 microseconds (`Python/ceval_gil.c:147`), i.e. the 5 milliseconds of `sys.getswitchinterval()`. The entry point for taking the lock is `take_gil` (`Python/ceval_gil.c:285`), the entry point for dropping it is `drop_gil` (`:216`).

What this means for Python code: switch points happen only at bytecode boundaries and explicit release points, so the GIL is held for however long a single bytecode takes (`Python/ceval_gil.c:34`'s comment admits that opcode duration is uncontrollable). So in a pure-Python CPU-bound loop, the 5 millisecond switch interval only holds approximately. C extensions should proactively `drop_gil` before entering a blocking system call — that is why the threading module really does parallelize in IO scenarios.

On thread state: each OS thread corresponds to one `PyThreadState`; the call C extensions use most often, `PyGILState_Ensure` (`Python/pystate.c:2894`), builds a thread state for the current thread if there is none and takes the GIL, with the paired `Release` giving it back. Signal handling relies on the same interrupt flag: `_CHECK_PERIODIC` in the eval loop (`Python/bytecodes.c:155`) is the only channel by which signals can be answered in pure Python code — for the mechanism, see [the interpreter's main loop](/internals/eval-loop).

The free-threaded build is an experimental feature in 3.14, requiring an explicit `--disable-gil` configuration (`configure.ac:1728`). The object header becomes a thread ID plus a double-count layout (`Include/object.h:152`; for the comparison against the default layout see [core data structures](/internals/object-model)), and containers are protected internally with object locks and deferred deallocation: a dict is marked shared the first time another thread reads it (`Objects/dictobject.c:1315`). The default build is still a GIL-bearing interpreter, and all remaining citations on this page are against the default build.

## References

- [Python official docs · threading](https://docs.python.org/3/library/threading.html)
- [Python official docs · sub-interpreter initialization (C API)](https://docs.python.org/3/c-api/init.html)
- [PEP 684 · per-interpreter GIL](https://peps.python.org/pep-0684/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [cpython-source](cpython-source.md)
