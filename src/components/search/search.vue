<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onSearchQuery"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <scroll class="shortcut" :data="hotKeys" ref="shortcut" @beforeScrollStart="onBeforeScrollStart">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" v-for="item in hotKeys" @click="addQuery(item.k)">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <div class="title">
              <h1 class="text">搜索历史</h1>
              <div class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </div>
            </div>
            <search-list :searchHistory="searchHistory" @delete="onDeleteOne" @select="addQuery"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest :query="query" @select="onSelect" @beforeScrollStart="onBeforeScrollStart" :showSinger="showSinger"></suggest>
    </div>
    <confirm ref="confirm" @confirm="onDeleteAll" text="是否清空所有搜索历史" confirmBtnText="清空"></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
  import SearchBox from 'base/search-box/search-box'
  import {getHotKey} from 'api/search'
  import {ERR_OK} from 'api/config'
  import Suggest from 'components/suggest/suggest'
  import SearchList from 'base/search-list/search-list'
  // import Singer from 'common/js/singer'
  import Scroll from 'base/scroll/scroll'
  import {playListMixin, searchMixin} from 'common/js/mixins'
  import Confirm from 'base/confirm/confirm'
  export default {
    mixins: [playListMixin, searchMixin],
    data() {
      return {
        hotKeys: [],
        showSinger: true
        // query: ''
      }
    },
    created() {
      this._getHotKey()
    },
    /* computed: {
      ...mapGetters([
        'searchHistory'
      ])
    }, */
    methods: {
      showConfirm() {
        this.$refs.confirm.show()
      },
      /* onDeleteOne(item) {
        this.dSearchHistory(item)
      }, */
      onDeleteAll() {
        this.dSearchHistory()
      },
      playListHandler(playList) {
        let bottom = playList.length > 0 ? '60px' : ''
        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()

        this.$refs.searchResult.style.bottom = bottom
        this.$refs.shortcut.refresh()
      },
      onClear() {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        }, 1000)
      },
      /* onBeforeScrollStart() {
        this.$refs.searchBox.blur()
      },
      onSelect(item) {
        if (item.type === 'isSinger') {
          this.$router.push({
            path: `/search/${item.singermid}`
          })
          localStorage.setItem('referer', 'search')
          this.saveHistory(item.singername)
          this.setSinger(new Singer(item.singermid, item.singername))
        } else {
          this.selectPlay(item)
          this.saveHistory(item.songname)
        }
      },
      onSearchQuery(query) {
        this.query = query
      },
      addQuery(query) {
        this.$refs.searchBox.addQuery(query)
      }, */
      _getHotKey() {
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            this.hotKeys = res.data.hotkey.slice(0, 10)
          }
        })
      }
     /* ...mapMutations({
        'setSinger': 'SET_SINGER'
      }), */
      /* ...mapActions([
        'selectPlay',
        'saveHistory',
        'dSearchHistory'
      ]) */
    },
    watch: {
      searchHistory() {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        }, 20)
      }
    },
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Scroll,
      Confirm
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>