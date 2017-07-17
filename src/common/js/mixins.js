import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/song'
import Singer from 'common/js/singer'

export const playListMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted() {
    this.playListHandler(this.playList)
  },
  activated() {
    this.playListHandler(this.playList)
  },
  watch: {
    playList(newPlayList) {
      this.playListHandler(newPlayList)
    }
  },
  methods: {
    playListHandler() {
      throw new Error('playListHandler must be implement')
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'mode',
      'currentSong',
      'playList'
    ])
  },
  methods: {
    changeMode() {
      let mode = (this.mode + 1) % 3
      let list
      let index
      this.setMode(mode)
      if (this.mode === playMode.random) {
        list = shuffle(this.playList)
        index = list.findIndex((item) => {
          return item.songid === this.currentSong.songid
        })
      } else {
        list = this.sequenceList
        index = this.sequenceList.findIndex((item) => {
          return item.songid === this.currentSong.songid
        })
      }

      this.setPlayList(list)
      this.setCurrentIndex(index)
    },
    ...mapMutations({
      'setMode': 'SET_MODE',
      'setPlayList': 'SET_PLAY_LIST',
      'setCurrentIndex': 'SET_CURRENT_INDEX'
    })
  }
}

export const searchMixin = {
  data() {
    return {
      query: ''
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    onBeforeScrollStart() {
      this.$refs.searchBox.blur()
    },
    onSelect(item) {
      if (item.type === 'isSinger') {
        this.$router.push({
          path: `/search/${item.singermid}`
        })
        localStorage.setItem('referer', 'search')
        this.sSearchHistory(item.singername)
        this.setSinger(new Singer(item.singermid, item.singername))
      } else {
        this.selectPlay(item)
        this.sSearchHistory(item.songname)
      }
    },
    onSearchQuery(query) {
      this.query = query
    },
    addQuery(query) {
      this.$refs.searchBox.addQuery(query)
    },
    onDeleteOne(item) {
      this.dSearchHistory(item)
    },
    ...mapMutations({
      'setSinger': 'SET_SINGER'
    }),
    ...mapActions([
      'selectPlay',
      'sSearchHistory',
      'dSearchHistory'
    ])
  }
}