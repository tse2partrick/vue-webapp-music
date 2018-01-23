import {mode} from 'common/js/config'

export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const sequenceList = state => state.sequenceList

export const playMode = state => state.playMode

export const currentIndex = state => state.currentIndex

export const currentSong = (state) => {
  return (state.playMode === mode.random ? state.randomList[state.currentIndex] : state.sequenceList[state.currentIndex]) || {}
}

export const randomList = state => state.randomList

export const disc = state => state.disc

export const topList = state => state.topList

export const quickSearchStr = state => state.quickSearchStr