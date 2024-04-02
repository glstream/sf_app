import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/leagues/:leagueYear/:userName/:guid',
      name: 'LeaguesApp',
      component: () => import('../components/LeaguesView.vue')
    },
    {
      path: '/username',
      name: 'UsernameView',
      component: () => import('../components/UsernameView.vue')
    },
    {
      path: '/leaguesummary/:userName/:userId/:leagueId/:leagueName/:leagueSetting/:leagueYear/:leagueStarters/:leagueSize/:leagueType/:guid/:rosterType/:avatar/:rankType',
      component: () => import('../components/LeagueSummaryView.vue')
    },
    {
      path: '/league/:leagueId/:platform/:rankType/:guid/:leagueYear/:userName/:leagueName/:rosterType/:userId/:avatar/',
      component: () => import('../components/LeagueDetailView.vue')
    },
    {
      path: '/ranks',
      component: () => import('../components/RanksView.vue')
    },
    {
      path: '/tradecalculator',
      component: () => import('../components/TradeCalculatorView.vue')
    },
    {
      path: '/analyitcs',
      component: () => import('../components/AnalyticsView.vue')
    },
    {
      path: '/about',
      component: () => import('../components/AboutView.vue')
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('../components/UsernameView.vue') // Ensure you have a NotFound.vue component
    }
  ]
})

export default router
