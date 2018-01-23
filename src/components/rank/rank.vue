<template>
  <div class="rank" ref="rank">
    <scroll ref="scroll" class="box-wrapper" :data="QTopList.List" v-if="QTopList.List">
      <div>
        <ul class="qt">
          <li v-for="item in QTopList.List" class="rank-wrapper" @click="onSelectItem(item)">
            <div class="image">
              <img width="100%" height="100%" v-lazy="item.pic_v12" />  
            </div>
            <ul class="rank-content">
              <li class="song" v-for="(song, index) in item.songlist">{{normalizeSong(song, index)}}</li>
            </ul>
          </li>
        </ul>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getRankList, getRankDetail} from 'api/rank'
  import Scroll from 'base/scroll/scroll'
  import {ERR_OK} from 'api/config'
  import {mapMutations} from 'vuex'
  import {playingMixin} from 'common/js/mixin'

  export default {
    mixins: [playingMixin],
    data() {
      return {
        QTopList: []
      }
    },
    created() {
      this._getRankList()
      this.lastTopId = -1
    },
    methods: {
      onSelectItem(item) {
        if (this.lastTopId !== item.topID) {
          this.setTopList([])
          this._getRankDetail(item.topID)
          this.setDisc(item)
        }

        this.$router.push({
          path: `/rank/${item.topID}`
        })
      },
      normalizeSong(song, index) {
        index += 1
        return `${index}. ${song.singername} - ${song.songname}`
      },
      _getRankDetail(topid) {
        getRankDetail(topid).then((res) => {
          if (res.code === ERR_OK) {
            this.setTopList(res.songlist)
            this.lastTopId = topid
          }
        })
      },
      _getRankList() {
        getRankList().then((res) => {
          this.QTopList = res[0]
        })
      },
      _calcView(sequenceList) {
        this.$refs.rank.style.bottom = sequenceList.length > 0 ? '60px' : ''
        if (this.$refs.scroll) {
          this.$refs.scroll._refresh()
        }
      },
      ...mapMutations({
        'setTopList': 'SET_TOP_LIST',
        'setDisc': 'SET_DISC'
      })
    },
    components: {
      Scroll
    }
  }
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'

  .rank
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
    .box-wrapper
      width: 100%
      height: 100%
      overflow: hidden
      .qt
        .rank-wrapper
          padding: 10px 20px
          .image
            display: inline-block
            width: 25%
          .rank-content
            display: inline-block
            vertical-align: top
            padding: 0 5px 5px 5px
            width: 70%
            .song
              font-size: $font-size-medium
              color: $color-text-l
              padding-bottom: 7px
              text-overflow: ellipsis
              overflow: hidden
              white-space: nowrap
</style>