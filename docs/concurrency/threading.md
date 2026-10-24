---
description: The mechanism and limits of the GIL, where threading actually helps, and using measurement rather than guesswork to find bottlenecks.
---

# Multithreading and the GIL

Threads are the execution units the OS schedules. Python's standard library `threading` provides the thread primitives, but they are constrained by the Global Interpreter Lock (GIL): multithreading does not speed up CPU-bound tasks, and its real payoff is IO-bound work.

## What the GIL is

At any given moment in CPython only one thread executes Python bytecode; the GIL (Global Interpreter Lock) is that global lock. The reason: object reference counting is not thread-safe, and the GIL guarantees that only one thread mutates interpreter state at a time.

The direct consequences:

| Task type | Multithreaded effect | Why |
| --- | --- | --- |
| IO-bound (network, disk, waiting) | Effective | A waiting thread releases the GIL, so another thread keeps running |
| CPU-bound (compute, parsing) | Ineffective, sometimes slower | Thread switching plus lock overhead — it is still serial underneath |

::: tip The evolution of the GIL
From Python 3.9 you can adjust the switch interval with `sys.setswitchinterval`; from 3.12 CPython moves from an isolated per-interpreter GIL toward sub-interpreter parallelism; from 3.13 an experimental free-threaded build is offered (a no-GIL compile option, PEP 703). The default single-process CPython still has the GIL, and this chapter follows the default build.
:::

## Creating threads

Two ways: pass `Thread(target=...)` directly, or subclass `Thread` and override `run`. `start()` launches it, `join()` waits for it to finish:

```python
import threading, time

events = []

def worker(name, delay):
    time.sleep(delay)             # 线程真正并行的时段：sleep 让出 GIL
    events.append(f"{name} 完成")

t = threading.Thread(target=worker, args=("线程A", 0.01))
t.start()
events.append("主线程 启动")
events.append("主线程 等待中")
t.join()                          # 等子线程结束，否则主线程退出时可能被直接杀掉
events.append("主线程 完成")
print(events)
```

```text
['主线程 启动', '主线程 等待中', '线程A 完成', '主线程 完成']
```

## Thread safety and Lock

The GIL is not the same as thread safety: a bytecode-level `+=` splits into several read-modify-write steps, and a switch can land in the middle. Shared mutable state must be protected with a `Lock`:

```python
import threading, time

counter = 0
lock = threading.Lock()

def bump(n):
    global counter
    for _ in range(n):
        # 无锁版本的 read-modify-write 存在竞争窗口
        with lock:
            counter += 1

threads = [threading.Thread(target=bump, args=(20000,)) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(counter == 80000, counter)
```

```text
True 80000
```

`with lock:` acquires and releases the lock, and release is guaranteed even on exception paths (same semantics as file objects and `with` in general).

## Producer-consumer and Queue

`queue.Queue` is a thread-safe queue with a built-in wait-and-notify mechanism — more reliable than hand-rolling "lock + condition variable":

```python
import threading, queue, time

q = queue.Queue(maxsize=3)
produced, consumed = [], []

def producer():
    for i in range(3):
        q.put(f"item-{i}")            # 满时自动阻塞
        produced.append(i)
    q.put(None)                       # 哨兵：通知消费者结束

def consumer():
    while True:
        item = q.get()                # 空时自动阻塞
        if item is None:
            break
        consumed.append(item)
        q.task_done()

pt, ct = threading.Thread(target=producer), threading.Thread(target=consumer)
pt.start(); ct.start()
pt.join(); ct.join()
print(produced, consumed)
```

```text
[0, 1, 2] ['item-0', 'item-1', 'item-2']
```

## Thread synchronization primitives

| Primitive | Use |
| --- | --- |
| `Lock` | Mutual exclusion: guard a critical section |
| `RLock` | Reentrant lock; the same thread can acquire it repeatedly |
| `Semaphore(n)` | Cap the number of concurrent accessors (connection pools) |
| `Event` | Flag; `wait()` blocks until `set()` |
| `Condition` | Wait for a condition to hold (the building block under producer-consumer) |
| `Barrier(n)` | Rendezvous point; all n threads arrive, then they continue together |

Stopping a thread with an Event is a common pattern — a long-running thread checks the flag and exits, which is cleaner than hard-killing a thread:

```python
import threading, time

stop = threading.Event()
count = [0]

def loop():
    while not stop.is_set():
        count[0] += 1
        time.sleep(0.005)
    events.append("收到停止信号")

events = []
t = threading.Thread(target=loop, daemon=True)
t.start()
time.sleep(0.1)
stop.set()
t.join(timeout=1)
print(events, count[0] > 0)
```

```text
['收到停止信号'] True
```

## Daemon threads

Threads with `daemon=True` are hard-killed when the main thread exits — good for background heartbeats and polling, the "not worth waiting for" tasks. Tasks that need to finish cleanly must be non-daemon and `join`ed. The example above shows both (daemon as a safety net plus join to confirm).

## When to use multithreading

- Use it for: network requests, file I/O, database polling, GUI background work — anything that spends most of its time waiting.
- Don't use it for: numeric computation, image processing, large-scale text parsing — serial under the GIL. Switch to multiprocessing (next chapter), or native code in C extensions/NumPy that releases the GIL.

Judge by measurement: use `cProfile` or plain timing to see whether the time goes to compute or to waiting.

## Summary

- The GIL makes single-process multithreading ineffective for CPU-bound tasks; it only pays off for IO-bound ones.
- `start` launches, `join` waits; shared state must be protected with a `Lock`.
- Use `queue.Queue` for inter-thread messaging and an `Event` for stop signals — don't kill threads directly.
- Put only background chores in daemon threads; real work needs a `join`.

## References

- [Python official docs · threading](https://docs.python.org/3/library/threading.html)
- [Python official docs · queue](https://docs.python.org/3/library/queue.html)
- [Python official docs · concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [core-concepts](/zh/knowledge/core-concepts)
- [official-docs](/zh/knowledge/official-docs)
- [pitfalls](/zh/knowledge/pitfalls)
- [scenarios](/zh/knowledge/scenarios)
