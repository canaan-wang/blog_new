# 博客文章迁移计划

> 从旧博客项目 (`canaan-wang.github.io`) 迁移 Markdown 文章到新博客项目

## 统计概览

- **源项目**: `/Users/canaann/project/canaan-wang.github.io`
- **目标项目**: `/Users/canaann/project/blog_new`
- **总文章数**: 160 篇
- **预计迁移批次**: 8-10 批

---

## 领域/分类映射关系

| 原目录 | 目标 Domain | 目标 Category | 文章数 |
|--------|-------------|---------------|--------|
| Go/Golang | software-dev-languages | golang | 27 篇 |
| Go/框架 | software-dev-languages | golang | 8 篇 |
| Java/Java | software-dev-languages | java | 33 篇 |
| Java/Spring | software-dev-languages | java | 11 篇 |
| Java/MyBatis | software-dev-languages | java | 2 篇 |
| 数据库/Redis + 中间件/缓存/Redis | distributed-architecture | cache | 17 篇 |
| 数据库/ES | data-governance | elasticsearch | 9 篇 |
| 数据库/Mysql | data-governance | mysql | 3 篇 |
| 中间件/Docker | distributed-architecture | container | 1 篇 |
| 中间件/消息队列/kafka | distributed-architecture | message-queue | 2 篇 |
| 中间件/配置中心/Apollo | distributed-architecture | microservices | 1 篇 |
| 理论/SOLID设计原则 | software-design | design-patterns | 7 篇 |
| 理论/领域驱动设计 | software-design | ddd | 1 篇 |
| 理论/API设计 | software-design | api-design | 2 篇 |
| 理论/分布式系统 | software-design | system-design | 3 篇 |
| 理论/数据库 | software-design | cs-fundamentals | 3 篇 |
| 理论/数据结构 | software-design | cs-fundamentals | 1 篇 |
| 理论/计算机网络 | software-design | cs-fundamentals | 5 篇 |
| web前端/HTML | frontend-development | html | 1 篇 |
| Linux | software-dev-languages | linux | 2 篇 |

---

## 分批迁移计划

### 第一批：Go 语言核心 (27篇) - 高优先级
**目标**: `articles/software-dev-languages/golang/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 1 | Go/Golang/Go语言概览.md | overview/go-overview.html | overview |
| 2 | Go/Golang/基础/变量与常量.md | basics/variables.html | basics |
| 3 | Go/Golang/基础/函数.md | basics/functions.html | basics |
| 4 | Go/Golang/基础/接口.md | basics/interfaces.html | basics |
| 5 | Go/Golang/基础/结构体与方法.md | basics/struct-methods.html | basics |
| 6 | Go/Golang/基础/包管理.md | basics/package-management.html | basics |
| 7 | Go/Golang/基础/Workspace.md | basics/workspace.html | basics |
| 8 | Go/Golang/基础/控制流.md | basics/control-flow.html | basics |
| 9 | Go/Golang/基础/错误处理 .md | basics/error-handling.html | basics |
| 10 | Go/Golang/基础/类型转换与断言.md | basics/type-assertion.html | basics |
| 11 | Go/Golang/复合数据类型/slice.md | basics/slice.html | basics |
| 12 | Go/Golang/复合数据类型/map.md | basics/map.html | basics |
| 13 | Go/Golang/复合数据类型/channel.md | basics/channel.html | basics |
| 14 | Go/Golang/关键字/defer.md | basics/defer.html | basics |
| 15 | Go/Golang/关键字/for-range.md | basics/for-range.html | basics |
| 16 | Go/Golang/特性/GMP.md | advanced/gmp.html | advanced |
| 17 | Go/Golang/特性/GC.md | advanced/gc.html | advanced |
| 18 | Go/Golang/特性/context.md | advanced/context.html | advanced |
| 19 | Go/Golang/特性/pointer.md | advanced/pointer.html | advanced |
| 20 | Go/Golang/特性/泛型.md | advanced/generics.html | advanced |
| 21 | Go/Golang/sync/wait_group.md | advanced/waitgroup.html | advanced |
| 22 | Go/Golang/sync/pool.md | advanced/sync-pool.html | advanced |
| 23 | Go/Golang/sync/sync_Map(new).md | advanced/sync-map.html | advanced |
| 24 | Go/Golang/sync/sync_Map(old).md | advanced/sync-map-old.html | advanced |

**状态**: ⬜ 待迁移

---

### 第二批：Go 框架 (8篇) - 高优先级
**目标**: `articles/software-dev-languages/golang/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 25 | Go/框架/gorm/概览.md | frameworks/gorm-overview.html | frameworks |
| 26 | Go/框架/gorm/使用方式.md | frameworks/gorm-usage.html | frameworks |
| 27 | Go/框架/elastic/介绍.md | frameworks/elastic-intro.html | frameworks |
| 28 | Go/框架/elastic/使用方式.md | frameworks/elastic-usage.html | frameworks |
| 29 | Go/框架/go-zero/Go-Zero.md | frameworks/go-zero-overview.html | frameworks |
| 30 | Go/框架/go-zero/go-zero-tracing.md | frameworks/go-zero-tracing.html | frameworks |
| 31 | Go/框架/testify/testify.md | frameworks/testify-overview.html | frameworks |
| 32 | Go/框架/testify/mock实现原理.md | frameworks/testify-mock.html | frameworks |

