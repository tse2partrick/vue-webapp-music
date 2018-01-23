'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const app = require('express')()
const axios = require('axios')

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    },
    before(app) {
      app.get('/api/getRecommend', function (req, res) {
        const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
        axios.get(url, {
          headers: {
            referer: 'https://m.y.qq.com/',
            host: 'm.y.qq.com',
            origin: 'https://m.y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.json(response.data)
        }).catch((e) => {
          console.log(e)
        })
      })

      app.get('/api/getRecommendList', (req, res) => {
        const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'

        axios.get(url, {
          headers: {
            host: 'y.qq.com',
            origin: 'http://y.qq.com',
            referer: 'http://y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.send(response.data)
        }).catch((e) => {
          console.log(e)
        })
      })

      app.get('/api/getLyric', (req, res) => {
        axios.get('https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg', {
          headers: {
            host: 'y.qq.com',
            origin: 'http://y.qq.com',
            referer: 'http://y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.send(response.data)
        }).catch((e) => {
          console.log(e)
        })
      })

      app.get('/api/getRankList', (req, res) => {
        const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_opt.fcg'
        axios.get(url, {
          headers: {
            host: 'y.qq.com',
            origin: 'http://y.qq.com',
            referer: 'http://y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.send(response.data)
        }).catch((err) => {
          console.log(err)
        })
      })

      app.get('/api/getDiscDetail', (req, res) => {
        const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
        axios.get(url, {
          headers: {
            host: 'y.qq.com',
            origin: 'http://y.qq.com',
            referer: 'http://y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.send(response.data)
        }).catch((err) => {
          console.log(err)
        })
      })

      app.get('/api/getSearchRes', (req, res) => {
        const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
        axios.get(url, {
          headers: {
            host: 'y.qq.com',
            origin: 'http://y.qq.com',
            referer: 'http://y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.send(response.data)
        }).catch((err) => {
          console.log(err)
        })
      })
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
