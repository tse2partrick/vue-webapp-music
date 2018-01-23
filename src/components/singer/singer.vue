<template>
  <div class="singer" ref="singer">
    <listview :data="singers" @select="onSelectSinger"></listview>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getSinger} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import Listview from 'base/listview/listview'
  import {mapMutations} from 'vuex'
  import {playingMixin} from 'common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_LENGTH = 10

  export default {
    mixins: [playingMixin],
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSinger()
    },
    methods: {
      onSelectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        this.setSinger(singer)
      },
      _getSinger() {
        getSinger().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalize(res.data.list)
          }
        })
      },
      _normalize(data) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }

        data.forEach((item, index) => {
          if (index < HOT_LENGTH) {
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          }

          if (!map[item.Findex]) {
            map[item.Findex] = {
              title: item.Findex,
              items: []
            }
          }

          map[item.Findex].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        })

        let ret = []
        let hot = []

        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }

        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      _calcView(sequenceList) {
        this.$refs.singer.style.bottom = sequenceList.length > 0 ? '60px' : ''
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      Listview
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>