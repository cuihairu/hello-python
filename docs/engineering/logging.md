---
description: Logging levels and per-module configuration, exception traceback recording, pdb breakpoints and cProfile for diagnosis.
---

# Logging and debugging

`print` debugging does not go far: no levels, no timestamps, no way to switch it off. The standard library `logging` provides a leveled, per-module, per-target logging system; together with `pdb` and the profiling tools it makes a three-piece debugging kit.

## logging basics

Five levels, low to high: DEBUG, INFO, WARNING, ERROR, CRITICAL. `basicConfig` sets the root configuration; records below the set level are not emitted:

```python
import logging, sys

logging.basicConfig(
    level=logging.DEBUG,
    stream=sys.stdout,                 # 演示用 stdout；生产写文件/集中采集
    format="%(levelname)s %(name)s: %(message)s",
)

log = logging.getLogger("app")

log.debug("变量 x=%s", 42)             # 惰性格式化：级别不够时不拼接字符串
log.info("服务启动")
log.warning("配置缺失，使用默认值")
log.error("请求失败: %s", "timeout")
```

```text
DEBUG app: 变量 x=42
INFO app: 服务启动
WARNING app: 配置缺失，使用默认值
ERROR app: 请求失败: timeout
```

::: tip One logger per module
Do not hard-code a logger name as 'app' or just use the root logger. The convention `logger = logging.getLogger(__name__)` makes the name the module path: logs group by module naturally, and levels can be tuned individually:

```python
import logging, sys

logging.basicConfig(level=logging.INFO, stream=sys.stdout,
                    format="%(levelname)s %(name)s: %(message)s")
db_log = logging.getLogger("app.db")
api_log = logging.getLogger("app.api")

db_log.info("连接池就绪")
api_log.warning("慢查询 %sms", 320)
logging.getLogger("app.db").setLevel(logging.ERROR)   # 单独静音 db 模块
db_log.info("这条不会出现")
```

```text
INFO app.db: 连接池就绪
WARNING app.api: 慢查询 320ms
```
:::

## Exceptions and tracebacks

`logger.exception` attaches the traceback automatically inside an except block (equivalent to `error(..., exc_info=True)`). The demo routes the log to an in-memory stream and checks whether the traceback carries the exception type:

```python
import logging, io

buf = io.StringIO()
handler = logging.StreamHandler(buf)
handler.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
log = logging.getLogger("demo")
log.addHandler(handler)
log.setLevel(logging.ERROR)

try:
    1 / 0
except ZeroDivisionError:
    log.exception("计算失败")

out = buf.getvalue()
print(out.splitlines()[0])
print("Traceback" in out, "ZeroDivisionError" in out)
```

```text
ERROR 计算失败
True True
```

## Structured fields and multiple targets

Production logs go into a collection system, so use `extra` to attach structured fields and `FileHandler`/`RotatingFileHandler` to control destination and rotation. A counter-intuitive fact: if a formatter references a field that is not in the record, the error is caught inside the handler by logging and written to stderr — it is not raised to the caller. Such configuration errors can only be spotted from stderr:

```python
import logging, sys
from io import StringIO

captured = StringIO()
real_stderr = sys.stderr
sys.stderr = captured                     # 拦下 logging 的内部错误输出便于检查
try:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(levelname)s [%(request_id)s] %(message)s"))
    log = logging.getLogger("svc")
    log.addHandler(handler)
    log.setLevel(logging.INFO)

    log.info("处理完成", extra={"request_id": "r-1"})
    log.info("缺字段", extra={"other": 1})    # 出错也不抛异常，调用方无感
finally:
    sys.stderr = real_stderr

print("调用方未收到异常")
print("内部报错:", "--- Logging error" in captured.getvalue() and "KeyError" in captured.getvalue())
```

```text
INFO [r-1] 处理完成
调用方未收到异常
内部报错: True
```

## pdb breakpoint debugging

`breakpoint()` (3.7+) drops into the pdb interactive debugger at that point in the code, equivalent to the old spelling `import pdb; pdb.set_trace()`. Common commands: `n` next line, `s` step in, `c` continue, `p expression` print, `l` view source, `q` quit. An interactive debugger cannot be demoed unattended, so here we verify the toolchain works:

```python
import pdb
print(callable(pdb.set_trace), hasattr(pdb, "Pdb"))
```

```text
True True
```

## timeit and cProfile

Profile before optimizing: micro-benchmarks with `timeit`, whole-picture profiling with `cProfile`:

```python
import timeit

t_join = timeit.timeit("'-'.join(str(n) for n in range(100))", number=1000)
t_str = timeit.timeit("str(list(range(100)))", number=1000)
print(t_join > 0, t_str > 0)
```

```text
True True
```

```python
import cProfile, pstats, io

pr = cProfile.Profile()
pr.enable()
total = sum(i * i for i in range(1000))
pr.disable()
buf = io.StringIO()
pstats.Stats(pr, stream=buf).sort_stats("cumulative").print_stats(3)
out = buf.getvalue()
print("profile 报告含函数列:", "ncalls" in out)
print(total == sum(i * i for i in range(1000)))
```

```text
profile 报告含函数列: True
True
```

The full `print_stats` output includes call counts, time spent and file line numbers; the numbers differ between machines, but the structure is fixed — just look for hotspots in the `ncalls`/`cumtime` columns.

## Summary

- Use `logging.getLogger(__name__)`, so levels can be tuned per module.
- Format logs lazily (`log.info("%s", x)`); use `logger.exception` for exceptions to get a traceback.
- `extra` carries structured fields for the collection system; when a formatter field is missing, the error is caught inside the handler (visible on stderr) and not raised to the caller.
- `breakpoint()` enters pdb; for performance, start with a `timeit` micro-benchmark, then a `cProfile` profile.

## References

- [Python official docs · logging](https://docs.python.org/3/library/logging.html)
- [Python official docs · Logging how-to](https://docs.python.org/3/howto/)
- [Python official docs · Logging cookbook](https://docs.python.org/3/howto/logging-cookbook.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/knowledge/books.md)
- [core-concepts](/knowledge/core-concepts.md)
- [official-docs](/knowledge/official-docs.md)
- [pitfalls](/knowledge/pitfalls.md)
- [scenarios](/knowledge/scenarios.md)
