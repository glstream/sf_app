<!-- src/components/AppHeader.vue -->
<template>
  <a-layout-header>
    <a-menu theme="dark" mode="horizontal" :default-selected-keys="['1']">
      <a-menu-item key="1"><router-link to="/username">Home</router-link></a-menu-item>
      <a-menu-item key="3"
        ><router-link to="/tradecalculator"
          ><span class="pi pi-calculator"></span> Trade Calculator</router-link
        ></a-menu-item
      >
      <a-menu-item key="2"
        ><router-link :to="leaguesUrl"
          ><span class="pi pi-th-large"></span> Leagues</router-link
        ></a-menu-item
      >

      <a-menu-item key="4"
        ><router-link to="/ranks"
          ><span class="pi pi-sort-amount-down"></span>Ranks</router-link
        ></a-menu-item
      >

      <a-menu-item key="5"
        ><router-link to="/about"
          ><span class="pi pi-question-circle'"></span>About</router-link
        ></a-menu-item
      >
      <!-- Add more menu items as needed -->
    </a-menu>
  </a-layout-header>
</template>

<script setup>
import { computed } from 'vue'
import logoImg from '@/assets/t1.jpg' // Adjust the path as necessary

import { useUserStore } from '@/stores/userStore'
import { CalculatorOutlined } from '@ant-design/icons-vue'
import 'primeicons/primeicons.css'

const store = useUserStore()
const leaguesUrl = computed(() => `/leagues/${store.leagueYear}/${store.userName}/${store.guid}`)
</script>

<style scoped>
.ant-menu-dark .ant-menu-item {
  font-size: 18px; /* or your desired font size */
}
</style>
