<template>
  <div class="search-box">
    <div class="box-wrapper" @click="onReadyInput">
      <div class="icon-left">
        <i class="icon-search"></i>
      </div>
      <div class="content">
        <input type="text" class="text" ref="text" @input="onTyping" :placeholder="tip" />
      </div>
      <div class="icon-right" v-show="content.length" @click.stop='onCancelContent'>
        <i class="icon-dismiss"></i>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      searchKey: {
        type: String,
        default: ''
      },
      unFocus: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        content: '',
        tip: '输入歌手或歌曲名'
      }
    },
    methods: {
      onReadyInput() {
        this._onFocus()
      },
      onCancelContent() {
        this.$refs.text.value = ''
        this.content = ''
        // this._onFocus()
        this.$emit('onFocus')
      },
      onTyping() {
        clearTimeout(this.typeTimer)
        this.typeTimer = setTimeout(() => {
          this.content = this.$refs.text.value
        }, 300)
      },
      _onFocus() {
        this.$refs.text.focus()
        this.$emit('onFocus')
      }
    },
    watch: {
      content(v) {
        if (v && v.length) {
          this.$emit('search', this.content)
        }

        if (!v) {
          this.$emit('noneContent')
        }
      },
      searchKey(v) {
        this.content = v
        this.$refs.text.value = v
      },
      unFocus(v) {
        if (v) {
          this.$refs.text.blur()
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'

  .search-box
    width: 85%
    margin: 0 auto
    .box-wrapper
      position: relative
      width: 100%
      height: 30px
      background: $color-highlight-background
      color: $color-background-d
      padding: 5px 0
      border-radius: 5px
      .icon-left
        display: inline-block
        width: 10%
        height: 100%
        line-height: 30px
        vertical-align: top
        text-align: center
        font-size: $font-size-large-x
      .content
        display: inline-block
        width: 80%
        height: 100%
        line-height: 30px
        vertical-align: top
        .text
          background: $color-highlight-background
          color: $color-text-ll
          width: 100%
          outline: none
      .icon-right
        position: absolute
        display: inline-block
        left: 90%
        width: 10%
        height: 30px
        line-height: 30px
        vertical-align: top
        text-align: center
</style>