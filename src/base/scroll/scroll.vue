<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  const DIRECTION_V = 'vetical'
  const DIRECTION_H = 'horizontal'

  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: false
      },
      listenScroll: {
        type: Boolean,
        default: false
      },
      data: {
        type: Array,
        default: []
      },
      refreshDelay: {
        type: Number,
        default: 20
      },
      beforeScroll: {
        type: Boolean,
        default: false
      },
      direction: {
        type: String,
        default: DIRECTION_V
      },
      silentLoad: {
        type: Boolean,
        default: false
      },
      silentLoadRange: {
        type: Number,
        default: 200
      },
      pullUp: {
        type: Boolean,
        default: true
      }
    },
    mounted() {
      setTimeout(() => {
        this.initScroll()
      }, 20)
    },
    methods: {
      initScroll() {
        if (!this.$refs.wrapper) {
          return
        }

        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click,
          eventPassthrough: this.direction === DIRECTION_V ? DIRECTION_H : DIRECTION_V
        })

        if (this.listenScroll) {
          this.scroll.on('scroll', (pos) => {
            this.$emit('scroll', pos)

            if (this.silentLoad) {
              if (this.scroll.y <= this.scroll.maxScrollY + this.silentLoadRange) {
                this.$emit('silentLoad')
              }
            }
          })
        }

        if (this.pullUp) {
          this.scroll.on('scrollEnd', () => {
            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
              this.$emit('scrollToEnd')
            }
          })
        }

        if (this.beforeScroll) {
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScrollStart')
          })
        }
      },
      _enable() {
        this.scroll && this.scroll.enable()
      },
      _disable() {
        this.scroll && this.scroll.disable()
      },
      _scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      _scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      },
      _refresh() {
        this.scroll && this.scroll.refresh()
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._refresh()
          this.$emit('refreshDone')
        }, this.refreshDelay)
      }
    }
  }
</script>