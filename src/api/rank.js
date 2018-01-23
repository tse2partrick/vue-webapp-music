import jsonp from 'common/js/jsonp'

export function getRankList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_opt.fcg'
  const data = Object.assign({}, {
    page: 'index',
    format: 'html',
    tpl: 'macv4',
    v8debug: 1,
    jsonpCallback: 'jsonCallback'
  })

  return jsonp(url, data)
}

export function getRankDetail(topId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
  /* let d = new Date()
  let month = String(d.getMonth()).length === 1 ? `0${d.getMonth() + 1}` : d.getMonth() + 1
  let today = `${d.getFullYear()}-${month}-${d.getDate() - 1}` */
  const data = Object.assign({}, {
    tpl: 3,
    page: 'detail',
    // date: today,
    topid: topId,
    type: 'top',
    song_begin: 0,
    song_num: 100,
    g_tk: 5381,
    jsonpCallback: 'MusicJsonCallbacktoplist',
    loginUin: 0,
    hostUin: 0,
    format: 'jsonp',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0
  })

  return jsonp(url, data)
}