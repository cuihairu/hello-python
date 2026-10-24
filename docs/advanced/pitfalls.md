---
description: "The mechanics and fixes behind eight high-frequency traps: mutable defaults, late-binding closures, shallow vs deep copy, and more."
---

# Common pitfalls and best practices

This page digs into why these traps happen, how to reproduce them, and how to deal with them, from a semantics and engineering-practice angle. For a quick-reference digest see [common pitfalls in the knowledge index](/knowledge/pitfalls).

Every Python engineer has hit each of these at least once. They are collected here so you can learn the underlying mechanism in one pass and save yourself the 3 a.m. debugging session later.

## Mutable default arguments

Defaults are evaluated once at definition time and bound onto the function object, so all calls share them. The symptom is "data from the last call leaked into this one":

```python
def append_to(item, target=[]):
    target.append(item)
    return target

print(append_to(1))
print(append_to(2))          # 不是 [2]！
print(append_to.__defaults__)
```

```text
[1]
[1, 2]
([1, 2],)
```

The fix is a `None` sentinel plus creating the list inside the function body; or pass the list explicitly, using something other than `functools.partial`.

## Late binding in closures

A closure captures the variable itself, not the value it had at capture time. Functions created in a loop all share the loop variable, so by the time the loop ends they all see the last value:

```python
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])

fixed = [lambda i=i: i for i in range(3)]   # 默认参数在定义时求值
print([f() for f in fixed])
```

```text
[2, 2, 2]
[0, 1, 2]
```

## Shallow copy vs deep copy

`list.copy()`, slicing and `dict()` all copy only one level. The inner structure of a nested object is still a shared reference, so mutating the "copy" leaks into the original:

```python
import copy

src = {"tags": ["a"], "n": 1}
shallow = src.copy()
shallow["n"] = 99                 # 顶层独立
shallow["tags"].append("b")       # 内层共享 → 串了
print(src)

deep = copy.deepcopy(src)
deep["tags"].append("c")
print(src["tags"], deep["tags"])
```

```text
{'tags': ['a', 'b'], 'n': 1}
['a', 'b'] ['a', 'b', 'c']
```

## Reference cycles and __del__

Objects that reference each other are collected by the GC's cycle detection, but an object that defines `__del__` inside a cycle cannot simply be reclaimed (3.4+ eased this through PEP 442, and `__del__` still gives you no guarantee about when it is called). Do not rely on `__del__` to release resources - use with/finally:

```python
class Conn:
    def __init__(self):
        self.closed = False
    def close(self):
        self.closed = True
    def __del__(self):
        pass                      # 别在这里关资源

def use():
    conn = Conn()
    try:
        return "结果"
    finally:
        conn.close()              # 保证关闭

print(use())
```

```text
结果
```

## Misusing is and ==

`==` compares values, `is` compares identity. Use `is` for `None`, True and False (singletons); use `==` for numbers, strings and lists. Small-integer caching and literal constant folding make `is` "sometimes work", which is the most confusing part:

```python
a = [1, 2]
b = [1, 2]
print(a == b, a is b)

x = None
print(x is None)

n = 257
m = 257
print(n == m, n is m)        # 脚本内常量折叠让 is 也为真；交互式逐行输入则相反
```

```text
True False
True
True True
```

Note: inside a single code object `257 is 257` is true (constant folding), but typing it line by line in the interactive interpreter gives false - which is exactly why it cannot stand in for an equality test.

## Mutating a container while iterating

Adding or removing elements during iteration desynchronizes the iterator. The classic symptom is "one out of every two is skipped":

```python
nums = [1, 2, 3, 4, 5, 6]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)            # 反例：边遍历边删
print(nums)                       # 4、6 被漏掉了
```

```text
[1, 3, 5]
```

The safe approaches: build a new list with a comprehension, or iterate over a copy and delete from the original:

```python
nums = [1, 2, 3, 4, 5, 6]
nums = [n for n in nums if n % 2 != 0]
print(nums)

nums2 = [1, 2, 3, 4, 5, 6]
for n in nums2[:]:                # 遍历副本
    if n % 2 == 0:
        nums2.remove(n)
print(nums2)
```

```text
[1, 3, 5]
[1, 3, 5]
```

## Silent failure from swallowed exceptions

`except: pass` makes errors disappear without a trace. At minimum log them, or convert into a clearer exception and re-raise:

```python
import logging, sys
logging.basicConfig(level=logging.ERROR, stream=sys.stdout,
                    format="%(levelname)s %(message)s")

def load(text):
    try:
        return int(text)
    except ValueError:
        logging.error("非法整数: %r", text)
        return 0

print(load("x"), load("42"))
```

```text
ERROR 非法整数: 'x'
0 42
```

## String comparison and encoding

When exchanging data across systems, normalize with casefold (better for internationalization than lower) and NFC before comparing, and write files in explicit UTF-8:

```python
print("Straße".casefold() == "strasse")
import unicodedata
s1 = "cafe\u0301"              # e + 组合尖音符（两个码点）
s2 = "caf\u00e9"                 # 预组合 é（一个码点）
print(s1 == s2, unicodedata.normalize("NFC", s1) == unicodedata.normalize("NFC", s2))
```

```text
True
False True
```

## Dependency and version-management slip-ups

- Do not commit `.venv/` into the repository; commit the lock file (requirements.txt or a lock file) so builds stay reproducible.
- Do not treat floats as money: use `decimal.Decimal` for amounts and compare with a tolerance.
- Global mutable state (module-level dict/list) cross-contaminates tests - inject what you need instead of reaching for a global out of convenience.

## Summary

- Mutable defaults, late-binding closures, shallow vs deep copy: the common cause is "what is shared is a reference".
- Do not mutate a container while iterating; never let exceptions vanish silently.
- Use `is` only for the None/True/False singletons.
- Release resources with with/finally, not a gamble on `__del__`.

## Further reading

- [Python official documentation · Execution model](https://docs.python.org/3/reference/executionmodel.html)
- [Python official documentation · Glossary](https://docs.python.org/3/glossary.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [official-docs](/knowledge/official-docs.md)
- [pitfalls](/knowledge/pitfalls.md)
