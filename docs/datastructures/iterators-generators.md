---
description: The four comprehension forms, the iterator protocol and yield generators, and where lazy evaluation saves memory.
---

# Comprehensions, Iterators and Generators

A comprehension is one-line syntax for transforming a collection, an iterator is the protocol for 'produce on demand', and a generator writes an iterator as a function containing `yield`.

## The four comprehension forms

Lists, dicts, sets and generators each have a comprehension, all sharing one shape — 'expression + for + optional if':

```python
squares = [n * n for n in range(6)]
evens = [n for n in range(10) if n % 2 == 0]
labels = [f"{n}!" for n in range(3)]
print(squares, evens, labels)
```

```text
[0, 1, 4, 9, 16, 25] [0, 2, 4, 6, 8] ['0!', '1!', '2!']
```

Dict and set comprehensions swap the outer brackets and the target expression; nested loops expand left to right, corresponding one-to-one with the equivalent for form:

```python
lengths = {w: len(w) for w in ("py", "python")}
unique_lens = {len(w) for w in ("a", "bb", "cc")}
print(lengths, unique_lens)

pairs = [(x, y) for x in "ab" for y in (1, 2)]
print(pairs)
```

```text
{'py': 2, 'python': 6} {1, 2}
[('a', 1), ('a', 2), ('b', 1), ('b', 2)]
```

::: tip Expressions with a condition
An if after the for filters; an if/else inside the expression transforms. Don't mix the two positions:

```python
nums = range(6)
print([n for n in nums if n % 2 == 0])       # 过滤：只留偶数
print(["偶" if n % 2 == 0 else "奇" for n in nums])   # 变换：每个都要
```

```text
[0, 2, 4]
['偶', '奇', '偶', '奇', '偶', '奇']
```
:::

A comprehension is not better just because it fits on one line: past two nested loops, or when you need intermediate variables, a plain for loop reads better.

## The iterator protocol

An iterable implements `__iter__`; an iterator additionally implements `__next__`. What a `for` loop does underneath is 'get the iterator, call `next` repeatedly, until StopIteration':

```python
nums = [10, 20]
it = iter(nums)            # 从可迭代对象取迭代器
print(next(it), next(it))
try:
    next(it)
except StopIteration:
    print("StopIteration")
```

```text
10 20
StopIteration
```

An iterator is one-shot: once exhausted, iterating again yields nothing. A list can be for'd over repeatedly (each `iter()` hands out a fresh iterator), but generators, file objects, and the return values of `zip`/`map` can be consumed only once:

```python
gen = (n * n for n in range(3))     # 生成器表达式：圆括号
print(sum(gen), sum(gen))           # 第二次已经是空

nums = [1, 2, 3]
print(sum(nums), sum(nums))         # 列表可反复消费
```

```text
5 0
6 6
```

## Generator functions

Once a function body contains `yield`, it stops being an ordinary function: calling it returns a generator, and the body advances to the next `yield` on each `next` and pauses there with full state preserved. Lazy evaluation — compute an item only when it is used, and memory holds only the current one:

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

cd = countdown(3)
print(next(cd), next(cd))
print(list(cd))

def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

from itertools import islice
print(list(islice(fib(), 8)))       # 无限序列也能只取前 8 项
```

```text
3 2
[1]
[0, 1, 1, 2, 3, 5, 8, 13]
```

Generators can nest generators — `yield from` delegates to a sub-generator, and it is especially handy for flattening nested structures:

```python
def tree(leaves):
    for group in leaves:
        yield from group

print(list(tree([[1, 2], [3], [4, 5]])))
```

```text
[1, 2, 3, 4, 5]
```

## Two-way communication with generators

`yield` is an expression: `send()` pushes a value in, and `close()` raises GeneratorExit. The classic use is consumer-producer cooperation:

```python
def averager():
    total, count = 0.0, 0
    avg = None
    while True:
        value = yield avg
        total += value
        count += 1
        avg = total / count

avg = averager()
next(avg)                  # 推进到第一个 yield（预激）
print(avg.send(10), avg.send(20), avg.send(30))
avg.close()
```

```text
10.0 15.0 20.0
```

## Generator expressions vs list comprehensions

A list comprehension evaluates immediately; a generator is lazy. Use a generator to save memory on large data you walk once; use a list when you need to reuse the result, slice it, or call `len`:

```python
big = range(1_000_000)
lst = [n * 2 for n in big]        # 立即建满整个列表
gen = (n * 2 for n in big)        # 0 个元素先算好
import sys
print(sys.getsizeof(lst) > sys.getsizeof(gen))
print(sum(gen))
```

```text
True
999999000000
```

## Standard library iterator tools

`itertools` is the iterator operator library: `chain` concatenates, `product` is the Cartesian product, `combinations` gives combinations, and `groupby` groups (you must sort by the same key first). `zip`/`enumerate`/`reversed` belong to the iterator family too:

```python
from itertools import chain, product, combinations, groupby

print(list(chain([1], [2, 3])))
print(list(product("ab", (1, 2))))
print(list(combinations("abc", 2)))

data = sorted(["apple", "avocado", "banana"], key=lambda w: w[0])
for letter, group in groupby(data, key=lambda w: w[0]):
    print(letter, list(group))
```

```text
[1, 2, 3]
[('a', 1), ('a', 2), ('b', 1), ('b', 2)]
[('a', 'b'), ('a', 'c'), ('b', 'c')]
a ['apple', 'avocado']
b ['banana']
```

## Summary

- Comprehension = expression + for + filtering if; fall back to a plain loop for complex logic.
- Iterators are consumed once; lists can be iterated over repeatedly.
- A generator function yields lazily via `yield` and can express infinite sequences; `yield from` delegates.
- Large data you walk once goes in a generator expression; repeatedly accessed data goes in a list.
- `itertools` plus the built-in `zip`/`enumerate` cover most iteration needs.

## References

- [Python official docs · Tutorial](https://docs.python.org/3/tutorial/controlflow.html)
- [Python official docs · Language reference](https://docs.python.org/3/reference/expressions.html)
- [PEP 255 · Generators](https://peps.python.org/pep-0255/)
- [PEP 380 · yield from](https://peps.python.org/pep-0380/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/zh/glossary.md)
- [books](/zh/knowledge/books.md)
- [core-concepts](/zh/knowledge/core-concepts.md)
- [scenarios](/zh/knowledge/scenarios.md)
