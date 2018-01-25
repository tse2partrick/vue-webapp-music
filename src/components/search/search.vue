<template>
  <div class="search" ref="search">
    <div class="search-box" ref="searchBox">
      <search-box :search-key="searchKey" @search="onSearch" @noneContent="onNoneContent" :un-focus="unFocus" @onFocus="onFocus"></search-box>
    </div>
    <scroll class="results" ref="resultsScroll" v-show="searching || songs.length" :data="songs" :probe-type="probeType" @scrollToEnd="onScrollToEnd" :pull-up="pullUp" :before-scroll="beforeScroll" @beforeScrollStart="onBeforeScrollStart">
      <ul>
        <li class="singer" v-if="singer.id" @click="onSelectSinger">
          <div class="image">
            <img class="img" ref="image" width="100%" height="100%" :src="singer.avatar" @error.once="onImgError" />
          </div>
          <div class="text-wrapper">
            <span class="text text-singer" v-html="singer.name"></span>
            <span class="text text-desc">{{getSingerInfo}}</span>
          </div>
        </li>
        <li class="song" v-for="(song, index) in songs" @click="selectPlay(song, index)">
          <div class="icon">
            <i class="icon-music"></i>
          </div>
          <div class="text-wrapper">
            <span class="text">{{getSongDesc(song)}}</span>
          </div>
        </li>
        <loading v-show="hasMore"></loading>
        <no-more v-show="!hasMore"></no-more>
      </ul>
    </scroll>
    <div class="no-result" v-show="noResult">搜索失败，没有找到关于"{{content}}"的内容...</div>
    <div class="hot-search" ref="hotSearch" v-show="hotList.length">
      <h2 class="title">热门搜索</h2>
      <span class="item" v-for="item in hotList" @click="selectSearch(item.k)">{{item.k}}</span>
    </div>
    <div class="search-history" ref="searchHistory" v-show="history.length">
      <div class='top'>
        <h2 class="title">搜索历史</h2>
        <div class="icon" @click="confirmDeleteHisAll">
          <i class="icon-clear"></i>
        </div>
      </div>
      <scroll class="content" ref="historyScroll" :data="history">
        <ul>
          <li class="item" v-for="item in history" @click="selectSearch(item)">
           <span class="text">{{item}}</span>
           <div class="icon" @click.stop="onDeleteHisOne(item)">
             <i class="icon-delete"></i>
           </div>
         </li>
        </ul>
      </scroll>
    </div>
    <confirm :title="confirmTitle" :show="confirmShow" @sure="onConfirmSure" @cancel="onConfirmCancel"></confirm>
  </div>
</template>

