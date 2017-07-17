import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

export function getHotKey() {
  let url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
  let data = Object.assign({}, commonParams, {
    uin: 0,
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

export function search(query, page, perPage) {
  let url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  let data = Object.assign({}, commonParams, {
    uin: 0,
    platform: 'h5',
    needNewCode: 1,
    w: query,
    zhidaqu: 1,
    catZhida: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage: perPage,
    n: perPage,
    p: page,
    remoteplace: 'txt.mqq.all'
  })

  return jsonp(url, data, options)
}