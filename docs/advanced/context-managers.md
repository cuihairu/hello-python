---
description: The protocol behind with - __enter__/__exit__ - plus equivalent contextlib forms and what the standard library ships for free.
---

# Context managers

The with statement folds "enter the resource, exit the resource" into one syntactic block: whether or not an exception is raised in the middle, the exit action is guaranteed to run. Opening a file, taking a lock, a database transaction, a connection pool - anything with a paired enter/exit belongs in a context manager.

## Why with is reliable

Managing resources by hand has three holes: forgetting to close, an early return that skips the close, and a mid-way exception that bypasses it. with grabs the resource on entry and calls `__exit__` on exit, so the exception still passes through and the cleanup logic sees it:

```python
import tempfile, pathlib

with tempfile.TemporaryDirectory() as d:
    p = pathlib.Path(d) / "a.txt"
    p.write_text("data", encoding="utf-8")
    print(p.exists())
# 离开 with 后目录已被清理
```

```text
True
```

Cleanup still runs when an exception is raised, and the exception itself keeps propagating outward:

```python
def demo():
    try:
        with open("/dev/null", "w") as f:
            f.write("x")
            raise RuntimeError("出事了")
    except RuntimeError as e:
        return f"捕获 {e}，文件已随 with 关闭"

print(demo())
```

```text
捕获 出事了，文件已随 with 关闭
```

## __enter__ and __exit__

The protocol is only two methods: the return value of `__enter__` is bound to the `as` variable; `__exit__` receives the exception triple (type, value, traceback), and returning a true value **swallows** the exception - when writing your own manager, don't return true unless you intend to recover:

```python
class Tag:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print(f"[{self.name}] enter")
        return self.name          # 赋给 as 变量
    def __exit__(self, exc_type, exc, tb):
        print(f"[{self.name}] exit exc={exc_type.__name__ if exc_type else None}")
        return False              # 不吞异常

with Tag("db") as t:
    print("使用", t)
```

```text
[db] enter
使用 db
[db] exit exc=None
```

Demonstrating exception pass-through - `__exit__` can see the exception but chooses to let it go:

```python
class Guard:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        print("异常类型:", exc_type.__name__ if exc_type else None)
        return False              # False 放行，True 吞掉

try:
    with Guard():
        raise ValueError("bad")
except ValueError as e:
    print("外层收到:", e)
```

```text
异常类型: ValueError
外层收到: bad
```

Returning True is for "local recovery": clean up the scene and fold the exception back into normal flow, for instance turning a low-level exception into your own domain exception:

```python
class Translate:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        if exc_type is KeyError:
            print("已把 KeyError 转为默认值，流程继续")
            return True           # 吞掉，with 后照常执行
        return False

with Translate():
    d = {}
    print(d["missing"])
print("继续执行")
```

```text
已把 KeyError 转为默认值，流程继续
继续执行
```

## contextlib: from three lines to one

The `@contextmanager` decorator turns "a generator that has a yield" into a context manager: everything before the yield is enter, everything after is exit. Save the boilerplate wherever you can:

```python
from contextlib import contextmanager
import tempfile, pathlib

@contextmanager
def chdir(path):
    import os
    old = os.getcwd()
    os.chdir(path)
    try:
        yield                      # with 体在这一行执行
    finally:
        os.chdir(old)              # finally 保证异常时也复原

with tempfile.TemporaryDirectory() as d:
    with chdir(d):
        print(pathlib.Path.cwd().name == pathlib.Path(d).name)
print(pathlib.Path.cwd() != pathlib.Path(d))   # 已切回原目录
```

```text
True
True
```

## The ready-made helpers in the standard library

- `open` / `pathlib` file handling (the most common one).
- `threading.Lock`: `with lock:` acquires and releases under mutual exclusion.
- `contextlib.suppress(X)`: ignore a specific exception, cleaner than try/except.
- `contextlib.redirect_stdout`: redirect output (useful for capturing prints in tests).
- `decimal.localcontext`: a context for decimal precision.
- `async with`: asynchronous resources (an aiohttp session, for example).

```python
from contextlib import suppress, redirect_stdout
import io

with suppress(FileNotFoundError):
    open("/definitely/not/here.txt")
print("异常被 suppress 吞掉，流程继续")

buf = io.StringIO()
with redirect_stdout(buf):
    print("悄悄打印")
print("stdout 被重定向到:", repr(buf.getvalue()))
```

```text
异常被 suppress 吞掉，流程继续
stdout 被重定向到: '悄悄打印\n'
```

## Write your own, or compose

Rolling your own `__enter__`/`__exit__` fits a resource the class itself holds (a connection, a session); wrapping a stretch of procedural logic in `@contextmanager` is lighter. Reuse what already exists (`suppress`, `closing`, `ExitStack`) first - `ExitStack` handles the case where the number of resources is not fixed:

```python
from contextlib import ExitStack, closing
from contextlib import contextmanager

@contextmanager
def step(name, log):
    log.append(f"start:{name}")
    yield
    log.append(f"end:{name}")

log = []
with ExitStack() as stack:
    stack.enter_context(step("a", log))
    stack.enter_context(step("b", log))
    print("工作中", log)
print(log)
```

```text
工作中 ['start:a', 'start:b']
['start:a', 'start:b', 'end:b', 'end:a']
```

## Summary

- with guarantees the enter/exit pair, and the exception path is no exception to that.
- The protocol: `__enter__` returns the `as` value, `__exit__` inspects the exception triple and swallows the exception if it returns true.
- Use `@contextmanager` for procedural logic, `suppress` to ignore exceptions, and `ExitStack` for many resources.
- For standard cases - locks, transactions, redirection - just use the ready-made ones.

## Further reading

- [Python official documentation · contextlib](https://docs.python.org/3/library/contextlib.html)
- [PEP 343 · the with statement](https://peps.python.org/pep-0343/)
- [Python official documentation · Language reference](https://docs.python.org/3/reference/datamodel.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [core-concepts](/knowledge/core-concepts.md)
- [official-docs](/knowledge/official-docs.md)
- [pitfalls](/knowledge/pitfalls.md)
- [scenarios](/knowledge/scenarios.md)
