import { createRouter, createWebHistory } from 'vue-router'

// Define a beforeEnter function
const logNavigation = (to, from, next) => {
  console.log(`Navigating to ${to.path}`)
  next()
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: () => import('../components/LandingPage.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/leagues/:leagueYear/:userName/:guid',
      name: 'LeaguesApp',
      component: () => import('../components/LeaguesView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/username',
      name: 'UsernameView',
      component: () => import('../components/UsernameView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/leaguesummary/:userName/:userId/:leagueId/:leagueName/:leagueYear/:leagueStarters/:leagueSize/:leagueType/:guid/:rosterType/:avatar/:rankType',
      component: () => import('../components/LeagueSummaryView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/league/:leagueId/:platform/:rankType/:guid/:leagueYear/:userName/:leagueName/:rosterType/:userId/:avatar/:leagueStarters/:leagueSize',
      component: () => import('../components/LeagueDetailView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/ranks',
      component: () => import('../components/RanksView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/tradecalculator',
      component: () => import('../components/TradeCalculatorView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/about',
      component: () => import('../components/AboutView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('../components/UsernameView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/privacy-policy',
      name: 'privacy',
      component: () => import('../components/PrivacyPolicyView.vue')
    }
  ]
})

export default router
