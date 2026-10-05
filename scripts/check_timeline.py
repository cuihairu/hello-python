#!/usr/bin/env python3
"""校验时间线数据 docs/.vitepress/theme/data/timeline.ts 的一致性。

检查项：字段完整与合法（field ∈ FIELD_LABELS、month ∈ 1..12、无拼错键）、
事件按 (year, month) 升序、分期 ERAS 连续无缺口无重叠且覆盖每条事件、
每个分期非空、每个 field 至少用一次、(year, month, title) 不重复、
link 指向的站内页面存在。用法: python3 check_timeline.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs/.vitepress/theme/data/timeline.ts'

EVENT_KEYS = {'year', 'month', 'title', 'who', 'field', 'why', 'link'}
EVENT_REQUIRED = {'year', 'title', 'who', 'field', 'why'}  # month/link 可选
ERA_KEYS = {'name', 'from', 'to', 'intro'}


def block(text, decl):
    """定位 `const <decl> ... = [` / `{`，返回括号内的原文（含字符串感知的配平扫描）。"""
    m = re.search(decl, text)
    if not m:
        raise ValueError(f'declaration not found: {decl}')
    i = text.index('=', m.end()) + 1
    while text[i].isspace():
        i += 1
    open_ch = text[i]
    close_ch = ']' if open_ch == '[' else '}'
    depth, quote, esc = 0, None, False
    for j in range(i, len(text)):
        c = text[j]
        if quote:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == quote:
                quote = None
        elif c in '\'"':
            quote = c
        elif c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                return text[i:j]
    raise ValueError(f'unbalanced block: {decl}')


def split_entries(inner):
    """把 `[ {...}, {...} ]` 的内容切成逐个对象的原文。"""
    entries, depth, quote, esc, start = [], 0, None, False, None
    for j, c in enumerate(inner):
        if quote:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == quote:
                quote = None
            continue
        if c in '\'"':
            quote = c
        elif c == '{':
            if depth == 0:
                start = j
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                entries.append(inner[start:j + 1])
    return entries


def read_value(s, i):
    """从 s[i] 起读一个值（带引号字符串 / 整数），返回 (值, 下一位置)。"""
    while i < len(s) and s[i].isspace():
        i += 1
    if s[i] in '\'"':
        q, out, j = s[i], [], i + 1
        while j < len(s):
            c = s[j]
            if c == '\\':
                out.append(s[j + 1])
                j += 2
                continue
            if c == q:
                return ''.join(out), j + 1
            out.append(c)
            j += 1
        raise ValueError(f'unclosed string: {s[i:i + 40]!r}')
    m = re.match(r'-?\d+', s[i:])
    if not m:
        raise ValueError(f'bad value at: {s[i:i + 40]!r}')
    return int(m.group()), i + len(m.group())


def parse_object(entry):
    """顺序解析 `{ key: value, ... }`：只认标识符键，字符串感知，不在值内误配键。"""
    obj, i = {}, entry.index('{') + 1
    while i < len(entry):
        while i < len(entry) and entry[i] in ' \t\r\n,':
            i += 1
        if i >= len(entry) or entry[i] == '}':
            break
        m = re.match(r'[A-Za-z_]\w*', entry[i:])
        if not m:
            raise ValueError(f'bad key at: {entry[i:i + 40]!r}')
        key = m.group()
        i += len(key)
        while i < len(entry) and entry[i].isspace():
            i += 1
        if entry[i] != ':':
            raise ValueError(f'expected ":" after {key}')
        obj[key], i = read_value(entry, i + 1)
    return obj


def resolve(link):
    """站内 link → 实际 md 文件；找不到返回 None。"""
    rel = link.lstrip('/').split('#', 1)[0]
    for cand in (ROOT / 'docs' / rel, ROOT / 'docs' / f'{rel}.md',
                 ROOT / 'docs' / rel / 'index.md'):
        if cand.exists():
            return cand
    return None


def main():
    text = SRC.read_text(encoding='utf-8')
    fields = set(parse_object(block(text, r'FIELD_LABELS')))
    eras = [parse_object(e) for e in split_entries(block(text, r'\bERAS'))]
    events = [parse_object(e) for e in split_entries(block(text, r'\bTIMELINE'))]
    issues = []

    # 分期：有序、无缺口无重叠、每期至少一条事件
    for k, er in enumerate(eras):
        if not ERA_KEYS <= set(er):
            issues.append(f"era 键缺失/多余: {er.get('name')} -> {set(er) ^ ERA_KEYS}")
        if er['from'] > er['to']:
            issues.append(f"era 倒置: {er['name']} {er['from']}>{er['to']}")
        if k and er['from'] != eras[k - 1]['to'] + 1:
            issues.append(f"era 断层/重叠: {eras[k - 1]['name']}-> {er['name']}")
    era_of = {yr: er for er in eras for yr in range(er['from'], er['to'] + 1)}

    used, seen, last = set(), set(), None
    for n, ev in enumerate(events, 1):
        where = f'{SRC.name}#{n} {ev.get("title", "?")}'
        missing, extra = EVENT_REQUIRED - set(ev), set(ev) - EVENT_KEYS
        if missing or extra:
            issues.append(f'{where}: 键缺失 {sorted(missing)} 多余 {sorted(extra)}')
        if not isinstance(ev.get('year'), int) or not 1900 <= ev['year'] <= 2100:
            issues.append(f'{where}: year 非法 {ev.get("year")!r}')
            continue
        if 'month' in ev and not 1 <= ev['month'] <= 12:
            issues.append(f'{where}: month 非法 {ev["month"]!r}')
        if ev.get('field') not in fields:
            issues.append(f'{where}: field 非法 {ev.get("field")!r}')
        else:
            used.add(ev['field'])
        for key in ('title', 'who', 'why'):
            if not isinstance(ev.get(key), str) or not ev[key].strip():
                issues.append(f'{where}: {key} 空缺')
        if ev['year'] not in era_of:
            issues.append(f'{where}: {ev["year"]} 不在任何 era 区间')
        if 'link' in ev and resolve(ev['link']) is None:
            issues.append(f'{where}: link 无对应页面 {ev["link"]}')
        key = (ev['year'], ev.get('month', 0), ev.get('title', ''))
        if key in seen:
            issues.append(f'{where}: 重复事件 {key}')
        seen.add(key)
        cur = (ev['year'], ev.get('month', 0))
        if last and cur < last:
            issues.append(f'{where}: 乱序 {cur} < {last}')
        last = cur

    for f in fields - used:
        issues.append(f'field 未使用: {f}（或 FIELD_LABELS 拼错）')
    for er in eras:
        if not any(er['from'] <= e['year'] <= er['to'] for e in events):
            issues.append(f'era 空置: {er["name"]}')

    for msg in issues:
        print(f'BAD TIMELINE {msg}')
    print(f'{len(events)} events, {len(eras)} eras, {len(issues)} issues')
    sys.exit(1 if issues else 0)


if __name__ == '__main__':
    try:
        main()
    except ValueError as e:
        print(f'PARSE ERROR {SRC.name}: {e}')
        sys.exit(1)
