#!/usr/bin/env python3
"""校验时间线数据 docs/.vitepress/theme/data/timeline.ts 的一致性（双语各一遍）。

英文数据是 TIMELINE/ERAS/FIELD_LABELS（根目录站），中文是 *_ZH（/zh/ 站）。
检查项：字段完整与合法（field ∈ FIELD_LABELS、month ∈ 1..12、无拼错键）、
事件按 (year, month) 升序、分期 ERAS 连续无缺口无重叠且覆盖每条事件、
每个分期非空、每个 field 至少用一次、(year, month, title) 不重复、
link 指向的站内页面存在（en 相对 docs/，zh 相对 docs/zh/）。
另校验两份数据逐条对齐（同 year/month/field/link 路径），防止单侧漏改。
用法: python3 check_timeline.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs/.vitepress/theme/data/timeline.ts'

# (locale 名, 事件/分期/标签的 const 名, link 解析的文档根)
LOCALES = [
    ('en', 'TIMELINE', 'ERAS', 'FIELD_LABELS', ROOT / 'docs'),
    ('zh', 'TIMELINE_ZH', 'ERAS_ZH', 'FIELD_LABELS_ZH', ROOT / 'docs/zh'),
]

EVENT_KEYS = {'year', 'month', 'title', 'who', 'field', 'why', 'link'}
EVENT_REQUIRED = {'year', 'title', 'who', 'field', 'why'}  # month/link 可选
ERA_KEYS = {'name', 'from', 'to', 'intro'}


def block(text, decl):
    """定位 `const <decl> ... = [` / `{`，返回括号内的原文（含字符串感知的配平扫描）。

    必须锚在 const 上：文件头部注释会提到这些标识符，裸匹配会命中注释。"""
    m = re.search(r'const\s+' + decl, text)
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


def resolve(link, docroot):
    """站内 link → 实际 md 文件；找不到返回 None。

    docroot 已是该 locale 的文档根（en 为 docs/，zh 为 docs/zh/），
    zh 数据里的 link 带 /zh/ 前缀，解析前要先剥掉，否则拼成 docs/zh/zh/...。"""
    rel = re.sub(r'^zh/', '', link.lstrip('/').split('#', 1)[0])
    for cand in (docroot / rel, docroot / f'{rel}.md', docroot / rel / 'index.md'):
        if cand.exists():
            return cand
    return None


def validate(locale, docroot, fields, eras, events):
    """跑一遍全套结构校验，返回该 locale 的问题列表。"""
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
        where = f'{locale}#{n} {ev.get("title", "?")}'
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
        if 'link' in ev and resolve(ev['link'], docroot) is None:
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
    return issues


def main():
    text = SRC.read_text(encoding='utf-8')
    issues = []
    per_locale = {}

    for locale, ev_decl, era_decl, label_decl, docroot in LOCALES:
        fields = set(parse_object(block(text, rf'{label_decl}\b')))
        eras = [parse_object(e) for e in split_entries(block(text, rf'{era_decl}\b'))]
        events = [parse_object(e) for e in split_entries(block(text, rf'{ev_decl}\b'))]
        per_locale[locale] = (fields, eras, events)
        issues += validate(locale, docroot, fields, eras, events)

    # 双语对齐：条目数、逐条的 year/month/field/link 路径必须一致（文案允许不同）
    en_f, en_e, en_v = per_locale['en']
    zh_f, zh_e, zh_v = per_locale['zh']
    if set(en_f) != set(zh_f):
        issues.append(f'双语 field 集合不一致: en {sorted(en_f)} vs zh {sorted(zh_f)}')
    if len(en_e) != len(zh_e):
        issues.append(f'双语 era 数不一致: en {len(en_e)} vs zh {len(zh_e)}')
    else:
        for k, (a, b) in enumerate(zip(en_e, zh_e)):
            if (a['from'], a['to']) != (b['from'], b['to']):
                issues.append(f'era#{k} 双语区间不一致: en {a["from"]}-{a["to"]} vs zh {b["from"]}-{b["to"]}')
    if len(en_v) != len(zh_v):
        issues.append(f'双语事件数不一致: en {len(en_v)} vs zh {len(zh_v)}')
    else:
        for n, (a, b) in enumerate(zip(en_v, zh_v), 1):
            for key in ('year', 'month', 'field'):
                if a.get(key) != b.get(key):
                    issues.append(f'事件#{n} 双语 {key} 不一致: en {a.get(key)!r} vs zh {b.get(key)!r}')
            la, lb = a.get('link'), b.get('link')
            if (la is None) != (lb is None) or (la and la.lstrip('/').removeprefix('zh/') != lb.lstrip('/').removeprefix('zh/')):
                issues.append(f'事件#{n} 双语 link 不一致: en {la!r} vs zh {lb!r}')

    for msg in issues:
        print(f'BAD TIMELINE {msg}')
    print(f'en {len(en_v)} events/{len(en_e)} eras, zh {len(zh_v)} events/{len(zh_e)} eras, {len(issues)} issues')
    sys.exit(1 if issues else 0)


if __name__ == '__main__':
    try:
        main()
    except ValueError as e:
        print(f'PARSE ERROR {SRC.name}: {e}')
        sys.exit(1)
