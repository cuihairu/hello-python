---
description: 哪些行为属于语言规范、哪些属于 CPython 实现：sys.implementation、稳定 ABI、官方标注的实现细节与跨实现兼容线，引用带文件行号。
---

# CPython 与标准实现的边界

行号对应 3.14 分支 commit `66df30d15c9052785ed6463663e70d38107a9edf`（2026-10-04 检出）；克隆方式与阅读前提见[总览](/internals/cpython-source)。

「Python 是什么」由语言参考定义（本仓库 `Doc/reference/`），CPython 是这份规范的一份实现。哪些行为属于这份实现而不属于语言，源码自己会标：

`sys.implementation` 是官方划界机制。名字硬编码为 `"cpython"`（`Python/sysmodule.c:3629`），缓存标签拼成 `cpython-314`，字段在 `make_impl_info`（`Python/sysmodule.c:3641`）填充。判断「代码跑在哪款解释器上」应当用它，而不是平台探测。

标准库几乎不为其他实现写特判，例外集中在 `Lib/platform.py`：`python_implementation()`（`:1249`）按 `sys.version` 前缀识别 Jython（`:1182`）和 PyPy（`:1193`）。除此之外，PyPy、IronPython、GraalPy、MicroPython、RustPython 的任何代码都不在本仓库；PEP 11（平台支持政策）的编号在 3.14 分支只出现在 `Misc/HISTORY` 历史日志里（如 `Misc/HISTORY:4559`），现行代码与语言文档零引用。

稳定 ABI 是给扩展作者划的线。`Py_LIMITED_API` 定义后，`Include/Python.h` 按版本条件裁剪包含（`Include/Python.h:36`、`:42`），全部私有布局被隔离进 `Include/cpython/` 并以 `#ifndef Py_LIMITED_API` 包裹（如 `Include/cpython/code.h:3`）；受限模式下建类型只有 `PyType_FromSpec` 一条路（`Objects/typeobject.c:5432`）。遵守这条线的扩展理论上可跑在其他实现上，承诺清单在 `Doc/data/stable_abi.dat`。

一些广为人知的机制，官方文档明说是实现细节而非语言承诺：不死对象（`Doc/glossary.rst:777`）。字节码格式、`co_code_adaptive`、特化统计、GIL 切换参数同理，都是 CPython 私有，其他实现无一兼容。

边界之外还有一层实用判断：读 CPython 源码得到的结论，分为「语言规范」和「当前实现」两类。对象模型、描述符优先级属于前者，换实现大概率一致；自适应特化、pymalloc 的池参数、2000 的 GC 阈值属于后者，任何版本都可能变。这套文档的引用方式（文件加行号）就是为了让这两类结论都能被复核。
