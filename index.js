const t = require('babel-types')

const visitor = {
  // 二元表达式类型节点的访问者
  BinaryExpression(path) { 
    // 子节点
    // 访问者会一层层遍历AST抽象语法树, 会树形遍历AST的BinaryExpression类型的节点
    const childNode = path.node
    let result = null
    if (
      t.isNumericLiteral(childNode.left) &&
      t.isNumericLiteral(childNode.right)
    ) {
      const operator = childNode.operator
      switch (operator) {
        case '+':
          result = childNode.left.value + childNode.right.value
          break
        case '-':
          result = childNode.left.value - childNode.right.value
          break
        case '/':
          result = childNode.left.value / childNode.right.value
          break
        case '*':
          result = childNode.left.value * childNode.right.value
          break
      }
    }
    if (result !== null) {
      // 替换本节点为数字类型
      path.replaceWith(
        t.numericLiteral(result)
      )
      if (path.parentPath) {
        const parentType = path.parentPath.type
        if (visitor[parentType]) {
          visitor[parentType](path.parentPath)
        }
      }
    }
  },
  // 属性表达式
  MemberExpression(path) {
    const childNode = path.node
    let result = null
    if (
      t.isIdentifier(childNode.object) &&
      t.isIdentifier(childNode.property) &&
      childNode.object.name === 'Math'
    ) {
      result = Math[childNode.property.name]
    }
    if (result !== null) {
      const parentType = path.parentPath.type
      if (parentType !== 'CallExpression') {
        // 替换本节点为数字类型
        path.replaceWith(
          t.numericLiteral(result)
        )
        if (visitor[parentType]) {
          visitor[parentType](path.parentPath)
        }
      }
    }
  },
  // 一元表达式
  UnaryExpression (path) {
    const childNode = path.node
    let result = null
    if (
      t.isLiteral(childNode.argument)
    ) {
      const operator = childNode.operator
      switch (operator) {
        case '+':
          result = childNode.argument.value
          break
        case '-':
          result = -childNode.argument.value
          break
      }
    }
    if (result !== null) {
      // 替换本节点为数字类型
      path.replaceWith(
        t.numericLiteral(result)
      )
      if (path.parentPath) {
        const parentType = path.parentPath.type
        if (visitor[parentType]) {
          visitor[parentType](path.parentPath)
        }
      }
    }
  },
  // 函数执行表达式
  CallExpression(path) {
    const childNode = path.node
    // 结果
    let result = null
    // 参数的集合
    let args = []
    // 获取函数的参数的集合
    args = childNode.arguments.map(arg => {
      if (t.isUnaryExpression(arg)) {
        return arg.argument.value
      }
    })
    if (
      t.isMemberExpression(childNode.callee)
    ) {
      if (
        t.isIdentifier(childNode.callee.object) &&
        t.isIdentifier(childNode.callee.property) &&
        childNode.callee.object.name === 'Math'
      ) {
        result = Math[childNode.callee.property.name].apply(null, args)
      }
    }
    if (result !== null) {
      // 替换本节点为数字类型
      path.replaceWith(
        t.numericLiteral(result)
      )
      if (path.parentPath) {
        const parentType = path.parentPath.type
        if (visitor[parentType]) {
          visitor[parentType](path.parentPath)
        }
      }
    }
  }
}

module.exports = function () {
  return {
    visitor
  }
}