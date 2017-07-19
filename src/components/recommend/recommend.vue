<template>
  <div class="recommend" ref="recommend">
    <scroll class="recommend-content" :data="hotDisses" ref="scroll" :probeType="probeType">
      <div>
        <div class="slider-wrapper" v-if="sliders.length > 0">
          <slider :sliders="sliders">
            <div v-for="item in sliders">
              <a :href="item.linkUrl">
                <img :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h2 class="list-title">热门推荐歌单</h2>
          <div @click="selectDiss(item)" class="item" v-for="item in hotDisses">
            <img class="icon" v-lazy="item.imgurl">
            <div class="text">
              <h2 class="name">{{item.dissname}}</h2>
              <p class="desc">{{item.creator.name}}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="loading-container" v-show="!hotDisses.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getSlider, getHotDiss} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {playListMixin} from 'common/js/mixins'
  import {mapMutations} from 'vuex'
  export default {
    mixins: [playListMixin],
    data() {
      return {
        sliders: [],
        hotDisses: [],
        allReady: -1,
        probeType: 3
      }
    },
    created() {
      this._getSlider()
      setTimeout(() => {
        this._getHotDiss()
      }, 1000)

      this.scroll = {}
    },
    methods: {
      selectDiss(item) {
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setDiss(item)
      },
      playListHandler(playList) {
        let bottom = playList.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      _getSlider() {
        getSlider().then((res) => {
          if (res.code === ERR_OK) {
            this.sliders = res.data.slider
            this.allReady += 1
          }
        })
      },
      _getHotDiss() {
        getHotDiss().then((res) => {
          if (res.code === ERR_OK) {
            this.hotDisses = res.data.list
            this.allReady += 1
          }
        })
      },
      ...mapMutations({
        'setDiss': 'SET_DISS'
      })
    },
    watch: {
      allReady(val) {
        if (val === 1) {
          setTimeout(() => {
            this.$refs.scroll.refresh()
          }, 1000)
        }
      }
    },
    components: {
      Slider,
      Scroll,
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
        overflow: hidden
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