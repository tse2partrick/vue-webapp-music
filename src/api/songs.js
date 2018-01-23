import jsonp from 'common/js/jsonp'

export function getSongs(singerId, beginNum) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
  const songNum = 30
  const data = Object.assign({}, {
    g_tk: 5381,
    jsonpCallback: 'MusicJsonCallbacksinger_track',
    loginUin: 0,
    hostUin: 0,
    format: 'jsonp',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0,
    singermid: singerId,
    order: 'listen',
    begin: 'beginNum',
    num: songNum,
    songstatus: 1
  })

  return jsonp(url, data)
}

export function getLyric(musicId) {
  const url = '/api/getLyric'
  const data = Object.assign({}, {
    base64: 1,
    musicid: musicId,
    callback: 'jsonp1',
    g_tk: 5381,
    jsonpCallback: 'jsonp1',
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