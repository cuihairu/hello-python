---
description: 站内知识点对应的官方出处：PEP 逐条、标准库章节与工具文档，全部带链接。
---

# 官方文档

站内页面引用过的官方出处按主题收拢。PEP 是语言演进的提案原文，标准库文档是行为的最终裁定，工具文档管生态。链接都指向可访问的官方地址，争议时以原文为准。

## PEP：语言演进逐条

- **[PEP 8](https://peps.python.org/pep-0008/)**：官方风格指南。4 空格缩进、命名约定都出自这里。→ [语法基础](/basics/syntax)
- **[PEP 343](https://peps.python.org/pep-0343/)**：`with` 语句的提案，`__enter__`/`__exit__` 协议的原始定义。→ [上下文管理器](/advanced/context-managers)
- **[PEP 442](https://peps.python.org/pep-0442/)**：安全对象终结化，3.4 起循环引用里带 `__del__` 的对象可以回收，但调用时机仍难保证。→ [常见陷阱](/advanced/pitfalls)
- **[PEP 484](https://peps.python.org/pep-0484/)**：类型注解标准，3.5 引入的注解体系的源头。→ [类型注解](/advanced/typing)
- **[PEP 492](https://peps.python.org/pep-0492/)**：`async`/`await` 语法，3.5 落地。→ [异步编程 asyncio](/concurrency/asyncio)
- **[PEP 498](https://peps.python.org/pep-0498/)**：f-string，3.6 落地。→ [字符串与格式化](/datastructures/string-formatting)
- **[PEP 517](https://peps.python.org/pep-0517/) 与 [PEP 518](https://peps.python.org/pep-0518/)**：构建后端接口与 `pyproject.toml`，现代打包的根基。→ [打包与发布](/engineering/packaging)
- **[PEP 557](https://peps.python.org/pep-0557/)**：dataclasses，3.7 落地。→ [dataclass](/advanced/dataclass)
- **[PEP 572](https://peps.python.org/pep-0572/)**：海象运算符 `:=`，3.8 落地。→ [语法基础](/basics/syntax)
- **[PEP 582](https://peps.python.org/pep-0582/)**：`__pypackages__` 本地包目录方案，PDM 的立身之本（提案本身已被撤回，工具仍在）。→ [虚拟环境与依赖管理](/engineering/environments)
- **[PEP 584](https://peps.python.org/pep-0584/)**：dict 合并运算符 `|`，3.9 落地。→ [字典与集合](/datastructures/dict-set)
- **[PEP 617](https://peps.python.org/pep-0617/)**：PEG 解析器替换 pgen，3.9 落地，为后续语法演进解除束缚。→ [CPython 源码解析](/internals/cpython-source)
- **[PEP 621](https://peps.python.org/pep-0621/)**：项目元数据进 `pyproject.toml`。→ [虚拟环境与依赖管理](/engineering/environments)
- **[PEP 634](https://peps.python.org/pep-0634/)**：结构化模式匹配，3.10 落地。→ [控制流](/basics/control-flow)
- **[PEP 654](https://peps.python.org/pep-0654/)**：异常组与 `except*`，3.11 落地。→ [异常处理](/advanced/exceptions)
- **[PEP 668](https://peps.python.org/pep-0668/)**：标记「外部管理的环境」，全局 pip 装包被默认禁止，绕过要 `--break-system-packages`。→ [虚拟环境与依赖管理](/engineering/environments)
- **[PEP 695](https://peps.python.org/pep-0695/)**：类型参数语法 `def first[T](...)`，3.12 落地。→ [类型注解](/advanced/typing)
- **[PEP 703](https://peps.python.org/pep-0703/)**：让 GIL 可选的 free-threaded 构建，3.13 实验性引入。→ [多线程与 GIL](/concurrency/threading)
- **[PEP 750](https://peps.python.org/pep-0750/)**：模板字符串 t-string，3.14 落地。→ [发展史时间线](/timeline)
- **[PEP 779](https://peps.python.org/pep-0779/)**：free-threaded 构建从实验转官方支持（仍非默认），3.14。→ [多线程与 GIL](/concurrency/threading)
- **[PEP 11](https://peps.python.org/pep-0011/)**：平台支持政策，判断「哪些行为属于实现而非语言」时的边界文件。→ [CPython 源码解析](/internals/cpython-source)

## 标准库与语言参考

- **[Python Tutorial](https://docs.python.org/3/tutorial/)**：官方入门教程，站内「入门」「数据结构」两段的主题都能在这里找到对应章节。→ [环境搭建](/basics/setup)
- **[The Python Language Reference](https://docs.python.org/3/reference/)**：语言规范本体，「Python 是什么」的权威定义；源码页讲「语言与实现的边界」时以它为准。→ [CPython 源码解析](/internals/cpython-source)
- **[The Python Standard Library](https://docs.python.org/3/library/)**：标准库参考。collections、itertools、functools、pathlib、re、json、datetime 的行为细节都在这里。→ [标准库精选](/engineering/stdlib)
- **[asyncio 文档](https://docs.python.org/3/library/asyncio.html)**：事件循环、协程、`gather`/`TaskGroup`/`timeout` 的完整 API 面。→ [异步编程 asyncio](/concurrency/asyncio)
- **[threading 文档](https://docs.python.org/3/library/threading.html)** 与 **[multiprocessing 文档](https://docs.python.org/3/library/multiprocessing.html)**：线程同步原语与进程启动方式的权威说明；`sys.setswitchinterval` 在 [sys 文档](https://docs.python.org/3/library/sys.html#sys.setswitchinterval)。→ [多线程与 GIL](/concurrency/threading)、[多进程 multiprocessing](/concurrency/multiprocessing)
- **[typing 文档](https://docs.python.org/3/library/typing.html)**：`Protocol`/`TypedDict`/`NewType`/`Literal`/`Final` 的语义定义。→ [类型注解](/advanced/typing)
- **[dataclasses 文档](https://docs.python.org/3/library/dataclasses.html)**：`field` 参数、`__post_init__` 时机、frozen/order/slots 开关。→ [dataclass](/advanced/dataclass)
- **[logging 文档](https://docs.python.org/3/library/logging.html)** 与 [Logging HOWTO](https://docs.python.org/3/howto/logging.html)：分级、Handler、Formatter 的完整配置面。→ [日志与调试](/engineering/logging)
- **[unittest 文档](https://docs.python.org/3/library/unittest.html)**：xUnit 风格框架的断言与夹具。→ [测试](/engineering/testing)
- **[venv 文档](https://docs.python.org/3/library/venv.html)**：虚拟环境的创建、激活与隔离边界。→ [环境搭建](/basics/setup)

## 工具与生态文档

- **[pip](https://pip.pypa.io/)**：包安装器官方文档，约束写法与 `pip check` 等命令说明。→ [环境搭建](/basics/setup)
- **[Python Packaging User Guide](https://packaging.python.org/)**：PyPA 的打包总纲，打包发布一节的整体框架出处。→ [打包与发布](/engineering/packaging)
- **[PyPI Trusted Publishing](https://docs.pypi.org/trusted-publishers/)**：CI 里 OIDC 免 token 上传的官方说明。→ [打包与发布](/engineering/packaging)
- **[build](https://build.pypa.io/)** 与 **[twine](https://twine.readthedocs.io/)**：构建与上传的官方工具文档。→ [打包与发布](/engineering/packaging)
- **[setuptools](https://setuptools.pypa.io/)**：`pyproject.toml` 构建后端的配置说明。→ [打包与发布](/engineering/packaging)
- **[pytest](https://docs.pytest.org/)**：fixture、parametrize、`--cov` 的官方文档。→ [测试](/engineering/testing)
- **[ruff](https://docs.astral.sh/ruff/)**：一个工具同时做检查与格式化。→ [环境搭建](/basics/setup)
- **[uv](https://docs.astral.sh/uv/)**：Rust 实现的包管理器，`uv lock` 跨机器可复现。→ [虚拟环境与依赖管理](/engineering/environments)
- **[Poetry](https://python-poetry.org/)** 与 **[PDM](https://pdm-project.org/)**：依赖+打包一体与 PEP 582/621 路线的两份官方文档。→ [虚拟环境与依赖管理](/engineering/environments)
- **[pyenv](https://github.com/pyenv/pyenv)**：用户级多版本管理。→ [环境搭建](/basics/setup)
