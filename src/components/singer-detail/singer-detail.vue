<template>
  <transition name="slider">
    <music-list :songs="songs" :title="title" :bgImage="bgImage"></music-list>
  </transition>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {getSongs} from 'api/songs'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/songs'
  import MusicList from 'components/music-list/music-list'

  export default {
    data() {
      return {
        songs: [],
        totalSong: 0,
        startNum: 0
      }
    },
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    created() {
      if (!this.singer.id) {
        this.$router.push({
          path: '/singer'
        })

        return
      }
      this._getSong(this.singer.id, this.startNum)
    },
    methods: {
      _getSong(singerId, startNum) {
        getSongs(singerId, startNum).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalize(res.data.list)
            this.totalSong = res.data.total
          }
        })
      },
      _normalize(songsArr) {
        let ret = []
        songsArr.forEach((i) => {
          ret.push(createSong(i.musicData))
        })

        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style lang="stylus">
  .slider-enter-active, .slider-leave-active
    transition: all 0.3s
  .slider-enter, .slider-leave-to
    transform: translate3d(100%, 0, 0)
</style>