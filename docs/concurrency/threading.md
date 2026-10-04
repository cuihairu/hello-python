# 多线程与 GIL

线程是操作系统调度的执行单元。Python 标准库 `threading` 提供线程原语，但受全局解释器锁（GIL）约束：多线程在 CPU 密集任务上不加速，真正的用武之地是 IO 密集。

## GIL 是什么

CPython 中任何时刻只有一个线程执行 Python 字节码，GIL（Global Interpreter Lock）是这把全局锁。原因：对象引用计数不是线程安全的，GIL 保证同一时刻只有一个线程改解释器状态。

带来的直接后果：

| 任务类型 | 多线程效果 | 原因 |
| --- | --- | --- |
| IO 密集（网络、磁盘、等待） | 有效 | 等待时线程释放 GIL，别的线程接着跑 |
| CPU 密集（计算、解析） | 无效甚至更慢 | 线程切换 + 锁开销，实际还是串行 |

::: tip GIL 的演进
Python 3.9 起可用 `sys.setswitchinterval` 调整切换间隔；3.12 起 CPython 从隔离的 per-interpreter GIL 走向子解释器并行；3.13 开始提供实验性的 free-threaded 构建（无 GIL 编译选项，PEP 703）。默认的单进程 CPython 仍带 GIL，本文以默认构建为准。
:::

## 创建线程

两种方式：直接 `Thread(target=...)`，或继承 `Thread` 类覆写 `run`。`start()` 才启动，`join()` 等它结束：

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

## 线程安全与 Lock

GIL 不等于线程安全：字节码级的 `+=` 拆成「读-改-写」多步，切换可能发生在中间。共享可变状态必须用 `Lock` 保护：

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

`with lock:` 拿锁、释放；异常路径也保证释放（与文件、with 语义一致）。

## 生产者-消费者与 Queue

`queue.Queue` 是线程安全的队列，内置等待通知机制，比手撸「锁 + 条件变量」可靠：

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

## 线程同步原语

| 原语 | 用途 |
| --- | --- |
| `Lock` | 互斥：保护临界区 |
| `RLock` | 可重入锁，同一线程可多次获取 |
| `Semaphore(n)` | 限制同时访问的线程数（连接池） |
| `Event` | 标志位，`wait()` 阻塞到 `set()` |
| `Condition` | 等待某个条件成立（生产者-消费者底层件） |
| `Barrier(n)` | 会合点，n 个线程到齐一起继续 |

Event 停止线程是常见模式——长跑线程检查标志位退出，比硬杀线程干净：

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

## daemon 线程

`daemon=True` 的线程随主线程退出被强杀，适合后台心跳、轮询这类「不值得等」的任务；需要完整结束的任务必须非 daemon 并 `join`。上面例子两者都演示了（daemon 保险 + join 确认）。

## 何时用多线程

- 用：网络请求、文件读写、数据库轮询、GUI 后台任务——一切大部分时间在「等」的场景。
- 不用：数值计算、图像处理、大规模文本解析——GIL 下串行；改用多进程（见下一章）或 C 扩展/NumPy 释放 GIL 的原生代码。

判断靠测量：用 `cProfile` 或简单计时，看时间花在计算还是等待。

## 小结

- GIL 让单进程多线程在 CPU 密集任务上无效；IO 密集才有效。
- `start` 启动、`join` 等待；共享状态必须 `Lock` 保护。
- 线程间通信用 `queue.Queue`，停止信号用 `Event`，别直接杀线程。
- daemon 线程只放后台杂务，正事要 join。
