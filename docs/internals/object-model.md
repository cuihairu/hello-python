---
description: PyObject 对象头、引用计数与不死对象，dict 紧凑哈希表、list 指针数组、str 四种形态的内存布局，引用带文件行号。
---

# 核心数据结构：PyObject 与三大容器

行号对应 3.14 分支 commit `66df30d15c9052785ed6463663e70d38107a9edf`（2026-10-04 检出）；克隆方式与阅读前提见[总览](/internals/cpython-source)。

## 一切对象的头

`PyObject` 只有两个成员（`Include/pytypedefs.h:18`，结构体在 `Include/object.h:110`）：引用计数和类型指针。所有 Python 对象的第一个字段都是它，`PyObject_HEAD` 宏（`Include/object.h:60`）负责把这十六字节放在每个类型结构体的开头，所谓「继承」就是手工保证内存布局前缀一致。变长对象再多一个长度字段，即 `PyVarObject`（`Include/object.h:169`），`list`、`tuple`、`str` 都以它开头。

引用计数头里有 3.12 之后最重要的变化：不死对象。`Py_INCREF` 是个内联函数（`Include/refcount.h:252`），64 位构建下先查计数是否已达 `_Py_IMMORTAL_INITIAL_REFCNT`（3 左移 30 位，`Include/refcount.h:49`），达到就直接返回（`Include/refcount.h:283`）。`None`、`True`、小整数这类静态对象用 `PyObject_HEAD_INIT` 初始化时就带上这个计数（`Include/object.h:65`），从此增减引用都是空操作。判断条件是符号位：`_Py_IsImmortal` 只看计数最高位是否为 1（`Include/refcount.h:125`）。

`Py_DECREF`（`Include/refcount.h:327`）把计数减到零时调用该类型的 `tp_dealloc`（`Include/object.h:327` 的注释说明了这个约定）。引用计数是即时回收，环状引用它管不了，[内存管理](/internals/memory-management)一节的分代 GC 补这个洞。

自由线程构建（无 GIL 实验版）下 `PyObject` 换了布局（`Include/object.h:152`）：线程 ID、每对象互斥锁、本地计数加共享计数拆成两组字段，本节后面引用计数逻辑在这套布局下另有分支。默认构建不带这些。

## dict：紧凑哈希表

`PyDictObject` 三个业务字段（`Include/cpython/dictobject.h:11`）：`ma_used` 是元素数，`ma_keys` 指向共享的键表，`ma_values` 为 `NULL` 时表示键值同存于 `ma_keys`（combined 表，实例 `__dict__` 之外都是这种）；非 `NULL` 时键表共享、值另存（split 表，类的实例属性用这种）。

键表 `PyDictKeysObject`（`Include/internal/pycore_dict.h:179`）分三段：控制字段、哈希索引数组 `dk_indices`、紧随其后的条目数组。索引数组按表大小选宽度，`dk_log2_size` 以 2 的幂记表长，索引字节宽 1/2/4/8 随表长切换。条目数组按插入序紧凑排列，索引数组里存的是条目下标。这就是「紧凑 dict」：遍历按插入序走条目数组，不用看哈希桶。

开放寻址的探测序列在 `Objects/dictobject.c:344` 的注释里：`j = (5*j) + 1 + perturb`，`perturb` 从哈希值开始每次右移（`Objects/dictobject.c:348`），初始探测入口在 `Objects/dictobject.c:984`。统一入口 `_Py_dict_lookup`（`Objects/dictobject.c:1248`）按键表种类分派：全 unicode 键表走无比较的指针相等的快速路径，其他键才走通用比较。

两个常数决定扩容节奏：负载上限 `USABLE_FRACTION(n) = n*2/3`（`Objects/dictobject.c:543`），超过三分之二就 `dictresize`（`Objects/dictobject.c:383`）；新容量按 `GROWTH_RATE(d) = ma_used*3`（`Objects/dictobject.c:590`）估算再取 2 的幂。

## list：指针数组

`PyListObject`（`Include/cpython/listobject.h:5`）就是一个 `PyObject**` 数组加两个长度：`ob_size` 是当前元素数，`allocated` 是已分配容量，二者满足 `0 <= ob_size <= allocated`。增长走 `list_resize`（`Objects/listobject.c:108`），超额分配公式是 `newsize + newsize>>3 + 6` 再向 4 对齐（`Objects/listobject.c:133`），大约 12.5% 的余量。`append` 摊还 O(1) 靠的就是这个公式。

## str：四种形态一张结构

字符串是 CPython 里布局最讲究的类型。`PyASCIIObject`（`Include/cpython/unicodeobject.h:54`）头部的注释列出了四种形态：compact ASCII、compact 非 ASCII、legacy（子类实例）。核心是 `state` 位域里的 `kind`：1/2/4 字节编码按内容自动选，纯 ASCII 用 1 字节，含 BMP 外字符才用 4 字节。compact 形态下字符数据紧跟结构体同一块内存，零拷贝访问；只有 `str` 子类实例走 legacy 布局，结构和数据分两块（`Include/cpython/unicodeobject.h:168` 与 `:176`）。

新字符串由 `PyUnicode_New`（`Objects/unicodeobject.c:1376`）按最大码点定宽度分配。驻留（interning）是每解释器一个字典（`Objects/unicodeobject.c:267`），标识符和常量字符串进字典后 `state.interned` 置位，配合不死机制让属性查找可以只比指针。

对象头上的类型指针指向 `PyTypeObject`，[类型系统与属性查找](/internals/type-system)一节展开这张「虚表」。
