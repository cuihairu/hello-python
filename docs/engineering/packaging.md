---
description: pyproject.toml 字段全解，sdist 与 wheel 构建、版本策略、发布到 PyPI。
---

# 打包与发布

写好的代码要让别人用得上：内部共享走私有索引，开源发布到 PyPI。现代 Python 打包全部围绕 pyproject.toml（PEP 517/621），构建用 `build`，上传用 `twine`。

## 项目布局

推荐 src 布局——包放 src/ 下，测试只能导入「安装后的包」，杜绝本地目录侥幸通过：

```text
hello-pkg/
├── pyproject.toml
├── README.md
├── src/
│   └── hello_pkg/
│       ├── __init__.py
│       └── core.py
└── tests/
    └── test_core.py
```

## pyproject.toml 全解

```toml
[project]
name = "hello-pkg"                    # PyPI 上的名字，全站唯一
version = "0.1.0"
description = "示例包：演示现代 Python 打包"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
authors = [{name = "cuihairu"}]
dependencies = [                       # 运行时依赖，带版本约束
    "rich>=13",
]

[project.optional-dependencies]        # extras：pip install hello-pkg[dev]
dev = ["pytest>=8", "ruff>=0.6"]

[project.scripts]                      # 安装后生成的命令行入口
hello-pkg = "hello_pkg.core:main"

[build-system]                         # 构建后端，负责生成 wheel/sdist
requires = ["setuptools>=75"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["src"]
```

版本号遵循语义化（semver）：破坏性变更升主版本，新功能升次版本，修复升修订号。发布前用 `setuptools-scm` 从 git tag 派生版本也是常见做法。

## 构建：sdist 与 wheel

```bash
python3 -m pip install build
python3 -m build
# 产物：dist/hello_pkg-0.1.0.tar.gz（源码包）+ dist/hello_pkg-0.1.0-py3-none-any.whl
```

| 产物 | 内容 | 说明 |
| --- | --- | --- |
| sdist（.tar.gz） | 源码 | 兜底格式，安装时现场构建 |
| wheel（.whl） | 预构建 | 安装快、不执行构建，优先分发 |

验证产物完整性：`twine check dist/*` 检查元数据与 README 渲染。

## 版本与依赖声明实践

依赖约束用范围而不是钉死，给下游留解决冲突的空间：

```python
# 语义示例（pyproject.toml 的 dependencies 数组）
# "requests>=2.31,<3"    下界 + 大版本上界：最常用
# "rich~=13.5"           兼容版本：>=13.5, <14
# "urllib3"              无约束：仅用于确知稳定的传递依赖
```

## 发布到 PyPI

PyPI 已启用可信发布（Trusted Publishing）：CI 里用 OIDC 免 token 上传，本地上传则用 API token。标准流程：

```bash
# 本地方式
python3 -m pip install twine
python3 -m twine upload dist/*

# 测试索引先走一遍（pyPI test 实例）
python3 -m twine upload --repository testpypi dist/*
```

GitHub Actions 自动发布的骨架（含可信发布，push tag 触发）：

```yaml
name: Publish
on:
  push:
    tags: ["v*"]
jobs:
  pypi-publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write          # Trusted Publishing 必需
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
      - uses: actions/setup-python@v6
        with:
          python-version: "3.12"
      - run: python -m pip install build
      - run: python -m build
      - uses: pypa/gh-action-pypi-publish@release/v1
```

::: warning 发布不可撤回
PyPI 上传的文件名占用永久生效：同一版本号不能重复上传，删版本也释放不了文件名。发布前在 TestPyPI 演练；版本号宁可靠后不可超前。
:::

## 私有分发

团队内部共享不必上 PyPI：私有索引（devpi、Artifactory、云厂商方案）或 git 直装：

```bash
python3 -m pip install git+https://github.com/cuihairu/hello-python.git
python3 -m pip install "hello-pkg @ git+https://github.com/cuihairu/hello-python.git@v0.1.0"
```

## 可执行分发

给非 Python 用户的单文件程序：

- `pipx`：安装 CLI 工具到独立环境，是分发命令行工具的推荐消费方式。
- `PyInstaller` / `shiv` / `pex`：打成自包含可执行文件或 zipapp。

## 小结

- 元数据进 pyproject.toml，构建用 `python -m build`，产物 sdist + wheel。
- 依赖约束写范围；入口命令用 `[project.scripts]`。
- 发布用 twine + 可信发布；先 TestPyPI 演练，版本号不可复用。
- 内部共享用私有索引或 git 直装。
