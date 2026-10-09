---
description: 每种特性的落地场景与选型：遇到什么需求用什么工具，附源页。
---

# 应用场景

概念按「是什么」组织，这一节按「什么时候用」组织。同一个需求常有几种解法，这里给选择依据，不给万能答案。

## 数据处理与文本

- **列表去重**：元素少、不关心顺序用 `set(nums)`；要保序用 `list(dict.fromkeys(nums))`。→ [字典与集合](/datastructures/dict-set)
- **按值排序取键**：`sorted(d, key=d.get, reverse=True)`，比先转 list 再排干净。→ [字典与集合](/datastructures/dict-set)
- **分组统计**：按维度归集用 `defaultdict(list)`，词频类计数用 `Counter(...).most_common(n)`，别手写 `if key in d`。→ [字典与集合](/datastructures/dict-set)
- **多维坐标索引**：用元组键 `{(0,0): "x"}`，比嵌套字典扁平，还能直接作集合元素。→ [字典与集合](/datastructures/dict-set)
- **批量字符串拼接**：循环 `s += x` 是 O(n²)，改 `"".join(parts)` 一次成型。→ [字符串与格式化](/datastructures/string-formatting)
- **大序列只遍历一遍**：用生成器表达式 `(f(n) for n in big)`，内存只放当前项；要反复访问或取 `len` 才用列表推导式。→ [推导式、迭代器与生成器](/datastructures/iterators-generators)
- **无限/超长序列**：生成器函数配 `itertools.islice` 只取需要的项，如斐波那契取前 8 个。→ [推导式、迭代器与生成器](/datastructures/iterators-generators)
- **组合与排列**：`itertools.combinations`/`product`/`permutations` 一行给出，别手写嵌套循环。→ [标准库精选](/engineering/stdlib)
- **固定结构记录**：坐标、数据库行、多返回值用 tuple 或 `NamedTuple`，动态集合才用 list。→ [列表与元组](/datastructures/list-tuple)
- **正则提取片段**：有规律的片段（订单号、金额）用 `re.findall` 配预编译模式；完整语法结构（嵌套括号、JSON）换专用解析器。→ [标准库精选](/engineering/stdlib)

## 文件、配置与数据交换

- **批量处理文件**：`Path.glob("*.py")`/`rglob("**/*.md")` 找文件，配 `read_text`/`write_text` 读写。→ [文件与 IO](/advanced/file-io)
- **大文件逐行读**：`with p.open() as f: for line in f:` 惰性迭代，不把整个文件读进内存。→ [文件与 IO](/advanced/file-io)
- **关键文件安全写**：写临时文件再 `replace` 改名，实现原子替换，避免断电留截断文件。→ [文件与 IO](/advanced/file-io)
- **结构化数据交换**：JSON 用 `json`（中文传 `ensure_ascii=False`），表格用 `csv`，URL 用 `urllib.parse`，别拿正则硬啃。→ [文件与 IO](/advanced/file-io)、[标准库精选](/engineering/stdlib)
- **跨平台时间处理**：带时区构造 `datetime(..., tzinfo=timezone.utc)` 再比较，3.12+ 用 `zoneinfo` 处理时区库。→ [标准库精选](/engineering/stdlib)
- **编码统一**：文件与网络 API 一律显式 `encoding="utf-8"`，别依赖平台默认（Windows 常是 GBK，是「读文件乱码」的主因）。→ [字符串与格式化](/datastructures/string-formatting)

## 并发与网络

