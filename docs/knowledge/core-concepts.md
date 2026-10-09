---
description: 按六大主题收拢站内概念与要点，每条挂回原章节页。
---

# 核心概念

站内各章的要点按主题重排。每条一句话说清是什么，后面挂回原页，细节去原页看。

## 入门基础

- **缩进即语法**：Python 用缩进划代码块，不用花括号；官方风格 4 空格，禁止 tab 与空格混用，缩进错报 `IndentationError`。→ [语法基础](/basics/syntax)
- **文档字符串**：三引号字符串放在模块、函数、类的第一行即 docstring，运行时经 `__doc__` 访问，也是 `help()` 的内容来源。→ [语法基础](/basics/syntax)
- **海象运算符**：`:=`（3.8+）在表达式内部赋值，服务于「先算后判」的写法。→ [语法基础](/basics/syntax)
- **动态强类型**：变量不声明类型，但类型不做隐式转换，`"1" + 1` 直接报错。→ [变量与数据类型](/basics/variables-and-types)
- **可变性分野**：`int`/`str`/`tuple` 不可变，任何「改」都返回新对象；`list`/`dict`/`set` 原地改，所有引用一起变。→ [变量与数据类型](/basics/variables-and-types)
- **`is` 与 `==`**：`is` 比对象身份，`==` 比值；判 `None` 用 `is`，其余一律 `==`。小整数缓存与常量折叠让 `is` 偶尔「碰巧为真」，不能依赖。→ [变量与数据类型](/basics/variables-and-types)
- **浮点与精确计算**：IEEE 754 表示不了 0.1，浮点比较设容差；金额等精确场景换 `decimal.Decimal`，分数用 `fractions.Fraction`。→ [变量与数据类型](/basics/variables-and-types)
- **循环 `else`**：`for`/`while` 正常走完（没被 `break` 打断）才执行 `else`，用来替代「查质数」类场景的布尔标志。→ [控制流](/basics/control-flow)
- **`match` 模式匹配**：3.10+ 的结构化解构，支持序列、映射、类模式与守卫；`case _` 通配必须放最后。→ [控制流](/basics/control-flow)
- **参数五形态**：按顺序是位置参数、默认参数、`*args`、仅关键字参数、`**kwargs`；调用端 `*`/`**` 反向解包。→ [函数](/basics/functions)
- **LEGB 与闭包**：名字解析按 Local→Enclosing→Global→Builtin；闭包捕获变量本身而非当时的值，重绑定外层用 `nonlocal`。→ [函数](/basics/functions)
- **仅位置与仅关键字**：`/` 之前的参数只能按位置传，`*` 之后的只能按关键字传，标准库用它保护参数名不进 API。→ [函数](/basics/functions)
- **环境三层分工**：pyenv 管多版本、venv 管项目隔离、pip 管包安装；命令一律写 `python3 -m pip` / `python3 -m venv`，绑定当前解释器。→ [环境搭建](/basics/setup)

## 数据结构

