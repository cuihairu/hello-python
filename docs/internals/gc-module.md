---
description: gc 模块的完整 Python 面：启停与阈值、collect 与统计、观测 API、调试位与垃圾表、回调订阅、freeze 与永久代，引用带文件行号。
---

# gc 模块：垃圾回收的 Python 面

分代回收的 C 侧算法在[内存管理](/internals/memory-management)走读过，本页读它暴露给 Python 的那层：`Modules/gcmodule.c` 里每个函数落到 `Python/gc.c` 的哪个机制上，以及怎么用它们观测和控制运行中的回收器。行号口径与全套子页一致（3.14 分支 commit `66df30d15c9052785ed6463663e70d38107a9edf`）。

## 模块布局

方法表 `GcMethods[]`（`Modules/gcmodule.c:520`）收了 18 个函数。模块初始化 `gcmodule_exec`（`:543`）挂上两个共享状态列表：`gc.garbage`（`:550`）和 `gc.callbacks`（`:554`），都指向解释器 GCState 里的同一份数据，模块属性只是它们的入口。`DEBUG_*` 常量在 `:558` 起批量导出，值定义在 `Include/internal/pycore_gc.h:125` 起。代数是编译期常量 `NUM_GENERATIONS` 3（`Include/internal/pycore_interp_structs.h:200`）。

## 启停与阈值

`gc.enable`（`Modules/gcmodule.c:35`）、`gc.disable`（`:49`）、`gc.isenabled`（`:63`）直接读写 GCState 的开关。注意 disable 只停**自动**触发，`collect()` 手动回收不受影响。

`gc.set_threshold`（`:156`）把三个参数写进 GCState 各代的阈值字段（`:163` 起），文档明言「threshold0 置零即关闭自动回收」（`:152`）——这是比 disable 更细的控制：分配计数照常累计，只是永远够不着触发线。`gc.get_threshold`（`:192`）读回同一个状态。`gc.get_count`（`:216`）返回三代当前计数，读的是计数器加尚未入账分配数的快照（`:225` 起），所以拿到的数可能比上一刻略大。

```python
import gc

saved = gc.get_threshold()
gc.set_threshold(100, 10, 10)
print(gc.get_threshold()[0])
gc.disable()
print(gc.isenabled())
gc.enable()
gc.set_threshold(*saved)
print(gc.get_threshold() == saved)
```

```text
100
False
True
```

## collect：手动触发一次回收

`gc.collect(generation=2)`（`Modules/gcmodule.c:84`）默认收全部三代（clinic 默认参数就是 `NUM_GENERATIONS - 1`，`:72`），代号越界抛 `ValueError`（`:89`），最终落到 `Python/gc.c` 的 `_PyGC_Collect`，原因标记为手动（`:94`）。返回值是本次回收的不可达对象数。

自动回收全关（`threshold0 = 0`）加手动 `collect` 是嵌入式和延迟敏感场景的标准姿势：回收时机从「分配计数碰线」变成「代码说了算」。

```python
import gc

n = gc.collect()
stats = gc.get_stats()
print(isinstance(n, int))
print(sorted(stats[0]))
```

```text
True
['collected', 'collections', 'uncollectable']
```

`gc.get_stats`（`:371`）每个代一个字典，三个键即该代的累计：触发次数、回收对象数、不可回收对象数；取值前先快照，保证构造结果列表期间的分配不污染读数（`:377` 起的注释）。

## 观测：谁被跟踪、谁引用谁

`gc.get_objects`（`:340`）列出全部受管对象，可按代过滤；代号越界或为负都抛 `ValueError`（`:347`、`:354`），入口处还有审计点 `PySys_Audit("gc.get_objects")`（`:343`）。

