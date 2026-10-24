---
description: "How the high-frequency traps work, and how to avoid them: semantics, containers, concurrency and engineering, each with its source page."
---

# Common pitfalls

This is a cross-topic quick-reference index for looking things up again: each entry keeps only the key point and the dedicated page it belongs to. Causes, examples and practical detail live at [the common pitfalls chapter](/advanced/pitfalls). Entries that share a theme with the dedicated page are kept here as summaries, not repeated in full.

## Semantics

- **Mutable default arguments**: the default is shared between calls; use a `None` sentinel and create a new object in the body. Cause and example at [the chapter page](/advanced/pitfalls).
- **Late binding in closures**: a closure captures the variable itself, not its value at that moment, so functions created in a loop all share the loop variable and see the last value once the loop ends. Workaround: snapshot it at definition time with a default argument, `lambda i=i: i`. → [Functions](/basics/functions)
- **`is` used as `==`**: object identity does not mean equal value; reserve `is` for singleton checks. Cause and example at [the chapter page](/advanced/pitfalls).
- **Floats used for money**: IEEE 754 cannot represent 0.1, so `0.1 + 0.2 == 0.3` is False. Workaround: `decimal.Decimal` for amounts, and a tolerance for float comparisons. → [Variables and data types](/basics/variables-and-types)
- **String comparison not normalized**: before comparing across systems, apply uniform case folding and Unicode NFC normalization; details at [the chapter page](/advanced/pitfalls).

## Containers and copying

- **`[[]] * n` copies the reference**: the same inner list is referenced `n` times, so appending to one changes them all. Workaround: for multi-dimensional structures use a comprehension, `[[0]*3 for _ in range(2)]`. → [Lists and tuples](/datastructures/list-tuple)
- **Shallow copy used as a deep copy**: a shallow copy still shares nested members; consider `copy.deepcopy` when you need isolation. Details at [the chapter page](/advanced/pitfalls).
- **Mutating a container during iteration**: adding or removing while iterating can skip items; build a new container instead, or iterate a copy. Examples at [the chapter page](/advanced/pitfalls).
- **Unhashable objects used as keys**: list/dict/set have no stable `__hash__`, so using one as a key raises `TypeError` outright. Workaround: keys should be numbers, strings, bytes, or tuples whose contents are all hashable. → [Dictionaries and sets](/datastructures/dict-set)
- **Empty set written as `{}`**: `{}` is an empty dict, not an empty set. Workaround: `set()` for an empty set. → [Dictionaries and sets](/datastructures/dict-set)

## Concurrency

- **Assuming threads speed up CPU-bound work**: under the GIL, multithreading in one process runs purely computational work serially — or even slower. Workaround: `multiprocessing` for CPU-bound work, or native libraries such as NumPy that release the GIL. → [Multithreading and the GIL](/concurrency/threading)
- **Shared state without a lock**: `+=` decomposes into a multi-step read-modify-write, a switch can land in the middle, and you get the occasional lost update that is hard to reproduce. Workaround: guard shared mutable state with `with lock:`, including shared counters. → [Multithreading and the GIL](/concurrency/threading)
- **Calling `time.sleep` or synchronous requests inside a coroutine**: a blocking stretch with no `await` stalls the whole event loop and all coroutines stop together. Workaround: `await asyncio.sleep` for timers, `run_in_executor` for blocking calls. → [Async programming with asyncio](/concurrency/asyncio)
- **Using lambdas or closures for multiprocessing callbacks**: under spawn the child process re-imports the module, and lambdas and local functions cannot be pickled. Workaround: make `target` a named function importable at module top level. → [Multiprocessing](/concurrency/multiprocessing)
- **Missing the `__main__` guard with multiprocessing**: under spawn the child re-imports the main module, and without a guard it recurses into creating processes forever. Workaround: always wrap the script entry point in `if __name__ == "__main__":`. → [Multiprocessing](/concurrency/multiprocessing)
- **Assuming a child process changed the parent's data**: what crosses a process boundary is a copy deserialized from pickle, so no matter how many times the child appends, the parent never moves. Workaround: send results back over a queue or via `Manager().list()`. → [Multiprocessing](/concurrency/multiprocessing)

## Engineering

- **Bare `except` swallowing exceptions**: `except:` catches `KeyboardInterrupt` and `SystemExit` too, so when production breaks there is nothing left to investigate; `except: pass` makes errors vanish without a trace. Workaround: at minimum `except Exception`, and either handle, log or re-raise. → [Exception handling](/advanced/exceptions)
- **`__exit__` returning True**: returning `True` from a custom context manager swallows the exception; unless you mean a local recovery, return `False`. → [Context managers](/advanced/context-managers)
- **`import *`**: dumps all of a module's public names into the current namespace, with no traceable origin and a high chance of shadowing. Workaround: declare a whitelist with `__all__` and avoid `import *` day to day. → [Modules and packages](/advanced/modules)
- **Relative imports in a script**: when running an entry file directly, relative imports are not allowed, reporting "attempted relative import with no known parent package". Workaround: run it as a module with `python -m pkg.module`, or switch to absolute imports. → [Modules and packages](/advanced/modules)
- **Mutable defaults in a dataclass**: `tags: list = []` raises `ValueError` outright, since every instance would share the same object. Workaround: `field(default_factory=list)`. → [dataclass](/advanced/dataclass)
- **`lru_cache` on a non-pure function**: unhashable arguments raise `TypeError`, and a function depending on external state returns stale cached results. Workaround: cache only pure functions with hashable arguments. → [Decorators](/advanced/decorators)
- **Missing logging fields failing silently**: if a formatter references a field absent from the record, the error is trapped inside the handler by logging and written to stderr rather than raised to the caller, so it is only discoverable from stderr. Workaround: align the fields you supply via `extra` with the formatter. → [Logging and debugging](/engineering/logging)
- **Installing packages with a global pip**: it upgrades system tool dependencies, and Linux distributions are especially sensitive to it (PEP 668 disables this by default). Workaround: do not bypass with `--break-system-packages`; use a venv. → [Virtual environments and dependency management](/engineering/environments)
- **Declaring dependencies without pinning them**: a requirements.txt with no version pins drifts, producing "it worked fine last week" bugs. Workaround: range constraints for direct dependencies plus a lock file pinning the full version set. → [Virtual environments and dependency management](/engineering/environments)
- **Reusing a PyPI version number**: an uploaded filename is claimed permanently, the same version cannot be uploaded twice, and deleting the release does not free the filename. Workaround: rehearse on TestPyPI first, and a version number is safer late than early. → [Packaging and publishing](/engineering/packaging)
- **Betting resource release on `__del__`**: destructor timing is not suitable as a resource management guarantee; use `with`/`finally`. Details at [the chapter page](/advanced/pitfalls).

## References

- [Python official documentation · common pitfalls (FAQ)](https://docs.python.org/3/tutorial/appendix.html)
- [Python official documentation · execution model](https://docs.python.org/3/reference/executionmodel.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [index](index.md)
