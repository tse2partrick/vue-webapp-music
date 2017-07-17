<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="topSongs" :isTopList="isTopList"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getTopListSong} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  export default {
    data() {
      return {
        topSongs: [],
        isTopList: true
      }
    },
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        return this.topList.picUrl
      },
      ...mapGetters([
        'topList'
      ])
    },
    created() {
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }
      this._getSong()
    },
    methods: {
      _getSong() {
        getTopListSong(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.topSongs = this._normalizeSong(res.songlist)
          }
        })
      },
      _normalizeSong(list) {
        let ret = []
        list.forEach((item) => {
          ret.push(createSong(item.data))
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
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>