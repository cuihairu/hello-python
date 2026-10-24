---
description: Behaviour details for int/float/str/bool/None, dynamic typing, and the boundary between is and ==.
---

# Variables and data types

Python is dynamically strongly typed: variables need no type declaration, and every object carries its own type at run time; but types are never converted implicitly — `"1" + 1` simply raises.

## Built-in types at a glance

| Type | Example | Mutability | Notes |
| --- | --- | --- | --- |
| `int` | `42` | immutable | Arbitrary-precision integers; `10**100` doesn't overflow |
| `float` | `3.14` | immutable | IEEE 754 double precision, `1e3` notation |
| `bool` | `True` | immutable | Subclass of `int`; `True + 1 == 2` |
| `str` | `"hi"` | immutable | Unicode string, supports slicing |
| `list` | `[1, 2]` | mutable | Ordered, may repeat, supports append and delete |
| `tuple` | `(1, 2)` | immutable | Ordered, usable as a dict key |
| `dict` | `{"a": 1}` | mutable | Key-value mapping, insertion-ordered since 3.7+ |
| `set` | `{1, 2}` | mutable | Unordered set, no duplicates |
| `NoneType` | `None` | immutable | The empty-value singleton |

Use `type()` to look up a type and `isinstance()` to test one — the latter respects inheritance (`isinstance(True, int)` is true), so use it whenever an API needs a type check:

```python
values = [42, 3.14, True, "hi", None]
for v in values:
    print(type(v).__name__, isinstance(v, (int, float)))
```

```text
int True
float True
bool True
str False
NoneType False
```

## Numeric types

`int` has no bit-width limit and `float` is double precision; use `decimal` when you need exact decimals and `fractions.Fraction` for ratios. Division always returns `float`; floor division is `//`, remainder is `%`:

```python
print(7 / 2, 7 // 2, 7 % 2)
print(2 ** 10)                     # 幂运算
print(len(str(10 ** 100)))         # 101 位数，int 无位宽限制
print(int("ff", 16), float("1e-3"))

from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))   # 二进制浮点的误差被消除
```

```text
3.5 3 1
1024
101
255 0.001
0.3
```

Note that `0.1 + 0.2 == 0.3` is false — IEEE 754 cannot represent 0.1, which is a shared affliction of every double-precision language, so compare floats with a tolerance:

```python
print(0.1 + 0.2)
print(abs(0.1 + 0.2 - 0.3) < 1e-9)
```

```text
0.30000000000000004
True
```

## Strings

Strings are immutable, so any "modification" produces a new object. Concatenation: `+` suits short strings, `"".join()` suits long ones (O(n) rather than repeated copying). `str.encode()` yields bytes and `bytes.decode()` brings them back:

```python
parts = ["he", "llo"]
print("".join(parts), "!" .join(parts))
print(len("你好"))                     # Unicode 码点数
print("中".encode("utf-8"))            # UTF-8 字节
print(b"\xe4\xb8\xad".decode("utf-8"))
```

```text
hello he!llo
2
b'\xe4\xb8\xad'
中
```

## Type conversion

Explicit conversion uses the constructor: `int("12")`, `str(12)`, `float("1.5")`, `list("abc")`. A failed conversion raises `ValueError`, so validate before converting:

```python
def to_int(s):
    try:
        return int(s)
    except ValueError:
        return None

print(to_int("12"), to_int("12a"))
print(bool(""), bool("0"), bool([]))    # 只有空对象与 None 为假
```

```text
12 None
False True False
```

::: warning Why `"0"` is true
The intuition that "0 is false" only holds for numbers and empty sequences. The string `"0"` is not empty, so `bool("0")` is `True`. To test whether input is 0, convert the type first, then compare.
:::

## Mutable and immutable

This is the key to understanding Python's semantics. `int`, `str` and `tuple` are immutable: any "change" returns a new object. `list`, `dict` and `set` are mutable: modified in place, with every reference changing together:

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a is b, a)          # a、b 指向同一个列表

s1 = "ab"
s2 = s1.upper()
print(s1, s2)             # s1 不变，产生新串 s2
```

```text
True [1, 2, 3, 4]
ab AB
```

`is` compares object identity (memory address), `==` compares value. Test for the empty value with `is None`, compare numbers with `==`. CPython caches small integers in `-5..256` and folds duplicate constants inside the same code object, which makes `is` "accidentally" true for some integers — the result varies with the interpreter implementation and the run-time scenario, so never use `is` as `==`:

```python
x, y = 1000, 1000
print(x == y, x is y)        # 值相等；is 结果是常量折叠的实现细节，别依赖
n1, n2 = 256, 256
print(n1 is n2)              # 小整数缓存区间内为 True（同样只是实现细节）
print(x == y)                # 判断相等永远写 ==
```

```text
True True
True
True
```

## Summary

- Dynamically strongly typed: no type declaration, but no implicit conversion either.
- Immutable objects (int/str/tuple) build a new one on change; mutable objects (list/dict/set) change in place, and all references change with them.
- `is` compares identity, `==` compares value; test `None` with `is`.
- Compare floats with a tolerance; switch to `Decimal` for exact arithmetic.

## Further reading

- [Python official documentation · Built-in types](https://docs.python.org/3/library/stdtypes.html)
- [Python official documentation · Tutorial](https://docs.python.org/3/tutorial/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/zh/knowledge/books)
- [core-concepts](/zh/knowledge/core-concepts)
- [pitfalls](/zh/knowledge/pitfalls)
