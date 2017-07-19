<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs" @scrollToEnd="onScrollToEnd" :hasMore="hasMore" :noMoreShowFlag="noMoreShowFlag"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSong} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  export default {
    data() {
      return {
        songs: [],
        songNum: 30,
        hasMore: false,
        noMoreShowFlag: false
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
        localStorage['referer'] === 'singer' ? this.$router.push('/singer') : this.$router.push('/search')
      }
      this._getSong()
    },
    methods: {
      onScrollToEnd() {
        if (this.hasMore) {
          this.songNum += 30
          this._getSong()
        }
      },
      _getSong() {
        getSong(this.singer.id, this.songNum).then((res) => {
          if (res.code === ERR_OK) {
            this.hasMore = true
            if (this.songs.length === res.data.list.length) {
              this.hasMore = false
              this.noMoreShowFlag = true
            }
            this.songs = this._normalizeSongs(res.data.list)
          }
        }).catch(() => {
          console.log('没有更多歌曲')
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item, index) => {
          ret.push(createSong(item.musicData))
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