<!-- src/components/AppHeader.vue -->
<template>
  <a-layout-header class="header-class">
    <div class="logo" :style="{ backgroundImage: 'url(' + logoImg + ')' }"></div>
    <a-menu theme="dark" mode="horizontal" :default-selected-keys="['1']">
      <a-menu-item key="1"><router-link to="/username">Home</router-link></a-menu-item>
      <a-menu-item key="2"><router-link :to="leaguesUrl">Leagues</router-link></a-menu-item>
      <a-menu-item key="3"
        ><router-link to="/tradecalculator">Trade Calculator</router-link></a-menu-item
      >
      <a-menu-item key="4"><router-link to="/ranks">Ranks</router-link></a-menu-item>

      <a-menu-item key="5"><router-link to="/about">About</router-link></a-menu-item>
      <!-- Add more menu items as needed -->
    </a-menu>
  </a-layout-header>
</template>

<script setup>
import { computed } from 'vue'
import logoImg from '@/assets/logo_small.png' // Adjust the path as necessary

import { useUserStore } from '@/stores/userStore'

const store = useUserStore()
const leaguesUrl = computed(() => `/leagues/${store.leagueYear}/${store.userName}/${store.guid}`)

// const leaguesUrl = `/leagues/${leagueYear}/${userName}/${guid}`
// const leaguesUrl = `/leagues/2024/gray_matter/788003ab-8b0c-415e-ba1b-593d24a4003c`
</script>

<style scoped>
.logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: transparent;
}

.header-class {
  position: sticky;
  top: 0;
  z-index: 1000;
}
</style>
