---
description: The tp_* slots of PyTypeObject and the slotdefs mapping, the full order of attribute lookup, the MRO cache, and where the descriptor protocol lands in C, with citations carrying file line numbers.
---

# Type system and attribute lookup

Line numbers correspond to the 3.14 branch at commit `66df30d15c9052785ed6463663e70d38107a9edf` (checked out 2026-10-04); for how to clone and the prerequisites for reading, see the [overview](/internals/cpython-source).

## The tp_* slots are the vtable

`PyTypeObject` (`Include/cpython/object.h:148`) flattens everything a type can do into C function pointers: `tp_dealloc` (`:155`) owns destruction, `tp_call` (`:172`) makes instances callable, `tp_descr_get`/`tp_descr_set` (`:210`, `:211`) implement the descriptor protocol, `tp_new` (`:215`) owns creation, and `tp_mro` (`:219`) holds the method resolution order. Hand-writing an extension type is filling in this table.

The mapping between Python-level dunders and C-level slots is not magic; it is one static table, `slotdefs[]` (`Objects/typeobject.c:10969`). When a class defines or changes a name such as `__init__`, `update_one_slot` (`Objects/typeobject.c:11308`) looks up the table and changes the matching slot to a forwarding function; `fixup_slot_dispatchers` (`Objects/typeobject.c:3700`) does this in bulk during the `PyType_Ready` flow. The forwarding functions are generic entry points of the form `slot_tp_getattr_hook` (`Objects/typeobject.c:10390`), which check the instance dict first and then walk the type MRO, calling Python-level `__getattr__` only when nothing is found. So the answer to "does adding `__len__` to a class take effect immediately?" is yes: assignment goes through `type_setattro`, and if the name is a dunder the slot is updated at the same time.

A type is itself an object; `PyType_Type` is at `Objects/typeobject.c:6736`, and the metaclass abilities of `type` come from it filling in the same table.

## Attribute lookup: two table probes, data descriptors win

The full order for class attribute access is in `_Py_type_getattro_impl` (`Objects/typeobject.c:6103`):

1. Look up `name` on the metatype; if it hits a data descriptor (one implementing `tp_descr_set`), call it and return immediately;
2. Otherwise look up `name` on the type's own `tp_dict` and those of its bases (via the MRO); if it hits something carrying `tp_descr_get`, call it (`Objects/typeobject.c:6149`), and if it hits a non-descriptor, return it directly;
3. Fall back to a non-data descriptor or plain attribute on the metatype, and raise `AttributeError` if nothing is found.

Instance attribute access goes through `PyObject_GenericGetAttrWithDict` (`Include/cpython/object.h:311`): probe the type MRO first, letting a data descriptor win; then check the instance's `__dict__`; a non-data descriptor found on the type is only called when the instance dict has no entry. This precedence is where "a `property` beats an instance attribute of the same name, and an instance attribute beats a plain method" comes from.

The MRO lookup itself is cached: `_PyType_Lookup` (`Objects/typeobject.c:5972`) drops into `_PyType_LookupStackRefAndVersion` (`Objects/typeobject.c:5878`), which indexes a per-type cache table by type and name hash, with the hit condition carrying a `tp_version_tag` version number; any modification to a type invalidates that tag, so the next lookup re-runs.

## Where descriptors land in C

The descriptor protocol is three methods at the Python level, `__get__`/`__set__`/`__delete__`; its landing points in C are the two slots `tp_descr_get`/`tp_descr_set`. Common examples of where it lands:

- plain functions: `func_descr_get` (`Objects/funcobject.c:1282`), which binds the function and the instance into a `PyMethod` when reached through attribute access — this is the entire mechanism behind "methods bind self automatically", and `PyFunction_Type` fills this slot at `:1325`;
- `property`: `property_descr_get` (`Objects/descrobject.c:1661`), which forwards to the stored fget;
- `classmethod`/`staticmethod`: the type definitions are also in `Objects/funcobject.c` (`:1684`, `:1932`); the only difference is whether binding takes the class or ignores the instance.

Under the limited API (`Py_LIMITED_API`) you may not write a `PyTypeObject` literal directly; the alternative path is `PyType_FromSpec` (`Objects/typeobject.c:5432`), which describes the slots with a `PyType_Spec` and lets the runtime assemble them. The type flags are gathered from `Include/object.h:543` on: `Py_TPFLAGS_HEAPTYPE` (`:546`) marks types created on the heap, and `Py_TPFLAGS_BASETYPE` (`:549`) allows a type to be subclassed.

## References

- [Python official docs · types](https://docs.python.org/3/library/types.html)
- [CPython C API · type objects](https://docs.python.org/3/c-api/typeobj.html)
- [Python official docs · language reference](https://docs.python.org/3/reference/datamodel.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [cpython-source](cpython-source.md)
- [object-model](object-model.md)
