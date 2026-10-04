# CPython 源码解析

Python 语言规范和某一款解释器是两回事。这份文档读的是解释器本身：CPython 官方仓库的 3.14 分支（当前稳定维护线），检出于 2026-10-04，commit `66df30d15c9052785ed6463663e70d38107a9edf`，版本串 `3.14.8+`（`Include/patchlevel.h:27`）。文中所有引用都带 `文件:行号`，行号对应该 commit；分支后续提交会让行号漂移，但文件和函数名长期稳定。

::: tip 阅读方式
浅克隆官方仓库即可跟进本文：

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

## 核心数据结构：PyObject 与三大容器

### 一切对象的头

`PyObject` 只有两个成员（`Include/pytypedefs.h:18`，结构体在 `Include/object.h:110`）：引用计数和类型指针。所有 Python 对象的第一个字段都是它，`PyObject_HEAD` 宏（`Include/object.h:60`）负责把这十六字节放在每个类型结构体的开头，所谓「继承」就是手工保证内存布局前缀一致。变长对象再多一个长度字段，即 `PyVarObject`（`Include/object.h:169`），`list`、`tuple`、`str` 都以它开头。

引用计数头里有 3.12 之后最重要的变化：不死对象。`Py_INCREF` 是个内联函数（`Include/refcount.h:252`），64 位构建下先查计数是否已达 `_Py_IMMORTAL_INITIAL_REFCNT`（3 左移 30 位，`Include/refcount.h:49`），达到就直接返回（`Include/refcount.h:283`）。`None`、`True`、小整数这类静态对象用 `PyObject_HEAD_INIT` 初始化时就带上这个计数（`Include/object.h:65`），从此增减引用都是空操作。判断条件是符号位：`_Py_IsImmortal` 只看计数最高位是否为 1（`Include/refcount.h:125`）。

`Py_DECREF`（`Include/refcount.h:327`）把计数减到零时调用该类型的 `tp_dealloc`（`Include/object.h:327` 的注释说明了这个约定）。引用计数是即时回收，环状引用它管不了，第六节的 GC 补这个洞。

自由线程构建（无 GIL 实验版）下 `PyObject` 换了布局（`Include/object.h:152`）：线程 ID、每对象互斥锁、本地计数加共享计数拆成两组字段，本节后面引用计数逻辑在这套布局下另有分支。默认构建不带这些。

### dict：紧凑哈希表

`PyDictObject` 三个业务字段（`Include/cpython/dictobject.h:11`）：`ma_used` 是元素数，`ma_keys` 指向共享的键表，`ma_values` 为 `NULL` 时表示键值同存于 `ma_keys`（combined 表，实例 `__dict__` 之外都是这种）；非 `NULL` 时键表共享、值另存（split 表，类的实例属性用这种）。

键表 `PyDictKeysObject`（`Include/internal/pycore_dict.h:179`）分三段：控制字段、哈希索引数组 `dk_indices`、紧随其后的条目数组。索引数组按表大小选宽度，`dk_log2_size` 以 2 的幂记表长，索引字节宽 1/2/4/8 随表长切换。条目数组按插入序紧凑排列，索引数组里存的是条目下标。这就是「紧凑 dict」：遍历按插入序走条目数组，不用看哈希桶。

开放寻址的探测序列在 `Objects/dictobject.c:344` 的注释里：`j = (5*j) + 1 + perturb`，`perturb` 从哈希值开始每次右移（`Objects/dictobject.c:348`），初始探测入口在 `Objects/dictobject.c:984`。统一入口 `_Py_dict_lookup`（`Objects/dictobject.c:1248`）按键表种类分派：全 unicode 键表走无比较的指针相等的快速路径，其他键才走通用比较。

两个常数决定扩容节奏：负载上限 `USABLE_FRACTION(n) = n*2/3`（`Objects/dictobject.c:543`），超过三分之二就 `dictresize`（`Objects/dictobject.c:383`）；新容量按 `GROWTH_RATE(d) = ma_used*3`（`Objects/dictobject.c:590`）估算再取 2 的幂。

### list：指针数组

`PyListObject`（`Include/cpython/listobject.h:5`）就是一个 `PyObject**` 数组加两个长度：`ob_size` 是当前元素数，`allocated` 是已分配容量，二者满足 `0 <= ob_size <= allocated`。增长走 `list_resize`（`Objects/listobject.c:108`），超额分配公式是 `newsize + newsize>>3 + 6` 再向 4 对齐（`Objects/listobject.c:133`），大约 12.5% 的余量。`append` 摊还 O(1) 靠的就是这个公式。

