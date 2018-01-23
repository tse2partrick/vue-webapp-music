<template>
  <div class="user" ref="user">
    <div class="top" ref="top">
      <div class="buttons">
        <div class="btn" :class="{current: showFavorite}" @click="goFavorite">我的收藏</div>
        <div class="btn" :class="{current: !showFavorite}" @click="goHistory">播放历史</div>
      </div>  
    </div>
    <scroll v-if="favoriteList.length || historyList.length" class="content" ref="contentScroll" :data="favoriteList || historyList">
      <div>
        <ul v-if="showFavorite">
          <li class="item" v-for="(item, index) in favoriteList" @click="selectPlay(item, index)">
            <span class="name">{{item.songName}}</span>
            <p class="desc">{{getDesc(item)}}</p>
          </li>
        </ul>
        <ul v-if="!showFavorite">
          <li class="item" v-for="(item, index) in historyList" @click="selectPlay(item, index)">
            <span class="name">{{item.songName}}</span>
            <p class="desc">{{getDesc(item)}}</p>
          </li>
        </ul>
      </div>
    </scroll>
  </div>
</template>

<script>
  import {S, FAVORITE_SONGS, LISTEN_HISTORY} from 'common/js/localStorage'
  import {mapActions} from 'vuex'
  import Scroll from 'base/scroll/scroll'
  import {playingMixin} from 'common/js/mixin'

  export default {
    mixins: [playingMixin],
    data() {
      return {
        favoriteList: [],
        historyList: [],
        showFavorite: true
      }
    },
    created() {
      this._getData()
    },
    mounted() {
      setTimeout(() => {
        this._setScrollHeight()
      }, 20)
    },
    activated() {
      this._getData()
    },
    methods: {
      selectPlay(item, index) {
        this.selectSong({
          list: this.showFavorite ? this.favoriteList : this.historyList,
          song: item,
          index
        })
      },
      onBack() {
        this.$router.go(-1)
      },
      goFavorite() {
        this.showFavorite = true
      },
      goHistory() {
        this.showFavorite = false
      },
      getDesc(item) {
        return `${item.singer} - ${item.albumName}`
      },
      _setScrollHeight() {
        this.$refs.contentScroll.$el.style.height = this.$refs.user.clientHeight - this.$refs.top.clientHeight + 'px'
      },
      _getData() {
        this.favoriteList = S.get(FAVORITE_SONGS) || []
        this.historyList = S.get(LISTEN_HISTORY) || []
      },
      _calcView(sequenceList) {
        this.$refs.user.style.bottom = sequenceList.length > 0 ? '60px' : ''
        if (this.$refs.contentScroll) {
          this._setScrollHeight()
          this.$refs.contentScroll._refresh()
        }
      },
      ...mapActions([
        'selectSong'
      ])
    },
    components: {
      Scroll
    }
  }
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
    .user
      position: fixed
      top: 88px
      bottom: 0
      width: 100%
      .top
        width: 100%
        height: 50px
        .buttons
          text-align: center
          width: 100%
          .btn
            display: inline-block
            background: $color-dialog-background
            padding: 8px 10px
            border-radius: 5px
            color: $color-text-l
            font-size: $font-size-medium-x
          .current
            color: $color-theme
      .content
        width: 100%   
        overflow: hidden
        .item
          font-size: $font-size-medium
          padding: 0 20px 30px 20px
          .name
            display: block
            padding-bottom: 5px
          .desc
            color: rgba(255, 255, 255, 0.5)
            font-size: $font-size-small
</style>