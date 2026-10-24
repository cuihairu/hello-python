---
description: The basic rules of the Python source-file layer — indentation as syntax, comments and docstrings, variable naming.
---

# Syntax basics

Python's syntactic philosophy is "readability first": indentation expresses block structure, statements carry no trailing semicolons, and a lot of meaning is carried by idiomatic naming. This page notes the syntax and conventions I meet day to day.

## Indentation is syntax

Python uses no braces to delimit blocks; indentation *is* the syntax. Statements inside one block must be left-aligned. The official style is 4 spaces, and mixing tabs with spaces is forbidden:

```python
score = 86
if score >= 60:
    print("及格")
    print("分数:", score)
else:
    print("不及格")
```

Indentation mistakes are syntax errors: where you should indent but don't raises `IndentationError`; indenting one extra level reports `unexpected indent`.

## Comments and docstrings

`#` to the end of the line is a comment. A triple-quoted string on the first line of a module, function or class is a docstring, reachable at run time through `__doc__` and the content source of `help()`:

```python
def area(r):
    """计算圆面积。

    参数 r 为半径，返回 3.14 近似值。
    """
    return 3.14 * r ** 2

print(area(2))
print(area.__doc__.splitlines()[0])
```

```text
12.56
计算圆面积。
```

## Variables and assignment

Python variables are "a name stuck onto an object"; assignment is binding, and no type declaration is needed. One line can assign several variables, and it also supports swap-by-interchange:

```python
x, y = 10, 20
x, y = y, x            # 交换
print(x, y)

a = b = c = 0          # 链式赋值，三个名字指向同一个 0
print(a, b, c)

n, rest = 1, [2, 3]    # 解包赋值
print(n, rest)
```

```text
20 10
0 0 0
1 [2, 3]
```

The walrus operator `:=` (Python 3.8+) allows assignment inside an expression; the typical case is "compute first, then test":

```python
data = [3, -1, 0, 7]
total = 0
for v in data:
    if (abs_v := abs(v)) > 2:
        total += abs_v
print(total)
```

```text
10
```

## Basic statements

There are only a few statements that express a concrete action. `print` outputs, `input` reads (returning a string), `del` removes a name, and `pass` is a placeholder that does nothing:

```python
name = "Python"
print(f"Hello, {name}!")

age = input("你的年龄是 18：") if False else "18"   # 脚本里通常不读 stdin，这里直接给值
print(int(age) + 1)

unused = 3
del unused        # 删除名字绑定
```

```text
Hello, Python!
19
```

## Lines and encoding

Physical lines versus logical lines: one logical line can hold one statement, and semicolons can cram several onto a single line, though style guides discourage it. Over-long expressions continue implicitly with parentheses, or explicitly with a backslash:

```python
total = (1 + 2
         + 3 + 4)
print(total)
s = "abc" \
    "def"
print(s)
```

```text
10
abcdef
```

Source files are UTF-8 by default, so Chinese strings need no declaration. Python 3 identifiers even permit Chinese (though it's discouraged):

```python
变量 = 42
print(变量)
```

```text
42
```

## Summary

- Indentation is syntax: 4 spaces, no tab mixing.
- Variables are names bound to objects; `:=` assigns inside an expression.
- Docstrings go on the first line of a module/function/class; `__doc__` gives access.
- Continue long expressions with parentheses; source defaults to UTF-8.

## Further reading

- [Python official documentation · Language reference](https://docs.python.org/3/reference/lexical_analysis.html)
- [Python official documentation · Tutorial](https://docs.python.org/3/tutorial/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [core-concepts](/zh/knowledge/core-concepts)
- [official-docs](/zh/knowledge/official-docs)