`gc.is_tracked`（`:424`）落到 `PyObject_GC_IsTracked`：原子对象（`int`、`str`）和空 tuple 单例不受 GC 跟踪——它们不可能成环，没必要进[内存管理](/internals/memory-management)说的 `PyGC_Head` 名册。注意 tuple 的口径 3.14 变了：本分支非空 tuple 一律受管（`Objects/tupleobject.c:88` 统一 TRACK，`:64` 注明空单例例外），3.12 及以前则是「含受管成员才受管」。

`gc.get_referents`（`:303`）与 `gc.get_referrers`（`:255`）是引用边的两个方向：前者列对象直接引用了谁，后者反查谁直接引用了它。返回顺序未作保证，跨版本断言前先排序；referrers 要全堆线性扫描，只配当调试工具，别进热路径。

```python
import gc

target = ["secret"]
holder = [target, "label"]
print(gc.is_tracked([]), gc.is_tracked(3.14), gc.is_tracked("abc"))
print(sorted(type(x).__name__ for x in gc.get_referents(holder)))
print(holder in gc.get_referrers(target))
```

```text
True False False
['list', 'str']
True
```

## 调试位与垃圾表

`gc.set_debug`（`:116`）/`gc.get_debug`（`:131`）操作五个位，定义在 `Include/internal/pycore_gc.h:125` 起：`DEBUG_STATS`（1<<0）打印收集统计，`DEBUG_COLLECTABLE`（1<<1）与 `DEBUG_UNCOLLECTABLE`（1<<2）打印对象清单，`DEBUG_SAVEALL`（1<<5）把本该释放的对象全部塞进 `gc.garbage`，`DEBUG_LEAK` 是除 STATS 外几位的组合（`:129`）。

PEP 442 之后带 `__del__` 的环也能正常回收，所以 `gc.garbage` 平时是空列表；它只在 SAVEALL 位打开或存在旧式 finalizer 时才被填充——`Python/gc.c:974` 的注释写明 SAVEALL 下所有进 finalizer 的对象都入表，`:1039` 是释放前的落表点。

```python
import gc

a, b = [], []
a.append(b)
b.append(a)
ids = {id(a), id(b)}
del a, b
gc.set_debug(gc.DEBUG_SAVEALL)
try:
    gc.collect()
    print(ids.issubset({id(o) for o in gc.garbage}))
finally:
    gc.set_debug(0)
    gc.garbage.clear()
```

```text
True
```

## callbacks：订阅回收事件

`gc.callbacks` 在模块初始化时挂出（`Modules/gcmodule.c:554`），列表本体由解释器启动早期创建（`Python/gc.c:142`）。每次收集触发两轮调用——开始时报 `phase="start"`（`Python/gc.c:1358`），结束时报 `phase="stop"`（`:1527`，3.14 起；3.12 及以前的结束相位叫 `"end"`，跨版本订阅回调时注意）并附带本次的回收统计。调用点在 `Python/gc.c:1197` 的 `_PyGC_InvokeGCCallbacks`，空表直接短路（`:1216`）；回调里抛异常不会炸掉解释器，走 `PyErr_FormatUnraisable` 记录后继续（`:1222`、`:1230`）。

```python
import gc

events = []

def note(phase, info):
    events.append(phase)

gc.callbacks.append(note)
try:
    gc.collect(2)
finally:
    gc.callbacks.remove(note)
print(len(events), events[0])
```

```text
2 start
```

## freeze：给 fork 省 copy-on-write

`gc.freeze`（`Modules/gcmodule.c:458`）把当前全部受管对象挪进永久代（`Python/gc.c:126` 初始化的 `permanent_generation`），之后的收集不再碰它们。clinic 注释（`:447` 起）写明用途：POSIX `fork()` 前调用，让子进程别因 GC 写页而失去与父进程共享的内存页。`gc.unfreeze`（`:475`）把永久代整个放回最老一代。`gc.get_freeze_count`（`:490`）读永久代对象数。

版本注记：`gc.is_finalized`（`:440`，判定对象是否已被 GC 收尾）是 3.13 新增，`gc.get_freeze_count` 是 3.14 新增——老解释器上先 `hasattr` 探一下再用。
