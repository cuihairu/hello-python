# 魔法方法与对象协议

双下划线方法（dunder methods）是 Python 对象协议的挂载点：实现了哪些魔法方法，对象就「是」什么——可加、可比较、可迭代、可当函数调。语言内建操作符全部按协议分发到这些方法上。

## 字符串表示：__repr__ 与 __str__

`__str__` 面向用户（print、str），`__repr__` 面向开发者（REPL、调试、容器内元素），后者要求「信息完整、最好能重建对象」。只写一个时优先写 `__repr__`：

```python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x!r}, {self.y!r})"
    def __str__(self):
        return f"({self.x}, {self.y})"

p = Point(1, 2)
print(str(p), repr(p))
print([p])                       # 容器里显示 repr
```

```text
(1, 2) Point(1, 2)
[Point(1, 2)]
```

## 运算符重载

算术与比较运算符各有对应方法：`+` 是 `__add__`，`-` 是 `__sub__`，`==` 是 `__eq__`，`<` 是 `__lt__`。实现 `__eq__` 通常同时要置 `__hash__`（可变对象置 None）：

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    def __mul__(self, k):
        return Vector(self.x * k, self.y * k)
    def __eq__(self, other):
        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))

print(Vector(1, 2) + Vector(3, 4))
print(Vector(1, 1) * 3)
print(Vector(1, 2) == Vector(1, 2), Vector(1, 2) in {Vector(1, 2)})
```

```text
Vector(4, 6)
Vector(3, 3)
True True
```

反向运算符（`__radd__` 等）处理「左操作数不认识自己」的情况；`@functools.total_ordering` 只需实现 `__eq__` 与一个比较符，补齐其余排序：

```python
from functools import total_ordering

@total_ordering
class Ver:
    def __init__(self, n): self.n = n
    def __eq__(self, o): return self.n == o.n
    def __lt__(self, o): return self.n < o.n

print(Ver(1) < Ver(2), Ver(2) >= Ver(2), sorted([Ver(3), Ver(1)])[0].n)
```

```text
True True 1
```

## 容器协议

`__len__`、`__getitem__`、`__setitem__`、`__delitem__`、`__contains__` 让对象表现得像序列。只实现 `__getitem__` 时，for 循环与 in 也能靠回退机制工作，但显式实现更完整：

```python
class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)
    def __len__(self):
        return len(self._songs)
    def __getitem__(self, i):
        return self._songs[i]
    def __contains__(self, song):
        return song in self._songs

pl = Playlist(["晴天", "七里香"])
print(len(pl), pl[0], pl[-1], "晴天" in pl)
for s in pl:
    print(s, end=";")
print()
```

```text
2 晴天 七里香 True
晴天;七里香;
```

## 可调用与上下文协议

实现 `__call__` 的实例可以像函数一样调用，常用来做带状态的函数对象；`__enter__`/`__exit__` 即 with 协议（详见上下文管理器一章）：

```python
class Multiplier:
    def __init__(self, k):
        self.k = k
    def __call__(self, x):
        return x * self.k

double = Multiplier(2)
print(double(21), callable(double))
print(list(map(Multiplier(10), [1, 2, 3])))
```

```text
42 True
[10, 20, 30]
```

## 数值转换与真值

`__bool__` 决定对象在 if 里的真假（缺省时回退到 `__len__`，长度为 0 即假）；`__int__`/`__float__` 支持显式转换：

```python
class Bag:
    def __init__(self, items):
        self.items = list(items)
    def __len__(self):
        return len(self.items)
    def __bool__(self):
        return True            # 覆盖默认：空袋子也是「真」

print(bool(Bag([])), bool(Bag([1])))

class Temp:
    def __init__(self, c): self.c = c
    def __float__(self): return self.c

print(round(float(Temp(36.8)), 1))
```

```text
True True
36.8
```

::: tip 反射类魔法方法
`__getattr__` 在常规查找失败时触发（可做代理、懒加载）；`__getattribute__` 拦截一切属性访问，很容易写出无限递归，慎用；`__slots__` 声明固定属性集合，省内存并阻止动态加属性。
:::

## dataclass 自动生成

手写 `__init__`、`__repr__`、`__eq__` 太啰嗦，`@dataclass` 一行补齐（详见 dataclass 一章）：

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

print(repr(Point(1.0, 2.0)), Point(1, 2) == Point(1.0, 2.0))
```

```text
Point(x=1.0, y=2.0) True
```

## 小结

- 优先实现 `__repr__`，调试与日志处处受益。
- 运算符重载 = 实现对应魔法方法；`__eq__` 与 `__hash__` 要成对考虑。
- 容器协议五件套让对象支持 len、下标、in、for。
- `__call__` 做带状态的可调用对象，`__bool__` 定真值。
- 别为炫技重载运算符——语义清晰时才用。
