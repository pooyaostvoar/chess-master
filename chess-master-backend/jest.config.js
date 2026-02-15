const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.test.json");

const baseConfig = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        isolatedModules: true,
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: "<rootDir>/",
  }),
};

module.exports = {
  projects: [
    {
      ...baseConfig,
      displayName: "unit",
      testMatch: ["**/tests/unit/**/*.test.ts"],
      // No setup - pure unit tests (geoblock, etc.)
    },
    {
      ...baseConfig,
      displayName: "integration",
      setupFilesAfterEnv: ["./tests/setup.ts"],
      testMatch: ["**/*.test.ts", "**/*.int.test.ts"],
      testPathIgnorePatterns: ["/node_modules/", "/tests/unit/"],
    },
  ],
};
