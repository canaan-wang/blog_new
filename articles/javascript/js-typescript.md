# TypeScript 速通

> TypeScript 为 JavaScript 添加类型系统，提供编译时检查和智能提示。本文快速掌握 TS 核心特性。

---

## 一、基础类型

```typescript
// 原始类型
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;
let anything: any;           // 避免使用
let unknownValue: unknown;   // 类型安全的 any

// 数组
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["a", "b"];

// 元组
let tuple: [string, number] = ["Alice", 25];

// 对象
let person: { name: string; age: number } = {
  name: "Alice",
  age: 25
};

// 可选属性
let user: { name: string; age?: number } = { name: "Bob" };

// 只读
let readonlyArr: readonly number[] = [1, 2, 3];
```

---

## 二、类型推断与注解

```typescript
// 类型推断
let inferred = "hello";  // 自动推断为 string

// 函数注解
function add(a: number, b: number): number {
  return a + b;
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b;

// void（无返回值）
function log(message: string): void {
  console.log(message);
}

// never（永不返回）
function throwError(message: string): never {
  throw new Error(message);
}
```

---

## 三、接口与类型别名

```typescript
// 接口
interface User {
  id: number;
  name: string;
  email?: string;
  readonly createdAt: Date;
}

// 扩展接口
interface Admin extends User {
  permissions: string[];
}

// 类型别名
type ID = string | number;
type Point = { x: number; y: number };

// 联合类型
type Status = "pending" | "success" | "error";

// 交叉类型
type Employee = Person & { employeeId: number };

// 接口 vs 类型别名
// - 接口可以重复定义（合并）
// - 类型别名更灵活（联合、条件类型）
```

---

## 四、泛型

```typescript
// 基础泛型
function identity<T>(arg: T): T {
  return arg;
}
identity<string>("hello");
identity(123);  // 类型推断

// 泛型约束
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// 泛型接口
interface GenericResponse<T> {
  data: T;
  status: number;
}

// 泛型类
class Queue<T> {
  private data: T[] = [];
  
  push(item: T) {
    this.data.push(item);
  }
  
  pop(): T | undefined {
    return this.data.shift();
  }
}

const numberQueue = new Queue<number>();
```

---

## 五、高级类型

```typescript
// 类型守卫
function isString(value: unknown): value is string {
  return typeof value === "string";
}

if (isString(input)) {
  input.toUpperCase();  // TypeScript 知道这是 string
}

// keyof
type UserKeys = keyof User;  // "id" | "name" | "email"

// typeof
type Config = typeof defaultConfig;

// 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 条件类型
type IsString<T> = T extends string ? true : false;

// 实用工具类型
type UserPartial = Partial<User>;
type UserReadonly = Readonly<User>;
type UserPick = Pick<User, "id" | "name">;
type UserOmit = Omit<User, "email">;
type UserRecord = Record<string, User>;
```

---

## 六、配置与使用

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

**相关文章**：
- 上一篇：[性能优化实战](./js-performance-optimization.md)
- 下一篇：[Babel 与转译原理](./js-babel-transpilation.md)

**参考**：
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
