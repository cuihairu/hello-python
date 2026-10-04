---
description: 函数定义、参数形态与作用域规则，含可变默认参数陷阱与 None 哨兵写法。
---

# 函数

函数是组织代码的基本单元。Python 函数是一等公民：可以赋值给变量、当参数传递、当返回值。本章覆盖定义、参数的各种形态、作用域规则与 lambda。

## 定义与调用

`def` 定义函数，`return` 返回值（不写或裸写返回 `None`）。文档字符串写在函数体第一行：

```python
def greet(name, greeting="你好"):
    """向某人问好，返回问候语字符串。"""
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", "Hi"))
print(greet(name="Carol"))
```

```text
你好, Alice!
Hi, Bob!
你好, Carol!
```

## 参数的五种形态

按定义顺序：位置参数、默认参数、可变位置参数 `*args`、仅关键字参数、可变关键字参数 `**kwargs`：

```python
def demo(a, b=2, *args, key=None, **kwargs):
    print(a, b, args, key, kwargs)

demo(1)
demo(1, 2, 3, 4, key="k", extra="x")
```

```text
1 2 () None {}
1 2 (3, 4) k {'extra': 'x'}
```

调用端也能解包：`*` 展开序列为位置参数，`**` 展开字典为关键字参数：

```python
def add3(x, y, z):
    return x + y + z

nums = [1, 2, 3]
kw = {"z": 30, "y": 20}
print(add3(*nums))
print(add3(10, **kw))
```

```text
6
60
```

::: warning 可变默认参数陷阱
默认值在函数定义时求值一次，所有调用共享同一个对象。默认值用可变对象（list/dict/set）会跨调用累积——这是 Python 最著名的坑，默认值一律用 `None` 哨兵：

```python
def bad(item, basket=[]):        # 反例：所有调用共享同一个列表
    basket.append(item)
    return basket

def good(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket

print(bad(1), bad(2))            # [1, 2] 而不是期望的 [1] [2]
print(good(1), good(2))          # 每次都是新列表
```

```text
[1, 2] [1, 2]
[1] [2]
```
:::

## 仅位置与仅关键字参数

`/` 之前的参数只能按位置传，`*` 之后的只能按关键字传。标准库大量使用这一机制保护参数名不成为调用方 API 的一部分：

```python
def clip(text, *, max_len=10):        # max_len 只能按关键字传
    return text[:max_len]

print(clip("hello world", max_len=5))
try:
    clip("hello world", 5)
except TypeError as e:
    print("TypeError:", e)
```

```text
hello
TypeError: clip() takes 1 positional argument but 2 were given
```

## 作用域与闭包

名字解析遵循 LEGB：Local → Enclosing → Global → Builtin。内层函数读取外层变量构成闭包；要**重新绑定**外层变量需 `nonlocal`（函数层）或 `global`（模块层）：

```python
def counter():
    count = 0
    def inc():
        nonlocal count        # 没有它，count 只是 inc 的局部新名字
        count += 1
        return count
    return inc

c = counter()
print(c(), c(), c())
```

```text
1 2 3
```

闭包捕获的是变量本身而非当时的值——循环变量陷阱是它的著名表现，修复方法是让默认参数在定义时快照：

```python
funcs = [lambda: i for i in range(3)]          # 三个 lambda 共享同一个 i
fixed = [lambda i=i: i for i in range(3)]      # 默认参数在定义时求值
print([f() for f in funcs])
print([f() for f in fixed])
```

```text
[2, 2, 2]
[0, 1, 2]
```

## lambda 与高阶函数

lambda 是单表达式匿名函数，等价于「return 表达式」。排序的 `key`、`map`/`filter` 是它最常见用法；逻辑复杂就写具名函数：

```python
pairs = [("b", 2), ("a", 3), ("c", 1)]
print(sorted(pairs, key=lambda p: p[1]))

print(list(map(lambda x: x * 2, [1, 2, 3])))
print(list(filter(lambda x: x > 1, [0, 1, 2, 3])))
```

```text
[('c', 1), ('b', 2), ('a', 3)]
[2, 4, 6]
[2, 3]
```

函数作为返回值，可组合出「乘方工厂」：

```python
def power(n):
    def apply(x):
        return x ** n
    return apply

square, cube = power(2), power(3)
print(square(5), cube(5))
```

```text
25 125
```

## 小结

- 参数顺序：位置 → 默认 → `*args` → 仅关键字 → `**kwargs`；`/` 锁定仅位置。
- 可变默认参数是共享陷阱，用 `None` 哨兵。
- 闭包捕获变量本身；重绑定外层用 `nonlocal`；循环 lambda 用默认参数快照。
- lambda 只放单表达式，复杂逻辑用具名函数。
