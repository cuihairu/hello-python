[English](README.md) | [中文](README.zh.md)

<div align="center">

<p align="center"><img src="docs/public/logo.svg" width="64" height="64" alt="logo" /> </p>

# Hello Python

<p align="center">
  <img src="docs/public/badges/topic.svg" alt="topic" />
  <img src="docs/public/badges/docs.svg" alt="docs" />
  <img src="docs/public/badges/license.svg" alt="license" />
  <img src="docs/public/badges/langs.svg" alt="langs" />
</p>

Python 开发记录与经验分享 · [在线阅读](https://cuihairu.github.io/hello-python/)

</div>

---

这里记录我在游戏开发中使用 Python 的观察、取舍和踩坑经历。内容按主题整理，方便回看和查找。

主题索引：[核心概念](https://cuihairu.github.io/hello-python/knowledge/core-concepts) · [权威书籍](https://cuihairu.github.io/hello-python/knowledge/books) · [官方文档](https://cuihairu.github.io/hello-python/knowledge/official-docs) · [应用场景](https://cuihairu.github.io/hello-python/knowledge/scenarios) · [常见坑](https://cuihairu.github.io/hello-python/knowledge/pitfalls)

## 本地开发

```bash
npm install          # 安装依赖
npm run docs:dev     # 本地开发
npm run docs:build   # 构建到 docs/.vitepress/dist
npm run docs:preview # 本地预览构建产物
```

## 文档校验

CI 在每次推送和 PR 上跑四道门禁，提交前可在本地先跑：

```bash
python3 scripts/verify_blocks.py   # 校验代码块输出与文档一致
python3 scripts/check_anchors.py    # 校验内部链接与锚点
python3 scripts/check_timeline.py    # 校验时间线数据
python3 scripts/check_links.py      # 校验外链（以 CI 结果为准）
```

构建也必须通过：`npm run docs:build`。

## 目录结构

```text
docs/
├── index.md         # 站点首页与总览
├── basics/          # 环境与语言基础：语法、类型、控制流、函数
├── datastructures/  # 数据结构：列表、字典、字符串、迭代器
├── advanced/        # 语言特性：OOP、魔法方法、装饰器、类型注解
├── concurrency/     # 并发：threading、asyncio、multiprocessing
├── engineering/     # 工程：标准库、测试、日志、打包
├── internals/       # 源码解析：CPython 源码走读（带文件行号引用）
├── knowledge/       # 主题索引：概念、书籍、官方文档、场景与坑
├── glossary.md      # 跨主题术语表
├── timeline.md      # 发展史时间线
├── navigation.md    # 侧栏真源与维护规则
├── public/          # 站点静态资源
└── .vitepress/      # VitePress 配置与主题
```

站点用 VitePress 官方 locales 做双语：英文页在站点根目录，中文页在 `/zh/`。导航以 `docs/.vitepress/sidebar.en.json` 与 `docs/.vitepress/sidebar.zh.json` 两份为真源；修改前请先看[导航维护说明](https://cuihairu.github.io/hello-python/zh/navigation)。

## License

本作品采用 [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) 许可协议发布。
