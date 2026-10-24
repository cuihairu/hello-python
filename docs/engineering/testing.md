---
description: unittest vs pytest side by side, the four kinds of test double, and where coverage fits into CI.
---

# Testing: unittest and pytest

Tests are what let you refactor without fear. unittest is the stdlib's xUnit-style framework; pytest is the de facto community standard: an assertion is a single `assert parse_port("80") == 80` line, with no need to remember method names like `assertEqual`; fixtures are reclaimed automatically when a case finishes (the code after `yield` does the cleanup), so you never hand-write paired setUp and tearDown. Either one tests fine; for a new project, go straight to pytest.

## A module under test

The example module that runs through this page (validating port configuration):

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

Inside a subclass of `unittest.TestCase`, use the `assert*` family of assertions; `setUp` runs before every case (build shared fixtures):

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

pytest runs unittest cases directly; both workflows are fine day to day:

## pytest: less boilerplate

pytest requires no inheritance; plain functions plus `assert` are enough; exceptions use the `pytest.raises` context:

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

Fixtures are pytest's resource-supply mechanism: an `@pytest.fixture` function produces data, a test function requests it by parameter name, and the scope is configurable (function/class/module/session):

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

## Test organization and naming

- File names `test_*.py` or `*_test.py`, functions `test_<behavior>`, classes `Test<unit>`.
- One test asserts one thing; a bad test is worse than no test.
- Unroll a behavior table with `@pytest.mark.parametrize` instead of writing a loop.

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

## Running and selecting

```bash
pytest                       # discover and run in the current directory
pytest test_cfg.py -v        # verbose output
pytest -k "port or valid"    # select by name
pytest -x                    # stop at the first failure
pytest --tb=short            # trimmed traceback
pytest -q                    # quiet mode, common in CI
```

```text
collected 3 items
test_fixture.py ..                                                     [ 66%]
test_fixture.py .                                                      [100%]
3 passed in 0.0x
```

## Test doubles

Doubles come in four kinds, and they all aim at isolation: a **stub** returns a fixed value, a **spy** records calls, a **mock** asserts on call behavior, and a **fake** is a lightweight real stand-in (an in-memory database). The stdlib `unittest.mock` provides patch:

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

## Coverage and CI

Coverage is only a clue: for an uncovered branch, ask first whether it should be tested at all, then fill in the ones that should.

```bash
python3 -m pip install pytest-cov
pytest --cov=. --cov-report=term-missing   # list uncovered lines
```

The standard way to run tests in CI: install dependencies, then `pytest -q`, where a failure turns the light red and blocks the merge. A Python version matrix uses GitHub Actions' `matrix` to cover 3.10-3.14.

## Summary

- unittest works with zero dependencies; pytest became the community standard on the strength of assert/fixture/parametrize.
- One thing per test; data-driven cases use parametrize.
- Resource fixtures use fixture (yield for cleanup); isolate external dependencies with mocks.
- Coverage: watch the gaps, not the number; CI always runs `-q`.

## References

- [pytest official documentation](https://docs.pytest.org/en/stable/)
- [Python official documentation · unittest](https://docs.python.org/3/library/unittest.html)
- [Python official documentation · unittest.mock](https://docs.python.org/3/library/unittest.mock.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/zh/knowledge/books)
- [core-concepts](/zh/knowledge/core-concepts)
- [official-docs](/zh/knowledge/official-docs)
- [scenarios](/zh/knowledge/scenarios)
