<template>
  <div class="song-list">
    <ul>
      <li @click="selectItem(song, index)" class="item" v-for="(song, index) in songs">
        <div class="rank" v-show="rankPage">
          <i class="icon" :class="getIcon(index)" v-show="index < 3"></i>
          <span class="text" v-show="index >= 3">{{index}}</span>
        </div>
        <div class="content">
          <h2 class="name" v-html="song.songName"></h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: {
      rankPage: {
        type: Boolean,
        default: false
      },
      songs: {
        type: Array,
        default: []
      }
    },
    methods: {
      getIcon(index) {
        return `icon${index}`
      },
      selectItem(song, index) {
        this.$emit('selectSong', song, index)
      },
      getDesc(song) {
        return song.singer + ' . ' + song.albumName
      }
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
</style>