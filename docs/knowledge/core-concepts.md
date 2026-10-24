---
description: Concepts and key points across the six themes of the site, each linked back to the page it came from.
---

# Core concepts

The key points from each chapter of the site, re-arranged by theme. Each entry says in one sentence what it is; the original page is linked after it, and the details live there.

## Language fundamentals

- **Indentation is syntax**: Python delimits blocks with indentation, no braces; the official style is 4 spaces, mixing tabs with spaces is forbidden, and a wrong indent raises `IndentationError`. → [Syntax basics](/basics/syntax)
- **Docstrings**: a triple-quoted string on the first line of a module, function or class is a docstring, reachable at run time through `__doc__`, and the content source of `help()`. → [Syntax basics](/basics/syntax)
- **Walrus operator**: `:=` (3.8+) assigns inside an expression, for the "compute then test" pattern. → [Syntax basics](/basics/syntax)
- **Dynamically strongly typed**: variables declare no type, but types are never converted implicitly — `"1" + 1` is an outright error. → [Variables and data types](/basics/variables-and-types)
- **Mutability divides**: `int`/`str`/`tuple` are immutable and any "modification" returns a new object; `list`/`dict`/`set` mutate in place, so every reference to them changes with them. → [Variables and data types](/basics/variables-and-types)
- **`is` vs `==`**: `is` compares object identity, `==` compares value; use `is` for `None` checks, `==` for everything else. Small-integer caching and constant folding make `is` "accidentally true" now and then — never rely on it. → [Variables and data types](/basics/variables-and-types)
- **Floats and exact arithmetic**: IEEE 754 cannot represent 0.1, so float comparisons need a tolerance; for exact cases such as money use `decimal.Decimal`, and for fractions `fractions.Fraction`. → [Variables and data types](/basics/variables-and-types)
- **Loop `else`**: the `else` on a `for`/`while` runs only when the loop finishes normally (was not cut short by `break`), replacing the boolean flag you would otherwise need for "check for a prime" style code. → [Control flow](/basics/control-flow)
- **`match` pattern matching**: structural deconstruction since 3.10, supporting sequence, mapping and class patterns plus guards; the `case _` wildcard must come last. → [Control flow](/basics/control-flow)
- **The five parameter forms**: in order, positional, defaulted, `*args`, keyword-only and `**kwargs`; on the calling side `*`/`**` unpack the other way. → [Functions](/basics/functions)
- **LEGB and closures**: name lookup goes Local → Enclosing → Global → Builtin; a closure captures the variable itself, not its value at definition time, and rebinding an enclosing name needs `nonlocal`. → [Functions](/basics/functions)
- **Positional-only and keyword-only**: parameters before `/` can only be passed positionally, those after `*` only by keyword — the standard library uses this to keep parameter names out of the public API. → [Functions](/basics/functions)
- **Three-layer environment split**: pyenv manages multiple versions, venv manages project isolation, pip manages package installation; write commands as `python3 -m pip` / `python3 -m venv` so they bind to the current interpreter. → [Environment setup](/basics/setup)

## Data structures

