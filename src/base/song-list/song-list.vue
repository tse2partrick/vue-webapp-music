<template>
  <div class="song-list">
    <ul>
      <li class="item" v-for="(song, index) in songs" @click="selectItem(song, index)">
        <ul class="rank" v-if="isTopList">
          <li :class="topIcon(index)">
            <span v-if="index > 2">{{index + 1}}</span>
          </li>
        </ul>
        <div class="content">
          <h2 class="name" v-html="song.songname"></h2>
          <span class="desc" v-html="getDesc(song)"></span>
        </div>
      </li>
      <loading v-show="hasMore"></loading>
      <li class="item-no-more" v-show="!hasMore && noMoreShowFlag">没有更多了</li>
    </ul>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import Loading from 'base/loading/loading'
  export default {
    props: {
      songs: {
        type: Array,
        default: []
      },
      isTopList: {
        type: Boolean,
        default: false
      },
      hasMore: {
        type: Boolean,
        default: true
      },
      noMoreShowFlag: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ...mapGetters([
        'topList'
      ])
    },
    methods: {
      topIcon(index) {
        if (index <= 2) {
          return `icon icon${index}`
        } else {
          return 'text'
        }
      },
      getDesc(song) {
        return `${song.singer} . ${song.albumname}`
      },
      selectItem(song, index) {
        this.$emit('selectItemPlay', song, index)
      }
    },
    components: {
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
    .item-no-more
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      color: $color-text-d
      margin-top: 30px
      text-align: center
</style>