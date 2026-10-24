---
description: The evolution of annotation syntax from 3.5 to 3.12, generics and type parameters, and how static checkers pick annotations up.
---

# Type annotations

Type annotations arrived in 3.5 and kept evolving through 3.9, 3.10 and 3.12. The Python runtime **does not validate** annotations - they are a contract for people and for static checkers (mypy, pyright, ruff), and what you get in return is IDE completion and bugs exposed earlier.

## Basic annotations

Variables, function parameters and return values can all be annotated. On 3.9+ use the built-in container generics `list[int]` directly; `typing.List` is no longer needed. On 3.10+ write unions as `X | Y`; `Optional` is no longer needed:

```python
def normalize(name: str, times: int = 1) -> list[str]:
    return [name.strip().lower()] * times

count: int = 3
names: list[str] = normalize("  Py ")
print(names, count)

def find(key: str, data: dict[str, int]) -> int | None:
    return data.get(key)

print(find("a", {"a": 1}), find("z", {"a": 1}))
```

```text
['py'] 3
1 None
```

The old spellings for reference: `typing.List[int]` is the same as `list[int]`, `Optional[X]` is the same as `X | None`, `Union[X, Y]` is the same as `X | Y`. You need to recognize them when reading older code, but write new code with the new syntax.

## Containers and nesting

```python
def tally(words: list[str]) -> dict[str, int]:
    out: dict[str, int] = {}
    for w in words:
        out[w] = out.get(w, 0) + 1
    return out

print(tally(["a", "b", "a"]))

matrix: list[list[int]] = [[1, 2], [3, 4]]
print(matrix[1][0])
```

```text
{'a': 2, 'b': 1}
3
```

## TypedDict and NamedTuple

Use `TypedDict` to type the keys of a dict structure; use `NamedTuple` for an immutable record. Neither changes runtime behavior - both exist purely for the checkers:

```python
from typing import TypedDict, NamedTuple

class User(TypedDict):
    name: str
    age: int

u: User = {"name": "py", "age": 30}
print(u["name"], isinstance(u, dict))

class Point(NamedTuple):
    x: float
    y: float

print(Point(1.0, 2.0).x, isinstance(Point(1, 2), tuple))
```

```text
py True
1.0 True
```

## Protocol: structural subtyping

`Protocol` defines "whatever has these methods counts as this type", with no explicit inheritance - duck typing, statically. Mark a function parameter with a Protocol type and the checker will verify the shape of whatever object the caller passes in:

```python
from typing import Protocol

class Greeter(Protocol):
    def greet(self) -> str: ...

class Formal:
    def greet(self) -> str:
        return "您好"

class Casual:
    def greet(self) -> str:
        return "嗨"

def welcome(g: Greeter) -> str:
    return g.greet()

print(welcome(Formal()), welcome(Casual()))
```

```text
您好 嗨
```

## Generic functions

`TypeVar` declares that "the type is tied to the argument": `first` takes `list[T]` and returns `T | None`, so the checker can infer that passing a list[str] returns str | None. On 3.12+ there is the shorter `def first[T](...)` syntax:

```python
from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T | None:
    return items[0] if items else None

print(first(["a", "b"]), first([]), first([1, 2]))
```

```text
a None 1
```

## Callable and iterator types

Use `Callable[[parameter types...], return type]` for callback types; for generators use `Generator[YieldT, SendT, ReturnT]` (simplified to `Generator[YieldT]` on 3.13+):

```python
from collections.abc import Callable, Iterator

def apply_twice(f: Callable[[int], int], x: int) -> int:
    return f(f(x))

print(apply_twice(lambda n: n * 2, 3))

def counter(n: int) -> Iterator[int]:
    for i in range(n):
        yield i

print(list(counter(3)))
```

```text
12
[0, 1, 2]
```

## Literal, Final and alias checks

`Literal` restricts a value to a fixed set of literals (state machines, switches), `Final` forbids reassignment, and `NewType` separates values that share a structure but not its meaning (a UserId is not a str):

```python
from typing import Literal, Final, NewType

Mode = Literal["read", "write"]

def open_db(mode: Mode) -> str:
    return f"以 {mode} 打开"

print(open_db("read"))

MAX: Final = 100

UserId = NewType("UserId", str)
uid = UserId("u-1")
print(uid, isinstance(uid, str))
```

```text
以 read 打开
u-1 True
```

## The static-checking toolchain

Writing annotations without running a checker is about the same as not writing them. The mainstream options:

| Tool | Role |
| --- | --- |
| mypy | The veteran type checker, mature configuration story |
| pyright / basedpyright | The core of VS Code Pylance, fast |
| ruff | Covers a share of type-related lint rules along the way |

```bash
python3 -m pip install mypy
mypy src/            # check the directory
mypy --strict src/   # strict mode: unannotated code is reported too
```

## Summary

- Annotations are a static contract, unchecked at runtime; they only pay off once mypy/pyright is in the loop.
- The new syntax: built-in generics `list[int]`, unions `X | Y` (3.10+), PEP 695 generics (3.12+).
- Use `Protocol` for structural matching, `TypedDict` for dict structures, `NewType` to separate meanings.
- Mark callbacks as `Callable`, generators as `Iterator`/`Generator`.

## Further reading

- [Python official documentation · typing](https://docs.python.org/3/library/typing.html)
- [PEP 484 · Type Hints](https://peps.python.org/pep-0484/)
- [PEP 544 · Protocols](https://peps.python.org/pep-0544/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/knowledge/books.md)
- [core-concepts](/knowledge/core-concepts.md)
- [official-docs](/knowledge/official-docs.md)
