<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="clickListen" ref="playlist">
      <div class="list-wrapper" ref="listWrapper">
        <div class="list-header">
          <span class="title">
            <i class="icon" :class="playIcon" @click.stop="changeMode"></i>
            <h2 class="text" v-html="getPlayIconText"></h2>
            <div class="clear" @click="delAll">
              <i class="icon-clear"></i>
            </div>
          </span>
        </div>
        <scroll :data="playList" class="list-content" ref="listContent" :refreshTime="refreshTime">
          <transition-group name="list" tag="ul">
            <li class="item" v-for="(item, index) in sequenceList" :key="item.songid" @click.stop="_selectPlay(item)" ref="item">
              <i class="current" :class="getCurrent(index)"></i>
              <span class="text" v-html="item.songname"></span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="iconFavorite(item)"></i>
              </span>
              <span class="delete" @click.stop="delOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click.stop="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm @confirm="delSong" @cancel="onCancel" text="是否清空播放列表" confirmBtnText="清空" ref="confirm"></confirm>
      <add-song ref="addSongComp"></add-song>
    </div>
  </transition>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import {playMode} from 'common/js/config'
  import Scroll from 'base/scroll/scroll'
  import Confirm from 'base/confirm/confirm'
  import {playerMixin} from 'common/js/mixins'
  import AddSong from 'components/add-song/add-song'
  export default {
    mixins: [playerMixin],
    data() {
      return {
        showFlag: false,
        clickListenFlag: true,
        refreshTime: 200
      }
    },
    computed: {
      playIcon() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      getPlayIconText() {
        return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.loop ? '循环播放' : '随机播放'
      },
      ...mapGetters([
        'playList',
        'sequenceList',
        'mode',
        'favoriteList',
        'currentIndex',
        'currentSong'
      ])
    },
    methods: {
      addSong() {
        this.$refs.addSongComp.show()
      },
      clickListen(e) {
        if (!this.clickListenFlag) {
          return
        }
        let offsetHeight = this.$refs.playlist.clientHeight - this.$refs.listWrapper.clientHeight
        if (e.pageY < offsetHeight) {
          this.hide()
        }
      },
      show() {
        this.showFlag = true
        setTimeout(() => {
          this.$refs.listContent.refresh()
        }, 20)
      },
      hide() {
        this.showFlag = false
        this.clickListenFlag = true
      },
      iconFavorite(item) {
        let song = this.favoriteList.find((i) => {
          return i.songid === item.songid
        })
        return song ? 'icon-favorite' : 'icon-not-favorite'
      },
      getCurrent(index) {
        let currentIndex = this.currentIndex
        if (this.mode === playMode.random) {
          currentIndex = this.sequenceList.findIndex((item) => {
            return item.songid === this.currentSong.songid
          })
        }
        return index === currentIndex ? 'icon-play' : ''
      },
      toggleFavorite(item) {
        let index = this.favoriteList.findIndex((i) => {
          return i.songid === item.songid
        })
        let arr = this.favoriteList.slice()
        if (index >= 0) {
          arr.splice(index, 1)
        } else {
          arr.push(item)
        }

        this.setFavoriteList(arr)
      },
      delOne(item) {
        this.delSong(item)
      },
      _selectPlay(item) {
        this.selectPlay(item)
      },
      scrollToCurrent() {
        let index
        if (this.mode !== playMode.random) {
          index = this.currentIndex
        } else {
          index = this.sequenceList.findIndex((item) => {
            return item.songid === this.currentSong.songid
          })
        }
        // 保持在中间位置
        if (this.playList.length - (3 + 1) > index) {
          index -= 2
        }

        if (index < 0) {
          index = 0
        }
        setTimeout(() => {
          this.$refs.listContent.scrollToElement(this.$refs.item[index], 0, 0)
        }, 20)
      },
      delAll() {
        this.$refs.confirm.show()
        this.clickListenFlag = false
      },
      onCancel() {
        this.clickListenFlag = true
      },
      ...mapMutations({
        'setFavoriteList': 'SET_FAVORITE_LIST',
        'setCurrentIndex': 'SET_CURRENT_INDEX',
        'setMode': 'SET_MODE',
        'setPlayList': 'SET_PLAY_LIST'
      }),
      ...mapActions([
        'delSong',
        'selectPlay'
      ])
    },
    watch: {
      playList() {
        setTimeout(() => {
          this.$refs.listContent.refresh()
        }, 2000)
        console.log(this.$refs.listContent)
      }
    },
    components: {
      Scroll,
      Confirm,
      AddSong
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
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>