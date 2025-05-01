import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/LandingPage.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/components/UsernameView.vue')
  },
  {
    path: '/ranks',
    name: 'ranks',
    component: () => import('@/components/RanksView.vue')
  },
  {
    path: '/trade-calculator',
    name: 'trade-calculator',
    component: () => import('@/components/TradeCalculator.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