- **list 与 tuple 的分野**：同为有序序列，list 可变、tuple 不可变；动态集合用 list，固定结构记录用 tuple。→ [列表与元组](/datastructures/list-tuple)
- **切片语义**：`seq[start:stop:step]` 左闭右开、产生新对象、支持负数索引与步长；切片赋值可原地替换、插入、删除一段。→ [列表与元组](/datastructures/list-tuple)
- **引用与拷贝**：赋值只复制引用；浅拷贝（`[:]`、`copy()`）只拷一层，嵌套结构需 `copy.deepcopy`。→ [列表与元组](/datastructures/list-tuple)
- **命名元组**：`collections.namedtuple` 或 `typing.NamedTuple` 给记录加字段名，比裸下标可读。→ [列表与元组](/datastructures/list-tuple)
- **dict 保序**：3.7 起字典保持插入顺序；去重又保序用 `dict.fromkeys`，合并用 `|`（3.9+，右侧优先）。→ [字典与集合](/datastructures/dict-set)
- **安全取值**：缺键取值用 `get` 给默认值或 `setdefault` 顺带写入；分组用 `defaultdict`，计数用 `Counter`。→ [字典与集合](/datastructures/dict-set)
- **可哈希约束**：键必须实现 `__hash__` 且哈希值生命周期内不变——数字、字符串、字节、内容全可哈希的元组可以，list/dict/set 不行。→ [字典与集合](/datastructures/dict-set)
- **集合运算**：set 支持 `|` 并、`&` 交、`-` 差、`^` 对称差；`frozenset` 不可变、可作键。→ [字典与集合](/datastructures/dict-set)
- **四种推导式**：列表、字典、集合、生成器各有推导式，形状是「表达式 + for + 可选 if」；`if` 在 `for` 后是过滤，`if/else` 在表达式里是变换。→ [推导式、迭代器与生成器](/datastructures/iterators-generators)
- **迭代器协议**：可迭代对象实现 `__iter__`，迭代器额外实现 `__next__`；`for` 的底层就是「取迭代器、反复 `next`、直到 `StopIteration`」。→ [推导式、迭代器与生成器](/datastructures/iterators-generators)
- **生成器函数**：函数体含 `yield` 即变生成器，惰性产出、状态保留；`yield from` 委托子生成器，`send()`/`close()` 支持双向通信。→ [推导式、迭代器与生成器](/datastructures/iterators-generators)
- **生成器表达式 vs 列表推导式**：前者惰性、一次性消费、省内存；后者立即求值、可反复遍历、支持 `len` 与切片。→ [推导式、迭代器与生成器](/datastructures/iterators-generators)
- **itertools 算子库**：`chain`/`product`/`combinations`/`groupby`/`islice` 覆盖组合、分组、平铺、切片，全部内存友好。→ [标准库精选](/engineering/stdlib)
- **f-string 格式化**：3.6+ 首选，`=` 修饰符（3.8+）连表达式带值一起打，规格符 `:.2f`/`,`/`%`/对齐填充要熟；`format` 与 `%` 是历史写法。→ [字符串与格式化](/datastructures/string-formatting)
- **str 与 bytes**：`str` 是 Unicode 码点序列，`bytes` 是字节序列；进出边界显式 `encoding="utf-8"`，解码容错用 `errors` 参数。→ [字符串与格式化](/datastructures/string-formatting)

## 面向对象与进阶

