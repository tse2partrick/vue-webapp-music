<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" :class="{active: currentPageIndex === index}" v-for="(item, index) in dots"></span>
    </div>
  </div>
</template>

<script>
  import {addClass} from 'common/js/dom'

  export default {
    props: {
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
        default: 4000
      }
    },
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    mounted() {
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()

        if (this.autoPlay) {
          this._play()
        }
        this.$refs.sliderGroup.addEventListener('transitionend', () => {
          if (this.touch.crossing) {
            this.$refs.sliderGroup.style.transition = ''  
            if (this.touch.crossing === 'left') {
              this.$refs.sliderGroup.style.transform = `translate3d(${this.sliderArr[1]}px, 0, 0)`
            }
            this.touch.crossing = ''
          }
          
          this.currentPageIndex = this.touch.page - 1

          if (this.autoPlay) {
            this._play()
          }
        })

        window.addEventListener('resize', this._resize)
      }, 20)
    },
    created() {
      this.touch = {}
      this.touch.page = 1
      this.sliderArr = [0]
    },
    deactivated() {
      clearTimeout(this.timer)
      clearTimeout(this.resizeTimer)
      window.removeEventListener('resize', this._resize)
    },
    activated() {
      if (this.autoPlay) {
        this._play()
      }
    },
    beforeDestroyed() {
      clearTimeout(this.timer)
      clearTimeout(this.resizeTimer)
      window.removeEventListener('resize', this._resize)
    },
    methods: {
      _resize() {
        clearTimeout(this.timer)
        this.resizeTimer = setTimeout(() => {
          this._setSliderWidth(true)

          if (this.autoPlay) {
            this._play()
          }
        }, 20)
      },
      onTouchStart(e) {
        this.touch.starting = true
        this.touch.x1 = e.touches[0].pageX
        this.touch.lastX = this.touch.lastX || 0

        if (this.autoPlay) {
          clearTimeout(this.timer)
        }
      },
      onTouchMove(e) {
        if (!this.touch.starting) {
          return
        }
        this.$refs.sliderGroup.style.transition = ''
        this.touch.moving = true
        this.touch.x2 = e.touches[0].pageX
        let deltaX = this.touch.x2 - this.touch.x1

        if (deltaX > 0) {
          this.touch.pos = 'r'
        }
        if (deltaX < 0) {
          this.touch.pos = 'l'
        }

        this.touch.x = this.touch.lastX - deltaX
        this.$refs.sliderGroup.style.transform = `translate3d(${-this.touch.x}px, 0, 0)`
      },
      onTouchEnd() {
        if (!this.touch.moving || this.touch.x === this.touch.lastX) {
          return
        }
        this.$refs.sliderGroup.style.transition = 'all 0.3s'
        let num
        let i = this.sliderArr.findIndex((item) => {
          return item < -this.touch.x
        })
        if (this.touch.pos === 'l') {
          if (i > 0) {
            num = i
          } else {
            this.touch.crossing = 'left'
            num = this.$refs.sliderGroup.children[0].clientWidth
            this.$refs.sliderGroup.style.transform = `translate3d(-${num * this.sliderArr.length}px, 0, 0)`
            this.touch.x = this.sliderArr[1]
            this.touch.lastX = -this.touch.x
            this.touch.page = 1
            return
          }
        } else if (this.touch.pos === 'r') {
          if (i - 1 === 0) {
            num = this.$refs.sliderGroup.children[0].clientWidth
            this.touch.crossing = 'right'
            this.$refs.sliderGroup.style.transform = `translate3d(0, 0, 0)`
            this.touch.x = this.sliderArr[this.sliderArr.length - 1]
            this.touch.lastX = -this.touch.x
            this.touch.page = this.sliderArr.length - 1
            return
          } else {
            num = i - 1
          }
        }

        this.touch.page = num
        this.touch.x = this.sliderArr[num]
        this._sliderMove(num)
        this.touch.lastX = -this.touch.x
      },
      _sliderMove(num) {
        let x = num * this.$refs.slider.clientWidth
        this.$refs.sliderGroup.style.transform = `translate3d(-${x}px, 0, 0)`
      },
      _setSliderWidth(isResize) {
        if (!this.$refs.slider) {
          return
        }
        let sliderWidth = this.$refs.slider.clientWidth
        let width = 0
        this.children = this.$refs.sliderGroup.children
        this.sliderArr = [0]
        let length = isResize ? this.children.length - 2 : this.children.length
        for (let i = 0; i < length; i++) {
          let child = isResize ? this.children[i + 1] : this.children[i]
          addClass(child, 'slider-item')

          child.style.width = sliderWidth + 'px'
          width += sliderWidth
          this.sliderArr.push(-width)
        }

        if (this.loop) {
          width += 2 * sliderWidth
          if (!isResize) {
            setTimeout(() => {
              this.imgStart = this.children[0].cloneNode(true) 
              this.imgEnd = this.children[this.children.length - 1].cloneNode(true)
              this.$refs.sliderGroup.insertBefore(this.imgEnd, this.children[0])
              this.$refs.sliderGroup.appendChild(this.imgStart)

              this.touch.lastX = sliderWidth
              this.$refs.sliderGroup.style.transform = `translate3d(-${this.touch.lastX}px, 0, 0)`
            }, 20)
          } else {
            this.$refs.sliderGroup.style.transition = ''
            this.imgStart.style.width = Math.abs(this.sliderArr[1]) + 'px'
            this.imgEnd.style.width = Math.abs(this.sliderArr[1]) + 'px'
            this._sliderMove(this.touch.page)
          }
        }

        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      _play() {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$refs.sliderGroup.style.transition = `all 0.3s`
          if (this.touch.page + 1 >= this.sliderArr.length) {
            this.touch.crossing = 'left'
            this.touch.page = 1
            this.$refs.sliderGroup.style.transform = `translate3d(${this.sliderArr[1] * this.sliderArr.length}px, 0, 0)`
            this.touch.x = this.sliderArr[1]
            this.touch.lastX = -this.touch.x
            return
          } else {
            this.touch.page += 1
            this.touch.x = this.sliderArr[this.touch.page]
            this.touch.lastX = -this.touch.x
          }
          this._sliderMove(this.touch.page)
        }, this.interval)
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
      transform: translateZ(1px)
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