### str：四种形态一张结构

字符串是 CPython 里布局最讲究的类型。`PyASCIIObject`（`Include/cpython/unicodeobject.h:54`）头部的注释列出了四种形态：compact ASCII、compact 非 ASCII、legacy（子类实例）。核心是 `state` 位域里的 `kind`：1/2/4 字节编码按内容自动选，纯 ASCII 用 1 字节，含 BMP 外字符才用 4 字节。compact 形态下字符数据紧跟结构体同一块内存，零拷贝访问；只有 `str` 子类实例走 legacy 布局，结构和数据分两块（`Include/cpython/unicodeobject.h:168` 与 `:176`）。

新字符串由 `PyUnicode_New`（`Objects/unicodeobject.c:1376`）按最大码点定宽度分配。驻留（interning）是每解释器一个字典（`Objects/unicodeobject.c:267`），标识符和常量字符串进字典后 `state.interned` 置位，配合不死机制让属性查找可以只比指针。

## 对象模型与类型系统

### tp_* 槽就是虚表

`PyTypeObject`（`Include/cpython/object.h:148`）把一个类型能干的事全部摊平成 C 函数指针：`tp_dealloc`（`:155`）管销毁，`tp_call`（`:172`）让实例可调用，`tp_descr_get`/`tp_descr_set`（`:210`、`:211`）实现描述符协议，`tp_new`（`:215`）管创建，`tp_mro`（`:219`）存方法解析序。手写扩展类型就是填这张表。

Python 层的 dunder 和 C 层槽的对应关系不靠魔法，靠 `slotdefs[]` 一张静态表（`Objects/typeobject.c:10969`）。类定义或修改 `__init__` 这类名字时，`update_one_slot`（`Objects/typeobject.c:11308`）查表把对应槽改成转发函数；`fixup_slot_dispatchers`（`Objects/typeobject.c:3700`）在 `PyType_Ready` 流程里批量做这件事。转发函数是 `slot_tp_getattr_hook` 这类通用入口（`Objects/typeobject.c:10390`），它先查实例字典再走类型 MRO，找不到才调 Python 层的 `__getattr__`。所以「给类加 `__len__` 会不会立刻生效」这类问题，答案是会：赋值走 `type_setattro`，若是 dunder 名就同步改槽。

类型本身也是对象，`PyType_Type` 在 `Objects/typeobject.c:6736`，`type` 的元类能力就来自它也填了同一张表。

### 属性查找：两次查表，数据描述符优先

类属性访问的完整顺序在 `_Py_type_getattro_impl`（`Objects/typeobject.c:6103`）：

1. 在元类型上查 `name`，若命中数据描述符（实现了 `tp_descr_set`）立刻调用返回；
2. 否则在本类型及其基类的 `tp_dict`（经 MRO）上查 `name`，命中且带 `tp_descr_get` 就调用（`Objects/typeobject.c:6149`），命中但无描述符就直接返回；
3. 兜底回到元类型上的非数据描述符或普通属性，最后抛 `AttributeError`。

实例属性访问走 `PyObject_GenericGetAttrWithDict`（`Include/cpython/object.h:311`）：先查类型 MRO，命中数据描述符优先；再查实例 `__dict__`；类型上命中非数据描述符时才调用它。这条优先级就是「`property` 压过同名实例属性、实例属性压过普通方法」的出处。

MRO 查找本身有缓存：`_PyType_Lookup`（`Objects/typeobject.c:5972`）进到 `_PyType_LookupStackRefAndVersion`（`Objects/typeobject.c:5878`），按类型和名字哈希进 per-type 缓存表，命中条件带 `tp_version_tag` 版本号；任何类型修改会让版本号失效，下次重查。

### 描述符在 C 层的落点

描述符协议在 Python 层是 `__get__`/`__set__`/`__delete__` 三个方法，C 层的落点是 `tp_descr_get`/`tp_descr_set` 两个槽。常见的落点实例：

