import {mode} from 'common/js/config'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  sequenceList: [],
  randomList: [],
  playMode: mode.sequence,
  currentIndex: -1,
  disc: {},
  topList: [],
  quickSearchStr: ''
}

export default state