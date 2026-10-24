---
description: Class definition, inheritance and polymorphism, property and the other OOP fundamentals, down to instance methods and the attribute protocol.
---

# Object-oriented programming: classes and inheritance

Python classes bind data and behavior together. This page collects class definition, the instance mechanism, attribute lookup, inheritance and polymorphism, the encapsulation conventions, and the class syntax beyond dataclass.

## Classes and instances

`class` defines a class. By convention the first parameter of an instance method is called `self`, and it points at the instance itself. `__init__` is called automatically on instantiation and initializes the instance attributes:

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

## The instance mechanism

`Dog("旺财", 3)` does two things in one step: `__new__` creates the instance, `__init__` initializes it. Attribute lookup goes "instance dict -> class dict -> parent chain"; assigning on an instance only writes into the instance's own dict and never touches the class:

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

A class attribute being "shadowed" by an instance is the direct consequence of this lookup. A shared mutable class attribute (such as a counter) must be changed through the class name:

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

## Inheritance and super

A subclass inherits every method of its parent and may override a method of the same name. `super()` calls the next implementation along the MRO (method resolution order), which avoids hard-coding the parent's name:

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

Multiple inheritance looks up names left to right along the MRO. In a diamond hierarchy (where both branches share object as a common ancestor) `super()` guarantees initialization runs only once:

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

::: warning When to use inheritance
Inheritance is an "is a" relationship; composition is a "has a" relationship. An engine is not a subclass of car; a car "has" an engine - hold the engine as an attribute. The deeper the inheritance tree, the heavier the coupling through overrides; default to composition and only inherit when you genuinely need behavioral polymorphism.
:::

## The attribute decorator: property

`@property` dresses a method up as an attribute, computing its value on read; pair it with `@x.setter` to validate on write. This is Pythonic encapsulation: the caller sees an attribute, the implementer keeps room for validation and for evolving the storage:

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

## Privacy conventions and name mangling

Python has no private. A single underscore `_x` is a gentleman's agreement meaning "internal use"; a double-underscore prefix `__x` triggers name mangling, rewriting it as `_ClassName__x`, mainly to keep subclasses from overwriting it by accident:

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

## Static methods and class methods

`@staticmethod` takes neither an instance nor a class - it is just an ordinary function living in the class namespace; `@classmethod` takes the class itself (conventionally called `cls`), and its most common use is as an alternative constructor:

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

## Duck typing and Protocol

Polymorphism in Python does not require a common parent class - anything with the method you need can be used (duck typing). When you want to declare the structure explicitly, use `typing.Protocol` for static checking; nothing is enforced at runtime:

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

## Summary

- `__new__` creates the instance, `__init__` initializes it; attribute lookup goes "instance -> class -> parent chain".
- Prefer composition by default; inherit only when you genuinely need polymorphism, and let `super()` follow the MRO.
- `@property` plus a setter gives you validated, attribute-style encapsulation.
- `_x` is private by convention, `__x` is name-mangled to prevent subclass clashes; `@classmethod` makes an alternative constructor.
- Duck typing plus `Protocol`: if the shapes line up, the objects can work together.

## Further reading

- [Python official documentation · Tutorial](https://docs.python.org/3/tutorial/classes.html)
- [Python official documentation · Language reference](https://docs.python.org/3/reference/datamodel.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/zh/knowledge/books)
- [core-concepts](/zh/knowledge/core-concepts)
- [scenarios](/zh/knowledge/scenarios)
