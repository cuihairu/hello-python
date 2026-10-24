---
description: Import forms, module singleton semantics, package layout with __init__.py, sys.path and project layout.
---

# Modules and packages

A module is a .py file; a package is a directory with an `__init__.py` (omittable since 3.3). Everything Python imports hangs off these two levels.

## The shapes of import

```python
import json                          # 用 json.dumps
import collections                   # as 别名：标准库示例
from pathlib import Path             # 直接引入名字
from collections import defaultdict, Counter
from math import sqrt, pi as 圆周率
```

Let's actually check the core semantics: `import` executes the whole module and binds the module name; `from` only binds the named things:

```python
import json
from json import dumps

print(json.dumps([1, 2]), dumps([3]))
```

```text
[1, 2] [3]
```

::: warning Don't use import *
`from module import *` dumps every public name into the current namespace: untraceable provenance, and easy to shadow. When publishing an API, declare the `*` whitelist with `__all__`; in everyday code don't import with `*`.
:::

## A module is a singleton

A module runs once on first import, then lands in the `sys.modules` cache, and a later import just reuses it — a module is a process-wide singleton by nature, which makes it a good home for config and connection pools. Here is the execution count:

```python
import sys, types

mod = types.ModuleType("counter_mod")
exec("loads = []\nloads.append('init')", mod.__dict__)
print(mod.loads)
sys.modules["counter_mod"] = mod                # 手工注册进缓存

import importlib
same = importlib.import_module("counter_mod")   # 命中缓存，不再执行模块体
print(same is mod, mod.loads)
```

```text
['init']
True ['init']
```

## Package layout and __init__.py

A typical project layout:

```text
myproject/
├── pyproject.toml
└── src/
    └── mypkg/
        ├── __init__.py
        ├── core.py
        └── utils/
            ├── __init__.py
            └── text.py
```

`__init__.py` runs when the package is imported, and is commonly used to lift submodule names up to the package top level, so callers write `from mypkg import Thing` without needing to know the file layout:

```python
# mypkg/__init__.py 的典型写法：
# from .core import Thing
# __all__ = ["Thing"]
```

Relative imports only work inside a package: `.core` for a sibling, `..utils` for the parent. You can't use relative imports when running a script directly — "attempted relative import with no known parent package" is what you get when the entry file contains a relative import.

## `if __name__ == "__main__"`

When a module is imported, `__name__` is the module name; when it runs directly as a script it is `"__main__"`. This switch lets a file be both imported for reuse and run outright:

```python
# mymod.py
def add(a, b):
    return a + b

if __name__ == "__main__":       # 只有直接运行时才执行
    print(add(2, 3))
```

Run the following once as a script and once as an import:

```python
script = "def add(a, b):\n    return a + b\n\nif __name__ == '__main__':\n    print(add(2, 3))\n"
import pathlib, subprocess, tempfile, sys

with tempfile.TemporaryDirectory() as d:
    p = pathlib.Path(d) / "mymod.py"
    p.write_text(script, encoding="utf-8")
    r1 = subprocess.run([sys.executable, str(p)], capture_output=True, text=True)
    print("直接运行:", r1.stdout.strip())
    sys.path.insert(0, d)
    import mymod                                  # 导入：main 块不执行
    print("导入后调用:", mymod.add(10, 5))
```

```text
直接运行: 5
导入后调用: 15
```

## Import paths and sys.path

The interpreter looks for modules in the order the directories appear in `sys.path`: the script's directory, `PYTHONPATH`, then the site-packages directory. Adding a path on the fly is `sys.path.insert` (for debugging); real projects rely on installation (pip install -e .) or a virtual environment:

```python
import sys
print(len(sys.path) > 1, any("site-packages" in p for p in sys.path))
```

```text
True True
```

## Common layouts and best practices

- The `src/` layout (the package lives under src/) forces tests to use the installed package, which avoids the "works locally, breaks after install" trap.
- Circular imports (A imports B, B imports A) usually mean the split of responsibilities is wrong; pull the shared part out into a third module.
- `python -m pkg.module` runs something as a module and keeps the package context intact, which is more reliable than running a script via a relative path.

## Summary

- import finds the module, executes it once, and caches it in `sys.modules`.
- `__init__.py` promotes the package's public API; `__all__` declares the `*` whitelist.
- `if __name__ == "__main__"` separates "being imported" from "being run".
- Projects use the src/ layout plus an editable install, which kills sys.path hacks.

## References

- [Python documentation · tutorial](https://docs.python.org/3/tutorial/modules.html)
- [Python documentation · language reference](https://docs.python.org/3/reference/import.html)
- [Python documentation · importlib](https://docs.python.org/3/library/importlib.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/zh/glossary.md)
- [core-concepts](/zh/knowledge/core-concepts.md)
- [pitfalls](/zh/knowledge/pitfalls.md)
