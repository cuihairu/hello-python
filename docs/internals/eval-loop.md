---
description: The eval loop's three dispatch modes, the instruction definitions and generated artifacts of bytecodes.c, the counting and backoff of adaptive specialization, plus the tier-2 optimizer and JIT, with citations carrying file line numbers.
---

# The interpreter's main loop

Line numbers correspond to the 3.14 branch at commit `66df30d15c9052785ed6463663e70d38107a9edf` (checked out 2026-10-04); for how to clone and the prerequisites for reading, see the [overview](/internals/cpython-source).

## Dispatch: three modes, chosen at compile time

The main body of bytecode evaluation is `_PyEval_EvalFrameDefault` (`Python/ceval.c:1148`). The function starts by setting up local "registers": `next_instr` points at the next instruction, `stack_pointer` at the top of the value stack. The instruction bodies are not hand-written in `ceval.c`; the end of the function includes the generated `generated_cases.c.h` directly (`Python/ceval.c:1257`). In a tail-call build that generated file is included outside the function instead (`Python/ceval.c:1124`), and each instruction body is compiled as its own function.

Dispatch comes in three modes, decided at compile time by `Python/ceval_macros.h`:

- Tail-call mode (enabled explicitly with `--with-tail-call-interp`, `configure.ac:7282`): each instruction is compiled as its own function, `TARGET(op)` expands to `Py_PRESERVE_NONE_CC PyObject *_TAIL_CALL_##op(...)` (`Python/ceval_macros.h:95`), and `DISPATCH_GOTO` is a tail call annotated `[[clang::musttail]]` (`:85`, `:96`), which requires clang or GCC 15 support for `preserve_none`/`musttail`;
- computed goto (the GCC/clang default): `TARGET` is a label and `DISPATCH_GOTO` is `goto *opcode_targets[opcode]` (`Python/ceval_macros.h:116`); the jump table is the generated `opcode_targets.h`;
- a switch fallback (`Python/ceval_macros.h:122`) for compilers that do not know either of those constructs.

The default for `USE_COMPUTED_GOTOS` is set automatically from compiler capability (`Python/ceval_macros.h:51`). In every mode the `DISPATCH()` macro (`Python/ceval_macros.h:161`) means the same thing: take the next instruction and jump to it.

## Instruction definitions live in bytecodes.c; the C files are generated

The place where instructions are written by hand is `Python/bytecodes.c`, whose file-header comment says it is consumed by `Tools/cases_generator/` (`Python/bytecodes.c:1`). `inst(name, stack effect)` defines a complete instruction and `op(...)` defines a reusable component (`Python/bytecodes.c:51`). `make` has the matching regeneration rule (`Makefile.pre.in:2143`), which produces six artifacts at once: opcode numbers, the jump table, uop numbers, Python-side metadata, `generated_cases.c.h`, and the tier-2 `executor_cases.c.h`.

Two instructions worth knowing:

- `_CHECK_PERIODIC` (`Python/bytecodes.c:155`): checks the evaluation-interrupt bit, which is where signals and GIL switch requests enter the main loop;
- `LOAD_FAST` is replicated eight times by `replicate(8)` (`Python/bytecodes.c:277`), so the jump table spreads local-variable loads across more addresses; this is a new trick in 3.14.

## Adaptive specialization: hot paths get dedicated instructions

A generic instruction runs with a 16-bit countdown counter, structured as a 12-bit count plus a 4-bit backoff tier (`Include/internal/pycore_backoff.h:16`). Take `BINARY_OP`: the generated code first reads the counter out of the instruction's inline cache slot (`Python/generated_cases.c.h:39`). If it has not run out, `ADVANCE_ADAPTIVE_COUNTER` keeps the generic path going; when it hits zero, `_Py_Specialize_BinaryOp` (`Python/specialize.c:2578`) rewrites that instruction in place into a specialized version, which then lands on entries like `BINARY_OP_ADD_FLOAT` (`Python/generated_cases.c.h:84`), `BINARY_OP_ADD_INT` (`:142`), `BINARY_OP_ADD_UNICODE` (`:202`) and does the type-specialized arithmetic directly. `LOAD_ATTR` works the same way, with the specialization entry at `_Py_Specialize_LoadAttr` (`Python/specialize.c:1345`); instance attributes, class attributes, and slots each get their own dedicated instruction.

The point of backoff is failing retries: when specialization finds the types have changed again, the counter is reset exponentially, so a polymorphic call site does not specialize and then invalidate over and over.

3.14 still carries a tier-2 micro-op optimizer and an optional JIT: `Python/optimizer.c` generates the executor, and the `_Py_TIER2`/`_Py_JIT` branches in the eval loop take over hot code (`Python/ceval.c:1244`, `:1266`). The JIT only compiles in with `--enable-experimental-jit` (`configure.ac:2845`), and the default build enables neither.

Bytecode is the output of the [compiler pipeline](/internals/compiler-pipeline), and seeding the specialization counters (`_PyCode_Quicken`) happens at the end of that same pipeline.

## References

- [CPython developer guide](https://devguide.python.org/)
- [Python official docs · performance profiling (perf)](https://docs.python.org/3/howto/perf_profiling.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [compiler-pipeline](compiler-pipeline.md)
- [cpython-source](cpython-source.md)
- [gil-threading](gil-threading.md)
