import axios from 'axios'
import jsonp from 'common/js/jsonp'

export function getRecommend() {
  const url = '/api/getRecommend'

  const data = Object.assign({}, {
    g_tk: 5381,
    uin: 0,
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'h5',
    needNewCode: 1,
    _: new Date().getTime()
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getRecommendList(start, end) {
  // const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  const url = '/api/getRecommendList'
  const data = Object.assign({}, {
    picmid: 1,
    rnd: Math.random(),
    g_tk: 5381,
    jsonpCallback: 'getPlaylist',
    loginUin: 0,
    hostUin: 0,
    format: 'jsonp',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0,
    categoryId: 10000000,
    sortId: 5,
    sin: start,
    ein: end
  })

  /* return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  }) */

  return jsonp(url, data)
}

export function getDiscDetail(discId) {
  const url = '/api/getDiscDetail'
  const data = Object.assign({}, {
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    disstid: discId,
    format: 'jsonp',
    g_tk: 5381,
    jsonpCallback: 'playlistinfoCallback',
    loginUin: 0,
    hostUin: 0,
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0
  })

  return jsonp(url, data)
}