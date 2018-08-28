const path = require("path");
const os = require("os");
const cp = require("child_process");

const WebpackBar = require("webpackbar");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HappyPack = require("happypack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const env = process.env.NODE_ENV;
const threads = os.cpus().length;

module.exports = {
  mode: env === "development" ? "development" : "production",
  context: __dirname,
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "bundle-[hash:8].js"
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx", ".css", ".styl"],
    alias: {}
  },
  devtool: "inline-source-map",
  devServer: {
    proxy: {},
    historyApiFallback: true,
    contentBase: path.join(__dirname, "dist"),
    port: 1105,
    after() {
      cp.exec(`start http://localhost:${this.port}`);
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "source-map-loader",
        enforce: "pre"
      },
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.css/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader"]
        })
      },
      {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "stylus-loader"]
        })
      }
    ]
  },
  plugins: [
    new WebpackBar(),
    new HtmlWebpackPlugin({
      title: "Development",
      template: "./src/index.html"
    }),
    new ExtractTextPlugin({
      filename: "style.css",
      allChunks: true
    }),
    new HappyPack({
      id: "js",
      threads: threads,
      loaders: [
        {
          loader: "babel-loader",
          query: {
            presets: ["env"]
          },
          options: {
            // 启用babel缓存,缓存目录node_modules/.cache
            cacheDirectory: true
          }
        }
      ]
    })
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        test: /\.js$/,
        cache: true,
        parallel: threads
      })
    ],
    splitChunks: {
      chunks: "all",
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
