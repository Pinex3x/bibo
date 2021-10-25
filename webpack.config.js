const projectName = 'bibo'
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: { bibo: './src/js/index.js' },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              //=>转换的语法预设（ES6->ES5）
              presets: ['@babel/preset-env'],
              //=>基于插件处理ES6/ES7中CLASS的特殊语法
              plugins: [
                [
                  '@babel/plugin-proposal-decorators',
                  {
                    legacy: true,
                  },
                ],
                [
                  '@babel/plugin-proposal-class-properties',
                  {
                    loose: true,
                  },
                ],
                '@babel/plugin-transform-runtime',
              ],
            },
          },
        ],
        //=>设置编译时忽略的文件和指定编译目录
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '哔啵哔啵 (〃∀〃)~ -bibobibo',
      filename: `${projectName}.html`,
      template: `./index.html`,
      minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: false,
      },
    }),
    new CleanWebpackPlugin(),
  ],
}
