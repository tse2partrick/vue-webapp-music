<template>
  <scroll class="listview" :data="data" ref="listview" :probeType="3" :listenScroll="true" @scroll="onScroll">
    <ul>
      <li class="list-group" v-for="group in data" :data-index="group.title" ref="listGroup">
        <h2 class="list-group-title" v-html="group.title"></h2>
        <ul>
          <li @click="select(item)" class="list-group-item" v-for="item in group.items">
            <img class="avatar" v-lazy="item.avatar" />
            <span class="name" v-html="item.name"></span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut">
      <ul ref="shortcut">
        <li class="item" ref="shortcutItem" v-for="item in shortcut" @touchstart="onTouchStart(item)" @touchmove.stop.prevent="onTouchMove" :class="{current: item === currentItem}" v-html="item.substr(0, 1)" :data-index="item"></li>
      </ul>
    </div>
    <div class="list-fixed" ref="listFixed" v-show="!hiddenListFixed">
      <h2 class="fixed-title">{{currentItem}}</h2>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'

  export default {
    data() {
      return {
        currentItem: null,
        nullVal: null,
        hiddenListFixed: false
      }
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      shortcut() {
        return this.data.map((i) => {
          return i.title
        })
      }
    },
    methods: {
      select(item) {
        this.$emit('select', item)
      },
      onScroll(pos) {
        let y = -(pos.y)
        if (y < 0) {
          this.hiddenListFixed = true
          return
        }
        this.hiddenListFixed = false
        let shortcutIndex = this.listGroupTop.findIndex((i, index) => {
          if (this.listGroupTop[index + 1]) {
            return y >= i && y < this.listGroupTop[index + 1]
          } else {
            return y >= i
          }
        })

        this.currentItem = this.$refs.shortcutItem[shortcutIndex].getAttribute('data-index')

        let listFixedHeight = this.$refs.listFixed.clientHeight
        if (this.listGroupTop[shortcutIndex + 1]) {
          if (y + listFixedHeight >= this.listGroupTop[shortcutIndex + 1]) {
            let height = this.listGroupTop[shortcutIndex + 1] - y - listFixedHeight
            this.$refs.listFixed.style.transform = `translate3d(0, ${height}px, 0)`
          } else {
            this.$refs.listFixed.style.transform = ''
          }
        } else {
          this.$refs.listFixed.style.transform = ''
        }
      },
      onTouchStart(item) {
        let target = this.$refs.listGroup.find((i) => {
          return i.getAttribute('data-index') === item
        })

        this._scrollTo(target, 0, 0)
      },
      onTouchMove(e) {
        let topHeight = this.$refs.shortcut.getBoundingClientRect().top
        let everyItemHeight = this.$refs.shortcutItem[0].clientHeight
        let currentPageY = e.touches[0].pageY

        let index = (currentPageY - topHeight) / everyItemHeight | 0
        if (index < 0 || index > this.$refs.shortcutItem.length - 1) {
          return
        }

        this._scrollTo(this.$refs.listGroup[index])
      },
      _scrollTo(target) {
        this.$refs.listview._scrollToElement(target, 0, 0)
        this.currentItem = target.getAttribute('data-index')
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.currentItem = this.$refs.shortcutItem[0].getAttribute('data-index')
          this.listGroupTop = []
          for (let i = 0; i < this.$refs.listGroup.length; i++) {
            this.listGroupTop.push(this.$refs.listGroup[i].getBoundingClientRect().top - 88)
          }
        }, 20)
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>