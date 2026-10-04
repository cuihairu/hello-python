---
description: 从手写装饰器到带参数装饰器，计时、缓存、重试三个实例与 functools、类装饰器。
---

# 装饰器

装饰器是「接收函数、返回函数」的函数，语法糖 `@dec` 等价于 `f = dec(f)`。日志、缓存、鉴权、重试、计时——所有「在函数前后统一加事」的需求都归它。

## 手写第一个装饰器

内层函数 wrapper 在调用前后做文章，返回替换后的函数：

```python
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return str(result).upper() + "!"
    return wrapper

@shout
def greet(name):
    return f"hello {name}"

print(greet("py"))
print((greet.__name__))
```

```text
HELLO PY!
wrapper
```

问题：替换后元信息丢了——`__name__` 变成了 wrapper。`@functools.wraps` 把原函数的元信息拷贝回来，**每个装饰器都必须加**：

```python
import functools

def shout(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return str(func(*args, **kwargs)).upper() + "!"
    return wrapper

@shout
def greet(name):
    return f"hello {name}"

print(greet("py"), greet.__name__)
```

```text
HELLO PY! greet
```

## 带参数的装饰器

多包一层：外层收装饰器参数，中层收函数，内层收调用参数。三层结构别搞混：

```python
import functools

def repeat(times):
    def deco(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            results = [func(*args, **kwargs) for _ in range(times)]
            return results
        return wrapper
    return deco

@repeat(times=3)
def ping():
    return "pong"

print(ping())
```

```text
['pong', 'pong', 'pong']
```

## 经典一：计时器

```python
import functools, time

def timed(func):
    """计时装饰器：耗时记录在 wrapper.last_ms，不打扰返回值。"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        wrapper.last_ms = (time.perf_counter() - start) * 1000
        return result
    wrapper.last_ms = 0.0
    return wrapper

@timed
def work():
    return sum(range(100_000))

total = work()
print("结果位数:", len(str(total)))
print(work.last_ms >= 0)
```

```text
结果位数: 10
True
```

## 经典二：缓存

`functools.lru_cache` 是标准库自带的记忆化装饰器（线程安全，基于字典 + 双向链表），递归斐波那契从指数级降到线性：

```python
import functools

calls = {"plain": 0, "cached": 0}

def fib_plain(n):
    calls["plain"] += 1
    return n if n < 2 else fib_plain(n - 1) + fib_plain(n - 2)

@functools.lru_cache(maxsize=None)
def fib_cached(n):
    calls["cached"] += 1
    return n if n < 2 else fib_cached(n - 1) + fib_cached(n - 2)

print(fib_plain(15), fib_cached(30))
print(calls["plain"], calls["cached"])
print(fib_cached.cache_info().hits > 0)
```

```text
610 832040
1973 31
True
```

::: tip lru_cache 的适用边界
参数必须可哈希；被装饰的函数得是纯函数（同样入参出同样结果）。参数是 list 会 TypeError，函数依赖外部状态会得到过期缓存。3.9+ 的 `functools.cache` 等价于 `lru_cache(maxsize=None)`，语义更直白。
:::

## 经典三：重试

网络调用总要重试。带参数 + 指数退避的完整示例：

```python
import functools

def retry(times=3, exc=Exception):
    def deco(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last = None
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exc as e:
                    last = e
                    print(f"第 {attempt} 次失败: {type(e).__name__}")
            raise last
        return wrapper
    return deco

state = {"n": 0}                      # 用确定性的计数器模拟「前两次抖动」

@retry(times=4, exc=ValueError)
def flaky():
    state["n"] += 1
    if state["n"] < 3:
        raise ValueError("抖动")
    return "成功"

print(flaky())
```

```text
第 1 次失败: ValueError
第 2 次失败: ValueError
成功
```

## 装饰器栈与 functools

多个装饰器从下往上包裹、从上往下执行。写栈式装饰器时保持每个都 `@functools.wraps`，叠加才不出乱子：

```python
import functools

def add_brackets(func):
    @functools.wraps(func)
    def wrapper(*a, **k):
        return f"[{func(*a, **k)}]"
    return wrapper

def add_parens(func):
    @functools.wraps(func)
    def wrapper(*a, **k):
        return f"({func(*a, **k)})"
    return wrapper

@add_brackets
@add_parens
def value():
    return "x"

print(value())          # 先 parens 后 brackets
```

```text
[(x)]
```

## 类装饰器与 __set_name__

装饰器也可以是类（实现 `__call__`），能带状态；3.6+ 的 `__set_name__` 让描述器知道自己被赋给的名字，实现更强的属性级装饰：

```python
import functools

class CountCalls:
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        self.calls = 0
    def __call__(self, *args, **kwargs):
        self.calls += 1
        return self.func(*args, **kwargs)

@CountCalls
def say_hi():
    return "hi"

say_hi(); say_hi()
print(say_hi.calls, say_hi.__name__)
```

```text
2 say_hi
```

## 小结

- `@dec` ≡ `f = dec(f)`；wrapper 签名一律 `*args, **kwargs`。
- `@functools.wraps(func)` 必加，保住元信息。
- 带参数装饰器是三层嵌套：参数 → 函数 → 调用。
- 缓存用 `lru_cache`（要求纯函数 + 可哈希参数），别重复造轮子。
- 装饰器栈自下而上包裹；类装饰器实现 `__call__` 并可携带状态。
