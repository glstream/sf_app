<template>
  <a-row align="middle">
    <a-col flex="auto">
      <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" />
    </a-col>
  </a-row>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import logoImg from '@/assets/logo5.png'

import { useUserStore } from '@/stores/userStore'
import { message, MenuProps } from 'ant-design-vue'
import {
  HomeOutlined,
  CalculatorOutlined,
  SettingOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue'

import { useLeaguesStore } from '@/stores/leaguesStore' // Importing the leagues store

const leaguesStore = useLeaguesStore() // Use the leagues store

const store = useUserStore()
const leaguesUrl = computed(() => `/leagues/${store.leagueYear}/${store.userName}/${store.guid}`)

function groupLeaguesByType(leagues) {
  return leagues.reduce((acc, league) => {
    const type = league.league_type || 'Other' // Use 'Other' as a default group if league_type is undefined
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(league)
    return acc
  }, {})
}

const current = ref<string[]>(['mail'])
const leagueGroups = computed(() => {
  const grouped = groupLeaguesByType(leaguesStore.leagues)
  return Object.keys(grouped).map((leagueType) => ({
    key: `group-${leagueType}`,
    label: leagueType,
    children: grouped[leagueType].map((league) => ({
      key: league.league_id,
      label: h(
        'a',
        {
          href: `/league/${league.league_id}/sf/${league.league_type}/${league.guid}/${league.league_year}/${league.user_name}/${league.league_name}/${league.roster_type}/${league.user_id}/${league.avatar}/${league.starter_cnt}/${league.total_rosters}`
        },
        league.league_name
      )
    }))
  }))
})

const items = ref<MenuProps['items']>([
  {
    key: 'home',
    icon: () => h(HomeOutlined),
    label: h('a', { href: '/' }, 'Home'),
    title: 'Home'
  },
  {
    key: 'tradeCalculator',
    icon: () => h(CalculatorOutlined),
    label: h('a', { href: '/tradecalculator' }, 'Trade Calculator'),
    title: 'Trade Calculator'
  },
  {
    key: 'Leagues',
    icon: () => h(AppstoreOutlined),
    label: h('a', { href: leaguesUrl.value }, 'Leagues'),
    title: 'Leagues',
    children: leagueGroups.value
  },
  {
    key: 'ranks',
    icon: () => h(OrderedListOutlined),
    label: h('a', { href: '/ranks' }, 'Rankings'),
    title: 'Rankings'
  },
  {
    key: 'about',
    icon: () => h(QuestionCircleOutlined),
    label: h('a', { href: '/about' }, 'About'),
    title: 'About'
  }
])
</script>
<style scoped>
.transparent-bg {
  background-color: transparent !important;
  height: 50px;
}
</style>