- **The line between list and tuple**: both are ordered sequences, list is mutable and tuple is not; use list for dynamic collections, tuple for fixed-shape records. → [Lists and tuples](/datastructures/list-tuple)
- **Slice semantics**: `seq[start:stop:step]` is left-closed right-open, produces a new object, and supports negative indices and steps; slice assignment can replace, insert or delete a run in place. → [Lists and tuples](/datastructures/list-tuple)
- **References and copies**: assignment copies only the reference; a shallow copy (`[:]`, `copy()`) copies one level, and nested structures need `copy.deepcopy`. → [Lists and tuples](/datastructures/list-tuple)
- **Named tuples**: `collections.namedtuple` or `typing.NamedTuple` gives records field names, far more readable than bare indices. → [Lists and tuples](/datastructures/list-tuple)
- **dict preserves order**: since 3.7 dicts keep insertion order; to deduplicate while preserving order use `dict.fromkeys`, and to merge use `|` (3.9+, right side wins). → [Dictionaries and sets](/datastructures/dict-set)
- **Safe lookups**: for possibly missing keys use `get` with a default, or `setdefault` to write the value at the same time; `defaultdict` for grouping, `Counter` for counting. → [Dictionaries and sets](/datastructures/dict-set)
- **The hashability constraint**: a key must implement `__hash__` and its hash value must not change for its lifetime — numbers, strings, bytes and tuples whose contents are all hashable qualify, list/dict/set do not. → [Dictionaries and sets](/datastructures/dict-set)
- **Set operations**: set supports `|` union, `&` intersection, `-` difference and `^` symmetric difference; `frozenset` is immutable and usable as a key. → [Dictionaries and sets](/datastructures/dict-set)
- **Four kinds of comprehension**: list, dict, set and generator, each with the shape "expression + for + optional if"; an `if` after the `for` filters, while an `if/else` inside the expression transforms. → [Comprehensions, iterators and generators](/datastructures/iterators-generators)
- **The iterator protocol**: an iterable implements `__iter__`, and an iterator additionally implements `__next__`; what `for` does underneath is "get the iterator, call `next` repeatedly, until `StopIteration`". → [Comprehensions, iterators and generators](/datastructures/iterators-generators)
- **Generator functions**: a function body containing `yield` becomes a generator, producing lazily and keeping state; `yield from` delegates to a sub-generator, and `send()`/`close()` allow two-way communication. → [Comprehensions, iterators and generators](/datastructures/iterators-generators)
- **Generator expression vs list comprehension**: the former is lazy, consumed once, and memory-friendly; the latter evaluates immediately, can be traversed repeatedly, and supports `len` and slicing. → [Comprehensions, iterators and generators](/datastructures/iterators-generators)
- **The itertools operator library**: `chain`/`product`/`combinations`/`groupby`/`islice` cover combining, grouping, flattening and slicing, all memory-friendly. → [Standard library highlights](/engineering/stdlib)
- **f-string formatting**: the default choice since 3.6; the `=` specifier (3.8+) prints the expression alongside its value, and you should know the specifiers `:.2f`/`,`/`%`/alignment-padding; `format` and `%` are the historical styles. → [Strings and formatting](/datastructures/string-formatting)
- **str and bytes**: `str` is a sequence of Unicode code points, `bytes` a sequence of bytes; state `encoding="utf-8"` explicitly at every boundary, and use the `errors` parameter for decode tolerance. → [Strings and formatting](/datastructures/string-formatting)

## Object-oriented and beyond

