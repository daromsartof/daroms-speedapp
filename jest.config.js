const fs = require('node:fs')
const path = require('node:path')

const darOmsJest = require('./packages/config/jest')

module.exports = darOmsJest({
  roots: ['packages', 'modules'].filter((d) => fs.existsSync(path.join(__dirname, d))).map((d) => `<rootDir>/${d}`),
})
