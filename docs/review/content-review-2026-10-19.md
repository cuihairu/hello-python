# 结构改动内容复核（2026-10-19）

## 复核范围

先执行 `git fetch origin && git pull --rebase origin main`，结果为 `Already up to date`；开始时工作区干净。按仓库真实历史复核最近 4 个提交（`HEAD~4..HEAD`，共 205 insertions、25 deletions）：

- `5b56b0f` docs: audit documentation structure（审计基线）
- `efb7b33` docs: define sidebar source（A：统一导航源）
- `077b7c8` docs: clarify overlapping topic notes（B：重复合并/边界标注）
- `0753495` docs: align notes positioning and audit（C：定位与口径统一）

工作区当前 `main` 与 `origin/main` 一致。复核采用提交前后 diff、权威正文、文件系统计数和侧栏目标检查；`pnpm docs:build` 通过。

## 四项核查

### 1. 内容丢失：未发现明确丢失

B 只压缩了 `docs/knowledge/pitfalls.md` 的重复说明，没有删除专题页或 Markdown 文件。逐条对照：改前该索引第 11、15、20、24、25、50 行附近的可变默认参数、`is`/`==`、字符串归一、浅拷贝、遍历时改容器、`__del__` 描述，改后分别位于 `docs/knowledge/pitfalls.md:11,15,17,20,21,46`，均保留了要点并指向专题；被省去的解释、复现和完整处理仍在 `docs/advanced/pitfalls.md:11-31,50-70`（可变默认参数、浅深拷贝等），其余条目也仍在该专题相应小节。该专题 `docs/advanced/pitfalls.md:7` 说明其展开成因、复现与处理。

对照例：改前索引写“默认值在函数定义时求值一次……所有调用共享同一个对象”，改后 `docs/knowledge/pitfalls.md:11` 缩为“默认值在调用间共享”；权威页 `docs/advanced/pitfalls.md:13-31` 仍给出定义时求值、示例输出和 `None` 哨兵修复。浅拷贝改前的细节被压缩，权威页 `docs/advanced/pitfalls.md:50-70` 仍有嵌套引用示例和深拷贝对照。其他五条逐项仍有对应专题小节，未见找不到归处的删除内容。

`SUMMARY.md`/同类手写导航副本在仓库中不存在（本轮未发现被大幅精简的 SUMMARY）。

### 2. 表述被改错：未发现技术含义反转或数字错误

- C 把 README 定位从“从语法基础到工程实践的 Python 知识站点”改为个人笔记与开发经验分享。证据：`README.md:22`、`README.zh.md:22`；前后改变的是内容定位，不含技术支持/不支持断言。首页相同口径见 `docs/index.md:6-8`，知识索引说明其为交叉索引而非阅读顺序见 `docs/knowledge/index.md:7,31-35`。
- 两份 README 的目录树（`README.md:51-64`、`README.zh.md:51-64`）中列出的 `index.md`、`glossary.md`、`timeline.md`、`navigation.md`、`public/`、`.vitepress/` 均存在；未发现虚构目录或文件。
- README/知识索引的“38 篇”经复数：六个主题目录 `basics`、`datastructures`、`advanced`、`concurrency`、`engineering`、`internals` 分别为 5、4、10、4、5、10 篇 Markdown，合计 38；`docs/knowledge/index.md:7` 的 38 与实际一致。其“219 条目、221 条站内交叉链接”属于此前已有盘点数字，本次改动没有变更；未在本轮重新统计其内部索引条目。
- B 新增的边界句未把技术层次改反：`docs/internals/implementation-boundary.md:14` 讨论实现边界/可移植性，`docs/engineering/stdlib.md:9` 讨论日常模块选用；`docs/internals/object-model.md:7` 与 `docs/datastructures/list-tuple.md:8`、`docs/datastructures/dict-set.md:7` 分别区分 CPython 内存布局与语言层用法。链接目标主题相符。

### 3. 链接与导航：已核实的站内链接均有效且主题相符

- A 将 `docs/.vitepress/sidebar.json` 声明为导航源；配置仍从该文件导入，见 `docs/.vitepress/config.mts:2,108-109`。新增侧栏项 `docs/.vitepress/sidebar.json:194-197` 指向 `/navigation`，对应 `docs/navigation.md:1-5` 的维护说明，语义匹配。
- 当前侧栏共 47 个链接、47 个唯一 URL，逐个按路由检查目标文件，缺失 0 个。新增的 7 处边界/索引互链均指到相符页面，例：`docs/advanced/pitfalls.md:7` ↔ `docs/knowledge/pitfalls.md:7`；对象实现与容器用法见上述第 2 项行号。
- 导航说明链接到 GitHub 的 `sidebar.json`（`docs/navigation.md:7`），目标与所述真源相符。首页未列侧栏仍由 `/` 路由进入，不构成漏项。

### 4. 无法核实项

- 未重新核实知识索引 219 条目及 221 条站内链接的逐条计数；本次仅确认 C 未改这些计数，且 38 篇主题文档可独立复算。
- 未逐一访问外部参考链接、核验 CPython 源码引用行号或重新统计仓库所有正文链接的语义；这些不属于本次提交所改链接。内部改动链接的目标与主题已抽查并核对。
- 构建通过仅证明当前 VitePress 构建/渲染成功，不代表外部链接可达。构建输出有既存的 bundle 大小提示，不影响通过结果。

## 发现的问题清单

未发现明确内容丢失、数字错误、站内链接失效或主题指错问题。问题数：0；无需修复，因此没有修复提交。

## 结论

本次复核范围内，A/B/C 改动可以视为**已验收**。以上未核实项不改变本次改动的验收判断；如需验证索引条目数或外部引用，需另做专项复核。
