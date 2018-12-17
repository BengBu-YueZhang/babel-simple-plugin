const babel = require('babel-core')
const plugin = require('./babel.simple')

const codeString = `const result = Math.abs(-1) + Math.PI * 3 + -1 + +1`

const result = babel.transform(codeString, {
  plugins: [
    plugin
  ]
})

