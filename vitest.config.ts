import { defineConfig } from "vitest/config";
import {
  vitestSetupFilePath,
  getClarinetVitestsArgv,
} from "@stacks/clarinet-sdk/vitest";

/*
  Clarity contract tests run against an in-process simnet (no clarinet binary needed).
  The `simnet` global and custom matchers (toBeOk, toBeUint, ...) are provided by the
  clarinet vitest environment + setup file.
*/
export default defineConfig({
  test: {
    environment: "clarinet",
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    include: ["tests/**/*.test.ts"],
    setupFiles: [vitestSetupFilePath],
    environmentOptions: {
      clarinet: {
        ...getClarinetVitestsArgv(),
      },
    },
  },
});