- 普通函数：`func_descr_get`（`Objects/funcobject.c:1282`），经属性访问时把函数和实例绑成 `PyMethod`，这就是「方法自动绑定 self」的全部机制，`PyFunction_Type` 在 `:1325` 填了这个槽；
- `property`：`property_descr_get`（`Objects/descrobject.c:1661`），转发到存好的 fget；
- `classmethod`/`staticmethod`：类型定义也在 `Objects/funcobject.c`（`:1684`、`:1932`），区别只在绑定时取类还是忽略实例。

受限 API（`Py_LIMITED_API`）下不允许直接写 `PyTypeObject` 字面量，替代路径是 `PyType_FromSpec`（`Objects/typeobject.c:5432`），用 `PyType_Spec` 描述槽位由运行时拼装。类型标志位集中在 `Include/object.h:543` 起：`Py_TPFLAGS_HEAPTYPE`（`:546`）标记堆上创建的类型，`Py_TPFLAGS_BASETYPE`（`:549`）允许被继承。

## 解释器主循环

### 分发：三种模式编译期二选一

字节码求值主体是 `_PyEval_EvalFrameDefault`（`Python/ceval.c:1148`）。函数开头备好局部「寄存器」：`next_instr` 指向下一条指令，`stack_pointer` 指向值栈顶。指令体不在 `ceval.c` 里手写，函数尾部直接包含生成的 `generated_cases.c.h`（`Python/ceval.c:1257`）；尾调用构建下这份生成物改在函数外包含（`Python/ceval.c:1124`），指令体编成一个个独立函数。

分发有三种模式，由 `Python/ceval_macros.h` 在编译期决定：

- 尾调用模式（`--with-tail-call-interp` 显式开启，`configure.ac:7282`）：每条指令编成独立函数，`TARGET(op)` 展开为 `Py_PRESERVE_NONE_CC PyObject *_TAIL_CALL_##op(...)`（`Python/ceval_macros.h:95`），`DISPATCH_GOTO` 是带 `[[clang::musttail]]` 的尾调用（`:85`、`:96`），要求 clang 或 GCC 15 的 `preserve_none`/`musttail` 支持；
- computed goto（GCC/clang 默认）：`TARGET` 是标签，`DISPATCH_GOTO` 是 `goto *opcode_targets[opcode]`（`Python/ceval_macros.h:116`），跳表是生成的 `opcode_targets.h`；
- switch 兜底（`Python/ceval_macros.h:122`），给不认识这两种语法的编译器。

`USE_COMPUTED_GOTOS` 默认值按编译器能力自动定（`Python/ceval_macros.h:51`）。无论哪种模式，`DISPATCH()` 宏（`Python/ceval_macros.h:161`）都是「取下一条指令、跳过去」。

### 指令定义在 bytecodes.c，C 文件是生成物

人写指令的地方是 `Python/bytecodes.c`，文件头注释写明它由 `Tools/cases_generator/` 消费（`Python/bytecodes.c:1`）。`inst(名字, 栈效果)` 定义一条完整指令，`op(...)` 定义可复用的部件（`Python/bytecodes.c:51`）。`make` 里有对应的再生规则（`Makefile.pre.in:2143`），一次生成六个产物：操作码编号、跳表、uop 编号、Python 侧元数据、`generated_cases.c.h` 和 tier-2 的 `executor_cases.c.h`。

两条值得认识的指令：

- `_CHECK_PERIODIC`（`Python/bytecodes.c:155`）：检查求值中断位，信号、GIL 让位请求都从这里进主循环；
- `LOAD_FAST` 被 `replicate(8)` 复制了八份（`Python/bytecodes.c:277`），让跳表对不同位置的局部变量加载分布更密，这是 3.14 的新花样。

### 自适应特化：热路径换专用指令

通用指令执行时带着一个 16 位倒计时计数器，结构是 12 位计数加 4 位退避档位（`Include/internal/pycore_backoff.h:16`）。以 `BINARY_OP` 为例，生成代码先读指令内联缓存槽里的计数器（`Python/generated_cases.c.h:39`），没数满就 `ADVANCE_ADAPTIVE_COUNTER` 继续用通用路径；数满则调 `_Py_Specialize_BinaryOp`（`Python/specialize.c:2578`）把这条指令原地改写成专用版本，之后命中 `BINARY_OP_ADD_FLOAT`（`Python/generated_cases.c.h:84`）、`BINARY_OP_ADD_INT`（`:142`）、`BINARY_OP_ADD_UNICODE`（`:202`）这类入口，直接做类型特化运算。`LOAD_ATTR` 同理，特化入口在 `_Py_Specialize_LoadAttr`（`Python/specialize.c:1345`），实例属性、类属性、slot 各有专用指令。

