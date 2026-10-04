---
description: pathlib 路径操作、文本读写与编码显式化，csv 与 json 结构化数据处理。
---

# 文件与 IO

文件操作三要素：打开、读写、关闭。Python 用 with 语句保证关闭（见上下文管理器一章），用 pathlib 提供面向对象的路径操作。

## pathlib：路径的面向对象写法

`pathlib.Path` 把路径当对象：拼接用 `/`，判断、创建、改名都是方法，字符串操作比 os.path 拼接直观：

```python
from pathlib import Path

p = Path("/tmp") / "demo.txt"
print(p.name, p.suffix, p.stem)
print(p.parent, p.is_absolute())
print(p.parts)
```

```text
demo.txt .txt demo
/tmp True
('/', 'tmp', 'demo.txt')
```

## 读写文本

`read_text`/`write_text` 是一次性读写（适合中小文件），始终显式给 `encoding="utf-8"`。大文件用迭代器按行读，不占内存：

```python
from pathlib import Path
import tempfile

with tempfile.TemporaryDirectory() as d:
    p = Path(d) / "notes.txt"
    p.write_text("第一行\n第二行\n", encoding="utf-8")

    print(p.read_text(encoding="utf-8"), end="")

    with p.open(encoding="utf-8") as f:      # 行级惰性迭代
        for i, line in enumerate(f, 1):
            print(i, line.strip())
```

```text
第一行
第二行
1 第一行
2 第二行
```

追加、写二进制、读全部字节分别是 `mode="a"`、`write_bytes`、`read_bytes`：

```python
from pathlib import Path
import tempfile

with tempfile.TemporaryDirectory() as d:
    p = Path(d) / "log.txt"
    p.write_text("a\n", encoding="utf-8")
    with p.open("a", encoding="utf-8") as f:
        f.write("b\n")
    print(repr(p.read_text(encoding="utf-8")))

    b = Path(d) / "blob.bin"
    b.write_bytes(b"\x89PNG")
    print(b.read_bytes())
```

```text
'a\nb\n'
b'\x89PNG'
```

## 目录与文件操作

```python
from pathlib import Path
import tempfile

with tempfile.TemporaryDirectory() as d:
    root = Path(d)
    (root / "sub").mkdir()                     # mkdir(parents=True) 递归建
    (root / "sub" / "a.py").write_text("print(1)", encoding="utf-8")
    (root / "b.txt").write_text("x", encoding="utf-8")

    print(sorted(x.name for x in root.iterdir()))
    print([p.name for p in root.rglob("*.py")])
    print((root / "sub" / "a.py").exists(), (root / "gone.txt").exists())

    (root / "b.txt").rename(root / "c.txt")
    (root / "c.txt").unlink()                  # 删除文件
    print(sorted(x.name for x in root.iterdir()))
```

```text
['b.txt', 'sub']
['a.py']
True False
['sub']
```

`glob` 按模式找文件（`*` 通配、`**` 跨目录递归），是批量处理的第一步：

```python
from pathlib import Path
import tempfile

with tempfile.TemporaryDirectory() as d:
    root = Path(d)
    for name in ("a.md", "b.md", "c.txt"):
        (root / name).write_text("hi", encoding="utf-8")
    print(sorted(p.name for p in root.glob("*.md")))
    print(sorted(p.name for p in root.glob("*.TXT")))    # 大小写敏感
    (root / "a.md").chmod(0o644)
    print((root / "a.md").stat().st_size)
```

```text
['a.md', 'b.md']
[]
2
```

## CSV 与 JSON

结构化数据用标准库对应模块：`json` 走文本，`csv` 按行处理。写 json 要 `ensure_ascii=False` 才不把中文转成 `\uXXXX`：

```python
import csv, io, json

data = {"name": "Python", "tags": ["教学", "示例"]}
text = json.dumps(data, ensure_ascii=False, indent=2)
print(text.splitlines()[0])
back = json.loads(text)
print(back["tags"])

buf = io.StringIO()
w = csv.writer(buf)
w.writerow(["id", "name"])
w.writerows([[1, "a"], [2, "b"]])
print(buf.getvalue().splitlines()[1])
```

```text
{
['教学', '示例']
1,a
```

二进制、网络等非文本介质用 `open` 的 `rb`/`wb` 模式或 `read_bytes`，编码问题在文本层解决：

```python
import tempfile, pathlib

with tempfile.TemporaryDirectory() as d:
    p = pathlib.Path(d) / "x.bin"
    p.write_bytes(bytes([0, 1, 2, 255]))
    raw = p.read_bytes()
    print(len(raw), raw[3])
```

```text
4 255
```

::: tip 临时文件与原子写
`tempfile` 模块提供进程安全的临时文件/目录（不要用自造随机名）。写关键文件用「写临时文件 + `replace` 改名」实现原子替换，避免写一半断电留下截断文件：

```python
from pathlib import Path
import tempfile

with tempfile.TemporaryDirectory() as d:
    target = Path(d) / "config.json"
    tmp = target.with_suffix(".tmp")
    tmp.write_text('{"ok": true}', encoding="utf-8")
    tmp.replace(target)          # 同目录内改名是原子的
    print(target.read_text(encoding="utf-8"))
```

```text
{"ok": true}
```
:::

## 编码陷阱

中文乱码九成来自「平台默认编码」与「文件实际编码」不一致。三个铁律：显式 `encoding="utf-8"`、读写都写、错误时先查源文件编码而非立刻换 encoding 试错。

## 小结

- 路径用 `pathlib.Path`，`/` 拼接，`glob`/`rglob` 找文件。
- 一次性读写 `read_text`/`write_text`，大文件逐行迭代。
- CSV/JSON 分别用标准库模块，json 传 `ensure_ascii=False`。
- 关键写入用临时文件 + `replace` 原子替换；编码始终显式。
