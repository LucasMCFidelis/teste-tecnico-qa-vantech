import { createDefaultPreset } from 'ts-jest'

const tsJestTransformCfg = createDefaultPreset().transform

/** @type {import("jest").Config} **/
export default {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: ['./src/**/*'],
  coveragePathIgnorePatterns: [
    './src/generated',
    './src/tests',
    './src/types',
    './src/schemas/error.schema.ts',
    './src/schemas/health.schema.ts',
    './src/plugins/swagger.ts',
    './src/index.ts',
    './src/lib/prisma.ts',
    './src/utils/swagger.tags.ts',
    './src/routes',
  ],
  coverageThreshold: {
    global: {
      statements: 65,
      branches: 55,
      functions: 60,
      lines: 65,
    },
    './src/services/**/*.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/utils/security/**/*.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/utils/errors/**/*.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
}