退避机制的意义在失败重试：特化发现类型又变了，计数器按指数退避重置，避免在多态调用点上反复特化反复作废。

3.14 还留着 tier-2 微指令优化器和可选 JIT：`Python/optimizer.c` 生成执行器，求值循环里 `_Py_TIER2`/`_Py_JIT` 分支接管热代码（`Python/ceval.c:1244`、`:1266`），JIT 要 `--enable-experimental-jit` 才编译（`configure.ac:2845`），默认构建两者都不启用。

## 编译管线

从源码到可执行字节码的流水线，每一步都有明确的文件：

| 阶段 | 位置 |
| --- | --- |
| 词法 | `Parser/lexer/lexer.c:1578` 的 `_PyTokenizer_Get` 逐 token 推进；按输入源分派到 `Parser/tokenizer/` 下的 string/utf8/file/readline 四种实现（如 `Parser/tokenizer/string_tokenizer.c:131`） |
| 语法分析 | PEG 解析器，语法定义 `Grammar/python.gram`，解析器 `Parser/parser.c` 是生成物（入口 `_PyPegen_parse` 在 `:38121`），驱动逻辑在 `Parser/pegen.c:1055` |
| AST | 节点定义 `Parser/Python.asdl`，C 结构在生成的 `Python/Python-ast.c`；公共 API `_PyParser_ASTFromString`（`Parser/peg_api.c:6`），`PyRun_StringFlags` 一类入口经由它（`Python/pythonrun.c:1282`） |
| AST 预处理 | `_PyAST_Preprocess`（`Python/ast_preprocess.c:971`）：常量折叠（`fold_binop`，`:369`）、docstring 摘除、PEP 765 的 return-in-finally 检查（`:15`）；编译器入口 `Python/compile.c:139` 第一步就调它 |
| 符号表 | `_PySymtable_Build`（`Python/symtable.c:413`）扫出每个作用域的名字绑定，闭包和 cell 变量在这里定型 |
| 代码生成 | `_PyCodegen_Module`（`Python/codegen.c:870`）把 AST 直译成指令序列；`compiler_mod`（`Python/compile.c:853`）是这条线的调度者 |
| CFG 优化 | 指令序列转成基本块图（`_PyCfg_FromInstructionSequence`，`Python/flowgraph.c:3954`），做死块消除、跳转穿透等块级优化（`optimize_cfg`，`:2580`；`_PyCfg_OptimizeCodeUnit`，`:3689`），再转回线性序列（`:4057`） |
| 汇编 | `_PyAssemble_MakeCodeObject`（`Python/assemble.c:779`）配平常量池、算跳转偏移，产出代码对象 `_PyCode_New`（`Objects/codeobject.c:718`） |
| 首次执行前 | `_PyCode_Quicken`（`Python/specialize.c:459`）把自适应计数器种进 `co_code_adaptive`（调用点在 `Objects/codeobject.c:587`） |

对 Python 使用者的直接推论：`compile()` 拿到的是这套管线的产物；字节码随版本变，因为它是这条流水线当前的输出，不是语言承诺。

## 内存管理

### 引用计数为主

绝大多数对象生命周期由引用计数决定，`Py_INCREF`/`Py_DECREF`（`Include/refcount.h:252`、`:327`）内联在热路径里，减到零立刻调 `tp_dealloc` 释放。不死对象跳过全部计数（见第二节）。这套设计的收益是即时性和确定性，代价是每次赋值都有一次原子级别开销，环状引用需要第二套机制。

### pymalloc：为小对象设计的池

对象分配走分层：请求超过 512 字节直接进 `malloc`，以下走 pymalloc（阈值 `SMALL_REQUEST_THRESHOLD`，`Include/internal/pycore_obmalloc.h:157`）。pymalloc 三级管理：arena 256 KiB（`Include/internal/pycore_obmalloc.h:213`，可配 1 MiB，见 `:211`）、pool 4 KiB（`:230`，须等于系统页大小）、block 16 字节对齐（`:132`）。入口 `_PyObject_Malloc`（`Objects/obmalloc.c:2329`）进 `pymalloc_alloc`（`:2281`）：按请求大小找对应尺寸类，从该尺寸的 pool 里切一块；pool 用尽就向 arena 要新页，arena 耗尽才真正向系统要内存（`:1974`）。地址到 arena 的反查（free 时需要）走 arena 索引树（`:1779`）。同尺寸 block 连续存放，碎片被限制在 pool 内部。

