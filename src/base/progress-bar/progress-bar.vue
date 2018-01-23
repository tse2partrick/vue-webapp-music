<template>
  <div class="progress-bar" ref="progressBar" @click="clickBar">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn" @touchstart.stop="onTouchstart" @touchmove.stop="onTouchmove" @touchend.stop="onTouchend">
        <button class="progress-btn" ref="btn"></button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    mounted() {
      this.progressBarWidth = this.$refs.progressBar.clientWidth
      this.btnWidth = this.$refs.btn.clientWidth
    },
    methods: {
      clickBar(e) {
        let percent = (e.pageX - this.$refs.progressBar.getBoundingClientRect().left) / this.$refs.progressBar.clientWidth
        this._moveProgress(percent)
        this.$emit('clickBar', percent)
      },
      onTouchstart(e) {
        this.starting = true
      },
      onTouchmove(e) {
        if (!this.starting) {
          return
        }
        this.moving = true
        this.movePercent = (e.touches[0].pageX - this.$refs.progressBar.getBoundingClientRect().left) / this.$refs.progressBar.clientWidth
        if (this.movePercent <= 0) {
          this.movePercent = 0
        } else if (this.movePercent >= 1) {
          this.movePercent = 1
        }
        this._moveProgress(this.movePercent)
        this.$emit('moving', this.movePercent)
      },
      onTouchend() {
        if (!this.moving) {
          return
        }
        this.$emit('moveEnd', this.movePercent)
        this.starting = false
        this.moving = false
      },
      _moveProgress(v) {
        if (v < 0 || v > 1) {
          return
        }
        let pWidth = this.$refs.progressBar.clientWidth || this.progressBarWidth
        let bWidth = this.$refs.btn.clientWidth || this.btnWidth
        let percent = (pWidth - bWidth) * v
        this.$refs.progress.style.width = percent + 'px'
        this.$refs.progressBtn.style.transform = `translate3d(${percent}px, 0, 0)`
      }
    },
    watch: {
      percent(v) {
        if (this.moving) {
          return
        }
        this._moveProgress(v)
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
          top: 5px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>