- **网络请求、文件读写等 IO 密集**：并发量小或依赖同步库用 `threading`；成百上千连接且生态有异步库用 `asyncio`。→ [并发模型对比](/concurrency/concurrency-compare)
- **线程间传递数据**：用 `queue.Queue`（内置阻塞与等待通知），结束用哨兵值；停止长跑线程用 `threading.Event` 标志位，别硬杀。→ [多线程与 GIL](/concurrency/threading)
- **数值计算、图像处理等 CPU 密集**：`multiprocessing.Pool` 绕开 GIL 并行；日常批量分发用 `Pool.map`。→ [多进程 multiprocessing](/concurrency/multiprocessing)
- **跨进程共享大数组**：`shared_memory.SharedMemory`（3.8+）让多进程直接读写同一块内存，是 NumPy 大数组场景的标配。→ [多进程 multiprocessing](/concurrency/multiprocessing)
- **协程里跑阻塞调用**：零散调用扔 `loop.run_in_executor`，网络 IO 换 httpx/aiohttp 这类异步库，定时用 `await asyncio.sleep`。→ [异步编程 asyncio](/concurrency/asyncio)
- **批量任务失败要一起收**：3.11+ 用 `TaskGroup`（结构化并发，异常自动传播并取消兄弟任务）或 `ExceptionGroup` + `except*`。→ [异步编程 asyncio](/concurrency/asyncio)、[异常处理](/advanced/exceptions)
- **限并发数**：线程用 `Semaphore(n)`，协程用 `asyncio.Semaphore(n)`，别一次把任务全铺开。→ [多线程与 GIL](/concurrency/threading)、[异步编程 asyncio](/concurrency/asyncio)
- **真实服务的混合负载**：事件循环接请求，重计算段 `run_in_executor` 丢进程池（`ProcessPoolExecutor`），主循环不被卡。→ [并发模型对比](/concurrency/concurrency-compare)

## 工程、发布与质量

- **结构化数据建模**：系统内部流转用 `@dataclass`；API 边界的外部输入（HTTP、配置文件）用带运行时校验的 pydantic。→ [dataclass](/advanced/dataclass)
- **不可变值对象**：`@dataclass(frozen=True, order=True)` 换不可变与可哈希，可作字典键；改值用 `replace()` 派生副本。→ [dataclass](/advanced/dataclass)
- **带校验的属性**：`@property` + `@x.setter`，调用方感觉是属性，实现方保留校验与演化空间。→ [面向对象](/advanced/oop)
- **替代构造器**：`@classmethod` 接收 `cls`，写 `Event.from_iso(...)` 这类具名构造，比多个 `__init__` 重载清晰。→ [面向对象](/advanced/oop)
- **重复计算提速**：纯函数 + 可哈希参数用 `functools.lru_cache`，递归斐波那契从指数级降到线性。→ [装饰器](/advanced/decorators)
- **统一加横切逻辑**：日志、计时、重试、鉴权都用装饰器包，别在每个函数里抄一遍；每个 wrapper 加 `@functools.wraps`。→ [装饰器](/advanced/decorators)
- **资源配对管理**：文件、锁、事务、连接池用 `with`；过程性逻辑用 `@contextmanager`，异常忽略用 `contextlib.suppress`，资源数量不定用 `ExitStack`。→ [上下文管理器](/advanced/context-managers)
- **测试**：新项目直接上 pytest，`assert` 一行、`fixture` 自动回收、`parametrize` 数据驱动；外部依赖用 `unittest.mock` 隔离。→ [测试](/engineering/testing)
- **日志**：`logger = logging.getLogger(__name__)` 按模块分组，异常用 `logger.exception` 带堆栈，结构化字段进采集系统用 `extra`。→ [日志与调试](/engineering/logging)
- **依赖可复现**：`pyproject.toml` 声明直接依赖，锁文件固定全量版本，`.venv/` 不进版本库；追效率用 uv，要成熟锁体验用 Poetry。→ [虚拟环境与依赖管理](/engineering/environments)
- **发布包**：元数据进 `pyproject.toml`，`python -m build` 出 sdist + wheel，`twine` 上传，CI 用可信发布免 token；先在 TestPyPI 演练。→ [打包与发布](/engineering/packaging)
- **分发命令行工具**：给非 Python 用户用 `pipx` 安装，或 `PyInstaller`/`shiv`/`pex` 打成自包含可执行文件。→ [打包与发布](/engineering/packaging)

## 调试与排障

- **定位性能瓶颈**：先 `timeit` 做微基准、再 `cProfile` 出整体画像，按 `ncalls`/`cumtime` 找热点，别凭直觉优化。→ [日志与调试](/engineering/logging)
- **打断点**：`breakpoint()`（3.7+）进 pdb，`n` 下一行、`s` 步入、`p 表达式` 打印、`c` 继续。→ [日志与调试](/engineering/logging)
- **判断「为什么慢」**：用测量区分时间花在计算还是等待，再决定线程、协程还是进程。→ [多线程与 GIL](/concurrency/threading)