### 分代 GC：只管环

带 `PyGC_Head` 前缀的对象才受 GC 管（`Include/internal/pycore_interp_structs.h:161`，头结构在 `:169`），即可能成环的容器类型。GC 头挂在对象内存前面，`_Py_AS_GC` 用负偏移取到（`Include/internal/pycore_gc.h:17`）。

三代结构，默认阈值 2000/10/10（`Include/internal/pycore_interp_structs.h:271`）。注意不是老资料里的 700：`gc.get_threshold()` 在本分支如实返回 `(2000, 10, 10)`，运行时可改（`Modules/gcmodule.c:163`）。触发逻辑在 `gc_select_generation`（`Python/gc.c:1258`）：从老到新找第一个计数超阈值的代，其中全量收集额外要求「上一轮晋升的待处理对象 / 长活对象总数」超过 25%（`Python/gc.c:1270` 起的长注释给了这条启发式的推导，防止全量收集随长活对象数线性退化）。

算法本体在 `gc_collect_main`（`Python/gc.c:1313`）：先把本代所有对象引用数减一（subtract_refs），再从外部根遍历，引用数没恢复到零的就是不可达（`move_unreachable`，注释见 `Python/gc.c:32`、`:190`），不可达且无 `__del__` 的直接释放，有 `__del__` 的进 `gc.garbage`。存活的晋升到老一代。手动入口 `PyGC_Collect`（`Python/gc.c:1671`），分配侧挂钩在 `_PyObject_GC_New`（`Python/gc.c:1907`），每次分配给第零代计数加一（`:1865`）。

分工判断：引用计数负责九成以上的回收，分代 GC 只为环存在。CPython 不做移动式压缩，堆碎片靠 pymalloc 的尺寸类池缓解，这是它和 JVM 类运行时的根本差异。

## GIL 与线程模型

GIL 的实现比传闻朴素。`_gil_runtime_state`（`Include/internal/pycore_gil.h:22`）核心就一个 `locked` 整数加互斥锁和条件变量。`Python/ceval_gil.c:13` 起的实现注释把机制讲全了：持锁线程的求值循环周期性检查中断位，等待线程在条件变量上等满 `interval` 微秒后设置让位请求；默认切换间隔 5000 微秒（`Python/ceval_gil.c:147`），即 `sys.getswitchinterval()` 的 5 毫秒。抢锁入口 `take_gil`（`Python/ceval_gil.c:285`），放锁入口 `drop_gil`（`:216`）。

对 Python 代码的含义：切换点只在字节码边界和显式释放点，单个字节码执行多长时间 GIL 就被占多久（`Python/ceval_gil.c:34` 的注释承认 opcode 耗时不可控）。所以纯 Python 的 CPU 密集循环里，5 毫秒切换间隔只能近似成立。C 扩展在进入阻塞系统调用前应主动 `drop_gil`，这是 threading 模块在 IO 场景能真并行的原因。

线程状态方面，每个 OS 线程对应一个 `PyThreadState`；C 扩展最常用的 `PyGILState_Ensure`（`Python/pystate.c:2894`）负责给当前线程补建线程状态并抢 GIL，配对的 `Release` 归还。信号处理依赖同一个中断位：求值循环里的 `_CHECK_PERIODIC`（`Python/bytecodes.c:155`）是信号得以在纯 Python 代码中响应的唯一通道。

自由线程构建是 3.14 的实验特性，需要 `--disable-gil` 显式配置（`configure.ac:1728`）。对象头换成线程 ID 加双计数布局（`Include/object.h:152`），容器内部用对象锁和延迟回收保护：dict 在被其他线程首次读取时标记 shared（`Objects/dictobject.c:1315`）。默认构建仍是带 GIL 的解释器，本文其余引用均以默认构建为准。

## import 机制与模块对象

import 系统是 C 和 Python 各写一半的典型。C 半边（`Python/import.c`）提供 `_imp` 内建接口：内建模块表 `_PyImport_Inittab`（声明在 `Python/import.c:58`，本体在构建生成的 `config.c`，逐项匹配在 `:2420`）、动态扩展加载（`import_find_extension` 流程注释在 `:721`）、按模块加锁的全局簿记（`:126`）。Python 半边在 `Lib/importlib/_bootstrap.py` 和 `_bootstrap_external.py`，启动时以冻结模块形式内嵌（`Python/frozen.c:70` 起的表里有 `_frozen_importlib`），由 `pyinit_main` 阶段安装（`Python/pylifecycle.c:472`、`:927`）。

