import {Base64} from 'js-base64'

export function randomArr(array) {
  let ret = array.slice(0)
  return ret.sort((x, y) => {
    return Math.random() > 0.5 ? 1 : 0
  })
}

export function decodeBase64(str) {
  return Base64.decode(str)
}

export function normalizeLyric(lyricStr) {
  let r = new RegExp('\\[.*\\]', 'ig')
  let time = lyricStr.match(r)
  let lyric = (lyricStr.replace(r, '')).split('\n')
  let t = []
  let nt = []
  for (let i = 0; i < time.length; i++) {
    let minute = (time[i].split(':')[0]).substr(1)
    let second = time[i].split(':')[1]
    let ret = parseInt(minute) * 60 + parseFloat(second)

    t.push(ret)
  }
  for (let i = 0; i < t.length; i++) {
    let item = t[i]
    let nextItem = t[i + 1] || ''
    if (nextItem) {
      item = parseFloat(nextItem - item)
    } else {
      item = 0
    }
    nt.push(item)
  }
  t = t.slice(5)
  lyric = lyric.slice(5)
  nt = nt.slice(5)
  for (let i = 0; i < lyric.length; i++) {
    if (!lyric[i]) {
      t[i] = ''
    }
  }
  let _lyric = []
  let _time = []
  let _nt = []
  lyric.forEach((i, index) => {
    if (i) {
      _lyric.push(i)
      _time.push(t[index])
      _nt.push(nt[index])
    }
  })

  return {_lyric, _time, _nt}
}