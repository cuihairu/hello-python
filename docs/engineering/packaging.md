---
description: Every pyproject.toml field explained, building sdist and wheel, versioning strategy, and publishing to PyPI.
---

# Packaging and publishing

Code that's worth anything has to reach other people: internal sharing goes through a private index, open source goes to PyPI. Modern Python packaging revolves entirely around pyproject.toml (PEP 517/621), with `build` for building and `twine` for uploading.

## Project layout

The recommended layout is src — the package lives under src/, so tests can only import the *installed* package, which rules out lucky passes against the local directory:

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

## pyproject.toml, field by field

```toml
[project]
name = "hello-pkg"                    # Name on PyPI, unique site-wide
version = "0.1.0"
description = "Example package: demonstrating modern Python packaging"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
authors = [{name = "cuihairu"}]
dependencies = [                       # Runtime dependencies, with version constraints
    "rich>=13",
]

[project.optional-dependencies]        # extras: pip install hello-pkg[dev]
dev = ["pytest>=8", "ruff>=0.6"]

[project.scripts]                      # Command-line entry points created on install
hello-pkg = "hello_pkg.core:main"

[build-system]                         # Build backend, produces the wheel/sdist
requires = ["setuptools>=75"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["src"]
```

Version numbers follow semver: a breaking change bumps the major, a new feature bumps the minor, a fix bumps the patch. Deriving the version from git tags with `setuptools-scm` before release is another common practice.

## Building: sdist and wheel

```bash
python3 -m pip install build
python3 -m build
# Artifacts: dist/hello_pkg-0.1.0.tar.gz (source package) + dist/hello_pkg-0.1.0-py3-none-any.whl
```

| Artifact | Contents | Notes |
| --- | --- | --- |
| sdist (.tar.gz) | Source | The fallback format, built on the fly at install time |
| wheel (.whl) | Pre-built | Fast install, no build step, preferred for distribution |

Verify the artifacts' integrity: `twine check dist/*` checks the metadata and the README rendering.

## Version and dependency declaration in practice

Constrain dependencies with ranges instead of pinning, leaving downstream room to resolve conflicts:

```python
# 语义示例（pyproject.toml 的 dependencies 数组）
# "requests>=2.31,<3"    下界 + 大版本上界：最常用
# "rich~=13.5"           兼容版本：>=13.5, <14
# "urllib3"              无约束：仅用于确知稳定的传递依赖
```

## Publishing to PyPI

PyPI now supports Trusted Publishing: CI uploads token-free via OIDC, while local uploads use an API token. The standard flow:

```bash
# The local route
python3 -m pip install twine
python3 -m twine upload dist/*

# Rehearse on the test index first (the TestPyPI instance)
python3 -m twine upload --repository testpypi dist/*
```

A skeleton for automated publishing on GitHub Actions (with Trusted Publishing, triggered by pushing a tag):

```yaml
name: Publish
on:
  push:
    tags: ["v*"]
jobs:
  pypi-publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write          # Required for Trusted Publishing
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

::: warning Publishing is irreversible
A filename claimed on PyPI is claimed forever: the same version number can never be uploaded again, and deleting the version does not release the filename. Rehearse on TestPyPI first; when in doubt, let the version number lag rather than run ahead.
:::

## Private distribution

Sharing inside a team doesn't require PyPI: a private index (devpi, Artifactory, cloud-vendor offerings) or installing straight from git:

```bash
python3 -m pip install git+https://github.com/cuihairu/hello-python.git
python3 -m pip install "hello-pkg @ git+https://github.com/cuihairu/hello-python.git@v0.1.0"
```

## Executable distribution

Single-file programs for users who don't have Python:

- `pipx`: installs CLI tools into isolated environments; the recommended way to consume command-line tools.
- `PyInstaller` / `shiv` / `pex`: bundle into self-contained executables or a zipapp.

## Summary

- Metadata goes into pyproject.toml, build with `python -m build`, artifacts are sdist + wheel.
- Write dependency constraints as ranges; entry-point commands go under `[project.scripts]`.
- Publish with twine + Trusted Publishing; rehearse on TestPyPI first, and never reuse a version number.
- For internal sharing, use a private index or install straight from git.

## References

- [Python Packaging User Guide](https://packaging.python.org/en/latest/)
- [PEP 517 · Build backend interface](https://peps.python.org/pep-0517/)
- [PEP 518 · pyproject.toml](https://peps.python.org/pep-0518/)
- [PEP 621 · Project metadata](https://peps.python.org/pep-0621/)

<!-- BACKLINKS-AUTO -->
## Related pages

- [glossary](/glossary.md)
- [books](/knowledge/books.md)
- [core-concepts](/knowledge/core-concepts.md)
- [official-docs](/knowledge/official-docs.md)
- [pitfalls](/knowledge/pitfalls.md)
- [scenarios](/knowledge/scenarios.md)
