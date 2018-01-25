<template>
  <div class="player" v-if="sequenceList.length > 0">
    <transition name="normal">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.img" />
        </div>
        <div class="top">
          <div class="back" @click="onBack">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.songName"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" ref="middle">
          <div class="middle-l" ref="middleLeft" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd">
                <img class="image" :class="rotateImg" :src="currentSong.img" />
              </div>
            </div>
            <div class="playing-lyric-wrapper" ref="playLyricWrapper" v-show="lyrics.length || pureMusic">
              <div class="playing-lyric-top">
                <div class="lleft" ref="playLyricTop">
                  <span class="ttop">{{topLine}}</span>
                  <span ref="playLyricCurrentLeftTop" class="playing" v-show="currentLine === topLine">{{topLine}}</span>
                </div>
              </div>
              <div class="playing-lyric-bottom">
                <div class="rright" ref="playLyricBottom">
                  <span class="bbottom">{{bottomLine}}</span>
                  <span ref="playLyricCurrentLeftBottom" class="playing" v-show="currentLine === bottomLine" >{{bottomLine}}</span>
                </div>
              </div>
              <!-- <div class="playing-lyric-current-top" ref="playLyricCurrentLeftTop" :style="getCurrentLyricTopStyl" v-show="currentLine === topLine">{{topLine}}</div>
              <div class="playing-lyric-current-bottom" ref="playLyricCurrentLeftBottom" :style="getCurrentLyricBottomStyl" v-show="currentLine === bottomLine">{{bottomLine}}</div> -->
              <div class="pure-music" v-show="pureMusic">此歌曲为没有填词的纯音乐，请您欣赏</div>
            </div>
          </div>
          <div class="middle-r" ref="middleRight" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
            <div class="lyric-wrapper" ref="lyricWrapper">
              <ul v-show="!pureMusic">
                <li class="text-wrapper" ref="textWrapper" v-for="(item, index) in lyrics">
                  <div class="text" ref="lyricText" :data-index="index"  >
                    <span @click.stop="onQuickPlay">{{item}}</span>
                    <span class="currentt" ref="playLyricCurrentRight" v-show="currentLyricIndex === index">{{currentLine}}</span>
                  </div>
                </li>
              </ul>
              <div class="pure-text" v-show="pureMusic">此歌曲为没有填词的纯音乐，请您欣赏</div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{active: currentShow === 'cd'}"></span>
            <span class="dot" :class="{active: currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <div class="time time-l">{{_formatTime(currentTime | 0)}}</div>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @moving="onBarMoving" @moveEnd="onBarMoveEnd" @clickBar="onClickBar"></progress-bar>
            </div>
            <div class='time time-r'>{{_formatTime(currentSong.interval)}}</div>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="getIconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prevSong"></i>
            </div>
            <div class="icon i-center">
              <i :class="getIconPlayCls" @click="togglePlay"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="nextSong"></i>
            </div>
            <div class="icon i-right">
              <i :class="isFavorite ? 'icon-favorite' : 'icon-not-favorite'" @click="onToggleFavorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="onFullscreen">
        <div class="icon">
          <div class="imgWrapper">
            <img width="40" height="40" :src="currentSong.img" :class="rotateImg" />
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.songName"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :percent="percent">
            <i class="icon-mini" :class="getIconMiniCls" @click.stop="togglePlay"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist" @click.stop="onShowPlaylist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @canplay="onCanPlay" @timeupdate="onTimeUpdate" @ended="onEnded"></audio>
    <playlist :show="playlistShow" @close="onClosePlaylist" @stopPlay="onStopPlay"></playlist>
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from 'vuex'
  import {mode} from 'common/js/config'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {randomArr, decodeBase64, normalizeLyric} from 'common/js/methods'
  import {getLyric} from 'api/songs'
  import {ERR_OK} from 'api/config'
  import Scroll from 'base/scroll/scroll'
  import Playlist from 'base/playlist/playlist'
  import {S, FAVORITE_SONGS, LISTEN_HISTORY} from 'common/js/localStorage'

  const LYRIC_WIDTH = 150
  export default {
    data() {
      return {
        currentShow: 'cd',
        currentTime: 0,
        percent: 0,
        topLine: null,
        bottomLine: null,
        currentLine: null,
        currentLinePercent: 0,
        songChanging: false,
        lyrics: [],
        times: [],
        pureMusic: false,
        currentLyricIndex: 0,
        middlePos: {},
        quicking: false,
        playlistShow: false,
        isFavorite: false,
        songReady: false
      }
    },
    beforeDestroyed() {
      clearTimeout(this.pureMusicTimer)
      clearTimeout(this.quickTimer)
      clearTimeout(this.scaleTimer1)
      clearTimeout(this.scaleTimer2)
      clearTimeout(this.scaleTimer3)
    },
    computed: {
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      getIconMiniCls() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      rotateImg() {
        return this.playing ? 'play' : 'play pause'
      },
      getIconMode() {
        let m = this.playMode === mode.sequence ? 'sequence' : this.playMode === mode.loop ? 'loop' : 'random'
        return `icon-${m}`
      },
      getIconPlayCls() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      ...mapGetters([
        'sequenceList',
        'fullScreen',
        'currentSong',
        'playing',
        'playMode',
        'currentIndex',
        'randomList'
      ])
    },
    methods: {
      onStopPlay() {
        this.playlistShow = false
      },
      checkFavorite() {
        let list = S.get(FAVORITE_SONGS) || []
        let i = -1
        if (list.length) {
          i = list.findIndex((item) => {
            return item.songId === this.currentSong.songId
          })
        }

        this.isFavorite = i >= 0 ? 1 : 0
      },
      onToggleFavorite() {
        let list = S.get(FAVORITE_SONGS) || []
        let i = -1
        if (list.length) {
          i = list.findIndex((item) => {
            return item.songId === this.currentSong.songId
          })
        }
        if (i >= 0) {
          list.splice(i, 1)
        } else {
          list.push(this.currentSong)
        }

        S.set(FAVORITE_SONGS, list)

        this.checkFavorite()
      },
      onClosePlaylist() {
        this.playlistShow = false
      },
      onShowPlaylist() {
        this.playlistShow = true
      },
      onQuickPlay(e) {
        if (!this.quicking) {
          return
        }
        let index = e.target.parentNode.getAttribute('data-index')
        this.$refs.audio.currentTime = this.times[index]
        this.quicking = false
        if (!this.playing) {
          this.setPlaying(true)
        }
      },
      onTouchStart(e) {
        this.middlePos.starting = true
        this.middlePos.x1 = e.touches[0].pageX
        this.middlePos.y1 = e.touches[0].pageY
        this.middlePos.lastY = this.middlePos.lastY || 0
        if (!this.middlePos.start || !this.middlePos.end) {
          this._getMiddlePosData()
        }

        this.$refs.middleLeft.style.transition = ''
        this.$refs.middleRight.style.transition = ''
        this.$refs.lyricWrapper.style.transition = ''

        if (this.currentShow === 'lyric') {
          clearTimeout(this.quickTimer)
          this.quicking = true
        }
      },
      onTouchMove(e) {
        if (!this.middlePos.starting) {
          return
        }
        this.middlePos.moving = true
        this.middlePos.x2 = e.touches[0].pageX
        this.middlePos.y2 = e.touches[0].pageY
        let deltaX = this.middlePos.x2 - this.middlePos.x1
        let deltaY = this.middlePos.y2 - this.middlePos.y1
        if (deltaX > 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
          this.middlePos.pos = 'right'
          if (this.currentShow === 'lyric') {
            let x = this.$refs.middleLeft.clientWidth - deltaX
            this.$refs.middleLeft.style.transform = `translate3d(${-x}px, 0, 0)`
            this.$refs.middleRight.style.transform = `translate3d(${-x}px, 0, 0)`
          }
        } else if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
          this.middlePos.pos = 'left'
          if (this.currentShow === 'cd') {
            this.$refs.middleLeft.style.transform = `translate3d(${deltaX}px, 0, 0)`
            this.$refs.middleRight.style.transform = `translate3d(${deltaX}px, 0, 0)`
          }
        }

        if (this.currentShow === 'lyric' && !this.pureMusic) {
          this.middlePos._lastY = this.middlePos.lastY + deltaY
          if (deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
            if (this.middlePos._lastY > this.middlePos.start) {
              this.middlePos._lastY = this.middlePos.start + (this.middlePos._lastY - this.middlePos.start) * 0.3
            }
          } else if (deltaY < 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
            if (this.middlePos._lastY < this.middlePos.end) {
              this.middlePos._lastY = this.middlePos.end + (this.middlePos._lastY - this.middlePos.end) * 0.3
            }
          }
          this.$refs.lyricWrapper.style.transform = `translate3d(0, ${this.middlePos._lastY}px, 0)`
        }

        clearTimeout(this.quickTimer)
        this.quickTimer = setTimeout(() => {
          this.quicking = false
        }, 3000)
      },
      onTouchEnd() {
        if (!this.middlePos.moving) {
          this.middlePos.starting = false
          return
        }
        let deltaX = this.middlePos.x2 - this.middlePos.x1
        let deltaY = this.middlePos.y2 - this.middlePos.y1
        let widthSpot = this.$refs.middle.clientWidth * 0.3
        this.$refs.middleLeft.style.transition = 'all 0.3s'
        this.$refs.middleRight.style.transition = 'all 0.3s'
        if (Math.abs(deltaX) > widthSpot && Math.abs(deltaX) >= Math.abs(deltaY)) {
          if (this.currentShow === 'cd' && this.middlePos.pos !== 'right') {
            this.$refs.middleLeft.style.transform = 'translate3d(-100%, 0, 0)'
            this.$refs.middleRight.style.transform = 'translate3d(-100%, 0, 0)'
            this.currentShow = 'lyric'
          } else if (this.currentShow === 'lyric' && this.middlePos.pos !== 'left') {
            this.$refs.middleLeft.style.transform = 'translate3d(0, 0, 0)'
            this.$refs.middleRight.style.transform = 'translate3d(0, 0, 0)'
            this.currentShow = 'cd'
            this.quicking = false
          }
        } else {
          if (this.currentShow === 'cd') {
            this.$refs.middleLeft.style.transform = 'translate3d(0, 0, 0)'
            this.$refs.middleRight.style.transform = 'translate3d(0, 0, 0)'
          } else {
            this.$refs.middleLeft.style.transform = 'translate3d(-100%, 0, 0)'
            this.$refs.middleRight.style.transform = 'translate3d(-100%, 0, 0)'
          }
        }
        this.middlePos.x1 = null
        this.middlePos.x2 = null
        this.middlePos.y1 = null
        this.middlePos.y2 = null
        this.middlePos.pos = ''
        this.middlePos.lastY = this.middlePos._lastY
        this.middlePos.starting = false
        this.middlePos.moving = false

        if (!this.pureMusic) {
          this.$refs.lyricWrapper.style.transition = 'all 0.3s'
          if (this.middlePos.lastY > this.middlePos.start) {
            this.$refs.lyricWrapper.style.transform = 'translate3d(0, 0, 0)'
            this.middlePos.lastY = this.middlePos.start
          }
          if (this.middlePos.lastY < this.middlePos.end) {
            this.$refs.lyricWrapper.style.transform = `translate3d(0, ${this.middlePos.end}px, 0)`
            this.middlePos.lastY = this.middlePos.end
          }
        }
      },
      refresh() {
        this.currentLyricIndex = 0
        this.currentTime = 0
        this.percent = 0
        this.topLine = null
        this.bottomLine = null
        this.currentLine = null
        this.currentLinePercent = 0
        this.songChanging = true
        this.lyrics = []
        this._checkPureMusic(this.lyrics)
      },
      onEnded() {
        this.setPlaying(false)
        if (this.playMode === mode.loop) {
          this.loop()
        } else {
          this.nextSong()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        if (!this.playing) {
          this.setPlaying(true)
        }
      },
      changeMode() {
        let pMode
        let index = this.currentIndex
        let list = this.sequenceList

        if (this.playMode === mode.sequence) {
          pMode = mode.loop
        } else if (this.playMode === mode.loop) {
          pMode = mode.random
          list = randomArr(this.sequenceList)
          this.setRandomList(list)
        } else {
          pMode = mode.sequence
        }

        index = list.findIndex((item) => {
          return item.songId === this.currentSong.songId
        })
        this.setPlayMode(pMode)
        this.setCurrentIndex(index)
      },
      prevSong() {
        if (!this.songReady) {
          return
        }
        this.songReady = false
        let index = this.currentIndex - 1

        if (index < 0) {
          index = this.sequenceList.length - 1
        }

        this.setCurrentIndex(index)
      },
      nextSong() {
        if (!this.songReady) {
          return
        }
        this.songReady = false
        let index = this.currentIndex + 1

        if (index > this.sequenceList.length - 1) {
          index = 0
        }

        this.setCurrentIndex(index)
      },
      onClickBar(percent) {
        this.$refs.audio.currentTime = percent * this.currentSong.interval
        if (!this.playing) {
          this.setPlaying(true)
        }
      },
      onBarMoving(percent) {
        this.currentTime = percent * this.currentSong.interval | 0
        this.playLyric()
        this.barMoving = true
      },
      onBarMoveEnd(percent) {
        this.$refs.audio.currentTime = percent * this.currentSong.interval
        this.barMoving = false
        this.$refs.playLyricCurrentLeftBottom.style.transition = 'all 0.3s'
        this.$refs.playLyricCurrentLeftTop.style.transition = 'all 0.3s'
        if (!this.playing) {
          this.setPlaying(true)
        }
      },
      progressPercent() {
        this.percent = (this.$refs.audio.currentTime | 0) / this.currentSong.interval
      },
      onTimeUpdate() {
        if (this.barMoving) {
          return
        }
        if (this.$refs.audio) {
          this.currentTime = this.$refs.audio.currentTime
        }
        if (this.lyrics.length) {
          this.playLyric()
        }
      },
      playLyric() {
        if (this.lyrics && !this.songChanging && !this.pureMusic) {
          let {topLine, bottomLine, currentLine, currentLinePercent, index} = this._setLyric(this.times, this.lyrics, this.lyricInterval, this.currentTime, this.currentSong.interval)
          this.topLine = topLine
          this.bottomLine = bottomLine
          if (currentLine === topLine || currentLine === bottomLine) {
            this.currentLine = currentLine
          }
          this.currentLinePercent = currentLinePercent < 0 ? 1 : currentLinePercent
          if (this.currentLyricIndex !== index) {
            this.currentLyricIndex = index
          }
          this._setCurrentLyricPos(index)
          this._rollCurrentLyric()
        }
      },
      onCanPlay() {
        setTimeout(() => {
          this.songReady = true
          this.refresh()
          this._getLyric(this.currentSong.songId)
          this.checkFavorite()
          this.$refs.audio.play()
        }, 300)
      },
      togglePlay() {
        this.playing ? this.setPlaying(false) : this.setPlaying(true)
      },
      onBack() {
        this.setFullscreen(false)
      },
      onFullscreen() {
        this.setFullscreen(true)
      },
      _formatTime(time) {
        let minute = time / 60 | 0
        let second = time - minute * 60
        let ret = minute + ':' + (second < 10 ? '0' + second : second)

        return ret
      },
      _getLyric(songid) {
        getLyric(songid).then((res) => {
          if (res.code === ERR_OK) {
            let {_lyric, _time, _nt} = normalizeLyric(decodeBase64(res.lyric))
            this.times = _time
            this.lyrics = _lyric
            this.lyricInterval = _nt
            this.songChanging = false
            this._getMiddlePosData()
            this._checkPureMusic(this.lyrics)
          }
        })
      },
      _checkPureMusic(array) {
        clearTimeout(this.pureMusicTimer)
        this.pureMusic = 0
        this.pureMusicTimer = setTimeout(() => {
          this.pureMusic = array.length > 1 ? 0 : 1
        }, 3000)
      },
      // *** 歌词数据操作 ***
      _setLyric(times, lyrics, lyricInterval, currentTime, totalTime) {
        if (currentTime === totalTime) {
          return
        }

        let topLine
        let bottomLine
        let currentLine
        let currentLinePercent = 0
        let index

        /*          --- 歌词数据操作 ---

        循环判断播放器当前时间所在区间， 获取所在区间的歌词，下一句歌词，离下一句的时间， 用距离下一句的时间计算出滚动百分比

        */
        for (let i = 0; i < times.length; i++) {
          index = i
          if (currentTime < times[0]) {
            topLine = lyrics[i]
            bottomLine = lyrics[i + 1]
            currentLinePercent = 0
            currentLine = topLine

            return {topLine, bottomLine, currentLine, currentLinePercent, index}
          }

          let ct = times[i]
          let nt = times[i + 1]
          let currentInteval = lyricInterval[i]

          if (!nt) {
            if (i % 2 === 0) {
              topLine = lyrics[i]
              bottomLine = ''
            } else {
              topLine = ''
              bottomLine = lyrics[i]
            }
            currentLinePercent = 1 / (times[i] + lyricInterval[lyricInterval.length - 2] - currentTime)
            currentLine = lyrics[i]
            return {topLine, bottomLine, currentLine, currentLinePercent, index}
          }

          if (currentTime >= ct && currentTime < nt) {
            if (i % 2 === 0) {
              topLine = lyrics[i]
              bottomLine = lyrics[i + 1]
            } else {
              topLine = lyrics[i + 1]
              bottomLine = lyrics[i]
            }

            let p = 1 / (ct + currentInteval - currentTime)
            if (p > 1 || p < 0) {
              currentLinePercent = 1
            } else {
              currentLinePercent = p
            }
            currentLine = i % 2 === 0 ? this.topLine : this.bottomLine

            return {topLine, bottomLine, currentLine, currentLinePercent, index}
          }
        }
      },
      // *** CD界面下的歌词操作 ***
      _setCurrentLyricPos(index) {
        let left = this.$refs.playLyricWrapper.clientWidth - this.$refs.playLyricBottom.clientWidth
        let width
        let _width
        let transStr

        // 当前歌词所在位置（上下）
        let pos = this.$refs.lyricText.findIndex((i) => {
          return parseInt(i.getAttribute('data-index')) === index
        })
        pos = pos % 2 === 0 ? 't' : 'b'

        // 下边固定歌词的位置（左右）
        if (left < 0) {
          // this.$refs.playLyricBottom.style.left = 0
          // this.$refs.playLyricBottom.style.right = ''
        } else {
          // this.$refs.playLyricBottom.style.left = ''
          // this.$refs.playLyricBottom.style.right = 0
        }

        /*          --- 滚动高亮歌词操作 ---

        判断歌词上下位置，滚动歌词宽度 = 当前歌词百分比 * 歌词上下位置宽度， 特殊情况(滚动歌词不等于上下歌词)下手动设置歌词。

        滚动操作：变化width, transition: all 0.3s.

        */
        if (this.barMoving) {
          this.$refs.playLyricCurrentLeftTop.style.transition = ''
          this.$refs.playLyricCurrentLeftBottom.style.transition = ''
        }
        if (pos === 't' && this.currentLine === this.topLine) {
          _width = this.$refs.playLyricTop.clientWidth
          width = this.currentLinePercent * _width
          this.$refs.playLyricCurrentLeftTop.style.width = width + 'px'
          this.$refs.playLyricBottom.style.transform = ''
        } else if (pos === 'b' && this.currentLine === this.bottomLine) {
          _width = this.$refs.playLyricBottom.clientWidth
          width = this.currentLinePercent * _width
          left = left < 0 ? 0 : left
          // this.$refs.playLyricCurrentLeftBottom.style.left = left + 'px'
          this.$refs.playLyricCurrentLeftBottom.style.width = width + 'px'
          this.$refs.playLyricTop.style.transform = ''
        } else {
          this.currentLine = pos === 't' ? this.topLine : this.bottomLine
          width = pos === 't' ? this.currentLinePercent * this.$refs.playLyricTop.clientWidth : this.currentLinePercent * this.$refs.playLyricBottom.clientWidth
          this.$refs.playLyricCurrentLeftTop.style.width = ''
          this.$refs.playLyricCurrentLeftBottom.style.width = ''
          // this.$refs.playLyricCurrentLeftBottom.style.left = ''
          // this.$refs.playLyricCurrentLeftBottom.style.right = '0'
          if (pos === 't' && this.currentLinePercent > 0.3){
            _width = this.$refs.playLyricTop.clientWidth
            if (_width > LYRIC_WIDTH) {
              _width = this.currentLinePercent * (LYRIC_WIDTH - _width)
              transStr = `translate3d(${_width}px, 0, 0)`
              // this.$refs.playLyricCurrentLeftTop.style.transform = transStr
              this.$refs.playLyricTop.style.transform = transStr
            }
          } else if (pos === 'b' && this.currentLinePercent > 0.3) {
            _width = this.$refs.playLyricBottom.clientWidth
            if (_width > LYRIC_WIDTH) {
              _width = this.currentLinePercent * (LYRIC_WIDTH - _width)
              transStr = `translate3d(${_width}px, 0, 0)`
              // this.$refs.playLyricCurrentLeftBottom.style.transform = transStr
              this.$refs.playLyricBottom.style.transform = transStr
              // this.$refs.playLyricBottom.style.left = ''
              // this.$refs.playLyricBottom.style.right = 0
            }
          }
          return
        }

        /*          --- 歌词超长移动操作 ---

        如果歌词长度超出了显示范围，固定歌词和滚动歌词都要移动。transformX实现一起移动。 

        */
        // this.$refs.playLyricCurrentLeftTop.style.transform = ''
        // this.$refs.playLyricCurrentLeftBottom.style.transform = ''
        if (pos === 't'){
          _width = this.$refs.playLyricTop.clientWidth
          if (_width > LYRIC_WIDTH) {
            _width = this.currentLinePercent * (LYRIC_WIDTH - _width)
            transStr = `translate3d(${_width}px, 0, 0)`
            // this.$refs.playLyricCurrentLeftTop.style.transform = transStr
            this.$refs.playLyricTop.style.transform = transStr
          }
        } else if (pos === 'b') {
          _width = this.$refs.playLyricBottom.clientWidth
          if (_width > LYRIC_WIDTH) {
            _width = this.currentLinePercent * (LYRIC_WIDTH - _width)
            transStr = `translate3d(${_width}px, 0, 0)`
            // this.$refs.playLyricCurrentLeftBottom.style.transform = transStr
            this.$refs.playLyricBottom.style.transform = transStr
          }
        }
      },
      // *** 歌词界面下的歌词操作 ***
      _rollCurrentLyric() {
        let lt = this.$refs.lyricText
        let index = lt.findIndex((i) => {
          return parseInt(i.getAttribute('data-index')) === this.currentLyricIndex
        })
        let cr = this.$refs.playLyricCurrentRight[index]
        let tw = this.$refs.textWrapper[index]

        /*          --- 歌词横向滚动 ---

        变化当前歌词width，加上transition进行歌词滚动，超出长度则计算超出部分进行transformX移动操作 

        */
        let width = this.currentLinePercent * lt[index].clientWidth
        let left = (tw.clientWidth - lt[index].clientWidth) / 2
        let _left = left
        if (left < 0) {
          _left = left * 2 - 3
          left = 0

          if (this.currentLinePercent > 0.5) {
            let x = this.currentLinePercent * _left
            // cr.style.transform = `translate3d(${x}px, -50%, 0)`
            lt[index].style.transform = `translate3d(${x}px, 0, 0)`
          }
        }
        // cr.style.left = left + 'px'
        cr.style.width = width + 'px'

        /*          --- 歌词垂直移动 ---

        计算每页可显示多少歌词，取中间数，判断当前歌词是否超过中间数进行transformY移动 

        */
        let num = (this.$refs.middleRight.clientHeight / lt[index].clientHeight / 2) | 0
        let di = parseInt(lt[index].getAttribute('data-index'))
        if (!this.middlePos.starting && !this.middlePos.moving && !this.quicking) {
          this.$refs.lyricWrapper.style.transition = 'all 1s'
          if (di < num) {
            this.$refs.lyricWrapper.style.transform = `translate3d(0, ${this.middlePos.start}px, 0)`
            this.middlePos.lastY = this.middlePos.start
          } else if (di >= num && di < lt.length - num) {
            let y = (di - num) * lt[index].clientHeight
            this.$refs.lyricWrapper.style.transform = `translate3d(0, ${-y}px, 0)`
            this.middlePos.lastY = -y
          } else {
            this.$refs.lyricWrapper.style.transform = `translate3d(0, ${this.middlePos.end}px, 0)`
            this.middlePos.lastY = this.middlePos.end
          }
        }
      },
      _getMiddlePosData() {
        this.middlePos.start = 0
        this.middlePos.end = -(this.$refs.lyricWrapper.clientHeight - this.$refs.middleRight.clientHeight)
      },
      ...mapMutations({
        'setFullscreen': 'SET_FULLSCREEN',
        'setPlaying': 'SET_PLAYING',
        'setPlayMode': 'SET_PLAY_MODE',
        'setCurrentIndex': 'SET_CURRENT_INDEX',
        'setRandomList': 'SET_RANDOM_LIST'
      })
    },
    watch: {
      currentSong(newSong, oldSong) {
        let history = S.get(LISTEN_HISTORY) || []
        if (history.length) {
          let i = history.findIndex((item) => {
            return item.songId === newSong.songId
          })

          if (i >= 0) {
            history.splice(i, 1)
          }
        }
        history.unshift(newSong)
        S.set(LISTEN_HISTORY, history)

        if (newSong.songId === oldSong.songId) {
          if (!this.playing) {
            this.setPlaying(true)
          }
          return
        }
        if (!this.playing) {
          this.setPlaying(true)
        }
        this.refresh()
        this.checkFavorite()
      },
      currentTime() {
        this.progressPercent()
      },
      fullScreen(v) {
        if (v) {
          clearTimeout(this.scaleTimer1)
          clearTimeout(this.scaleTimer2)
          this.scaleTimer1 = setTimeout(() => {
            this.$refs.cdWrapper.style.transform = 'translate3d(0, 0, 0) scale(1.2)'
          }, 20)
          this.scaleTimre2 = setTimeout(() => {
            this.$refs.cdWrapper.style.transform = 'translate3d(0, 0, 0) scale(1)'
          }, 320)
        } else {
          let cdWrapper = this.$refs.cdWrapper
          let x = cdWrapper.clientWidth / 2
          let y = cdWrapper.getBoundingClientRect().bottom + cdWrapper.clientHeight / 2
          let scale = 0.1

          clearTimeout(this.scaleTimer3)
          this.scaleTimer3 = setTimeout(() => {
            this.$refs.cdWrapper.style.transform = `translate3d(${-x}px, ${y}px, 0) scale(${scale})`
          }, 20)
        }
      },
      playing(v) {
        if (this.$refs.audio) {
          v ? this.$refs.audio.play() : this.$refs.audio.pause()
        }
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
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
            box-sizing: border-box
            height: 100%
            transition: all 0.3s
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              .play
                animation: rotate 20s linear infinite
              .pause
                animation-play-state: paused
          .playing-lyric-wrapper
            position: relative
            display: flex
            width: 80%
            margin: 30px
            height: 50px
            overflow: hidden
            .playing-lyric-top
              position: absolute
              width: 50%
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
              top: 0
              left: 0
              overflow: hidden
              .lleft
                position: relative
                display: inline-block
                .playing
                  position: absolute
                  display: inline-block
                  top: 0
                  left: 0
                  color: $color-theme
                  overflow: hidden
                  transition: all 0.3s
            .playing-lyric-bottom
              position: absolute
              width: 50%
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
              left: 50%
              bottom: 0
              overflow: hidden
              text-align: right
              .rright
                position: relative
                display: inline-block
                .playing
                  position: absolute
                  display: inline-block
                  top: 0
                  left: 0
                  color: $color-theme
                  overflow: hidden
                  transition: all 0.3s
            .playing-lyric-current-top
              position: absolute
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-theme
              overflow: hidden
              top: 0
              left: 0
            .playing-lyric-current-bottom
              position: absolute
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-theme
              overflow: hidden
              bottom: 0
            .pure-music
              margin: auto
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          position: relative
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            .text-wrapper
              position: relative
              display: flex
              .text
                position: relative
                margin: auto
                line-height: 32px
                color: $color-text-l
                font-size: $font-size-medium
                transition: all 1s
                .quick-play
                  position: absolute
                  right: 0
                  transform: translate3d(100%, 0, 0)
                  padding: 0 10px
                .currentt
                  position: absolute
                  top: 0
                  left: 0
                  transition: all 1s
                  color: $color-theme
                  font-size: $font-size-medium
                  overflow: hidden
              .current
                position: absolute
                top: 50%
                transform: translate3d(0, -50%, 0)
                transition: all 1s
                color: $color-theme
                font-size: $font-size-medium
                overflow: hidden
            .pure-text
              height: 100%
              line-height: 32px
              color: $color-text-l
              text-align: center
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 20px
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
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
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