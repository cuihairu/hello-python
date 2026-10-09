---
description: 协程基础、gather 与 TaskGroup 并发、超时取消，阻塞调用的三种出路。
---

# 异步编程 asyncio

asyncio 是单线程并发模型：一个事件循环调度大量协程，遇到 IO 等待（`await`）就切走，不占线程。高并发网络服务（每秒数万连接）线程模型会撞到线程数与内存上限，协程没有这个包袱。

## 协程基础

`async def` 定义协程函数，调用得到协程对象；`await` 挂起等待结果。协程不能直接 `run()`，要交给事件循环——3.7+ 用 `asyncio.run`：

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

::: warning 协程 ≠ 线程
`async def` 的函数在没有 `await` 挂起的纯计算段是**完全阻塞**事件循环的。协程适合 IO 密集；CPU 密集计算必须扔到线程池（`loop.run_in_executor`）或多进程，否则整个循环被卡住，所有协程一起停摆。
:::

## 并发运行：gather 与 TaskGroup

真正的并发靠把协程「排一起跑」：`asyncio.gather`（3.7+）与 3.11+ 的 `TaskGroup`（结构化并发，异常自动传播并取消兄弟任务）。等待总耗时 ≈ 最慢那个，而不是总和：

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

TaskGroup 写法（推荐 3.11+ 用它，异常处理更稳）：

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

## 超时、取消与异常

`asyncio.wait_for` / 3.11+ 的 `asyncio.timeout` 给等待加时限；取消是协程协作式的，需要在 `CancelledError` 里做清理：

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

gather 默认第一个异常就抛出（其余任务被丢弃）；`return_exceptions=True` 把异常当结果收：

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

## 常用原语

事件循环自带一套并发原语：`Semaphore` 限并发数、`Queue` 协程间通信、`Event` 信号、`Lock` 互斥（全部是协程版，`await` 获取）：

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

## 阻塞调用怎么办

标准库同步 API（`requests`、磁盘 IO、`time.sleep`）会卡死循环，三种出路：

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

- 少量调用：`run_in_executor` 放默认线程池。
- 网络 IO：换异步库（httpx/aiohttp、asyncpg、redis.asyncio）。
- 定时：`await asyncio.sleep`，别用 `time.sleep`。

## async 生成器与异步迭代

`async for` 遍历异步生成器（`async def` + `yield`），流式数据、分页拉取用得上：

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

## 小结

- 协程 = `async def` + `await`，`asyncio.run` 启动事件循环。
- 并发靠 `gather` / `TaskGroup`，总耗时看最慢者。
- CPU 密集别塞协程，跑 `run_in_executor` 或多进程。
- 超时用 `wait_for`/`timeout`，限流用 `Semaphore`，阻塞调用必须改造。
- 3.11+ 优先 TaskGroup（结构化并发），异常传播更可靠。
