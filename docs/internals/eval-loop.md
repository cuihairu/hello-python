---
description: 求值循环的三种分发模式、bytecodes.c 指令定义与生成物、自适应特化的计数与退避，以及 tier-2 优化器与 JIT，引用带文件行号。
---

# 解释器主循环

行号对应 3.14 分支 commit `66df30d15c9052785ed6463663e70d38107a9edf`（2026-10-04 检出）；克隆方式与阅读前提见[总览](/internals/cpython-source)。

## 分发：三种模式编译期二选一

字节码求值主体是 `_PyEval_EvalFrameDefault`（`Python/ceval.c:1148`）。函数开头备好局部「寄存器」：`next_instr` 指向下一条指令，`stack_pointer` 指向值栈顶。指令体不在 `ceval.c` 里手写，函数尾部直接包含生成的 `generated_cases.c.h`（`Python/ceval.c:1257`）；尾调用构建下这份生成物改在函数外包含（`Python/ceval.c:1124`），指令体编成一个个独立函数。

分发有三种模式，由 `Python/ceval_macros.h` 在编译期决定：

- 尾调用模式（`--with-tail-call-interp` 显式开启，`configure.ac:7282`）：每条指令编成独立函数，`TARGET(op)` 展开为 `Py_PRESERVE_NONE_CC PyObject *_TAIL_CALL_##op(...)`（`Python/ceval_macros.h:95`），`DISPATCH_GOTO` 是带 `[[clang::musttail]]` 的尾调用（`:85`、`:96`），要求 clang 或 GCC 15 的 `preserve_none`/`musttail` 支持；
- computed goto（GCC/clang 默认）：`TARGET` 是标签，`DISPATCH_GOTO` 是 `goto *opcode_targets[opcode]`（`Python/ceval_macros.h:116`），跳表是生成的 `opcode_targets.h`；
- switch 兜底（`Python/ceval_macros.h:122`），给不认识这两种语法的编译器。

`USE_COMPUTED_GOTOS` 默认值按编译器能力自动定（`Python/ceval_macros.h:51`）。无论哪种模式，`DISPATCH()` 宏（`Python/ceval_macros.h:161`）都是「取下一条指令、跳过去」。

## 指令定义在 bytecodes.c，C 文件是生成物

人写指令的地方是 `Python/bytecodes.c`，文件头注释写明它由 `Tools/cases_generator/` 消费（`Python/bytecodes.c:1`）。`inst(名字, 栈效果)` 定义一条完整指令，`op(...)` 定义可复用的部件（`Python/bytecodes.c:51`）。`make` 里有对应的再生规则（`Makefile.pre.in:2143`），一次生成六个产物：操作码编号、跳表、uop 编号、Python 侧元数据、`generated_cases.c.h` 和 tier-2 的 `executor_cases.c.h`。

两条值得认识的指令：

- `_CHECK_PERIODIC`（`Python/bytecodes.c:155`）：检查求值中断位，信号、GIL 让位请求都从这里进主循环；
- `LOAD_FAST` 被 `replicate(8)` 复制了八份（`Python/bytecodes.c:277`），让跳表对不同位置的局部变量加载分布更密，这是 3.14 的新花样。

## 自适应特化：热路径换专用指令

通用指令执行时带着一个 16 位倒计时计数器，结构是 12 位计数加 4 位退避档位（`Include/internal/pycore_backoff.h:16`）。以 `BINARY_OP` 为例，生成代码先读指令内联缓存槽里的计数器（`Python/generated_cases.c.h:39`），没数满就 `ADVANCE_ADAPTIVE_COUNTER` 继续用通用路径；数满则调 `_Py_Specialize_BinaryOp`（`Python/specialize.c:2578`）把这条指令原地改写成专用版本，之后命中 `BINARY_OP_ADD_FLOAT`（`Python/generated_cases.c.h:84`）、`BINARY_OP_ADD_INT`（`:142`）、`BINARY_OP_ADD_UNICODE`（`:202`）这类入口，直接做类型特化运算。`LOAD_ATTR` 同理，特化入口在 `_Py_Specialize_LoadAttr`（`Python/specialize.c:1345`），实例属性、类属性、slot 各有专用指令。

退避机制的意义在失败重试：特化发现类型又变了，计数器按指数退避重置，避免在多态调用点上反复特化反复作废。

3.14 还留着 tier-2 微指令优化器和可选 JIT：`Python/optimizer.c` 生成执行器，求值循环里 `_Py_TIER2`/`_Py_JIT` 分支接管热代码（`Python/ceval.c:1244`、`:1266`），JIT 要 `--enable-experimental-jit` 才编译（`configure.ac:2845`），默认构建两者都不启用。

字节码是[编译管线](/internals/compiler-pipeline)的产物，特化计数器的播种（`_PyCode_Quicken`）也发生在那条流水线的末端。
