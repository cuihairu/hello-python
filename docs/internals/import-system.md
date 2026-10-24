---
description: The C and Python halves of the import system, the full call chain from an import statement to module execution, pyc cache validation, and what a module object really is, with citations carrying file line numbers.
---

# The Import Mechanism and Module Objects

Line numbers correspond to 3.14 branch commit `66df30d15c9052785ed6463663e70d38107a9edf` (checked out 2026-10-04); for the cloning method and reading prerequisites, see the [overview](/internals/cpython-source).

The import system is the textbook case of C and Python each writing half. The C half (`Python/import.c`) provides the `_imp` builtin interface: the builtin module table `_PyImport_Inittab` (declared at `Python/import.c:58`, body in the build-generated `config.c`, per-entry matching at `:2420`), dynamic extension loading (the `import_find_extension` flow comment is at `:721`), and per-module locking for the global bookkeeping (`:126`). The Python half lives in `Lib/importlib/_bootstrap.py` and `_bootstrap_external.py`, embedded at startup as frozen modules (the table from `Python/frozen.c:70` includes `_frozen_importlib`), installed during the `pyinit_main` phase (`Python/pylifecycle.c:472`, `:927`).

Call chain at the Python layer:

1. An `import` statement enters `builtin___import___impl` (`Python/bltinmodule.c:282`), which forwards to importlib's `__import__` (`Lib/importlib/_bootstrap.py:1473`);
2. `_gcd_import` (`:1394`) normalizes relative imports and then goes to `_find_and_load` (`:1360`): it checks `sys.modules` first, and a hit that is not mid-initialization is returned as-is — this fast path makes a repeated import close to free;
3. On a miss it takes the module lock and goes to `_find_and_load_unlocked` (`:1308`), which walks `sys.meta_path` looking for a spec;
4. `_load_unlocked` (`:914`) first builds the module object with `module_from_spec`, **puts it in `sys.modules` before executing the module code**, and on failure removes it from `sys.modules` and raises. Registering before executing is what lets circular references see a half-built module.

Loading a file module happens in `_bootstrap_external.py`: `SourceFileLoader` (`:966`)'s `get_code` (`:1015`) reads the source or the cached pyc. The pyc magic number `MAGIC_NUMBER` (`:224`) pins the bytecode version; `_classify_pyc` (`:424`) recompiles when the magic number does not match; timestamp mode additionally compares the source file's mtime and size (`_validate_timestamp_pyc`, `:457`); the cache path is produced by `cache_from_source` (`:239`) as a `__pycache__` layout.

A module object itself is thin: `PyModuleObject` is mostly a name plus a dict, created by `PyModule_NewObject` (`Objects/moduleobject.c:128`); the module's `__dict__` is all of its state, and `__name__`, `__spec__`, and `__loader__` are all keys in that dict. Attribute access goes through `_Py_module_getattro` (`Objects/moduleobject.c:1140`), with a module-level `__getattr__` as fallback.

## References

- [Python official docs · language reference](https://docs.python.org/3/reference/import.html)
- [Python official docs · importlib](https://docs.python.org/3/library/importlib.html)
- [Python official docs · site](https://docs.python.org/3/library/site.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [cpython-source](cpython-source.md)
