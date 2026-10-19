---
layout: home

hero:
  name: Hello Python
  text: Python 开发记录与经验分享
  tagline: 一位游戏开发者在项目里使用 Python 的观察、取舍和踩坑记录。
  actions:
    - theme: brand
      text: 查看开发记录
      link: /basics/setup
    - theme: alt
      text: 主题索引
      link: /knowledge/
    - theme: alt
      text: GitHub
      link: https://github.com/cuihairu/hello-python

features:
  - title: 环境与语法
    details: 记录环境与工具链、语法、变量与数据类型、控制流、函数与作用域的常见用法。
    link: /basics/setup
    linkText: 环境记录
  - title: 语法进阶
    details: 列表字典与字符串、迭代器生成器、类与魔法方法、装饰器与类型注解、常见陷阱。
    link: /datastructures/list-tuple
    linkText: 数据结构记录
  - title: 并发编程
    details: threading 与 GIL、asyncio 事件循环、multiprocessing 的选型对比与取舍。
    link: /concurrency/threading
    linkText: 并发记录
  - title: 工程实践
    details: 标准库精选、unittest 与 pytest、日志调试、环境管理与打包发布。
    link: /engineering/stdlib
    linkText: 工程记录
  - title: 源码解析
    details: 以 3.14 分支为准走读 CPython 源码：对象模型、字节码分发、编译管线、内存管理、GIL 与 import，引用带文件行号。
    link: /internals/cpython-source
    linkText: 源码记录
  - title: 追溯源流
    details: 三十七年发展史时间线，语言核心、并发模型、生态工具与工程实践的关键节点，点开看它为何发生在那时。
    link: /timeline
    linkText: 查看时间线
---

## 参考资料

- [Python 官方文档 · 教程](https://docs.python.org/3/tutorial/)
