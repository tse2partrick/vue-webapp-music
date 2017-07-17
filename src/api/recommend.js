import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

export function getSlider() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

export function getHotDiss() {
  let url = 'https://c.y.qq.com/v8/fcg-bin/fcg_first_yqq.fcg'
  let data = Object.assign({}, commonParams, {
    tpl: 'v12',
    page: 'other',
    loginUin: 0,
    hostUin: 0,
    notice: 0,
    platform: 'yqq',
    needNewCode: 0
  })

  return jsonp(url, data, options)
}

export function getDissInfo(dissId) {
  let url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  let data = Object.assign({}, {
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    disstid: dissId,
    format: 'jsonp',
    g_tk: 5381,
    loginUin: 0,
    hostUin: 0,
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0
  })
  let opts = {
    param: 'jsonpCallback',
    prefix: '',
    name: 'playlistinfoCallback'
  }

  return jsonp(url, data, opts)
}