Python 层调用链：

1. `import` 语句进 `builtin___import___impl`（`Python/bltinmodule.c:282`），转发给 importlib 的 `__import__`（`Lib/importlib/_bootstrap.py:1473`）；
2. `_gcd_import`（`:1394`）规整相对导入后进 `_find_and_load`（`:1360`）：先查 `sys.modules`，命中且不在初始化中就直接返回，这条快路径让重复 import 接近零成本；
3. 未命中则加模块锁，进 `_find_and_load_unlocked`（`:1308`）遍历 `sys.meta_path` 找 spec；
4. `_load_unlocked`（`:914`）先 `module_from_spec` 建模块对象，**先放进 `sys.modules` 再执行模块代码**，执行失败从 `sys.modules` 删除并抛错。先入表再执行是为了让循环引用能看到半成品模块。

文件模块的加载在 `_bootstrap_external.py`：`SourceFileLoader`（`:966`）的 `get_code`（`:1015`）读源码或缓存的 pyc。pyc 魔数 `MAGIC_NUMBER`（`:224`）绑死字节码版本，`_classify_pyc`（`:424`）校验魔数不匹配就重新编译；时间戳模式再比源文件 mtime 和大小（`_validate_timestamp_pyc`，`:457`）；缓存路径由 `cache_from_source`（`:239`）生成 `__pycache__` 布局。

模块对象本体很薄：`PyModuleObject` 主要就是一个名字加一个字典，`PyModule_NewObject`（`Objects/moduleobject.c:128`）创建，模块的 `__dict__` 就是它的全部状态，`__name__`、`__spec__`、`__loader__` 都是这个字典里的键。属性访问走 `_Py_module_getattro`（`Objects/moduleobject.c:1140`），支持模块级 `__getattr__` 兜底。

## CPython 与标准实现的边界

「Python 是什么」由语言参考定义（本仓库 `Doc/reference/`），CPython 是这份规范的一份实现。哪些行为属于这份实现而不属于语言，源码自己会标：

`sys.implementation` 是官方划界机制。名字硬编码为 `"cpython"`（`Python/sysmodule.c:3629`），缓存标签拼成 `cpython-314`，字段在 `make_impl_info`（`Python/sysmodule.c:3641`）填充。判断「代码跑在哪款解释器上」应当用它，而不是平台探测。

标准库几乎不为其他实现写特判，例外集中在 `Lib/platform.py`：`python_implementation()`（`:1249`）按 `sys.version` 前缀识别 Jython（`:1182`）和 PyPy（`:1193`）。除此之外，PyPy、IronPython、GraalPy、MicroPython、RustPython 的任何代码都不在本仓库；PEP 11（平台支持政策）的编号在 3.14 分支只出现在 `Misc/HISTORY` 历史日志里（如 `Misc/HISTORY:4559`），现行代码与语言文档零引用。

稳定 ABI 是给扩展作者划的线。`Py_LIMITED_API` 定义后，`Include/Python.h` 按版本条件裁剪包含（`Include/Python.h:36`、`:42`），全部私有布局被隔离进 `Include/cpython/` 并以 `#ifndef Py_LIMITED_API` 包裹（如 `Include/cpython/code.h:3`）；受限模式下建类型只有 `PyType_FromSpec` 一条路（`Objects/typeobject.c:5432`）。遵守这条线的扩展理论上可跑在其他实现上，承诺清单在 `Doc/data/stable_abi.dat`。

一些广为人知的机制，官方文档明说是实现细节而非语言承诺：不死对象（`Doc/glossary.rst:777`）。字节码格式、`co_code_adaptive`、特化统计、GIL 切换参数同理，都是 CPython 私有，其他实现无一兼容。

边界之外还有一层实用判断：读 CPython 源码得到的结论，分为「语言规范」和「当前实现」两类。对象模型、描述符优先级属于前者，换实现大概率一致；自适应特化、pymalloc 的池参数、2000 的 GC 阈值属于后者，任何版本都可能变。本文的引用方式（文件加行号）就是为了让这两类结论都能被复核。
