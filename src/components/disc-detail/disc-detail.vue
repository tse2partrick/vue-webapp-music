<template>
  <transition name="slide" class="disc-detail">
    <music-list :bg-image="disc.logo" :title="disc.dissname" :songs="songlist"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {createSong} from 'common/js/songs'
  export default {
    data() {
      return {
        songlist: []
      }
    },
    computed: {
      ...mapGetters([
        'disc'
      ])
    },
    created() {
      if (!this.disc.dissid) {
        this.$router.push({
          path: '/recommend'
        })
        return
      }
      this.songlist = this._normalize(this.disc.songlist)
    },
    methods: {
      _normalize(list) {
        let ret = []
        list.forEach((i) => {
          ret.push(createSong(i))
        })

        return ret
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