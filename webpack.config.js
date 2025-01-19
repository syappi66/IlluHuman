const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  mode: "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 8080,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "resources",
          to: "resources",
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(gltf|glb)$/,
        type: "asset/resource",
      },
    ],
  },
};
