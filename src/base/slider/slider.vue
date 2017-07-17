<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <div class="dot" v-for="(item, index) in dots" :class="{'active': currentIndex === index}"></div>
    </div>
  </div>
</template>

<script>
  import {addClass} from 'common/js/dom'
  import BScroll from 'better-scroll'
  export default {
    props: {
      sliders: {
        type: Array,
        default: []
      },
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 2000
      }
    },
    data() {
      return {
        dots: [],
        currentIndex: 0
      }
    },
    mounted() {
      this._initSlider()
      this._initDots()
      this._initScroll()

      if (this.autoPlay) {
        this._autoPlay()
      }

      window.addEventListener('resize', () => {
        this._initSlider(true)
        this.scroll.refresh()
      })
    },
    methods: {
      _initSlider(isResize) {
        this.children = this.$refs.sliderGroup.children
        let totalWidth = 0
        let everyWidth = this.$refs.slider.clientWidth

        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item')
          child.style.width = everyWidth + 'px'
          totalWidth += everyWidth
        }

        if (this.loop && !isResize) {
          totalWidth += 2 * everyWidth
        }

        this.$refs.sliderGroup.style.width = totalWidth + 'px'
      },
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      _autoPlay() {
        let index = this.currentIndex + 1

        if (this.loop) {
          index += 1
        }
        this.timer = setTimeout(() => {
          this.scroll.goToPage(index, 0, 400)
        }, this.interval)
      },
      _initScroll() {
        this.scroll = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: true,
          snapLoop: this.loop,
          snapSpeed: 400,
          snapTheasold: 0.3,
          click: true
        })

        this.scroll.on('scrollEnd', () => {
          let index = this.scroll.getCurrentPage().pageX

          if (this.loop) {
            index -= 1
          }

          this.currentIndex = index

          if (this.autoPlay) {
            clearTimeout(this.timer)
            this._autoPlay()
          }
        })

        this.scroll.on('beforeScrollStart', () => {
          if (this.autoPlay) {
            clearTimeout(this.timer)
          }
        })
      }
    },
    watch: {
      sliders() {
        this.scroll.refresh()
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>