# Babel 与转译原理

> Babel 是 JavaScript 编译器，将现代代码转译为兼容版本。理解 AST、插件机制和 Polyfill 策略，掌握前端工程化核心。

---

## 一、Babel 工作流程

```
源码 → 解析(Parse) → 转换(Transform) → 生成(Generate) → 目标代码
        ↓                ↓                  ↓
       AST            遍历/修改           代码字符串
```

---

## 二、AST 基础

### 2.1 抽象语法树

```javascript
// 源码
const add = (a, b) => a + b;

// AST（简化）
{
  "type": "VariableDeclaration",
  "declarations": [{
    "type": "VariableDeclarator",
    "id": { "type": "Identifier", "name": "add" },
    "init": {
      "type": "ArrowFunctionExpression",
      "params": [
        { "type": "Identifier", "name": "a" },
        { "type": "Identifier", "name": "b" }
      ],
      "body": {
        "type": "BinaryExpression",
        "operator": "+",
        "left": { "type": "Identifier", "name": "a" },
        "right": { "type": "Identifier", "name": "b" }
      }
    }
  }]
}
```

### 2.2 查看 AST

```bash
# AST Explorer
https://astexplorer.net/

# Babel 解析
npx babel-parser script.js
```

---

## 三、Babel 配置

### 3.1 基础配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    ["@babel/preset-env", {
      targets: {
        browsers: ["> 1%", "last 2 versions", "not dead"]
      },
      useBuiltIns: "usage",  // 按需引入 polyfill
      corejs: 3
    }],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-decorators",
    ["@babel/plugin-transform-runtime", {
      corejs: false,
      helpers: true,
      regenerator: true
    }]
  ]
};
```

### 3.2 Preset vs Plugin

| 类型 | 说明 | 示例 |
|------|------|------|
| **Preset** | 预设，一组插件 | @babel/preset-env |
| **Plugin** | 单个转换插件 | plugin-proposal-optional-chaining |

---

## 四、Polyfill 策略

### 4.1 三种方式对比

| 方式 | 配置 | 特点 |
|------|------|------|
| entry | useBuiltIns: "entry" | 全量引入，体积大 |
| usage | useBuiltIns: "usage" | 按需引入，推荐 |
| runtime | plugin-transform-runtime | 不污染全局，库推荐 |

### 4.2 配置示例

```javascript
// usage 方式（推荐）
// babel.config.js
module.exports = {
  presets: [
    ["@babel/preset-env", {
      useBuiltIns: "usage",
      corejs: 3
    }]
  ]
};

// 源码中使用新特性
const p = Promise.resolve();
const map = new Map();

// 自动转译为
import "core-js/modules/es.promise.js";
import "core-js/modules/es.map.js";
```

---

## 五、编写 Babel 插件

```javascript
// 简单插件：将 console.log 替换为空
module.exports = function(babel) {
  const { types: t } = babel;
  
  return {
    name: "remove-console",
    visitor: {
      CallExpression(path) {
        const { callee } = path.node;
        
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: "console" }) &&
          t.isIdentifier(callee.property, { name: "log" })
        ) {
          path.remove();
        }
      }
    }
  };
};

// 使用
// babel.config.js
module.exports = {
  plugins: ["./my-plugin.js"]
};
```

---

## 六、总结速查

```javascript
// Babel 核心
// - @babel/core：核心库
// - @babel/parser：解析
// - @babel/traverse：遍历 AST
// - @babel/generator：生成代码
// - @babel/types：AST 类型工具

// 常用预设
// - @babel/preset-env：现代 JS
// - @babel/preset-react：JSX
// - @babel/preset-typescript：TS

// Polyfill
// useBuiltIns: "usage" + corejs: 3

// 插件开发
// visitor 模式，操作 AST
```

---

**相关文章**：
- 上一篇：[TypeScript 速通](./js-typescript.md)
- 下一篇：[Webpack/Vite 配置](./js-bundler-config.md)

**参考**：
- [Babel 官方文档](https://babeljs.io/docs/)
- [AST Explorer](https://astexplorer.net/)
