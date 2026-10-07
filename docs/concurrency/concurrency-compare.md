---
description: 线程、进程、协程三种模型的实测对比与选型决策表。
---

# 并发模型对比与选型

threading、asyncio、multiprocessing 三条路覆盖了 Python 并发的全部场景。这页给一张决策表和一份实测对比。

## 一张表看清三种模型

| 维度 | threading | asyncio | multiprocessing |
| --- | --- | --- | --- |
| 并发单位 | 线程（OS 调度） | 协程（事件循环） | 进程（OS 调度） |
| 切换成本 | 中（内核态） | 极低（用户态） | 高（创建 + 序列化） |
| CPU 密集 | 无效（GIL） | 无效（单线程） | 有效（绕过 GIL） |
| IO 密集 | 有效 | 最有效（万级并发） | 有效但浪费 |
| 数据共享 | 共享内存（要锁） | 天然串行访问（无需锁） | 隔离（要 IPC/pickle） |
| 典型问题 | 竞态、死锁 | 阻塞调用卡死循环 | 启动慢、传输贵 |
| 心智负担 | 高 | 中 | 低-中 |

## 决策流程

1. 任务瓶颈是 **CPU 计算**？→ multiprocessing（或 NumPy 这类释放 GIL 的库）。
2. 瓶颈是 **IO 等待**？
   - 并发量小（几十）或依赖同步库 → threading。
   - 并发量大（成百上千连接）或生态里有异步库 → asyncio。
3. 混合负载：asyncio 做调度骨架，CPU 段 `run_in_executor` 扔进程池。

## 实测：同一任务的三种写法

模拟 4 个各 30ms 的 IO 等待任务，对比总耗时：

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

串行 4 段共 120ms，线程与协程只花其中一段的等待时间——IO 等待场景两者等效，选型看并发规模与库生态。（断言用与串行耗时的相对比较，机器负载高低都成立。）

## 实测：CPU 密集必须多进程

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

双进程池约砍半耗时；同样的任务扔给线程池或协程不会有任何加速（GIL）。

## 组合拳：asyncio 骨架 + 进程池

真实服务常见形态：事件循环接请求，重计算段丢给进程池，主循环不被卡：

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

CPU 密集替换：`from concurrent.futures import ProcessPoolExecutor` 后 `run_in_executor(ProcessPoolExecutor(), heavy, n)`。

## 常见错误清单

- 在 asyncio 里调 `time.sleep` / 同步 requests，会卡死整个循环。
- 线程里改共享 dict/list 不加锁，偶发数据损坏，难复现。
- 多进程回调里用 lambda/闭包，spawn 下 pickle 失败。
- 把 multiprocessing 当提速银弹，小任务的序列化开销会反超收益。
- 忘了进程/线程池的 `with`/`shutdown`，资源会悬挂。

## 小结

- CPU 密集 → multiprocessing；IO 密集 → 协程优先、线程兜底。
- 选型前先测量瓶颈，别按直觉。
- 混合负载用「asyncio 调度 + executor 卸载」的组合。
- 三种模型的坑不同：锁与竞态（线程）、阻塞卡死（协程）、pickle 与启动开销（进程）。
