---
description: 引用计数即时回收、pymalloc 三级池分配、分代 GC 的阈值与算法，以及三套机制的分工，引用带文件行号。
---

# 内存管理

行号对应 3.14 分支 commit `66df30d15c9052785ed6463663e70d38107a9edf`（2026-10-04 检出）；克隆方式与阅读前提见[总览](/internals/cpython-source)。

## 引用计数为主

绝大多数对象生命周期由引用计数决定，`Py_INCREF`/`Py_DECREF`（`Include/refcount.h:252`、`:327`）内联在热路径里，减到零立刻调 `tp_dealloc` 释放。不死对象跳过全部计数（见[核心数据结构](/internals/object-model)）。这套设计的收益是即时性和确定性，代价是每次赋值都有一次原子级别开销，环状引用需要第二套机制。

## pymalloc：为小对象设计的池

对象分配走分层：请求超过 512 字节直接进 `malloc`，以下走 pymalloc（阈值 `SMALL_REQUEST_THRESHOLD`，`Include/internal/pycore_obmalloc.h:157`）。pymalloc 三级管理：arena 256 KiB（`Include/internal/pycore_obmalloc.h:213`，可配 1 MiB，见 `:211`）、pool 4 KiB（`:230`，须等于系统页大小）、block 16 字节对齐（`:132`）。入口 `_PyObject_Malloc`（`Objects/obmalloc.c:2329`）进 `pymalloc_alloc`（`:2281`）：按请求大小找对应尺寸类，从该尺寸的 pool 里切一块；pool 用尽就向 arena 要新页，arena 耗尽才真正向系统要内存（`:1974`）。地址到 arena 的反查（free 时需要）走 arena 索引树（`:1779`）。同尺寸 block 连续存放，碎片被限制在 pool 内部。

## 分代 GC：只管环

带 `PyGC_Head` 前缀的对象才受 GC 管（`Include/internal/pycore_interp_structs.h:161`，头结构在 `:169`），即可能成环的容器类型。GC 头挂在对象内存前面，`_Py_AS_GC` 用负偏移取到（`Include/internal/pycore_gc.h:17`）。

三代结构，默认阈值 2000/10/10（`Include/internal/pycore_interp_structs.h:271`）。注意不是老资料里的 700：`gc.get_threshold()` 在本分支如实返回 `(2000, 10, 10)`，运行时可改（`Modules/gcmodule.c:163`）。触发逻辑在 `gc_select_generation`（`Python/gc.c:1258`）：从老到新找第一个计数超阈值的代，其中全量收集额外要求「上一轮晋升的待处理对象 / 长活对象总数」超过 25%（`Python/gc.c:1270` 起的长注释给了这条启发式的推导，防止全量收集随长活对象数线性退化）。

算法本体在 `gc_collect_main`（`Python/gc.c:1313`）：先把本代所有对象引用数减一（subtract_refs），再从外部根遍历，引用数没恢复到零的就是不可达（`move_unreachable`，注释见 `Python/gc.c:32`、`:190`），不可达且无 `__del__` 的直接释放，有 `__del__` 的进 `gc.garbage`。存活的晋升到老一代。手动入口 `PyGC_Collect`（`Python/gc.c:1671`），分配侧挂钩在 `_PyObject_GC_New`（`Python/gc.c:1907`），每次分配给第零代计数加一（`:1865`）。

分工判断：引用计数负责九成以上的回收，分代 GC 只为环存在。CPython 不做移动式压缩，堆碎片靠 pymalloc 的尺寸类池缓解，这是它和 JVM 类运行时的根本差异。回收器暴露给 Python 的启停、观测与调试接口（`gc.collect`、`gc.callbacks`、`gc.freeze` 等）在 [gc 模块](/internals/gc-module)一页单独走读。
