---
description: Function definition, parameter shapes and scoping rules, including the mutable default argument trap and the None sentinel idiom.
---

# Functions

Functions are the basic unit for organising code. Python functions are first-class citizens: they can be assigned to variables, passed as arguments, and returned as values. This page records how function definition, parameter shapes, scoping rules and lambda behave in Python.

## Definition and calling

`def` defines a function, `return` returns a value (omit it, or write it bare, to return `None`). The docstring goes on the first line of the function body:

```python
def greet(name, greeting="你好"):
    """向某人问好，返回问候语字符串。"""
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", "Hi"))
print(greet(name="Carol"))
```

```text
你好, Alice!
Hi, Bob!
你好, Carol!
```

## The five forms of parameters

In definition order: positional parameters, default parameters, variadic positional `*args`, keyword-only parameters, variadic keyword `**kwargs`:

```python
def demo(a, b=2, *args, key=None, **kwargs):
    print(a, b, args, key, kwargs)

demo(1)
demo(1, 2, 3, 4, key="k", extra="x")
```

```text
1 2 () None {}
1 2 (3, 4) k {'extra': 'x'}
```

The call site can unpack too: `*` spreads a sequence into positional arguments, `**` spreads a dict into keyword arguments:

```python
def add3(x, y, z):
    return x + y + z

nums = [1, 2, 3]
kw = {"z": 30, "y": 20}
print(add3(*nums))
print(add3(10, **kw))
```

```text
6
60
```

::: warning The mutable default argument trap
Default values are evaluated once, when the function is defined, and every call shares that same object. A mutable default (list/dict/set) accumulates across calls — this is Python's most famous pitfall, so use a `None` sentinel for defaults instead:

```python
def bad(item, basket=[]):        # 反例：所有调用共享同一个列表
    basket.append(item)
    return basket

def good(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket

print(bad(1), bad(2))            # [1, 2] 而不是期望的 [1] [2]
print(good(1), good(2))          # 每次都是新列表
```

```text
[1, 2] [1, 2]
[1] [2]
```
:::

## Positional-only and keyword-only parameters

Parameters before `/` can only be passed positionally; parameters after `*` can only be passed by keyword. The standard library uses this mechanism heavily, to keep parameter names from becoming part of the caller-facing API:

```python
def clip(text, *, max_len=10):        # max_len 只能按关键字传
    return text[:max_len]

print(clip("hello world", max_len=5))
try:
    clip("hello world", 5)
except TypeError as e:
    print("TypeError:", e)
```

```text
hello
TypeError: clip() takes 1 positional argument but 2 were given
```

## Scope and closures

Name resolution follows LEGB: Local → Enclosing → Global → Builtin. An inner function that reads an outer variable forms a closure; to **rebind** an outer variable you need `nonlocal` (function level) or `global` (module level):

```python
def counter():
    count = 0
    def inc():
        nonlocal count        # 没有它，count 只是 inc 的局部新名字
        count += 1
        return count
    return inc

c = counter()
print(c(), c(), c())
```

```text
1 2 3
```

A closure captures the variable itself, not the value it held at that moment — the loop variable trap is the famous manifestation, and the fix is to snapshot via a default parameter at definition time:

```python
funcs = [lambda: i for i in range(3)]          # 三个 lambda 共享同一个 i
fixed = [lambda i=i: i for i in range(3)]      # 默认参数在定义时求值
print([f() for f in funcs])
print([f() for f in fixed])
```

```text
[2, 2, 2]
[0, 1, 2]
```

## lambda and higher-order functions

lambda is a single-expression anonymous function, equivalent to "return expression". The `key` argument of sort, and `map`/`filter`, are its most common uses; write a named function once the logic gets complex:

```python
pairs = [("b", 2), ("a", 3), ("c", 1)]
print(sorted(pairs, key=lambda p: p[1]))

print(list(map(lambda x: x * 2, [1, 2, 3])))
print(list(filter(lambda x: x > 1, [0, 1, 2, 3])))
```

```text
[('c', 1), ('b', 2), ('a', 3)]
[2, 4, 6]
[2, 3]
```

A function returned from a function composes into a "power factory":

```python
def power(n):
    def apply(x):
        return x ** n
    return apply

square, cube = power(2), power(3)
print(square(5), cube(5))
```

```text
25 125
```

## Summary

- Parameter order: positional → default → `*args` → keyword-only → `**kwargs`; `/` locks positional-only.
- Mutable defaults are a sharing trap; use a `None` sentinel.
- Closures capture the variable itself; rebinding an outer needs `nonlocal`; snapshot loop lambdas with a default parameter.
- lambda takes a single expression; use a named function for complex logic.

## Further reading

- [Python official documentation · Function definition](https://docs.python.org/3/reference/compound_stmts.html)
- [Python official documentation · Built-in functions](https://docs.python.org/3/library/functions.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/zh/knowledge/books)
- [core-concepts](/zh/knowledge/core-concepts)
- [pitfalls](/zh/knowledge/pitfalls)
