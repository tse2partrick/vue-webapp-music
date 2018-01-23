import * as types from './mutation-types'

const mutations = {
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  },

  [types.SET_PLAYING](state, flag) {
    state.playing = flag
  },

  [types.SET_FULLSCREEN](state, flag) {
    state.fullScreen = flag
  },

  [types.SET_RANDOM_LIST](state, list) {
    state.randomList = list
  },

  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
  },

  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  },

  [types.SET_PLAY_MODE](state, mode) {
    state.playMode = mode
  },

  [types.SET_DISC](state, disc) {
    state.disc = disc
  },

  [types.SET_TOP_LIST](state, topList) {
    state.topList = topList
  },

  [types.SET_QUICK_SEARCH_STR](state, str) {
    state.quickSearchStr = str
  }
}

export default mutations