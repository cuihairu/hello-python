---
description: 以 3.14 分支为准走读 CPython 源码的总览：源码结构、构建方式、入口链与全套子页导览，引用带文件行号。
---

# CPython 源码解析

Python 语言规范和某一款解释器是两回事。这套文档读的是解释器本身：CPython 官方仓库的 3.14 分支（当前稳定维护线），检出于 2026-10-04，commit `66df30d15c9052785ed6463663e70d38107a9edf`，版本串 `3.14.8+`（`Include/patchlevel.h:27`）。全套引用都带 `文件:行号`，行号对应该 commit；分支后续提交会让行号漂移，但文件和函数名长期稳定。

::: tip 阅读方式
浅克隆官方仓库即可跟进整套文档：

```bash
git clone --depth 1 --branch 3.14 https://github.com/python/cpython.git
```

遇到拿不准的结论，直接跳到引用的行看原文，别信二手转述，包括本文。
:::

## 源码结构与构建

顶层目录各管一摊：

| 目录 | 职责 |
| --- | --- |
| `Include/` | 头文件。顶层是稳定 C API，`Include/cpython/` 是私有对象布局，`Include/internal/` 只许解释器内部包含 |
| `Objects/` | 内置类型实现：`dictobject.c`、`listobject.c`、`unicodeobject.c`、`typeobject.c` 等 |
| `Python/` | 解释器核心：求值循环 `ceval.c`、编译器 `codegen.c`、生命周期 `pylifecycle.c`，以及标准库的 C 半边（`sysmodule.c`、`import.c`、`gc.c`） |
| `Modules/` | 扩展模块与另一些 C 底座：`main.c`（命令行入口）、`gcmodule.c`（gc 模块的 Python 面） |
| `Lib/` | 纯 Python 标准库，`importlib/_bootstrap*.py` 是 import 系统的 Python 半边 |
| `Parser/` | 词法器 `lexer/`、分源分派 `tokenizer/`、由语法生成的 `parser.c` |
| `Grammar/` | PEG 语法定义 `python.gram` |
| `Programs/` | 可执行文件的 `main()`，真正的入口只有十几行 |
| `Tools/` | 构建期代码生成器：`cases_generator/` 从 `bytecodes.c` 生成求值代码 |
| `Doc/` | 文档与稳定 ABI 清单（`Doc/data/stable_abi.dat`） |

最小构建就是 README 写的四行（`README.rst:53`）：

```bash
./configure
make
make test
sudo make install
```

`--with-pydebug` 得到带断言和引用计数校验的调试版，支持在源码目录外构建（`README.rst:87`）。要发布用的版本，`--enable-optimizations` 打开 PGO（`README.rst:94`），对应的 make 目标是 `profile-opt`（`Makefile.pre.in:877`），LTO 用 `--with-lto`（`README.rst:129`）。

从敲下 `python` 到你的代码跑起来，入口链是：`Programs/python.c:15` 的 `main()` 调 `Py_BytesMain`（`Modules/main.c:886`），后者进 `pymain_main`（`Modules/main.c:858`）完成 `pymain_init`（`Modules/main.c:36`）后交给 `Py_RunMain`（`Modules/main.c:833`）。`Py_RunMain` 先跑初始化再跑用户代码：初始化分两步，`pyinit_core`（`Python/pylifecycle.c:1092`）建解释器核心状态，`pyinit_main`（`Python/pylifecycle.c:1404`）装好 `sys`、`builtins` 和 import 机制；然后 `pymain_run_python`（`Modules/main.c:660`）按命令行决定执行脚本、`-c`、`-m` 还是进入 REPL。嵌入 CPython 的程序走同一条链，只是从 `Py_InitializeEx`（`Python/pylifecycle.c:1457`）开始。

## 章节导览

本页之后的八个子页按「数据怎么摆、类型怎么查、代码怎么跑、内存怎么收、线程怎么切、模块怎么进」展开，行号口径与本页一致：

| 子页 | 内容 |
| --- | --- |
| [核心数据结构](/internals/object-model) | `PyObject` 对象头、引用计数与不死对象，dict/list/str 三大容器的内存布局 |
| [类型系统与属性查找](/internals/type-system) | `tp_*` 槽虚表、slotdefs 映射、属性查找顺序、MRO 缓存与描述符落点 |
| [解释器主循环](/internals/eval-loop) | 字节码分发的三种模式、`bytecodes.c` 指令定义、自适应特化与 tier-2/JIT |
| [编译管线](/internals/compiler-pipeline) | 词法、PEG 解析、AST 预处理、符号表、代码生成、CFG 优化与汇编 |
| [内存管理](/internals/memory-management) | 引用计数、pymalloc 三级池、分代 GC 的阈值与算法 |
| [GIL 与线程模型](/internals/gil-threading) | GIL 实现与切换间隔、线程状态、自由线程构建的布局变化 |
| [import 机制与模块对象](/internals/import-system) | C/Python 双半边、加载调用链、pyc 缓存校验、模块对象本质 |
| [CPython 与标准实现的边界](/internals/implementation-boundary) | `sys.implementation`、稳定 ABI、语言规范与实现细节的分界 |

建议顺序：先读本页与核心数据结构，再按兴趣进——关心性能看解释器主循环和编译管线，关心调试看内存管理，关心多线程看 GIL 与线程模型。
