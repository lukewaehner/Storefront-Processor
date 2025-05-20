/* eslint-env node */
const { resolve } = require("path");
const { BannerPlugin, DefinePlugin } = require("webpack");

module.exports = function (options) {
  const nodeEnv = process.env.NODE_ENV || "development";

  return {
    ...options,
    target: "node",
    mode: nodeEnv,
    entry: ["./src/main.ts"],
    output: {
      library: {
        type: "commonjs2",
      },
      path: resolve(process.cwd(), "dist"),
      filename: "main.js",
    },
    resolve: {
      ...options.resolve,
      extensions: [".ts", ".js", ".json"],
      modules: [resolve(process.cwd(), "src"), "node_modules"],
    },
    module: {
      ...options.module,
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: "CommonJS",
              },
            },
          },
          exclude: /node_modules/,
        },
        ...options.module.rules.filter((rule) => {
          return !rule.test || !rule.test.toString().includes("ts");
        }),
      ],
    },
    plugins: [
      ...options.plugins,
      new BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false,
      }),
      new DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(nodeEnv),
      }),
    ],
    experiments: {
      outputModule: false,
    },
    externalsPresets: { node: true },
    optimization: {
      minimize: false,
    },
  };
};
