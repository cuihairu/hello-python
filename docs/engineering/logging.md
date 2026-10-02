# 日志与调试

`print` 调试走不远：没有级别、没有时间戳、没法关。标准库 `logging` 提供分级、分模块、分目标的日志体系；配合 `pdb` 与性能分析工具构成排障三件套。

## logging 基础

五个级别从低到高：DEBUG、INFO、WARNING、ERROR、CRITICAL。`basicConfig` 设置根配置，级别低于设定的记录不输出：

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

::: tip 每模块一个 logger
不要把 logger 名写死成 "app" 或直接用根 logger。约定 `logger = logging.getLogger(__name__)`：名字即模块路径，日志天然按模块分组，级别可以单独调：

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

## 异常与堆栈

`logger.exception` 在 except 块里自动附带堆栈（等价 `error(..., exc_info=True)`）。演示时把日志接到内存流，检查堆栈是否带上了异常类型：

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

## 结构化字段与多目标

生产日志要进采集系统，用 `extra` 附加结构化字段，用 `FileHandler`/`RotatingFileHandler` 控制去向与滚动。一个反直觉的事实：formatter 引用了记录里不存在的字段，错误会被 logging 拦在 handler 内部打到 stderr，并不会抛给调用方——这类配置错误只能从 stderr 发现：

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

## pdb 断点调试

`breakpoint()`（3.7+）在代码处进入 pdb 交互调试器，等价老写法 `import pdb; pdb.set_trace()`。常用命令：`n` 下一行、`s` 步入、`c` 继续、`p 表达式` 打印、`l` 看源码、`q` 退出。交互式调试器无法在无人值守演示，这里验证工具链可用：

```python
import pdb
print(callable(pdb.set_trace), hasattr(pdb, "Pdb"))
```

```text
True True
```

## timeit 与 cProfile

性能排查先测量再优化：微基准用 `timeit`，整体画像用 `cProfile`：

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

`print_stats` 的完整输出包含调用次数、耗时与文件行号，机器间数值不同，但结构固定——按 `ncalls`/`cumtime` 两列找热点即可。

## 小结

- 用 `logging.getLogger(__name__)`，模块级可独立调级。
- 日志惰性格式化（`log.info("%s", x)`），异常用 `logger.exception` 带堆栈。
- `extra` 结构化字段服务采集系统；formatter 字段缺失时错误被拦在 handler 内部（stderr 可见），不会抛给调用方。
- 断点 `breakpoint()` 进 pdb；性能先 timeit 微基准、再 cProfile 画像。
