---
description: "Where each feature lands in practice, and the trade-offs when choosing: which tool for which need, each with its source page."
---

# Use cases

Concepts are organized by "what they are"; this section is organized by "when to use them". The same requirement often has several solutions, so here I give the basis for the choice rather than a one-size-fits-all answer.

## Data processing and text

- **Deduplicating a list**: few elements and order does not matter, use `set(nums)`; order matters, use `list(dict.fromkeys(nums))`. → [Dictionaries and sets](/datastructures/dict-set)
- **Sorting keys by value**: `sorted(d, key=d.get, reverse=True)` is cleaner than converting to a list first and then sorting. → [Dictionaries and sets](/datastructures/dict-set)
- **Grouping and counting**: `defaultdict(list)` to collect by dimension, `Counter(...).most_common(n)` for word-frequency style counting — don't hand-roll `if key in d`. → [Dictionaries and sets](/datastructures/dict-set)
- **Indexing multi-dimensional coordinates**: use tuple keys, `{(0,0): "x"}` — flatter than nested dicts, and directly usable as set elements. → [Dictionaries and sets](/datastructures/dict-set)
- **Joining many strings at once**: `s += x` in a loop is O(n²); use `"".join(parts)` to build it in one pass. → [Strings and formatting](/datastructures/string-formatting)
- **Traversing a large sequence once**: a generator expression `(f(n) for n in big)` keeps only the current item in memory; reach for a list comprehension only when you need repeated access or `len`. → [Comprehensions, iterators and generators](/datastructures/iterators-generators)
- **Infinite or very long sequences**: a generator function with `itertools.islice` to take just the items you need, such as the first 8 of the Fibonacci sequence. → [Comprehensions, iterators and generators](/datastructures/iterators-generators)
- **Combinations and permutations**: `itertools.combinations`/`product`/`permutations` give you one line each — don't hand-roll nested loops. → [Standard library highlights](/engineering/stdlib)
- **Fixed-shape records**: coordinates, database rows, multiple return values — use tuple or `NamedTuple`; reserve list for dynamic collections. → [Lists and tuples](/datastructures/list-tuple)
- **Extracting patterned fragments with regex**: for patterned fragments (order numbers, amounts) use `re.findall` with a precompiled pattern; for full syntactic structure (nested brackets, JSON) switch to a dedicated parser. → [Standard library highlights](/engineering/stdlib)

## Files, configuration and data exchange

- **Batch processing files**: `Path.glob("*.py")`/`rglob("**/*.md")` to find files, with `read_text`/`write_text` to read and write. → [Files and IO](/advanced/file-io)
- **Reading a large file line by line**: `with p.open() as f: for line in f:` iterates lazily and never reads the whole file into memory. → [Files and IO](/advanced/file-io)
- **Safe writes for critical files**: write a temporary file, then `replace` to rename, for an atomic swap, avoiding a truncated file if power fails mid-write. → [Files and IO](/advanced/file-io)
- **Exchanging structured data**: JSON via `json` (pass `ensure_ascii=False` for Chinese), tables via `csv`, URLs via `urllib.parse` — don't try to force regex onto them. → [Files and IO](/advanced/file-io), [Standard library highlights](/engineering/stdlib)
- **Cross-platform time handling**: build `datetime(..., tzinfo=timezone.utc)` with a timezone before comparing; from 3.12 use `zoneinfo` for timezone databases. → [Standard library highlights](/engineering/stdlib)
- **Uniform encoding**: state `encoding="utf-8"` explicitly for files and network APIs; do not rely on the platform default (Windows often uses GBK, the main cause of "garbled text when reading a file"). → [Strings and formatting](/datastructures/string-formatting)

## Concurrency and networking

