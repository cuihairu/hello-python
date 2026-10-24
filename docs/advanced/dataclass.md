---
description: "@dataclass generates __init__, __repr__ and __eq__ for you; configuring fields with field and __post_init__."
---

# dataclass and structured data

Most classes are really just "structures with fields": they hold data, compare for equality, and print in a readable form. The `@dataclass` decorator generates that boilerplate for you, and has been the way to express structured data since 3.7.

## Basic usage

The decorator generates `__init__`, `__repr__` and `__eq__` from the class annotations. Declare fields as "name: type", and put a class-level assignment for a default value:

```python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int = 0

u1 = User("Alice", 30)
u2 = User("Alice", 30)
print(u1)
print(u1 == u2, u1 != User("Bob", 30))
```

```text
User(name='Alice', age=30)
True True
```

::: warning Defaults must be immutable, or use default_factory
A field default is the same trap as a default argument on a function: every instance shares it. A mutable default (list/dict/set) must use `field(default_factory=...)` so each instance gets a fresh object - writing `tags: list = []` straight out raises `ValueError`:

```python
from dataclasses import dataclass, field

@dataclass
class Post:
    title: str
    tags: list = field(default_factory=list)
    meta: dict = field(default_factory=dict)

p1, p2 = Post("a"), Post("b")
p1.tags.append("py")
print(p1.tags, p2.tags)
```

```text
['py'] []
```
:::

## The common switches

`frozen=True` makes instances immutable (hashable, usable as dict keys); `order=True` generates comparison methods (in field order); `slots=True` (3.10+) enables slots to save memory; `kw_only=True` (3.10+) makes every field keyword-only:

```python
from dataclasses import dataclass

@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int = 0

v = Version(3, 12)
print(v.major, sorted([Version(3, 11), Version(3, 12)])[0])
print({v: "key"}[v])
try:
    v.major = 4
except Exception as e:
    print(type(e).__name__)
```

```text
3 Version(major=3, minor=11)
key
FrozenInstanceError
```

## field and __post_init__

`field()` controls the behavior of a single field: `default_factory`, `repr=False`, `compare=False`, `init=False` and so on. When you need a derived field or validation, implement `__post_init__`, which is called automatically at the end of `__init__`:

```python
from dataclasses import dataclass, field

@dataclass
class Order:
    price: float
    qty: int
    total: float = field(init=False)      # 不进 __init__，由派生得出
    note: str = field(default="", repr=False)

    def __post_init__(self):
        if self.price < 0 or self.qty < 0:
            raise ValueError("价格与数量必须非负")
        self.total = self.price * self.qty

o = Order(9.5, 3)
print(o.total, o)
try:
    Order(-1, 1)
except ValueError as e:
    print("ValueError:", e)
```

```text
28.5 Order(price=9.5, qty=3, total=28.5)
ValueError: 价格与数量必须非负
```

## Converting to and from serialization

`asdict()`/`astuple()` recursively produce a plain dict/tuple, so json can get them into the database in one line; `replace()` derives a modified copy from an existing instance (especially handy for frozen classes):

```python
import json
from dataclasses import dataclass, asdict, replace

@dataclass
class Point:
    x: float
    y: float

p = Point(1.0, 2.0)
print(json.dumps(asdict(p)))
print(replace(p, x=9.0), asdict(p))
```

```text
{"x": 1.0, "y": 2.0}
Point(x=9.0, y=2.0) {'x': 1.0, 'y': 2.0}
```

## The landscape of structured-data tools

| Tool | Positioning | Fits |
| --- | --- | --- |
| `@dataclass` | Standard library, generates boilerplate | Internal structures, config objects, value semantics |
| `typing.NamedTuple` | An immutable tuple with fields | Lightweight records, where tuple compatibility matters |
| `attrs` | Third-party, a superset of features | When you need stronger validation or conversion |
| `pydantic` | Runtime validation plus parsing | API boundaries: external data entering the system |

External input (HTTP, config files) should go through something with runtime validation like pydantic; inside the system, a dataclass is enough.

## Summary

- `@dataclass` generates `__init__`/`__repr__`/`__eq__` for you, and the field declarations are the documentation.
- Use `field(default_factory=...)` for mutable defaults.
- `frozen` buys you immutability and hashability; `__post_init__` handles derivation and validation.
- `asdict`/`replace` serve serialization and immutable updates.

## Further reading

- [Python official documentation · dataclasses](https://docs.python.org/3/library/dataclasses.html)
- [PEP 557 · dataclasses](https://peps.python.org/pep-0557/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [core-concepts](/zh/knowledge/core-concepts)
- [official-docs](/zh/knowledge/official-docs)
- [pitfalls](/zh/knowledge/pitfalls)
- [scenarios](/zh/knowledge/scenarios)
