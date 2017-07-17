<template>
  <div class="progress-bar" ref="progressBar" @click="onClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn">
        <div class="progress-btn" @touchstart.stop.prevent="onTouchStart" @touchmove.stop.prevent="onTouchMove" @touchend="onTouchEnd"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import {prefixStyle} from 'common/js/dom'

  const transform = prefixStyle('transform')
  const BTN_WIDTH = 16
  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      },
      fileLoaded: {
        type: Boolean,
        default: false
      }
    },
    created() {
      this.touch = {}
    },
    methods: {
      progressMove(percent) {
        let offsetLeft = percent * (this.$refs.progressBar.clientWidth - BTN_WIDTH)
        this.$refs.progress.style.width = offsetLeft + 'px'
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetLeft}px, 0, 0)`
      },
      onClick(e) {
        if (!this.fileLoaded) {
          return
        }
        let x = e.pageX - this.$refs.progressBar.getBoundingClientRect().left
        let offsetWidth = Math.max(0, Math.min(this.$refs.progressBar.clientWidth - BTN_WIDTH, x))
        this.touch.percent = offsetWidth / (this.$refs.progressBar.clientWidth - BTN_WIDTH)
        this._scrollTo(offsetWidth)
        this._triggerMove(this.touch.percent)
      },
      onTouchStart(e) {
        this.touch.initiated = true
        this.touch.x1 = e.touches[0].pageX
        this.touch.left = this.$refs.progress.clientWidth
      },
      onTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        let x2 = e.touches[0].pageX - this.touch.x1
        let offsetWidth = Math.max(0, Math.min(this.$refs.progressBar.clientWidth - BTN_WIDTH, x2 + this.touch.left))
        this.touch.percent = offsetWidth / (this.$refs.progressBar.clientWidth - BTN_WIDTH)
        this._scrollTo(offsetWidth)
        this.$emit('changing', this.touch.percent)
      },
      onTouchEnd() {
        this._triggerMove(this.touch.percent)
      },
      _scrollTo(offsetWidth) {
        this.$refs.progress.style.width = offsetWidth + 'px'
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      },
      _triggerMove(percent) {
        this.$emit('progressMove', percent)
      }
    },
    watch: {
      percent(newPercent) {
        this.progressMove(newPercent)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>