**状态**: ⬜ 待迁移

---

### 第三批：Java 基础 (33篇) - 高优先级
**目标**: `articles/software-dev-languages/java/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 33 | Java/Java/Java语言概览.md | overview/java-overview.html | overview |
| 34 | Java/Java/基础/1-Class.md | basics/class.html | basics |
| 35 | Java/Java/基础/2-Interface.md | basics/interface.html | basics |
| 36 | Java/Java/基础/3-判断比较方式.md | basics/comparison.html | basics |
| 37 | Java/Java/基础/4-循环遍历方式.md | basics/loops.html | basics |
| 38 | Java/Java/基础/5-泛型.md | basics/generics.html | basics |
| 39 | Java/Java/基础/6-反射.md | basics/reflection.html | basics |
| 40 | Java/Java/基础/7-String.md | basics/string.html | basics |
| 41 | Java/Java/集合/集合概览.md | collections/overview.html | collections |
| 42 | Java/Java/集合/Map/Map.md | collections/map.html | collections |
| 43 | Java/Java/集合/Map/HashMap.md | collections/hashmap.html | collections |
| 44 | Java/Java/集合/Map/LinkedHashMap.md | collections/linkedhashmap.html | collections |
| 45 | Java/Java/集合/Map/TreeMap.md | collections/treemap.html | collections |
| 46 | Java/Java/集合/Map/Hashtable.md | collections/hashtable.html | collections |
| 47 | Java/Java/集合/Map/ConcurrentHashMap.md | collections/concurrenthashmap.html | collections |
| 48 | Java/Java/集合/Collection/List/List.md | collections/list.html | collections |
| 49 | Java/Java/集合/Collection/List/ArrayList.md | collections/arraylist.html | collections |
| 50 | Java/Java/集合/Collection/List/LinkedList.md | collections/linkedlist.html | collections |
| 51 | Java/Java/集合/Collection/List/Vector.md | collections/vector.html | collections |
| 52 | Java/Java/集合/Collection/List/CopyOnWriteArrayList.md | collections/copyonwritearraylist.html | collections |
| 53 | Java/Java/集合/Collection/Set/Set.md | collections/set.html | collections |
| 54 | Java/Java/集合/Collection/Set/HashSet.md | collections/hashset.html | collections |
| 55 | Java/Java/集合/Collection/Set/LinkedHashSet.md | collections/linkedhashset.html | collections |
| 56 | Java/Java/集合/Collection/Set/TreeSet.md | collections/treeset.html | collections |
| 57 | Java/Java/集合/Collection/Set/CopyOnWriteArraySet.md | collections/copyonwritearrayset.html | collections |
| 58 | Java/Java/集合/Collection/Set/ConcurrentSkipListSet.md | collections/concurrentskiplistset.html | collections |
| 59 | Java/Java/集合/Collection/Queue/Queue.md | collections/queue.html | collections |
| 60 | Java/Java/集合/Collection/Queue/ArrayBlockingQueue.md | collections/arrayblockingqueue.html | collections |
| 61 | Java/Java/集合/Collection/Queue/LinkedBlockingQueue.md | collections/linkedblockingqueue.html | collections |
| 62 | Java/Java/集合/Collection/Queue/PriorityQueue.md | collections/priorityqueue.html | collections |
| 63 | Java/Java/集合/Collection/Queue/ArrayDeque.md | collections/arraydeque.html | collections |
| 64 | Java/Java/集合/Collection/Queue/LinkedBlockingDeque.md | collections/linkedblockingdeque.html | collections |
| 65 | Java/Java/集合/Collection/Queue/DelayQueue.md | collections/delayqueue.html | collections |
| 66 | Java/Java/集合/Collection/Queue/ConcurrentLinkedQueue.md | collections/concurrentlinkedqueue.html | collections |

**状态**: ⬜ 待迁移

---

### 第四批：Java 并发 (2篇) - 高优先级
**目标**: `articles/software-dev-languages/java/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 67 | Java/Java/并发/synchronized.md | concurrency/synchronized.html | concurrency |
| 68 | Java/Java/并发/volatile.md | concurrency/volatile.html | concurrency |

