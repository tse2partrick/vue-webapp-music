<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="recommendList" :probeType="3" :listenScroll="true" @scroll="onScroll" :silentLoad="true" @silentLoad="onSilentLoad" @refreshDone="onRefreshDone">
      <div>
        <div v-if="sliders.length" class="slider-wrapper">
          <div class="slider-content">
            <slider ref="slider">
              <div v-for="item in sliders">
                <a :href="item.linkUrl">
                  <img :src="item.picUrl">
                </a>
              </div>
            </slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">全部歌单</h1>
          <ul>
            <li class="item" v-for="item in recommendList" @click="onClickDisc(item)">
              <img class="icon" v-lazy="item.imgurl" />
              <div class="text">
                <h2 class="name" v-html="item.dissname"></h2>
                <p class="desc" v-html="item.creator.name"></p>
              </div>
            </li>
          </ul>
        </div>
        <no-more v-if="noMore"></no-more>
        <loading ref="loading" v-show="(!noMore && !recommendList.length) || inLoading"></loading>
      </div>
    </scroll>
    <go-top v-show="showGoTop" @goTop="onGoTop"></go-top>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getRecommend, getRecommendList, getDiscDetail} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import NoMore from 'base/no-more/no-more'
  import GoTop from 'base/go-top/go-top'
  import Loading from 'base/loading/loading'
  import {mapMutations} from 'vuex'
  import {playingMixin} from 'common/js/mixin'

  export default {
    mixins: [playingMixin],
    data() {
      return {
        sliders: [],
        recommendList: [],
        sin: 0,
        ein: 29,
        sum: null,
        scrollY: 0,
        inLoading: false,
        noMore: false
      }
    },
    created() {
      this._getRecommend()
      this._getRecommendList(this.sin, this.ein)
    },
    computed: {
      showGoTop() {
        return this.scrollY <= -(window.innerHeight * 2) ? 1 : 0
      }
    },
    methods: {
      onClickDisc(item) {
        this._getDiscDetail(item.dissid)
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
      },
      onGoTop() {
        this.$refs.scroll._scrollTo(0, 0)
        this.scrollY = 0
      },
      onRefreshDone() {
        this.inLoading = false
      },
      onSilentLoad() {
        if (this.inLoading || this.noMore) {
          return
        }

        this.inLoading = true
        this._getRecommendList(this.sin, this.ein)
      },
      onScroll(pos) {
        this.scrollY = pos.y
      },
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.sliders = res.data.slider
          }
        })
      },
      _getRecommendList(sin, ein) {
        getRecommendList(sin, ein).then((res) => {
          if (res.code === ERR_OK) {
            if (!this.recommendList.length) {
              this.recommendList = res.data.list
            } else {
              res.data.list.forEach((item) => {
                this.recommendList.push(item)
              })
            }
            this.sin = this.ein + 1
            this.ein = this.sin + 29
            if (this.sum !== res.data.sum) {
              this.sum = res.data.sum
            }
            if (this.ein >= this.sum) {
              this.noMore = true
            }
          }
        })
      },
      _getDiscDetail(dissid) {
        getDiscDetail(dissid).then((res) => {
          if (res.code === ERR_OK) {
            this.setDisc(res.cdlist[0])
          }
        })
      },
      _calcView(sequenceList) {
        this.$refs.recommend.style.bottom = sequenceList.length > 0 ? '60px' : ''
        this.$refs.scroll._refresh()
      },
      ...mapMutations({
        'setDisc': 'SET_DISC'
      })
    },
    components: {
      Slider,
      Scroll,
      NoMore,
      GoTop,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        height: 0
        padding-top: 40%
        overflow: hidden
        .slider-content
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 100%
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>