<template>
  <a-row align="middle">
    <a-col style="background-color: white; padding-bottom: 5px">
      <img :src="logoImg" alt="Logo" style="height: 40px; display: block" />
    </a-col>
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

const store = useUserStore()
const leaguesUrl = computed(() => `/leagues/${store.leagueYear}/${store.userName}/${store.guid}`)

const current = ref<string[]>(['mail'])
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
    key: 'leagues',
    icon: () => h(AppstoreOutlined),
    label: h('a', { href: leaguesUrl.value }, 'Leagues'),
    title: 'Leagues'
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
.logo {
  height: 50px; /* Adjust the size as per your design requirement */
}
</style>
