var express = require('express')
var compression = require('compression')
var config = require('./config/index')
var axios = require('axios')

var port = process.env.PORT || config.build.port || 9000

var app = express()

var apiRoutes = express.Router()

apiRoutes.get('/getRecommend', function (req, res) {
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

apiRoutes.get('/getRecommendList', (req, res) => {
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

apiRoutes.get('/getLyric', (req, res) => {
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

apiRoutes.get('/getRankList', (req, res) => {
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

apiRoutes.get('/getDiscDetail', (req, res) => {
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

apiRoutes.get('/getSearchRes', (req, res) => {
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

app.use('/api', apiRoutes)

app.use(compression())

app.use(express.static('./dist'))

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})