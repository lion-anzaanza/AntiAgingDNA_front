// https://docs.expo.dev/guides/using-eslint/
const fs = require('fs');
const path = require('path');
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// Imports flow one way: lib / components → features → app. A feature never
// imports another feature — what two tabs share belongs in lib or
// components/ui. Every folder under src/features is a feature — read from
// disk, so a new tab is fenced in the moment it exists (a hand-kept list left
// new folders unchecked until someone remembered to add them).
const FEATURES = fs
  .readdirSync(path.join(__dirname, "src/features"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            ...FEATURES.map((name) => ({
              target: `./src/features/${name}`,
              from: "./src/features",
              except: [`./${name}`],
              message: "A feature may not import another feature. Move what they share into src/lib or src/components/ui.",
            })),
            {
              target: "./src/features",
              from: "./src/app",
              message: "src/app only declares routes; features must not depend on it.",
            },
            {
              target: ["./src/lib", "./src/components"],
              from: ["./src/features", "./src/app"],
              message: "Shared code must not depend on a feature or a route.",
            },
          ],
        },
      ],
    },
  },
]);
