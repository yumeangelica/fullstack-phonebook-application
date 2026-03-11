const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './client',
    output: {
      path: `${__dirname}/build`,
      filename: isProduction ? '[name].[contenthash].js' : 'main.js',
      publicPath: '/',
      clean: true,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    optimization: {
      splitChunks: isProduction ? {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      } : undefined,
    },
    devServer: {
      historyApiFallback: true,
      port: 3000,
      proxy: [
        {
          context: ['/api', '/health', '/ready', '/live'],
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
      ],
      open: true,
      hot: true,
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: './index.html',
      }),
    ],
  };
};
