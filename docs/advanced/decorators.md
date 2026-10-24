---
description: From a hand-written decorator to parameterized ones, with three worked examples - timing, caching, retry - plus functools and class decorators.
---

# Decorators

A decorator is a function that takes a function and returns a function. The `@dec` sugar is equivalent to `f = dec(f)`. Logging, caching, authorization, retry, timing - anything that needs the same work bolted onto the front and back of a function belongs to decorators.

## Your first decorator by hand

The inner wrapper function does the work before and after the call, and the decorated function is replaced by it:

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

The problem: after the swap the metadata is gone - `__name__` now says wrapper. `@functools.wraps` copies the original function's metadata back over, and **every decorator must have it**:

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

## Decorators that take arguments

Wrap one more layer: the outer layer takes the decorator arguments, the middle layer takes the function, the inner layer takes the call arguments. Keep the three layers straight:

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

## Classic one: timing

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

## Classic two: caching

`functools.lru_cache` is the standard library's built-in memoization decorator (thread-safe, backed by a dict plus a doubly linked list). Recursive Fibonacci drops from exponential to linear:

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

::: tip Where lru_cache applies
Arguments must be hashable, and the decorated function has to be pure (same input, same output). A list argument raises TypeError, and a function that reads external state serves stale cache values. On 3.9+, `functools.cache` is `lru_cache(maxsize=None)` with a plainer name.
:::

## Classic three: retry

Network calls always need retry. A full example with arguments and exponential backoff:

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

## Stacking decorators and functools

Multiple decorators wrap bottom-up and run top-down. Keep `@functools.wraps` on every layer of a stack or the composition falls apart:

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

## Class decorators and __set_name__

A decorator can also be a class (implement `__call__`), which lets it carry state. And `__set_name__` on 3.6+ tells a descriptor what name it was assigned to, enabling stronger attribute-level decoration:

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

## Summary

- `@dec` ≡ `f = dec(f)`; wrapper signatures are always `*args, **kwargs`.
- `@functools.wraps(func)` is mandatory - it preserves the metadata.
- A parameterized decorator is three nested layers: arguments, function, call.
- For caching use `lru_cache` (pure functions, hashable arguments) instead of reinventing it.
- Decorator stacks wrap bottom-up; class decorators implement `__call__` and can hold state.

## Further reading

- [Python official documentation · Function definitions (decorators)](https://docs.python.org/3/reference/compound_stmts.html)
- [Python official documentation · functools](https://docs.python.org/3/library/functools.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [core-concepts](/knowledge/core-concepts.md)
- [pitfalls](/knowledge/pitfalls.md)
- [scenarios](/knowledge/scenarios.md)
