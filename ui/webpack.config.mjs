import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";

export default (env, argv) => {
  return {
    entry: {
      root: "./src/index.ts",
      map: "./src/map/map.ts",
    },
    mode: argv.mode || "development",
    plugins: [
      new webpack.DefinePlugin({
        "process.env.MAANNOUSU_API": JSON.stringify(process.env.MAANNOUSU_API),
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
      }),
      new HtmlWebpackPlugin({
        template: "src/index.ejs",
        filename: "index.html",
        excludeChunks: ["map"],
      }),
      new HtmlWebpackPlugin({
        template: "src/map/map.ejs",
        filename: "map.html",
        excludeChunks: ["root"],
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
          use: [
            MiniCssExtractPlugin.loader, // Extract CSS to separate files
            "css-loader",
          ],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    // Hide chunk size warnings on "npm run start:prod"
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          // Make sure that Bootstrap CSS is shared between entrypoints
          bootstrap: {
            test: /[\\/]node_modules[\\/]bootstrap[\\/]/,
            name: "bootstrap",
            chunks: "all",
            enforce: true,
          },
        },
      },
    },
    output: {
      filename: "[name]-[contenthash].js",
      path: path.resolve(
        __dirname,
        "../infra/post-glacial-rebound-worker/public"
      ),
      clean: true,
    },
  };
};
