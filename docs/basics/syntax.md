---
description: 缩进即语法、注释与文档字符串、变量命名等 Python 源文件层的基本规则。
---

# 语法基础

Python 的语法哲学是「可读性优先」：用缩进表达块结构，语句末尾没有分号，大量语义靠约定俗成的命名表达。本章过一遍最基础的语言面。

## 缩进即语法

Python 不用花括号划块，缩进本身就是语法。同一代码块的语句必须左对齐，官方风格是 4 个空格，禁止 tab 与空格混用：

```python
score = 86
if score >= 60:
    print("及格")
    print("分数:", score)
else:
    print("不及格")
```

缩进错误属于语法错误：该缩进不缩进报 `IndentationError`，多缩进一层报 `unexpected indent`。

## 注释与文档字符串

`#` 到行尾是注释；三引号字符串放在模块、函数、类的第一行就是文档字符串（docstring），运行时可通过 `__doc__` 访问，也是 `help()` 的内容来源：

```python
def area(r):
    """计算圆面积。

    参数 r 为半径，返回 3.14 近似值。
    """
    return 3.14 * r ** 2

print(area(2))
print(area.__doc__.splitlines()[0])
```

```text
12.56
计算圆面积。
```

## 变量与赋值

Python 变量是「名字贴在对象上」，赋值即绑定，无需声明类型。一行可以赋多个变量，也支持交互式交换：

```python
x, y = 10, 20
x, y = y, x            # 交换
print(x, y)

a = b = c = 0          # 链式赋值，三个名字指向同一个 0
print(a, b, c)

n, rest = 1, [2, 3]    # 解包赋值
print(n, rest)
```

```text
20 10
0 0 0
1 [2, 3]
```

海象运算符 `:=`（Python 3.8+）允许在表达式内部赋值，典型场景是「先算后判」：

```python
data = [3, -1, 0, 7]
total = 0
for v in data:
    if (abs_v := abs(v)) > 2:
        total += abs_v
print(total)
```

```text
10
```

## 基本语句

表达具体动作的语句就几种。`print` 输出，`input` 读入（返回字符串），`del` 删名字，`pass` 是什么都不做的占位语句：

```python
name = "Python"
print(f"Hello, {name}!")

age = input("你的年龄是 18：") if False else "18"   # 脚本里通常不读 stdin，这里直接给值
print(int(age) + 1)

unused = 3
del unused        # 删除名字绑定
```

```text
Hello, Python!
19
```

## 行与编码

物理行与逻辑行：一个逻辑行可以是一条语句，分号能把多条语句挤在一行，但风格上不推荐。过长表达式用括号隐式续行，或用反斜杠显式续行：

```python
total = (1 + 2
         + 3 + 4)
print(total)
s = "abc" \
    "def"
print(s)
```

```text
10
abcdef
```

源文件默认 UTF-8 编码，中文字符串无需任何声明。Python 3 的标识符甚至允许中文（虽然不建议）：

```python
变量 = 42
print(变量)
```

```text
42
```

## 小结

- 缩进是语法：4 空格，不混 tab。
- 变量是名字绑定对象，`:=` 在表达式里赋值。
- docstring 写在模块/函数/类第一行，`__doc__` 可取。
- 长表达式用括号续行，源码默认 UTF-8。
