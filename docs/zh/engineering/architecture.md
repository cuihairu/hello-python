---
description: 文档站、源码数据、质量门禁与发布流程的职责分层。
---

# 源码架构分层

本页按职责描述仓库的可执行与发布架构。这里的“层”是围绕共同状态与变更节奏形成的契约，不是目录别名：内容、站点、双语路由、时间线交互和质检分开，是因为它们由不同触发条件修改，并由不同工具验证。

## 层清单

| 层 | 职责 | 代表实现 | 状态 |
|---|---|---|---|
| L1 静态内容层 | 维护双语教学与参考文案、可执行示例和页面元数据。 | `docs/glossary.md:7`；`docs/engineering/testing.md:28` | 工作区文件；构建结果无运行态。 |
| L2 站点运行层 | 把 Markdown 编译成路由和 locale 元数据，注入 SEO 信息并挂载自定义主题。 | `docs/.vitepress/config.mts:2`；`docs/.vitepress/config.mts:96` | 构建期配置，随后生成静态 HTML/JS。 |
| L3 双语路由契约层 | 把规范页面映射到同结构的 `/zh/` 路由，并把导航约束为唯一真源。 | `docs/navigation.md:7`；`docs/.vitepress/config.mts:91` | 两份侧栏 JSON 加成对 Markdown 路径。 |
| L4 时间线交互层 | 选择 locale 数据，筛选与展开事件，并对可见分期做动画。 | `docs/.vitepress/theme/components/DevTimeline.vue:16`；`docs/timeline.md:24` | 组件 `ref` 状态保存在浏览器内存。 |
| L5 Python 示例层 | 为可执行文档示例提供可导入的被测模块。 | `docs/engineering/_examples/cfg.py:1`；`docs/engineering/testing.md:30` | 导入期模块对象；校验子进程经 `PYTHONPATH` 读取。 |
| L6 质检命令层 | 解析 Markdown、类 TypeScript 数据、锚点和 URL；用一次性子进程执行代码块。 | `scripts/check_anchors.py:52`；`scripts/check_timeline.py:197`；`scripts/check_links.py:54`；`scripts/verify_blocks.py:67` | 内存中的解析结果；每个代码块一个临时 Python 文件。 |
| L7 发布流程层 | 在静态发布前拦截死链、失效锚点、双语时间线不一致或代码块输出变化。 | `README.md:30`；`package.json:7`；`docs/.vitepress/config.mts:91` | 先消费锁文件，后在被忽略的 dist 目录生成不可变资产。 |

## 接口与归属

- **内容到运行时：** VitePress 发现 Markdown、读取 `description` front matter 并生成路由，但不理解教学语义。`config.mts` 在 `docs/.vitepress/config.mts:2` 一次性导入两份侧栏，并从 `docs/.vitepress/config.mts:175` 挂载 locale 主题数据。
- **运行时到组件：** 时间线页面分别在 `docs/timeline.md:24` 和 `docs/zh/timeline.md:24` 导入同一个组件；组件在 `DevTimeline.vue:16` 选择 `TIMELINE` 或 `TIMELINE_ZH`。页面本身不承载时间线逻辑。
- **组件到 schema：** `TimelineEvent` 与 `TimelineEra` 定义在 `timeline.ts:10` 和 `timeline.ts:20`；组件界面文案集中在 `DevTimeline.vue:24`，历史事件文案留在成对数据数组里。
- **质检契约：** `check_anchors.py` 抽取围栏外标题并生成 slug（`check_anchors.py:16`、`check_anchors.py:27`）；`check_links.py` 先删除围栏再抽取外部链接（`check_links.py:26`、`check_links.py:29`）；`check_timeline.py` 读取单个成对 TypeScript 文件和显式 locale 常量（`check_timeline.py:17`、`check_timeline.py:20`）；`verify_blocks.py` 把 Python 块复制到临时文件后调用 `sys.executable`（`verify_blocks.py:44`、`verify_blocks.py:55`）。
- **示例到质检器：** 文档里的 `from cfg import parse_port` 通过质检器注入的 `PYTHONPATH` 解析（`verify_blocks.py:50`）；fixture 用 `cfg.py:1` 说明该用途。
- **发布输入：** package 脚本只声明构建和预览命令（`package.json:5-11`）；README 列出 Python 与构建门禁（`README.md:30-39`）；外部链接策略允许软性网络失败，并以 CI 为准（`check_links.py:6`）。

## 配置输入

VitePress 站点配置在 `config.mts`，包括 locale、路径行为、死链强制、canonical/alternate 生成和主题元数据（`config.mts:35-108`、`config.mts:110-157`）。导航侧栏刻意拆成 `sidebar.en.json` 和 `sidebar.zh.json`（`config.mts:2`）。时间线 schema、标签、分期和事件在 `timeline.ts:27-219` 成对维护；质检器在同范围的字段规则位于 `check_timeline.py:25-27`。这些边界不包含环境变量、Redis、MySQL 或常驻服务端存储。

## 生命周期

1. **撰写：** 编辑成对 Markdown，并先更新两份侧栏（`navigation.md:16-22`）。
2. **校验：** 运行四个 Python 命令和文档构建（`README.md:32-39`）。Python 示例在临时文件中执行，超时上限 30 秒（`verify_blocks.py:55`）。
3. **构建：** VitePress 编译页面、拒绝站内死链（`config.mts:91`）、推导 canonical 与 hreflang URL（`config.mts:43-70`），并把静态产物输出到被 `.gitignore` 忽略的目录（`.gitignore:166`）。
4. **消费：** 用户获得静态页面；时间线组件水合后只在浏览器内存中保留筛选/展开状态（`DevTimeline.vue:30-37`）。

仓库没有专属线协议。内部调用是直接导入；Python 校验是本地子进程契约；唯一网络通道是外部链接的 HEAD/GET 探测（`check_links.py:37`）。文案挂点遵循源码契约：页面文案在对应 locale Markdown，本地化时间线事件文案在 `timeline.ts`，组件界面文案在 `DevTimeline.vue:23`。
