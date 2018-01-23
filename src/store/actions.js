import * as types from './mutation-types'
import {randomArr} from 'common/js/methods'
import {mode} from 'common/js/config'

export function selectSong({commit, state}, {list, song, index}) {
  let randomList = randomArr(list)
  if (state.playMode === mode.random && song.songId) {
    index = randomList.findIndex((item) => {
      return item.songId === song.songId
    })
  }
  commit(types.SET_PLAYING, true)
  commit(types.SET_FULLSCREEN, true)
  commit(types.SET_RANDOM_LIST, randomList)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_CURRENT_INDEX, index)
}

export function stopPlay({commit, state}) {
  commit(types.SET_PLAYING, false)
  commit(types.SET_FULLSCREEN, false)
  commit(types.SET_RANDOM_LIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, null)
}