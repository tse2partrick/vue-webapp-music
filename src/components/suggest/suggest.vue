<template>
  <scroll class="suggest" :data="searchResults" :pullUp="pullUp" @scrollToEnd="onScrollToEnd" @beforeScrollStart="onBeforeScrollStart">
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in searchResults" @click="selectItem(item)">
        <div class="icon">
          <i :class="iconCls(item)"></i>
        </div>
        <div class="name">
          <span class="text" v-html="getText(item)"></span>
        </div>
      </li>
      <loading v-show="hasMore"></loading>
      <div class="no-result-wrapper" v-show="!hasMore && end">
        <no-results :title="noResultTitle"></no-results>
      </div>
    </ul>
  </scroll>
</template>

<script>
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import NoResults from 'base/no-results/no-results'
  const TYPE_SINGER = 'isSinger'

  export default {
    data() {
      return {
        searchResults: [],
        pullUp: true,
        hasMore: true,
        end: false,
        page: 1,
        perPage: 20,
        noResult: false
      }
    },
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      noResultTitle() {
        if (!this.noResult && this.end) {
          return '已加载完毕'
        } else {
          return `对不起，没有找到关于"${this.query}"的结果`
        }
      }
    },
    methods: {
      onBeforeScrollStart() {
        this.$emit('beforeScrollStart')
      },
      selectItem(item) {
        this.$emit('select', item)
      },
      onScrollToEnd() {
        this.checkMore()
      },
      checkMore() {
        if (!this.hasMore) {
          return
        }
        this.page++
        setTimeout(() => {
          this._search(true)
        }, 1000)
      },
      iconCls(item) {
        return item.type === TYPE_SINGER ? 'icon-mine' : 'icon-music'
      },
      getText(item) {
        return item.type === TYPE_SINGER ? `${item.singername}` : `${item.songname}-${item.singer}`
      },
      _search(moreSearch) {
        search(this.query, this.page, this.perPage).then((res) => {
          if (res.code === ERR_OK && !moreSearch) {
            this.page = 1
            this.searchResults = this._normalizeData(res.data)
          } else {
            this.searchResults = this.searchResults.concat(this._normalizeData(res.data))
          }
          let song = res.data.song
          this.noResult = false
          if (song.totalnum <= 0) {
            this.noResult = true
            return
          }
          if (song.curpage * this.perPage <= song.totalnum) {
            this.hasMore = true
          } else {
            this.hasMore = false
            this.end = true
          }
        })
      },
      _normalizeData(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid && this.showSinger) {
          ret.push({
            singername: data.zhida.singername,
            singerid: data.zhida.singerid,
            singermid: data.zhida.singermid,
            type: TYPE_SINGER
          })
        }
        if (data.song) {
          data.song.list.forEach((item) => {
            if (item.songid && item.albumid) {
              ret.push(createSong(item))
            }
          })
        }

        return ret
      }
    },
    watch: {
      query() {
        this._search(false)
      }
    },
    components: {
      Scroll,
      Loading,
      NoResults
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
      .no-result-wrapper
        position: relative
        width: 100%
</style>