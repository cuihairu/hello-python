---
description: "A guided overview of reading CPython source on the 3.14 branch: source layout, how it builds, the entry chain, and a tour of all subpages, with citations down to file and line."
---

# Reading the CPython source

The Python language spec and any one interpreter are two different things. These pages read the interpreter itself: the 3.14 branch of the official CPython repository (the current stable maintenance line), checked out on 2026-10-04 at commit `66df30d15c9052785ed6463663e70d38107a9edf`, version string `3.14.8+` (`Include/patchlevel.h:27`). Every citation carries a `file:line` reference, and line numbers refer to that commit; later commits on the branch will drift the line numbers, but file names and function names stay stable for a long time.

::: tip How to read this
A shallow clone of the official repo is all you need to follow along:

```bash
git clone --depth 1 --branch 3.14 https://github.com/python/cpython.git
```

When a conclusion feels shaky, jump to the cited line and read the source itself. Don't trust secondhand accounts, including this page.
:::

## Source layout and build

The top-level directories each own a job:

| Directory | Responsibility |
| --- | --- |
| `Include/` | Headers. The top level is the stable C API, `Include/cpython/` holds private object layouts, and `Include/internal/` may only be included by the interpreter internals |
| `Objects/` | Implementations of the built-in types: `dictobject.c`, `listobject.c`, `unicodeobject.c`, `typeobject.c`, and so on |
| `Python/` | The interpreter core: the eval loop `ceval.c`, the compiler `codegen.c`, the lifecycle `pylifecycle.c`, plus the C half of the standard library (`sysmodule.c`, `import.c`, `gc.c`) |
| `Modules/` | Extension modules and some other C foundation: `main.c` (the command-line entry point), `gcmodule.c` (the Python face of the gc module) |
| `Lib/` | The pure-Python standard library; `importlib/_bootstrap*.py` is the Python half of the import system |
| `Parser/` | The lexer `lexer/`, source dispatch `tokenizer/`, and the grammar-generated `parser.c` |
| `Grammar/` | The PEG grammar definition `python.gram` |
| `Programs/` | The `main()` of the executables — the real entry point is only a dozen or so lines |
| `Tools/` | Build-time code generators: `cases_generator/` generates eval-loop code from `bytecodes.c` |
| `Doc/` | Documentation and the stable ABI list (`Doc/data/stable_abi.dat`) |

The minimal build is the four lines in the README (`README.rst:53`):

```bash
./configure
make
make test
sudo make install
```

`--with-pydebug` gives a debug build with assertions and reference-count checks, and building outside the source tree is supported (`README.rst:87`). For a release version, `--enable-optimizations` turns on PGO (`README.rst:94`), whose make target is `profile-opt` (`Makefile.pre.in:877`); LTO uses `--with-lto` (`README.rst:129`).

From typing `python` to your code actually running, the entry chain is: `main()` at `Programs/python.c:15` calls `Py_BytesMain` (`Modules/main.c:886`), which enters `pymain_main` (`Modules/main.c:858`), finishes `pymain_init` (`Modules/main.c:36`), then hands off to `Py_RunMain` (`Modules/main.c:833`). `Py_RunMain` runs initialization before user code: initialization happens in two steps, `pyinit_core` (`Python/pylifecycle.c:1092`) building the interpreter core state and `pyinit_main` (`Python/pylifecycle.c:1404`) setting up `sys`, `builtins`, and the import machinery; then `pymain_run_python` (`Modules/main.c:660`) decides from the command line whether to run a script, `-c`, `-m`, or drop into the REPL. Programs that embed CPython walk the same chain, just starting from `Py_InitializeEx` (`Python/pylifecycle.c:1457`).

## Chapter guide

The nine subpages that follow are organized around how data is laid out, how types are looked up, how code is executed, how memory is reclaimed, how garbage is observed, how threads switch, and how modules get loaded. Line-number conventions match this page:

| Subpage | Content |
| --- | --- |
| [Core data structures](/zh/internals/object-model) | `PyObject` object header, reference counts and immortal objects, and the memory layout of the three main containers: dict, list, str |
| [Type system and attribute lookup](/zh/internals/type-system) | the `tp_*` slot vtable, the slotdefs mapping, attribute lookup order, MRO caching, and where descriptors land |
| [The interpreter main loop](/zh/internals/eval-loop) | the three bytecode dispatch modes, instruction definitions in `bytecodes.c`, adaptive specialization, and tier-2/JIT |
| [Compiler pipeline](/zh/internals/compiler-pipeline) | lexing, PEG parsing, AST preprocessing, the symbol table, code generation, CFG optimization, and assembly |
| [Memory management](/zh/internals/memory-management) | reference counting, the three tiers of pymalloc pools, and the thresholds and algorithm of generational GC |
| [The gc module: the Python face of garbage collection](/zh/internals/gc-module) | starting and stopping, thresholds, collect and stats, the observation API, debug flags and callbacks, and freeze |
| [The GIL and the threading model](/zh/internals/gil-threading) | the GIL implementation and switch interval, thread state, and layout changes in free-threaded builds |
| [The import system and module objects](/zh/internals/import-system) | the C/Python two halves, the load call chain, pyc cache validation, and what a module object really is |
| [The CPython / standards-implementation boundary](/zh/internals/implementation-boundary) | `sys.implementation`, the stable ABI, and where the language spec ends and implementation detail begins |

These pages split the implementation into stages, so you can pick by concern: for performance, read the interpreter main loop and the compiler pipeline; for debugging, memory management; for multithreading, the GIL and threading model. The source overview and core data structures give the overall background.

## Further reading

- [CPython repository](https://github.com/python/cpython)
- [CPython developer guide](https://devguide.python.org/)
- [CPython developer guide · exploring internals](https://devguide.python.org/internals/exploring/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [compiler-pipeline](../zh/internals/compiler-pipeline)
- [eval-loop](../zh/internals/eval-loop)
- [gil-threading](../zh/internals/gil-threading)
- [implementation-boundary](../zh/internals/implementation-boundary)
- [import-system](../zh/internals/import-system)
- [memory-management](../zh/internals/memory-management)
- [object-model](../zh/internals/object-model)
- [type-system](../zh/internals/type-system)
- [books](/zh/knowledge/books)
- [core-concepts](/zh/knowledge/core-concepts)
