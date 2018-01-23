<template>
  <transition name="slide">
    <music-list :bg-image="disc.pic_v12" :title="disc.ListName" :songs="songs" :rank-page="true"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {createSong} from 'common/js/songs'

  export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
      ...mapGetters([
        'topList',
        'disc'
      ])
    },
    created() {
      if (!this.disc.topID) {
        this.$router.push({
          path: '/rank'
        })
      }
    },
    mounted() {
      setTimeout(() => {
        this.songs = this.normalize(this.topList)
      }, 20)
    },
    methods: {
      normalize(songs) {
        let ret = []
        songs.forEach((i) => {
          ret.push(createSong(i.data))
        })

        return ret
      }
    },
    watch: {
      topList(v) {
        setTimeout(() => {
          this.songs = this.normalize(v)
        }, 20)
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style lang="stylus" scoped>
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>