- **类属性与实例属性**：类属性所有实例共享，实例赋值只写实例字典、遮蔽类属性；改共享计数器必须经类名。→ [面向对象](/advanced/oop)
- **`__new__` 与 `__init__`**：实例化先 `__new__` 建对象、再 `__init__` 初始化；属性查找顺序「实例字典 → 类字典 → 父类链」。→ [面向对象](/advanced/oop)
- **MRO 与 `super()`**：多继承按 MRO 从左到右查找，`super()` 沿 MRO 调用下一家，菱形继承里保证初始化只走一遍。→ [面向对象](/advanced/oop)
- **`@property`**：把方法伪装成属性，配 `@x.setter` 做校验，实现带封装、可演化的属性式访问。→ [面向对象](/advanced/oop)
- **名称改写**：单下划线 `_x` 是惯例私有；双下划线 `__x` 触发 name mangling 变 `_类名__x`，用于防子类无意覆盖。→ [面向对象](/advanced/oop)
- **`@classmethod` 与 `@staticmethod`**：前者接收类 `cls`、常用于替代构造器；后者既不收实例也不收类，就是类命名空间里的普通函数。→ [面向对象](/advanced/oop)
- **鸭子类型与 Protocol**：多态不要求共同父类，有需要的方法就能用；`typing.Protocol` 给静态检查器声明结构，运行时仍不强制。→ [面向对象](/advanced/oop)
- **运算符重载**：`+` 走 `__add__`、`==` 走 `__eq__`；实现 `__eq__` 通常要同时处理 `__hash__`，反向运算用 `__radd__` 一类。→ [魔法方法](/advanced/magic-methods)
- **容器协议**：`__len__`/`__getitem__`/`__setitem__`/`__delitem__`/`__contains__` 让对象表现得像序列，只实现 `__getitem__` 时 `for`/`in` 也能靠回退工作。→ [魔法方法](/advanced/magic-methods)
- **`__call__` 与 `__bool__`**：实现 `__call__` 的实例可像函数调用，做带状态的可调用对象；`__bool__` 定真值，缺省回退 `__len__`。→ [魔法方法](/advanced/magic-methods)
- **装饰器**：`@dec` 等价 `f = dec(f)`，接收函数返回函数；wrapper 签名一律 `*args, **kwargs`，必须加 `@functools.wraps` 保住元信息。→ [装饰器](/advanced/decorators)
- **带参数装饰器**：三层嵌套——外层收装饰器参数、中层收函数、内层收调用参数。→ [装饰器](/advanced/decorators)
- **`lru_cache`**：标准库记忆化装饰器，要求纯函数且参数可哈希；3.9+ 的 `functools.cache` 等价 `lru_cache(maxsize=None)`。→ [装饰器](/advanced/decorators)
- **异常四段结构**：`try` 包代码、`except` 按子类顺序匹配、`else` 在无异常时跑、`finally` 无论如何都跑。→ [异常处理](/advanced/exceptions)
- **异常链**：`raise NewError(...) from e` 保留原始上下文 `__cause__`；except 块里的裸 `raise` 原样重抛当前异常。→ [异常处理](/advanced/exceptions)
- **EAFP 与 LBYL**：Python 偏好 EAFP（直接做、错了接异常）而非 LBYL（先检查再做），前者更快且无「检查与使用之间状态改变」的窗口。→ [异常处理](/advanced/exceptions)
- **异常组**：3.11+ 的 `ExceptionGroup` 一次携带多个异常，`except*` 按类型分别处理，为并发批量失败而生。→ [异常处理](/advanced/exceptions)
- **with 协议**：`__enter__` 的返回值赋给 `as` 变量，`__exit__` 收异常三元组、返回真值即吞掉异常；异常路径下退出动作照样执行。→ [上下文管理器](/advanced/context-managers)
- **`@contextmanager`**：把「有 yield 的生成器」变成上下文管理器，yield 之前是 enter、之后是 exit，省掉样板类。→ [上下文管理器](/advanced/context-managers)
- **dataclass**：`@dataclass` 按类注解自动生成 `__init__`/`__repr__`/`__eq__`；可变默认用 `field(default_factory=...)`，派生与校验写 `__post_init__`。→ [dataclass](/advanced/dataclass)
- **dataclass 开关**：`frozen=True` 换不可变与可哈希，`order=True` 生成比较方法，`slots=True`（3.10+）省内存，`kw_only=True` 字段全仅关键字。→ [dataclass](/advanced/dataclass)
- **import 语义**：`import` 执行整个模块并绑定模块名，`from` 只绑定指定名字；发布 API 用 `__all__` 声明 `*` 白名单，日常别用 `import *`。→ [模块与包](/advanced/modules)
- **模块即单例**：模块首次导入执行一次后进 `sys.modules` 缓存，再次导入直接复用，天然是进程级单例。→ [模块与包](/advanced/modules)
- **`if __name__ == "__main__"`**：被导入时 `__name__` 是模块名，直接执行时是 `"__main__"`，这个开关让文件既能复用又能直接跑。→ [模块与包](/advanced/modules)
- **pathlib**：`Path` 把路径当对象，`/` 拼接，`glob`/`rglob` 找文件，`read_text`/`write_text` 一次性读写、大文件逐行迭代。→ [文件与 IO](/advanced/file-io)
- **原子写**：关键文件用「写临时文件 + `replace` 改名」实现原子替换，避免写一半断电留下截断文件。→ [文件与 IO](/advanced/file-io)
- **类型注解演进**：3.9+ 内建容器泛型 `list[int]`，3.10+ 联合 `X | Y`，3.12+ PEP 695 泛型；注解是静态契约，运行时不校验。→ [类型注解](/advanced/typing)
- **结构类型工具**：`TypedDict` 给字典键标类型，`Protocol` 做结构化子类型，`NewType` 区分同结构的不同语义，`Literal`/`Final` 限定取值与禁重绑。→ [类型注解](/advanced/typing)
- **静态检查工具链**：mypy 配置成熟、pyright/basedpyright 快、ruff 顺带覆盖部分类型规则；注解不检查等于没写。→ [类型注解](/advanced/typing)

## 并发

