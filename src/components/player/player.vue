<template>
  <div class="player" v-if="playList.length > 0">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <img class="background" :src="currentSong.albumimage" />
        <div class="top">
          <div class="back">
            <i class="icon-back" @click="back"></i>
          </div>
          <h1 class="title" v-html="currentSong.songname"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart.prevent="onTouchStart" @touchmove.prevent="onTouchMove" @touchend="onTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.albumimage" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" :data="currentLyric && currentLyric.lines" ref="lyricList">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text" ref="lyricLine" :class="{'current':currentLineNum === index}" v-for="(line, index) in currentLyric.lines">{{line.txt}}</p>
                <p class="noLyric" :class="{'current':currentLineNum === 0}" v-if="!this.currentLyric.lines.length">
                  {{noLyric}}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class='dot' :class="{'active':currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
          <span class="time time-l">{{format(currentTime)}}</span>
          <div class="progress-bar-wrapper">
            <progress-bar :percent="getPercent" @progressMove="onProgressMove" @changing="onChaning" :fileLoaded="fileLoaded"></progress-bar>
          </div>
          <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="iconPlay" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right" @click="toggleFavorite">
              <i :class="iconFavorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="goFull">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.albumimage" :class='cdCls' />
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.songname"></h2>
          <p class="desc" v-html="currentSong.singer">}</p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="getPercent">
            <i class="icon-mini" :class="iconPlayMini" @click.stop.prevent="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio :src="currentSong.url" ref="audio" @ended="end" @play="loaded" @timeupdate="getCurrentTime"></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import Scroll from 'base/scroll/scroll'
  import Lyric from 'lyric-parser'
  import Playlist from 'components/playlist/playlist'
  import {playerMixin} from 'common/js/mixins'
  import {playMode} from 'common/js/config'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')
  export default {
    mixins: [playerMixin],
    data() {
      return {
        fileLoaded: false,
        currentTime: 0,
        timeOnchanging: false,
        radius: 32,
        songChange: true,
        currentShow: 'cd',
        currentLyric: null,
        playingLyric: '',
        currentLineNum: 0,
        touch: {},
        noLyric: '此歌曲为没有歌词的纯音乐，请欣赏'
      }
    },
    computed: {
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      iconPlay() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      iconPlayMini() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      iconFavorite() {
        let favorite = this.favoriteList.find((item) => {
          return item.songid === this.currentSong.songid
        })

        return favorite ? 'icon-favorite' : 'icon-not-favorite'
      },
      getPercent() {
        if (!this.currentTime) {
          return
        }
        return this.currentTime / this.currentSong.duration
      },
      disableCls() {
        return this.fileLoaded ? '' : 'disable'
      },
      ...mapGetters([
        'fullScreen',
        'singer',
        'playing',
        'currentIndex',
        'sequenceList',
        'favoriteList'
      ])
    },
    methods: {
      toggleFavorite() {
        let index = this.favoriteList.findIndex((item) => {
          return item.songid === this.currentSong.songid
        })

        let arr = this.favoriteList.slice()
        if (index >= 0) {
          arr.splice(index, 1)
        } else {
          arr.push(this.currentSong)
        }

        this.setFavoriteList(arr)
      },
      showPlaylist() {
        this.$refs.playlist.show()
        this.$refs.playlist.scrollToCurrent()
      },
      back() {
        this.setFullScreen(false)
      },
      goFull() {
        this.setFullScreen(true)
      },
      enter(el, done) {
        let {x, y, scale} = this._getScaleAndPos()
        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0}) scale(${scale})`
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(1.3)`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        }
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 300,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        let {x, y, scale} = this._getScaleAndPos()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.style['transition'] = 0.3 + 's'
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style[transform] = ''
        this.$refs.cdWrapper.style['transition'] = ''
      },
      togglePlaying() {
        if (!this.fileLoaded) {
          return
        }
        this.setPlaying(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      prev() {
        if (!this.fileLoaded) {
          return
        }
        if (this.playList.length === 1) {
          this.loop()
          return
        }
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playList.length - 1
        }

        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        this.fileLoaded = false
      },
      next() {
        if (!this.fileLoaded) {
          return
        }
        if (this.playList.length === 1) {
          this.loop()
          return
        }
        this.$refs.audio.currentTime = 0
        let index = this.currentIndex + 1
        if (index === this.playList.length) {
          index = 0
        }

        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        this.fileLoaded = false
      },
      end() {
        this.setPlaying(false)
        if (this.mode === playMode.loop) {
          setTimeout(() => {
            this.loop()
          }, 500)
        } else {
          setTimeout(() => {
            this.next()
          }, 500)
        }
      },
      loaded() {
        this.fileLoaded = true
      },
      format(time) {
        time = time | 0
        let minute = time / 60 | 0
        let second = this._pad(time % 60)

        return `${minute}:${second}`
      },
      getCurrentTime() {
        if (!this.$refs.audio) {
          return
        }
        if (this.timeOnchanging) {
          return
        }
        this.currentTime = this.$refs.audio.currentTime === undefined ? 0 : this.$refs.audio.currentTime
      },
      onProgressMove(percent) {
        this.timeOnchanging = false
        this.currentTime = percent * this.currentSong.duration
        this.$refs.audio.currentTime = this.currentTime
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(this.currentTime * 1000)
        }
      },
      onChaning(percent) {
        this.timeOnchanging = true
        this.currentTime = percent * this.currentSong.duration
        if (this.currentLyric) {
          this.currentLyric.seek(this.currentTime * 800)
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      onTouchStart(e) {
        this.touch.initiated = true
        this.touch.moved = false
        this.touch.startX = e.touches[0].pageX
        this.touch.startY = e.touches[0].pageY
      },
      onTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        let deltaX = e.touches[0].pageX - this.touch.startX
        let deltaY = e.touches[0].pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        if (!this.touch.moved) {
          this.touch.moved = true
        }
        let left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        let offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      onTouchEnd() {
        if (!this.touch.moved) {
          return
        }
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }

        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        this.touch.initiated = false
      },
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          if (this.currentSong.lyric !== lyric) {
            return
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          // 如果没有歌词
          if (!this.currentLyric.lines.length) {
            this.playingLyric = this.noLyric
            this.currentLineNum = 0
            return
          }
          if (this.playing) {
            this.currentLyric.seek(this.currentTime * 1000)
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric({lineNum, txt}) {
        if (!this.$refs.lyricList) {
          return
        }

        this.currentLineNum = lineNum
        if (lineNum > 5 && !this.timeOnchanging) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else if (this.timeOnchanging) {
          this.currentLyric.stop()
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 0)
        }
        this.playingLyric = txt
      },
      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }

        return num
      },
      _getScaleAndPos() {
        let bigWidth = window.innerWidth * 0.8
        let smallWidth = 40
        let scale = smallWidth / bigWidth

        let bigPaddingTop = 80
        let smallPaddingLeft = 40
        let smallPaddingBottom = 30

        let x = -(window.innerWidth / 2 - smallPaddingLeft)
        let y = window.innerHeight - bigPaddingTop - bigWidth / 2 - smallPaddingBottom

        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        'setFullScreen': 'SET_FULL_SCREEN',
        'setPlaying': 'SET_PLAYING',
        'setFavoriteList': 'SET_FAVORITE_LIST'
      }),
      ...mapActions([
        'sPlayHistory'
      ])
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    },
    destoryed() {
      this.fileLoaded = false
      this.currentTime = 0
      this.timeOnchanging = false
      this.radius = 32
      this.songChange = true
      this.currentShow = 'cd'
      this.currentLyric = null
      this.playingLyric = ''
      this.currentLineNum = 0
      this.touch = {}
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (!newSong) {
          return
        }
        if (!oldSong) {
          oldSong = {}
          oldSong.songid = undefined
        }
        if (newSong.songid === oldSong.songid) {
          return
        }
        this.fileLoaded = false
        this.songChange = true
        if (this.currentLyric) {
          this.currentLyric.stop()
          this.currentLyric = null
          this.currentLineNum = 0
          this.playingLyric = ''
          this.currentTime = 0
        }
        setTimeout(() => {
          this.sPlayHistory(newSong)
          this.$refs.audio.play()
          this.songChange = false
          this.getLyric()
        }, 1000)
      },
      playing(newState) {
        if (newState && !this.songChange) {
          this.$refs.audio.play()
        }
        if (!newState && !this.songChange) {
          this.$refs.audio.pause()
        }
      },
      fullScreen(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.$refs.lyricList.refresh()
          }, 20)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .noLyric
              color: $color-text-l
              font-size: $font-size-medium
              margin: 0 auto
              margin-top: 65%
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>