<template>
  <transition name="slide">
    <div class="user-center" ref="userCenter">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :switchItems="switchItems" :currentIndex="currentIndex" @switch="switchItem"></switches>
      </div>
      <div class="play-btn" @click="playAll">
        <i class="icon-play"></i>
        <span class="text">播放全部</span>
      </div>
      <div class="list-wrapper" v-if="currentIndex === 0" ref="listWrapper">
        <scroll class="list-scroll" :data="favoriteList" ref="listScroll">
          <div class="list-inner">
            <song-list :songs="favoriteList" @selectItemPlay="selectItem" :hasMore="false"></song-list>
          </div>
        </scroll>
      </div>
      <div class="list-wrapper" v-if="currentIndex === 1" ref="listWrapper">
        <scroll class="list-scroll" :data="playHistory" ref="listScroll">
          <div class="list-inner">
            <song-list :songs="playHistory" @selectItemPlay="selectItem" :hasMore="false"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResultShow">
        <no-results :title="noResultTitle"></no-results>
      </div>
      <top-list :title="topListTitle" ref="topList"></top-list>
    </div>
  </transition>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import NoResults from 'base/no-results/no-results'
  import Switches from 'base/switches/switches'
  import {mapGetters, mapActions} from 'vuex'
  import SongList from 'base/song-list/song-list'
  import {playListMixin} from 'common/js/mixins'
  import Song from 'common/js/song'
  import TopList from 'base/top-list/top-list'
  export default {
    mixins: [playListMixin],
    data() {
      return {
        switchItems: [
          {name: '我的收藏'},
          {name: '播放历史'}
        ],
        currentIndex: 0,
        topListTitle: '成功加入播放列表！'
      }
    },
    methods: {
      playAll() {
        if (this.currentIndex === 0) {
          this.selectPlayAll({
            list: this.favoriteList
          })
        }
        if (this.currentIndex === 1) {
          let all = []
          this.playHistory.forEach((item) => {
            all.push(new Song(item))
          })
          this.selectPlayAll({
            list: all
          })
        }
        this.$refs.topList.show()
      },
      selectItem(item, index) {
        if (this.currentIndex === 0) {
          this.selectPlay(item)
        }
        if (this.currentIndex === 1) {
          this.selectPlay(new Song(item))
        }
      },
      playListHandler(playList) {
        if (!this.$refs.userCenter) {
          return
        }
        let bottom = playList.length > 0 ? '60px' : ''
        this.$refs.listWrapper.style.bottom = bottom
        this.$refs.listScroll.refresh()
      },
      back() {
        this.$router.go(-1)
      },
      switchItem(index) {
        this.currentIndex = index
      },
      ...mapActions([
        'selectPlay',
        'selectPlayAll'
      ])
    },
    computed: {
      noResultShow() {
        return this.currentIndex === 0 ? !this.favoriteList.length : !this.playHistory.length
      },
      noResultTitle() {
        return this.currentIndex === 0 ? '暂无收藏歌曲' : '暂无播放历史'
      },
      ...mapGetters([
        'favoriteList',
        'playHistory'
      ])
    },
    components: {
      Scroll,
      NoResults,
      Switches,
      SongList,
      TopList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>