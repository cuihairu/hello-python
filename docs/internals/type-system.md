---
description: PyTypeObject 的 tp_* 槽与 slotdefs 映射、属性查找的完整顺序、MRO 缓存与描述符协议在 C 层的落点，引用带文件行号。
---

# 类型系统与属性查找

行号对应 3.14 分支 commit `66df30d15c9052785ed6463663e70d38107a9edf`（2026-10-04 检出）；克隆方式与阅读前提见[总览](/internals/cpython-source)。

## tp_* 槽就是虚表

`PyTypeObject`（`Include/cpython/object.h:148`）把一个类型能干的事全部摊平成 C 函数指针：`tp_dealloc`（`:155`）管销毁，`tp_call`（`:172`）让实例可调用，`tp_descr_get`/`tp_descr_set`（`:210`、`:211`）实现描述符协议，`tp_new`（`:215`）管创建，`tp_mro`（`:219`）存方法解析序。手写扩展类型就是填这张表。

Python 层的 dunder 和 C 层槽的对应关系不靠魔法，靠 `slotdefs[]` 一张静态表（`Objects/typeobject.c:10969`）。类定义或修改 `__init__` 这类名字时，`update_one_slot`（`Objects/typeobject.c:11308`）查表把对应槽改成转发函数；`fixup_slot_dispatchers`（`Objects/typeobject.c:3700`）在 `PyType_Ready` 流程里批量做这件事。转发函数是 `slot_tp_getattr_hook` 这类通用入口（`Objects/typeobject.c:10390`），它先查实例字典再走类型 MRO，找不到才调 Python 层的 `__getattr__`。所以「给类加 `__len__` 会不会立刻生效」这类问题，答案是会：赋值走 `type_setattro`，若是 dunder 名就同步改槽。

类型本身也是对象，`PyType_Type` 在 `Objects/typeobject.c:6736`，`type` 的元类能力就来自它也填了同一张表。

## 属性查找：两次查表，数据描述符优先

类属性访问的完整顺序在 `_Py_type_getattro_impl`（`Objects/typeobject.c:6103`）：

1. 在元类型上查 `name`，若命中数据描述符（实现了 `tp_descr_set`）立刻调用返回；
2. 否则在本类型及其基类的 `tp_dict`（经 MRO）上查 `name`，命中且带 `tp_descr_get` 就调用（`Objects/typeobject.c:6149`），命中但无描述符就直接返回；
3. 兜底回到元类型上的非数据描述符或普通属性，最后抛 `AttributeError`。

实例属性访问走 `PyObject_GenericGetAttrWithDict`（`Include/cpython/object.h:311`）：先查类型 MRO，命中数据描述符优先；再查实例 `__dict__`；类型上命中非数据描述符时才调用它。这条优先级就是「`property` 压过同名实例属性、实例属性压过普通方法」的出处。

MRO 查找本身有缓存：`_PyType_Lookup`（`Objects/typeobject.c:5972`）进到 `_PyType_LookupStackRefAndVersion`（`Objects/typeobject.c:5878`），按类型和名字哈希进 per-type 缓存表，命中条件带 `tp_version_tag` 版本号；任何类型修改会让版本号失效，下次重查。

## 描述符在 C 层的落点

描述符协议在 Python 层是 `__get__`/`__set__`/`__delete__` 三个方法，C 层的落点是 `tp_descr_get`/`tp_descr_set` 两个槽。常见的落点实例：

- 普通函数：`func_descr_get`（`Objects/funcobject.c:1282`），经属性访问时把函数和实例绑成 `PyMethod`，这就是「方法自动绑定 self」的全部机制，`PyFunction_Type` 在 `:1325` 填了这个槽；
- `property`：`property_descr_get`（`Objects/descrobject.c:1661`），转发到存好的 fget；
- `classmethod`/`staticmethod`：类型定义也在 `Objects/funcobject.c`（`:1684`、`:1932`），区别只在绑定时取类还是忽略实例。

受限 API（`Py_LIMITED_API`）下不允许直接写 `PyTypeObject` 字面量，替代路径是 `PyType_FromSpec`（`Objects/typeobject.c:5432`），用 `PyType_Spec` 描述槽位由运行时拼装。类型标志位集中在 `Include/object.h:543` 起：`Py_TPFLAGS_HEAPTYPE`（`:546`）标记堆上创建的类型，`Py_TPFLAGS_BASETYPE`（`:549`）允许被继承。
