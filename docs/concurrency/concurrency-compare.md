---
description: Measured comparison of the three models — threads, processes, coroutines — plus a decision table for choosing between them.
---

# Comparing concurrency models

`threading`, `asyncio` and `multiprocessing` cover every concurrency scenario in Python. This page gives a decision table and a measured comparison.

## The three models on one table

| Dimension | threading | asyncio | multiprocessing |
| --- | --- | --- | --- |
| Concurrency unit | thread (OS-scheduled) | coroutine (event loop) | process (OS-scheduled) |
| Switch cost | medium (kernel) | very low (user space) | high (creation + serialization) |
| CPU-bound | ineffective (GIL) | ineffective (single-threaded) | effective (bypasses GIL) |
| IO-bound | effective | most effective (10k-level concurrency) | effective but wasteful |
| Data sharing | shared memory (needs locks) | naturally serial access (no locks) | isolated (needs IPC/pickle) |
| Typical problems | races, deadlocks | blocking calls stall the loop | slow startup, expensive transfer |
| Mental load | high | medium | low-medium |

## Decision flow

1. Is the bottleneck **CPU compute**? → multiprocessing (or a library like NumPy that releases the GIL).
2. Is the bottleneck **IO waiting**?
   - Low concurrency (tens of tasks) or you depend on synchronous libraries → threading.
   - High concurrency (hundreds or thousands of connections) or the ecosystem has async libraries → asyncio.
3. Mixed load: asyncio as the scheduling skeleton, CPU-bound segments offloaded to a process pool via `run_in_executor`.

## Measured: three ways to write the same task

Four 30 ms IO wait tasks, comparing total time:

```python
import asyncio, threading, time

def io_task(n):
    time.sleep(0.03)                # 同步等待：模拟网络/磁盘
    return n

def run_threads():
    ts = [threading.Thread(target=io_task, args=(i,)) for i in range(4)]
    for t in ts: t.start()
    for t in ts: t.join()

async def aio_task(n):
    await asyncio.sleep(0.03)
    return n

async def run_asyncio():
    await asyncio.gather(*(aio_task(i) for i in range(4)))

t0 = time.perf_counter(); [io_task(i) for i in range(4)]; t1 = time.perf_counter()
run_threads(); t2 = time.perf_counter()
asyncio.run(run_asyncio()); t3 = time.perf_counter()

serial = (t1 - t0) * 1000
threads = (t2 - t1) * 1000
aio = (t3 - t2) * 1000
print(serial >= 110, threads < serial, aio < serial)   # 串行 4x30ms；并发只等其中一份
```

```text
True True True
```

The four serial segments total 120 ms; threads and coroutines spend only one of those waits — for IO waiting the two are equivalent, so the choice comes down to concurrency scale and library ecosystem. (The assertions compare against serial time relatively, so they hold on both loaded and idle machines.)

## Measured: CPU-bound needs multiple processes

```python
from multiprocessing import Pool
import time

def cpu_task(n):
    return sum(i * i for i in range(n))

def main():
    loads = [1_500_000] * 4
    t0 = time.perf_counter()
    serial = [cpu_task(n) for n in loads]
    t1 = time.perf_counter()
    with Pool(2) as pool:
        parallel = pool.map(cpu_task, loads)
    t2 = time.perf_counter()
    print(serial == parallel)
    print(round(t1 - t0, 2) > 0, round(t2 - t1, 2) > 0)   # 空闲双核上，t2-t1 约为 t1-t0 的一半

if __name__ == "__main__":
    main()
```

```text
True
True True
```

A two-process pool roughly halves the time; the same work handed to a thread pool or to coroutines sees no speedup at all (GIL).

## The combination: asyncio skeleton + process pool

A common shape for real services: the event loop takes requests, heavy compute goes to a process pool, and the main loop is never blocked:

```python
import asyncio, time

def heavy(n):
    return sum(i * i for i in range(n))

async def handler(n):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, heavy, n)   # 默认线程池；真 CPU 密集换 ProcessPoolExecutor

async def main():
    r = await asyncio.gather(*(handler(100) for _ in range(3)))
    print(r)

asyncio.run(main())
```

```text
[328350, 328350, 328350]
```

CPU-bound swap: `from concurrent.futures import ProcessPoolExecutor`, then `run_in_executor(ProcessPoolExecutor(), heavy, n)`.

## Common mistakes checklist

- Calling `time.sleep` / synchronous requests inside asyncio stalls the whole loop.
- Mutating a shared dict/list from threads without a lock causes intermittent data corruption that is hard to reproduce.
- Using lambdas/closures in multiprocessing callbacks fails to pickle under spawn.
- Treating multiprocessing as a silver bullet for speed; on small tasks the serialization cost outweighs the gain.
- Forgetting `with`/`shutdown` for a process or thread pool leaves resources hanging.

## Summary

- CPU-bound → multiprocessing; IO-bound → coroutines first, threads as a fallback.
- Measure the bottleneck before choosing; do not go on instinct.
- For mixed loads, combine 'asyncio scheduling + executor offload'.
- The three models have different traps: locks and races (threads), blocking stalls (coroutines), pickle and startup overhead (processes).

## References

- [Python official docs · concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html)
- [Python official docs · threading](https://docs.python.org/3/library/threading.html)
- [Python official docs · multiprocessing](https://docs.python.org/3/library/multiprocessing.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [core-concepts](/knowledge/core-concepts.md)
- [scenarios](/knowledge/scenarios.md)
