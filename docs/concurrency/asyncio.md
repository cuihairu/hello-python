---
description: Coroutines fundamentals, gather and TaskGroup for concurrency, timeout and cancellation, and the three ways out of a blocking call.
---

# Async programming with asyncio

asyncio is a single-threaded concurrency model: one event loop schedules many coroutines, switching away whenever it hits an IO wait (`await`) instead of occupying a thread. High-concurrency network services (tens of thousands of connections per second) will hit thread-count and memory ceilings with the thread model; coroutines carry no such baggage.

## Coroutine fundamentals

`async def` defines a coroutine function; calling it returns a coroutine object. `await` suspends and waits for the result. A coroutine cannot be run directly with `run()` — hand it to an event loop, via `asyncio.run` on 3.7+:

```python
import asyncio

async def greet(name):
    await asyncio.sleep(0.01)          # 模拟 IO 等待
    return f"你好, {name}"

async def main():
    a = await greet("A")               # 串行：一个个等
    b = await greet("B")
    return [a, b]

print(asyncio.run(main()))
```

```text
['你好, A', '你好, B']
```

::: warning Coroutines are not threads
A pure-compute stretch in an `async def` function that contains no `await` suspension is **completely blocking** to the event loop. Coroutines suit IO-bound work; CPU-bound computation must be pushed to a thread pool (`loop.run_in_executor`) or to a separate process, otherwise the whole loop stalls and every coroutine comes to a halt with it.
:::

## Running concurrently: gather and TaskGroup

Real concurrency comes from scheduling coroutines to run together: `asyncio.gather` (3.7+) and `TaskGroup` (3.11+, structured concurrency — exceptions propagate automatically and sibling tasks are cancelled). Total wait time is roughly the slowest one, not the sum:

```python
import asyncio, time

async def fetch(tag, delay):
    await asyncio.sleep(delay)
    return f"{tag} done"

async def main():
    t0 = time.perf_counter()
    for tag in ("x", "y", "z"):
        await fetch(tag, 0.05)         # 串行：三个 50ms 逐一加起来
    serial = time.perf_counter() - t0

    t0 = time.perf_counter()
    r1 = await asyncio.gather(
        fetch("A", 0.05),
        fetch("B", 0.05),
        fetch("C", 0.05),
    )
    cost = time.perf_counter() - t0
    print(r1, cost < serial)           # 并发 ≈ 最慢一个，串行是三者之和

asyncio.run(main())
```

```text
['A done', 'B done', 'C done'] True
```

The TaskGroup form (prefer this on 3.11+ — exception handling is more solid):

```python
import asyncio

async def work(tag):
    await asyncio.sleep(0.01)
    return tag * 2

async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(work("a"))
        t2 = tg.create_task(work("b"))
    return [t1.result(), t2.result()]

print(asyncio.run(main()))
```

```text
['aa', 'bb']
```

## Timeout, cancellation and exceptions

`asyncio.wait_for` / `asyncio.timeout` on 3.11+ add a deadline to a wait; cancellation is cooperative, so you need to clean up inside `CancelledError`:

```python
import asyncio

async def slow():
    await asyncio.sleep(1)

async def main():
    try:
        await asyncio.wait_for(slow(), timeout=0.05)
    except asyncio.TimeoutError:
        print("超时，慢任务被取消")
    finally:
        print("清理完成")

asyncio.run(main())
```

```text
超时，慢任务被取消
清理完成
```

gather raises on the first exception by default (the remaining tasks are discarded); `return_exceptions=True` collects exceptions as results instead:

```python
import asyncio

async def boom():
    await asyncio.sleep(0.01)
    raise ValueError("炸了")

async def ok():
    await asyncio.sleep(0.02)
    return "好"

async def main():
    results = await asyncio.gather(ok(), boom(), return_exceptions=True)
    print([type(r).__name__ for r in results])

asyncio.run(main())
```

```text
['str', 'ValueError']
```

## Common primitives

The event loop ships with a full set of concurrency primitives: `Semaphore` to cap concurrency, `Queue` for inter-coroutine messaging, `Event` for signals, `Lock` for mutual exclusion (all are coroutine versions, acquired with `await`):

```python
import asyncio

async def limited(sem, i):
    async with sem:                     # 最多同时 2 个
        await asyncio.sleep(0.01)
        return i

async def main():
    sem = asyncio.Semaphore(2)
    print(await asyncio.gather(*(limited(sem, i) for i in range(5))))

asyncio.run(main())
```

```text
[0, 1, 2, 3, 4]
```

## What to do about blocking calls

Synchronous standard-library APIs (`requests`, disk IO, `time.sleep`) will freeze the loop. Three ways out:

```python
import asyncio

async def main():
    loop = asyncio.get_running_loop()
    # 方式一：扔线程池（适合零散阻塞调用）
    result = await loop.run_in_executor(None, sum, range(1000))
    print(result)

asyncio.run(main())
```

```text
499500
```

- A few calls: put them on the default thread pool with `run_in_executor`.
- Network IO: switch to an async library (httpx/aiohttp, asyncpg, redis.asyncio).
- Timing: `await asyncio.sleep`, never `time.sleep`.

## Async generators and asynchronous iteration

`async for` iterates over an async generator (`async def` + `yield`); useful for streaming data and paginated pulls:

```python
import asyncio

async def count(n):
    for i in range(n):
        await asyncio.sleep(0.005)
        yield i

async def main():
    total = 0
    async for v in count(4):
        total += v
    print(total)

asyncio.run(main())
```

```text
6
```

## Summary

- Coroutine = `async def` + `await`; `asyncio.run` starts the event loop.
- Concurrency comes from `gather` / `TaskGroup`; total time is the slowest task.
- Don't cram CPU-bound work into coroutines — use `run_in_executor` or multiprocessing.
- Use `wait_for`/`timeout` for deadlines, `Semaphore` for rate limiting, and rework blocking calls.
- Prefer TaskGroup on 3.11+ (structured concurrency) — exception propagation is more reliable.

## References

- [Python official docs · asyncio](https://docs.python.org/3/library/asyncio.html)
- [Python official docs · coroutines and tasks](https://docs.python.org/3/library/asyncio-task.html)
- [Python official docs · event loop](https://docs.python.org/3/library/asyncio-eventloop.html)
- [PEP 492 · async/await](https://peps.python.org/pep-0492/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/zh/knowledge/books)
- [core-concepts](/zh/knowledge/core-concepts)
- [official-docs](/zh/knowledge/official-docs)
- [pitfalls](/zh/knowledge/pitfalls)
- [scenarios](/zh/knowledge/scenarios)
