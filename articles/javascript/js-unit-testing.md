# 单元测试实战

> 单元测试是保证代码质量的重要手段。掌握 Jest/Vitest 的使用、Mock 技巧和测试覆盖率，构建可靠的代码。

---

## 一、测试基础

### 1.1 AAA 模式

```javascript
// Arrange（准备）→ Act（执行）→ Assert（断言）

test("adds 1 + 2 to equal 3", () => {
  // Arrange
  const a = 1;
  const b = 2;
  
  // Act
  const result = add(a, b);
  
  // Assert
  expect(result).toBe(3);
});
```

### 1.2 常用断言

```javascript
expect(value).toBe(expected);           // 严格相等（===）
expect(value).toEqual(expected);        // 深度相等（对象）
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(5);
expect(string).toMatch(/pattern/);
expect(array).toContain(item);
expect(fn).toThrow(Error);
```

---

## 二、Jest 实战

### 2.1 基础配置

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "jsdom",  // 或 "node"
  setupFilesAfterEnv: ["./jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/*.test.{js,ts}"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 2.2 测试异步代码

```javascript
// Promise
test("fetch user", () => {
  return fetchUser(1).then(user => {
    expect(user.name).toBe("Alice");
  });
});

// async/await
test("fetch user async", async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe("Alice");
});

// 错误处理
test("throws on invalid id", async () => {
  await expect(fetchUser(-1)).rejects.toThrow("Invalid ID");
});
```

### 2.3 Mock

```javascript
// Mock 函数
const mockFn = jest.fn();
mockFn("arg1", "arg2");

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
expect(mockFn).toHaveBeenCalledTimes(1);

// Mock 返回值
const mockAdd = jest.fn().mockReturnValue(42);
mockAdd.mockResolvedValueOnce({ data: [] });  // Promise

// Mock 模块
jest.mock("./api", () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: "Alice" })
}));

// Spy（保留原实现）
const spy = jest.spyOn(console, "log");
expect(spy).toHaveBeenCalled();
spy.mockRestore();  // 恢复原实现
```

---

## 三、React 组件测试

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter";

test("increments counter", () => {
  render(<Counter />);
  
  const button = screen.getByText("Increment");
  fireEvent.click(button);
  
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

---

## 四、总结速查

```javascript
// 测试原则
// - 一个测试一个断言
// - 独立，不依赖顺序
// - 可重复，无副作用

// Jest 常用
// test/it, describe, beforeEach, afterEach
// expect, toBe, toEqual, toHaveBeenCalled
// jest.fn(), jest.mock(), jest.spyOn()

// React Testing Library
// render, screen, fireEvent, userEvent
// getByText, getByRole, getByTestId
```

---

**相关文章**：
- 上一篇：[Webpack/Vite 配置](./js-bundler-config.md)
- 下一篇：[代码规范与质量](./js-code-quality.md)

**参考**：
- [Jest 官方文档](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
