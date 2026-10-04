---
description: if 分支、for/while 循环与循环 else、match 模式匹配和推导式预览。
---

# 控制流

Python 的控制流三件套：`if` 分支、`for` 循环、`while` 循环，加上 `break`、`continue`、`else` 三个调节语句，以及 3.10+ 的 `match` 结构化模式匹配。

## if 分支

`if`/`elif`/`else` 逐层匹配，条件是任意表达式（按真值判定），不需要括号：

```python
score = 86
if score >= 90:
    level = "优秀"
elif score >= 60:
    level = "及格"
else:
    level = "不及格"
print(level)
```

```text
及格
```

条件表达式（三元）把 if 压成一行，两边都可以是表达式：

```python
age = 20
status = "成年" if age >= 18 else "未成年"
print(status)
print("及格" if 75 >= 60 else "不及格")
```

```text
成年
及格
```

## for 循环

`for` 遍历的是「可迭代对象」，不是 C 风格的计数器。数字区间用 `range()`，它惰性生成序列（Python 3 的 range 不占内存）：

```python
for i in range(3):
    print(i, end=" ")
print()

for i in range(1, 6, 2):     # start, stop, step
    print(i, end=" ")
print()

words = ["py", "thon"]
for idx, w in enumerate(words):
    print(idx, w)
```

```text
0 1 2 
1 3 5 
0 py
1 thon
```

遍历字典时默认按键走，`items()` 取键值对（3.7+ 按插入序）：

```python
scores = {"math": 90, "english": 85}
for k in scores:
    print(k)
for k, v in scores.items():
    print(k, v)
```

```text
math
english
math 90
english 85
```

需要下标又不想手动计数，用 `enumerate`；需要同时遍历两个序列，用 `zip`：

```python
names = ["alice", "bob"]
grades = [90, 85]
for n, g in zip(names, grades):
    print(n, g)

keys = ["a", "b"]
pairs = list(zip(keys, [1, 2]))
print(pairs)
```

```text
alice 90
bob 85
[('a', 1), ('b', 2)]
```

## while 与循环 else

`while` 在条件为真时反复执行。循环正常结束（没被 `break` 打断）会执行 `else`——这在「查质数、找因子」类场景里最自然，省掉一个布尔标志：

```python
def largest_factor(n):
    for i in range(n // 2, 1, -1):
        if n % i == 0:
            return i
    else:
        return 1          # for 走完没 return，说明 n 是质数

print(largest_factor(28), largest_factor(13))
```

```text
14 1
```

`break` 跳出整个循环，`continue` 跳过本次进入下一次：

```python
for i in range(5):
    if i == 3:
        break
    if i == 1:
        continue
    print(i, end=" ")
print()
```

```text
0 2 
```

## match 模式匹配

Python 3.10 引入 `match`/`case`，做结构化解构（类似 Rust/Swift），比一长串 `if/elif` 干净得多。`case _` 是通配（必放最后，否则后面的分支不可达）：

```python
cmd = ("GET", "/api/users")
match cmd:
    case ("GET", path):
        print("GET", path)
    case ("POST", path):
        print("POST", path)
    case _:
        print("unknown")
```

```text
GET /api/users
```

列表模式可解构定长序列，带星号的 `*rest` 收集剩余元素，还能给子模式起别名：

```python
match [1, 2, 3]:
    case [first, *rest]:
        print(first, rest)
    case []:
        print("empty")

match {"type": "circle", "r": 2}:
    case {"type": "circle", "r": r}:
        print("circle radius", r)
    case _:
        print("other")
```

```text
1 [2, 3]
circle radius 2
```

::: tip 守卫与绑定
`case [x, y] if x < y:` 里 `if` 是守卫条件；小写标识符是捕获绑定，字面量（数字、字符串）与大写常量才做相等比较。
:::

## 推导式预览

「对每个元素做变换再收集」有一行解法——推导式的完整讨论在数据结构章节，这里先认识形状：

```python
squares = [n * n for n in range(5)]
evens = [n for n in range(10) if n % 2 == 0]
print(squares, evens)
```

```text
[0, 1, 4, 9, 16] [0, 2, 4, 6, 8]
```

## 小结

- `for` 遍历可迭代对象，计数用 `range`，下标用 `enumerate`，并排用 `zip`。
- 循环 `else` 只在「没 break」时执行，替代布尔标志。
- `match`（3.10+）做结构化模式匹配，`case _` 兜底。
- 一行变换用推导式，可读性优先。
