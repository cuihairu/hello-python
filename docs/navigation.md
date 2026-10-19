---
description: 站点导航的唯一维护入口与侧栏更新规则。
---

# 导航维护说明

站点侧栏的唯一真源是 [`docs/.vitepress/sidebar.json`](https://github.com/cuihairu/hello-python/blob/main/docs/.vitepress/sidebar.json)。VitePress 配置在 `docs/.vitepress/config.mts` 导入该文件。仓库没有手写 `SUMMARY.md` 副本；若将来增加其他目录清单，应链接到侧栏或明确标注为派生内容，不得维护第二份可编辑导航。

调整导航时，先改 `sidebar.json`，再确认每个链接目标对应现存页面。同一侧栏分组内不要重复列出同一链接；不同分组如确有入口需要，可以复用路由。首页由顶部导航的 `/` 进入，不必在侧栏重复列出。

页面的正文互链仍按各自角度维护，不以侧栏代替内容关系。目录和链接变更后运行文档构建与内部链接检查。
