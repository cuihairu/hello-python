---
description: 从源码到可执行字节码的完整流水线：词法、PEG 语法分析、AST 预处理、符号表、代码生成、CFG 优化与汇编，引用带文件行号。
---

# 编译管线

行号对应 3.14 分支 commit `66df30d15c9052785ed6463663e70d38107a9edf`（2026-10-04 检出）；克隆方式与阅读前提见[总览](/internals/cpython-source)。

从源码到可执行字节码的流水线，每一步都有明确的文件：

| 阶段 | 位置 |
| --- | --- |
| 词法 | `Parser/lexer/lexer.c:1578` 的 `_PyTokenizer_Get` 逐 token 推进；按输入源分派到 `Parser/tokenizer/` 下的 string/utf8/file/readline 四种实现（如 `Parser/tokenizer/string_tokenizer.c:131`） |
| 语法分析 | PEG 解析器，语法定义 `Grammar/python.gram`，解析器 `Parser/parser.c` 是生成物（入口 `_PyPegen_parse` 在 `:38121`），驱动逻辑在 `Parser/pegen.c:1055` |
| AST | 节点定义 `Parser/Python.asdl`，C 结构在生成的 `Python/Python-ast.c`；公共 API `_PyParser_ASTFromString`（`Parser/peg_api.c:6`），`PyRun_StringFlags` 一类入口经由它（`Python/pythonrun.c:1282`） |
| AST 预处理 | `_PyAST_Preprocess`（`Python/ast_preprocess.c:971`）：常量折叠（`fold_binop`，`:369`）、docstring 摘除、PEP 765 的 return-in-finally 检查（`:15`）；编译器入口 `Python/compile.c:139` 第一步就调它 |
| 符号表 | `_PySymtable_Build`（`Python/symtable.c:413`）扫出每个作用域的名字绑定，闭包和 cell 变量在这里定型 |
| 代码生成 | `_PyCodegen_Module`（`Python/codegen.c:870`）把 AST 直译成指令序列；`compiler_mod`（`Python/compile.c:853`）是这条线的调度者 |
| CFG 优化 | 指令序列转成基本块图（`_PyCfg_FromInstructionSequence`，`Python/flowgraph.c:3954`），做死块消除、跳转穿透等块级优化（`optimize_cfg`，`:2580`；`_PyCfg_OptimizeCodeUnit`，`:3689`），再转回线性序列（`:4057`） |
| 汇编 | `_PyAssemble_MakeCodeObject`（`Python/assemble.c:779`）配平常量池、算跳转偏移，产出代码对象 `_PyCode_New`（`Objects/codeobject.c:718`） |
| 首次执行前 | `_PyCode_Quicken`（`Python/specialize.c:459`）把自适应计数器种进 `co_code_adaptive`（调用点在 `Objects/codeobject.c:587`） |

对 Python 使用者的直接推论：`compile()` 拿到的是这套管线的产物；字节码随版本变，因为它是这条流水线当前的输出，不是语言承诺。

产出的指令序列由[解释器主循环](/internals/eval-loop)逐条求值，特化计数器在首次执行前种入。
