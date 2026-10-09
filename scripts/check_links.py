#!/usr/bin/env python3
"""External link check for docs/.

Extracts external URLs from markdown files and HEAD-checks them.

Exit code 1 only when a link is definitively dead (404/410 on both HEAD and
GET). 403/429/5xx and connection errors are reported as warnings: bot blocks
and local network restrictions are not evidence of rot, and CI runners are
the enforcement point.
"""

import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "docs"
TIMEOUT = 10
WORKERS = 8

INLINE = re.compile(r"\[[^\]]*\]\((https?://[^)\s]+)\)")
AUTOLINK = re.compile(r"<(https?://[^>\s]+)>")
REFDEF = re.compile(r"^\s{0,3}\[[^\]]*\]:\s*(https?://\S+)", re.MULTILINE)
FENCE = re.compile(r"```.*?```", re.DOTALL)


def extract_urls(text: str) -> set[str]:
    text = FENCE.sub("", text)
    urls = set(INLINE.findall(text)) | set(AUTOLINK.findall(text)) | set(REFDEF.findall(text))
    return {u.rstrip(").,;") for u in urls}


def check(url: str) -> tuple[str, str]:
    """Return (url, status) where status is ok/dead/warn."""
    for method in ("HEAD", "GET"):
        req = urllib.request.Request(url, method=method, headers={"User-Agent": "hello-python-link-check/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                return url, "ok" if resp.status < 400 else "warn"
        except urllib.error.HTTPError as e:
            if e.code in (404, 410) and method == "GET":
                return url, "dead"
            if e.code in (404, 410, 405, 501):
                continue  # HEAD not supported, retry with GET
            return url, "warn"  # 403/429/5xx: blocked or unstable, not rot
        except Exception:
            if method == "GET":
                return url, "warn"  # connection error: unreachable from here
    return url, "warn"


def main() -> int:
    urls: set[str] = set()
    for md in DOCS.rglob("*.md"):
        if ".vitepress" in md.parts or "public" in md.parts:
            continue
        urls |= extract_urls(md.read_text(encoding="utf-8"))

    print(f"checking {len(urls)} external links")
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        results = list(pool.map(check, sorted(urls)))

    dead = [u for u, s in results if s == "dead"]
    warn = [u for u, s in results if s == "warn"]
    for u in warn:
        print(f"  WARN (unreachable/blocked, not counted as rot): {u}")
    for u in dead:
        print(f"  DEAD: {u}")

    print(f"ok={len(results) - len(dead) - len(warn)} warn={len(warn)} dead={len(dead)}")
    return 1 if dead else 0


if __name__ == "__main__":
    sys.exit(main())
