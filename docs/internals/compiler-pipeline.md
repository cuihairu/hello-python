---
description: "The complete pipeline from source to executable bytecode: lexing, PEG parsing, AST preprocessing, symbol table, code generation, CFG optimization and assembly, with citations carrying file line numbers."
---

# The compiler pipeline

Line numbers correspond to the 3.14 branch at commit `66df30d15c9052785ed6463663e70d38107a9edf` (checked out 2026-10-04); for how to clone and the prerequisites for reading, see the [overview](/internals/cpython-source).

The pipeline from source to executable bytecode, with a concrete file behind every step:

| Stage | Where |
| --- | --- |
| Lexing | `_PyTokenizer_Get` at `Parser/lexer/lexer.c:1578` advances token by token; dispatches to one of four implementations under `Parser/tokenizer/` depending on the input source (e.g. `Parser/tokenizer/string_tokenizer.c:131`) |
| Parsing | PEG parser; grammar defined in `Grammar/python.gram`, parser `Parser/parser.c` is a generated artifact (entry `_PyPegen_parse` at `:38121`), driver logic in `Parser/pegen.c:1055` |
| AST | Node definitions in `Parser/Python.asdl`, C structs in the generated `Python/Python-ast.c`; the public API `_PyParser_ASTFromString` (`Parser/peg_api.c:6`), which entries like `PyRun_StringFlags` route through (`Python/pythonrun.c:1282`) |
| AST preprocessing | `_PyAST_Preprocess` (`Python/ast_preprocess.c:971`): constant folding (`fold_binop`, `:369`), docstring stripping, and the PEP 765 return-in-finally check (`:15`); the compiler entry `Python/compile.c:139` calls it as its very first step |
| Symbol table | `_PySymtable_Build` (`Python/symtable.c:413`) scans out the name bindings of every scope; closures and cell variables are settled here |
| Code generation | `_PyCodegen_Module` (`Python/codegen.c:870`) translates the AST straight into an instruction sequence; `compiler_mod` (`Python/compile.c:853`) is the dispatcher on this line |
| CFG optimization | The instruction sequence becomes a basic-block graph (`_PyCfg_FromInstructionSequence`, `Python/flowgraph.c:3954`), block-level optimizations run on it such as dead block elimination and jump threading (`optimize_cfg`, `:2580`; `_PyCfg_OptimizeCodeUnit`, `:3689`), then it is converted back to a linear sequence (`:4057`) |
| Assembly | `_PyAssemble_MakeCodeObject` (`Python/assemble.c:779`) balances the constant pool and computes jump offsets, producing the code object `_PyCode_New` (`Objects/codeobject.c:718`) |
| Before first execution | `_PyCode_Quicken` (`Python/specialize.c:459`) seeds the adaptive counters into `co_code_adaptive` (the call site is `Objects/codeobject.c:587`) |

The direct consequence for people using Python: `compile()` hands you the output of this pipeline; bytecode changes across versions because it is whatever this pipeline currently emits, not a language guarantee.

The emitted instruction sequence is evaluated one instruction at a time by the [interpreter's main loop](/internals/eval-loop), with the specialization counters seeded before first execution.

## References

- [CPython developer guide · compiler internals](https://devguide.python.org/internals/compiler/)
- [CPython developer guide](https://devguide.python.org/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [cpython-source](cpython-source.md)
- [eval-loop](eval-loop.md)
- [official-docs](/zh/knowledge/official-docs)
