# 推导式、迭代器与生成器

推导式是一行变换集合的语法，迭代器是「按需产出」的协议，生成器把迭代器写成带 `yield` 的函数。

## 四种推导式

列表、字典、集合、生成器各有推导式，形状一致——「表达式 + for + 可选 if」：

```python
squares = [n * n for n in range(6)]
evens = [n for n in range(10) if n % 2 == 0]
labels = [f"{n}!" for n in range(3)]
print(squares, evens, labels)
```

```text
[0, 1, 4, 9, 16, 25] [0, 2, 4, 6, 8] ['0!', '1!', '2!']
```

字典与集合推导式换掉外层括号和目标表达式；嵌套循环从左到右展开，与等价的 for 写法一一对应：

```python
lengths = {w: len(w) for w in ("py", "python")}
unique_lens = {len(w) for w in ("a", "bb", "cc")}
print(lengths, unique_lens)

pairs = [(x, y) for x in "ab" for y in (1, 2)]
print(pairs)
```

```text
{'py': 2, 'python': 6} {1, 2}
[('a', 1), ('a', 2), ('b', 1), ('b', 2)]
```

::: tip 带条件的表达式
if 放在 for 后面是过滤；if/else 放在表达式里是变换。两个位置别混：

```python
nums = range(6)
print([n for n in nums if n % 2 == 0])       # 过滤：只留偶数
print(["偶" if n % 2 == 0 else "奇" for n in nums])   # 变换：每个都要
```

```text
[0, 2, 4]
['偶', '奇', '偶', '奇', '偶', '奇']
```
:::

推导式不是越「一行」越好：超过两层循环或需要中间变量时，普通 for 循环可读性更高。

## 迭代器协议

可迭代对象（Iterable）实现了 `__iter__`；迭代器（Iterator）额外实现 `__next__`。`for` 循环的底层动作就是「拿迭代器，反复 `next`，直到 StopIteration」：

```python
nums = [10, 20]
it = iter(nums)            # 从可迭代对象取迭代器
print(next(it), next(it))
try:
    next(it)
except StopIteration:
    print("StopIteration")
```

```text
10 20
StopIteration
```

迭代器是一次性的：耗尽后再次遍历得到空。列表可以反复 for（每次 `iter()` 发新的迭代器），但生成器、文件对象、`zip`/`map` 的返回值都只能消费一遍：

```python
gen = (n * n for n in range(3))     # 生成器表达式：圆括号
print(sum(gen), sum(gen))           # 第二次已经是空

nums = [1, 2, 3]
print(sum(nums), sum(nums))         # 列表可反复消费
```

```text
5 0
6 6
```

## 生成器函数

函数体里出现 `yield`，它就不再是普通函数：调用返回生成器，代码体在每次 `next` 时推进到下一个 `yield` 后暂停，状态完整保留。惰性求值——用到哪个算哪个，内存只放当前项：

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

cd = countdown(3)
print(next(cd), next(cd))
print(list(cd))

def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

from itertools import islice
print(list(islice(fib(), 8)))       # 无限序列也能只取前 8 项
```

```text
3 2
[1]
[0, 1, 1, 2, 3, 5, 8, 13]
```

生成器可以套生成器——`yield from` 委托给子生成器，展开嵌套结构特别顺手：

```python
def tree(leaves):
    for group in leaves:
        yield from group

print(list(tree([[1, 2], [3], [4, 5]])))
```

```text
[1, 2, 3, 4, 5]
```

## 生成器的双向通信

`yield` 是表达式：`send()` 往里塞值，`close()` 触发 GeneratorExit。典型应用是消费者-生产者协作：

```python
def averager():
    total, count = 0.0, 0
    avg = None
    while True:
        value = yield avg
        total += value
        count += 1
        avg = total / count

avg = averager()
next(avg)                  # 推进到第一个 yield（预激）
print(avg.send(10), avg.send(20), avg.send(30))
avg.close()
```

```text
10.0 15.0 20.0
```

## 生成器表达式 vs 列表推导式

 summed 立即求值，生成器惰性。数据量大、只遍历一遍时用生成器省内存；需要多次使用、切片、len 时用列表：

```python
big = range(1_000_000)
lst = [n * 2 for n in big]        # 立即建满整个列表
gen = (n * 2 for n in big)        # 0 个元素先算好
import sys
print(sys.getsizeof(lst) > sys.getsizeof(gen))
print(sum(gen))
```

```text
True
999999000000
```

## 标准库迭代工具

`itertools` 是迭代器算子库：`chain` 串联、`product` 笛卡尔积、`combinations` 组合、`groupby` 分组（需先按同键排序）。`zip`/`enumerate`/`reversed` 也是迭代器家族：

```python
from itertools import chain, product, combinations, groupby

print(list(chain([1], [2, 3])))
print(list(product("ab", (1, 2))))
print(list(combinations("abc", 2)))

data = sorted(["apple", "avocado", "banana"], key=lambda w: w[0])
for letter, group in groupby(data, key=lambda w: w[0]):
    print(letter, list(group))
```

```text
[1, 2, 3]
[('a', 1), ('a', 2), ('b', 1), ('b', 2)]
[('a', 'b'), ('a', 'c'), ('b', 'c')]
a ['apple', 'avocado']
b ['banana']
```

## 小结

- 推导式 = 表达式 + for + 过滤 if；复杂逻辑退回普通循环。
- 迭代器一次性消费；列表可反复遍历。
- 生成器函数用 yield 惰性产出，能表达无限序列；`yield from` 做委托。
- 只遍历一遍的大数据用生成器表达式，反复访问用列表。
- `itertools` + 内建 `zip`/`enumerate` 覆盖绝大多数迭代需求。