- **Class attributes vs instance attributes**: a class attribute is shared by all instances; assigning to an instance writes only its instance dict and shadows the class attribute, so updating a shared counter must go through the class name. → [Object-oriented programming](/advanced/oop)
- **`__new__` vs `__init__`**: instantiation first calls `__new__` to create the object, then `__init__` to initialize it; attribute lookup order is instance dict → class dict → parent chain. → [Object-oriented programming](/advanced/oop)
- **MRO and `super()`**: multiple inheritance searches along the MRO from left to right, `super()` calls the next class along the MRO, and in a diamond that guarantees initialization runs only once. → [Object-oriented programming](/advanced/oop)
- **`@property`**: makes a method look like an attribute, paired with `@x.setter` for validation, giving attribute-style access that is encapsulated and free to evolve. → [Object-oriented programming](/advanced/oop)
- **Name mangling**: a single underscore `_x` is private by convention; a double underscore `__x` triggers name mangling to `_ClassName__x`, used to guard against accidental overriding in subclasses. → [Object-oriented programming](/advanced/oop)
- **`@classmethod` and `@staticmethod`**: the former receives the class as `cls` and is often used as an alternative constructor; the latter receives neither instance nor class, it is just a plain function living in the class's namespace. → [Object-oriented programming](/advanced/oop)
- **Duck typing and Protocol**: polymorphism needs no shared base class, only the methods you actually call; `typing.Protocol` declares a structure for static checkers, while runtime enforcement is still absent. → [Object-oriented programming](/advanced/oop)
- **Operator overloading**: `+` goes through `__add__` and `==` through `__eq__`; implementing `__eq__` usually requires handling `__hash__` as well, and the reflected operations use `__radd__` and the like. → [Magic methods and protocols](/advanced/magic-methods)
- **The container protocol**: `__len__`/`__getitem__`/`__setitem__`/`__delitem__`/`__contains__` make an object behave like a sequence; with only `__getitem__` implemented, `for` and `in` still work through fallback. → [Magic methods and protocols](/advanced/magic-methods)
- **`__call__` and `__bool__`**: an instance implementing `__call__` can be invoked like a function, making stateful callables; `__bool__` defines truth value, falling back to `__len__` when absent. → [Magic methods and protocols](/advanced/magic-methods)
- **Decorators**: `@dec` is equivalent to `f = dec(f)`, receiving a function and returning a function; wrapper signatures should always be `*args, **kwargs`, and `@functools.wraps` is mandatory to preserve metadata. → [Decorators](/advanced/decorators)
- **Decorators with arguments**: three nested layers — the outer takes the decorator's arguments, the middle takes the function, the inner takes the call's arguments. → [Decorators](/advanced/decorators)
- **`lru_cache`**: the standard library's memoization decorator, requiring pure functions with hashable arguments; `functools.cache` (3.9+) is equivalent to `lru_cache(maxsize=None)`. → [Decorators](/advanced/decorators)
- **The four-part exception structure**: `try` wraps the code, `except` matches by subclass order, `else` runs when no exception occurs, and `finally` runs either way. → [Exception handling](/advanced/exceptions)
- **Exception chaining**: `raise NewError(...) from e` preserves the original context in `__cause__`; a bare `raise` inside an except block re-raises the current exception unchanged. → [Exception handling](/advanced/exceptions)
- **EAFP vs LBYL**: Python prefers EAFP (just do it and catch the exception) over LBYL (check first, then act) — the former is faster and has no window in which state changes between the check and the use. → [Exception handling](/advanced/exceptions)
- **Exception groups**: `ExceptionGroup` (3.11+) carries several exceptions at once, and `except*` handles them separately by type — built for bulk failures in concurrent code. → [Exception handling](/advanced/exceptions)
- **The `with` protocol**: the return value of `__enter__` is bound to the `as` variable, and `__exit__` receives the exception triple and swallows the exception if it returns a truthy value; exit actions run even on the exception path. → [Context managers](/advanced/context-managers)
- **`@contextmanager`**: turns a generator containing `yield` into a context manager — what comes before the yield is enter, what comes after is exit — sparing you boilerplate classes. → [Context managers](/advanced/context-managers)
- **dataclass**: `@dataclass` auto-generates `__init__`/`__repr__`/`__eq__` from the class annotations; use `field(default_factory=...)` for mutable defaults, and `__post_init__` for derived fields and validation. → [dataclass](/advanced/dataclass)
- **dataclass switches**: `frozen=True` buys immutability and hashability, `order=True` generates comparison methods, `slots=True` (3.10+) saves memory, and `kw_only=True` makes every field keyword-only. → [dataclass](/advanced/dataclass)
- **import semantics**: `import` executes the whole module and binds the module name, while `from` binds only the named objects; declare a `*` whitelist with `__all__` when publishing an API, and don't use `import *` day to day. → [Modules and packages](/advanced/modules)
- **Modules are singletons**: a module executes once on first import and is then cached in `sys.modules`; later imports reuse it directly, making modules naturally process-wide singletons. → [Modules and packages](/advanced/modules)
- **`if __name__ == "__main__"`**: when imported, `__name__` is the module name; when run directly it is `"__main__"` — this switch is what lets a file be both reusable and directly runnable. → [Modules and packages](/advanced/modules)
- **pathlib**: `Path` treats paths as objects, `/` joins them, `glob`/`rglob` finds files, and `read_text`/`write_text` read or write in one go, with large files iterated line by line. → [Files and IO](/advanced/file-io)
- **Atomic writes**: for critical files, use "write a temporary file, then `replace` to rename" for an atomic swap, avoiding a truncated file if power fails mid-write. → [Files and IO](/advanced/file-io)
- **The evolution of type annotations**: builtin container generics `list[int]` in 3.9+, unions `X | Y` in 3.10+, PEP 695 generics in 3.12+; annotations are a static contract, never checked at runtime. → [Type annotations](/advanced/typing)
- **Structural type tools**: `TypedDict` types the keys of a dict, `Protocol` does structural subtyping, `NewType` distinguishes different meanings over the same structure, and `Literal`/`Final` constrain the allowed values and forbid rebinding. → [Type annotations](/advanced/typing)
- **The static checking toolchain**: mypy has the most mature configuration, pyright/basedpyright are fast, and ruff covers part of the type rules on the side; annotations that nobody checks are effectively not written. → [Type annotations](/advanced/typing)

## Concurrency

