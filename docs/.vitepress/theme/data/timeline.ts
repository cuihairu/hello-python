// Python 发展史时间线（1989 → 2026）
// 每条记录回答：这件事为什么发生在那个时点（why），它与站内哪个章节呼应（link）。
// field 用于筛选：core 语言核心 / concurrency 并发模型 / ecosystem 生态与工具 / engineering 工程实践
// 年份口径：取「能力或机制落地」的时点（发布/入库/成立），不是被广泛采用的时点。
//
// 双语数据成对维护：TIMELINE/ERAS/FIELD_LABELS 是英文（根目录站），
// TIMELINE_ZH/ERAS_ZH/FIELD_LABELS_ZH 是中文（/zh/ 站），zh 的 link 带 /zh/ 前缀。
// 条目必须逐条对应（同 year/month/field/link），scripts/check_timeline.py 双语各校验一遍。

export interface TimelineEvent {
  year: number
  month?: number
  title: string
  who: string
  field: 'core' | 'concurrency' | 'ecosystem' | 'engineering'
  why: string
  link?: string
}

export interface TimelineEra {
  name: string
  from: number
  to: number
  intro: string
}

export const FIELD_LABELS: Record<TimelineEvent['field'], string> = {
  core: 'Language core',
  concurrency: 'Concurrency',
  ecosystem: 'Ecosystem',
  engineering: 'Engineering',
}

export const ERAS = [
  {
    name: 'Birth & Foundations',
    from: 1989,
    to: 2000,
    intro: 'A Christmas-holiday personal project grows into a language: the object model, core containers and the first generation of the standard library take shape within four years; over the following decade it works its way into classrooms and sysadmin desks, picking up the first "serious users".',
  },
  {
    name: 'Community & Ecosystem Take Shape',
    from: 2001,
    to: 2007,
    intro: 'The parts outside the language start organizing: a foundation takes over the assets, a package index opens a central door, and packaging, isolation and testing tools arrive one after another — "serious engineering with Python" gets a foundation for the first time.',
  },
  {
    name: 'The 3.x Bet & the Concurrency Turn',
    from: 2008,
    to: 2015,
    intro: 'Historical debt is repaid even at the cost of breaking compatibility; in the same year an installer and a multiprocessing model land, then the event loop joins the standard library and async/await gets native syntax — concurrency goes from "threads are the only road" to picking per bottleneck.',
  },
  {
    name: 'Modernization & Speed',
    from: 2016,
    to: 2026,
    intro: 'Packaging moves to declarative config, type hints grow into front-stage citizens, and the annual release rhythm brings pattern matching and interpreter speedups; Python 2 finally bows out, and free threading starts rewriting thirty-seven years of concurrency assumptions.',
  },
]

