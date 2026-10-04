# 字符串与格式化

字符串是最常用的数据形态。本章覆盖 f-string、format 规格微型语言、常用方法与编码细节。

## f-string：首选格式化

f-string（3.6+）在字符串前加 `f`，花括号内直接放表达式，可读性最好：

```python
name, pi = "Python", 3.14159
print(f"{name} 有 {len(name)} 个字符")
print(f"圆周率约为 {pi:.2f}")
print(f"{1234567:,}")          # 千分位
print(f"{0.875:.1%}")          # 百分数
```

```text
Python 有 6 个字符
圆周率约为 3.14
1,234,567
87.5%
```

3.8+ 的 `=` 修饰符把「表达式与值」一起打出来，调试利器：

```python
x, y = 10, 3
print(f"{x = }, {y = }, {x % y = }")
```

```text
x = 10, y = 3, x % y = 1
```

对齐与填充：`>` 右对齐、`<` 左对齐、`^` 居中，冒号后是填充字符、宽度：

```python
for w in ("id", "name", "score"):
    print(f"|{w:^10}|")
print(f"|{'-' * 32}|")
print(f"{42:05d}", f"{'py':*>6}")
```

```text
|    id    |
|   name   |
|  score   |
|--------------------------------|
00042 ****py
```

## format 方法与 % 记法

f-string 之外的历史方案仍会大量遇到：`str.format` 支持位置与关键字槽位；`%` 记法来自 C printf。新代码一律用 f-string，读旧代码要认识这两种：

```python
print("{} + {} = {}".format(1, 2, 3))
print("{name}: {score}".format(name="py", score=99))
print("%s 有 %d 岁" % ("py", 30))
```

```text
1 + 2 = 3
py: 99
py 有 30 岁
```

## 常用方法

查找替换、去空白、拆分拼接是日常高频操作。注意 `strip`/`split` 默认按空白处理且 `split()` 会合并连续空白：

```python
s = "  Hello, Python  "
print(s.strip().lower())
print(s.strip().split(","))
print("a,b,,c".split(","), "a b  c".split())
print("py-thon".replace("-", "_"))
print("python".startswith("py"), "python".endswith("on"))
print("python".find("th"), "python".find("go"))   # 找不到返回 -1
```

```text
hello, python
['Hello', ' Python']
['a', 'b', '', 'c'] ['a', 'b', 'c']
py_thon
True True
2 -1
```

`splitlines` 处理跨平台换行；`partition` 一次拆成三段，比两次 `split` 高效：

```python
log = "2026-10-02 08:00 INFO start\r\n2026-10-02 08:01 INFO done\n"
print(log.splitlines())

head, sep, tail = "key=value".partition("=")
print(head, repr(sep), tail)
```

```text
['2026-10-02 08:00 INFO start', '2026-10-02 08:01 INFO done']
key '=' value
```

判断类方法一族：`isalpha`、`isdigit`、`isalnum`、`isupper`、`istitle`，常用于输入校验：

```python
print("abc".isalpha(), "123".isdigit(), "Py3".isalnum())
print("HELLO".isupper(), "Hello World".istitle())
```

```text
True True True
True True
```

::: tip 拼接的性能
循环里 `s += x` 每次都新建字符串（str 不可变），O(n²)。批量拼接用 `"".join(iterable)`，一次成型 O(n)：

```python
parts = ["a"] * 5
print("".join(parts))
print("-".join(map(str, range(5))))
```

```text
aaaaa
0-1-2-3-4
```
:::

## 原始字符串与转义

反斜杠转义：`\n` 换行、`\t` 制表、`\\` 反斜杠本身。正则、Windows 路径里反斜杠成灾，用 `r"..."` 原始字符串关掉转义：

```python
print("a\tb\nc")
print(r"a\tb\nc")
print(r"C:\new\test")
```

```text
a	b
c
a\tb\nc
C:\new\test
```

多行文本用三引号，行尾反斜杠阻止换行进入字符串：

```python
sql = """SELECT id, name
FROM users
WHERE active = 1"""
print(sql.splitlines()[0])
```

```text
SELECT id, name
```

## 编码：str 与 bytes

`str` 是 Unicode 码点序列，`bytes` 是字节序列。网络与磁盘里都是 bytes，进出都要过一遍编码解码；解码遇到非法字节抛 `UnicodeDecodeError`，可用 `errors` 参数容错：

```python
s = "中文"
b = s.encode("utf-8")
print(b, len(s), len(b))          # bytes 字面显示为 b'\x..'，字节数 6
print(b.decode("utf-8"))

bad = b"\xff\xfe" + "ok".encode()
print(bad.decode("utf-8", errors="replace"))
```

```text
b'\xe4\xb8\xad\xe6\x96\x87' 2 6
中文
��ok
```

文件与网络 API 都要显式给 `encoding="utf-8"`，不要依赖平台默认编码（Windows 上常是 GBK，这正是「读文件乱码」的常见原因）：

```python
import tempfile, pathlib

with tempfile.TemporaryDirectory() as d:
    p = pathlib.Path(d) / "a.txt"
    p.write_text("中文", encoding="utf-8")
    print(p.read_text(encoding="utf-8"))
```

```text
中文
```

## 小结

- 格式化首选 f-string，`=` 调试、`:.2f`/`,`/`%` 规格符要熟。
- `strip`/`split`/`join`/`find` 是高频方法；批量拼接用 join。
- 原始字符串 `r"..."` 服务于正则与路径。
- str 与 bytes 边界处显式 `encoding="utf-8"`。
