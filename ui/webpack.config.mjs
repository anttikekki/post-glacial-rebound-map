import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languages = ["fi", "en", "sv"];
const pages = ["index", "map"];

function generateEntryHtmlPlugins() {
  const plugins = [];
  for (const page of pages) {
    for (const lang of languages) {
      const translations = JSON.parse(
        fs.readFileSync(`./src/translations/${lang}.json`, "utf8")
      );
      const filenameLangSuffix = lang === "fi" ? "" : `_${lang}`;

      plugins.push(
        new HtmlWebpackPlugin({
          template: `src/${page}.ejs`,
          filename: `${page}${filenameLangSuffix}.html`,
          chunks: [page],
          templateParameters: {
            lang,
            translations,
          },
          templateOptions: { root: path.resolve(__dirname, "src") },
        })
      );
    }
  }
  return plugins;
}

export default (env, argv) => {
  return {
    entry: {
      index: "./src/index.ts",
      map: "./src/map.ts",
    },
    mode: argv.mode || "development",
    plugins: [
      new webpack.DefinePlugin({
        "process.env.MAANNOUSU_API_BASE_URL": JSON.stringify(
          process.env.MAANNOUSU_API_BASE_URL
        ),
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
      }),
      ...generateEntryHtmlPlugins(),
      new CopyWebpackPlugin({
        patterns: [{ from: "src/images", to: "images" }],
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
        {
          test: [/\.svg$/, /\.woff(2?)$/, /\.ttf$/, /\.eot$/],
          type: "asset/resource",
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
      assetModuleFilename: "fonts/[name][ext]",
      clean: true,
    },
  };
};
