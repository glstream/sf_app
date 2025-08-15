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
      path: '/league/:leagueId/:platform/:rankType/:guid/:leagueYear/:userName/:leagueName/:rosterType/:userId/:avatar/:leagueStarters/:leagueSize/:rankingSource?',
      component: () => import('../components/LeagueDetailView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/ranks',
      component: () => import('../components/RanksView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/ratemyteam',
      name: 'RateMyTeam',
      component: () => import('../components/RankYourTeam.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/rankyourteam',
      redirect: '/ratemyteam'
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
      path: '/contact',
      name: 'Contact',
      component: () => import('../components/ContactView.vue'),
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
      component: () => import('../components/PrivacyPolicyView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/terms-of-service',
      name: 'terms',
      component: () => import('../components/TermsOfServiceView.vue'),
      beforeEnter: logNavigation
    },
    {
      path: '/:pathMatch(.*)*', // Catch all undefined routes
      redirect: { name: 'trade-calculator' } // Redirect to the trade calculator page
      // Or, if 'trade-calculator' is not a named route, you can use path:
      // redirect: '/trade-calculator'
    }
  ]
})

export default router
