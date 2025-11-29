module.exports = {
  preset: "ts-jest/presets/default-esm", // better for modern ts + modules
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testMatch: ["**/*.test.ts", "**/*.int.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
};
