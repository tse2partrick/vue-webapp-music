<template>
  <div class="singer" ref="singer">
    <list-view :data="singers" v-if="singers.length > 0" @selectItem="selectSinger" ref="listView"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getSinger} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/list-view/list-view'
  import {mapMutations} from 'vuex'
  import {playListMixin} from 'common/js/mixins'
  const HOT_TITLE = '热门'
  const HOT_NUM = 10

  export default {
    mixins: [playListMixin],
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSinger()
    },
    methods: {
      playListHandler(playList) {
        let listView = this.$refs.listView
        if (!listView) {
          return
        }
        let bottom = playList.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        listView.refresh()
      },
      selectSinger(item) {
        this.$router.push({
          path: `/singer/${item.id}`
        })
        this.setSinger(item)
        localStorage.setItem('referer', 'singer')
      },
      _getSinger() {
        getSinger().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSingers(res.data.list)
          }
        })
      },
      _normalizeSingers(list) {
        let map = {
          hot: {
            title: HOT_TITLE,
            items: []
          }
        }

        list.forEach((item, index) => {
          if (index < HOT_NUM) {
            map.hot.items.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
          }

          if (!map[item.Findex]) {
            map[item.Findex] = {
              title: item.Findex,
              items: []
            }
          }

          map[item.Findex].items.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
        })

        let hot = []
        let ret = []
        for (let item in map) {
          let val = map[item]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_TITLE) {
            hot.push(val)
          }
        }
        ret.sort((x, y) => {
          return x.title.charCodeAt(0) - y.title.charCodeAt(0)
        })

        return hot.concat(ret)
      },
      ...mapMutations({
        'setSinger': 'SET_SINGER'
      })
    },
    components: {
      ListView
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