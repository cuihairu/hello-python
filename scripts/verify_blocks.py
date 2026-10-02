#!/usr/bin/env python3
"""抽取 docs/**/*.md 的 ```python 代码块逐个真实执行，并与其后紧邻的
```text 期望输出块逐字对比（存在才比）。行级状态机解析，不靠正则。

约定：每个 python 块必须可独立运行且 exit 0（有意演示的错误用
try/except 捕获打印）；期望输出写在紧随其后的 ```text 块。
用法: python3 verify_blocks.py [文件...]
"""
import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path('/home/cui/workspaces/hello-python')


def extract(path):
    """返回 [(code, expected_or_None), ...]"""
    lines = path.read_text(encoding='utf-8').splitlines()
    pairs, i = [], 0
    while i < len(lines):
        if lines[i].strip() == '```python':
            code, i = [], i + 1
            while i < len(lines) and lines[i].strip() != '```':
                code.append(lines[i])
                i += 1
            i += 1  # 跳过收尾 ```
            expected = None
            j = i
            while j < len(lines) and not lines[j].strip():
                j += 1  # 允许空行
            if j < len(lines) and lines[j].strip() == '```text':
                text, j = [], j + 1
                while j < len(lines) and lines[j].strip() != '```':
                    text.append(lines[j])
                    j += 1
                expected = '\n'.join(text)
            pairs.append(('\n'.join(code) + '\n', expected))
        else:
            i += 1
    return pairs


def run_block(src, tag):
    with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False,
                                     encoding='utf-8') as f:
        f.write(src)
        tmp = f.name
    env = dict(__import__('os').environ)
    env['PYTHONPATH'] = ':'.join([
        '/tmp/pydeps',  # 隔离安装的 pytest（验证器专用）
        str(ROOT / 'docs' / 'engineering' / '_examples'),
    ])
    try:
        r = subprocess.run([sys.executable, tmp], capture_output=True,
                           text=True, timeout=30, env=env)
        if r.returncode != 0:
            last = r.stderr.strip().splitlines()[-1] if r.stderr else ''
            return None, f'exit {r.returncode}: {last}'
        return r.stdout, None
    except subprocess.TimeoutExpired:
        return None, 'timeout'
    finally:
        pathlib.Path(tmp).unlink(missing_ok=True)


def main():
    files = [pathlib.Path(a).resolve() for a in sys.argv[1:]] or sorted(
        f for f in (ROOT / 'docs').rglob('*.md')
        if not f.relative_to(ROOT).parts[1].rstrip('/').split('-')[0].isdigit())
    total = passed = 0
    failures = []
    for md in files:
        rel = md.relative_to(ROOT)
        for i, (src, expected) in enumerate(extract(md), 1):
            total += 1
            tag = f'{rel}#block{i}'
            out, err = run_block(src, tag)
            if err:
                failures.append((tag, err))
            elif expected is not None and out.rstrip('\n') != expected.rstrip('\n'):
                failures.append((tag, f'输出不符\n  期望: {expected.strip()!r}\n  实际: {out.strip()!r}'))
            else:
                passed += 1
    for tag, msg in failures:
        print(f'FAIL {tag}: {msg}')
    print(f'{passed}/{total} blocks passed in {len(files)} files')
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
