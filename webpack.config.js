module.exports = {
  entry: __dirname + "/src/code.ts", //ビルドするファイル
  output: {
    path: __dirname + "/dist", //ビルドしたファイルを吐き出す場所
    filename: "bundle.js", //ビルドした後のファイル名
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
