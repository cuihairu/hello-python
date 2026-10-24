---
description: 站点导航的唯一维护入口与双语侧栏更新规则。
---

# 导航维护说明

每个语言各有一份侧栏，两份合起来是导航的唯一真源：

- [`docs/.vitepress/sidebar.en.json`](https://github.com/cuihairu/hello-python/blob/main/docs/.vitepress/sidebar.en.json) —— 英文站，链接不带语言前缀。页面结构以它为准：新增页面先改它。
- [`docs/.vitepress/sidebar.zh.json`](https://github.com/cuihairu/hello-python/blob/main/docs/.vitepress/sidebar.zh.json) —— 中文站的同一结构，每条链接带 `/zh/` 前缀。

`docs/.vitepress/config.mts` 同时导入这两份，挂在 `themeConfig.locales` 下。语言路由用的是 VitePress 官方 locales：英文页在站点根目录，中文页在 `/zh/` 下，语言切换器由 `locales` 配置生成。仓库不自制切换器，不维护 `*.zh.md` 镜像协议，也不手写语言横幅。

仓库没有手写 `SUMMARY.md` 副本；若将来增加其他目录清单，应链接到侧栏或明确标注为派生内容，不得维护第二份可编辑导航。

调整导航时：

1. 先改 `sidebar.en.json`，再把同样的结构改动同步到 `sidebar.zh.json`，链接加 `/zh/` 前缀。
2. 确认每条链接目标在自己那一侧都存在对应页面。
3. 同一分组内不要重复列出同一链接；不同分组如确有入口需要，可以复用路由。
4. 首页由顶部导航的 `/`（英文）与 `/zh/`（中文）进入，两份侧栏都不重复列出。
5. 改完运行文档构建与内部链接检查。

页面的正文互链仍按各自角度维护，不以侧栏代替内容关系。
