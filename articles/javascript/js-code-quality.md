# 代码规范与质量

> 一致的代码风格和高质量的代码是团队协作的基础。ESLint、Prettier、Husky 和提交规范，构建规范的开发流程。

---

## 一、ESLint 配置

### 1.1 基础配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-console": ["warn", { allow: ["error"] }],
    "no-unused-vars": "error",
    "prefer-const": "error",
    "eqeqeq": ["error", "always"]
  }
};
```

### 1.2 忽略文件

```
// .eslintignore
node_modules
dist
build
coverage
*.config.js
```

---

## 二、Prettier 配置

```javascript
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

```javascript
// 与 ESLint 配合
// .eslintrc.js
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"  // 放最后
  ]
};
```

---

## 三、Git Hooks

```javascript
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## 四、提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type 类型**：

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复 |
| docs | 文档 |
| style | 格式（不影响代码运行）|
| refactor | 重构 |
| test | 测试 |
| chore | 构建/工具 |

**示例**：
```
feat(user): add login form validation

fix(api): handle null response

refactor(utils): extract common functions
```

---

## 五、总结速查

```bash
# 安装
npm install -D eslint prettier husky lint-staged @commitlint/config-conventional

# 初始化 ESLint
npx eslint --init

# 格式化
npx prettier --write "src/**/*.{js,ts}"

# 检查
npx eslint "src/**/*.{js,ts}"
```

---

**相关文章**：
- 上一篇：[单元测试实战](./js-unit-testing.md)
- 下一篇：[响应式原理](./js-reactive-principles.md)

**参考**：
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