<script>
  import SearchBox from 'base/search-box/search-box'
  import {getSearchRes, getHotKeys} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/songs'
  import Singer from 'common/js/singer'
  import Scroll from 'base/scroll/scroll'
  import defaultPng from './default.png'
  import {mapActions, mapGetters, mapMutations} from 'vuex'
  import {HOT_KEY_LENGTH} from 'common/js/config'
  import {S, SEARCH_HISTORY} from 'common/js/localStorage'
  import Confirm from 'base/confirm/confirm'
  import Loading from 'base/loading/loading'
  import NoMore from 'base/no-more/no-more'
  import {playingMixin} from 'common/js/mixin'

  export default {
    mixins: [playingMixin],
    data() {
      return {
        songs: [],
        singer: {},
        hotList: [],
        history: [],
        searchKey: '',
        confirmShow: false,
        confirmTitle: '您确定要清空搜索历史么？',
        searching: false,
        hasMore: true,
        noResult: false,
        unFocus: false
      }
    },
    created() {
      this._initData()
      this._getHotKeys()
      this._showSearchKey()
      this._initScroll()
    },
    mounted() {
      setTimeout(() => {
        this._setResultsHeight()
      }, 2000)
    },
    deactivated() {
      clearTimeout(this._setHistoryHeightTimer)
      this.onNoneContent()
    },
    computed: {
      getSingerInfo() {
        return `单曲：${this.singer.songnum}  专辑：${this.singer.albumnum}`
      },
      ...mapGetters([
        'quickSearchStr'
      ])
    },
    methods: {
      onFocus() {
        this.unFocus = false
      },
      onBeforeScrollStart() {
        this.unFocus = true
      },
      onSelectSinger() {
        this.setSinger(this.singer)
        this.$router.push({
          path: `/singer/${this.singer.id}`
        })
      },
      onScrollToEnd() {
        if (this.searching) {
          console.log('seaching ...')
          return
        }
        if (this.page <= this.totalPage) {
          this.isMoreSearch = true
          this.searching = true
          this._getSearchRes(this.content, this.page, this.isMoreSearch)
        }
      },
      selectSearch(item) {
        this.searchKey = item
      },
      onConfirmCancel() {
        this.confirmShow = false
      },
      onConfirmSure() {
        this.onDeleteHisAll()
        this.confirmShow = false
      },
      onDeleteHisAll() {
        S.set(SEARCH_HISTORY, [])
        this._showSearchKey()
      },
      onDeleteHisOne(item) {
        let history = S.get(SEARCH_HISTORY)
        let i = history.findIndex((r) => {
          return String(r) === String(item)
        })

        history.splice(i, 1)
        S.set(SEARCH_HISTORY, history)
        this._showSearchKey()
        this.$refs.historyScroll._refresh()
      },
      selectPlay(song, index) {
        this.selectSong({
          list: this.songs,
          song,
          index
        })
      },
      onNoneContent() {
        this._initData()
        this.songs = []
        this.singer = {}
        this.searching = false
        this.noResult = false
        this.hasMore = true
        this.searchKey = ''
      },
      onImgError() {
        this.$refs.image.setAttribute('src', defaultPng)
      },
      getSongDesc(song) {
        return `${song.songName} - ${song.singer}`
      },
      onSearch(content) {
        this._initData()
        this.content = content
        this.searching = true
        this._saveSearchKey()
        this._showSearchKey()
        this._getSearchRes(this.content, this.page, this.isMoreSearch)
        this.unFocus = false
      },
      confirmDeleteHisAll() {
        this.confirmShow = true
      },
      _initScroll() {
        this.probeType = 3
        this.pullUp = true
        this.beforeScroll = true
      },
      _saveSearchKey() {
        let history = S.get(SEARCH_HISTORY) || []
        if (history.length) {
          let i = history.findIndex((item) => {
            return String(item).trim() === String(this.content).trim()
          })

          if (i >= 0) {
            history.splice(i, 1)
          }
        }
        history.unshift(this.content)
        S.set(SEARCH_HISTORY, history)
      },
      _showSearchKey() {
        let his = S.get(SEARCH_HISTORY) || []

        this.history = his
      },
      _initData() {
        this.isMoreSearch = false
        this.content = ''
        this.page = 1
        this.totalPage = 0
      },
      _getSearchRes(key, page, isMoreSearch) {
        getSearchRes(key, page).then((res) => {
          if (res.code === ERR_OK) {
            this.noResult = false
            if (isMoreSearch) {
              this.songs = this.songs.concat(this._normalize(res.data.song.list))
            } else {
              this.songs = this._normalize(res.data.song.list)
            }
            if (!this.songs.length) {
              this.noResult = true
              this.searching = false
              return
            }
            if (res.data.zhida.type > 0) {
              this.singer = new Singer({
                id: res.data.zhida.singermid,
                name: res.data.zhida.singername
              })
              this.singer.albumnum = res.data.zhida.albumnum
              this.singer.songnum = res.data.zhida.songnum
            }
            this.totalPage = Math.ceil(res.data.song.totalnum / 20)
            this.isMoreSearch = false
            this.page += 1
            this.searching = false

            this.hasMore = this.totalPage < this.page ? 0 : 1
          } else {
            this.noResult = true
          }
        })
      },
      _getHotKeys() {
        getHotKeys().then((res) => {
          if (res.code === ERR_OK) {
            this.hotList = res.data.hotkey
            this.hotList = this.hotList.length > HOT_KEY_LENGTH ? this.hotList.slice(0, HOT_KEY_LENGTH) : this.hotList
          }
        })
      },
      _normalize(songs) {
        let ret = []
        songs.forEach((i) => {
          ret.push(createSong(i))
        })

        return ret
      },
      _setHistoryHeight() {
        if (this.$refs.searchHistory) {
          this.$refs.searchHistory.style.height = this.$refs.search.clientHeight - this.$refs.hotSearch.clientHeight - this.$refs.searchBox.clientHeight + 'px'
        }
      },
      _calcView(sequenceList) {
        this.$refs.search.style.bottom = sequenceList.length > 0 ? '60px' : 0
        this._setHistoryHeight()
        this._setResultsHeight()
      },
      _quickSearch(v) {
          this.searchKey = v
          this.setQuickSearchStr('')
      },
      _setResultsHeight() {
        this.resultsHeight = this.$refs.search.clientHeight - this.$refs.searchBox.clientHeight
        this.$refs.resultsScroll.$el.style.height = this.resultsHeight + 'px'
      },
      ...mapMutations({
        'setQuickSearchStr': 'SET_QUICK_SEARCH_STR',
        'setSinger': 'SET_SINGER'
      }),
      ...mapActions([
        'selectSong'
      ])
    },
    watch: {
      quickSearchStr(v) {
        if (v) {
          this._quickSearch(v)
        }
      },
      hotList() {
        clearTimeout(this._setHistoryHeightTimer)
        this._setHistoryHeightTimer = setTimeout(() => {
          this._setHistoryHeight()
        }, 20)
      }
    },
    components: {
      SearchBox,
      Scroll,
      Confirm,
      Loading,
      NoMore
    }
  }
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'

  .search
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
    .search-box
      padding: 10px 0
    .results
      position: absolute
      top: 70px
      left: 50%
      transform: translate3d(-50%, 0, 0)
      bottom: 0
      background: $color-background
      z-index: 100
      height: 100%
      width: 85%
      overflow: hidden
      .singer
        position: relative
        width: 100%
        height: 50px
        color: $color-text-ll
        font-size: $font-size-medium
        .image
          width: 10%
          .img
            width: 40px
            height: 40px
            border-radius: 50%
        .text-wrapper
          position: absolute
          top: 0
          left: 15%
          right: 0
          height: 100%
          .text
            display: inline-block
            width: 100%
          .text-singer
            font-size: $font-size-large
          .text-desc
            margin-top: 5px
      .song
        position: relative
        width: 100%
        height: 25px
        padding: 5px 0
        color: $color-text-ll
        font-size: $font-size-medium
        .icon
          display: inline-block
          width: 10%
          height: 100%
          text-align: center
        .text-wrapper
          position: absolute
          display: inline-block
          top: 5px
          left: 15%
          right: 0
          height: 100%
          .text
            overflow: hidden
            white-space: nowrap
            text-overflow: ellipsis
    .no-result
      height: 100%
      width: 85%
      margin: 0 auto
    .hot-search
      width: 85%
      margin: 0 auto
      font-size: $font-size-medium
      .title
        color: $color-theme
      .item
        display: inline-block
        padding: 5px 10px
        margin: 10px 10px 10px 0
        border-radius: 5px
        background: $color-highlight-background
    .search-history
      position: relative
      width: 85%
      margin: 0 auto
      margin-top: 30px
      font-size: $font-size-medium
      .top
        position: relative
        width: 100%
        padding-bottom: 10px
        .title
          color: $color-theme
        .icon
          position: absolute
          top: 0
          right: 10px
      .content
        position: absolute
        width: 100%
        top: 24px
        bottom: 50px
        overflow: hidden
        .item
          position: relative
          width: 100%
          padding: 10px 0
          margin: 5px 0
          background: $color-highlight-background
          border-radius: 5px
          .text
            margin-left: 10px
          .icon
            position: absolute
            top: 10px
            right: 10px
</style>