**状态**: ⬜ 待迁移

---

### 第五批：JVM (5篇) - 高优先级
**目标**: `articles/software-dev-languages/java/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 69 | Java/Java/JVM/JVM概述.md | jvm/jvm-overview.html | jvm |
| 70 | Java/Java/JVM/类加载子系统.md | jvm/classloader.html | jvm |
| 71 | Java/Java/JVM/运行时数据区.md | jvm/runtime-data-area.html | jvm |
| 72 | Java/Java/JVM/执行引擎.md | jvm/execution-engine.html | jvm |
| 73 | Java/Java/JVM/垃圾回收.md | jvm/gc.html | jvm |

**状态**: ⬜ 待迁移

---

### 第六批：Spring 框架 (11篇) - 中优先级
**目标**: `articles/software-dev-languages/java/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 74 | Java/Spring/Spring概览.md | spring/spring-overview.html | spring |
| 75 | Java/Spring/SpringCore/SpringCore概览.md | spring/spring-core-overview.html | spring |
| 76 | Java/Spring/SpringCore/IOC.md | spring/spring-ioc.html | spring |
| 77 | Java/Spring/SpringCore/AOP.md | spring/spring-aop.html | spring |
| 78 | Java/Spring/SpringCore/事务.md | spring/spring-transaction.html | spring |
| 79 | Java/Spring/Bean.md | spring/spring-bean.html | spring |
| 80 | Java/Spring/MVC.md | spring/spring-mvc.html | spring |
| 81 | Java/Spring/事务.md | spring/spring-transaction-2.html | spring |
| 82 | Java/Spring/SpringBoot/SpringBoot概览.md | spring/spring-boot-overview.html | spring |
| 83 | Java/Spring/SpringCloud/SpringCloud概览.md | spring/spring-cloud-overview.html | spring |
| 84 | Java/Spring/SpringCloud/Nacos注册中心.md | spring/spring-cloud-nacos.html | spring |
| 85 | Java/MyBatis/缓存.md | spring/mybatis-cache.html | spring |
| 86 | Java/MyBatis/SQL.md | spring/mybatis-sql.html | spring |

**状态**: ⬜ 待迁移

---

### 第七批：Redis 缓存 (17篇) - 中优先级
**目标**: `articles/distributed-architecture/cache/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 87 | 数据库/Redis/Redis.md | overview/redis-overview.html | overview |
| 88 | 数据库/Redis/命令.md | overview/redis-commands.html | overview |
| 89 | 中间件/缓存/Redis/Redis概览.md | overview/redis-summary.html | overview |
| 90 | 中间件/缓存/分布式缓存.md | overview/distributed-cache.html | overview |
| 91 | 数据库/Redis/数据类型/String.md | data-types/redis-string.html | data-types |
| 92 | 数据库/Redis/数据类型/hash.md | data-types/redis-hash.html | data-types |
| 93 | 数据库/Redis/数据类型/list.md | data-types/redis-list.html | data-types |
| 94 | 数据库/Redis/数据类型/set.md | data-types/redis-set.html | data-types |
| 95 | 数据库/Redis/数据类型/sortedSet.md | data-types/redis-sorted-set.html | data-types |
| 96 | 数据库/Redis/数据类型/bitmap.md | data-types/redis-bitmap.html | data-types |
| 97 | 数据库/Redis/数据类型/geo.md | data-types/redis-geo.html | data-types |
| 98 | 数据库/Redis/数据类型/stream.md | data-types/redis-stream.html | data-types |
| 99 | 数据库/Redis/存储类型/SDS.md | storage/redis-sds.html | storage |
| 100 | 数据库/Redis/存储类型/int.md | storage/redis-int.html | storage |
| 101 | 数据库/Redis/存储类型/embstr.md | storage/redis-embstr.html | storage |
| 102 | 数据库/Redis/存储类型/raw.md | storage/redis-raw.html | storage |
| 103 | 数据库/Redis/存储类型/hashtable.md | storage/redis-hashtable.html | storage |
| 104 | 数据库/Redis/存储类型/intset.md | storage/redis-intset.html | storage |
| 105 | 数据库/Redis/存储类型/ziplist.md | storage/redis-ziplist.html | storage |
| 106 | 数据库/Redis/存储类型/quicklist.md | storage/redis-quicklist.html | storage |
| 107 | 数据库/Redis/存储类型/skiplist.md | storage/redis-skiplist.html | storage |

**状态**: ⬜ 待迁移

---

### 第八批：Elasticsearch (9篇) - 中优先级
**目标**: `articles/data-governance/elasticsearch/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 108 | 数据库/ES/查询语法.md | overview/es-query-syntax.html | overview |
| 109 | 数据库/ES/特性/倒排索引.md | features/es-inverted-index.html | features |
| 110 | 数据库/ES/特性/copy_to.md | features/es-copy-to.html | features |
| 111 | 数据库/ES/查询语法/bool.md | queries/es-bool-query.html | queries |
| 112 | 数据库/ES/查询语法/match.md | queries/es-match-query.html | queries |
| 113 | 数据库/ES/查询语法/match_phrase.md | queries/es-match-phrase.html | queries |
| 114 | 数据库/ES/查询语法/match_phrase_prefix.md | queries/es-match-phrase-prefix.html | queries |
| 115 | 数据库/ES/查询语法/multi_match.md | queries/es-multi-match.html | queries |
| 116 | 数据库/ES/查询语法/range.md | queries/es-range-query.html | queries |
| 117 | 数据库/ES/查询语法/term.md | queries/es-term-query.html | queries |