- **IO-heavy work such as network requests and file IO**: low concurrency or a synchronous library stack, use `threading`; hundreds or thousands of connections with an async library available, use `asyncio`. → [Concurrency models compared](/concurrency/concurrency-compare)
- **Passing data between threads**: `queue.Queue` (built-in blocking and wait-notification), with a sentinel value for shutdown; to stop a long-running thread use a `threading.Event` flag rather than killing it. → [Multithreading and the GIL](/concurrency/threading)
- **CPU-heavy work such as numerical computation and image processing**: `multiprocessing.Pool` to parallelize around the GIL; for everyday batch dispatch use `Pool.map`. → [Multiprocessing](/concurrency/multiprocessing)
- **Sharing large arrays across processes**: `shared_memory.SharedMemory` (3.8+) lets several processes read and write the same block of memory directly — the standard choice for large NumPy arrays. → [Multiprocessing](/concurrency/multiprocessing)
- **Running blocking calls inside coroutines**: push the odd ones off to `loop.run_in_executor`, swap network IO to async libraries such as httpx or aiohttp, and use `await asyncio.sleep` for timers. → [Async programming with asyncio](/concurrency/asyncio)
- **Collecting failures from a batch of tasks**: from 3.11 use `TaskGroup` (structured concurrency — exceptions propagate automatically and sibling tasks are cancelled) or `ExceptionGroup` with `except*`. → [Async programming with asyncio](/concurrency/asyncio), [Exception handling](/advanced/exceptions)
- **Limiting the concurrency count**: threads with `Semaphore(n)`, coroutines with `asyncio.Semaphore(n)` — don't fan out every task at once. → [Multithreading and the GIL](/concurrency/threading), [Async programming with asyncio](/concurrency/asyncio)
- **Mixed load in a real service**: the event loop takes requests, heavy computation goes to a process pool via `run_in_executor` (`ProcessPoolExecutor`), so the main loop is never blocked. → [Concurrency models compared](/concurrency/concurrency-compare)

## Engineering, release and quality

- **Modelling structured data**: `@dataclass` for objects flowing inside the system; pydantic with runtime validation for external input at an API boundary (HTTP, configuration files). → [dataclass](/advanced/dataclass)
- **Immutable value objects**: `@dataclass(frozen=True, order=True)` for immutability and hashability, so the object can be a dict key; change a value with `replace()` to derive a copy. → [dataclass](/advanced/dataclass)
- **Properties with validation**: `@property` with `@x.setter` — the caller experiences an attribute, while the implementer keeps validation and room to evolve. → [Object-oriented programming](/advanced/oop)
- **Alternative constructors**: `@classmethod` receives `cls`, so write named constructors like `Event.from_iso(...)` — clearer than several overloaded `__init__`. → [Object-oriented programming](/advanced/oop)
- **Speeding up repeated computation**: for pure functions with hashable arguments use `functools.lru_cache`; recursive Fibonacci drops from exponential to linear. → [Decorators](/advanced/decorators)
- **Adding cross-cutting logic uniformly**: wrap logging, timing, retries and authentication in decorators rather than copy-pasting into every function; add `@functools.wraps` to each wrapper. → [Decorators](/advanced/decorators)
- **Pairing resource lifetimes**: files, locks, transactions and connection pools with `with`; procedural logic with `@contextmanager`, swallowing exceptions with `contextlib.suppress`, and an indefinite number of resources with `ExitStack`. → [Context managers](/advanced/context-managers)
- **Testing**: for a new project go straight to pytest — `assert` in one line, `fixture` with automatic teardown, `parametrize` for data-driven cases; isolate external dependencies with `unittest.mock`. → [Testing](/engineering/testing)
- **Logging**: `logger = logging.getLogger(__name__)` to group by module, `logger.exception` for exceptions with a traceback, and `extra` to carry structured fields into the collection system. → [Logging and debugging](/engineering/logging)
- **Reproducible dependencies**: declare direct dependencies in `pyproject.toml`, pin the full version set in a lock file, and keep `.venv/` out of version control; use uv for speed, Poetry for a mature lock experience. → [Virtual environments and dependency management](/engineering/environments)
- **Releasing a package**: metadata in `pyproject.toml`, `python -m build` for sdist plus wheel, `twine` to upload, and trusted publishing in CI for token-less upload; rehearse on TestPyPI first. → [Packaging and publishing](/engineering/packaging)
- **Shipping a command-line tool**: for non-Python users use `pipx` to install, or `PyInstaller`/`shiv`/`pex` to produce a self-contained executable. → [Packaging and publishing](/engineering/packaging)

## Debugging and troubleshooting

- **Finding a performance bottleneck**: `timeit` for a microbenchmark first, then `cProfile` for a full profile, and find hot spots by `ncalls`/`cumtime` — don't optimize on intuition. → [Logging and debugging](/engineering/logging)
- **Setting breakpoints**: `breakpoint()` (3.7+) drops into pdb, where `n` is next line, `s` steps into, `p expression` prints, and `c` continues. → [Logging and debugging](/engineering/logging)
- **Deciding "why is it slow"**: measure to tell whether time goes to computation or waiting, then choose threads, coroutines or processes. → [Multithreading and the GIL](/concurrency/threading)

## References

- [Python official documentation · standard library](https://docs.python.org/3/library/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [index](index.md)
