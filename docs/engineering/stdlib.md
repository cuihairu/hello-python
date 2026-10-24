---
description: The everyday surface of collections, itertools, functools, pathlib, re and json/datetime.
---

# Standard library highlights

Python's "batteries included" claim rests on the standard library. This page picks out the most-used modules: collections, itertools, functools, pathlib, re, json and datetime — they spare most of the third-party dependencies.

This page covers the standard library from the angle of day-to-day selection; for the boundary between the language spec and the CPython implementation, see the [source walkthrough notes](/internals/implementation-boundary).

## collections

Enhanced data structures beyond the generic containers:

```python
from collections import Counter, defaultdict, deque, namedtuple

# Counter：计数与频次统计
c = Counter("abracadabra")
print(c.most_common(2), c["a"], c.total())

# defaultdict：免写 key in d 的分支
groups = defaultdict(list)
for name in ("a1", "b1", "a2"):
    groups[name[0]].append(name)
print(dict(groups))

# deque：两端 O(1) 的队列，滑动窗口的标配
dq = deque(maxlen=3)
for i in range(5):
    dq.append(i)
print(dq)

# namedtuple：带字段名的元组
Point = namedtuple("Point", "x y")
print(Point(1, 2).x)
```

```text
[('a', 5), ('b', 2)] 5 11
{'a': ['a1', 'a2'], 'b': ['b1']}
deque([2, 3, 4], maxlen=3)
1
```

## itertools

The iterator operator library — combining, grouping, flattening, slicing, all memory-friendly:

```python
from itertools import chain, groupby, islice, combinations, product, count

print(list(chain([1, 2], [3])))
print(list(islice(count(10), 3)))            # 无限计数器取前 3
print(list(combinations("abc", 2)))
print(list(product([0, 1], repeat=2)))

data = sorted("bee cat dog".split())
print([k for k, _ in groupby(data, key=lambda w: w[0])])
```

```text
[1, 2, 3]
[10, 11, 12]
[('a', 'b'), ('a', 'c'), ('b', 'c')]
[(0, 0), (0, 1), (1, 0), (1, 1)]
['b', 'c', 'd']
```

## functools

Tools for callables: memoization, partial application, total ordering, reduce:

```python
from functools import lru_cache, partial, total_ordering, reduce

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(30))

print(partial(pow, 10)(3))                   # 10 ** 3
print(reduce(lambda a, b: a + b, [1, 2, 3, 4]))
print(reduce(lambda a, b: a * b, [1, 2, 3, 4], 1))

@total_ordering
class R:
    def __init__(self, v): self.v = v
    def __eq__(self, o): return self.v == o.v
    def __lt__(self, o): return self.v < o.v
print(R(1) < R(2), R(2) == R(2))
```

```text
832040
1000
10
24
True True
```

## pathlib

An object-oriented way to handle paths, and the skeleton of any batch file job:

```python
from pathlib import Path
import tempfile

with tempfile.TemporaryDirectory() as d:
    root = Path(d)
    (root / "src").mkdir()
    for name in ("a.py", "b.py", "c.txt"):
        (root / "src" / name).write_text("# demo", encoding="utf-8")

    py_files = sorted((root / "src").glob("*.py"))
    print([p.name for p in py_files])
    print([p.stem for p in py_files])
    (root / "src" / "a.py").unlink()
    print(sorted(p.name for p in (root / "src").iterdir()))
```

```text
['a.py', 'b.py']
['a', 'b']
['b.py', 'c.txt']
```

## re

Regular expressions for pattern matching and extraction. Key points: use `r"..."` raw strings, compile for reuse, and prefer the predefined classes (`\d` `\w` `\s`):

```python
import re

text = "订单 A-1001 金额 99.5 元，订单 A-2002 金额 128 元"
ids = re.findall(r"A-\d+", text)
print(ids)

prices = re.findall(r"(\d+(?:\.\d+)?) 元", text)
print([float(p) for p in prices])

m = re.search(r"(\d{4})", text)
print(m.group(1))

pat = re.compile(r"[A-Z]-\d+")
print(len(pat.findall(text)))
```

```text
['A-1001', 'A-2002']
[99.5, 128.0]
1001
2
```

::: tip When not to reach for a regex
For structured text, prefer a dedicated parser: `json` for JSON, `csv` for CSV, `urllib.parse` for URLs, `datetime` for dates and times. Regexes suit "regular fragments", not a full grammar — for nested references and the like, a hand-written state machine or a parser library such as Lark reads more clearly than a regex.
:::

## json and datetime

```python
import json
from datetime import datetime, timedelta, timezone

payload = {"id": 1, "tags": ["a", "b"], "ok": True}
text = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True)
print(json.loads(text)["tags"])

now = datetime(2026, 10, 2, 8, 30, tzinfo=timezone.utc)
print(now.isoformat())
print((now + timedelta(days=1)).strftime("%Y-%m-%d %H:%M"))
print((now + timedelta(days=1)).date().isoformat())
```

```text
['a', 'b']
2026-10-02T08:30:00+00:00
2026-10-03 08:30
2026-10-03
```

Where `datetime` trips people up: use `now()` for the current time; comparisons are only safe with time zones (`timezone.utc` or the local `astimezone()`); 3.12+ adds full-format parsing with `datetime.fromisoformat` and the `zoneinfo` time zone library.

## Summary

- collections covers counting, grouping, queues and records; itertools covers iterator combination.
- functools' `lru_cache`/`partial` cover the two high-frequency needs, memoization and partial application.
- Paths use pathlib; regexes are compiled for reuse, and predefined classes come first.
- Use the matching parser for structured data, and leave regexes for the regular fragments.

## References

- [Python official documentation · Standard library tour](https://docs.python.org/3/tutorial/stdlib.html)
- [Python official documentation · Standard library](https://docs.python.org/3/library/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [books](/knowledge/books.md)
- [core-concepts](/knowledge/core-concepts.md)
- [official-docs](/knowledge/official-docs.md)
- [scenarios](/knowledge/scenarios.md)
