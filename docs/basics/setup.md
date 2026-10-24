---
description: Interpreter installation, version management, venv virtual environments and pip dependencies, plus editor and formatter configuration.
---

# Environment setup and toolchain

My usual Python development setup covers the interpreter, version management, virtual environments, pip and editor configuration; this page records the choices and how each is set up.

## Installing Python

Linux and macOS usually ship with python3, but without virtual environment support (on Ubuntu you need the `python3-venv` package separately). The recommended approach is to install a base version with the system package manager, then manage multiple versions with pyenv.

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install python3 python3-venv python3-pip

# macOS (Homebrew)
brew install python

# verify
python3 --version
```

When you need several versions to coexist, use [pyenv](https://github.com/pyenv/pyenv). It installs every version under your user directory, so they don't interfere with each other:

```bash
curl https://pyenv.run | bash          # install pyenv
pyenv install 3.12                     # install the latest minor of a given major version
pyenv global 3.12                      # set as the global default
pyenv local 3.11                       # use another version in the current directory (writes .python-version)
```

Windows users download the installer straight from [python.org](https://www.python.org/downloads/), tick "Add Python to PATH" during installation, and note that the command is `py` or `python` rather than `python3`.

## The python3 command line

After installing there are three entry points you'll use most. `python3` drops straight into the interactive interpreter (REPL), good for checking the behaviour of a one-liner; `python3 script.py` runs a script; `python3 -m module` runs a standard-library or installed package as a module:

```bash
python3                    # enter the interactive interpreter; exit() to leave
python3 hello.py           # run a script
python3 -m json.tool a.json   # use json.tool as a command: pretty-print JSON
python3 -m http.server 8000   # serve the current directory as a static file server
```

Two REPL functions worth memorising: `help(obj)` shows an object's documentation, `dir(obj)` lists an object's attributes and methods.

## pip and package management

pip is the package installer, pulling third-party packages from PyPI. If PyPI is slow on your network you can switch to the Tsinghua mirror:

```bash
python3 -m pip install requests            # install
python3 -m pip install "requests>=2.31"    # with a version constraint
python3 -m pip install -r requirements.txt # install from a requirements file
python3 -m pip list                        # list installed packages
python3 -m pip show requests               # show metadata for one package
python3 -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
```

Always use `python3 -m pip` rather than a bare `pip`: the former guarantees pip acts on the interpreter that's currently running, avoiding the classic "installed it into the other Python" problem.

`pip freeze` generates the dependency list, writing out every package in the current environment with its exact version:

```bash
python3 -m pip freeze > requirements.txt
```

## Virtual environments with venv

Different projects depend on different versions of the same package, so isolation has to come from virtual environments. venv is the solution that ships with the standard library; create one per project:

```bash
python3 -m venv .venv        # create a virtual environment in the project root
source .venv/bin/activate    # activate on Linux/macOS
.venv\Scripts\activate       # activate on Windows
pip install requests         # installs into .venv, doesn't pollute the system
deactivate                   # leave the virtual environment
```

Once activated the prompt gains a `(.venv)` prefix, and both `python` and `pip` now point at the copies inside the virtual environment. Don't commit the `.venv/` directory to version control (this repository's `.gitignore` already ignores it).

::: tip The evolution of environment tooling
The traditional trio is venv + pip + requirements.txt. The community also has more modern unified tools: [uv](https://github.com/astral-sh/uv) (written in Rust, compatible with the pip workflow), [Poetry](https://python-poetry.org/) (dependency resolution and packaging in one tool), [PDM](https://pdm-project.org/) (follows PEP 582/621). I usually start with venv + pip and only evaluate a unified tool when a project needs one.
:::

## Editor and debugging

Two mainstream choices: VS Code with the official Python extension (Pylance provides the language service) — lightweight, starts fast, ready to use straight after configuration; the free Community edition of PyCharm — refactoring, debugging and test integration work out of the box, which suits larger projects.

Whichever you use, wire the formatter and linter into the save action: `ruff` does both checking and formatting in a single tool (replacing flake8 + isort + black), and once installed VS Code auto-formats on save.

```bash
python3 -m pip install ruff
ruff check .        # static check
ruff format .       # format
```

## Summary

- pyenv manages multiple versions, venv manages project isolation, pip manages package installation — three layers, each doing its own job.
- Use `python3 -m pip` and `python3 -m venv` so the command always binds to the current interpreter.
- Commit the dependency list requirements.txt alongside the code, or nobody else can reproduce your environment.

## Further reading

- [Python official documentation · venv virtual environment tutorial](https://docs.python.org/3/tutorial/venv.html)
- [Python official documentation · Command line and environment](https://docs.python.org/3/using/cmdline.html)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/knowledge/books.md)
- [core-concepts](/knowledge/core-concepts.md)
- [official-docs](/knowledge/official-docs.md)
