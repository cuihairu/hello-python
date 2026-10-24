# Python Glossary

This glossary collects the core terms from this site's Python documentation, grouped by theme. Each entry gives a Chinese-English pair, a one-line definition, an authoritative source, and related pages.

**Maintenance rule**: New entries must include a clickable authoritative source; if none is found, write "No authoritative source found (pending review)" — do not fabricate links from memory.

## Language core

### 名字绑定（Name Binding）
A Python variable is a reference to an object; assignment binds a name to an object rather than creating a memory box.
**Source**: [Python official docs · Execution model](https://docs.python.org/3/reference/executionmodel.html)
**Related pages**: [basics/variables-and-types](/basics/variables-and-types), [advanced/pitfalls](/zh/advanced/pitfalls)

### 动态类型（Dynamic Typing）
Type attaches to objects rather than variables; behavior is dispatched at runtime according to the object's actual type.
**Source**: [Python official docs · Built-in types](https://docs.python.org/3/library/stdtypes.html)
**Related pages**: [basics/variables-and-types](/basics/variables-and-types), [internals/object-model](/zh/internals/object-model)

### 可变与不可变（Mutable / Immutable）
list/dict/set can be modified in place; int/str/tuple are immutable — modifying creates a new object.
**Source**: [Python official docs · Built-in types](https://docs.python.org/3/library/stdtypes.html)
**Related pages**: [basics/variables-and-types](/basics/variables-and-types), [datastructures/list-tuple](/datastructures/list-tuple)

### 作用域（LEGB）（Scope (LEGB)）
Name lookup order: Local → Enclosing → Global → Builtin.
**Source**: [Python official docs · Execution model](https://docs.python.org/3/reference/executionmodel.html)
**Related pages**: [basics/functions](/basics/functions), [advanced/pitfalls](/zh/advanced/pitfalls)

### 闭包（Closure）
An inner function captures the name environment of an outer function; captured variables remain accessible after the outer function returns.
**Source**: [Python official docs · Simple statements (nonlocal)](https://docs.python.org/3/reference/simple_stmts.html)
**Related pages**: [basics/functions](/basics/functions), [advanced/decorators](/zh/advanced/decorators)

### 推导式（Comprehension）
An expression that builds a list/set/dict from an iterable using declarative syntax.
**Source**: [Python official docs · Expressions (displays)](https://docs.python.org/3/reference/expressions.html)
**Related pages**: [datastructures/iterators-generators](/zh/datastructures/iterators-generators), [datastructures/list-tuple](/datastructures/list-tuple)

### 鸭子类型（Duck Typing）
Cares about what an object can do rather than what it is; behavior is determined by method presence.
**Source**: [Python official docs · Glossary](https://docs.python.org/3/glossary.html)
**Related pages**: [advanced/typing](/advanced/typing), [knowledge/core-concepts](/zh/knowledge/core-concepts)

### EAFP（Easier to Ask Forgiveness than Permission）
The idiom of trying an operation first and handling the exception on failure, as opposed to LBYL.
**Source**: [Python official docs · Glossary](https://docs.python.org/3/glossary.html)
**Related pages**: [advanced/exceptions](/advanced/exceptions)

### 真值测试（Truth Value Testing）
Any object reduces to true or false in a boolean context via \_\_bool\_\_/\_\_len\_\_.
**Source**: [Python official docs · Built-in types (truth value)](https://docs.python.org/3/library/stdtypes.html)
**Related pages**: [basics/control-flow](/zh/basics/control-flow)

### 字节码（Bytecode）
The intermediate instructions CPython compiles source code into, executed one by one by the virtual machine.
**Source**: [CPython developer guide · Compiler internals](https://devguide.python.org/internals/compiler/)
**Related pages**: [internals/compiler-pipeline](/zh/internals/compiler-pipeline), [internals/eval-loop](/zh/internals/eval-loop)

### 装饰器（Decorator）
A callable that takes a function and returns a new function, used to enhance behavior non-invasively.
**Source**: [Python official docs · Function definitions (decorators)](https://docs.python.org/3/reference/compound_stmts.html), [Python official docs · functools](https://docs.python.org/3/library/functools.html)
**Related pages**: [advanced/decorators](/zh/advanced/decorators)

### 生成器（Generator）
A function containing yield that lazily produces values while preserving execution state.
**Source**: [Python official docs · Expressions (yield)](https://docs.python.org/3/reference/expressions.html), [PEP 255 · Generators](https://peps.python.org/pep-0255/)
**Related pages**: [datastructures/iterators-generators](/zh/datastructures/iterators-generators)

### 迭代器（Iterator）
An object implementing the \_\_iter\_\_ and \_\_next\_\_ protocol, the underlying mechanism of the for loop.
**Source**: [Python official docs · Glossary](https://docs.python.org/3/glossary.html), [PEP 234 · Iterators](https://peps.python.org/pep-0234/)
**Related pages**: [datastructures/iterators-generators](/zh/datastructures/iterators-generators)

### 上下文管理器（Context Manager）
An object implementing \_\_enter\_\_/\_\_exit\_\_; the with statement guarantees resource release.
**Source**: [Python official docs · contextlib](https://docs.python.org/3/library/contextlib.html), [PEP 343 · The with statement](https://peps.python.org/pep-0343/)
**Related pages**: [advanced/context-managers](/advanced/context-managers)

### 异常（Exception）
An object raised when an error occurs, propagating up the call stack until caught.
**Source**: [Python official docs · Built-in exceptions](https://docs.python.org/3/library/exceptions.html), [Python official docs · Tutorial · Errors and exceptions](https://docs.python.org/3/tutorial/errors.html)
**Related pages**: [advanced/exceptions](/advanced/exceptions)

## Data types

### 列表（list）
A mutable ordered sequence supporting indexing, slicing, and in-place modification.
**Source**: [Python official docs · Built-in types (list)](https://docs.python.org/3/library/stdtypes.html)
**Related pages**: [datastructures/list-tuple](/datastructures/list-tuple)

### 元组（tuple）
An immutable ordered sequence, commonly used for records with a fixed structure.
**Source**: [Python official docs · Built-in types (tuple)](https://docs.python.org/3/library/stdtypes.html)
**Related pages**: [datastructures/list-tuple](/datastructures/list-tuple)

### 字典（dict）
A key-value mapping that guarantees insertion order from 3.7 onward, based on an open-addressing hash table.
**Source**: [Python official docs · Built-in types (dict)](https://docs.python.org/3/library/stdtypes.html)
**Related pages**: [datastructures/dict-set](/datastructures/dict-set), [internals/object-model](/zh/internals/object-model)

### 集合（set / frozenset）
An unordered set of unique elements supporting intersection, union, and difference operations.
**Source**: [Python official docs · Built-in types (set)](https://docs.python.org/3/library/stdtypes.html)
**Related pages**: [datastructures/dict-set](/datastructures/dict-set)

### f-string（Formatted String Literal）
A string formatting literal with an f prefix that embeds expressions.
**Source**: [Python official docs · Expressions (f-strings)](https://docs.python.org/3/reference/lexical_analysis.html), [Python official docs · string formatting](https://docs.python.org/3/library/string.html)
**Related pages**: [datastructures/string-formatting](/datastructures/string-formatting)

### None（None）
The singleton object representing "no value"; the default return value of a function.
**Source**: [Python official docs · Built-in constants](https://docs.python.org/3/library/stdtypes.html)
**Related pages**: [basics/variables-and-types](/basics/variables-and-types)

## Object-oriented programming

### 类与实例（Class / Instance）
A class defines the structure and behavior of objects; an instance is a concrete realization of a class.
**Source**: [Python official docs · Tutorial · Classes](https://docs.python.org/3/tutorial/classes.html)
**Related pages**: [advanced/oop](/advanced/oop)

### 继承与 MRO（Inheritance / MRO）
Subclasses reuse parent class attributes; the method resolution order is determined by C3 linearization.
**Source**: [Python official docs · Data model](https://docs.python.org/3/reference/datamodel.html)
**Related pages**: [advanced/oop](/advanced/oop)

### 魔法方法（Magic Method (dunder)）
Special methods wrapped in double underscores, serving as entry points for operators and built-in protocols.
**Source**: [Python official docs · Data model](https://docs.python.org/3/reference/datamodel.html)
**Related pages**: [advanced/magic-methods](/zh/advanced/magic-methods)

### property（property）
A descriptor that exposes a method as an attribute, enabling controlled read/write.
**Source**: [Python official docs · Built-in functions (property)](https://docs.python.org/3/library/functions.html), [Python official docs · Descriptor howto](https://docs.python.org/3/howto/descriptor.html)
**Related pages**: [advanced/magic-methods](/zh/advanced/magic-methods), [internals/type-system](/zh/internals/type-system)

### 描述符（Descriptor）
An object defining \_\_get\_\_/\_\_set\_\_; the core of the attribute lookup protocol.
**Source**: [Python official docs · Descriptor howto](https://docs.python.org/3/howto/descriptor.html)
**Related pages**: [internals/type-system](/zh/internals/type-system)

### dataclass（dataclass）
A class that automatically generates \_\_init\_\_/\_\_repr\_\_/\_\_eq\_\_ and so on via a decorator.
**Source**: [Python official docs · dataclasses](https://docs.python.org/3/library/dataclasses.html), [PEP 557 · dataclasses](https://peps.python.org/pep-0557/)
**Related pages**: [advanced/dataclass](/advanced/dataclass)

### 协议（Protocol）
Structural subtyping: having the specified methods satisfies the protocol, with no explicit inheritance required.
**Source**: [PEP 544 · Protocols](https://peps.python.org/pep-0544/)
**Related pages**: [advanced/typing](/advanced/typing)

### ABC（Abstract Base Class）
An abstract base class defining an interface contract, used with abstractmethod.
**Source**: [Python official docs · abc](https://docs.python.org/3/library/abc.html)
**Related pages**: [advanced/typing](/advanced/typing), [advanced/oop](/advanced/oop)

### 枚举（Enum）
A set of named constants with unique, iterable members.
**Source**: [Python official docs · enum](https://docs.python.org/3/library/enum.html)
**Related pages**: [advanced/dataclass](/advanced/dataclass)

## Type annotations

### 类型提示（Type Hints）
Syntax for annotating types on functions and variables, consumed by static checkers.
**Source**: [Python official docs · typing](https://docs.python.org/3/library/typing.html), [PEP 484 · Type Hints](https://peps.python.org/pep-0484/)
**Related pages**: [advanced/typing](/advanced/typing)

### 泛型（Generics）
Parameterizing the types of containers and functions with type parameters.
**Source**: [Python official docs · typing (generics)](https://docs.python.org/3/library/typing.html)
**Related pages**: [advanced/typing](/advanced/typing)

### mypy（mypy）
A Python static type checker that verifies the consistency of type hints.
**Source**: [mypy official site](https://mypy-lang.org/)
**Related pages**: [advanced/typing](/advanced/typing), [engineering/testing](/engineering/testing)

## Concurrency

### GIL（Global Interpreter Lock）
CPython's global interpreter lock, allowing only one thread to execute bytecode at a time; experimentally disableable from 3.13 (PEP 703).
**Source**: [PEP 703 · free-threaded CPython](https://peps.python.org/pep-0703/), [Python official docs · free-threading howto](https://docs.python.org/3/howto/free-threading-python.html)
**Related pages**: [concurrency/threading](/concurrency/threading), [internals/gil-threading](/zh/internals/gil-threading)

### 线程（Thread）
An OS-level execution flow; constrained by the GIL, suitable for I/O-intensive tasks.
**Source**: [Python official docs · threading](https://docs.python.org/3/library/threading.html)
**Related pages**: [concurrency/threading](/concurrency/threading)

### 多进程（Multiprocessing）
Independent interpreter processes that bypass the GIL, suitable for CPU-intensive tasks.
**Source**: [Python official docs · multiprocessing](https://docs.python.org/3/library/multiprocessing.html)
**Related pages**: [concurrency/multiprocessing](/concurrency/multiprocessing)

### 协程（Coroutine）
A function that can be suspended and resumed; defined with async def, driven by await.
**Source**: [Python official docs · asyncio tasks and coroutines](https://docs.python.org/3/library/asyncio-task.html), [PEP 492 · async/await](https://peps.python.org/pep-0492/)
**Related pages**: [concurrency/asyncio](/concurrency/asyncio)

### 事件循环（Event Loop）
The scheduling core of asyncio, driving ready callbacks and timers.
**Source**: [Python official docs · Event loop](https://docs.python.org/3/library/asyncio-eventloop.html)
**Related pages**: [concurrency/asyncio](/concurrency/asyncio)

### concurrent.futures（concurrent.futures）
A high-level interface to thread/process pools; a Future represents an asynchronous result.
**Source**: [Python official docs · concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html)
**Related pages**: [concurrency/concurrency-compare](/zh/concurrency/concurrency-compare)

## Memory and runtime

### 引用计数（Reference Counting）
CPython's primary memory reclamation mechanism; an object is freed when its reference count drops to zero.
**Source**: [CPython developer guide · Internals](https://devguide.python.org/internals/)
**Related pages**: [internals/memory-management](/zh/internals/memory-management), [internals/gc-module](/zh/internals/gc-module)

### 垃圾回收（分代）（Generational GC）
A three-generation collector that handles circular references beyond reference counting, controlled by the gc module.
**Source**: [Python official docs · gc module](https://docs.python.org/3/library/gc.html)
**Related pages**: [internals/gc-module](/zh/internals/gc-module), [internals/memory-management](/zh/internals/memory-management)

### pymalloc（pymalloc）
CPython's arena/POOL memory allocator for small objects (≤512B).
**Source**: [CPython repository](https://github.com/python/cpython)
**Related pages**: [internals/memory-management](/zh/internals/memory-management)

### 对象模型（Object Model）
Everything is an object: PyObject header + type pointer + reference count.
**Source**: [Python official docs · Data model](https://docs.python.org/3/reference/datamodel.html), [CPython C API · Object protocol](https://docs.python.org/3/c-api/object.html)
**Related pages**: [internals/object-model](/zh/internals/object-model)

### 帧对象（Frame Object）
The execution context: code object + local variables + instruction pointer.
**Source**: [Python official docs · inspect (frames)](https://docs.python.org/3/library/inspect.html)
**Related pages**: [internals/eval-loop](/zh/internals/eval-loop)

## Modules and imports

### 模块与包（Module / Package）
A module is a .py file turned into an object; a package is a directory module containing \_\_init\_\_.py.
**Source**: [Python official docs · Tutorial · Modules](https://docs.python.org/3/tutorial/modules.html)
**Related pages**: [advanced/modules](/zh/advanced/modules)

### import 机制（Import System）
A two-stage finder/loader import protocol based on importlib.
**Source**: [Python official docs · The import system](https://docs.python.org/3/reference/import.html), [Python official docs · importlib](https://docs.python.org/3/library/importlib.html)
**Related pages**: [internals/import-system](/zh/internals/import-system)

### sys.path（sys.path）
The list of module search paths, influenced by site and environment variables.
**Source**: [Python official docs · site](https://docs.python.org/3/library/site.html)
**Related pages**: [internals/import-system](/zh/internals/import-system)

## Engineering practice

### 虚拟环境（Virtual Environment (venv)）
An isolated interpreter environment for project dependencies.
**Source**: [Python official docs · venv](https://docs.python.org/3/library/venv.html)
**Related pages**: [engineering/environments](/engineering/environments), [basics/setup](/basics/setup)

### pip / uv（pip / uv）
Package installers; uv is a high-speed alternative implemented in Rust.
**Source**: [pip official docs](https://pip.pypa.io/en/stable/), [uv official docs](https://docs.astral.sh/uv/)
**Related pages**: [engineering/environments](/engineering/environments)

### pyproject.toml（pyproject.toml）
The standardized configuration file for project build and metadata.
**Source**: [PEP 518 · Specifying build dependencies](https://peps.python.org/pep-0518/), [PEP 621 · Core metadata for Python packages](https://peps.python.org/pep-0621/)
**Related pages**: [engineering/packaging](/engineering/packaging)

### wheel（Wheel）
A binary distribution format that installs without compilation.
**Source**: [Python Packaging User Guide](https://packaging.python.org/en/latest/)
**Related pages**: [engineering/packaging](/engineering/packaging)

### pytest（pytest）
The mainstream testing framework based on fixtures and parametrization.
**Source**: [pytest official docs](https://docs.pytest.org/en/stable/)
**Related pages**: [engineering/testing](/engineering/testing)

### unittest（unittest）
The standard library testing framework, xUnit style.
**Source**: [Python official docs · unittest](https://docs.python.org/3/library/unittest.html)
**Related pages**: [engineering/testing](/engineering/testing)

### logging（logging）
The standard library logging framework: Logger/Handler/Formatter layers.
**Source**: [Python official docs · logging](https://docs.python.org/3/library/logging.html), [Python official docs · logging cookbook](https://docs.python.org/3/howto/logging-cookbook.html)
**Related pages**: [engineering/logging](/zh/engineering/logging)

---

**Maintenance rule**: New entries must include a clickable authoritative source; if none is found, write "No authoritative source found (pending review)" — do not fabricate links from memory.

<!-- BACKLINKS-AUTO -->
## Related pages

- [index](/knowledge/index.md)
