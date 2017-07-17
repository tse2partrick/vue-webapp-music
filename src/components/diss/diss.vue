<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs" :hasMore="hasMore"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getDissInfo} from 'api/recommend'
  import {createSong} from 'common/js/song'
  import {ERR_OK} from 'api/config'
  export default {
    data() {
      return {
        songs: [],
        hasMore: false
      }
    },
    computed: {
      title() {
        return this.diss.dissname
      },
      bgImage() {
        return this.diss.imgurl
      },
      ...mapGetters([
        'diss'
      ])
    },
    created() {
      if (!this.diss.dissid) {
        this.$router.push('/recommend')
      }
      this._getSongs()
    },
    methods: {
      _getSongs() {
        getDissInfo(this.diss.dissid).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.cdlist[0].songlist)
          }
        })
      },
      _normalizeSongs(list) {
        let songs = []
        list.forEach((item) => {
          songs.push(createSong(item))
        })
        return songs
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style lang="stylus">
  .diss
    position: absolute
    top: 0
    bottom: 0
    left: 0
    right: 0
    background: red
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>