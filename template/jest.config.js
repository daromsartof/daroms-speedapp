const darOmsJest = require('@daroms/config/jest')

module.exports = darOmsJest({
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1', '^~/(.*)$': '<rootDir>/$1' },
})
