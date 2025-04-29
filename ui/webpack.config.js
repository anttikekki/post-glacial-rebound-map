const path = require("path");

module.exports = {
  entry: "./src/main.ts",
  mode: "development",
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
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
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
