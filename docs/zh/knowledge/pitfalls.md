---
description: 高频陷阱的原理与规避：语义、容器、并发、工程四类，附源页。
---

# 常见坑

这是便于回查的跨主题速查索引，每条只留要点和对应专题页；成因、示例与实践细节见[常见陷阱专题](/zh/advanced/pitfalls)。与专题页同主题的条目保留为摘要，不在这里重复展开。

## 语义类

- **可变默认参数**：默认值在调用间共享；用 `None` 哨兵并在函数体内新建。原理与示例见[专题页](/zh/advanced/pitfalls)。
- **闭包晚绑定**：闭包捕获变量本身而非当时的值，循环里创建的函数全部共享循环变量，循环结束看到的是最后一个值。规避：默认参数在定义时快照 `lambda i=i: i`。→ [函数](/zh/basics/functions)
- **`is` 当 `==` 用**：对象身份不代表值相等；`is` 只用于单例判断。原理与示例见[专题页](/zh/advanced/pitfalls)。
- **浮点当钱算**：IEEE 754 表示不了 0.1，`0.1 + 0.2 == 0.3` 为假。规避：金额用 `decimal.Decimal`，浮点比较设容差。→ [变量与数据类型](/zh/basics/variables-and-types)
- **字符串比较不归一**：跨系统比较前统一大小写折叠与 Unicode NFC 规范化；细节见[专题页](/zh/advanced/pitfalls)。

## 容器与拷贝

- **`[[]] * n` 引用复制**：复制的是同一个内层列表的引用 n 次，append 一个全变。规避：多维结构用推导式 `[[0]*3 for _ in range(2)]`。→ [列表与元组](/zh/datastructures/list-tuple)
- **浅拷贝当深拷贝**：浅拷贝仍共享嵌套成员；需要隔离时考虑 `copy.deepcopy`。细节见[专题页](/zh/advanced/pitfalls)。
- **遍历中改容器**：遍历时增删可能漏项；可构造新容器或遍历副本。示例见[专题页](/zh/advanced/pitfalls)。
- **拿不可哈希对象当键**：list/dict/set 没有稳定的 `__hash__`，作键直接 `TypeError`。规避：键用数字、字符串、字节或内容全可哈希的元组。→ [字典与集合](/zh/datastructures/dict-set)
- **空集合写成 `{}`**：`{}` 是空字典不是空集合。规避：空集合用 `set()`。→ [字典与集合](/zh/datastructures/dict-set)

## 并发类

- **以为线程能加速 CPU 密集**：GIL 下单进程多线程在纯计算上串行甚至更慢。规避：CPU 密集用 `multiprocessing`，或 NumPy 这类释放 GIL 的原生库。→ [多线程与 GIL](/zh/concurrency/threading)
- **共享状态不加锁**：`+=` 拆成「读-改-写」多步，切换可能发生在中间，偶发丢更新、难复现。规避：共享可变状态用 `with lock:` 保护，共享计数也一样。→ [多线程与 GIL](/zh/concurrency/threading)
- **协程里调 `time.sleep`/同步 requests**：没有 `await` 的阻塞段卡死整个事件循环，所有协程一起停摆。规避：定时用 `await asyncio.sleep`，阻塞调用扔 `run_in_executor`。→ [异步编程 asyncio](/zh/concurrency/asyncio)
- **多进程回调用 lambda/闭包**：spawn 模式下子进程重导入模块，lambda、局部函数不可 pickle。规避：target 用模块顶层可导入的具名函数。→ [多进程 multiprocessing](/zh/concurrency/multiprocessing)
- **多进程缺 `__main__` 守卫**：spawn 模式下子进程重新导入主模块，没有守卫会无限递归创建进程。规避：脚本入口一律包 `if __name__ == "__main__":`。→ [多进程 multiprocessing](/zh/concurrency/multiprocessing)
- **以为子进程改了父进程的数据**：跨进程传的是 pickle 还原的副本，子进程 append 再多次，父进程纹丝不动。规避：结果回传走队列或 `Manager().list()`。→ [多进程 multiprocessing](/zh/concurrency/multiprocessing)

## 工程类

- **裸 `except` 吞异常**：`except:` 连 `KeyboardInterrupt`、`SystemExit` 都吞，线上出问题查无可查；`except: pass` 更让错误消失得无影无踪。规避：最低 `except Exception`，处理、记日志或重新抛出。→ [异常处理](/zh/advanced/exceptions)
- **`__exit__` 返回真值**：自定义上下文管理器里返回 `True` 会吞掉异常，除非有意做局部恢复，否则应返回 `False`。→ [上下文管理器](/zh/advanced/context-managers)
- **`import *`**：把模块公共名字全倒进当前命名空间，来源不可追溯、极易遮蔽。规避：用 `__all__` 声明白名单，日常别 `import *`。→ [模块与包](/zh/advanced/modules)
- **脚本里写相对导入**：直接运行入口文件时不能用相对导入，报「attempted relative import with no known parent package」。规避：用 `python -m pkg.module` 以模块身份运行，或改绝对导入。→ [模块与包](/zh/advanced/modules)
- **dataclass 用可变默认**：`tags: list = []` 直接抛 `ValueError`，所有实例共享同一个对象。规避：用 `field(default_factory=list)`。→ [dataclass](/zh/advanced/dataclass)
- **`lru_cache` 用在非纯函数**：参数不可哈希会 `TypeError`，函数依赖外部状态会得到过期缓存。规避：只缓存纯函数，参数可哈希。→ [装饰器](/zh/advanced/decorators)
- **logging 字段缺失静默失败**：formatter 引用了记录里不存在的字段，错误被 logging 拦在 handler 内部打到 stderr，不抛给调用方，只能从 stderr 发现。规避：`extra` 提供的字段与 formatter 对齐。→ [日志与调试](/zh/engineering/logging)
- **全局 pip 装包**：升级系统工具依赖，Linux 发行版尤其敏感（PEP 668 已默认禁止）。规避：别用 `--break-system-packages` 越过，用 venv。→ [虚拟环境与依赖管理](/zh/engineering/environments)
- **依赖只写不锁**：requirements.txt 不锁版本，出现「上周还好好的」式漂移。规避：直接依赖写范围约束 + 锁文件固定全量版本。→ [虚拟环境与依赖管理](/zh/engineering/environments)
- **PyPI 版本号复用**：上传的文件名永久占用，同版本号不能重复上传，删版本也释放不了文件名。规避：发布前先在 TestPyPI 演练，版本号宁可靠后不可超前。→ [打包与发布](/zh/engineering/packaging)
- **资源释放赌 `__del__`**：析构时机不适合作为资源管理保证；用 `with`/`finally`。细节见[专题页](/zh/advanced/pitfalls)。

## 参考资料

- [Python 官方文档 · 常见陷阱（FAQ）](https://docs.python.org/3/tutorial/appendix.html)
- [Python 官方文档 · 执行模型](https://docs.python.org/3/reference/executionmodel.html)

<!-- BACKLINKS-AUTO -->
## 相关页面

- [index](index.md)
