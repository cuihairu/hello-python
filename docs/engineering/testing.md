# 测试：unittest 与 pytest

测试是重构的底气。unittest 是标准库的 xUnit 风格框架，pytest 是事实上的社区标准——更简洁的断言与更灵活的 fixture。两者都能测，新项目直接上 pytest。

## 一个被测模块

贯穿本页的示例模块（校验端口配置）：

```python
# cfg.py
def parse_port(text):
    """解析端口字符串，非法值抛 ValueError。"""
    port = int(text)
    if not 1 <= port <= 65535:
        raise ValueError(f"端口越界: {port}")
    return port
```

## unittest

`unittest.TestCase` 的子类里，`assert*` 系列断言，`setUp` 每个用例前执行（构造公共夹具）：

```python
# test_cfg.py —— 配套被测模块在 docs/engineering/_examples/cfg.py
import unittest
from cfg import parse_port

class TestParsePort(unittest.TestCase):
    def setUp(self):
        self.samples = ["80", "443", "8080"]

    def test_valid_ports(self):
        for s in self.samples:
            self.assertEqual(parse_port(s), int(s))

    def test_out_of_range(self):
        with self.assertRaises(ValueError):
            parse_port("0")
        with self.assertRaises(ValueError):
            parse_port("65536")

    def test_not_a_number(self):
        with self.assertRaises(ValueError):
            parse_port("abc")

if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestParsePort)
    result = unittest.TextTestRunner(verbosity=0).run(suite)
    print(f"run={result.testsRun} failed={len(result.failures)} errors={len(result.errors)}")
```

```text
run=3 failed=0 errors=0
```

pytest 能直接运行 unittest 用例；日常工作流两种都行：

## pytest：更少的样板

pytest 不要求继承，普通函数 + `assert` 即可；异常用 `pytest.raises` 上下文：

```python
# test_cfg_pytest.py
import pytest
from cfg import parse_port

def test_valid():
    assert parse_port("80") == 80
    assert parse_port("8080") == 8080

@pytest.mark.parametrize("bad", ["0", "65536", "abc"])
def test_invalid(bad):
    with pytest.raises(ValueError):
        parse_port(bad)
```

fixture 是 pytest 的资源供给机制：`@pytest.fixture` 函数产出数据，测试函数按参数名申请，作用域可配（function/class/module/session）：

```python
# test_fixture.py
import pytest
from cfg import parse_port

@pytest.fixture
def ports():
    return {"web": "80", "db": "5432", "api": "8080"}

def test_all_valid(ports):
    for name, text in ports.items():
        assert parse_port(text) == int(text)

@pytest.fixture(scope="session")
def cache():
    store = {}
    yield store          # yield 后是 teardown，用例跑完执行
    store.clear()
```

## 测试组织与命名

- 文件名 `test_*.py` 或 `*_test.py`，函数 `test_<行为>`，类 `Test<单元>`。
- 一个测试只断言一件事；坏测试比没测试更糟。
- 行为表用 `@pytest.mark.parametrize` 展开，免写循环。

```python
import pytest
from cfg import parse_port

CASES = [
    ("80", 80),
    ("443", 443),
    ("65535", 65535),
]

@pytest.mark.parametrize("text,expected", CASES)
def test_boundary(text, expected):
    assert parse_port(text) == expected
```

## 运行与筛选

```bash
pytest                       # 当前目录发现并运行
pytest test_cfg.py -v        # 详细输出
pytest -k "port or valid"    # 按名字筛选
pytest -x                    # 首个失败即停
pytest --tb=short            # 精简回溯
pytest -q                    # 安静模式，CI 常用
```

```text
collected 3 items
test_fixture.py ..                                                     [ 66%]
test_fixture.py .                                                      [100%]
3 passed in 0.0x
```

## 测试替身

替身分四类，目的都是隔离：**stub** 提供固定返回、**spy** 记录调用、**mock** 断言调用行为、**fake** 轻量真替身（内存版数据库）。标准库 `unittest.mock` 提供 patch：

```python
from unittest.mock import patch, MagicMock
from cfg import parse_port

# 用 patch 把 int 替换为会抛错的 mock，验证 parse_port 的错误路径
with patch("builtins.int", side_effect=ValueError("坏输入")):
    try:
        parse_port("80")
    except ValueError as e:
        print("路径命中:", str(e))

m = MagicMock(return_value=42)
print(m("x"), m.called)
```

```text
路径命中: 坏输入
42 True
```

## 覆盖率与 CI

覆盖率不是目标，是线索——没覆盖的分支先问「该不该测」再补。

```bash
python3 -m pip install pytest-cov
pytest --cov=. --cov-report=term-missing   # 列出未覆盖行
```

CI 里跑测试的标准姿势：装依赖 → `pytest -q`，失败即红灯挡合并。Python 版本矩阵用 GitHub Actions 的 `matrix` 覆盖 3.10-3.14。

## 小结

- unittest 零依赖可用；pytest 凭 assert/fixture/parametrize 成为社区标准。
- 一个测试一件事；数据驱动用 parametrize。
- 资源夹具用 fixture（yield 做清理），外部依赖用 mock 隔离。
- 覆盖率看缺口不追数字，CI 必跑 `-q`。
