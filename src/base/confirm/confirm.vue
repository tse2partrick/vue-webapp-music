<template>
  <transition name="flash">
    <div class="confirm" v-show="show">
      <div class="wrapper">
        <h1 class="title" v-html="title"></h1>
        <div class="buttons">
          <div class="btn-sure" @click.stop="onSure">确定</div>
          <div class="btn-cancel" @click.stop="onCancel">取消</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: '您确定要？'
      },
      show: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      onSure() {
        this.$emit('sure')
      },
      onCancel() {
        this.$emit('cancel')
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  .confirm
    position: fixed
    display: flex
    top: 0
    left: 0
    width: 100%
    height: 100%
    background: rgba(0, 0, 0, 0.7)
    z-index: 200
    .wrapper
      margin: auto
      border: 1px solid $color-theme
      width: 80%
      padding: 10px 0
      border-radius: 5px
      text-align: center
      .title
        font-size: $font-size-large
        padding: 10px 0 20px 0
      .buttons
        font-size: $font-size-medium
        color: $color-theme
        padding-bottom: 5px
        .btn-sure
          display: inline-block
          padding: 10px
          border: 1px solid $color-theme
          border-radius: 5px
          margin-right: 10px
        .btn-cancel
          display: inline-block
          padding: 10px
          border: 1px solid $color-theme
          border-radius: 5px
  .flash-enter-active, .flash-leave-active
    transition: all 0.3s
  .flash-enter, .flash-leave-to
    transform: scale(0)
</style>