- **GIL**：CPython 同一时刻只有一个线程执行字节码，因为引用计数不是线程安全的；后果是 CPU 密集多线程无效、IO 密集才有效。→ [多线程与 GIL](/concurrency/threading)
- **Lock**：GIL 不等于线程安全，`+=` 这类「读-改-写」有竞争窗口，共享可变状态必须用 `with lock:` 保护。→ [多线程与 GIL](/concurrency/threading)
- **生产者-消费者**：线程间通信用 `queue.Queue`（内置等待通知，比手撸锁+条件变量可靠），结束用哨兵值通知。→ [多线程与 GIL](/concurrency/threading)
- **同步原语**：`Lock` 互斥、`RLock` 可重入、`Semaphore` 限流、`Event` 标志位、`Condition` 条件等待、`Barrier` 会合点。→ [多线程与 GIL](/concurrency/threading)
- **daemon 线程**：随主线程退出被强杀，只放后台杂务；正事必须非 daemon 并 `join`。→ [多线程与 GIL](/concurrency/threading)
- **协程**：`async def` 定义、`await` 挂起、`asyncio.run` 启动事件循环；无 `await` 的纯计算段会阻塞整个循环。→ [异步编程 asyncio](/concurrency/asyncio)
- **并发运行**：`asyncio.gather`（3.7+）与 3.11+ 的 `TaskGroup`（结构化并发）把协程排一起跑，总耗时约等于最慢那个。→ [异步编程 asyncio](/concurrency/asyncio)
- **超时与取消**：`asyncio.wait_for`/3.11+ 的 `asyncio.timeout` 加时限；取消是协作式的，在 `CancelledError` 里做清理。→ [异步编程 asyncio](/concurrency/asyncio)
- **阻塞调用三出路**：少量调用 `run_in_executor` 扔线程池、网络 IO 换异步库、定时用 `asyncio.sleep` 而非 `time.sleep`。→ [异步编程 asyncio](/concurrency/asyncio)
- **多进程绕开 GIL**：每个进程有独立解释器与 GIL，是 CPU 密集并行的标准答案；代价是进程创建与跨进程序列化更贵。→ [多进程 multiprocessing](/concurrency/multiprocessing)
- **进程池**：`Pool.map` 批量分发、`imap` 流式返回、`apply_async` 单个异步任务，按 CPU 核数自动分配。→ [多进程 multiprocessing](/concurrency/multiprocessing)
- **跨进程通信**：数据靠 pickle 序列化，`Queue` 走管道、`Pipe` 点对点；大量共享数据用 `shared_memory`（3.8+）或 `Manager`。→ [多进程 multiprocessing](/concurrency/multiprocessing)
- **启动方式**：`fork`（Linux 默认，快）、`spawn`（macOS/Windows 默认，干净可移植）、`forkserver`（先起干净进程再 fork）；跨平台项目显式设 spawn。→ [多进程 multiprocessing](/concurrency/multiprocessing)
- **三模型选型**：CPU 密集→多进程，IO 密集小并发→线程、大并发→协程，混合负载用「asyncio 调度 + executor 卸载」。→ [并发模型对比](/concurrency/concurrency-compare)

## 工程实践

