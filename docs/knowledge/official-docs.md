---
description: "The official sources behind the on-site knowledge points: PEPs one by one, standard library sections and tool documentation, every one of them linked."
---

# Official documentation

The official sources cited by the on-site pages, gathered by theme. PEPs are the original proposals for language evolution, the standard library documentation is the final word on behaviour, and the tool documentation covers the ecosystem. Every link points to an accessible official address; in a dispute, the original text wins.

## PEPs: language evolution, one by one

- **[PEP 8](https://peps.python.org/pep-0008/)**: the official style guide. The 4-space indent and the naming conventions all come from here. → [Syntax basics](/basics/syntax)
- **[PEP 343](https://peps.python.org/pep-0343/)**: the proposal for the `with` statement, and the original definition of the `__enter__`/`__exit__` protocol. → [Context managers](/advanced/context-managers)
- **[PEP 442](https://peps.python.org/pep-0442/)**: safe object finalization; since 3.4, objects carrying `__del__` inside reference cycles can be collected, though the timing of the call is still hard to guarantee. → [Common pitfalls](/advanced/pitfalls)
- **[PEP 484](https://peps.python.org/pep-0484/)**: the type annotation standard, the root of the annotation system introduced in 3.5. → [Type annotations](/advanced/typing)
- **[PEP 492](https://peps.python.org/pep-0492/)**: `async`/`await` syntax, landed in 3.5. → [Async programming with asyncio](/concurrency/asyncio)
- **[PEP 498](https://peps.python.org/pep-0498/)**: f-strings, landed in 3.6. → [Strings and formatting](/datastructures/string-formatting)
- **[PEP 517](https://peps.python.org/pep-0517/) and [PEP 518](https://peps.python.org/pep-0518/)**: the build backend interface and `pyproject.toml`, the foundation of modern packaging. → [Packaging and publishing](/engineering/packaging)
- **[PEP 557](https://peps.python.org/pep-0557/)**: dataclasses, landed in 3.7. → [dataclass](/advanced/dataclass)
- **[PEP 572](https://peps.python.org/pep-0572/)**: the walrus operator `:=`, landed in 3.8. → [Syntax basics](/basics/syntax)
- **[PEP 582](https://peps.python.org/pep-0582/)**: the `__pypackages__` local package directory proposal, the basis for PDM (the proposal itself was rejected, but the tool survives). → [Virtual environments and dependency management](/engineering/environments)
- **[PEP 584](https://peps.python.org/pep-0584/)**: the dict merge operator `|`, landed in 3.9. → [Dictionaries and sets](/datastructures/dict-set)
- **[PEP 617](https://peps.python.org/pep-0617/)**: the PEG parser replacing pgen, landed in 3.9, freeing up room for later syntax evolution. → [The compiler pipeline](/internals/compiler-pipeline)
- **[PEP 621](https://peps.python.org/pep-0621/)**: project metadata into `pyproject.toml`. → [Virtual environments and dependency management](/engineering/environments)
- **[PEP 634](https://peps.python.org/pep-0634/)**: structural pattern matching, landed in 3.10. → [Control flow](/basics/control-flow)
- **[PEP 654](https://peps.python.org/pep-0654/)**: exception groups and `except*`, landed in 3.11. → [Exception handling](/advanced/exceptions)
- **[PEP 668](https://peps.python.org/pep-0668/)**: marks "externally managed environments", so installing packages with a global pip is disabled by default; bypassing it takes `--break-system-packages`. → [Virtual environments and dependency management](/engineering/environments)
- **[PEP 695](https://peps.python.org/pep-0695/)**: type parameter syntax `def first[T](...)`, landed in 3.12. → [Type annotations](/advanced/typing)
- **[PEP 703](https://peps.python.org/pep-0703/)**: the free-threaded build making the GIL optional, introduced experimentally in 3.13. → [Multithreading and the GIL](/concurrency/threading)
- **[PEP 750](https://peps.python.org/pep-0750/)**: template strings, t-strings, landed in 3.14. → [Timeline](/timeline)
- **[PEP 779](https://peps.python.org/pep-0779/)**: free-threaded builds move from experimental to officially supported (still not the default), 3.14. → [Multithreading and the GIL](/concurrency/threading)
- **[PEP 11](https://peps.python.org/pep-0011/)**: the platform support policy, the boundary document for deciding "which behaviours belong to the implementation rather than the language". → [The CPython / standards-implementation boundary](/internals/implementation-boundary)

## Standard library and language reference

- **[Python Tutorial](https://docs.python.org/3/tutorial/)**: the official Python tutorial (original title of the external resource), with chapters relevant to the site's syntax and data structure themes. → [Environment setup](/basics/setup)
- **[The Python Language Reference](https://docs.python.org/3/reference/)**: the language specification itself, the authoritative definition of "what Python is"; the source page on "the boundary between language and implementation" takes this as its baseline. → [The CPython / standards-implementation boundary](/internals/implementation-boundary)
- **[The Python Standard Library](https://docs.python.org/3/library/)**: the standard library reference. The behavioural details of collections, itertools, functools, pathlib, re, json and datetime all live here. → [Standard library highlights](/engineering/stdlib)
- **[asyncio documentation](https://docs.python.org/3/library/asyncio.html)**: the event loop, coroutines, and the full API surface of `gather`/`TaskGroup`/`timeout`. → [Async programming with asyncio](/concurrency/asyncio)
- **[threading documentation](https://docs.python.org/3/library/threading.html) and [multiprocessing documentation](https://docs.python.org/3/library/multiprocessing.html)**: the authoritative account of thread synchronization primitives and process start methods; `sys.setswitchinterval` is at [the sys documentation](https://docs.python.org/3/library/sys.html#sys.setswitchinterval). → [Multithreading and the GIL](/concurrency/threading), [Multiprocessing](/concurrency/multiprocessing)
- **[typing documentation](https://docs.python.org/3/library/typing.html)**: the semantic definitions of `Protocol`/`TypedDict`/`NewType`/`Literal`/`Final`. → [Type annotations](/advanced/typing)
- **[dataclasses documentation](https://docs.python.org/3/library/dataclasses.html)**: `field` parameters, the timing of `__post_init__`, and the frozen/order/slots switches. → [dataclass](/advanced/dataclass)
- **[logging documentation](https://docs.python.org/3/library/logging.html) and [Logging HOWTO](https://docs.python.org/3/howto/logging.html)**: the full configuration surface for levels, Handler and Formatter. → [Logging and debugging](/engineering/logging)
- **[unittest documentation](https://docs.python.org/3/library/unittest.html)**: the assertions and fixtures of the xUnit-style framework. → [Testing](/engineering/testing)
- **[venv documentation](https://docs.python.org/3/library/venv.html)**: creating, activating and isolating virtual environments. → [Environment setup](/basics/setup)

## Tool and ecosystem documentation

- **[pip](https://pip.pypa.io/)**: the official documentation for the package installer, including the requirements syntax and commands such as `pip check`. → [Environment setup](/basics/setup)
- **[Python Packaging User Guide](https://packaging.python.org/)**: the PyPA packaging overview, and the source of the overall framework for the packaging and publishing chapter. → [Packaging and publishing](/engineering/packaging)
- **[PyPI Trusted Publishing](https://docs.pypi.org/trusted-publishers/)**: the official explanation of OIDC token-less uploads from CI. → [Packaging and publishing](/engineering/packaging)
- **[build](https://build.pypa.io/) and [twine](https://twine.readthedocs.io/)**: the official tool documentation for building and uploading. → [Packaging and publishing](/engineering/packaging)
- **[setuptools](https://setuptools.pypa.io/)**: configuration for the `pyproject.toml` build backend. → [Packaging and publishing](/engineering/packaging)
- **[pytest](https://docs.pytest.org/)**: the official documentation for fixtures, parametrize and `--cov`. → [Testing](/engineering/testing)
- **[ruff](https://docs.astral.sh/ruff/)**: one tool doing both linting and formatting. → [Environment setup](/basics/setup)
- **[uv](https://docs.astral.sh/uv/)**: a Rust-based package manager; `uv lock` reproduces across machines. → [Virtual environments and dependency management](/engineering/environments)
- **[Poetry](https://python-poetry.org/) and [PDM](https://pdm-project.org/)**: the two official documents covering dependencies-plus-packaging in one and the PEP 582/621 route. → [Virtual environments and dependency management](/engineering/environments)
- **[pyenv](https://github.com/pyenv/pyenv)**: user-level multi-version management. → [Environment setup](/basics/setup)

## References

- [Python official documentation](https://docs.python.org/3/)
- [Python official documentation · tutorial](https://docs.python.org/3/tutorial/)
- [Python official documentation · standard library](https://docs.python.org/3/library/)
- [PEP index](https://peps.python.org/pep-0008/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [index](index.md)
