---
description: 高频陷阱的原理与规避：语义、容器、并发、工程四类，附源页。
---

# 常见坑

坑的共性是把「看起来该这样」当成「实际这样」。每条给一句原理和一句规避，细节回原页。站内「常见陷阱」一章是集中版，这里再补上散在各页的坑。

## 语义类

- **可变默认参数**：默认值在函数定义时求值一次、绑在函数对象上，所有调用共享同一个对象，于是「上次的数据漏到这次」。规避：默认值一律用 `None` 哨兵，函数体内新建。→ [常见陷阱](/advanced/pitfalls)
- **闭包晚绑定**：闭包捕获变量本身而非当时的值，循环里创建的函数全部共享循环变量，循环结束看到的是最后一个值。规避：默认参数在定义时快照 `lambda i=i: i`。→ [函数](/basics/functions)
- **`is` 当 `==` 用**：小整数缓存与常量折叠让 `is` 偶尔「碰巧为真」，结果随解释器与运行场景变。规避：`is` 只用于 `None`/`True`/`False` 单例判断，其余一律 `==`。→ [常见陷阱](/advanced/pitfalls)
- **浮点当钱算**：IEEE 754 表示不了 0.1，`0.1 + 0.2 == 0.3` 为假。规避：金额用 `decimal.Decimal`，浮点比较设容差。→ [变量与数据类型](/basics/variables-and-types)
- **字符串比较不归一**：跨系统比较前没做 casefold 与 NFC 规范化，`"Straße"` 与 `"strasse"`、组合字符与预组合字符判为不等。规避：比较前统一 `casefold()` + `unicodedata.normalize("NFC", ...)`。→ [常见陷阱](/advanced/pitfalls)

## 容器与拷贝

- **`[[]] * n` 引用复制**：复制的是同一个内层列表的引用 n 次，append 一个全变。规避：多维结构用推导式 `[[0]*3 for _ in range(2)]`。→ [列表与元组](/datastructures/list-tuple)
- **浅拷贝当深拷贝**：`copy()`/切片只拷一层，嵌套结构的内层仍是共享引用，改「副本」会串到原件。规避：嵌套结构用 `copy.deepcopy`。→ [常见陷阱](/advanced/pitfalls)
- **遍历中改容器**：边遍历边增删，迭代器后错位，典型是「隔一个漏一个」。规避：推导式造新列表，或遍历副本 `nums[:]`、删原件。→ [常见陷阱](/advanced/pitfalls)
- **拿不可哈希对象当键**：list/dict/set 没有稳定的 `__hash__`，作键直接 `TypeError`。规避：键用数字、字符串、字节或内容全可哈希的元组。→ [字典与集合](/datastructures/dict-set)
- **空集合写成 `{}`**：`{}` 是空字典不是空集合。规避：空集合用 `set()`。→ [字典与集合](/datastructures/dict-set)

## 并发类

- **以为线程能加速 CPU 密集**：GIL 下单进程多线程在纯计算上串行甚至更慢。规避：CPU 密集用 `multiprocessing`，或 NumPy 这类释放 GIL 的原生库。→ [多线程与 GIL](/concurrency/threading)
- **共享状态不加锁**：`+=` 拆成「读-改-写」多步，切换可能发生在中间，偶发丢更新、难复现。规避：共享可变状态用 `with lock:` 保护，共享计数也一样。→ [多线程与 GIL](/concurrency/threading)
- **协程里调 `time.sleep`/同步 requests**：没有 `await` 的阻塞段卡死整个事件循环，所有协程一起停摆。规避：定时用 `await asyncio.sleep`，阻塞调用扔 `run_in_executor`。→ [异步编程 asyncio](/concurrency/asyncio)
- **多进程回调用 lambda/闭包**：spawn 模式下子进程重导入模块，lambda、局部函数不可 pickle。规避：target 用模块顶层可导入的具名函数。→ [多进程 multiprocessing](/concurrency/multiprocessing)
- **多进程缺 `__main__` 守卫**：spawn 模式下子进程重新导入主模块，没有守卫会无限递归创建进程。规避：脚本入口一律包 `if __name__ == "__main__":`。→ [多进程 multiprocessing](/concurrency/multiprocessing)
- **以为子进程改了父进程的数据**：跨进程传的是 pickle 还原的副本，子进程 append 再多次，父进程纹丝不动。规避：结果回传走队列或 `Manager().list()`。→ [多进程 multiprocessing](/concurrency/multiprocessing)

## 工程类

- **裸 `except` 吞异常**：`except:` 连 `KeyboardInterrupt`、`SystemExit` 都吞，线上出问题查无可查；`except: pass` 更让错误消失得无影无踪。规避：最低 `except Exception`，处理、记日志或重新抛出。→ [异常处理](/advanced/exceptions)
- **`__exit__` 返回真值**：自定义上下文管理器里返回 `True` 会吞掉异常，除非有意做局部恢复，否则应返回 `False`。→ [上下文管理器](/advanced/context-managers)
- **`import *`**：把模块公共名字全倒进当前命名空间，来源不可追溯、极易遮蔽。规避：用 `__all__` 声明白名单，日常别 `import *`。→ [模块与包](/advanced/modules)
- **脚本里写相对导入**：直接运行入口文件时不能用相对导入，报「attempted relative import with no known parent package」。规避：用 `python -m pkg.module` 以模块身份运行，或改绝对导入。→ [模块与包](/advanced/modules)
- **dataclass 用可变默认**：`tags: list = []` 直接抛 `ValueError`，所有实例共享同一个对象。规避：用 `field(default_factory=list)`。→ [dataclass](/advanced/dataclass)
- **`lru_cache` 用在非纯函数**：参数不可哈希会 `TypeError`，函数依赖外部状态会得到过期缓存。规避：只缓存纯函数，参数可哈希。→ [装饰器](/advanced/decorators)
- **logging 字段缺失静默失败**：formatter 引用了记录里不存在的字段，错误被 logging 拦在 handler 内部打到 stderr，不抛给调用方，只能从 stderr 发现。规避：`extra` 提供的字段与 formatter 对齐。→ [日志与调试](/engineering/logging)
- **全局 pip 装包**：升级系统工具依赖，Linux 发行版尤其敏感（PEP 668 已默认禁止）。规避：别用 `--break-system-packages` 越过，用 venv。→ [虚拟环境与依赖管理](/engineering/environments)
- **依赖只写不锁**：requirements.txt 不锁版本，出现「上周还好好的」式漂移。规避：直接依赖写范围约束 + 锁文件固定全量版本。→ [虚拟环境与依赖管理](/engineering/environments)
- **PyPI 版本号复用**：上传的文件名永久占用，同版本号不能重复上传，删版本也释放不了文件名。规避：发布前先在 TestPyPI 演练，版本号宁可靠后不可超前。→ [打包与发布](/engineering/packaging)
- **资源释放赌 `__del__`**：循环引用里带 `__del__` 的对象回收时机难保证。规避：资源释放用 `with`/`finally`，别依赖 `__del__`。→ [常见陷阱](/advanced/pitfalls)
