import {playMode} from 'common/js/config'
import storage from 'good-storage'
const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playList: [],
  sequenceList: [],
  currentIndex: -1,
  mode: playMode.sequence,
  diss: {},
  topList: {},
  searchHistory: storage.get('searchHistoryArr', []),
  playHistory: storage.get('playHistoryArr', []),
  favoriteList: []
}

export default state