export const TIMELINE: TimelineEvent[] = [
  { year: 1989, month: 12, title: 'The Christmas project: CPython begins', who: 'Guido van Rossum', field: 'core',
    why: 'CWI\'s ABC language was readable but resisted extension, while the Amoeba system lacked a scripting language that could make system calls. Guido spent the Christmas holiday writing the first interpreter: it inherited ABC\'s readability and added the extensibility and system access ABC withheld. The name came from Monty Python, setting the community\'s self-deprecating tone for good.', link: '/basics/setup' },
  { year: 1991, month: 2, title: '0.9.0 released: classes, exceptions, functions already in', who: 'Guido van Rossum', field: 'core',
    why: 'The first public release shipped with classes, exceptions, functions and the core containers — proof this was not a toy script but a language with its own object model. The "batteries included" orientation was there from version one.', link: '/advanced/oop' },
  { year: 1994, month: 1, title: '1.0: lambda, map, filter, reduce', who: 'Guido van Rossum', field: 'core',
    why: 'The functional four came in with the Lisp community\'s influence, answering early users\' wish for concise transformations. reduce\'s removal from builtins in 3.0 is a footnote to thirty years of tug-of-war between two expression philosophies.', link: '/basics/functions' },
  { year: 2000, month: 10, title: '2.0: list comprehensions and cyclic GC', who: 'Guido van Rossum', field: 'core',
    why: 'List comprehensions, inherited from ABC/SETL, replaced map/filter compositions; reference cycles that refcounting could not collect were handed to a new cycle detector. For the next decade, 2.x was simply synonymous with "Python".', link: '/datastructures/list-tuple' },
  { year: 2001, month: 3, title: 'PSF founded: the language gets a legal entity', who: 'Python community', field: 'ecosystem',
    why: 'The CNRI–BeOpen copyright handover exposed the risk: trademarks, copyrights and PyCon all needed a neutral nonprofit to hold them. The Python Software Foundation turned the language from a company project into community-owned property.' },
  { year: 2001, month: 4, title: 'unittest enters the standard library', who: 'Steve Purcell (PyUnit)', field: 'engineering',
    why: '2.1 absorbed PyUnit, with its assertion and fixture structure modeled on JUnit. A test framework in the standard library turned "writing tests" from a personal habit into the team default; pytest\'s later popularity built on the run model it defined.', link: '/engineering/testing' },
  { year: 2003, title: 'PyPI goes live (the Cheese Shop)', who: 'Python community', field: 'ecosystem',
    why: 'Sharing packages had relied on personal homepages and mailing lists, with indexes scattered everywhere. PyPI provided unified uploads and a single namespace — "install a third-party library" got a central entry point for the first time, and easy_install and pip both later made it their destination.', link: '/engineering/packaging' },
  { year: 2004, month: 9, title: 'setuptools and the EGG format', who: 'Phillip J. Eby', field: 'ecosystem',
    why: 'distutils only solved "installing", not dependencies. setuptools added dependency declarations and easy_install, with EGG as the earliest binary distribution format; it dominated packaging for nearly a decade without ever going through a PEP, sowing the seeds of the later packaging-route disputes.', link: '/engineering/packaging' },
  { year: 2005, month: 7, title: 'Django open-sourced', who: 'Adrian Holovaty, Simon Willison', field: 'ecosystem',
    why: 'Newsroom rhythms demanded "site built means site live"; Django bundled ORM, templates and an admin site into one full stack. It proved Python\'s engineering efficiency for full-stack web work and carried the language into the web era.' },
  { year: 2006, month: 9, title: '2.5: the with statement (PEP 343)', who: 'Guido van Rossum, Philip J. Eby', field: 'core',
    why: 'try/finally cleanup boilerplate saturated file, lock and transaction code. The context manager protocol abstracted "symmetric entry and exit" into a reusable language facility — resource management became plug-and-play for the first time.', link: '/advanced/context-managers' },
  { year: 2006, month: 10, title: 'NumPy 1.0: array primitives unified', who: 'Travis Oliphant', field: 'ecosystem',
    why: 'Scientific computing had been bled dry by the Numeric/Numarray split; Oliphant merged the two into NumPy: one ndarray with broadcasting semantics. pandas, scikit-learn and PyTorch all later stood on this array primitive.' },
  { year: 2007, month: 9, title: 'virtualenv is born', who: 'Ian Bicking', field: 'ecosystem',
    why: 'Multiple projects on one machine fought over the same site-packages, trampling each other\'s versions. virtualenv isolated a per-project interpreter environment — "a project ships its own dependencies" became possible; the idea was later absorbed into the standard library as venv (3.3).', link: '/engineering/environments' },
  { year: 2008, month: 10, title: 'pip arrives (originally pyinstall)', who: 'Ian Bicking', field: 'ecosystem',
    why: 'easy_install could install but not uninstall, and its dependency resolution was chaotic. Bicking rewrote the installer on top of setuptools: uninstallable, version-pinnable. PyPA took over in 2010, and pip became the de facto standard installer.', link: '/engineering/environments' },
  { year: 2008, month: 10, title: 'multiprocessing enters the standard library (PEP 371)', who: 'Jesse Noller, Richard Oudkerk', field: 'concurrency',
    why: 'Under the GIL, multicore meant multiple processes. multiprocessing put a thread-style API on top of processes, throwing in queues and process pools; standard-library concurrency has been a three-way choice ever since — threads, processes, and later coroutines.', link: '/concurrency/multiprocessing' },
  { year: 2008, month: 12, title: '3.0: "incompatible fixes"', who: 'Guido van Rossum & the core team', field: 'core',
    why: 'print became a function, str became unicode, integer division regained intuition — 3.0 paid off 2.x\'s historical debt in one go, at the price of an ecosystem break and a decade of dual-version maintenance. In hindsight, Python\'s most expensive and most worthwhile refactor.', link: '/basics/syntax' },
  { year: 2014, month: 3, title: '3.4: asyncio in the standard library (PEP 3156)', who: 'Guido van Rossum', field: 'concurrency',
    why: 'Node.js and Twisted had proven the value of event loops, but each framework\'s loop was incompatible with the others. PEP 3156 standardized the event loop, coroutines and transports into the standard library — single-threaded high concurrency got an official answer.', link: '/concurrency/asyncio' },
  { year: 2014, month: 8, title: 'PEP 484: a standard for type hints', who: 'Guido van Rossum, Łukasz Langa', field: 'engineering',
    why: 'The annotation syntax had existed since 3.0 but long stayed without semantics, with checkers each going their own way. PEP 484 standardized a gradual type system: annotations optional, tooling optional — IDEs and type checkers finally shared one vocabulary.', link: '/advanced/typing' },
  { year: 2015, month: 9, title: '3.5: async/await (PEP 492)', who: 'Yury Selivanov', field: 'concurrency',
    why: 'Simulating coroutines with generators ran, but the semantics were murky. PEP 492 introduced native coroutines and the await keyword — async code grew a synchronous skin, a syntax later borrowed by JavaScript and other languages.', link: '/concurrency/asyncio' },
  { year: 2016, month: 5, title: 'pyproject.toml (PEP 518)', who: 'Nathaniel J. Smith', field: 'ecosystem',
    why: 'Installing build tools required setup.py first — a chicken-and-egg problem. PEP 518 moved build-dependency declarations into a toml file; PEP 517 then defined declarative build backends, giving "farewell to setup.py" an official route.', link: '/engineering/packaging' },
  { year: 2016, month: 12, title: '3.6: f-strings (PEP 498)', who: 'Eric V. Smith', field: 'core',
    why: '%-formatting and str.format split expressions from positions, and long templates drifted out of alignment. f-strings embedded expressions into the literal — faster and more readable, and the default way to format strings ever since.', link: '/datastructures/string-formatting' },
  { year: 2018, month: 6, title: '3.7: dataclasses (PEP 557)', who: 'Eric V. Smith', field: 'core',
    why: 'Nobody had been happy with "class that holds data" boilerplate since the namedtuple era. @dataclass automated the generation of __init__, __repr__ and __eq__, configuration over convention — also a case of the attrs library\'s years of practice flowing back into the standard library.', link: '/advanced/dataclass' },
  { year: 2019, month: 10, title: '3.8: the walrus operator (PEP 572)', who: 'Chris Angelico, Guido van Rossum', field: 'core',
    why: '"Assign first, then test" duplicated expressions all over loops and comprehensions. := let an expression carry an assignment, yet its readability controversy triggered the fiercest PEP debate in history — a footnote to the community\'s governance turn.', link: '/basics/variables-and-types' },
  { year: 2020, month: 1, title: 'Python 2 EOL', who: 'Python core team', field: 'engineering',
    why: 'Originally due to end in 2015, extended to 2020-01-01 to give the ecosystem migration time — no security patches after that. The decade-long dual-version burden lifted, and the core team could throw its full weight behind modernizing 3.x.', link: '/engineering/environments' },
  { year: 2020, month: 10, title: '3.9: dict merge and the PEG parser', who: "Steven D'Aprano (PEP 584), Guido van Rossum (PEP 617)", field: 'core',
    why: 'Dictionaries gained the | operator; the deeper change was in the engine room: the thirty-year-old pgen parser was rewritten as PEG, releasing a long-standing constraint on future syntax evolution.', link: '/datastructures/dict-set' },
  { year: 2021, month: 10, title: '3.10: structural pattern matching (PEP 634)', who: 'Brandt Bucher, Guido van Rossum', field: 'core',
    why: 'Branching over deeply nested data had grown into uncontrollable if-chains. match/case unified destructuring and branching, with semantics drawn from functional languages\' pattern matching — the biggest syntax expansion since 3.0.', link: '/datastructures/list-tuple' },
  { year: 2022, month: 10, title: '3.11: exception groups and Faster CPython', who: 'Yury Selivanov (PEP 654), Guido van Rossum (Faster CPython)', field: 'engineering',
    why: 'The first major release after Microsoft formed the Faster CPython team: 10-60% average interpreter speedup; exception groups made "raise a batch of exceptions together" expressible, completing error handling for async and multitasking.', link: '/advanced/exceptions' },
  { year: 2023, month: 10, title: '3.12: type parameter syntax (PEP 695)', who: 'Eric Traut', field: 'core',
    why: 'Generics previously required functional TypeVar assembly — boilerplate wound around every declaration. class Foo[T] writes type parameters directly, on par with static languages; the type system became a front-stage citizen of the language.', link: '/advanced/typing' },
  { year: 2024, month: 10, title: '3.13: experimental free-threaded build (PEP 703)', who: 'Sam Gross', field: 'concurrency',
    why: 'After thirty years of GIL debate, the No-GIL branch proved feasible in 2023 and entered 3.13 as an optional build: reference counting went suspended, and threads could finally run CPU-bound work in parallel. The default build kept the GIL — the official bet stayed two-legged.', link: '/concurrency/threading' },
  { year: 2025, month: 10, title: '3.14: free threading goes official (PEP 779)', who: 'Sam Gross & the Faster CPython team', field: 'concurrency',
    why: 'Once the experimental 3.13 build\'s ecosystem-compatibility issues were cleared one by one, the free-threaded build was promoted to officially supported (still not the default). The GIL was demoted from "fact of the language" to "build option", and thirty-seven years of concurrency assumptions began to loosen.', link: '/concurrency/threading' },
  { year: 2025, month: 10, title: '3.14: template strings, t-strings (PEP 750)', who: 'Jim Baker, Guido van Rossum, et al.', field: 'core',
    why: 'f-strings can only produce strings, leaving web-template and SQL-injection risks to developer discipline. t-strings produce template objects, handing rendering and escaping decisions to libraries — deferred evaluation gives safe handling a language-level hook.', link: '/datastructures/string-formatting' },
]

