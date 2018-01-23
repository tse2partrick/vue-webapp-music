import Vue from 'vue'
import Router from 'vue-router'
// import Recommend from 'components/recommend/recommend'
const Recommend = () => import('components/recommend/recommend')
// import Singer from 'components/singer/singer'
const Singer = () => import('components/singer/singer')
// import Rank from 'components/rank/rank'
const Rank = () => import('components/rank/rank')
// import Search from 'components/search/search'
const Search = () => import('components/search/search')
// import SingerDetail from 'components/singer-detail/singer-detail'
const SingerDetail = () => import('components/singer-detail/singer-detail')
// import DiscDetail from 'components/disc-detail/disc-detail'
const DiscDetail = () => import('components/disc-detail/disc-detail')
// import RankDetail from 'components/rank-detail/rank-detail'
const RankDetail = () => import('components/rank-detail/rank-detail')
// import User from 'components/user/user'
const User = () => import('components/user/user')
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: DiscDetail
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: RankDetail
        }
      ]
    },
    {
      path: '/search',
      component: Search
    },
    {
      path: '/user',
      component: User
    }
  ]
})
