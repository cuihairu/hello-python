---
description: import 形态、模块单例语义、包结构与 __init__.py、sys.path 与项目布局。
---

# 模块与包

模块是一个 .py 文件，包是带 `__init__.py`（3.3+ 起可省略）的目录。Python 的一切导入都围绕这两级结构展开。

## import 的几种形态

```python
import json                          # 用 json.dumps
import collections                   # as 别名：标准库示例
from pathlib import Path             # 直接引入名字
from collections import defaultdict, Counter
from math import sqrt, pi as 圆周率
```

实际验证一下核心语义：`import` 执行整个模块并绑定模块名；`from` 只绑定指定名字：

```python
import json
from json import dumps

print(json.dumps([1, 2]), dumps([3]))
```

```text
[1, 2] [3]
```

::: warning 不要 import *
`from module import *` 把公共名字全部倒进当前命名空间，来源不可追溯、极易遮蔽。发布 API 时用 `__all__` 声明 `*` 的白名单，日常代码里不要用 `*` 导入。
:::

## 模块即单例

模块第一次被导入时执行一次，之后进入 `sys.modules` 缓存，再次导入直接复用——模块天然是进程级单例，适合放配置与连接池。看执行次数：

```python
import sys, types

mod = types.ModuleType("counter_mod")
exec("loads = []\nloads.append('init')", mod.__dict__)
print(mod.loads)
sys.modules["counter_mod"] = mod                # 手工注册进缓存

import importlib
same = importlib.import_module("counter_mod")   # 命中缓存，不再执行模块体
print(same is mod, mod.loads)
```

```text
['init']
True ['init']
```

## 包结构与 __init__.py

典型项目布局：

```text
myproject/
├── pyproject.toml
└── src/
    └── mypkg/
        ├── __init__.py
        ├── core.py
        └── utils/
            ├── __init__.py
            └── text.py
```

`__init__.py` 在包被导入时执行，常用来把子模块的名字提升到包顶层，让调用方 `from mypkg import Thing` 而不必知道文件结构：

```python
# mypkg/__init__.py 的典型写法：
# from .core import Thing
# __all__ = ["Thing"]
```

相对导入只在包内使用：`.core` 同级、`..utils` 上一级。脚本直接运行时不能用相对导入——「attempted relative import with no known parent package」就是入口文件里写了相对导入。

## `if __name__ == "__main__"`

模块被导入时 `__name__` 是模块名；作为脚本直接执行时是 `"__main__"`。这个开关让文件既能被导入复用、又能直接跑：

```python
# mymod.py
def add(a, b):
    return a + b

if __name__ == "__main__":       # 只有直接运行时才执行
    print(add(2, 3))
```

把下面的内容当脚本执行与导入各来一遍：

```python
script = "def add(a, b):\n    return a + b\n\nif __name__ == '__main__':\n    print(add(2, 3))\n"
import pathlib, subprocess, tempfile, sys

with tempfile.TemporaryDirectory() as d:
    p = pathlib.Path(d) / "mymod.py"
    p.write_text(script, encoding="utf-8")
    r1 = subprocess.run([sys.executable, str(p)], capture_output=True, text=True)
    print("直接运行:", r1.stdout.strip())
    sys.path.insert(0, d)
    import mymod                                  # 导入：main 块不执行
    print("导入后调用:", mymod.add(10, 5))
```

```text
直接运行: 5
导入后调用: 15
```

## 导入路径与 sys.path

解释器按 `sys.path` 里的目录顺序找模块：脚本所在目录、`PYTHONPATH`、站点包目录。临时加路径用 `sys.path.insert`（调试用）；正式项目靠安装（pip install -e .）或虚拟环境：

```python
import sys
print(len(sys.path) > 1, any("site-packages" in p for p in sys.path))
```

```text
True True
```

## 常用布局与最佳实践

- `src/` 布局（包放在 src/ 下）强迫测试只能用安装后的包，避免「本地能跑、装上就坏」。
- 循环导入（A 导 B、B 导 A）通常说明职责划分有问题；把公共部分抽到第三个模块。
- `python -m pkg.module` 以模块身份运行，保证包上下文完整，比相对路径跑脚本可靠。

## 小结

- import 找到模块、执行一次、缓存进 `sys.modules`。
- `__init__.py` 提升包的公共 API，`__all__` 声明 `*` 白名单。
- `if __name__ == "__main__"` 区分「被导入」与「被执行」。
- 项目用 src/ 布局 + 可编辑安装，杜绝 sys.path hack。
