# 字典与集合

字典（dict）是键到值的映射，集合（set）是无重复元素的容器。两者都基于哈希表实现，查找、插入、删除的平均复杂度都是 O(1)，键/元素必须可哈希。

## 字典：增删改查

```python
user = {"name": "Alice", "age": 30}
user["city"] = "Beijing"          # 新增 / 覆盖
print(user["name"], user.get("email"))
print(user.get("email", "未填写"))   # get 带默认值，键不存在不报错

del user["city"]
print(len(user), "name" in user)
```

```text
Alice None
未填写
2 True
```

取不存在键的两种安全姿势：`get` 给默认值；`setdefault` 取值不存在时顺带写入。批量更新用 `update`：

```python
cfg = {"theme": "dark"}
print(cfg.setdefault("lang", "zh"), cfg)
print(cfg.setdefault("theme", "light"), cfg)   # 已存在则原值返回，不覆盖

cfg.update(theme="light", font=14)
print(cfg)
```

```text
zh {'theme': 'dark', 'lang': 'zh'}
dark {'theme': 'dark', 'lang': 'zh'}
{'theme': 'light', 'lang': 'zh', 'font': 14}
```

遍历默认按键；`values()` 取值，`items()` 取键值对。字典 3.7 起保持插入顺序：

```python
scores = {"math": 90, "english": 85, "code": 99}
for k, v in scores.items():
    print(k, v, end="; ")
print()
print(sorted(scores, key=scores.get, reverse=True))   # 按值排序取键
```

```text
math 90; english 85; code 99; 
['code', 'math', 'english']
```

## 字典推导式与合并

```python
squares = {n: n * n for n in range(4)}
print(squares)
inv = {v: k for k, v in squares.items()}    # 反转键值（值须可哈希）
print(inv)

d1, d2 = {"a": 1, "b": 2}, {"b": 20, "c": 30}
merged = d1 | d2                            # 3.9+ 合并运算符，右侧优先
print(merged)
```

```text
{0: 0, 1: 1, 2: 4, 3: 9}
{0: 0, 1: 1, 4: 2, 9: 3}
{'a': 1, 'b': 20, 'c': 30}
```

::: tip defaultdict 与 Counter
`collections.defaultdict` 给缺失键自动造默认值，免写 `if key in d`；`Counter` 一行完成计数统计：

```python
from collections import defaultdict, Counter

groups = defaultdict(list)
for name, dept in [("alice", "dev"), ("bob", "ops"), ("carol", "dev")]:
    groups[dept].append(name)
print(dict(groups))

words = "the quick the lazy the dog".split()
print(Counter(words).most_common(2))
```

```text
{'dev': ['alice', 'carol'], 'ops': ['bob']}
[('the', 3), ('quick', 1)]
```
:::

## 集合

集合字面量用花括号（空集合必须 `set()`，`{}` 是空字典）。核心能力是去重与成员判断，支持数学集合运算：

```python
a = {1, 2, 3, 4}
b = {3, 4, 5}
print(a | b, a & b, a - b, a ^ b)   # 并 交 差 对称差
print(3 in a, len({1, 1, 2}))       # 成员判断与去重

nums = [1, 2, 2, 3, 3, 3]
print(list(set(nums)))              # 经典去重（顺序不保证）
```

```text
{1, 2, 3, 4, 5} {3, 4} {1, 2} {1, 2, 5}
True 2
[1, 2, 3]
```

集合会打乱顺序（哈希决定），需要去重又保序时用 `dict.fromkeys`——字典键在 3.7+ 有序：

```python
nums = [3, 1, 3, 2, 1]
print(list(dict.fromkeys(nums)))
```

```text
[3, 1, 2]
```

可变集合用 `add`/`remove`（元素不存在抛 KeyError）或 `discard`（不存在静默）。`frozenset` 是不可变集合，可作字典键或放入另一个集合：

```python
s = {1, 2}
s.add(3)
s.discard(99)
print(s)

fs = frozenset([1, 2])
print({fs: "hashable"})
```

```text
{1, 2, 3}
{frozenset({1, 2}): 'hashable'}
```

## 哈希与可哈希

键必须是可哈希对象（实现 `__hash__` 且生命周期内哈希值不变）：数字、字符串、字节、内容都可哈希的元组可以；list、dict、set，以及内容里有 list/dict/set 的元组，都不行。这就是「为什么列表不能当字典键」的根源：

```python
try:
    d = {["x"]: 1}
except TypeError as e:
    print("TypeError:", type(e).__name__)   # 异常消息随版本措辞有别，只取类型名
print({("x",): 1, "y": 2})
```

```text
TypeError: TypeError
{('x',): 1, 'y': 2}
```

## 键类型实践

字典的键常用枚举、元组或字符串。元组键天然表达多维坐标，比嵌套字典更扁平：

```python
board = {(0, 0): "x", (1, 2): "o"}
print(board[(1, 2)], board.get((0, 1), "-"))
print(list(board.items()))
```

```text
o -
[((0, 0), 'x'), ((1, 2), 'o')]
```

## 小结

- dict/set 查改删均摊 O(1)，键/元素必须可哈希。
- 取值用 `get`/`setdefault`，缺键统计用 `defaultdict`，计数用 `Counter`。
- 3.7+ dict 保插入序；去重保序用 `dict.fromkeys`。
- 合并用 `|`（3.9+），反转/变换用字典推导式。
