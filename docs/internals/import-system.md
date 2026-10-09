---
description: import 系统的 C/Python 双半边、从 import 语句到模块执行的完整调用链、pyc 缓存校验与模块对象的本质，引用带文件行号。
---

# import 机制与模块对象

行号对应 3.14 分支 commit `66df30d15c9052785ed6463663e70d38107a9edf`（2026-10-04 检出）；克隆方式与阅读前提见[总览](/internals/cpython-source)。

import 系统是 C 和 Python 各写一半的典型。C 半边（`Python/import.c`）提供 `_imp` 内建接口：内建模块表 `_PyImport_Inittab`（声明在 `Python/import.c:58`，本体在构建生成的 `config.c`，逐项匹配在 `:2420`）、动态扩展加载（`import_find_extension` 流程注释在 `:721`）、按模块加锁的全局簿记（`:126`）。Python 半边在 `Lib/importlib/_bootstrap.py` 和 `_bootstrap_external.py`，启动时以冻结模块形式内嵌（`Python/frozen.c:70` 起的表里有 `_frozen_importlib`），由 `pyinit_main` 阶段安装（`Python/pylifecycle.c:472`、`:927`）。

Python 层调用链：

1. `import` 语句进 `builtin___import___impl`（`Python/bltinmodule.c:282`），转发给 importlib 的 `__import__`（`Lib/importlib/_bootstrap.py:1473`）；
2. `_gcd_import`（`:1394`）规整相对导入后进 `_find_and_load`（`:1360`）：先查 `sys.modules`，命中且不在初始化中就直接返回，这条快路径让重复 import 接近零成本；
3. 未命中则加模块锁，进 `_find_and_load_unlocked`（`:1308`）遍历 `sys.meta_path` 找 spec；
4. `_load_unlocked`（`:914`）先 `module_from_spec` 建模块对象，**先放进 `sys.modules` 再执行模块代码**，执行失败从 `sys.modules` 删除并抛错。先入表再执行是为了让循环引用能看到半成品模块。

文件模块的加载在 `_bootstrap_external.py`：`SourceFileLoader`（`:966`）的 `get_code`（`:1015`）读源码或缓存的 pyc。pyc 魔数 `MAGIC_NUMBER`（`:224`）绑死字节码版本，`_classify_pyc`（`:424`）校验魔数不匹配就重新编译；时间戳模式再比源文件 mtime 和大小（`_validate_timestamp_pyc`，`:457`）；缓存路径由 `cache_from_source`（`:239`）生成 `__pycache__` 布局。

模块对象本体很薄：`PyModuleObject` 主要就是一个名字加一个字典，`PyModule_NewObject`（`Objects/moduleobject.c:128`）创建，模块的 `__dict__` 就是它的全部状态，`__name__`、`__spec__`、`__loader__` 都是这个字典里的键。属性访问走 `_Py_module_getattro`（`Objects/moduleobject.c:1140`），支持模块级 `__getattr__` 兜底。
