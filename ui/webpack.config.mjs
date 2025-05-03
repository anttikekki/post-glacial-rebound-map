import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import webpack from "webpack";

export default (env, argv) => {
  return {
    entry: "./src/main.ts",
    mode: argv.mode || "development",
    plugins: [
      new webpack.DefinePlugin({
        "process.env.MAANNOUSU_API": JSON.stringify(process.env.MAANNOUSU_API),
      }),
    ],
    devtool: "source-map",
    devServer: {
      static: path.resolve(__dirname, "public"),
      port: 8080,
      open: true,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
  };
};
