<template>
  <scroll class="listview" :data="data" :probeType="probeType" :listenScroll="listenScroll" @scroll="onScroll" ref="listview">
    <ul>
      <li class="list-group" v-for="(group, index) in data" ref="listGroup">
        <p class="list-group-title">{{group.title}}</p>
        <ul>
          <li @click="selectItem(item)" class="list-group-item" v-for="item in group.items">
            <img class="avatar" v-lazy="item.avatar" alt="">
            <h2 class="name">{{item.name}}</h2>
          </li>
        </ul>
      </li>
    </ul>
    <ul class="list-shortcut" @touchstart.prevent.stop="onTouchStart" @touchmove.prevent.stop="onTouchMove">
      <li class="item" v-for="(item, index) in shortCutLists" :class="{'current': currentIndex === index}" :data-index="index">{{item}}</li>
    </ul>
    <div class="list-fixed">
      <div class="fixed-title" ref="fixedList" v-show="fixedTitle">{{fixedTitle}}</div>
    </div>
    <div class="loading-container"></div>
  </scroll>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import {prefixStyle} from 'common/js/dom'

  const FIXED_HEIGHT = 30
  const SHORTCUT_HEIGHT = 18
  const transform = prefixStyle('transform')

  export default {
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        currentIndex: 0,
        probeType: 3,
        listenScroll: true,
        scrollY: 0,
        allGroupHeight: [],
        diff: 0,
        touch: {}
      }
    },
    mounted() {
      this._getAllGroupHeight()
    },
    computed: {
      shortCutLists() {
        return this.data.map((item) => {
          return item.title.substr(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      refresh() {
        this.$refs.listview.refresh()
      },
      selectItem(item) {
        this.$emit('selectItem', item)
      },
      onScroll(pos) {
        this.scrollY = pos.y
      },
      onTouchStart(e) {
        this.touch.y1 = e.touches[0].pageY
        let index = e.target.getAttribute('data-index')
        if (!index) {
          return
        }
        index = parseInt(index)
        this.touch.anchor = index
        this._scrollTo(index)
      },
      onTouchMove(e) {
        let y1 = this.touch.y1
        let y2 = e.touches[0].pageY
        let deltaAnchor = (y2 - y1) / SHORTCUT_HEIGHT | 0
        let index = deltaAnchor + this.touch.anchor

        if (index < 0) {
          index = 0
        }
        if (index >= this.data.length) {
          index = this.data.length - 1
        }
        this._scrollTo(index)
      },
      _scrollTo(index) {
        this.currentIndex = index
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0, 0)
      },
      _getAllGroupHeight() {
        if (!this.data.length) {
          return
        }

        let height = 0
        this.allGroupHeight.push(height)
        for (let i = 0; i < this.data.length; i++) {
          height += this.$refs.listGroup[i].clientHeight
          this.allGroupHeight.push(height)
        }
      }
    },
    watch: {
      data() {
        this._getAllGroupHeight()
      },
      scrollY(newY) {
        if (newY > 0) {
          this.currentIndex = 0
          return
        }

        for (let i = 0; i < this.allGroupHeight.length; i++) {
          let height1 = this.allGroupHeight[i]
          let height2 = this.allGroupHeight[i + 1]
          this.diff = height2 + newY
          if ((-newY) >= height1 && (-newY) < height2) {
            this.currentIndex = i
            return
          }
        }

        this.currentIndex = this.allGroupHeight.length - 1
      },
      diff(val) {
        let offsetTop = Math.max(0, FIXED_HEIGHT - val)
        this.$refs.fixedList.style[transform] = `translate3d(0, ${-offsetTop}px, 0)`
      }
    },
    components: {
      Scroll
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