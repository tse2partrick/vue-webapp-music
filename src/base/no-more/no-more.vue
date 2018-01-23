<template>
  <div class="no-more">
    <span class="text">{{title}}</span>
  </div>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: '暂无更多内容'
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .no-more
    display: flex
    padding: 5px 0
    .text
      margin: auto
</style>