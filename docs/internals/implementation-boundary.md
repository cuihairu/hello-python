---
description: "Which behaviors are language-spec guarantees and which are CPython implementation details: sys.implementation, the stable ABI, officially labeled implementation details and the cross-implementation compatibility line, with citations carrying file line numbers."
---

# The boundary between CPython and the standard implementation

Line numbers correspond to the 3.14 branch at commit `66df30d15c9052785ed6463663e70d38107a9edf` (checked out 2026-10-04); for how to clone and the prerequisites for reading, see the [overview](/internals/cpython-source).

"What Python is" is defined by the language reference (`Doc/reference/` in this repo); CPython is one implementation of that spec. The source itself marks which behaviors belong to this implementation and not to the language:

`sys.implementation` is the official dividing mechanism. The name is hardcoded as `"cpython"` (`Python/sysmodule.c:3629`), the cache tag is assembled as `cpython-314`, and the fields are filled in by `make_impl_info` (`Python/sysmodule.c:3641`). Use it to determine "which interpreter is my code running on" rather than platform probing.

The standard library almost never writes special cases for other implementations; the exceptions are concentrated in `Lib/platform.py`: `python_implementation()` (`:1249`) identifies Jython (`:1182`) and PyPy (`:1193`) from the `sys.version` prefix. Beyond that, no code for PyPy, IronPython, GraalPy, MicroPython or RustPython lives in this repo; the PEP 11 (platform support policy) number appears in the 3.14 branch only in the `Misc/HISTORY` changelog (e.g. `Misc/HISTORY:4559`), with zero references from current code or language documentation.

This page covers the implementation boundary and portability; for choosing standard library modules in everyday engineering, see [Standard library highlights](/engineering/stdlib).

The stable ABI draws the line for extension authors. Once `Py_LIMITED_API` is defined, `Include/Python.h` trims its includes by version condition (`Include/Python.h:36`, `:42`), and all private layouts are quarantined into `Include/cpython/` and wrapped in `#ifndef Py_LIMITED_API` (e.g. `Include/cpython/code.h:3`); in limited mode there is only one way to create a type, `PyType_FromSpec` (`Objects/typeobject.c:5432`). An extension that respects this line could in theory run on another implementation; the list of promises is in `Doc/data/stable_abi.dat`.

Some widely known mechanisms are explicitly documented as implementation details rather than language promises: immortal objects (`Doc/glossary.rst:777`). The bytecode format, `co_code_adaptive`, specialization statistics and GIL switch parameters are the same story, all private to CPython, with no other implementation compatible with any of them.

Beyond the boundary there is a layer of practical judgment: conclusions drawn from reading CPython source fall into two kinds, "language specification" and "current implementation." The object model and descriptor precedence belong to the former, and are likely the same across implementations; adaptive specialization, pymalloc's pool parameters and the 2000 GC threshold belong to the latter, and can change in any version. This doc set's citation style (file plus line number) exists so that both kinds of conclusion can be re-checked.

## References

- [Python documentation · language reference](https://docs.python.org/3/reference/)
- [Python documentation · C API](https://docs.python.org/3/c-api/object.html)
- [CPython developer guide](https://devguide.python.org/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [cpython-source](cpython-source.md)
- [official-docs](/knowledge/official-docs.md)
