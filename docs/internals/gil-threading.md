---
description: GIL 的实际实现：locked 加条件变量、5 毫秒切换间隔、线程状态与 PyGILState，以及自由线程构建的布局变化，引用带文件行号。
---

# GIL 与线程模型

行号对应 3.14 分支 commit `66df30d15c9052785ed6463663e70d38107a9edf`（2026-10-04 检出）；克隆方式与阅读前提见[总览](/internals/cpython-source)。

GIL 的实现比传闻朴素。`_gil_runtime_state`（`Include/internal/pycore_gil.h:22`）核心就一个 `locked` 整数加互斥锁和条件变量。`Python/ceval_gil.c:13` 起的实现注释把机制讲全了：持锁线程的求值循环周期性检查中断位，等待线程在条件变量上等满 `interval` 微秒后设置让位请求；默认切换间隔 5000 微秒（`Python/ceval_gil.c:147`），即 `sys.getswitchinterval()` 的 5 毫秒。抢锁入口 `take_gil`（`Python/ceval_gil.c:285`），放锁入口 `drop_gil`（`:216`）。

对 Python 代码的含义：切换点只在字节码边界和显式释放点，单个字节码执行多长时间 GIL 就被占多久（`Python/ceval_gil.c:34` 的注释承认 opcode 耗时不可控）。所以纯 Python 的 CPU 密集循环里，5 毫秒切换间隔只能近似成立。C 扩展在进入阻塞系统调用前应主动 `drop_gil`，这是 threading 模块在 IO 场景能真并行的原因。

线程状态方面，每个 OS 线程对应一个 `PyThreadState`；C 扩展最常用的 `PyGILState_Ensure`（`Python/pystate.c:2894`）负责给当前线程补建线程状态并抢 GIL，配对的 `Release` 归还。信号处理依赖同一个中断位：求值循环里的 `_CHECK_PERIODIC`（`Python/bytecodes.c:155`）是信号得以在纯 Python 代码中响应的唯一通道，机制见[解释器主循环](/internals/eval-loop)。

自由线程构建是 3.14 的实验特性，需要 `--disable-gil` 显式配置（`configure.ac:1728`）。对象头换成线程 ID 加双计数布局（`Include/object.h:152`，与默认布局的对照见[核心数据结构](/internals/object-model)），容器内部用对象锁和延迟回收保护：dict 在被其他线程首次读取时标记 shared（`Objects/dictobject.c:1315`）。默认构建仍是带 GIL 的解释器，本页其余引用均以默认构建为准。
