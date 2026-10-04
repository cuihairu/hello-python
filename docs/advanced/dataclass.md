---
description: "@dataclass 自动生成 __init__、__repr__、__eq__，field 与 __post_init__ 配置。"
---

# dataclass 与结构化数据

多数类本质是「带字段的结构」：存数据、比较相等、打印可读。`@dataclass` 装饰器把这些样板代码自动生成，3.7 起用它表达结构化数据。

## 基本用法

装饰器根据类注解自动生成 `__init__`、`__repr__`、`__eq__`。字段用「名字: 类型」声明，类级赋值给默认值：

```python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int = 0

u1 = User("Alice", 30)
u2 = User("Alice", 30)
print(u1)
print(u1 == u2, u1 != User("Bob", 30))
```

```text
User(name='Alice', age=30)
True True
```

::: warning 默认值必须是不可变或 default_factory
字段默认值与函数默认参数同一个坑：所有实例共享。可变默认（list/dict/set）必须用 `field(default_factory=...)` 让每个实例拿新对象，直接写 `tags: list = []` 会抛 `ValueError`：

```python
from dataclasses import dataclass, field

@dataclass
class Post:
    title: str
    tags: list = field(default_factory=list)
    meta: dict = field(default_factory=dict)

p1, p2 = Post("a"), Post("b")
p1.tags.append("py")
print(p1.tags, p2.tags)
```

```text
['py'] []
```
:::

## 常用开关

`frozen=True` 让实例不可变（可哈希、可作字典键）；`order=True` 生成比较方法（按字段顺序）；`slots=True`（3.10+）启用 slots 省内存；`kw_only=True`（3.10+）字段全部仅关键字：

```python
from dataclasses import dataclass

@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int = 0

v = Version(3, 12)
print(v.major, sorted([Version(3, 11), Version(3, 12)])[0])
print({v: "key"}[v])
try:
    v.major = 4
except Exception as e:
    print(type(e).__name__)
```

```text
3 Version(major=3, minor=11)
key
FrozenInstanceError
```

## field 与 __post_init__

`field()` 控制单个字段行为：`default_factory`、`repr=False`、`compare=False`、`init=False` 等。需要派生字段或校验时实现 `__post_init__`，它在 `__init__` 末尾被自动调用：

```python
from dataclasses import dataclass, field

@dataclass
class Order:
    price: float
    qty: int
    total: float = field(init=False)      # 不进 __init__，由派生得出
    note: str = field(default="", repr=False)

    def __post_init__(self):
        if self.price < 0 or self.qty < 0:
            raise ValueError("价格与数量必须非负")
        self.total = self.price * self.qty

o = Order(9.5, 3)
print(o.total, o)
try:
    Order(-1, 1)
except ValueError as e:
    print("ValueError:", e)
```

```text
28.5 Order(price=9.5, qty=3, total=28.5)
ValueError: 价格与数量必须非负
```

## 与序列化互转

`asdict()`/`astuple()` 递归转出纯 dict/tuple，配合 json 一行入库；`replace()` 基于现有实例派生修改后的副本（frozen 类尤其常用）：

```python
import json
from dataclasses import dataclass, asdict, replace

@dataclass
class Point:
    x: float
    y: float

p = Point(1.0, 2.0)
print(json.dumps(asdict(p)))
print(replace(p, x=9.0), asdict(p))
```

```text
{"x": 1.0, "y": 2.0}
Point(x=9.0, y=2.0) {'x': 1.0, 'y': 2.0}
```

## 结构化数据的工具谱系

| 工具 | 定位 | 适用 |
| --- | --- | --- |
| `@dataclass` | 标准库，生成样板 | 内部结构、配置对象、值语义 |
| `typing.NamedTuple` | 不可变元组带字段 | 轻量记录、需要元组兼容 |
| `attrs` | 第三方，功能超集 | 需要更强校验/转换时 |
| `pydantic` | 运行时校验 + 解析 | API 边界：外部数据进系统 |

外部输入（HTTP、配置文件）走 pydantic 这类带运行时校验的；系统内部流转用 dataclass 就够。

## 小结

- `@dataclass` 自动生成 `__init__`/`__repr__`/`__eq__`，字段声明即文档。
- 可变默认用 `field(default_factory=...)`。
- `frozen` 换不可变与可哈希，`__post_init__` 做派生与校验。
- `asdict`/`replace` 服务序列化与不可变更新。