**状态**: ⬜ 待迁移

---

### 第九批：MySQL (3篇) - 中优先级
**目标**: `articles/data-governance/mysql/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 118 | 数据库/Mysql/Mysql.md | overview/mysql-overview.html | overview |
| 119 | 数据库/Mysql/特性/索引.md | features/mysql-index.html | features |
| 120 | 数据库/Mysql/特性/MVCC.md | features/mysql-mvcc.html | features |

**状态**: ⬜ 待迁移

---

### 第十批：分布式中间件 (4篇) - 中优先级
**目标**: `articles/distributed-architecture/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 121 | 中间件/Docker/docker.md | container/docker-overview.html | container |
| 122 | 中间件/消息队列/kafka/Kafka.md | message-queue/kafka-overview.html | message-queue |
| 123 | 中间件/消息队列/kafka/Golang接入Kafka.md | message-queue/kafka-golang.html | message-queue |
| 124 | 中间件/配置中心/Apollo/Apollo概览.md | microservices/apollo-overview.html | microservices |

**状态**: ⬜ 待迁移

---

### 第十一批：设计原则与模式 (7篇) - 低优先级
**目标**: `articles/software-design/design-patterns/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 125 | 理论/SOLID设计原则/SOLID设计原则.md | solid/solid-overview.html | solid |
| 126 | 理论/SOLID设计原则/单一职责原则.md | solid/solid-srp.html | solid |
| 127 | 理论/SOLID设计原则/开闭原则.md | solid/solid-ocp.html | solid |
| 128 | 理论/SOLID设计原则/里氏替换原则.md | solid/solid-lsp.html | solid |
| 129 | 理论/SOLID设计原则/接口隔离原则.md | solid/solid-isp.html | solid |
| 130 | 理论/SOLID设计原则/依赖倒置原则.md | solid/solid-dip.html | solid |

**状态**: ⬜ 待迁移

---

### 第十二批：系统设计与架构 (8篇) - 低优先级
**目标**: `articles/software-design/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 131 | 理论/领域驱动设计/领域驱动设计概览.md | ddd/ddd-overview.html | ddd |
| 132 | 理论/API设计/RestFulAPI.md | api-design/restful-api.html | api-design |
| 133 | 理论/API设计/RpcApi.md | api-design/rpc-api.html | api-design |
| 134 | 理论/分布式系统/一致性/一致性.md | system-design/distributed-consistency.html | system-design |
| 135 | 理论/分布式系统/一致性/分布式事务.md | system-design/distributed-transaction.html | system-design |
| 136 | 理论/分布式系统/一致性/分布式锁.md | system-design/distributed-lock.html | system-design |
| 137 | 理论/数据结构/skiplist.md | cs-fundamentals/skiplist.html | cs-fundamentals |

**状态**: ⬜ 待迁移

---

