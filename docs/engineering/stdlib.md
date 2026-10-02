# 标准库精选

Python「自带电池」（batteries included）的底气来自标准库。这页挑出最高频的几个模块：collections、itertools、functools、pathlib、re、json、datetime——它们能省掉大部分第三方依赖。

## collections

通用容器之外的增强数据结构：

```python
from collections import Counter, defaultdict, deque, namedtuple

# Counter：计数与频次统计
c = Counter("abracadabra")
print(c.most_common(2), c["a"], c.total())

# defaultdict：免写 key in d 的分支
groups = defaultdict(list)
for name in ("a1", "b1", "a2"):
    groups[name[0]].append(name)
print(dict(groups))

# deque：两端 O(1) 的队列，滑动窗口的标配
dq = deque(maxlen=3)
for i in range(5):
    dq.append(i)
print(dq)

# namedtuple：带字段名的元组
Point = namedtuple("Point", "x y")
print(Point(1, 2).x)
```

```text
[('a', 5), ('b', 2)] 5 11
{'a': ['a1', 'a2'], 'b': ['b1']}
deque([2, 3, 4], maxlen=3)
1
```

## itertools

迭代器算子库——组合、分组、平铺、切片，内存友好：

```python
from itertools import chain, groupby, islice, combinations, product, count

print(list(chain([1, 2], [3])))
print(list(islice(count(10), 3)))            # 无限计数器取前 3
print(list(combinations("abc", 2)))
print(list(product([0, 1], repeat=2)))

data = sorted("bee cat dog".split())
print([k for k, _ in groupby(data, key=lambda w: w[0])])
```

```text
[1, 2, 3]
[10, 11, 12]
[('a', 'b'), ('a', 'c'), ('b', 'c')]
[(0, 0), (0, 1), (1, 0), (1, 1)]
['b', 'c', 'd']
```

## functools

可调用对象的工具：记忆化、偏函数、总排序、reduce：

```python
from functools import lru_cache, partial, total_ordering, reduce

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(30))

print(partial(pow, 10)(3))                   # 10 ** 3
print(reduce(lambda a, b: a + b, [1, 2, 3, 4]))
print(reduce(lambda a, b: a * b, [1, 2, 3, 4], 1))

@total_ordering
class R:
    def __init__(self, v): self.v = v
    def __eq__(self, o): return self.v == o.v
    def __lt__(self, o): return self.v < o.v
print(R(1) < R(2), R(2) == R(2))
```

```text
832040
1000
10
24
True True
```

## pathlib

路径操作的对象式写法，文件批量处理的骨架：

```python
from pathlib import Path
import tempfile

with tempfile.TemporaryDirectory() as d:
    root = Path(d)
    (root / "src").mkdir()
    for name in ("a.py", "b.py", "c.txt"):
        (root / "src" / name).write_text("# demo", encoding="utf-8")

    py_files = sorted((root / "src").glob("*.py"))
    print([p.name for p in py_files])
    print([p.stem for p in py_files])
    (root / "src" / "a.py").unlink()
    print(sorted(p.name for p in (root / "src").iterdir()))
```

```text
['a.py', 'b.py']
['a', 'b']
['b.py', 'c.txt']
```

## re

正则做模式匹配与提取。要点：用 `r"..."` 原始字符串、编译复用、优先使用预定义类别（`\d` `\w` `\s`）：

```python
import re

text = "订单 A-1001 金额 99.5 元，订单 A-2002 金额 128 元"
ids = re.findall(r"A-\d+", text)
print(ids)

prices = re.findall(r"(\d+(?:\.\d+)?) 元", text)
print([float(p) for p in prices])

m = re.search(r"(\d{4})", text)
print(m.group(1))

pat = re.compile(r"[A-Z]-\d+")
print(len(pat.findall(text)))
```

```text
['A-1001', 'A-2002']
[99.5, 128.0]
1001
2
```

::: tip 什么时候不用正则
解析结构化文本优先用专用解析器：JSON 用 `json`、CSV 用 `csv`、URL 用 `urllib.parse`、日期时间用 `datetime`。正则适合「有规律的片段」而非完整语法——写嵌套引用之类的需求时，手写状态机或 Lark 等解析库比正则清晰。
:::

## json 与 datetime

```python
import json
from datetime import datetime, timedelta, timezone

payload = {"id": 1, "tags": ["a", "b"], "ok": True}
text = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True)
print(json.loads(text)["tags"])

now = datetime(2026, 10, 2, 8, 30, tzinfo=timezone.utc)
print(now.isoformat())
print((now + timedelta(days=1)).strftime("%Y-%m-%d %H:%M"))
print((now + timedelta(days=1)).date().isoformat())
```

```text
['a', 'b']
2026-10-02T08:30:00+00:00
2026-10-03 08:30
2026-10-03
```

`datetime` 易错点：拿现时用 `now()`；带时区的比较才安全（`timezone.utc` 或本地 `astimezone()`）；3.12+ 有 `datetime.fromisoformat` 全格式解析与 `zoneinfo` 时区库。

## 小结

- collections 管计数、分组、队列与记录；itertools 管迭代组合。
- functools 的 `lru_cache`/`partial` 覆盖记忆化与偏函数两大高频需求。
- 路径用 pathlib，正则编译复用且优先预定义类别。
- 结构化数据用对应解析器，正则只啃有规律的片段。
