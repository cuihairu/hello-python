# 类型注解

类型注解从 3.5 引入、3.9/3.10/3.12 持续演进。Python 运行时**不校验**注解——它是给人和静态检查器（mypy、pyright、ruff）看的契约，换来 IDE 补全和更早暴露的 bug。

## 基本注解

变量、函数参数、返回值都可注解。3.9+ 直接用内建容器泛型 `list[int]`，不再需要 `typing.List`；3.10+ 联合类型写 `X | Y`，不再需要 `Optional`：

```python
def normalize(name: str, times: int = 1) -> list[str]:
    return [name.strip().lower()] * times

count: int = 3
names: list[str] = normalize("  Py ")
print(names, count)

def find(key: str, data: dict[str, int]) -> int | None:
    return data.get(key)

print(find("a", {"a": 1}), find("z", {"a": 1}))
```

```text
['py'] 3
1 None
```

旧写法对照：`typing.List[int]` ≡ `list[int]`，`Optional[X]` ≡ `X | None`，`Union[X, Y]` ≡ `X | Y`。读老代码要认识，写新代码用新语法。

## 容器与嵌套

```python
def tally(words: list[str]) -> dict[str, int]:
    out: dict[str, int] = {}
    for w in words:
        out[w] = out.get(w, 0) + 1
    return out

print(tally(["a", "b", "a"]))

matrix: list[list[int]] = [[1, 2], [3, 4]]
print(matrix[1][0])
```

```text
{'a': 2, 'b': 1}
3
```

## TypedDict 与 NamedTuple

字典结构想给键标类型用 `TypedDict`；不可变记录用 `NamedTuple`。两者都不改变运行时行为，纯为检查器服务：

```python
from typing import TypedDict, NamedTuple

class User(TypedDict):
    name: str
    age: int

u: User = {"name": "py", "age": 30}
print(u["name"], isinstance(u, dict))

class Point(NamedTuple):
    x: float
    y: float

print(Point(1.0, 2.0).x, isinstance(Point(1, 2), tuple))
```

```text
py True
1.0 True
```

## Protocol：结构化子类型

`Protocol` 定义「有哪些方法就算哪类」，不需要显式继承——静态版的鸭子类型。函数参数标成 Protocol 类型，检查器就会验证调用方传入的对象结构：

```python
from typing import Protocol

class Greeter(Protocol):
    def greet(self) -> str: ...

class Formal:
    def greet(self) -> str:
        return "您好"

class Casual:
    def greet(self) -> str:
        return "嗨"

def welcome(g: Greeter) -> str:
    return g.greet()

print(welcome(Formal()), welcome(Casual()))
```

```text
您好 嗨
```

## 泛型函数

`TypeVar` 声明「类型与入参相关」：`first` 接 `list[T]` 返回 `T | None`，检查器能推断出传 list[str] 时返回 str | None。3.12+ 有更简的 `def first[T](...)` 语法：

```python
from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T | None:
    return items[0] if items else None

print(first(["a", "b"]), first([]), first([1, 2]))
```

```text
a None 1
```

## Callable 与迭代器类型

回调类型用 `Callable[[参数类型...], 返回类型]`；生成器用 `Generator[YieldT, SendT, ReturnT]`（3.13+ 简化为 `Generator[YieldT]`）：

```python
from collections.abc import Callable, Iterator

def apply_twice(f: Callable[[int], int], x: int) -> int:
    return f(f(x))

print(apply_twice(lambda n: n * 2, 3))

def counter(n: int) -> Iterator[int]:
    for i in range(n):
        yield i

print(list(counter(3)))
```

```text
12
[0, 1, 2]
```

## Literal、Final 与别名校验

`Literal` 限定字面量取值（状态机、开关），`Final` 禁止重新赋值，`NewType` 区分同结构的不同语义（UserId 不是 str）：

```python
from typing import Literal, Final, NewType

Mode = Literal["read", "write"]

def open_db(mode: Mode) -> str:
    return f"以 {mode} 打开"

print(open_db("read"))

MAX: Final = 100

UserId = NewType("UserId", str)
uid = UserId("u-1")
print(uid, isinstance(uid, str))
```

```text
以 read 打开
u-1 True
```

## 静态检查工具链

注解写完不检查等于没写。主流组合：

| 工具 | 角色 |
| --- | --- |
| mypy | 老牌类型检查器，配置成熟 |
| pyright / basedpyright | VS Code Pylance 内核，快 |
| ruff | 顺手覆盖部分类型 lint 规则 |

```bash
python3 -m pip install mypy
mypy src/            # 检查目录
mypy --strict src/   # 严格模式：未注解也报
```

## 小结

- 注解是静态契约，运行时不校验；配 mypy/pyright 才兑现价值。
- 新语法：内建泛型 `list[int]`、联合 `X | Y`（3.10+）、PEP 695 泛型（3.12+）。
- 结构匹配用 `Protocol`，字典结构用 `TypedDict`，语义区分用 `NewType`。
- 回调标 `Callable`，生成器标 `Iterator`/`Generator`。
