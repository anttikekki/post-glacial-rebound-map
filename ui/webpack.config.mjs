import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";

export default (env, argv) => {
  return {
    entry: "./src/main.ts",
    mode: argv.mode || "development",
    plugins: [
      new webpack.DefinePlugin({
        "process.env.MAANNOUSU_API": JSON.stringify(process.env.MAANNOUSU_API),
      }),
      new HtmlWebpackPlugin({
        template: "src/index.ejs",
        filename: "index.html",
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
    performance: {
      maxAssetSize: 1000000, // 1000 KiB (default is 250 KiB)
      maxEntrypointSize: 1000000, // 1000 KiB (default is 250 KiB)
    },
    optimization: {
      splitChunks: {
        chunks: "all",
        minSize: 100000, // Minimum size for splitting (100 KiB)
      },
    },
    output: {
      filename: "[name]-[contenthash].js",
      path: path.resolve(__dirname, "public"),
      clean: true,
    },
  };
};