- **collections**：`Counter` 计数、`defaultdict` 免分支、`deque` 两端 O(1) 队列、`namedtuple` 带字段元组。→ [标准库精选](/engineering/stdlib)
- **functools**：`lru_cache` 记忆化、`partial` 偏函数、`total_ordering` 补排序、`reduce` 归约。→ [标准库精选](/engineering/stdlib)
- **re 正则**：用 `r"..."` 原始字符串、编译复用、优先预定义类别；结构化文本优先专用解析器。→ [标准库精选](/engineering/stdlib)
- **json 与 datetime**：`json.dumps` 传 `ensure_ascii=False` 不转义中文；datetime 带时区比较才安全，3.12+ 有 `fromisoformat` 全格式解析与 `zoneinfo`。→ [标准库精选](/engineering/stdlib)
- **unittest 与 pytest**：unittest 零依赖、xUnit 风格；pytest 用普通函数 + `assert`、`fixture` 自动回收、`parametrize` 数据驱动，是社区标准。→ [测试](/engineering/testing)
- **测试替身**：stub 固定返回、spy 记录调用、mock 断言行为、fake 轻量真替身；标准库 `unittest.mock` 提供 `patch`。→ [测试](/engineering/testing)
- **覆盖率与 CI**：覆盖率只是线索，看未覆盖分支该不该测；CI 跑 `pytest -q`，版本矩阵用 GitHub Actions 的 `matrix`。→ [测试](/engineering/testing)
- **logging 分级**：DEBUG/INFO/WARNING/ERROR/CRITICAL 五级；`logger = logging.getLogger(__name__)` 让日志按模块分组、可独立调级。→ [日志与调试](/engineering/logging)
- **异常日志**：`logger.exception` 在 except 块里自动附堆栈；`extra` 附加结构化字段进采集系统。→ [日志与调试](/engineering/logging)
- **排障工具**：断点用 `breakpoint()`（3.7+）进 pdb；性能先 `timeit` 微基准、再 `cProfile` 画像，按 `ncalls`/`cumtime` 找热点。→ [日志与调试](/engineering/logging)
- **pyproject.toml**：PEP 621 标准化项目元数据，依赖、版本、构建后端集中在一个文件；`[project.scripts]` 声明命令行入口。→ [打包与发布](/engineering/packaging)
- **sdist 与 wheel**：源码包兜底、wheel 预构建优先分发；`python -m build` 构建，`twine check` 验证元数据。→ [打包与发布](/engineering/packaging)
- **版本策略**：语义化版本，破坏性变更升主版本、新功能升次版本、修复升修订号；也可用 `setuptools-scm` 从 git tag 派生。→ [打包与发布](/engineering/packaging)
- **PyPI 可信发布**：CI 里用 OIDC 免 token 上传；上传文件名永久占用，同版本号不可重复上传，发布前先走 TestPyPI。→ [打包与发布](/engineering/packaging)
- **依赖锁定**：手写直接依赖清单（带范围约束）+ `pip freeze` 全量锁定；`.venv/` 不进版本库，可复现靠锁文件。→ [虚拟环境与依赖管理](/engineering/environments)
- **现代依赖工具**：uv（Rust 实现，兼容 pip 生态，快）、Poetry（依赖+打包一体，锁文件成熟）、PDM（PEP 582/621 先锋）、pip-tools。→ [虚拟环境与依赖管理](/engineering/environments)

## 解释器内部

以下条目读的是 CPython 3.14 分支源码，引用带文件行号，原页给了逐条出处。→ [CPython 源码解析](/internals/cpython-source)

- **PyObject 头**：所有 Python 对象开头都是「引用计数 + 类型指针」十六字节，`PyObject_HEAD` 宏负责放在每个类型结构体开头；变长对象多一个长度字段 `PyVarObject`。
- **不死对象**：3.12 后静态对象（`None`、小整数等）引用计数带符号位标记，增减引用是空操作。
- **紧凑 dict**：键表分控制字段、哈希索引数组、紧随的条目数组三段；遍历按插入序走条目数组，不看哈希桶。
- **list 超额分配**：`list_resize` 按 `newsize + newsize>>3 + 6` 再向 4 对齐，约 12.5% 余量，撑起 `append` 的摊还 O(1)。
- **str 四种形态**：`kind` 位域按内容自动选 1/2/4 字节编码，compact 形态数据紧跟结构体、零拷贝访问。
- **tp_* 槽即虚表**：`PyTypeObject` 把类型能力摊平成 C 函数指针；Python 层 dunder 与 C 层槽经 `slotdefs[]` 表对应。
- **属性查找顺序**：数据描述符优先于实例字典，实例字典优先于非数据描述符，这就是「property 压过实例属性」的出处。
- **求值循环三种分发**：尾调用、computed goto、switch 兜底，编译期由 `Python/ceval_macros.h` 决定。
- **自适应特化**：通用指令带 16 位倒计时计数器，数满后原地改写成专用指令（如 `BINARY_OP_ADD_INT`），失败按指数退避重置。
- **编译管线**：词法→PEG 语法分析→AST→AST 预处理→符号表→代码生成→CFG 优化→汇编→首次执行前 quicken。
- **pymalloc**：512 字节以下走三级池（arena 256 KiB / pool 4 KiB / block 16 字节对齐），超阈值直接进 `malloc`。
- **分代 GC**：只管可能成环的容器，三代阈值默认 2000/10/10（非老资料的 700）；引用计数负责九成回收，GC 只为环存在。
- **GIL 实现**：一个 `locked` 整数加互斥锁和条件变量，默认切换间隔 5000 微秒；切换点只在字节码边界和显式释放点。
- **import 机制**：C 半边提供 `_imp` 内建接口，Python 半边在 `importlib/_bootstrap*.py`；`_find_and_load` 先查 `sys.modules` 快路径。
- **稳定 ABI**：定义 `Py_LIMITED_API` 后私有布局被隔离，受限模式建类型只有 `PyType_FromSpec` 一条路。
