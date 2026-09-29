// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// Imports flow one way: lib / components → features → app. A feature never
// imports another feature — what two tabs share belongs in lib or
// components/ui. Adding a folder under src/features means adding it here.
const FEATURES = ["auth", "home", "journal", "plan", "my"];

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
