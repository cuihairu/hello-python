# 环境搭建与工具链

工欲善其事，必先利其器。本章把一套顺手的 Python 开发环境搭起来：解释器怎么装、版本怎么选、虚拟环境和 pip 怎么用、编辑器怎么配。

## 安装 Python

Linux 与 macOS 通常自带 python3，但没有虚拟环境能力（Ubuntu 需要单独装 `python3-venv` 包）。推荐做法是用系统的包管理器装一个基础版本，再用 pyenv 管理多版本。

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install python3 python3-venv python3-pip

# macOS（Homebrew）
brew install python

# 验证
python3 --version
```

需要多版本共存时用 [pyenv](https://github.com/pyenv/pyenv)，它把每个版本装到用户目录下，互不干扰：

```bash
curl https://pyenv.run | bash          # 安装 pyenv
pyenv install 3.12                     # 安装指定大版本的最新小版本
pyenv global 3.12                      # 设为全局默认
pyenv local 3.11                       # 当前目录用另一个版本（写入 .python-version）
```

Windows 用户直接从 [python.org](https://www.python.org/downloads/) 下载安装包，安装时勾选 "Add Python to PATH"，并注意命令名是 `py` 或 `python` 而非 `python3`。

## python3 命令行

装好后有三个最常用的入口。`python3` 直接进交互式解释器（REPL），适合验证一行代码的行为；`python3 script.py` 执行脚本；`python3 -m 模块名` 以模块方式运行标准库或已安装的包：

```bash
python3                    # 进入交互式解释器，exit() 退出
python3 hello.py           # 运行脚本
python3 -m json.tool a.json   # 把 json.tool 当命令用：格式化 JSON
python3 -m http.server 8000   # 当前目录起一个静态文件服务器
```

REPL 里两个实用函数要记牢：`help(obj)` 查看对象文档，`dir(obj)` 列出对象的属性和方法。

## pip 与包管理

pip 是包安装器，从 PyPI 拉取第三方包。国内环境慢可以换清华镜像源：

```bash
python3 -m pip install requests            # 安装
python3 -m pip install "requests>=2.31"    # 带版本约束
python3 -m pip install -r requirements.txt # 按清单安装
python3 -m pip list                        # 已安装列表
python3 -m pip show requests               # 查看某个包的元信息
python3 -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
```

始终用 `python3 -m pip` 而不是裸 `pip`：前者保证 pip 操作的就是当前这个解释器，避免「装到了另一个 Python 里」的经典问题。

生成依赖清单用 `pip freeze`，它把当前环境的全部包和精确版本写出来：

```bash
python3 -m pip freeze > requirements.txt
```

## 虚拟环境 venv

不同项目依赖不同版本的同一个包，必须靠虚拟环境隔离。venv 是标准库自带的方案，每个项目建一个：

```bash
python3 -m venv .venv        # 在项目根目录创建虚拟环境
source .venv/bin/activate    # Linux/macOS 激活
.venv\Scripts\activate       # Windows 激活
pip install requests         # 装进 .venv，不污染系统
deactivate                   # 退出虚拟环境
```

激活后提示符会出现 `(.venv)` 前缀，此时 `python`、`pip` 都指向虚拟环境内的副本。`.venv/` 目录不应提交到版本库（本仓库的 `.gitignore` 已忽略）。

::: tip 环境管理工具的演进
传统三件套是 venv + pip + requirements.txt。社区还有更现代的统一工具：[uv](https://github.com/astral-sh/uv)（Rust 编写，极快，兼容 pip 工作流）、[Poetry](https://python-poetry.org/)（依赖解析 + 打包一体）、[PDM](https://pdm-project.org/)（遵循 PEP 582/621）。初学先用 venv + pip 打好底，理解了再上工具。
:::

## 编辑器与调试

两个主流选择：

- **VS Code**：装官方 Python 扩展（Pylance 提供语言服务），轻量、启动快，配置即开即用。
- **PyCharm**：Community 版免费，重构、调试、测试集成开箱即得，适合大型项目。

无论用哪个，把格式化工具和 linter 配进保存动作：`ruff` 一个工具同时承担检查与格式化（替代 flake8 + isort + black），装好后 VS Code 保存即自动修格式。

```bash
python3 -m pip install ruff
ruff check .        # 静态检查
ruff format .       # 格式化
```

## 小结

- pyenv 管多版本，venv 管项目隔离，pip 管包安装，三层各司其职。
- 用 `python3 -m pip` 与 `python3 -m venv`，让命令永远绑定当前解释器。
- 依赖清单 requirements.txt 随代码一起提交，别人才能复现你的环境。
