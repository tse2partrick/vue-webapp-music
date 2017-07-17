<template>
  <div class="music-list">
    <div class="back">
      <i class="icon-back" @click="back"></i>
    </div>
    <div class="title" ref="title">{{title}}</div>
    <div class="bg-image" :style="bgImg" ref="bgImage">
      <div class="play-wrapper" ref="playBtn" @click="selectAll">
        <div class="play">
          <i class="icon-play"></i>
          <span class="text">播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll class="list" ref="songList" :data="songs" :probeType="probeType" :listenScroll="listenScroll" @scroll="onScroll" :pullUp="pullUp" @scrollToEnd="onScrollToEnd">
      <div class="song-list-wrapper">
        <song-list :songs="songs" @selectItemPlay="selectItem" :isTopList="isTopList" :hasMore="hasMore" :noMoreShowFlag="noMoreShowFlag"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading :hasMore="hasMore"></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import SongList from 'base/song-list/song-list'
  import Scroll from 'base/scroll/scroll'
  import {prefixStyle} from 'common/js/dom'
  import {mapActions} from 'vuex'
  import {playListMixin} from 'common/js/mixins'
  import Loading from 'base/loading/loading'

  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('filter')
  const TITLE_HEIGHT = 40
  export default {
    mixins: [playListMixin],
    props: {
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      bgImage: {
        type: String,
        default: ''
      },
      isTopList: {
        type: Boolean,
        default: false
      },
      hasMore: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        probeType: 3,
        listenScroll: true,
        scrollY: 0,
        pullUp: true,
        noMoreShowFlag: true
      }
    },
    computed: {
      bgImg() {
        return `background-image:url(${this.bgImage})`
      }
    },
    mounted() {
      this.imageHeight = this.$refs.bgImage.clientHeight
      this.minTranslateY = -this.imageHeight + TITLE_HEIGHT
      this.$refs.songList.$el.style.top = this.imageHeight + 'px'
    },
    methods: {
      onScrollToEnd() {
        this.$emit('scrollToEnd')
      },
      playListHandler(playList) {
        let bottom = playList.length > 0 ? '60px' : 0
        this.$refs.songList.$el.style.bottom = bottom
        this.$refs.songList.refresh()
      },
      selectItem(song, index) {
        this.selectPlay(song)
      },
      selectAll() {
        this.selectPlayAll({
          list: this.songs
        })
      },
      back() {
        this.$router.go(-1)
      },
      onScroll(pos) {
        this.scrollY = pos.y
      },
      ...mapActions([
        'selectPlay',
        'selectPlayAll'
      ])
    },
    watch: {
      scrollY(newY) {
        let scale = 1
        let zIndex = 0
        let blur = 0
        let percent = Math.abs(newY / this.imageHeight)
        let translateY = Math.max(newY, this.minTranslateY)
        if (newY > 0) {
          zIndex = 10
          scale += percent
        } else {
          blur = Math.min(20, percent * 20)
        }
        this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`

        if (newY < this.minTranslateY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = TITLE_HEIGHT + 'px'
          this.$refs.playBtn.style.display = 'none'
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        this.$refs.bgImage.style.zIndex = zIndex
        this.$refs.bgImage.style[transform] = `scale(${scale})`
      }
    },
    components: {
      SongList,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
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
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
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
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>