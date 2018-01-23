<template>
  <div class="music-list" ref="musicList">
    <div class="back" @click="onBack" ref="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" ref="btnPlay" v-show="songs.length > 0" @click="playAll">
          <i class="icon-play"></i>
          <span class="text">开始播放全部</span>
        </div>
      </div>
      <div class="filter"></div>
    </div>
    <div class="bg-layer" ref="bgLayer"></div>
    <scroll class="list" :data="songs" ref="list" :probeType="3" :listenScroll="true" @scroll="onScroll">
      <div class="song-list-wrapper" ref="songListWrapper">
        <song-list @selectSong="onSelectSong" :songs="songs" :rank-page="rankPage"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Loading from 'base/loading/loading'
  import {mapActions} from 'vuex'
  import {playingMixin} from 'common/js/mixin'

  export default {
    mixins: [playingMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      rankPage: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      this._setListTop()
      this.$refs.bgImage.style.transform = 'scale(1)'
    },
    computed: {
      bgStyle() {
        return `background-image: url(${this.bgImage})`
      }
    },
    methods: {
      playAll() {
        this.selectSong({
          list: this.songs,
          song: '',
          index: 0
        })
      },
      onSelectSong(song, index) {
        this.selectSong({
          list: this.songs,
          song,
          index
        })
      },
      onScroll(pos) {
        this.scrollY = pos.y
        if (Math.abs(this.scrollY) <= this.maxTop) {
          this.$refs.bgLayer.style.transform = `translate3d(0, ${this.scrollY}px, 0)`
          this.$refs.bgImage.style.zIndex = ''
          this.$refs.bgImage.style.paddingTop = ''
          this.$refs.btnPlay.style.display = ''
        } else {
          this.$refs.bgImage.style.zIndex = 10
          this.$refs.bgImage.style.paddingTop = this.$refs.back.clientHeight + 'px'
          this.$refs.btnPlay.style.display = 'none'
        }

        if (this.scrollY > 0) {
          let scaleVal = 1 + this.scrollY / this.$refs.bgImage.clientHeight
          this.$refs.bgImage.style.transform = `scale(${scaleVal})`
          this.$refs.bgImage.style.zIndex = 10
        }
      },
      onBack() {
        this.$router.go(-1)
      },
      _setListTop() {
        this.$refs.list.$el.style.top = this.$refs.bgImage.clientHeight + 'px'

        this.maxTop = this.$refs.bgImage.clientHeight - this.$refs.back.clientHeight
      },
      _calcView(sequenceList) {
        this.$refs.musicList.style.bottom = sequenceList.length > 0 ? '60px' : ''
        this.$refs.list._refresh()
      },
      ...mapActions([
        'selectSong'
      ])
    },
    components: {
      Scroll,
      SongList,
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
    .black-shade
      width: 100%
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
      position: absolute
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