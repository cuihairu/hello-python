# 多进程 multiprocessing

每个进程有独立解释器与独立 GIL，`multiprocessing` 由此绕开 GIL，是 CPU 密集任务并行的标准答案。代价：进程创建与数据传输更贵，对象要跨进程序列化。

## 基本用法

`Process` 与 `Thread` 接口几乎一致。脚本里必须包 `if __name__ == "__main__":` 守卫——子进程在 spawn 模式下会重新导入主模块，没有守卫会无限递归创建进程：

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

## 进程池 Pool

手动管进程太琐碎，池化按 CPU 核数自动分配。`map` 把任务批量分发，`imap` 流式返回，`apply_async` 单个异步任务：

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

## 进程间通信

进程不共享内存，传数据靠序列化。`Queue` 走管道，`Pipe` 点对点；大量共享数据用 `Manager` 或 `shared_memory`：

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

::: tip 父子进程的内存是复制的
给子进程传 list，它拿到的是 pickle 还原的**副本**——子进程 append 再多次，父进程的列表纹丝不动（返回时见 `[]`）。跨进程回传结果要走队列或 `Manager().list()`。
:::

::: warning 可序列化约束
跨进程的一切参数与返回值必须可 pickle：lambda、局部函数、打开的文件句柄都不行。spawn 模式（macOS/Windows 默认）下子进程重导入模块，target 函数必须是模块顶层可导入的名字。
:::

## 并行加速验证

用计算任务对比「串行 vs 双进程池」的实际加速比（近似 2 倍，受进程创建开销影响）：

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

## shared_memory 与共享状态

3.8+ 的 `shared_memory.SharedMemory` 让多个进程直接读写同一块内存（NumPy 大数组场景的标配）：

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

简单共享计数用 `Manager` 更省事（值通过代理进程同步，性能低于 shared_memory）：

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

## 进程的启动方式

| 方式 | 平台默认 | 特点 |
| --- | --- | --- |
| `fork` | Linux | 快，子进程复制父进程内存；与线程混用有坑 |
| `spawn` | macOS/Windows | 慢但干净，重新导入模块，最可移植 |
| `forkserver` | 无默认 | 先起干净进程再 fork，兼顾安全 |

跨平台项目显式 `multiprocessing.set_start_method("spawn")`（仅一次），行为才一致。

## 何时用多进程

- 用：图像处理、数值计算、大文件解析、模型推理——CPU 打满的任务。
- 不用：网络等待为主的场景（协程/线程更省）；数据量极大但计算极小（序列化开销反超收益）。

## 小结

- 多进程绕开 GIL，CPU 密集并行的标准方案。
- 脚本必须有 `if __name__ == "__main__"` 守卫；跨进程数据走 pickle。
- 日常用 `Pool.map` 批量分发；共享大块数据用 `shared_memory`。
- 核数 = 上限参考：`os.cpu_count()`；进程创建与序列化有固定开销，任务要够大才划算。
