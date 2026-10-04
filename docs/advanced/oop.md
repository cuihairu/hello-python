---
description: 类定义、继承与多态、property 等面向对象基础，落到实例方法与属性协议。
---

# 面向对象：类与继承

Python 的类把数据与行为绑在一起。本章覆盖类的定义、实例机制、属性查找、继承与多态、封装约定与 dataclass 之外的类语法。

## 类与实例

`class` 定义类，实例方法第一个参数约定叫 `self`，指向实例本身。`__init__` 在实例化时被自动调用，负责初始化实例属性：

```python
class Dog:
    species = "犬科"                      # 类属性：所有实例共享

    def __init__(self, name, age):
        self.name = name                  # 实例属性：每个实例独有
        self.age = age

    def bark(self, times=1):
        return "汪" * times

d = Dog("旺财", 3)
print(d.name, d.age, d.bark(2))
print(Dog.species, d.species)
```

```text
旺财 3 汪汪
犬科 犬科
```

## 实例机制

`Dog("旺财", 3)` 一步做了两件事：`__new__` 创建实例，`__init__` 初始化它。属性查找顺序是「实例字典 → 类字典 → 父类链」，实例赋值只写实例自己的字典，不碰类：

```python
class Dog:
    legs = 4

d = Dog()
print(d.legs)          # 实例没有 → 找类
d.legs = 3             # 在实例字典里新建，类不受影响
print(d.legs, Dog.legs, d.__dict__)
```

```text
4
3 4 {'legs': 3}
```

类属性被实例「遮蔽」是这类查找机制的直接后果。共享可变的类属性（如计数器）要修改必须通过类名：

```python
class Counter:
    count = 0
    def __init__(self):
        Counter.count += 1        # 写类属性；写 self.count 会造出实例属性

Counter(); Counter()
print(Counter.count)
```

```text
2
```

## 继承与 super

子类获得父类全部方法，可覆写（override）同名方法。`super()` 沿 MRO（方法解析顺序）调用下一家的实现，避免硬编码父类名：

```python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return f"{self.name} 出声"

class Dog(Animal):
    def speak(self):
        return f"{self.name} 汪汪"

class Puppy(Dog):
    def speak(self):
        return super().speak() + "（奶声）"

for a in (Animal("猫"), Dog("大黄"), Puppy("豆豆")):
    print(a.speak())
print(Puppy.__mro__)
```

```text
猫 出声
大黄 汪汪
豆豆 汪汪（奶声）
(<class '__main__.Puppy'>, <class '__main__.Dog'>, <class '__main__.Animal'>, <class 'object'>)
```

多继承按 MRO 从左到右查找。菱形继承（两边共同祖先是 object）里 `super()` 保证初始化只走一遍：

```python
class A:
    def __init__(self): print("A")
class B(A):
    def __init__(self): print("B"); super().__init__()
class C(A):
    def __init__(self): print("C"); super().__init__()
class D(B, C):
    def __init__(self): print("D"); super().__init__()

D()
print([c.__name__ for c in D.__mro__])
```

```text
D
B
C
A
['D', 'B', 'C', 'A', 'object']
```

::: warning 何时该用继承
继承是「是一个」关系，组合是「有一个」关系。引擎不是车的子类，车「有」引擎——把引擎作为属性持有。继承层次一深，覆写耦合就重；默认组合，确有行为多态需求才继承。
:::

## 属性装饰器：property

`@property` 把方法伪装成属性，读取时算值，配合 `@x.setter` 做校验。这是 Python 式封装：调用方感觉是属性，实现方保留校验与演化空间：

```python
class Circle:
    def __init__(self, r):
        self.r = r
    @property
    def area(self):
        return 3.14159 * self.r ** 2
    @property
    def r(self):
        return self._r
    @r.setter
    def r(self, value):
        if value <= 0:
            raise ValueError("半径必须为正")
        self._r = value

c = Circle(2)
print(c.area)
c.r = 3
print(f"{c.area:.2f}")
try:
    c.r = -1
except ValueError as e:
    print("ValueError:", e)
```

```text
12.56636
28.27
ValueError: 半径必须为正
```

## 私有约定与 name mangling

Python 没有 private。单下划线 `_x` 是「内部使用」的君子协定；双下划线前缀 `__x` 触发名称改写（name mangling）变成 `_类名__x`，主要用于避免子类无意覆盖：

```python
class Account:
    def __init__(self):
        self._owner = "内部约定"     # 惯例：类外别碰
        self.__pin = "1234"          # 改写为 _Account__pin

a = Account()
print(a._owner)
print(a.__dict__["_Account__pin"])
try:
    print(a.__pin)
except AttributeError as e:
    print("AttributeError:", type(e).__name__)
```

```text
内部约定
1234
AttributeError: AttributeError
```

## 静态方法与类方法

`@staticmethod` 不接收实例或类，就是放在类命名空间里的普通函数；`@classmethod` 接收类本身（约定叫 `cls`），最常见的用途是替代构造器：

```python
import datetime

class Event:
    def __init__(self, name, at):
        self.name, self.at = name, at

    @classmethod
    def from_iso(cls, name, iso):
        return cls(name, datetime.datetime.fromisoformat(iso))

    @staticmethod
    def is_past(at):
        return at < datetime.datetime.now()

e = Event.from_iso("发布", "2026-01-01T10:00:00")
print(e.name, e.at.year, Event.is_past(e.at))
```

```text
发布 2026 True
```

## 鸭子类型与 Protocol

Python 的多态不要求共同父类——只要对象有需要的方法就能用（鸭子类型）。需要显式声明结构时用 `typing.Protocol` 做静态检查，运行时依旧不强制：

```python
from typing import Protocol

class Speaker(Protocol):
    def speak(self) -> str: ...

class Robot:
    def __init__(self, name): self.name = name
    def speak(self): return f"{self.name} 哔哔"

def announce(s: Speaker):
    print(s.speak())          # 不检查类型来源，有 speak 就能传

announce(Robot("R2"))
```

```text
R2 哔哔
```

## 小结

- `__new__` 建实例、`__init__` 初始化；属性查找「实例 → 类 → 父类链」。
- 默认组合优先；确需多态才继承，`super()` 沿 MRO 调用。
- `@property` + setter 实现带校验的属性式封装。
- `_x` 惯例私有，`__x` 名称改写防子类冲突；`@classmethod` 做替代构造器。
- 鸭子类型 + `Protocol`：结构对得上就能协作。