### 第十三批：计算机基础 (11篇) - 低优先级
**目标**: `articles/software-design/cs-fundamentals/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 138 | 理论/数据库/概览.md | database-theory-overview.html | overview |
| 139 | 理论/数据库/锁/乐观锁.md | optimistic-lock.html | overview |
| 140 | 理论/数据库/锁/悲观锁.md | pessimistic-lock.html | overview |
| 141 | 理论/计算机网络/概要.md | network-overview.html | overview |
| 142 | 理论/计算机网络/HTTP.md | http.html | overview |
| 143 | 理论/计算机网络/TCP&UDP.md | tcp-udp.html | overview |
| 144 | 理论/计算机网络/SSL.md | ssl-tls.html | overview |

**状态**: ⬜ 待迁移

---

### 第十四批：前端与 Linux (3篇) - 低优先级
**目标**: `articles/frontend-development/` 和 `articles/software-dev-languages/`

| 序号 | 原文件路径 | 目标文件名 | 分组 |
|------|-----------|-----------|------|
| 145 | web前端/HTML/介绍.md | html/html-intro.html | html |
| 146 | Linux/README.md | linux/linux-overview.html | overview |

**状态**: ⬜ 待迁移

---

### 第十五批：个人/生活类 (9篇) - 最低优先级（可选）
**目标**: 暂不迁移到技术博客，或单独创建 life 领域

| 序号 | 原文件路径 |
|------|-----------|
| 147 | 生活/菜品/银耳薏米莲子粥.md |
| 148 | 生活/菜品/冬瓜玉米排骨汤.md |
| 149 | 生活/菜品/大锅菜.md |
| 150 | 生活/菜品/鱼香肉丝.md |
| 151 | 生活/菜品/鸡蛋西红柿.md |
| 152 | 生活/菜品/烤鱼.md |
| 153 | 生活/菜品/凉菜.md |
| 154 | me/工作/简历.md |
| 155 | me/工作/VPC/VPC.md |
| 156 | me/工作/全业务巡检/全业务巡检.md |
| 157 | me/工作/宠物保险/支付宝宠物保险.md |
| 158 | 对话_待整理.md |
| 159 | 提示词 |

**状态**: ⬜ 待定

---

## 迁移检查清单

### 每篇文章迁移步骤
- [ ] 1. 读取原 Markdown 文件
- [ ] 2. 转换 Markdown 为 HTML
- [ ] 3. 添加文章标题 (h1)
- [ ] 4. 确保代码块有 language-xxx 类名
- [ ] 5. 保存到目标路径
- [ ] 6. 更新 domains.ts 中的分组配置（如需要）
- [ ] 7. 验证页面渲染正常

### 每批完成验证
- [ ] 构建成功
- [ ] 侧边栏显示正确
- [ ] 文章列表正常
- [ ] 文章内容渲染正常
- [ ] Mermaid 图表正常（如有）

---

## 预估工作量

| 批次 | 文章数 | 预估时间 | 优先级 |
|------|--------|----------|--------|
| 第一批 | 24 | 2-3 小时 | P0 |
| 第二批 | 8 | 1 小时 | P0 |
| 第三批 | 33 | 3-4 小时 | P0 |
| 第四批 | 2 | 0.5 小时 | P0 |
| 第五批 | 5 | 1 小时 | P0 |
| 第六批 | 13 | 2 小时 | P1 |
| 第七批 | 21 | 3 小时 | P1 |
| 第八批 | 10 | 1.5 小时 | P1 |
| 第九批 | 3 | 0.5 小时 | P1 |
| 第十批 | 4 | 0.5 小时 | P1 |
| 第十一批 | 6 | 1 小时 | P2 |
| 第十二批 | 7 | 1 小时 | P2 |
| 第十三批 | 7 | 1 小时 | P2 |
| 第十四批 | 3 | 0.5 小时 | P2 |
| **总计** | **146** | **约 20-25 小时** | - |

---

## 备注

1. **文章筛选**: 已排除 `_sidebar.md`, `README.md`, `_navbar.md` 等配置文件
2. **生活类文章**: 建议单独创建 `life` 领域或不迁移
3. **工作相关**: `me/工作/` 目录内容较旧，建议评估后选择性迁移
4. **Mermaid 支持**: 新博客已支持 Mermaid 图表渲染
5. **图片资源**: 原项目图片在 `assets/` 目录，迁移时注意路径调整

---

*计划创建时间: 2026-04-02*
*计划执行者: Kimi Code CLI*