- **The GIL**: in CPython only one thread executes bytecode at a time, because reference counting is not thread-safe; the consequence is that CPU-bound multithreading buys nothing, while IO-bound work does benefit. → [Multithreading and the GIL](/concurrency/threading)
- **Locks**: the GIL is not thread safety — a read-modify-write such as `+=` has a race window, so shared mutable state must be guarded with `with lock:`. → [Multithreading and the GIL](/concurrency/threading)
- **Producer-consumer**: use `queue.Queue` for cross-thread communication (built-in blocking and signaling, more reliable than hand-rolled locks and condition variables), and announce shutdown with a sentinel value. → [Multithreading and the GIL](/concurrency/threading)
- **Synchronization primitives**: `Lock` for mutual exclusion, `RLock` reentrant, `Semaphore` for limiting concurrency, `Event` as a flag, `Condition` for conditional waiting, `Barrier` as a rendezvous point. → [Multithreading and the GIL](/concurrency/threading)
- **Daemon threads**: killed outright when the main thread exits, so keep them for background chores only; real work must be non-daemon and `join`ed. → [Multithreading and the GIL](/concurrency/threading)
- **Coroutines**: defined with `async def`, suspended by `await`, and started on the event loop with `asyncio.run`; a pure-computation stretch without `await` blocks the whole loop. → [Async programming with asyncio](/concurrency/asyncio)
- **Running concurrently**: `asyncio.gather` (3.7+) and `TaskGroup` (3.11+, structured concurrency) schedule coroutines together, with total time roughly equal to the slowest one. → [Async programming with asyncio](/concurrency/asyncio)
- **Timeouts and cancellation**: add a time limit with `asyncio.wait_for` or `asyncio.timeout` (3.11+); cancellation is cooperative, so do your cleanup inside the `CancelledError` handler. → [Async programming with asyncio](/concurrency/asyncio)
- **Three escapes from blocking calls**: for a handful of calls, push them to a thread pool with `run_in_executor`; for network IO, switch to an async library; for timers, use `asyncio.sleep` rather than `time.sleep`. → [Async programming with asyncio](/concurrency/asyncio)
- **Multiprocessing sidesteps the GIL**: each process has its own interpreter and GIL, which is the standard answer for CPU-bound parallelism; the cost is that process creation and cross-process serialization are more expensive. → [Multiprocessing](/concurrency/multiprocessing)
- **Process pools**: `Pool.map` for batch dispatch, `imap` for streaming results, and `apply_async` for a single asynchronous task, allocating workers by CPU core count. → [Multiprocessing](/concurrency/multiprocessing)
- **Cross-process communication**: data is serialized with pickle, `Queue` goes over a pipe and `Pipe` is point-to-point; for large amounts of shared data use `shared_memory` (3.8+) or `Manager`. → [Multiprocessing](/concurrency/multiprocessing)
- **Start methods**: `fork` (Linux default, fast), `spawn` (macOS/Windows default, clean and portable), and `forkserver` (start a clean process first, then fork); cross-platform projects should set `spawn` explicitly. → [Multiprocessing](/concurrency/multiprocessing)
- **Choosing between the three models**: CPU-bound → multiprocessing; IO-bound at low concurrency → threads; at high concurrency → coroutines; mixed workloads → "asyncio scheduling + executor offload". → [Concurrency models compared](/concurrency/concurrency-compare)

## Engineering practice

- **collections**: `Counter` for counting, `defaultdict` to avoid branching, `deque` as a queue with O(1) at both ends, and `namedtuple` for tuples with fields. → [Standard library highlights](/engineering/stdlib)
- **functools**: `lru_cache` for memoization, `partial` for partial application, `total_ordering` to fill in the missing ordering methods, and `reduce` for folding. → [Standard library highlights](/engineering/stdlib)
- **re regular expressions**: use `r"..."` raw strings, compile patterns for reuse, and prefer the predefined character classes; for structured text prefer a dedicated parser. → [Standard library highlights](/engineering/stdlib)
- **json and datetime**: pass `ensure_ascii=False` to `json.dumps` so Chinese is not escaped; datetime comparisons are only safe with timezones, and 3.12+ has `fromisoformat` parsing the full format plus `zoneinfo`. → [Standard library highlights](/engineering/stdlib)
- **unittest and pytest**: unittest has zero dependencies and is xUnit-style; pytest uses plain functions plus `assert`, auto-destroying `fixture`s and data-driven `parametrize` — it is the community standard. → [Testing](/engineering/testing)
- **Test doubles**: a stub fixes a return value, a spy records calls, a mock asserts behaviour, and a fake is a lightweight real double; the standard library's `unittest.mock` provides `patch`. → [Testing](/engineering/testing)
- **Coverage and CI**: coverage is only a lead — look at whether the uncovered branches should be tested at all; run `pytest -q` in CI, and use GitHub Actions `matrix` for version matrices. → [Testing](/engineering/testing)
- **logging levels**: five tiers DEBUG/INFO/WARNING/ERROR/CRITICAL; `logger = logging.getLogger(__name__)` groups logs by module so each can be adjusted independently. → [Logging and debugging](/engineering/logging)
- **Logging exceptions**: `logger.exception` inside an except block attaches the traceback automatically; use `extra` to add structured fields for the collection system. → [Logging and debugging](/engineering/logging)
- **Troubleshooting tools**: `breakpoint()` (3.7+) drops into pdb; for performance, start with `timeit` microbenchmarks, then `cProfile` for a full profile, and find hot spots by `ncalls`/`cumtime`. → [Logging and debugging](/engineering/logging)
- **pyproject.toml**: PEP 621 standardizes project metadata, concentrating dependencies, version and build backend in one file; `[project.scripts]` declares command-line entry points. → [Packaging and publishing](/engineering/packaging)
- **sdist and wheel**: the source distribution is the fallback and the wheel the preferred pre-built artifact; build with `python -m build` and validate metadata with `twine check`. → [Packaging and publishing](/engineering/packaging)
- **Versioning strategy**: semantic versioning — bump the major version for breaking changes, the minor for new features, the patch for fixes; alternatively derive the version from git tags with `setuptools-scm`. → [Packaging and publishing](/engineering/packaging)
- **Trusted publishing on PyPI**: upload from CI over OIDC with no token; uploaded filenames are permanently claimed and the same version cannot be uploaded twice, so rehearse on TestPyPI first. → [Packaging and publishing](/engineering/packaging)
- **Dependency pinning**: hand-write the direct dependencies with range constraints, plus a full lock via `pip freeze`; `.venv/` does not go into version control, and reproducibility comes from the lock file. → [Virtual environments and dependency management](/engineering/environments)
- **Modern dependency tools**: uv (Rust implementation, pip-ecosystem compatible, fast), Poetry (dependencies plus packaging in one, mature lock files), PDM (a PEP 582/621 pioneer), and pip-tools. → [Virtual environments and dependency management](/engineering/environments)

