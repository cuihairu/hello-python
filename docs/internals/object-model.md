---
description: The PyObject object header, reference counting and immortal objects, and the memory layout of the compact dict hash table, the list pointer array, and the four shapes of str, with citations carrying file line numbers.
---

# Core data structures: PyObject and the three big containers

This page focuses on the memory layout of CPython objects and containers; for using lists, dicts and tuples from Python code, see [Lists and tuples](/datastructures/list-tuple) and [Dicts and sets](/datastructures/dict-set).

Line numbers correspond to the 3.14 branch at commit `66df30d15c9052785ed6463663e70d38107a9edf` (checked out 2026-10-04); for how to clone and the prerequisites for reading, see the [overview](/internals/cpython-source).

## The header of every object

`PyObject` has only two members (`Include/pytypedefs.h:18`, the struct itself at `Include/object.h:110`): a reference count and a type pointer. The first field of every Python object is this; the `PyObject_HEAD` macro (`Include/object.h:60`) puts those sixteen bytes at the start of every type struct, and what people call "inheritance" is just keeping the memory-layout prefix consistent by hand. Variable-length objects carry one more field, the size, making `PyVarObject` (`Include/object.h:169`); `list`, `tuple` and `str` all begin with it.

The most important change in the reference-count header since 3.12 is immortal objects. `Py_INCREF` is an inline function (`Include/refcount.h:252`); on a 64-bit build it first checks whether the count has already reached `_Py_IMMORTAL_INITIAL_REFCNT` (3 shifted left 30, `Include/refcount.h:49`), and if so returns immediately (`Include/refcount.h:283`). Static objects such as `None`, `True` and small integers are initialized with `PyObject_HEAD_INIT` already carrying that count (`Include/object.h:65`), so every increment and decrement after that is a no-op. The test is the sign bit: `_Py_IsImmortal` only looks at whether the top bit of the count is 1 (`Include/refcount.h:125`).

When `Py_DECREF` (`Include/refcount.h:327`) drives the count to zero it calls the type's `tp_dealloc` (the comment at `Include/object.h:327` spells out this convention). Reference counting is immediate reclamation and it cannot handle cycles; the generational GC covered in [memory management](/internals/memory-management) fills that gap.

In the free-threaded build (the no-GIL experimental line) `PyObject` gets a different layout (`Include/object.h:152`): a thread ID, a per-object mutex, and local plus shared counts split into two field groups; the reference-counting logic later in this section has separate branches for that layout. The default build carries none of this.

## dict: a compact hash table

`PyDictObject` has three business fields (`Include/cpython/dictobject.h:11`): `ma_used` is the element count, `ma_keys` points at the shared key table, and `ma_values` is `NULL` when keys and values live together in `ma_keys` (a combined table — everything except an instance `__dict__` is one of these); non-`NULL` means the key table is shared while values are stored separately (a split table, used by a class's instance attributes).

The key table `PyDictKeysObject` (`Include/internal/pycore_dict.h:179`) has three sections: control fields, the hash index array `dk_indices`, and the entry array immediately following it. The index array picks its width from the table size; `dk_log2_size` records the table length as a power of two, and index byte widths of 1/2/4/8 switch as the table grows. The entry array is packed tightly in insertion order, and what the index array holds is the entry subscript. This is the "compact dict": iteration walks the entry array in insertion order without consulting hash buckets.

The open-addressing probe sequence is in the comment at `Objects/dictobject.c:344`: `j = (5*j) + 1 + perturb`, where `perturb` starts from the hash value and shifts right each round (`Objects/dictobject.c:348`); the initial probe entry is at `Objects/dictobject.c:984`. The single entry point `_Py_dict_lookup` (`Objects/dictobject.c:1248`) dispatches on the kind of key table: an all-unicode key table takes the fast path of comparing pointers with no comparison at all, and other keys go through the generic comparison.

Two constants set the resize rhythm: the load cap `USABLE_FRACTION(n) = n*2/3` (`Objects/dictobject.c:543`), so past two thirds a `dictresize` runs (`Objects/dictobject.c:383`); the new capacity is estimated with `GROWTH_RATE(d) = ma_used*3` (`Objects/dictobject.c:590`) and then rounded up to a power of two.

## list: a pointer array

`PyListObject` (`Include/cpython/listobject.h:5`) is just a `PyObject**` array plus two lengths: `ob_size` is the current element count and `allocated` is the capacity, with `0 <= ob_size <= allocated`. Growth goes through `list_resize` (`Objects/listobject.c:108`), and the over-allocation formula is `newsize + newsize>>3 + 6` rounded up to a multiple of 4 (`Objects/listobject.c:133`), about 12.5% headroom. That formula is what gives `append` its amortized O(1).

## str: four shapes, one struct

Strings are the most layout-sensitive type in CPython. The comment at the head of `PyASCIIObject` (`Include/cpython/unicodeobject.h:54`) lists four shapes: compact ASCII, compact non-ASCII, legacy (subclass instances). The core is `kind` in the `state` bit field: 1/2/4-byte encodings are picked automatically by content, pure ASCII uses 1 byte, and 4 bytes only appears when characters outside the BMP are present. In the compact shapes the character data follows the struct in the same allocation, with zero-copy access; only instances of `str` subclasses use the legacy layout, where struct and data are two separate allocations (`Include/cpython/unicodeobject.h:168` and `:176`).

New strings are allocated by `PyUnicode_New` (`Objects/unicodeobject.c:1376`), which sizes the allocation by the largest code point. Interning is one dictionary per interpreter (`Objects/unicodeobject.c:267`); once identifiers and constant strings enter it, `state.interned` is set, and combined with immortality this lets attribute lookup compare pointers only.

The type pointer in the object header points at a `PyTypeObject`; the section [Type system and attribute lookup](/internals/type-system) unpacks that "vtable".

## References

- [Python official docs · language reference](https://docs.python.org/3/reference/datamodel.html)
- [CPython C API · object protocol](https://docs.python.org/3/c-api/object.html)
- [CPython developer guide](https://devguide.python.org/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [cpython-source](cpython-source.md)
- [gil-threading](gil-threading.md)
- [memory-management](memory-management.md)
