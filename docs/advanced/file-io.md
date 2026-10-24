---
description: pathlib path handling, text I/O with explicit encoding, and structured data with csv and json.
---

# Files and IO

File I/O comes down to three moves: open, read/write, close. Python uses the with statement to guarantee the close (see the context managers chapter), and pathlib gives you object-oriented path handling.

## pathlib: paths as objects

`pathlib.Path` treats a path as an object: join with `/`, and checking, creating and renaming are all methods. Far more readable than gluing strings together with os.path:

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

## Reading and writing text

`read_text`/`write_text` do the whole file in one shot (fine for small and medium files), and you should always pass `encoding="utf-8"` explicitly. For large files, iterate line by line so nothing sits in memory:

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

Appending, writing binary and reading all bytes are `mode="a"`, `write_bytes` and `read_bytes` respectively:

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

## Directory and file operations

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

`glob` finds files by pattern (`*` wildcards, `**` recurses across directories) and is the first step of any batch job:

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

## CSV and JSON

Structured data belongs in the matching standard library module: `json` handles text, `csv` handles rows. When writing json, pass `ensure_ascii=False` or Chinese text gets escaped to `\uXXXX`:

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

Binary data, network payloads and anything else non-text use `open` in `rb`/`wb` mode or `read_bytes`; encoding problems get settled at the text layer:

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

::: tip Temp files and atomic writes
The `tempfile` module gives you process-safe temp files and directories (never invent random names yourself). For critical files, write to a temp file and then `rename` it with `replace` for an atomic swap, so a power loss halfway through does not leave a truncated file behind:

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

## Encoding pitfalls

Nine out of ten cases of garbled Chinese text come from a mismatch between the "platform default encoding" and the file's actual encoding. Three hard rules: pass `encoding="utf-8"` explicitly, do it on reads and writes alike, and when something looks wrong check the source file's encoding first instead of immediately swapping encodings and guessing.

## Summary

- Paths go through `pathlib.Path`, joined with `/`, and found with `glob`/`rglob`.
- One-shot I/O with `read_text`/`write_text`, line-by-line iteration for large files.
- CSV and JSON each have a standard library module; pass `ensure_ascii=False` to json.
- Write critical files as temp file plus `replace` for an atomic swap; keep encoding explicit.

## Further reading

- [Python official documentation · Tutorial](https://docs.python.org/3/tutorial/inputoutput.html)
- [Python official documentation · pathlib](https://docs.python.org/3/library/pathlib.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [core-concepts](/knowledge/core-concepts.md)
- [scenarios](/knowledge/scenarios.md)
