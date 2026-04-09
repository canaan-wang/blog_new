# Vue 技术文档目录

## 一、Vue 3 核心基础

| 序号 | 文章标题 | 核心内容 |
|:---:|---------|---------|
| 1 | **Vue 3 快速上手** | 安装方式(Vite/CLI)、单文件组件、开发环境配置 |
| 2 | **Composition API 详解** | setup()、script setup 语法糖、与 Options API 对比 |
| 3 | **响应式系统精讲** | ref vs reactive、toRefs、响应式丢失陷阱 |
| 4 | **计算属性与侦听器** | computed、watch、watchEffect、依赖追踪原理 |
| 5 | **生命周期钩子** | Vue 2 vs Vue 3 对比、onMounted、onUnmounted、异步 setup |

## 二、组件系统深度解析

| 序号 | 文章标题 | 核心内容 |
|:---:|---------|---------|
| 6 | **Props 与 Emits** | 类型定义、默认值、validators、emit 类型声明 |
| 7 | **插槽 Slots 完全指南** | 默认插槽、具名插槽、作用域插槽、动态插槽名 |
| 8 | **Provide / Inject** | 跨层级通信、响应式注入、Symbol 作为 key |
| 9 | **组件实例与模板引用** | ref 获取组件、defineExpose、组件递归 |
| 10 | **动态组件与异步组件** | component :is、defineAsyncComponent、Suspense |

## 三、组合式函数 Composables

| 序号 | 文章标题 | 核心内容 |
|:---:|---------|---------|
| 11 | **Composables 设计模式** | 什么是 composable、命名约定、最佳实践 |
| 12 | **常用 Composables 实现** | useFetch、useLocalStorage、useDebounce、useIntersectionObserver |
| 13 | **VueUse 库深度使用** | 常用工具函数、自定义扩展、与项目结合 |

## 四、状态管理

| 序号 | 文章标题 | 核心内容 |
|:---:|---------|---------|
| 14 | **Pinia 完全指南** | Store 定义、State/Getters/Actions、多 Store 协作 |
| 15 | **Pinia 进阶技巧** | 插件系统、持久化存储、SSR 兼容、TypeScript 支持 |
| 16 | **从 Vuex 迁移到 Pinia** | 迁移策略、代码对比、常见坑点 |

## 五、路由系统

| 序号 | 文章标题 | 核心内容 |
|:---:|---------|---------|
| 17 | **Vue Router 4 基础** | 路由配置、路由匹配、动态路由、嵌套路由 |
| 18 | **导航守卫与路由元信息** | beforeEach、路由权限、meta 字段、过渡动画 |
| 19 | **组合式 API 中的路由** | useRouter、useRoute、程序化导航、路由监听 |

## 六、进阶原理

| 序号 | 文章标题 | 核心内容 |
|:---:|---------|---------|
| 20 | **Vue 3 渲染机制** | 虚拟 DOM、Diff 算法、渲染函数 h()、JSX |
| 21 | **编译优化与静态提升** | PatchFlag、Block Tree、 hoistStatic |
| 22 | **自定义指令** | 指令钩子、参数修饰符、使用场景（v-focus、v-permission）|
| 23 | **渲染函数与 JSX** | h() 函数、渲染函数写组件、JSX 配置 |
| 24 | **Vue 3 响应式原理源码** | Proxy、依赖收集、触发更新、Effect 调度 |

## 七、性能优化

| 序号 | 文章标题 | 核心内容 |
|:---:|---------|---------|
| 25 | **Vue 3 性能优化实战** | v-memo、shallowRef、markRaw、树降级 |
| 26 | **懒加载与代码分割** | 异步组件、路由懒加载、预加载策略 |
| 27 | **大规模列表优化** | 虚拟滚动（vue-virtual-scroller）、分页、无限滚动 |

## 八、生态与工具

| 序号 | 文章标题 | 核心内容 |
|:---:|---------|---------|
| 28 | **Vite + Vue 3 最佳实践** | 配置优化、环境变量、构建优化、HMR 原理 |
| 29 | **Nuxt 3 入门到实战** | SSR/SSG、路由约定、数据获取、部署方案 |
| 30 | **Vue 3 与 TypeScript** | 类型声明、泛型组件、props 类型推断、TSX |

## 九、迁移与对比

| 序号 | 文章标题 | 核心内容 |
|:---:|---------|---------|
| 31 | **Vue 2 迁移 Vue 3 指南** | 破坏性变更、兼容模式、迁移步骤、 Composition API 适配 |
| 32 | **Vue vs React 对比** | 响应式 vs 不可变、模板 vs JSX、生态对比、选择建议 |

---

**总计：32 篇**

**路径规划**: `articles/vue/vue-{topic}.md`

是否需要开始撰写？我可以先从第 1 篇开始，或者你有优先想看的主题？