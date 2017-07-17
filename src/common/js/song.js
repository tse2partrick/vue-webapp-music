import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'
export default class Song {
  constructor({songid, songname, albumid, albumname, albumimage, singer, duration, url}) {
    this.songid = songid
    this.songname = songname
    this.albumid = albumid
    this.albumname = albumname
    this.albumimage = albumimage
    this.singer = singer
    this.duration = duration
    this.url = url
  }

  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.songid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

export function createSong(musicData) {
  return new Song({
    songid: musicData.songmid,
    songname: musicData.songname,
    albumid: musicData.albummid,
    albumname: musicData.albumname,
    albumimage: `http://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    singer: filter(musicData.singer),
    duration: musicData.interval,
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
  })
}

export function filter(singer) {
  let ret = []
  singer.forEach((item) => {
    ret.push(item.name)
  })

  return ret.join('/')
}

export function shuffle(list) {
  let _list = list.slice()
  _list.sort(() => {
    return Math.random() > 0.5 ? 1 : -1
  })

  return _list
}