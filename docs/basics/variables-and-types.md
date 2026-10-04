# 变量与数据类型

Python 是动态强类型语言：变量不必声明类型，运行时每个对象都带着自己的类型；但类型不会隐式转换，`"1" + 1` 只会报错。

## 内置类型一览

| 类型 | 例子 | 可变性 | 说明 |
| --- | --- | --- | --- |
| `int` | `42` | 不可变 | 任意精度整数，`10**100` 不溢出 |
| `float` | `3.14` | 不可变 | IEEE 754 双精度，`1e3` 记法 |
| `bool` | `True` | 不可变 | `int` 的子类，`True + 1 == 2` |
| `str` | `"hi"` | 不可变 | Unicode 字符串，支持切片 |
| `list` | `[1, 2]` | 可变 | 有序、可重复、可增删 |
| `tuple` | `(1, 2)` | 不可变 | 有序，可作字典键 |
| `dict` | `{"a": 1}` | 可变 | 键值映射，3.7+ 保序 |
| `set` | `{1, 2}` | 可变 | 无序去重集合 |
| `NoneType` | `None` | 不可变 | 空值单例 |

用 `type()` 查类型，`isinstance()` 做判断——后者支持继承关系（`isinstance(True, int)` 为真），API 里要类型检查时用它：

```python
values = [42, 3.14, True, "hi", None]
for v in values:
    print(type(v).__name__, isinstance(v, (int, float)))
```

```text
int True
float True
bool True
str False
NoneType False
```

## 数值类型

`int` 没有位宽限制，`float` 是双精度；需要精确小数用 `decimal`，分数用 `fractions.Fraction`。除法总是返回 `float`，整除用 `//`，取余用 `%`：

```python
print(7 / 2, 7 // 2, 7 % 2)
print(2 ** 10)                     # 幂运算
print(len(str(10 ** 100)))         # 101 位数，int 无位宽限制
print(int("ff", 16), float("1e-3"))

from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))   # 二进制浮点的误差被消除
```

```text
3.5 3 1
1024
101
255 0.001
0.3
```

注意 `0.1 + 0.2 == 0.3` 为假——IEEE 754 表示不了 0.1，这是所有双精度语言的通病，比较浮点要设容差：

```python
print(0.1 + 0.2)
print(abs(0.1 + 0.2 - 0.3) < 1e-9)
```

```text
0.30000000000000004
True
```

## 字符串

字符串不可变，任何「修改」都产生新对象。拼接：`+` 适合短串，`"".join()` 适合长串（O(n) 而非反复复制）。`str.encode()` 得到 bytes，`bytes.decode()` 还原：

```python
parts = ["he", "llo"]
print("".join(parts), "!" .join(parts))
print(len("你好"))                     # Unicode 码点数
print("中".encode("utf-8"))            # UTF-8 字节
print(b"\xe4\xb8\xad".decode("utf-8"))
```

```text
hello he!llo
2
b'\xe4\xb8\xad'
中
```

## 类型转换

显式转换用构造函数：`int("12")`、`str(12)`、`float("1.5")`、`list("abc")`。转换失败抛 `ValueError`，先校验再转：

```python
def to_int(s):
    try:
        return int(s)
    except ValueError:
        return None

print(to_int("12"), to_int("12a"))
print(bool(""), bool("0"), bool([]))    # 只有空对象与 None 为假
```

```text
12 None
False True False
```

::: warning 为什么 `"0"` 是真
「0 是假」的直觉只对数字和空序列成立。字符串 `"0"` 非空，`bool("0")` 是 `True`。判断输入是否为 0 要先转类型再比。
:::

## 可变与不可变

这是理解 Python 语义的钥匙。`int`、`str`、`tuple` 不可变：任何「改」都返回新对象；`list`、`dict`、`set` 可变：原地修改，所有引用一起变：

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a is b, a)          # a、b 指向同一个列表

s1 = "ab"
s2 = s1.upper()
print(s1, s2)             # s1 不变，产生新串 s2
```

```text
True [1, 2, 3, 4]
ab AB
```

`is` 比较对象身份（内存地址），`==` 比较值。判断是否为空值用 `is None`，比较数值用 `==`。CPython 会缓存小整数 `-5..256` 并折叠同一代码对象里的重复常量，这让 `is` 对某些整数「碰巧」为真——结果随解释器实现和运行场景而变，不能拿 `is` 当 `==` 用：

```python
x, y = 1000, 1000
print(x == y, x is y)        # 值相等；is 结果是常量折叠的实现细节，别依赖
n1, n2 = 256, 256
print(n1 is n2)              # 小整数缓存区间内为 True（同样只是实现细节）
print(x == y)                # 判断相等永远写 ==
```

```text
True True
True
True
```

## 小结

- 动态强类型：不声明类型，但不做隐式转换。
- 不可变对象（int/str/tuple）改则新建，可变对象（list/dict/set）原地改、引用共变。
- `is` 比身份，`==` 比值；判 `None` 用 `is`。
- 浮点比较设容差，精确计算换 `Decimal`。
