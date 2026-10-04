---
description: venv 隔离、pyproject.toml 声明依赖、锁文件与 uv/Poetry 的取舍。
---

# 虚拟环境与依赖管理

依赖管理的目标只有一个：让「我机器上能跑」变成「任何人任何机器都能跑」。工具是 venv + pip + 锁定文件这三件套，配合现代工具 uv/Poetry 提效。

## venv 隔离

每个项目一个虚拟环境，互不污染（详见环境搭建一章的创建与激活）。这里关注与依赖管理直接相关的两个事实：

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install requests
python3 -m pip list
```

```text
Package    Version
---------- -------
requests   2.x.x
```

- `.venv/` 是普通目录，删掉即重置；`python3 -m venv .venv` 重建。
- venv 不该进版本库（.gitignore 已忽略），可复现性靠下面的锁定文件。

## requirements.txt：锁定依赖

两种文件分工不同：直接依赖清单（手写、带宽松约束）与全量锁定（`pip freeze` 生成、精确版本）。项目通常两者都要：

```bash
python3 -m pip freeze > requirements.lock   # 全量精确锁定（含传递依赖）
```

手写的直接依赖建议写版本下界与上界，避免大版本意外升级：

```text
# requirements.txt（直接依赖）
requests>=2.31,<3
rich>=13
```

安装与校验：

```bash
python3 -m pip install -r requirements.txt
python3 -m pip check        # 检查依赖冲突
python3 -m pip list --outdated   # 看哪些包可升级
```

::: tip 为什么 pip freeze 不够好
freeze 锁死全部传递依赖，跨平台时平台相关的包会互相污染；升级一个包要整文件重锁。现代方案：`uv pip compile`（从 pyproject.toml 生成锁文件，区分直接/传递依赖）或 Poetry 的 `poetry.lock`（带哈希校验）。
:::

## pyproject.toml：项目的单一事实源

PEP 621 标准化了项目元数据：依赖、版本、构建后端全在一个文件里。pip 19+ 可直接从 pyproject.toml 安装：

```toml
# pyproject.toml
[project]
name = "hello-python-demo"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.31,<3",
]

[project.optional-dependencies]
dev = ["pytest>=8", "ruff>=0.6"]

[build-system]
requires = ["setuptools>=75"]
build-backend = "setuptools.build_meta"
```

```bash
python3 -m pip install -e ".[dev]"   # 可编辑安装 + 开发依赖
```

## uv / Poetry / PDM

| 工具 | 定位 | 一句话 |
| --- | --- | --- |
| `uv` | Rust 实现，兼容 pip 生态 | 快 10-100 倍，新项目首选 |
| `Poetry` | 依赖 + 打包一体 | 锁文件体验成熟，配置自成体系 |
| `PDM` | PEP 582/621 先锋 | 不依赖虚拟环境的可选方案 |
| `pip-tools` | pip 生态补丁 | requirements.in → 锁定.txt |

uv 的典型工作流（速度是它最大的说服力）：

```bash
uv venv                 # 建虚拟环境
uv pip install -r requirements.txt
uv add requests         # 或项目模式：uv init && uv add requests
uv lock                 # 生成 uv.lock，跨机器可复现
```

## 多版本 Python

- `pyenv`：用户级多版本，`pyenv local 3.12` 写 .python-version。
- 官方安装包/Docker：CI 与生产用镜像钉版本（`python:3.12-slim`）。
- 虚拟环境绑定创建它的解释器，换版本要重建。

## 常见事故清单

- 全局 pip 装包 → 系统工具依赖被升级搞坏（Linux 发行版尤其敏感，PEP 668 已默认禁止，需要 `--break-system-packages` 才能越过——别越过，用 venv）。
- requirements.txt 只写不锁 → 「上周还好好的」式漂移。
- .venv 提交进仓库 → 体积爆炸 + 平台二进制不兼容。
- 锁文件与 pyproject.toml 不同步 → CI 装出来的依赖和本地不一致。

## 小结

- venv 隔离环境，pyproject.toml 声明直接依赖，锁文件固定全量版本。
- `python3 -m pip` 指向当前解释器的 pip。
- 追效率用 uv，要成熟锁体验用 Poetry；pip freeze 是底线而非终点。
- 事故九成来自「不隔离」与「不锁版本」。
