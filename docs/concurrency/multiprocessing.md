---
description: Process pools and inter-process communication, shared state with shared_memory, and choosing the process start method.
---

# Multiprocessing with multiprocessing

Every process gets its own interpreter and its own GIL, which is how `multiprocessing` sidesteps the GIL — the standard answer for parallelizing CPU-bound tasks. The cost: process creation and data transfer are more expensive, and objects must be serialized to cross process boundaries.

## Basic usage

`Process` has nearly the same interface as `Thread`. Scripts must wrap things in an `if __name__ == "__main__":` guard — under the spawn start method the child re-imports the main module, and without the guard you get unbounded recursive process creation:

```python
from multiprocessing import Process, Queue
import os

def worker(n, q):
    q.put((n, n * n, os.getpid()))     # 子进程打印会乱序，交给队列回父进程

if __name__ == "__main__":
    q = Queue()
    ps = [Process(target=worker, args=(i, q)) for i in range(3)]
    for p in ps:
        p.start()
    results = sorted(q.get() for _ in range(3))
    for p in ps:
        p.join()
    print([(n, sq) for n, sq, _ in results])
    print("父进程 pid 独立:", len({pid for *_, pid in results}) == 3)
```

```text
[(0, 0), (1, 1), (2, 4)]
父进程 pid 独立: True
```

## The Pool

Managing processes by hand gets tedious; a pool distributes work automatically across CPU cores. `map` dispatches tasks in a batch, `imap` streams results back, `apply_async` submits a single async task:

```python
from multiprocessing import Pool
import os

def heavy_square(n):
    return n * n, os.getpid()

if __name__ == "__main__":
    with Pool(processes=2) as pool:
        results = pool.map(heavy_square, [10, 20, 30, 40])
    print([r[0] for r in results])
    print(len({r[1] for r in results}) <= 2)    # 最多 2 个 worker pid
```

```text
[100, 400, 900, 1600]
True
```

## Inter-process communication

Processes do not share memory; moving data means serializing it. `Queue` goes over a pipe, `Pipe` is point-to-point; for large amounts of shared data use `Manager` or `shared_memory`:

```python
from multiprocessing import Process, Queue

def producer(q):
    for i in range(3):
        q.put(f"data-{i}")
    q.put(None)

def consumer(q, result_q):
    while True:
        item = q.get()
        if item is None:
            break
        result_q.put(item.upper())     # 结果必须送回：子进程改列表，父进程看不见

if __name__ == "__main__":
    q, result_q = Queue(), Queue()
    p = Process(target=producer, args=(q,))
    c = Process(target=consumer, args=(q, result_q))
    p.start(); c.start()
    p.join(); c.join()
    out = [result_q.get() for _ in range(3)]     # FIFO，顺序与生产一致
    print(out)
```

```text
['DATA-0', 'DATA-1', 'DATA-2']
```

::: tip Parent and child memory is copied
Pass a list to a child process and it receives a **copy** restored from pickle — the child can append as many times as it likes, the parent's list never moves (you get `[]` back). Results have to travel back across the process boundary via a queue or `Manager().list()`.
:::

::: warning The pickle constraint
Every argument and return value that crosses a process boundary must be picklable: lambdas, local functions, and open file handles are out. Under the spawn start method (the default on macOS/Windows) the child re-imports the module, so target functions must be importable top-level names in the module.
:::

## Verifying the parallel speedup

Compare serial versus a two-process pool on a compute task (roughly a 2x speedup, dampened by process-creation overhead):

```python
from multiprocessing import Pool
import time

def cpu_task(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    loads = [200_000] * 4
    serial = [cpu_task(n) for n in loads]
    with Pool(processes=2) as pool:
        parallel = pool.map(cpu_task, loads)
    print(serial == parallel)
```

```text
True
```

## shared_memory and shared state

`shared_memory.SharedMemory` (3.8+) lets multiple processes read and write the same block of memory directly (the standard tool for large NumPy arrays):

```python
from multiprocessing import shared_memory, Process
import time

def writer(name):
    shm = shared_memory.SharedMemory(name=name)
    buf = shm.buf
    time.sleep(0.02)
    buf[0] = 42                        # 写入共享内存
    shm.close()

if __name__ == "__main__":
    shm = shared_memory.SharedMemory(create=True, size=8)
    p = Process(target=writer, args=(shm.name,))
    p.start(); p.join()
    print(shm.buf[0])                  # 父进程读到 42
    shm.close(); shm.unlink()          # 必须显式释放
```

```text
42
```

For a simple shared counter, `Manager` is less hassle (values are synchronized through a proxy process; slower than shared_memory):

```python
from multiprocessing import Process, Value

def bump(counter):
    for _ in range(1000):
        with counter.get_lock():       # 共享计数也必须持锁，否则丢更新
            counter.value += 1

if __name__ == "__main__":
    counter = Value("i", 0)
    ps = [Process(target=bump, args=(counter,)) for _ in range(2)]
    for p in ps: p.start()
    for p in ps: p.join()
    print(counter.value)
```

```text
2000
```

## Process start methods

| Method | Platform default | Characteristics |
| --- | --- | --- |
| `fork` | Linux | Fast; the child copies the parent's memory; has pitfalls when mixed with threads |
| `spawn` | macOS/Windows | Slower but clean; re-imports the module; most portable |
| `forkserver` | No default | Starts a clean process first, then forks from it; a safety compromise |

For cross-platform projects, set `multiprocessing.set_start_method("spawn")` explicitly (once only) so behavior is consistent.

## When to use multiprocessing

- Use it for: image processing, numeric computation, parsing large files, model inference — tasks that saturate the CPU.
- Don't use it for: work dominated by network waiting (coroutines/threads are cheaper); or huge data volumes with trivial computation (serialization overhead outweighs the gain).

## Summary

- Multiprocessing sidesteps the GIL; it is the standard approach for CPU-bound parallelism.
- Scripts must have the `if __name__ == "__main__"` guard; data crossing processes goes through pickle.
- Day to day, batch dispatch with `Pool.map`; use `shared_memory` for large shared data.
- Core count is the ceiling to reference: `os.cpu_count()`. Process creation and serialization have fixed overhead, so tasks must be big enough to pay off.

## References

- [Python official docs · multiprocessing](https://docs.python.org/3/library/multiprocessing.html)
- [Python official docs · concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/zh/knowledge/books)
- [core-concepts](/zh/knowledge/core-concepts)
- [official-docs](/zh/knowledge/official-docs)
- [pitfalls](/zh/knowledge/pitfalls)
- [scenarios](/zh/knowledge/scenarios)
