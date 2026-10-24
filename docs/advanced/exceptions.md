---
description: The try/except/else/finally structure, exception chaining, custom exceptions, and exception groups in 3.11.
---

# Exception handling

Python expresses errors with exceptions: something goes wrong and you raise, you can handle it and you catch, and if nobody catches it the program exits with the full stack. Syntactically it is try/except/else/finally; semantically it is "exceptions as control flow".

## The basic structure

try wraps the code that might fail; except clauses match in the order you wrote them and the first hit runs; else runs only when "nothing was raised"; finally runs no matter what (the cleanup spot):

```python
def parse(s):
    try:
        value = int(s)
    except ValueError:
        return "不是整数"
    else:
        return value * 2
    finally:
        pass                      # 清理类操作写这里

print(parse("21"), parse("x"))
```

```text
42 不是整数
```

Catch several types at once with a tuple; `except ... as e` binds the exception instance, `type(e).__name__` is the type name, and `args` are the constructor arguments:

```python
def safe(value, denom):
    try:
        return value / denom
    except (ZeroDivisionError, TypeError) as e:
        return f"失败: {type(e).__name__}"

print(safe(1, 0), safe(1, "a"), safe(1, 4))
```

```text
失败: ZeroDivisionError 失败: TypeError 0.25
```

::: warning A bare except amplifies incidents
`except:` swallows even KeyboardInterrupt and SystemExit, so when production breaks there is nothing left to investigate. The bare minimum is `except Exception`, and after catching you should handle it, log it, or re-raise - never swallow it silently:

```python
def risky(func):
    try:
        return func()
    except Exception as e:                 # 至少限定 Exception
        print(f"记录并处理: {type(e).__name__}: {e}")
        return None

risky(lambda: 1 / 0)
risky(lambda: int("x"))
```

```text
记录并处理: ZeroDivisionError: division by zero
记录并处理: ValueError: invalid literal for int() with base 10: 'x'
```
:::

## raise and exception chains

`raise` throws an exception; when you raise a new one from inside an except block, write `raise NewError(...) from e` to preserve the original context (`__cause__`), so the stack shows "the exception above is caused directly by the one below":

```python
class ConfigError(Exception):
    """配置解析失败。"""

def load(text):
    try:
        return int(text)
    except ValueError as e:
        raise ConfigError(f"端口必须是整数，得到 {text!r}") from e

try:
    load("abc")
except ConfigError as e:
    print("捕获:", e, "| 原因:", type(e.__cause__).__name__)
```

```text
捕获: 端口必须是整数，得到 'abc' | 原因: ValueError
```

A bare `raise` inside an except block re-throws the current exception (keeping the original stack), which is the standard "log it, then let it go" pattern:

```python
def handler(func):
    try:
        return func()
    except ValueError:
        print("记日志")
        raise                          # 原样抛出，栈不变

try:
    handler(lambda: int("x"))
except ValueError:
    print("上层继续处理")
```

```text
记日志
上层继续处理
```

## Custom exceptions

Subclass `Exception` (not BaseException), pick a name that carries meaning, and organize the exception hierarchy by module. Carrying context fields is more useful than strings alone:

```python
class ApiError(Exception):
    def __init__(self, message, status=500):
        super().__init__(message)
        self.status = status

class NotFound(ApiError):
    def __init__(self, what):
        super().__init__(f"{what} 不存在", status=404)

try:
    raise NotFound("用户 u1")
except ApiError as e:
    print(e, e.status)
```

```text
用户 u1 不存在 404
```

## EAFP and LBYL

The Python community prefers EAFP (Easier to Ask Forgiveness than Permission): just do it and catch the exception if it fails, rather than LBYL (Look Before You Leap), which checks first. Dict lookup and type conversion are the classic cases:

```python
data = {"a": 1}

# LBYL：先判断再取
if "a" in data:
    v1 = data["a"]
else:
    v1 = 0

# EAFP：直接取，缺键接异常
try:
    v2 = data["a"]
except KeyError:
    v2 = 0

print(v1, v2)

def as_int(s):
    try:
        return int(s)              # EAFP：转换失败才是非法输入
    except ValueError:
        return None

print(as_int("42"), as_int("zz"))
```

```text
1 1
42 None
```

EAFP is usually faster (no race window), and under threading it avoids the problem of state changing between the check and the use.

## Built-in exceptions at a glance

| Exception | When it fires |
| --- | --- |
| `ValueError` | Right type, illegal value (`int("x")`) |
| `TypeError` | Wrong type (`1 + "a"`) |
| `KeyError` / `IndexError` | Missing dict key / out-of-range sequence index |
| `AttributeError` | The object has no such attribute |
| `FileNotFoundError` | The file does not exist |
| `ZeroDivisionError` | Division by zero |
| `RuntimeError` | A runtime error with no more specific category |

## Exception groups in 3.11+

`ExceptionGroup` carries several exceptions at once, and `except*` handles them separately by type - built for batches of failing concurrent tasks:

```python
def run():
    try:
        raise ExceptionGroup("批量", [ValueError("v"), TypeError("t")])
    except* ValueError as eg:
        print("值错误:", [str(e) for e in eg.exceptions])
    except* TypeError as eg:
        print("类型错误:", [str(e) for e in eg.exceptions])

run()
```

```text
值错误: ['v']
类型错误: ['t']
```

## Summary

- try/except/else/finally each have their job; order the except clauses by subclass first.
- Never write a bare except; either handle it or let it through, and use `raise ... from e` to keep the context.
- Custom exceptions subclass Exception and carry structured fields.
- Default to the EAFP style; exception groups in 3.11+ serve batch failures in concurrency.

## Further reading

- [Python official documentation · Tutorial](https://docs.python.org/3/tutorial/errors.html)
- [Python official documentation · Built-in exceptions](https://docs.python.org/3/library/exceptions.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/knowledge/books.md)
- [core-concepts](/knowledge/core-concepts.md)
- [official-docs](/knowledge/official-docs.md)
- [pitfalls](/knowledge/pitfalls.md)
- [scenarios](/knowledge/scenarios.md)
