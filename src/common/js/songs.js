export default class Songs {
  constructor({songId, songName, albumName, singer, interval, img, url}) {
    this.songId = songId
    this.songName = songName
    this.albumName = albumName
    this.singer = this._getSingerName(singer)
    this.interval = interval
    this.img = img
    this.url = url
  }

  _getSingerName(singerArr) {
    let ret = []
    singerArr.forEach((i) => {
      ret.push(i.name)
    })

    return ret.join('/')
  }
}

export function createSong(musicData) {
  return new Songs({
    songId: musicData.songid,
    songName: musicData.songname,
    albumName: musicData.albumname,
    singer: musicData.singer,
    interval: musicData.interval,
    img: `http://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=38`
  })
}