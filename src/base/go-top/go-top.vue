<template>
  <div class="go-top" ref="goTop" @click="onClick">
    <span class="text">回到顶部</span>
  </div>
</template>

<script>
  export default {
    mounted() {
      let width = window.innerWidth

      this.$refs.goTop.style.width = width * 0.1 + 'px'
      this.$refs.goTop.style.height = width * 0.1 + 'px'
    },
    methods: {
      onClick() {
        this.$emit('goTop')
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  
  .go-top
    position: absolute
    display: flex
    background: rgba(133, 133, 133, 0.2)
    width: 80px
    height: 80px
    left: 80%
    top: 80%
    border-radius: 5%
    .text
      margin: auto
      text-align: center
</style>