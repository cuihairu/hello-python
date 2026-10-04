#!/usr/bin/env python3
"""校验 docs/**/*.md 里 `](目标#锚点)` 形式的站内链接锚点是否指向真实标题。

slug 规则对齐 VitePress：小写、空白折成 -、剔除字母数字与「- _」及 CJK 之外的字符。
页面级死链由 vitepress 构建（ignoreDeadLinks: false）把守，这里只管锚点级。
用法: python3 check_anchors.py [文件...]
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / 'docs'


def headings(md):
    """返回该 md 文件全部标题的 slug 集合，跳过代码围栏内的内容。"""
    hs = set()
    in_fence = False
    for line in md.read_text(encoding='utf-8').splitlines():
        s = line.strip()
        if s.startswith('```'):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        m = re.match(r'#{1,6}\s+(.*)', s)
        if not m:
            continue
        kept = [ch for ch in m.group(1).strip().lower()
                if ch.isalnum() or ch in ' -_' or '一' <= ch <= '鿿']
        hs.add(re.sub(r'\s+', '-', ''.join(kept).strip()))
    return hs


def resolve(target):
    """链接目标 → 实际 md 文件；找不到页面返回 None（页面级死链交由构建报）。"""
    rel = target.lstrip('/')
    for cand in (DOCS / rel, DOCS / f'{rel}.md', DOCS / rel / 'index.md'):
        if cand.exists():
            return cand
    return None


def rel(p):
    try:
        return p.relative_to(ROOT)
    except ValueError:
        return p


def main():
    files = [pathlib.Path(a).resolve() for a in sys.argv[1:]] or sorted(
        f for f in DOCS.rglob('*.md')
        if 'dist' not in f.parts and 'cache' not in f.parts
        and not re.search(r'/0[1-6]-', str(f)))
    issues = []
    for f in files:
        text = re.sub(r'```.*?```', '', f.read_text(encoding='utf-8'), flags=re.S)
        for m in re.finditer(r'\]\(([^)#\s]+)?(#[^)\s]+)\)', text):
            target, anchor = m.group(1) or '', m.group(2)[1:]
            if target.startswith(('http://', 'https://', 'mailto:')):
                continue
            md = resolve(target) if target else f
            if md and anchor and anchor not in headings(md):
                issues.append(f'{rel(f)}: #{anchor} -> {rel(md)}')
    for msg in issues:
        print(f'BAD ANCHOR {msg}')
    print(f'{len(files)} files checked, {len(issues)} bad anchors')
    sys.exit(1 if issues else 0)


if __name__ == '__main__':
    main()
