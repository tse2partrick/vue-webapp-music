import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/song'
import {filter} from 'common/js/util'
import {deleteSearchHistory, saveSearchHistory, savePlayHistory} from 'common/js/cache'

function _findIndex(list, song) {
  return list.findIndex((item) => {
    return item.songid === song.songid
  })
}

// selectPlay有点问题。。。
/* export function selectPlay({commit, state}, song) {
  commit(types.SET_PLAYING, true)
  commit(types.SET_FULL_SCREEN, true)

  // 播放列表始终保留sequenceList总是原封不动
  const sequenceList = state.sequenceList.slice()

  // 选择播放只播放一首歌，不添加全部歌曲
  let list = [song]

  // normalList是不变的，即sequenceList添加新增歌曲后的列表
  let normalList = filter(sequenceList.concat(list))

  let index
  // 如果随机播放
  if (state.mode === playMode.random) {
    // 点击的时候自动打乱播放列表，原来的播放列表加上新增的列表，加上后去除相同歌曲
    let randomList = shuffle(filter(state.playList.concat(list)))

    // 设置currentIndex跟踪当前歌曲的位置
    index = _findIndex(randomList, song) >= 0 ? _findIndex(randomList, song) : randomList.length - 1
    commit(types.SET_PLAY_LIST, randomList)
    commit(types.SET_SEQUENCE_LIST, normalList)
  } else {
    // index = _findIndex(normalList, list[index])
    index = _findIndex(normalList, song) >= 0 ? _findIndex(normalList, song) : normalList.length - 1
    commit(types.SET_PLAY_LIST, normalList)
  }

  commit(types.SET_SEQUENCE_LIST, normalList)
  commit(types.SET_CURRENT_INDEX, index)
} */

export function selectPlay({commit, state}, song) {
  let normalList = filter(state.sequenceList.slice().concat([song]))
  let index = _findIndex(normalList, song)
  let randomList
  if (state.mode === playMode.random) {
    randomList = shuffle(normalList)
    index = _findIndex(randomList, song)
  }

  commit(types.SET_FULL_SCREEN, false)
  commit(types.SET_PLAYING, true)
  commit(types.SET_SEQUENCE_LIST, normalList)
  commit(types.SET_CURRENT_INDEX, index)
  randomList ? commit(types.SET_PLAY_LIST, randomList) : commit(types.SET_PLAY_LIST, normalList)
}
export function selectPlayAll({commit, state}, {list}) {
  let normalList = filter(state.sequenceList.slice().concat(list))
  /* let index = state.playList.length ? _findIndex(normalList, list[state.currentIndex]) : _findIndex(normalList, list[0]) */
  let index
  // 如果已经有歌曲正在播放中，不要打断它，让它继续播放
  if (!state.playList.length) {
    index = _findIndex(normalList, list[0])
    commit(types.SET_CURRENT_INDEX, index)
  }
  let randomList
  if (state.mode === playMode.random) {
    let randomIndex = Math.ceil(Math.random() * 10)
    randomList = shuffle(normalList)
    index = _findIndex(randomList, list[randomIndex])
    commit(types.SET_CURRENT_INDEX, index)
  }

  commit(types.SET_FULL_SCREEN, false)
  commit(types.SET_PLAYING, true)
  commit(types.SET_SEQUENCE_LIST, normalList)
  // commit(types.SET_CURRENT_INDEX, index)
  randomList ? commit(types.SET_PLAY_LIST, randomList) : commit(types.SET_PLAY_LIST, normalList)
}
// 封印播放全部。。
/* export function randomPlay({commit, state}, {list}) {
  // sequenceList总是原封不动
  let sequenceList = state.sequenceList.slice()

  // 不影响list
  let normalList = filter(sequenceList.concat(list))
  console.log(normalList)
  // 返回第一首此歌手名称的歌曲index
  let randomList = shuffle(normalList)

  let randomNum = Math.ceil(Math.random() * 10)
  let index = randomList.findIndex((item) => {
    return item.songname === list[randomNum].songname
  })
  console.log(index)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_PLAYING, true)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAY_LIST, randomList)
  commit(types.SET_SEQUENCE_LIST, normalList)
  commit(types.SET_MODE, playMode.random)
} */

/* export function insertSong({commit, state}, song) {
  // 副本不影响原来的playList
  let list = state.sequenceList.slice()
  let randomList

  // 新添加的歌曲总是放在最后一首
  let currentIndex = list.length

  // 判断之前有无这首歌
  let fpIndex = _findIndex(list, song)

  // 如果有歌曲就splice掉，currentIndex因为歌曲长度没变所以要-1
  if (fpIndex > -1) {
    list.splice(fpIndex, 1)
    currentIndex--
  }

  // 如果模式是随机播放，则将之前的播放列表拿过来，再加上一首歌
  if (state.mode === playMode.random) {
    randomList = state.playList.slice()
    randomList.push(song)
  } else {
    randomList = list
  }

  // 添加到播放队列尾部
  list.push(song)

  console.log(currentIndex)
  commit(types.SET_PLAY_LIST, randomList)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_PLAYING, true)
  commit(types.SET_FULL_SCREEN, true)
} */

export function sSearchHistory({commit}, val) {
  commit(types.SET_SEARCH_HISTORY, saveSearchHistory(val))
}

export function dSearchHistory({commit}, val) {
  commit(types.SET_SEARCH_HISTORY, deleteSearchHistory(val))
}

export function delSong({commit, state}, val) {
  if (!val) {
    commit(types.SET_PLAYING, false)
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAY_LIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    return
  }

  let arr = state.playList.slice()
  let index = _findIndex(arr, val)
  let currentIndex = state.currentIndex
  arr.splice(index, 1)

  if (arr.length <= 0) {
    commit(types.SET_PLAY_LIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    return
  } else {
    if (currentIndex === index) {
      currentIndex = index
    }
    if (currentIndex > index) {
      currentIndex--
    }
  }
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_PLAY_LIST, arr)
  commit(types.SET_SEQUENCE_LIST, arr)
}

export function sPlayHistory({commit, state}, val) {
  commit(types.SET_PLAY_HISTORY, savePlayHistory(val))
}