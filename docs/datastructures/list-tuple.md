# 列表与元组

列表（list）和元组（tuple）都是有序序列，区别只有一条：list 可变，tuple 不可变。这决定了它们的使用场景——同类元素的动态集合用 list，结构固定的记录用 tuple。

## 列表：增删改查

```python
nums = [3, 1, 2]
nums.append(4)             # 尾部追加
nums.insert(0, 0)          # 指定位置插入（O(n)，慎用）
nums.extend([5, 6])        # 合并另一序列
print(nums)

print(nums.pop(), nums.pop(0))   # 弹出尾部 / 指定位置
nums.remove(3)             # 按值删第一个匹配
print(nums, nums.index(2), nums.count(2))
```

```text
[0, 3, 1, 2, 4, 5, 6]
6 0
[1, 2, 4, 5] 1 1
```

排序：`list.sort()` 原地排序返回 None；`sorted()` 返回新列表。两者都支持 `key` 与 `reverse`：

```python
words = ["banana", "fig", "apple"]
print(sorted(words))
print(sorted(words, key=len, reverse=True))

nums = [3, 1, 2]
print(nums.sort(), nums)   # sort 返回 None，原地生效
```

```text
['apple', 'banana', 'fig']
['banana', 'apple', 'fig']
None [1, 2, 3]
```

## 切片

切片 `seq[start:stop:step]` 左闭右开，产生新对象。省略即到头，负数从尾数。这是 Python 序列的通用语法，字符串、元组同样适用：

```python
nums = [0, 1, 2, 3, 4, 5]
print(nums[1:4], nums[:3], nums[3:])
print(nums[-2:], nums[::2], nums[::-1])

copy = nums[:]             # 浅拷贝
copy[0] = 99
print(nums[0], copy[0])
```

```text
[1, 2, 3] [0, 1, 2] [3, 4, 5]
[4, 5] [0, 2, 4] [5, 4, 3, 2, 1, 0]
0 99
```

切片还能对列表原地赋值，实现替换、插入、删除一段：

```python
nums = [0, 1, 2, 3, 4]
nums[1:3] = [10, 20, 30]   # 2 个换 3 个，长度可变
print(nums)
del nums[1:4]
print(nums)
```

```text
[0, 10, 20, 30, 3, 4]
[0, 3, 4]
```

## 列表是引用

赋值只复制引用，两个名字指向同一个列表——修改一个「另一个也变了」。要独立副本用切片 `[:]`、`list()` 或 `copy` 模块；嵌套结构需要 `copy.deepcopy`：

```python
import copy

a = [[1, 2], [3, 4]]
shallow = a.copy()         # 浅拷贝：外层新列表，内层仍是同一批子列表
shallow[0].append(99)
print(a[0])                # 内层被共享，a 也变了

deep = copy.deepcopy(a)
deep[1].append(88)
print(a[1], deep[1])       # 深拷贝彻底独立
```

```text
[1, 2, 99]
[3, 4] [3, 4, 88]
```

::: warning `[[]] * n` 陷阱
`[[]] * 3` 复制的是同一个内层列表的引用三次，append 一个全变。多维列表用推导式创建：

```python
grid = [[0] * 3] * 2       # 反例：两行是同一个列表
grid[0][0] = 9
print(grid)

grid2 = [[0] * 3 for _ in range(2)]   # 每行独立
grid2[0][0] = 9
print(grid2)
```

```text
[[9, 0, 0], [9, 0, 0]]
[[9, 0, 0], [0, 0, 0]]
```
:::

## 元组

元组不可变，适合表达「固定结构的记录」：坐标、数据库行、多返回值。语法关键是逗号而非括号——单元素元组必须写 `(1,)`：

```python
point = 3, 4               # 括号可省
single = (1,)
not_tuple = (1)            # 这只是整数 1
print(point, single, not_tuple)

x, y = point               # 解包
print(x + y)
```

```text
(3, 4) (1,) 1
7
```

函数「返回多个值」实际是返回一个元组，调用方解包接收；扩展解包 `*rest` 收集剩余：

```python
def minmax(nums):
    return min(nums), max(nums)

lo, hi = minmax([3, 1, 4, 1, 5])
print(lo, hi)

first, *rest = [1, 2, 3, 4]
print(first, rest)
```

```text
1 5
1 [2, 3, 4]
```

元组不可变但「内容」可能可变：`t = ([1], 2)` 里列表仍可原地改。元组能作字典键的前提是内容全部可哈希：

```python
t = ([1, 2], 3)
t[0].append(99)
print(t)

try:
    {[1]: "a"}
except TypeError as e:
    print("TypeError:", type(e).__name__)   # 异常消息随版本措辞有别，只取类型名
print({(1, 2): "ok"})
```

```text
([1, 2, 99], 3)
TypeError: TypeError
{(1, 2): 'ok'}
```

## 命名元组

记录语义想带字段名，用 `collections.namedtuple` 或 3.6+ 的 `typing.NamedTuple`，比裸下标可读得多：

```python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x + p.y, p._asdict())

from typing import NamedTuple

class Vec(NamedTuple):
    dx: float
    dy: float

print(Vec(1.5, 2.5).dx)
```

```text
7 {'x': 3, 'y': 4}
1.5
```

## 何时用元组

| 场景 | 选择 | 理由 |
| --- | --- | --- |
| 会增删改的元素集合 | list | 可变，方法齐全 |
| 函数多返回值、固定记录 | tuple | 不可变，结构即语义 |
| 字典键、集合元素 | tuple | 可哈希 |
| 大量只读遍历 | tuple | 更省内存，且防误改 |

## 小结

- list 可变、tuple 不可变；切片左闭右开、产生新对象。
- 赋值即共享引用，嵌套结构要独立用 deepcopy。
- `[[]] * n` 是引用复制陷阱，多维用推导式。
- 固定结构记录用 tuple/NamedTuple，动态集合用 list。
