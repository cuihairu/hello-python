# 上下文管理器

with 语句把「进入资源、退出资源」收拢成一个语法块：无论中间抛不抛异常，退出动作保证执行。打开文件、加锁、数据库事务、连接池，凡是「配对的进入/退出」都该交给上下文管理器。

## with 为什么可靠

手动管理资源有三个漏洞：忘记 close、提前 return 跳过 close、中间异常绕过 close。with 在进入时拿资源、退出时调 `__exit__`，异常也会穿过去被清理逻辑看到：

```python
import tempfile, pathlib

with tempfile.TemporaryDirectory() as d:
    p = pathlib.Path(d) / "a.txt"
    p.write_text("data", encoding="utf-8")
    print(p.exists())
# 离开 with 后目录已被清理
```

```text
True
```

抛异常时清理照样执行，异常本体继续向上传播：

```python
def demo():
    try:
        with open("/dev/null", "w") as f:
            f.write("x")
            raise RuntimeError("出事了")
    except RuntimeError as e:
        return f"捕获 {e}，文件已随 with 关闭"

print(demo())
```

```text
捕获 出事了，文件已随 with 关闭
```

## __enter__ 与 __exit__

协议只有两个方法：`__enter__` 的返回值赋给 `as` 变量；`__exit__` 接收异常三元组（类型、值、栈），返回真值会**吞掉**异常——自定义管理器时除非有意恢复，别返回真：

```python
class Tag:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print(f"[{self.name}] enter")
        return self.name          # 赋给 as 变量
    def __exit__(self, exc_type, exc, tb):
        print(f"[{self.name}] exit exc={exc_type.__name__ if exc_type else None}")
        return False              # 不吞异常

with Tag("db") as t:
    print("使用", t)
```

```text
[db] enter
使用 db
[db] exit exc=None
```

异常穿透演示——`__exit__` 能看到异常但选择放行：

```python
class Guard:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        print("异常类型:", exc_type.__name__ if exc_type else None)
        return False              # False 放行，True 吞掉

try:
    with Guard():
        raise ValueError("bad")
except ValueError as e:
    print("外层收到:", e)
```

```text
异常类型: ValueError
外层收到: bad
```

返回 True 的用途是「局部恢复」：清理现场并把异常按正常流程收掉，比如把底层异常统一转成自己的业务异常：

```python
class Translate:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        if exc_type is KeyError:
            print("已把 KeyError 转为默认值，流程继续")
            return True           # 吞掉，with 后照常执行
        return False

with Translate():
    d = {}
    print(d["missing"])
print("继续执行")
```

```text
已把 KeyError 转为默认值，流程继续
继续执行
```

## contextlib：三步变一行

`@contextmanager` 装饰器把「有 yield 的生成器」变成上下文管理器：yield 之前是 enter，之后是 exit。管理资源的样板代码能省则省：

```python
from contextlib import contextmanager
import tempfile, pathlib

@contextmanager
def chdir(path):
    import os
    old = os.getcwd()
    os.chdir(path)
    try:
        yield                      # with 体在这一行执行
    finally:
        os.chdir(old)              # finally 保证异常时也复原

with tempfile.TemporaryDirectory() as d:
    with chdir(d):
        print(pathlib.Path.cwd().name == pathlib.Path(d).name)
print(pathlib.Path.cwd() != pathlib.Path(d))   # 已切回原目录
```

```text
True
True
```

## 标准库里的常用现成货

- `open` / `pathlib` 文件管理（最常用）。
- `threading.Lock`：`with lock:` 互斥加锁解锁。
- `contextlib.suppress(X)`：忽略特定异常，比 try/except 干净。
- `contextlib.redirect_stdout`：重定向输出（测试捕获打印）。
- `decimal.localcontext`：小数精度上下文。
- `async with`：异步资源（如 aiohttp 会话）。

```python
from contextlib import suppress, redirect_stdout
import io

with suppress(FileNotFoundError):
    open("/definitely/not/here.txt")
print("异常被 suppress 吞掉，流程继续")

buf = io.StringIO()
with redirect_stdout(buf):
    print("悄悄打印")
print("stdout 被重定向到:", repr(buf.getvalue()))
```

```text
异常被 suppress 吞掉，流程继续
stdout 被重定向到: '悄悄打印\n'
```

## 自定义 vs 组合

自己写 `__enter__`/`__exit__` 适合资源本身由类持有（连接、会话）；用 `@contextmanager` 包一段过程性逻辑更轻。已有工具（`suppress`、`closing`、`ExitStack`）优先复用，`ExitStack` 处理「资源数量不定」的场景：

```python
from contextlib import ExitStack, closing
from contextlib import contextmanager

@contextmanager
def step(name, log):
    log.append(f"start:{name}")
    yield
    log.append(f"end:{name}")

log = []
with ExitStack() as stack:
    stack.enter_context(step("a", log))
    stack.enter_context(step("b", log))
    print("工作中", log)
print(log)
```

```text
工作中 ['start:a', 'start:b']
['start:a', 'start:b', 'end:b', 'end:a']
```

## 小结

- with 保证进入/退出配对，异常路径也不例外。
- 协议：`__enter__` 返回 as 值，`__exit__` 看异常三元组、返回真即吞异常。
- 过程性逻辑用 `@contextmanager`，异常忽略用 `suppress`，多资源用 `ExitStack`。
- 锁、事务、重定向这类标准场景直接用现成的。
