# babel-simple-plugin

简单的babel插件，可以用来替换计算表达式

# 笔记

## AST抽象语法树

> Babel对代码进行转换，会将JS代码转换为AST抽象语法树，对树进行静态分析，然后再将语法树转换为JS代码。每一层树被称为节点。每一层节点都会有type属性，用来描述节点的类型。其他属性用来进一步描述节点的类型。

## Bable的步骤

1. 解析代码，输出AST
2. 转换
3. 生成

### 解析

1. 词法分析
2. 语法分析

#### 词发分析

> 将代码字符串转换为tokens, tokens是扁平的语法片段的数组

#### 语法分析

> 将tokens令牌流，转化为AST抽象语法树

### 转换

Bable的插件会对抽象语法树进行增加删除更新的操作, 达到修改源码的目的

### 生成

将AST抽象语法树转换为源代码

### 遍历AST

> 所有对AST的修改，都是遍历AST抽象语法书实现的。

### 访问者

> 访问者是一个对象，对象中定义了各种各样的方法, 例如访问者中定义Identifier方法会在对AST遍历中遇到Identifier情况下执行。访问者在遍历AST抽象语法树的时候，对每一个节点进行两次访问, 进入节点一次，退出节点一次, 所以每一种节点类型的方法可以定义为enter(进入), exit(退出)

```js

// 访问者
const visitors1 = {
  Identifier () {
    enter (path) {
      // 进入Identifier节点执行
    },
    exit (path) {
      // 离开Identifier节点执行
    }
  }
}

const visitors2 = {
  // 会同时在Identifier节点和Flow节点中执行
  'Identifier|Flow' () {
  }
}
```

### Path路径

> Path是表示两个节点之间连接的对象。同时路径对象中包含了，操作节点的方法以及节点的信息。访问者中的方法的参数，本质上就是改节点的路径

```js

// AST
{
  type: 'FunctionDeclaration',
  id: {
    type: 'Identofoer',
    name: 'square'
  }
}

// 子节点Identofoer的路径
{
  // 父节点
  parent: {
    type: 'FunctionDeclaration',
    id: { ... }
  },
  // 子节点
  node: [{
    type: 'Identofoer',
    name: 'square'
  }]
}
```

#### 访问者中的路径

> 访问者成员的默认参数是就是改节点的路径path

### 作用域

#### 绑定

> 一个作用域内，所有引用与作用域的关系被称为绑定

### babylon

> 将代码的字符串生成AST抽象语法树

### babel-traverse

> 用于遍历AST，并负责操作节点

### babel-types

> 一个验证,变换AST节点的库。babel-types可以验证，构建。AST抽象语法树的节点

```js

const t = require('babel-types')

// 生成 a * b的AST抽象语法树
t.binaryExpression('*', t.identifier('a'), t.identifier('b')）
```

#### 定义

> bable-types定义了**每一种类型**节点的属性，合法值，以及如何构建节点。

#### 构建器

> 每一个节点的定义，都拥有builder字段。字段定义了构建改节点的方法。

```js

const t = require('babel-types')

// 二进制表达式的节点的定义
// BinaryExpression => builder: ["operator", "left", "right"]

// 构建二进制表达式的节点
t.binaryExpression('*', t.identifier('a'), t.identifier('b')）
```

#### 验证器

> bable-types提供了验证器的功能，用于验证节点的类型，通过的api的格式是, isXXX的格式。也有断言格式的API, assert如果不是该类型会抛出异常，而不是想isXXX的api一样，返回布尔类型的值

```ts

const t = require('bable-types')

// 验证节点是否是二进制表达式
t.isBinaryExpression(node)
```

### 变换器

> 将AST抽象语法树，变换成源代码的

#### bable-generator

> 用于将AST转换为源代码

```js

const code = `function square(n) {
  return n * n;
}`;

const ast = babylon.parse(code);

// 转换为源代码
generate.default(ast, {}, code).code
```

#### bable-template

## 编写Bable插件

### 第一个Bable插件

```js

// path的路径
Node {
  type: 'BinaryExpression',
  start: 15,
  end: 24,
  loc: 
   SourceLocation {
     start: Position { line: 1, column: 15 },
     end: Position { line: 1, column: 24 } },
  left: 
   Node {
     type: 'BinaryExpression',
     start: 15,
     end: 20,
     loc: SourceLocation { start: [Object], end: [Object] },
     left: 
      Node {
        type: 'NumericLiteral',
        start: 15,
        end: 16,
        loc: [Object],
        extra: [Object],
        value: 1 },
     operator: '+',
     right: 
      Node {
        type: 'NumericLiteral',
        start: 19,
        end: 20,
        loc: [Object],
        extra: [Object],
        value: 2 } },
  operator: '+',
  right: 
   Node {
     type: 'NumericLiteral',
     start: 23,
     end: 24,
     loc: SourceLocation { start: [Object], end: [Object] },
     extra: { rawValue: 3, raw: '3' },
     value: 3 } }
```

> 将 const result = 1 + 2 + 3 + 4  ==编译==> const result = 10

```js

const result = 1 + 2

// 抽象语法树的格式(简化版)
type: 'BinaryExpression'
  - left
    type: 'Literal'
  - opeartor: '+'
  - right
    type: 'Literal'

const result = 1 + 2
```

```js
const result = 1 + 2 + 3 + 4

// 抽象语法树的格式(简化版)

type: 'BinaryExpression'
  - left
    - left
      - left
        type: 'Literal'
      - opeartor: '+'
      - right
        type: 'Literal'
    - opeartor: '+'
    - right
      type: 'Literal'
  - opeartor: '+'
  - right
      type: 'Literal'

const result = ((1 + 2) + 3) + 4
const result = ((left + rigth) + right) + right

// 同理我们可以推导出的AST格式
// const result = 1 + 2 + 3 + 4 + 5
const result = (((left + right) + right) + right) + right
```

```js

const t = require('babel-types')

const visitor = {
  BinaryExpression(path) {
    // 二进制表达式节点的子节点
    const node = path.node
    let result = null
    if (t.isNumericLiteral(node.left) && t.isNumericLiteral(node.right)) {
      switch (node.operator) {
        case '+':
          result = node.left.value + node.right.value
          break
        case '-':
          result = node.left.value - node.right.value
          break
        case '*':
          result = node.left.value * node.right.value
          break
        case '/':
          result = node.left.value / node.right.value
          break
      }
    }
    if (result !== null) {
      path.replaceWith(
        t.numericLiteral(result)
      )
    }
  }
}

module.exports = function (bable) {
  return {
    visitor
  }
}
```


