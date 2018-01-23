<template>
  <transition name="list-fade">
    <div class="playlist" v-show="show">
      <div class="list-wrapper">
        <div class="list-header">
          <div class="title">
            <i class="icon" :class="getModeIcon" @click="onChangeMode"></i>
            <h2 class="text">{{getModeName}}</h2>
            <div class="clear" @click="onConfirmDeleteAll">
              <i class="icon-clear"></i>  
            </div>
          </div>
        </div>
        <scroll class="list-content" ref="listContent" :data="list">
          <transition-group name="list" tag="ul">
            <li :key="item.songId" class="item" ref="item" v-for="(item, index) in list" @click="onSelectPlay(item, index)" :data-index="index">
              <span class="current" :class="getCurrentIcon(index)"></span>
              <h2 class="text" v-html="item.songName"></h2>
              <span class="like" @click.stop="toggleFavorite(item, index)">
                <i ref="iconFavorite" :class="getIconFavorite(item)"></i>
              </span>
              <span class="delete" @click.stop="onDeleteOne(item, index)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="moreSong">
            <i class="icon-add"></i>
            <span class="text">此歌手更多歌曲</span>
          </div>
        </div>
        <div class="list-close" @click="onClose">关闭</div>
      </div>
      <confirm @sure="onSure" @cancel="onCancel" :show="confirmShow" :title="deleteAllTitle"></confirm>
    </div>
  </transition>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import {mode} from 'common/js/config'
  import {S, FAVORITE_SONGS} from 'common/js/localStorage'
  import {addClass, removeClass} from 'common/js/dom'
  import Confirm from 'base/confirm/confirm'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        list: [],
        confirmShow: false,
        sureDeleteAll: false,
        deleteAllTitle: '您确定要清空所有歌曲么？'
      }
    },
    mounted() {
      setTimeout(() => {
        this.list = this.sequenceList.slice(0)
      }, 20)
    },
    computed: {
      getModeIcon() {
        return this.playMode === mode.sequence ? 'icon-sequence' : this.playMode === mode.random ? 'icon-random' : 'icon-loop'
      },
      getModeName() {
        return this.playMode === mode.sequence ? '顺序播放' : this.playMode === mode.random ? '随机播放' : '循环播放'
      },
      ...mapGetters([
        'sequenceList',
        'randomList',
        'playMode',
        'currentIndex',
        'playing',
        'currentSong'
      ])
    },
    methods: {
      moreSong() {
        this.setQuickSearchStr(this.currentSong.singer)
        this.$router.push({
          path: '/search'
        })
        this.$emit('close')
      },
      onSure() {
        this.confirmShow = false
        this.sureDeleteAll = true
      },
      onCancel() {
        this.confirmShow = false
        this.sureDeleteAll = false
      },
      toggleFavorite(item, index) {
        let list = S.get(FAVORITE_SONGS) || []
        let i = -1
        if (list.length) {
          i = list.findIndex((r) => {
            return r.songId === item.songId
          })
        }

        if (i >= 0) {
          list.splice(i, 1)
          removeClass(this.$refs.iconFavorite[index], 'icon-favorite')
          addClass(this.$refs.iconFavorite[index], 'icon-not-favorite')
        } else {
          list.push(item)
          removeClass(this.$refs.iconFavorite[index], 'icon-not-favorite')
          addClass(this.$refs.iconFavorite[index], 'icon-favorite')
        }

        S.set(FAVORITE_SONGS, list)
      },
      getIconFavorite(item) {
        let list = S.get(FAVORITE_SONGS) || []
        let i = -1
        if (list.length) {
          i = list.findIndex((r) => {
            return r.songId === item.songId
          })
        }

        return i >= 0 ? 'icon-favorite' : 'icon-not-favorite'
      },
      getCurrentIcon(index) {
        return index === this.currentIndex ? 'icon-play' : ''
      },
      onClose() {
        this.$emit('close')
      },
      onDeleteOne(item, index) {
        let l = this.sequenceList.slice(0)
        let r = this.randomList.slice(0)
        let rIndex = r.findIndex((r) => {
          return r.songId === item.songId
        })
        l.splice(index, 1)
        r.splice(rIndex, 1)
        this.setSequenceList(l)
        this.setRandomList(r)
      },
      onSelectPlay(item, index) {
        let i = index
        if (this.playMode === mode.random) {
          i = this.randomList.findIndex((r) => {
            return r.songId === item.songId
          })
        }
        this.setCurrentIndex(i)
        if (!this.playing) {
          this.setPlaying(true)
        }
      },
      onConfirmDeleteAll() {
        if (!this.sequenceList.length) {
          return
        }
        this.confirmShow = true
      },
      onDeleteAll() {
        this.stopPlay()
        this.$emit('stopPlay')
      },
      onChangeMode() {
        let m = (this.playMode + 1) % 3
        this.list = m === mode.random ? this.randomList.slice(0) : this.sequenceList.slice(0)
        let i = this.list.findIndex((i) => {
          return i.songId === this.currentSong.songId
        })
        this.setPlayMode(m)
        this.setCurrentIndex(i)
      },
      _showCurrent() {
        setTimeout(() => {
          this.$refs.listContent._refresh()
          let i = this.$refs.item.findIndex((item) => {
            return parseInt(item.getAttribute('data-index')) === this.currentIndex
          })
          this.$refs.listContent._scrollToElement(this.$refs.item[i], 0, 0)
        }, 20)
      },
      ...mapMutations({
        'setSequenceList': 'SET_SEQUENCE_LIST',
        'setRandomList': 'SET_RANDOM_LIST',
        'setPlayMode': 'SET_PLAY_MODE',
        'setCurrentIndex': 'SET_CURRENT_INDEX',
        'setPlaying': 'SET_PLAYING',
        'setQuickSearchStr': 'SET_QUICK_SEARCH_STR'
      }),
      ...mapActions([
        'stopPlay'
      ])
    },
    watch: {
      sureDeleteAll(v) {
        if (v) {
          this.onDeleteAll()
        }
      },
      show(v) {
        if (v) {
          this._showCurrent()
        }
      },
      playMode(v) {
        this.list = v !== mode.random ? this.sequenceList.slice(0) : this.randomList.slice(0)
        this._showCurrent()
        if (!this.playing) {
          this.setPlaying(true)
        }
      },
      sequenceList(newList) {
        this.list = this.playMode !== mode.random ? this.sequenceList.slice(0) : this.randomList.slice(0)
      }
    },
    components: {
      Scroll,
      Confirm
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
            margin: auto
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>