---
description: Adding, removing, updating, and querying lists, plus slicing; the immutability semantics of tuples and unpacking usage.
---

# Lists and Tuples

Lists and tuples are both ordered sequences; the only difference is that lists are mutable and tuples aren't. That decides their use cases — dynamic collections of similar elements use a list, fixed-structure records use a tuple.

This page covers language-level usage; for the pointer-array layout of lists in CPython, see [Object and Container Implementation Notes](/internals/object-model).

## Lists: Add, Remove, Update, Query

```python
nums = [3, 1, 2]
nums.append(4)             # 尾部追加
nums.insert(0, 0)          # 指定位置插入（O(n)，慎用）
nums.extend([5, 6])        # 合并另一序列
print(nums)

print(nums.pop(), nums.pop(0))   # 弹出尾部 / 指定位置
nums.remove(3)             # 按值删第一个匹配
print(nums, nums.index(2), nums.count(2))
```

```text
[0, 3, 1, 2, 4, 5, 6]
6 0
[1, 2, 4, 5] 1 1
```

Sorting: `list.sort()` sorts in place and returns None; `sorted()` returns a new list. Both support `key` and `reverse`:

```python
words = ["banana", "fig", "apple"]
print(sorted(words))
print(sorted(words, key=len, reverse=True))

nums = [3, 1, 2]
print(nums.sort(), nums)   # sort 返回 None，原地生效
```

```text
['apple', 'banana', 'fig']
['banana', 'apple', 'fig']
None [1, 2, 3]
```

## Slicing

Slices `seq[start:stop:step]` are left-closed, right-open, and produce a new object. Omitting a bound means "to the end," and negatives count from the tail. This is the common syntax for Python sequences — strings and tuples use it too:

```python
nums = [0, 1, 2, 3, 4, 5]
print(nums[1:4], nums[:3], nums[3:])
print(nums[-2:], nums[::2], nums[::-1])

copy = nums[:]             # 浅拷贝
copy[0] = 99
print(nums[0], copy[0])
```

```text
[1, 2, 3] [0, 1, 2] [3, 4, 5]
[4, 5] [0, 2, 4] [5, 4, 3, 2, 1, 0]
0 99
```

Slices can also be assigned to in place, replacing, inserting, or deleting a run:

```python
nums = [0, 1, 2, 3, 4]
nums[1:3] = [10, 20, 30]   # 2 个换 3 个，长度可变
print(nums)
del nums[1:4]
print(nums)
```

```text
[0, 10, 20, 30, 3, 4]
[0, 3, 4]
```

## Lists Are References

Assignment copies only the reference, so two names point at the same list — "change one, and the other changes too." For an independent copy, use a slice `[:]`, `list()`, or the `copy` module; nested structures need `copy.deepcopy`:

```python
import copy

a = [[1, 2], [3, 4]]
shallow = a.copy()         # 浅拷贝：外层新列表，内层仍是同一批子列表
shallow[0].append(99)
print(a[0])                # 内层被共享，a 也变了

deep = copy.deepcopy(a)
deep[1].append(88)
print(a[1], deep[1])       # 深拷贝彻底独立
```

```text
[1, 2, 99]
[3, 4] [3, 4, 88]
```

::: warning The `[[]] * n` trap
`[[]] * 3` copies the reference to the same inner list three times, so appending one changes all of them. Build multidimensional lists with a comprehension:

```python
grid = [[0] * 3] * 2       # 反例：两行是同一个列表
grid[0][0] = 9
print(grid)

grid2 = [[0] * 3 for _ in range(2)]   # 每行独立
grid2[0][0] = 9
print(grid2)
```

```text
[[9, 0, 0], [9, 0, 0]]
[[9, 0, 0], [0, 0, 0]]
```
:::

## Tuples

Tuples are immutable, which makes them suited to "fixed-structure records": coordinates, database rows, multiple return values. The key in the syntax is the comma — a single-element tuple must be written `(1,)`:

```python
point = 3, 4               # 括号可省
single = (1,)
not_tuple = (1)            # 这只是整数 1
print(point, single, not_tuple)

x, y = point               # 解包
print(x + y)
```

```text
(3, 4) (1,) 1
7
```

A function "returning multiple values" actually returns a tuple, which the caller unpacks; extended unpacking `*rest` collects the remainder:

```python
def minmax(nums):
    return min(nums), max(nums)

lo, hi = minmax([3, 1, 4, 1, 5])
print(lo, hi)

first, *rest = [1, 2, 3, 4]
print(first, rest)
```

```text
1 5
1 [2, 3, 4]
```

Tuples are immutable, but their "contents" may still be mutable: the list inside `t = ([1], 2)` can still be changed in place. A tuple can serve as a dictionary key only if all of its contents are hashable:

```python
t = ([1, 2], 3)
t[0].append(99)
print(t)

try:
    {[1]: "a"}
except TypeError as e:
    print("TypeError:", type(e).__name__)   # 异常消息随版本措辞有别，只取类型名
print({(1, 2): "ok"})
```

```text
([1, 2, 99], 3)
TypeError: TypeError
{(1, 2): 'ok'}
```

## Named Tuples

When records should carry field names, use `collections.namedtuple` or `typing.NamedTuple` (3.6+) — far more readable than bare indices:

```python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x + p.y, p._asdict())

from typing import NamedTuple

class Vec(NamedTuple):
    dx: float
    dy: float

print(Vec(1.5, 2.5).dx)
```

```text
7 {'x': 3, 'y': 4}
1.5
```

## When to Use Tuples

| Scenario | Choice | Reason |
| --- | --- | --- |
| Element collection that gets added, removed, or modified | list | Mutable, full method set |
| Multiple return values, fixed-structure records | tuple | Immutable, structure is semantics |
| Dictionary keys, set elements | tuple | Hashable |
| Lots of read-only iteration | tuple | More memory-efficient, and prevents accidental mutation |

## Summary

- Lists are mutable, tuples aren't; slices are left-closed, right-open, and produce a new object.
- Assignment shares a reference; use deepcopy for an independent nested structure.
- `[[]] * n` is a reference-copying trap; use a comprehension for multidimensional lists.
- Use tuple/NamedTuple for fixed-structure records, list for dynamic collections.

## References

- [Python official docs · tutorial](https://docs.python.org/3/tutorial/datastructures.html)
- [Python official docs · built-in types](https://docs.python.org/3/library/stdtypes.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [core-concepts](/knowledge/core-concepts.md)
- [pitfalls](/knowledge/pitfalls.md)
- [scenarios](/knowledge/scenarios.md)