## Inside the interpreter

The entries below are read from the CPython 3.14 branch source, with citations carrying file and line numbers; the source-reading page set gives the per-entry provenance. → [Reading the CPython source](/internals/cpython-source)

- **The PyObject header**: every Python object starts with a 16-byte "reference count + type pointer", placed at the head of each type's struct by the `PyObject_HEAD` macro; variable-length objects add one more field for length, `PyVarObject`.
- **Immortal objects**: since 3.12, static objects (`None`, small integers and the like) carry a sign-bit mark in their reference count, making increments and decrements no-ops.
- **The compact dict**: the keys table splits into control fields, a hash-index array, and the entries array immediately following; iteration walks the entries array in insertion order, ignoring hash buckets.
- **List over-allocation**: `list_resize` allocates `newsize + newsize>>3 + 6`, rounded up to a multiple of 4 — about 12.5% headroom, which underwrites the amortized O(1) of `append`.
- **The four str forms**: the `kind` bitfield auto-selects a 1/2/4-byte encoding according to content, and the compact form stores the data right after the struct for zero-copy access.
- **The tp_* slots are the vtable**: `PyTypeObject` flattens a type's capabilities into C function pointers; Python-level dunders and C-level slots correspond through the `slotdefs[]` table.
- **Attribute lookup order**: data descriptors beat the instance dict, and the instance dict beats non-data descriptors — that is why a property wins over an instance attribute.
- **Three dispatches in the eval loop**: tail calls, computed goto, and a switch fallback, chosen at compile time by `Python/ceval_macros.h`.
- **Adaptive specialization**: a generic instruction carries a 16-bit countdown counter; once it counts down, it is rewritten in place into a specialized instruction (such as `BINARY_OP_ADD_INT`), and failures reset with exponential backoff.
- **The compilation pipeline**: lexing → PEG parsing → AST → AST preprocessing → symbol table → code generation → CFG optimization → assembly → quickening before first execution.
- **pymalloc**: under 512 bytes goes through a three-tier pool (arena 256 KiB / pool 4 KiB / block 16-byte aligned); above the threshold allocations go straight to `malloc`.
- **Generational GC**: it only manages containers that could form cycles, with default generation thresholds of 2000/10/10 (not the 700 in older references); reference counting handles about nine-tenths of reclamation, and the GC exists only for cycles.
- **The GIL implementation**: one `locked` integer plus a mutex and a condition variable, with a default switch interval of 5000 microseconds; switch points occur only at bytecode boundaries and explicit release points.
- **The import machinery**: the C half provides the `_imp` builtin interface, the Python half lives in `importlib/_bootstrap*.py`; `_find_and_load` takes the fast path by checking `sys.modules` first.
- **The stable ABI**: once `Py_LIMITED_API` is defined, private layouts are quarantined, and in limited mode there is only one way to build a type — `PyType_FromSpec`.

## References

- [Python official documentation · tutorial](https://docs.python.org/3/tutorial/)
- [Python official documentation · glossary](https://docs.python.org/3/glossary.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [index](index.md)
