# TODO

## 源码分层分析 2026-11-07

基于 HEAD `e4fecc0347c6e89e0203014784ca7fd2b135662c`。分析排除 `deps/`、`node_modules/`、`dist/`、`build/`、`.git/`、`.cache/`、`Testing/` 和 `vendor/`；当前构建产物与依赖目录本身不纳入源码统计。

### 抽象层清单

- L1 静态内容层：维护双语页面、页面元数据和可导入示例，是教学语义的唯一来源。代表：`docs/glossary.md:7`、`docs/engineering/testing.md:28`。
- L2 站点运行层：读取配置与侧栏，把 Markdown 编译成双语路由、SEO 元数据和静态主题。代表：`docs/.vitepress/config.mts:2`、`docs/.vitepress/config.mts:96`。
- L3 双语路由契约层：约束英文规范路由与 `/zh/` 路由结构成对，防止两套导航漂移。代表：`docs/navigation.md:7`、`docs/.vitepress/sidebar.zh.json:190`。
- L4 时间线交互层：在浏览器中选择 locale 数据、筛选事件并维护交互/动画状态。代表：`docs/.vitepress/theme/components/DevTimeline.vue:16`、`docs/timeline.md:24`。
- L5 Python 示例层：为文档代码块提供可导入 fixture，并声明其只服务测试演示。代表：`docs/engineering/_examples/cfg.py:1`。
- L6 质检命令层：解析内容、数据 schema、锚点与外链，并用一次性子进程执行示例。代表：`scripts/check_timeline.py:197`、`scripts/verify_blocks.py:67`。
- L7 发布流程层：把四项质检和死链敏感构建串成静态发布前置条件。代表：`README.md:30`、`package.json:7`。

### 超大文件候选

无 >1000 行文件。排除清单所列目录后，`package-lock.json`（2010 行）与未跟踪的 `pnpm-lock.yaml`（1219 行）是仅有的超长文件，均属于锁文件而非源码；不设 LAY 拆分任务。

### 目录/分类不合理处

- [x] CAT-001 [P2] 双包管理证据分裂：`package.json:5` 只定义 VitePress 命令，`README.md:22` 和 `README.zh.md:22` 教用户安装并运行 pnpm，但仓库只跟踪 `package-lock.json`（2010 行），pnpm 锁文件未跟踪。应选一个包管理器作为唯一工作流，同步脚本、README 双语指引和锁文件策略。（2026-11-10 统一为 npm：README 双语改 npm 命令并声明口径，`.gitignore` 忽略 pnpm/yarn 锁文件，CI 原有 `npm ci` 不动。）
- [ ] CAT-002 [P2] 可执行示例藏在文档资产目录：`docs/engineering/_examples/cfg.py:1` 是被 `docs/engineering/testing.md:30` 多次导入、又被 `scripts/verify_blocks.py:50` 注入 `PYTHONPATH` 的运行时 fixture，但它位于教学 Markdown 树内，容易让读者把运行代码误当作纯文档。可保留现有路径以避免迁移，但应在文档目录说明中单列 `_examples/` 的代码语义。
- [ ] CAT-003 [P3] 架构说明从教学目录中缺位：站点、双语路由、时间线、质检和发布的契约分散在 `docs/navigation.md:7`、`docs/timeline.md:24`、`scripts/check_timeline.py:2` 与 `README.md:30`。本次新增双语架构页并纳入侧栏；后续内容变更应继续把跨层契约写回该页，而不是复制到各章。