export const FIELD_LABELS_ZH: Record<TimelineEvent['field'], string> = {
  core: '语言核心',
  concurrency: '并发模型',
  ecosystem: '生态与工具',
  engineering: '工程实践',
}

export const ERAS_ZH = [
  {
    name: '诞生与奠基',
    from: 1989,
    to: 2000,
    intro: '一个圣诞假期的个人项目长成一门语言：对象模型、核心容器与第一代标准库在最初四年里定型，随后十年它走进教学与系统管理现场，攒下第一批「正经用户」。',
  },
  {
    name: '社区与生态成形',
    from: 2001,
    to: 2007,
    intro: '语言之外的部分开始组织化：基金会接管资产，包索引给出中心入口，打包、隔离与测试工具接连出现，「用 Python 做正经工程」第一次有了地基。',
  },
  {
    name: '3.x 抉择与并发转身',
    from: 2008,
    to: 2015,
    intro: '为还清历史债不惜断开兼容，同一年里安装器与多进程模型先后落位；接着事件循环进入标准库、async/await 给了原生语法，并发从「线程一条路」变成可以按瓶颈选型。',
  },
  {
    name: '现代化与提速',
    from: 2016,
    to: 2026,
    intro: '打包迁向声明式配置，类型注解长成前台公民，年度节奏的版本带来模式匹配与解释器提速；Python 2 终于落幕，自由线程开始改写三十七年的并发假设。',
  },
]

