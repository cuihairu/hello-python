---
description: Dictionary key-value operations and comprehensions, the root of the hashability constraint, set operations.
---

# Dictionaries and Sets

This page covers language-level usage; for the compact hash-table structure of dicts in CPython, see [Object and Container Implementation Notes](/internals/object-model).

A dictionary (dict) maps keys to values; a set is a container of unique elements. Both are built on hash tables — lookups, inserts, and deletes all average O(1), and keys/elements must be hashable.

## Dictionaries: Add, Remove, Update, Query

```python
user = {"name": "Alice", "age": 30}
user["city"] = "Beijing"          # 新增 / 覆盖
print(user["name"], user.get("email"))
print(user.get("email", "未填写"))   # get 带默认值，键不存在不报错

del user["city"]
print(len(user), "name" in user)
```

```text
Alice None
未填写
2 True
```

Two safe ways to access a missing key: `get` returns a default; `setdefault` writes one in if the key is absent. Use `update` for batch updates:

```python
cfg = {"theme": "dark"}
print(cfg.setdefault("lang", "zh"), cfg)
print(cfg.setdefault("theme", "light"), cfg)   # 已存在则原值返回，不覆盖

cfg.update(theme="light", font=14)
print(cfg)
```

```text
zh {'theme': 'dark', 'lang': 'zh'}
dark {'theme': 'dark', 'lang': 'zh'}
{'theme': 'light', 'lang': 'zh', 'font': 14}
```

Iteration defaults to keys; `values()` gives values, `items()` gives key-value pairs. Dicts preserve insertion order since 3.7:

```python
scores = {"math": 90, "english": 85, "code": 99}
for k, v in scores.items():
    print(k, v, end="; ")
print()
print(sorted(scores, key=scores.get, reverse=True))   # 按值排序取键
```

```text
math 90; english 85; code 99; 
['code', 'math', 'english']
```

## Dictionary Comprehensions and Merging

```python
squares = {n: n * n for n in range(4)}
print(squares)
inv = {v: k for k, v in squares.items()}    # 反转键值（值须可哈希）
print(inv)

d1, d2 = {"a": 1, "b": 2}, {"b": 20, "c": 30}
merged = d1 | d2                            # 3.9+ 合并运算符，右侧优先
print(merged)
```

```text
{0: 0, 1: 1, 2: 4, 3: 9}
{0: 0, 1: 1, 4: 2, 9: 3}
{'a': 1, 'b': 20, 'c': 30}
```

::: tip defaultdict and Counter
`collections.defaultdict` fabricates a default value for missing keys, so you skip the `if key in d`; `Counter` tallies counts in one line:

```python
from collections import defaultdict, Counter

groups = defaultdict(list)
for name, dept in [("alice", "dev"), ("bob", "ops"), ("carol", "dev")]:
    groups[dept].append(name)
print(dict(groups))

words = "the quick the lazy the dog".split()
print(Counter(words).most_common(2))
```

```text
{'dev': ['alice', 'carol'], 'ops': ['bob']}
[('the', 3), ('quick', 1)]
```
:::

## Sets

A set literal uses braces (an empty set must be `set()`; `{}` is an empty dict). Its core abilities are deduplication and membership testing, with support for mathematical set operations:

```python
a = {1, 2, 3, 4}
b = {3, 4, 5}
print(a | b, a & b, a - b, a ^ b)   # 并 交 差 对称差
print(3 in a, len({1, 1, 2}))       # 成员判断与去重

nums = [1, 2, 2, 3, 3, 3]
print(list(set(nums)))              # 经典去重（顺序不保证）
```

```text
{1, 2, 3, 4, 5} {3, 4} {1, 2} {1, 2, 5}
True 2
[1, 2, 3]
```

Sets shuffle order (the hash decides); when you need deduplication with order preserved, use `dict.fromkeys` — dictionary keys are ordered in 3.7+:

```python
nums = [3, 1, 3, 2, 1]
print(list(dict.fromkeys(nums)))
```

```text
[3, 1, 2]
```

Mutable sets use `add`/`remove` (`remove` raises KeyError if the element is absent) or `discard` (silent when absent). `frozenset` is an immutable set, usable as a dictionary key or inside another set:

```python
s = {1, 2}
s.add(3)
s.discard(99)
print(s)

fs = frozenset([1, 2])
print({fs: "hashable"})
```

```text
{1, 2, 3}
{frozenset({1, 2}): 'hashable'}
```

## Hashing and Hashability

Keys must be hashable objects (they implement `__hash__` and their hash value stays constant over their lifetime): numbers, strings, bytes, and tuples whose contents are all hashable qualify; lists, dicts, sets, and tuples containing a list/dict/set don't. This is the root of "why lists can't be dictionary keys":

```python
try:
    d = {["x"]: 1}
except TypeError as e:
    print("TypeError:", type(e).__name__)   # 异常消息随版本措辞有别，只取类型名
print({("x",): 1, "y": 2})
```

```text
TypeError: TypeError
{('x',): 1, 'y': 2}
```

## Key Type Practices

Dictionary keys are usually enums, tuples, or strings. Tuple keys naturally express multidimensional coordinates and stay flatter than nested dicts:

```python
board = {(0, 0): "x", (1, 2): "o"}
print(board[(1, 2)], board.get((0, 1), "-"))
print(list(board.items()))
```

```text
o -
[((0, 0), 'x'), ((1, 2), 'o')]
```

## Summary

- dict/set lookups, updates, and deletes are amortized O(1); keys/elements must be hashable.
- Use `get`/`setdefault` for access, `defaultdict` for missing-key tallying, and `Counter` for counting.
- Dicts preserve insertion order in 3.7+; use `dict.fromkeys` for order-preserving deduplication.
- Merge with `|` (3.9+); reverse or transform with dictionary comprehensions.

## References

- [Python official docs · tutorial](https://docs.python.org/3/tutorial/datastructures.html)
- [Python official docs · collections](https://docs.python.org/3/library/collections.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [core-concepts](/knowledge/core-concepts.md)
- [official-docs](/knowledge/official-docs.md)
- [pitfalls](/knowledge/pitfalls.md)
- [scenarios](/knowledge/scenarios.md)
