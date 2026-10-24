---
description: A comparison of f-strings and the three other formatting styles, plus encoding conversion between str and bytes.
---

# Strings and Formatting

Strings are the most common data shape. This page records f-strings, the micro-language of format specs, common methods, and encoding details.

## f-strings: the first-choice formatter

An f-string (3.6+) puts an `f` before the string and drops expressions straight into braces — the most readable option:

```python
name, pi = "Python", 3.14159
print(f"{name} 有 {len(name)} 个字符")
print(f"圆周率约为 {pi:.2f}")
print(f"{1234567:,}")          # 千分位
print(f"{0.875:.1%}")          # 百分数
```

```text
Python 有 6 个字符
圆周率约为 3.14
1,234,567
87.5%
```

The `=` specifier in 3.8+ prints "expression and value" together — a debugging staple:

```python
x, y = 10, 3
print(f"{x = }, {y = }, {x % y = }")
```

```text
x = 10, y = 3, x % y = 1
```

Alignment and padding: `>` right-aligns, `<` left-aligns, `^` centers; after the colon comes the fill character and the width:

```python
for w in ("id", "name", "score"):
    print(f"|{w:^10}|")
print(f"|{'-' * 32}|")
print(f"{42:05d}", f"{'py':*>6}")
```

```text
|    id    |
|   name   |
|  score   |
|--------------------------------|
00042 ****py
```

## The format method and % notation

Historical alternatives to f-strings still turn up all the time: `str.format` supports positional and keyword slots; the `%` notation comes from C's printf. Use f-strings in new code, but recognize both when reading old code:

```python
print("{} + {} = {}".format(1, 2, 3))
print("{name}: {score}".format(name="py", score=99))
print("%s 有 %d 岁" % ("py", 30))
```

```text
1 + 2 = 3
py: 99
py 有 30 岁
```

## Common methods

Search/replace, stripping whitespace, splitting and joining are everyday high-frequency operations. Note that `strip`/`split` default to whitespace handling, and `split()` collapses runs of whitespace:

```python
s = "  Hello, Python  "
print(s.strip().lower())
print(s.strip().split(","))
print("a,b,,c".split(","), "a b  c".split())
print("py-thon".replace("-", "_"))
print("python".startswith("py"), "python".endswith("on"))
print("python".find("th"), "python".find("go"))   # 找不到返回 -1
```

```text
hello, python
['Hello', ' Python']
['a', 'b', '', 'c'] ['a', 'b', 'c']
py_thon
True True
2 -1
```

`splitlines` handles cross-platform newlines; `partition` splits into three pieces in one call, more efficient than two `split`s:

```python
log = "2026-10-02 08:00 INFO start\r\n2026-10-02 08:01 INFO done\n"
print(log.splitlines())

head, sep, tail = "key=value".partition("=")
print(head, repr(sep), tail)
```

```text
['2026-10-02 08:00 INFO start', '2026-10-02 08:01 INFO done']
key '=' value
```

A family of testing methods: `isalpha`, `isdigit`, `isalnum`, `isupper`, `istitle` — commonly used for input validation:

```python
print("abc".isalpha(), "123".isdigit(), "Py3".isalnum())
print("HELLO".isupper(), "Hello World".istitle())
```

```text
True True True
True True
```

::: tip Joining performance
Inside a loop, `s += x` builds a new string every time (str is immutable) — O(n²). For batch joining, use `"".join(iterable)` to build it once in O(n):

```python
parts = ["a"] * 5
print("".join(parts))
print("-".join(map(str, range(5))))
```

```text
aaaaa
0-1-2-3-4
```
:::

## Raw strings and escapes

Backslash escapes: `\n` newline, `\t` tab, `\\` the backslash itself. Backslashes multiply in regexes and Windows paths — use `r"..."` raw strings to turn escaping off:

```python
print("a\tb\nc")
print(r"a\tb\nc")
print(r"C:\new\test")
```

```text
a	b
c
a\tb\nc
C:\new\test
```

For multiline text, use triple quotes; a trailing backslash at the end of a line keeps the newline out of the string:

```python
sql = """SELECT id, name
FROM users
WHERE active = 1"""
print(sql.splitlines()[0])
```

```text
SELECT id, name
```

## Encoding: str and bytes

`str` is a sequence of Unicode code points; `bytes` is a sequence of bytes. Networks and disks carry bytes, so everything crossing that boundary needs an encode/decode pass; decoding illegal bytes raises `UnicodeDecodeError`, and the `errors` parameter makes it fault-tolerant:

```python
s = "中文"
b = s.encode("utf-8")
print(b, len(s), len(b))          # bytes 字面显示为 b'\x..'，字节数 6
print(b.decode("utf-8"))

bad = b"\xff\xfe" + "ok".encode()
print(bad.decode("utf-8", errors="replace"))
```

```text
b'\xe4\xb8\xad\xe6\x96\x87' 2 6
中文
��ok
```

File and network APIs should always pass `encoding="utf-8"` explicitly — don't rely on the platform default (on Windows it's often GBK, which is the usual cause of "mojibake when reading a file"):

```python
import tempfile, pathlib

with tempfile.TemporaryDirectory() as d:
    p = pathlib.Path(d) / "a.txt"
    p.write_text("中文", encoding="utf-8")
    print(p.read_text(encoding="utf-8"))
```

```text
中文
```

## Summary

- f-strings are the first choice for formatting; be fluent with the `=` debug specifier and the `:.2f`/`,`/`%` specifiers.
- `strip`/`split`/`join`/`find` are high-frequency methods; use join for batch concatenation.
- Raw strings `r"..."` serve regexes and paths.
- Pass `encoding="utf-8"` explicitly at the str/bytes boundary.

## References

- [Python official docs · str formatting syntax](https://docs.python.org/3/library/string.html)
- [Python official docs · built-in types (str)](https://docs.python.org/3/library/stdtypes.html)
- [Python official docs · tutorial](https://docs.python.org/3/tutorial/inputoutput.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [core-concepts](/knowledge/core-concepts.md)
- [official-docs](/knowledge/official-docs.md)
- [scenarios](/knowledge/scenarios.md)