export const TIMELINE_ZH: TimelineEvent[] = [
  { year: 1989, month: 12, title: '圣诞项目：CPython 起点', who: 'Guido van Rossum', field: 'core',
    why: 'CWI 的 ABC 语言好读但拒人扩展，Amoeba 系统又缺一个能调系统调用的脚本语言。Guido 趁圣诞假期写出第一个解释器：继承 ABC 的可读性，补上 ABC 不给的扩展能力与系统访问。名字取自 Monty Python，社区的自嘲幽默从此定了底色。', link: '/zh/basics/setup' },
  { year: 1991, month: 2, title: '0.9.0 发布：类、异常、函数已在', who: 'Guido van Rossum', field: 'core',
    why: '第一个公开版本就带上类、异常、函数与核心容器，说明这不是玩具脚本，而是自带对象模型的语言；「电池含在里」的取向从第一版开始。', link: '/zh/advanced/oop' },
  { year: 1994, month: 1, title: '1.0：lambda、map、filter、reduce', who: 'Guido van Rossum', field: 'core',
    why: '函数式四件套来自 Lisp 社区的影响，回应早期用户对「简洁表达变换」的期待。reduce 后来在 3.0 被移出内置，恰好是两种表达哲学拉锯三十年的注脚。', link: '/zh/basics/functions' },
  { year: 2000, month: 10, title: '2.0：列表推导与循环垃圾回收', who: 'Guido van Rossum', field: 'core',
    why: '列表推导承自 ABC/SETL，取代 map/filter 的组合写法；引用计数处理不了的循环引用交给新的循环检测器兜底。此后十年，2.x 就是「Python」的同义词。', link: '/zh/datastructures/list-tuple' },
  { year: 2001, month: 3, title: 'PSF 成立：语言有了法人', who: 'Python 社区', field: 'ecosystem',
    why: 'CNRI 与 BeOpen 的版权交接让社区看清风险：商标、版权与 PyCon 都需要中立的非营利组织持有。Python 软件基金会把语言从公司项目变成社区共有资产。' },
  { year: 2001, month: 4, title: 'unittest 入标准库', who: 'Steve Purcell（PyUnit）', field: 'engineering',
    why: '2.1 收编 PyUnit，断言与夹具结构取自 JUnit。标准库自带测试框架，「写测试」从个人习惯变成团队默认；多年后 pytest 的流行也是在它定义的跑法上改进。', link: '/zh/engineering/testing' },
  { year: 2003, title: 'PyPI 上线（Cheese Shop）', who: 'Python 社区', field: 'ecosystem',
    why: '分享包此前靠个人主页与邮件列表，索引散乱。PyPI 给出统一上传与命名空间，「装一个第三方库」第一次有了中心入口，此后 easy_install 与 pip 都以它为目的地。', link: '/zh/engineering/packaging' },
  { year: 2004, month: 9, title: 'setuptools 与 EGG 格式', who: 'Phillip J. Eby', field: 'ecosystem',
    why: 'distutils 只解决「装」，不管依赖。setuptools 补上依赖声明与 easy_install，EGG 是最早的二进制分发格式；它未经 PEP 却统治打包近十年，也为后来的打包路线之争埋下伏笔。', link: '/zh/engineering/packaging' },
  { year: 2005, month: 7, title: 'Django 开源', who: 'Adrian Holovaty、Simon Willison', field: 'ecosystem',
    why: '新闻编辑室的节奏要求「建站即上线」，Django 把 ORM、模板与管理后台打包成全家桶。它证明 Python 在 Web 全栈的工程效率，把语言推进 Web 时代。' },
  { year: 2006, month: 9, title: '2.5：with 语句（PEP 343）', who: 'Guido van Rossum、Philip J. Eby', field: 'core',
    why: 'try/finally 清理样板遍布文件、锁与事务代码。上下文管理器协议把「进出对称」抽象成可复用的语言设施，资源管理第一次即插即用。', link: '/zh/advanced/context-managers' },
  { year: 2006, month: 10, title: 'NumPy 1.0：数组原语统一', who: 'Travis Oliphant', field: 'ecosystem',
    why: '科学计算此前被 Numeric 与 Numarray 分裂消耗，Oliphant 把两者合并为 NumPy：统一的 ndarray 与广播语义。此后 pandas、scikit-learn、PyTorch 全部站在这个数组原语上。' },
  { year: 2007, month: 9, title: 'virtualenv 诞生', who: 'Ian Bicking', field: 'ecosystem',
    why: '一台机器多项目抢同一套 site-packages，版本互相踩踏。virtualenv 隔离出项目各自的解释器环境，「项目自带依赖」从此成立；这个思路后来被标准库 venv（3.3）收编。', link: '/zh/engineering/environments' },
  { year: 2008, month: 10, title: 'pip 问世（前身 pyinstall）', who: 'Ian Bicking', field: 'ecosystem',
    why: 'easy_install 装得上卸不掉、依赖解析混乱。Bicking 在 setuptools 之上重写安装器：可卸载、可锁版本。2010 年起 PyPA 接管，pip 成为事实上的标准安装器。', link: '/zh/engineering/environments' },
  { year: 2008, month: 10, title: 'multiprocessing 入标准库（PEP 371）', who: 'Jesse Noller、Richard Oudkerk', field: 'concurrency',
    why: 'GIL 之下多核只能开出多进程。multiprocessing 把线程式 API 套在进程上，附赠队列与进程池；标准库的并发自此三选一：线程、进程，以及后来的协程。', link: '/zh/concurrency/multiprocessing' },
  { year: 2008, month: 12, title: '3.0：「不兼容的修正」', who: 'Guido van Rossum 与核心团队', field: 'core',
    why: 'print 变函数、str 即 unicode、整数除法回归直觉，3.0 一次还清 2.x 的历史债，代价是生态断代与十年双版本维护。回头看，它是 Python 最贵也最值的一次重构。', link: '/zh/basics/syntax' },
  { year: 2014, month: 3, title: '3.4：asyncio 入标准库（PEP 3156）', who: 'Guido van Rossum', field: 'concurrency',
    why: 'Node.js 与 Twisted 证明事件循环的价值，但各框架循环互不相通。PEP 3156 把事件循环、协程与传输层标准化进标准库，单线程高并发有了官方答案。', link: '/zh/concurrency/asyncio' },
  { year: 2014, month: 8, title: 'PEP 484：类型注解标准', who: 'Guido van Rossum、Łukasz Langa', field: 'engineering',
    why: '注解语法 3.0 就有却迟迟没有语义，检查器各自为战。PEP 484 把渐进类型系统定为标准：注解可选、工具可选，IDE 与类型检查器从此共享同一套词汇。', link: '/zh/advanced/typing' },
  { year: 2015, month: 9, title: '3.5：async/await（PEP 492）', who: 'Yury Selivanov', field: 'concurrency',
    why: '用生成器模拟协程能跑但语义含混。PEP 492 给出原生协程与 await 关键字，异步代码长出了同步的皮，这套语法后来也被 JavaScript 等语言借鉴。', link: '/zh/concurrency/asyncio' },
  { year: 2016, month: 5, title: 'pyproject.toml（PEP 518）', who: 'Nathaniel J. Smith', field: 'ecosystem',
    why: '装构建工具本身得先有 setup.py，鸡生蛋。PEP 518 把构建依赖声明进 toml 文件，随后 PEP 517 定义声明式构建后端，「告别 setup.py」有了正式路线。', link: '/zh/engineering/packaging' },
  { year: 2016, month: 12, title: '3.6：f-string（PEP 498）', who: 'Eric V. Smith', field: 'core',
    why: '%-format 与 str.format 把表达式和位置拆开，模板长了就错位。f-string 把表达式内嵌进字面量，更快也更可读，成为此后字符串格式化的默认写法。', link: '/zh/datastructures/string-formatting' },
  { year: 2018, month: 6, title: '3.7：dataclasses（PEP 557）', who: 'Eric V. Smith', field: 'core',
    why: '「装数据的类」样板从 namedtuple 时代就没人满意。@dataclass 把 __init__、__repr__、__eq__ 的生成自动化，配置高于约定；这也是 attrs 库多年实践反向流入标准库的案例。', link: '/zh/advanced/dataclass' },
  { year: 2019, month: 10, title: '3.8：海象运算符（PEP 572）', who: 'Chris Angelico、Guido van Rossum', field: 'core',
    why: '「先赋值再判断」的重复表达式遍布循环与推导式。:= 让表达式可以附带赋值，却也因可读性争议引发史上最激烈的 PEP 讨论，成为社区治理转向的注脚。', link: '/zh/basics/variables-and-types' },
  { year: 2020, month: 1, title: 'Python 2 EOL', who: 'Python 核心团队', field: 'engineering',
    why: '原定 2015 年终止，为给生态留出迁移时间延到 2020-01-01，此后不再有安全补丁。双版本十年的重担卸下，核心团队得以全力投入 3.x 的现代化。', link: '/zh/engineering/environments' },
  { year: 2020, month: 10, title: '3.9：dict 合并与 PEG 解析器', who: "Steven D'Aprano（PEP 584）、Guido van Rossum（PEP 617）", field: 'core',
    why: '字典合并有了 | 运算符；更深的变动在引擎室：服役三十年的 pgen 解析器被 PEG 重写，为后续语法演进解除长期束缚。', link: '/zh/datastructures/dict-set' },
  { year: 2021, month: 10, title: '3.10：结构化模式匹配（PEP 634）', who: 'Brandt Bucher、Guido van Rossum', field: 'core',
    why: '深层嵌套数据的分支判断靠 if 链长到失控。match/case 把解构与分支合一，语义取自函数式语言的模式匹配，是 3.0 之后最大的一次语法扩容。', link: '/zh/datastructures/list-tuple' },
  { year: 2022, month: 10, title: '3.11：异常组与 Faster CPython 提速', who: 'Yury Selivanov（PEP 654）、Guido van Rossum（Faster CPython）', field: 'engineering',
    why: '微软组建 Faster CPython 团队后的第一个大版本：解释器平均提速 10-60%；异常组让「一批异常一起抛」可表达，异步与多任务的错误处理补上最后一块。', link: '/zh/advanced/exceptions' },
  { year: 2023, month: 10, title: '3.12：类型参数语法（PEP 695）', who: 'Eric Traut', field: 'core',
    why: '泛型此前要靠 TypeVar 函数式拼装，样板绕人。class Foo[T] 直接写类型参数，与静态语言看齐，类型系统自此成为语言前台的公民。', link: '/zh/advanced/typing' },
  { year: 2024, month: 10, title: '3.13：实验性自由线程构建（PEP 703）', who: 'Sam Gross', field: 'concurrency',
    why: 'GIL 争论三十年，No-GIL 分支在 2023 年证明可行后进入 3.13 作为可选构建：引用计数改挂式，多线程可以真正并行 CPU 任务。默认构建仍带 GIL，官方两条腿走路。', link: '/zh/concurrency/threading' },
  { year: 2025, month: 10, title: '3.14：自由线程转正（PEP 779）', who: 'Sam Gross 与 Faster CPython 团队', field: 'concurrency',
    why: '3.13 实验版的生态兼容问题逐个排掉后，free-threaded 构建升格为官方支持（仍非默认）。GIL 从「语言事实」降级为『构建选项』，三十七年的并发假设开始松动。', link: '/zh/concurrency/threading' },
  { year: 2025, month: 10, title: '3.14：模板字符串 t-string（PEP 750）', who: 'Jim Baker、Guido van Rossum 等', field: 'core',
    why: 'f-string 只能产出字符串，Web 模板与 SQL 拼接的注入风险全靠自觉。t-string 产出模板对象，交由库决定如何渲染与转义，延迟求值让安全处理有了语言级挂点。', link: '/zh/datastructures/string-formatting' },
]
