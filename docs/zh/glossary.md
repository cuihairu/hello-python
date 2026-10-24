# Python 术语表

本表收录本站 Python 文档的核心术语，按主题分组。每条给出中英对照、一句话定义、权威出处与相关页。

**维护口径**：新增条目必须给出可点的权威出处；查不到就写「未找到权威出处（待核）」，不得凭印象编造链接。

## 语言核心

### 名字绑定（Name Binding）
Python 变量是对对象的引用，赋值即把名字绑定到对象，而非创建内存盒。
**出处**：[Python 官方文档 · 执行模型](https://docs.python.org/3/reference/executionmodel.html)
**相关页**：[basics/variables-and-types](/zh/basics/variables-and-types)、[advanced/pitfalls](/zh/advanced/pitfalls)

### 动态类型（Dynamic Typing）
类型附着于对象而非变量，运行时按对象实际类型分派行为。
**出处**：[Python 官方文档 · 内置类型](https://docs.python.org/3/library/stdtypes.html)
**相关页**：[basics/variables-and-types](/zh/basics/variables-and-types)、[internals/object-model](/zh/internals/object-model)

### 可变与不可变（Mutable / Immutable）
list/dict/set 可原地修改；int/str/tuple 不可变，修改即创建新对象。
**出处**：[Python 官方文档 · 内置类型](https://docs.python.org/3/library/stdtypes.html)
**相关页**：[basics/variables-and-types](/zh/basics/variables-and-types)、[datastructures/list-tuple](/zh/datastructures/list-tuple)

### 作用域（LEGB）（Scope (LEGB)）
名字查找顺序：Local → Enclosing → Global → Builtin。
**出处**：[Python 官方文档 · 执行模型](https://docs.python.org/3/reference/executionmodel.html)
**相关页**：[basics/functions](/zh/basics/functions)、[advanced/pitfalls](/zh/advanced/pitfalls)

### 闭包（Closure）
内层函数捕获外层函数的名字环境，外层返回后仍可访问被捕获变量。
**出处**：[Python 官方文档 · 简单语句（nonlocal）](https://docs.python.org/3/reference/simple_stmts.html)
**相关页**：[basics/functions](/zh/basics/functions)、[advanced/decorators](/zh/advanced/decorators)

### 推导式（Comprehension）
以声明式语法从一个可迭代对象构建列表/集合/字典的表达式。
**出处**：[Python 官方文档 · 表达式（显示）](https://docs.python.org/3/reference/expressions.html)
**相关页**：[datastructures/iterators-generators](/zh/datastructures/iterators-generators)、[datastructures/list-tuple](/zh/datastructures/list-tuple)

### 鸭子类型（Duck Typing）
关心对象能做什么而非它是什么，行为由方法存在性决定。
**出处**：[Python 官方文档 · 术语表](https://docs.python.org/3/glossary.html)
**相关页**：[advanced/typing](/zh/advanced/typing)、[knowledge/core-concepts](/zh/knowledge/core-concepts)

### EAFP（Easier to Ask Forgiveness than Permission）
先尝试操作、失败再处理异常的惯用法，与 LBYL 相对。
**出处**：[Python 官方文档 · 术语表](https://docs.python.org/3/glossary.html)
**相关页**：[advanced/exceptions](/zh/advanced/exceptions)

### 真值测试（Truth Value Testing）
任何对象在布尔上下文中按 \_\_bool\_\_/\_\_len\_\_ 归约为真或假。
**出处**：[Python 官方文档 · 内置类型（真值）](https://docs.python.org/3/library/stdtypes.html)
**相关页**：[basics/control-flow](/zh/basics/control-flow)

### 字节码（Bytecode）
CPython 将源码编译成的中间指令，由虚拟机逐条执行。
**出处**：[CPython 开发者指南 · 编译器内部](https://devguide.python.org/internals/compiler/)
**相关页**：[internals/compiler-pipeline](/zh/internals/compiler-pipeline)、[internals/eval-loop](/zh/internals/eval-loop)

### 装饰器（Decorator）
接收函数并返回新函数的可调用对象，用于无侵入地增强行为。
**出处**：[Python 官方文档 · 函数定义（装饰器）](https://docs.python.org/3/reference/compound_stmts.html)、[Python 官方文档 · functools](https://docs.python.org/3/library/functools.html)
**相关页**：[advanced/decorators](/zh/advanced/decorators)

### 生成器（Generator）
含 yield 的函数，惰性产出值并保留执行状态。
**出处**：[Python 官方文档 · 表达式（yield）](https://docs.python.org/3/reference/expressions.html)、[PEP 255 · 生成器](https://peps.python.org/pep-0255/)
**相关页**：[datastructures/iterators-generators](/zh/datastructures/iterators-generators)

### 迭代器（Iterator）
实现 \_\_iter\_\_ 与 \_\_next\_\_ 协议的对象，for 循环的底层机制。
**出处**：[Python 官方文档 · 术语表](https://docs.python.org/3/glossary.html)、[PEP 234 · 迭代器](https://peps.python.org/pep-0234/)
**相关页**：[datastructures/iterators-generators](/zh/datastructures/iterators-generators)

### 上下文管理器（Context Manager）
实现 \_\_enter\_\_/\_\_exit\_\_ 的对象，with 语句保证资源释放。
**出处**：[Python 官方文档 · contextlib](https://docs.python.org/3/library/contextlib.html)、[PEP 343 · with 语句](https://peps.python.org/pep-0343/)
**相关页**：[advanced/context-managers](/zh/advanced/context-managers)

### 异常（Exception）
错误发生时抛出的对象，沿调用栈传播直至被捕获。
**出处**：[Python 官方文档 · 内置异常](https://docs.python.org/3/library/exceptions.html)、[Python 官方文档 · 教程 · 错误与异常](https://docs.python.org/3/tutorial/errors.html)
**相关页**：[advanced/exceptions](/zh/advanced/exceptions)

## 数据类型

### 列表（list）
可变有序序列，支持索引切片与原地修改。
**出处**：[Python 官方文档 · 内置类型（list）](https://docs.python.org/3/library/stdtypes.html)
**相关页**：[datastructures/list-tuple](/zh/datastructures/list-tuple)

### 元组（tuple）
不可变有序序列，常用于固定结构的记录。
**出处**：[Python 官方文档 · 内置类型（tuple）](https://docs.python.org/3/library/stdtypes.html)
**相关页**：[datastructures/list-tuple](/zh/datastructures/list-tuple)

### 字典（dict）
键值映射，3.7 起保证插入顺序，基于开放寻址哈希表。
**出处**：[Python 官方文档 · 内置类型（dict）](https://docs.python.org/3/library/stdtypes.html)
**相关页**：[datastructures/dict-set](/zh/datastructures/dict-set)、[internals/object-model](/zh/internals/object-model)

### 集合（set / frozenset）
无序不重复元素集，支持交并差运算。
**出处**：[Python 官方文档 · 内置类型（set）](https://docs.python.org/3/library/stdtypes.html)
**相关页**：[datastructures/dict-set](/zh/datastructures/dict-set)

### f-string（Formatted String Literal）
以 f 前缀嵌入表达式的字符串格式化字面量。
**出处**：[Python 官方文档 · 表达式（f-string）](https://docs.python.org/3/reference/lexical_analysis.html)、[Python 官方文档 · string 格式化](https://docs.python.org/3/library/string.html)
**相关页**：[datastructures/string-formatting](/zh/datastructures/string-formatting)

### None（None）
表示「无值」的单例对象，函数默认返回值。
**出处**：[Python 官方文档 · 内置常量](https://docs.python.org/3/library/stdtypes.html)
**相关页**：[basics/variables-and-types](/zh/basics/variables-and-types)

## 面向对象

### 类与实例（Class / Instance）
类定义对象的结构与行为，实例是类的一次具体化。
**出处**：[Python 官方文档 · 教程 · 类](https://docs.python.org/3/tutorial/classes.html)
**相关页**：[advanced/oop](/zh/advanced/oop)

### 继承与 MRO（Inheritance / MRO）
子类复用父类属性；方法解析顺序由 C3 线性化确定。
**出处**：[Python 官方文档 · 数据模型](https://docs.python.org/3/reference/datamodel.html)
**相关页**：[advanced/oop](/zh/advanced/oop)

### 魔法方法（Magic Method (dunder)）
以双下划线包裹的特殊方法，运算符与内置协议的入口。
**出处**：[Python 官方文档 · 数据模型](https://docs.python.org/3/reference/datamodel.html)
**相关页**：[advanced/magic-methods](/zh/advanced/magic-methods)

### property（property）
把方法暴露为属性的描述符，实现受控读写。
**出处**：[Python 官方文档 · 内置函数（property）](https://docs.python.org/3/library/functions.html)、[Python 官方文档 · 描述符 howto](https://docs.python.org/3/howto/descriptor.html)
**相关页**：[advanced/magic-methods](/zh/advanced/magic-methods)、[internals/type-system](/zh/internals/type-system)

### 描述符（Descriptor）
定义 \_\_get\_\_/\_\_set\_\_ 的对象，属性查找协议的核心。
**出处**：[Python 官方文档 · 描述符 howto](https://docs.python.org/3/howto/descriptor.html)
**相关页**：[internals/type-system](/zh/internals/type-system)

### dataclass（dataclass）
以装饰器自动生成 \_\_init\_\_/\_\_repr\_\_/\_\_eq\_\_ 等的类。
**出处**：[Python 官方文档 · dataclasses](https://docs.python.org/3/library/dataclasses.html)、[PEP 557 · dataclasses](https://peps.python.org/pep-0557/)
**相关页**：[advanced/dataclass](/zh/advanced/dataclass)

### 协议（Protocol）
结构化子类型：拥有指定方法即满足协议，无需显式继承。
**出处**：[PEP 544 · Protocols](https://peps.python.org/pep-0544/)
**相关页**：[advanced/typing](/zh/advanced/typing)

### ABC（Abstract Base Class）
定义接口契约的抽象基类，配合 abstractmethod 使用。
**出处**：[Python 官方文档 · abc](https://docs.python.org/3/library/abc.html)
**相关页**：[advanced/typing](/zh/advanced/typing)、[advanced/oop](/zh/advanced/oop)

### 枚举（Enum）
具名常量集合，成员唯一且可迭代。
**出处**：[Python 官方文档 · enum](https://docs.python.org/3/library/enum.html)
**相关页**：[advanced/dataclass](/zh/advanced/dataclass)

## 类型注解

### 类型提示（Type Hints）
为函数与变量标注类型的语法，供静态检查器消费。
**出处**：[Python 官方文档 · typing](https://docs.python.org/3/library/typing.html)、[PEP 484 · 类型提示](https://peps.python.org/pep-0484/)
**相关页**：[advanced/typing](/zh/advanced/typing)

### 泛型（Generics）
以类型参数参数化容器与函数的类型。
**出处**：[Python 官方文档 · typing（泛型）](https://docs.python.org/3/library/typing.html)
**相关页**：[advanced/typing](/zh/advanced/typing)

### mypy（mypy）
Python 静态类型检查器，检查类型提示的一致性。
**出处**：[mypy 官网](https://mypy-lang.org/)
**相关页**：[advanced/typing](/zh/advanced/typing)、[engineering/testing](/zh/engineering/testing)

## 并发

### GIL（Global Interpreter Lock）
CPython 全局解释器锁，同一时刻仅允许一个线程执行字节码；3.13 起可试验性禁用（PEP 703）。
**出处**：[PEP 703 · free-threaded CPython](https://peps.python.org/pep-0703/)、[Python 官方文档 · free-threading howto](https://docs.python.org/3/howto/free-threading-python.html)
**相关页**：[concurrency/threading](/zh/concurrency/threading)、[internals/gil-threading](/zh/internals/gil-threading)

### 线程（Thread）
操作系统级执行流，受 GIL 约束适合 IO 密集任务。
**出处**：[Python 官方文档 · threading](https://docs.python.org/3/library/threading.html)
**相关页**：[concurrency/threading](/zh/concurrency/threading)

### 多进程（Multiprocessing）
独立解释器进程绕开 GIL，适合 CPU 密集任务。
**出处**：[Python 官方文档 · multiprocessing](https://docs.python.org/3/library/multiprocessing.html)
**相关页**：[concurrency/multiprocessing](/zh/concurrency/multiprocessing)

### 协程（Coroutine）
可挂起恢复的函数，async def 定义、await 驱动。
**出处**：[Python 官方文档 · asyncio 任务与协程](https://docs.python.org/3/library/asyncio-task.html)、[PEP 492 · async/await](https://peps.python.org/pep-0492/)
**相关页**：[concurrency/asyncio](/zh/concurrency/asyncio)

### 事件循环（Event Loop）
asyncio 的调度核心，驱动就绪回调与定时器。
**出处**：[Python 官方文档 · 事件循环](https://docs.python.org/3/library/asyncio-eventloop.html)
**相关页**：[concurrency/asyncio](/zh/concurrency/asyncio)

### concurrent.futures（concurrent.futures）
线程/进程池的高层接口，Future 表示异步结果。
**出处**：[Python 官方文档 · concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html)
**相关页**：[concurrency/concurrency-compare](/zh/concurrency/concurrency-compare)

## 内存与运行时

### 引用计数（Reference Counting）
CPython 主要的内存回收机制，对象引用归零即释放。
**出处**：[CPython 开发者指南 · 内部机制](https://devguide.python.org/internals/)
**相关页**：[internals/memory-management](/zh/internals/memory-management)、[internals/gc-module](/zh/internals/gc-module)

### 垃圾回收（分代）（Generational GC）
引用计数之外处理循环引用的三代回收器，由 gc 模块控制。
**出处**：[Python 官方文档 · gc 模块](https://docs.python.org/3/library/gc.html)
**相关页**：[internals/gc-module](/zh/internals/gc-module)、[internals/memory-management](/zh/internals/memory-management)

### pymalloc（pymalloc）
CPython 针对小对象（≤512B）的 arenas/POOL 内存分配器。
**出处**：[CPython 仓库](https://github.com/python/cpython)
**相关页**：[internals/memory-management](/zh/internals/memory-management)

### 对象模型（Object Model）
一切皆对象：PyObject 头 + 类型指针 + 引用计数。
**出处**：[Python 官方文档 · 数据模型](https://docs.python.org/3/reference/datamodel.html)、[CPython C API · 对象协议](https://docs.python.org/3/c-api/object.html)
**相关页**：[internals/object-model](/zh/internals/object-model)

### 帧对象（Frame Object）
执行上下文：代码对象 + 局部变量 + 指令指针。
**出处**：[Python 官方文档 · inspect（帧）](https://docs.python.org/3/library/inspect.html)
**相关页**：[internals/eval-loop](/zh/internals/eval-loop)

## 模块与导入

### 模块与包（Module / Package）
模块是 .py 文件的对象化；包是含 \_\_init\_\_.py 的目录模块。
**出处**：[Python 官方文档 · 教程 · 模块](https://docs.python.org/3/tutorial/modules.html)
**相关页**：[advanced/modules](/zh/advanced/modules)

### import 机制（Import System）
基于 importlib 的查找器/加载器两段式导入协议。
**出处**：[Python 官方文档 · import 系统](https://docs.python.org/3/reference/import.html)、[Python 官方文档 · importlib](https://docs.python.org/3/library/importlib.html)
**相关页**：[internals/import-system](/zh/internals/import-system)

### sys.path（sys.path）
模块查找路径列表，受 site 与环境变量影响。
**出处**：[Python 官方文档 · site](https://docs.python.org/3/library/site.html)
**相关页**：[internals/import-system](/zh/internals/import-system)

## 工程实践

### 虚拟环境（Virtual Environment (venv)）
隔离项目依赖的解释器环境。
**出处**：[Python 官方文档 · venv](https://docs.python.org/3/library/venv.html)
**相关页**：[engineering/environments](/zh/engineering/environments)、[basics/setup](/zh/basics/setup)

### pip / uv（pip / uv）
包安装器；uv 为 Rust 实现的高速替代。
**出处**：[pip 官方文档](https://pip.pypa.io/en/stable/)、[uv 官方文档](https://docs.astral.sh/uv/)
**相关页**：[engineering/environments](/zh/engineering/environments)

### pyproject.toml（pyproject.toml）
项目构建与元数据的标准化配置文件。
**出处**：[PEP 518 · 指定构建依赖](https://peps.python.org/pep-0518/)、[PEP 621 · 项目元数据](https://peps.python.org/pep-0621/)
**相关页**：[engineering/packaging](/zh/engineering/packaging)

### wheel（Wheel）
二进制分发格式，安装免编译。
**出处**：[Python 打包用户指南](https://packaging.python.org/en/latest/)
**相关页**：[engineering/packaging](/zh/engineering/packaging)

### pytest（pytest）
基于 fixture 与参数化的主流测试框架。
**出处**：[pytest 官方文档](https://docs.pytest.org/en/stable/)
**相关页**：[engineering/testing](/zh/engineering/testing)

### unittest（unittest）
标准库测试框架，xUnit 风格。
**出处**：[Python 官方文档 · unittest](https://docs.python.org/3/library/unittest.html)
**相关页**：[engineering/testing](/zh/engineering/testing)

### logging（logging）
标准库日志框架：Logger/Handler/Formatter 分层。
**出处**：[Python 官方文档 · logging](https://docs.python.org/3/library/logging.html)、[Python 官方文档 · logging cookbook](https://docs.python.org/3/howto/logging-cookbook.html)
**相关页**：[engineering/logging](/zh/engineering/logging)

---

**维护口径**：新增条目必须给出可点的权威出处；查不到就写「未找到权威出处（待核）」，不得凭印象编造链接。

<!-- BACKLINKS-AUTO -->
## 相关页面

- [index](/zh/knowledge/index.md)
