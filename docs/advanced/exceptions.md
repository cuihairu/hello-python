---
description: try/except/else/finally 结构、异常链、自定义异常与 3.11 异常组。
---

# 异常处理

Python 用异常表达错误：出错就抛（raise），能处理就接（except），接不住就让程序带着完整栈退出。语法层面是 try/except/else/finally，语义层面是「异常即控制流」。

## 基本结构

try 包住可能出错的代码；except 按子类顺序匹配，第一个命中的执行；else 在「没抛异常」时运行；finally 无论如何都运行（清理现场）：

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

一次捕获多个类型用元组；`except ... as e` 拿到异常实例，`type(e).__name__` 是类型名，`args` 是构造参数：

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

::: warning 裸 except 是事故放大器
`except:` 连 KeyboardInterrupt、SystemExit 都吞，线上出问题查无可查。最低限度也要 `except Exception`，捕获后处理、记日志或重新抛出，不要静默吞掉：

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

## raise 与异常链

`raise` 抛异常；在 except 里再 raise 新异常时，写 `raise NewError(...) from e` 保留原始上下文（`__cause__`），栈里能看到「上面的异常是下面那个的直接原因」：

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

bare `raise` 在 except 块里重新抛出当前异常（保留原始栈），是「记录后再放行」的标准姿势：

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

## 自定义异常

继承 `Exception`（不要继承 BaseException），起有信息量的名字，按模块组织异常层级。携带上下文字段比只有字符串好用：

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

## EAFP 与 LBYL

Python 社区偏好 EAFP（Easier to Ask Forgiveness than Permission）：直接做，错了接异常；而不是 LBYL（Look Before You Leap）先检查一遍。字典取值、类型转换都是典型：

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

EAFP 通常更快（无竞争窗口），且在多线程下免去「检查与使用之间状态改变」的问题。

## 内建异常速查

| 异常 | 触发场景 |
| --- | --- |
| `ValueError` | 类型对、值非法（`int("x")`） |
| `TypeError` | 类型不对（`1 + "a"`） |
| `KeyError` / `IndexError` | 字典缺键 / 序列越界 |
| `AttributeError` | 对象没有该属性 |
| `FileNotFoundError` | 文件不存在 |
| `ZeroDivisionError` | 除以零 |
| `RuntimeError` | 无更具体分类的运行时错误 |

## 3.11+ 异常组

`ExceptionGroup` 一次携带多个异常，`except*` 按类型分别处理，为并发任务批量失败而生：

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

## 小结

- try/except/else/finally 各司其职；except 按子类顺序排列。
- 别写裸 except；要么处理要么放行，用 `raise ... from e` 保上下文。
- 自定义异常继承 Exception，携带结构化字段。
- 默认 EAFP 风格；3.11+ 异常组服务并发批量失败。
