---
description: if branches, for/while loops and loop else, match pattern matching, and a first look at comprehensions.
---

# Control flow

Python's control-flow three-piece set: `if` branches, `for` loops, `while` loops, plus the three steering statements `break`, `continue`, `else`, and 3.10+'s `match` structural pattern matching.

## if branches

`if`/`elif`/`else` match in order; the condition is any expression (truth-tested), and no parentheses are needed:

```python
score = 86
if score >= 90:
    level = "优秀"
elif score >= 60:
    level = "及格"
else:
    level = "不及格"
print(level)
```

```text
及格
```

The conditional expression (ternary) squeezes an if onto one line; both sides can be expressions:

```python
age = 20
status = "成年" if age >= 18 else "未成年"
print(status)
print("及格" if 75 >= 60 else "不及格")
```

```text
成年
及格
```

## for loops

`for` walks an iterable, not a C-style counter. For number intervals use `range()`, which generates the sequence lazily (a Python 3 `range` holds no memory):

```python
for i in range(3):
    print(i, end=" ")
print()

for i in range(1, 6, 2):     # start, stop, step
    print(i, end=" ")
print()

words = ["py", "thon"]
for idx, w in enumerate(words):
    print(idx, w)
```

```text
0 1 2 
1 3 5 
0 py
1 thon
```

Iterating a dict walks the keys by default; `items()` gives key-value pairs (insertion order since 3.7):

```python
scores = {"math": 90, "english": 85}
for k in scores:
    print(k)
for k, v in scores.items():
    print(k, v)
```

```text
math
english
math 90
english 85
```

Need indices without counting by hand? Use `enumerate`. Need to walk two sequences at once? Use `zip`:

```python
names = ["alice", "bob"]
grades = [90, 85]
for n, g in zip(names, grades):
    print(n, g)

keys = ["a", "b"]
pairs = list(zip(keys, [1, 2]))
print(pairs)
```

```text
alice 90
bob 85
[('a', 1), ('b', 2)]
```

## while and loop else

`while` repeats as long as the condition is true. A loop that ends normally (not interrupted by `break`) runs its `else` — the most natural fit for 'find primes, find factors' style code, and it removes a boolean flag:

```python
def largest_factor(n):
    for i in range(n // 2, 1, -1):
        if n % i == 0:
            return i
    else:
        return 1          # for 走完没 return，说明 n 是质数

print(largest_factor(28), largest_factor(13))
```

```text
14 1
```

`break` exits the whole loop; `continue` skips the current iteration and goes to the next one:

```python
for i in range(5):
    if i == 3:
        break
    if i == 1:
        continue
    print(i, end=" ")
print()
```

```text
0 2 
```

## match pattern matching

Python 3.10 added `match`/`case` for structural destructuring (like Rust/Swift), much cleaner than a long chain of `if`/`elif`. `case _` is the wildcard (it must come last, or later branches become unreachable):

```python
cmd = ("GET", "/api/users")
match cmd:
    case ("GET", path):
        print("GET", path)
    case ("POST", path):
        print("POST", path)
    case _:
        print("unknown")
```

```text
GET /api/users
```

List patterns destructure fixed-length sequences; a starred `*rest` collects the remaining elements, and you can alias sub-patterns:

```python
match [1, 2, 3]:
    case [first, *rest]:
        print(first, rest)
    case []:
        print("empty")

match {"type": "circle", "r": 2}:
    case {"type": "circle", "r": r}:
        print("circle radius", r)
    case _:
        print("other")
```

```text
1 [2, 3]
circle radius 2
```

::: tip Guards and bindings
In `case [x, y] if x < y:`, the `if` is a guard condition; lowercase identifiers are capture bindings, while literals (numbers, strings) and uppercase constants are compared for equality.
:::

## Comprehensions, a first look

'Transform each element, then collect' has a one-line answer — comprehensions get their full treatment in the data structures chapter; here just meet the shape:

```python
squares = [n * n for n in range(5)]
evens = [n for n in range(10) if n % 2 == 0]
print(squares, evens)
```

```text
[0, 1, 4, 9, 16] [0, 2, 4, 6, 8]
```

## Summary

- `for` walks iterables; use `range` for counting, `enumerate` for indices, `zip` side by side.
- A loop `else` runs only when there was no `break`, replacing a boolean flag.
- `match` (3.10+) does structural pattern matching, with `case _` as the catch-all.
- Use a comprehension for a one-line transform, readability first.

## Further reading

- [Python official docs · Tutorial](https://docs.python.org/3/tutorial/controlflow.html)
- [Python official docs · Language reference](https://docs.python.org/3/reference/compound_stmts.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/zh/glossary.md)
- [books](/zh/knowledge/books.md)
- [core-concepts](/zh/knowledge/core-concepts.md)
- [official-docs](/zh/knowledge/official-docs.md)
