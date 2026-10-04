---
description: 可变默认参数、闭包晚绑定、浅深拷贝等八个高频坑的原理与规避写法。
---

# 常见陷阱与最佳实践

这些坑每个 Python 工程师都踩过一遍。集中列出来，一次认清原理，省下各自的凌晨排查时间。

## 可变默认参数

默认值在定义时求值一次并绑定在函数对象上，所有调用共享。表现是「上次调用的数据漏到了这次」：

```python
def append_to(item, target=[]):
    target.append(item)
    return target

print(append_to(1))
print(append_to(2))          # 不是 [2]！
print(append_to.__defaults__)
```

```text
[1]
[1, 2]
([1, 2],)
```

修复是 `None` 哨兵 + 函数体内新建；或者用 `functools.partial` 之外的方式显式传列表。

## 闭包的晚绑定

闭包捕获变量本身，不是捕获时的值。循环里创建的函数全部共享循环变量，循环结束时它们看到的是最后一个值：

```python
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])

fixed = [lambda i=i: i for i in range(3)]   # 默认参数在定义时求值
print([f() for f in fixed])
```

```text
[2, 2, 2]
[0, 1, 2]
```

## 浅拷贝 vs 深拷贝

`list.copy()`、切片、`dict()` 都只拷贝一层。嵌套结构的内层仍是共享引用，改「副本」会串到原件：

```python
import copy

src = {"tags": ["a"], "n": 1}
shallow = src.copy()
shallow["n"] = 99                 # 顶层独立
shallow["tags"].append("b")       # 内层共享 → 串了
print(src)

deep = copy.deepcopy(src)
deep["tags"].append("c")
print(src["tags"], deep["tags"])
```

```text
{'tags': ['a', 'b'], 'n': 1}
['a', 'b'] ['a', 'b', 'c']
```

## 循环引用与 __del__

互相引用的对象靠 GC 的循环检测回收，但定义了 `__del__` 的对象在循环里不能被简单回收（3.4+ 通过 PEP 442 缓解，`__del__` 仍难保证调用时机）。资源释放不要依赖 `__del__`，用 with/finally：

```python
class Conn:
    def __init__(self):
        self.closed = False
    def close(self):
        self.closed = True
    def __del__(self):
        pass                      # 别在这里关资源

def use():
    conn = Conn()
    try:
        return "结果"
    finally:
        conn.close()              # 保证关闭

print(use())
```

```text
结果
```

## is 与 == 的滥用

`==` 比值，`is` 比身份。判断 `None`、True、False 用 `is`（单例）；判断数值、字符串、列表一律 `==`。小整数与字面量常量折叠会让 `is` 「偶尔对」，最迷惑：

```python
a = [1, 2]
b = [1, 2]
print(a == b, a is b)

x = None
print(x is None)

n = 257
m = 257
print(n == m, n is m)        # 脚本内常量折叠让 is 也为真；交互式逐行输入则相反
```

```text
True False
True
True True
```

注意：同一代码对象内 `257 is 257` 为真（常量折叠），交互式逐行输入为假——正因为结果随场景变，它才不能作为相等判断。

## 修改正在遍历的容器

遍历时增删元素，迭代器会后错位，典型现象是「隔一个漏一个」：

```python
nums = [1, 2, 3, 4, 5, 6]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)            # 反例：边遍历边删
print(nums)                       # 4、6 被漏掉了
```

```text
[1, 3, 5]
```

安全做法：推导式造新列表，或遍历副本、删除原件：

```python
nums = [1, 2, 3, 4, 5, 6]
nums = [n for n in nums if n % 2 != 0]
print(nums)

nums2 = [1, 2, 3, 4, 5, 6]
for n in nums2[:]:                # 遍历副本
    if n % 2 == 0:
        nums2.remove(n)
print(nums2)
```

```text
[1, 3, 5]
[1, 3, 5]
```

## 异常吞掉的静默失败

`except: pass` 让错误消失得无影无踪。至少记录，或者转换成更明确的异常再抛：

```python
import logging, sys
logging.basicConfig(level=logging.ERROR, stream=sys.stdout,
                    format="%(levelname)s %(message)s")

def load(text):
    try:
        return int(text)
    except ValueError:
        logging.error("非法整数: %r", text)
        return 0

print(load("x"), load("42"))
```

```text
ERROR 非法整数: 'x'
0 42
```

## 字符串比较与编码

跨系统交换数据时，比较前统一 casefold（比 lower 更适合国际化）与 NFC 规范化；读写文件显式 UTF-8：

```python
print("Straße".casefold() == "strasse")
import unicodedata
s1 = "cafe\u0301"              # e + 组合尖音符（两个码点）
s2 = "caf\u00e9"                 # 预组合 é（一个码点）
print(s1 == s2, unicodedata.normalize("NFC", s1) == unicodedata.normalize("NFC", s2))
```

```text
True
False True
```

## 依赖与版本管理疏漏

- 别把 `.venv/` 提交进仓库；提交锁文件（requirements.txt 或 lock 文件）保证可复现。
- 浮点当钱算：金额用 `decimal.Decimal`，比较设容差。
- 全局可变状态（模块级 dict/list）在测试间互相污染——按需注入，别图省事放全局。

## 小结

- 可变默认参数、闭包晚绑定、浅深拷贝：原理都是「共享的是引用」。
- 遍历中不改容器；异常不许静默吞。
- `is` 只用于 None/True/False 单例判断。
- 资源释放走 with/finally，不赌 `__del__`。
