import axios from 'axios'
import {commonParams} from './config'

export function getLyric(songId) {
  let url = '/api/lyric'
  let data = Object.assign({}, commonParams, {
    callback: 'MusicJsonCallback_lrc',
    pcachetime: new Date().getTime(),
    songmid: songId,
    jsonpCallback: 'MusicJsonCallback_lrc',
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}