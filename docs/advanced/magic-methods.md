---
description: How dunder methods like __repr__, __add__ and __iter__ hook into object protocols and operator dispatch.
---

# Magic methods and object protocols

Dunder methods are the mount points for Python's object protocols: which magic methods an object implements determines what the object *is* — `+` goes to `__add__`, `for` goes to `__iter__`, and every builtin operator in the language dispatches to these methods through the protocol.

## String representation: __repr__ and __str__

`__str__` faces the user (print, str), `__repr__` faces the developer (REPL, debugging, elements inside containers), and the latter is expected to be "complete, and ideally able to reconstruct the object." When you write only one, write `__repr__` first:

```python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x!r}, {self.y!r})"
    def __str__(self):
        return f"({self.x}, {self.y})"

p = Point(1, 2)
print(str(p), repr(p))
print([p])                       # 容器里显示 repr
```

```text
(1, 2) Point(1, 2)
[Point(1, 2)]
```

## Operator overloading

Arithmetic and comparison operators each have a corresponding method: `+` is `__add__`, `-` is `__sub__`, `==` is `__eq__`, `<` is `__lt__`. Implementing `__eq__` usually means also setting `__hash__` (set it to None for mutable objects):

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    def __mul__(self, k):
        return Vector(self.x * k, self.y * k)
    def __eq__(self, other):
        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))

print(Vector(1, 2) + Vector(3, 4))
print(Vector(1, 1) * 3)
print(Vector(1, 2) == Vector(1, 2), Vector(1, 2) in {Vector(1, 2)})
```

```text
Vector(4, 6)
Vector(3, 3)
True True
```

Reflected operators (`__radd__` and friends) handle the case where "the left operand doesn't know about you"; `@functools.total_ordering` needs only `__eq__` and one comparison operator to fill in the rest of the ordering:

```python
from functools import total_ordering

@total_ordering
class Ver:
    def __init__(self, n): self.n = n
    def __eq__(self, o): return self.n == o.n
    def __lt__(self, o): return self.n < o.n

print(Ver(1) < Ver(2), Ver(2) >= Ver(2), sorted([Ver(3), Ver(1)])[0].n)
```

```text
True True 1
```

## Container protocols

`__len__`, `__getitem__`, `__setitem__`, `__delitem__`, `__contains__` make an object behave like a sequence. Implementing only `__getitem__` still lets for loops and in work through the fallback mechanism, but implementing them explicitly is more complete:

```python
class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)
    def __len__(self):
        return len(self._songs)
    def __getitem__(self, i):
        return self._songs[i]
    def __contains__(self, song):
        return song in self._songs

pl = Playlist(["晴天", "七里香"])
print(len(pl), pl[0], pl[-1], "晴天" in pl)
for s in pl:
    print(s, end=";")
print()
```

```text
2 晴天 七里香 True
晴天;七里香;
```

## Callable and context protocols

Instances implementing `__call__` can be invoked like functions, often used as stateful function objects; `__enter__`/`__exit__` is the with protocol (see the context managers chapter for details):

```python
class Multiplier:
    def __init__(self, k):
        self.k = k
    def __call__(self, x):
        return x * self.k

double = Multiplier(2)
print(double(21), callable(double))
print(list(map(Multiplier(10), [1, 2, 3])))
```

```text
42 True
[10, 20, 30]
```

## Numeric conversion and truth value

`__bool__` decides whether an object is true or false in an if (when absent it falls back to `__len__`, and a length of 0 is false); `__int__`/`__float__` support explicit conversion:

```python
class Bag:
    def __init__(self, items):
        self.items = list(items)
    def __len__(self):
        return len(self.items)
    def __bool__(self):
        return True            # 覆盖默认：空袋子也是「真」

print(bool(Bag([])), bool(Bag([1])))

class Temp:
    def __init__(self, c): self.c = c
    def __float__(self): return self.c

print(round(float(Temp(36.8)), 1))
```

```text
True True
36.8
```

::: tip Reflection-style magic methods
`__getattr__` fires when the normal lookup fails (useful for proxies and lazy loading); `__getattribute__` intercepts every attribute access and it is easy to write infinite recursion with it, so use it with care; `__slots__` declares a fixed set of attributes, saving memory and blocking dynamic attribute addition.
:::

## dataclass auto-generation

Hand-writing `__init__`, `__repr__` and `__eq__` is too verbose, and `@dataclass` fills them in with one line (see the dataclass chapter for details):

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

print(repr(Point(1.0, 2.0)), Point(1, 2) == Point(1.0, 2.0))
```

```text
Point(x=1.0, y=2.0) True
```

## Summary

- Implement `__repr__` first; debugging and logs benefit everywhere.
- Operator overloading = implementing the corresponding magic method; consider `__eq__` and `__hash__` as a pair.
- The five-piece container protocol gives an object len, indexing, in and for.
- `__call__` makes a stateful callable object, `__bool__` sets the truth value.
- Do not overload operators to show off — only when the semantics are clear.

## References

- [Python documentation · language reference](https://docs.python.org/3/reference/datamodel.html)
- [Python documentation · standard library](https://docs.python.org/3/library/operator.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/knowledge/books.md)
- [core-concepts](/knowledge/core-concepts.md)
