<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" @query="onSearchQuery" :placeholder="placeholder"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switchItems="switchItems" :currentIndex="currentIndex" @switch="onSwitch"></switches>
        <div class="list-wrapper" v-if="currentIndex === 0">
          <scroll class="list-scroll" :data="playHistory" ref="playlistWrapper">
            <div class="list-inner">
              <song-list :songs="playHistory" @selectItemPlay="selectItem" :hasMore="hasMore"></song-list>
            </div>
          </scroll>
        </div>
        <div class="list-wrapper" v-if="currentIndex === 1">
          <scroll class="list-scroll" :data="searchHistory">
            <div class="list-inner">
              <search-list :searchHistory="searchHistory" @delete="onDeleteOne" @select="addQuery"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" @select="onSelect" @beforeScrollStart="onBeforeScrollStart" :showSinger="showSinger"></suggest>
      </div>
      <top-list ref="topList"></top-list>
    </div>
  </transition>
</template>

<script>
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import Switches from 'base/switches/switches'
  import SongList from 'base/song-list/song-list'
  import Scroll from 'base/scroll/scroll'
  import SearchList from 'base/search-list/search-list'
  import TopList from 'base/top-list/top-list'
  import {searchMixin} from 'common/js/mixins'
  import {mapGetters, mapActions} from 'vuex'
  import Song from 'common/js/song'

  export default {
    mixins: [searchMixin],
    data() {
      return {
        showFlag: false,
        placeholder: '搜索歌曲',
        showSinger: false,
        switchItems: [
          {name: '播放历史'},
          {name: '搜索历史'}
        ],
        currentIndex: 0,
        currentLyric: null,
        playingLyric: '',
        currentLineNum: 0,
        hasMore: false,
        refreshTime: 200
      }
    },
    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },
    methods: {
      show() {
        this.showFlag = true
      },
      hide() {
        this.showFlag = false
      },
      onSwitch(index) {
        this.currentIndex = index
      },
      selectItem(item, index) {
        this.selectPlay(new Song(item))
        this.$refs.topList.show()
      },
      onSelect(item) {
        this.selectPlay(item)
        this.sSearchHistory(item.songname)
        this.$refs.topList.show()
      },
      ...mapActions([
        'selectPlay',
        'sSearchHistory'
      ])
    },
    watch: {
      showFlag(flag) {
        setTimeout(() => {
          if (this.$refs.playlistWrapper) {
            this.$refs.playlistWrapper.refresh()
          }
        }, this.refreshTime)
      }
    },
    components: {
      SearchBox,
      Suggest,
      Switches,
      SongList,
      SearchList,
      Scroll,
      TopList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
</style>