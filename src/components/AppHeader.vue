<!-- src/components/AppHeader.vue -->
<template>
  <a-layout-header :style="{ position: 'fixed', zIndex: 100, width: '100%' }">
    <img class="logo" :src="logoImg" alt="Logo" />
    <a-menu theme="dark" mode="horizontal" :default-selected-keys="['1']">
      <a-menu-item key="1"><router-link to="/username">Home</router-link></a-menu-item>
      <a-menu-item key="3"
        ><router-link to="/tradecalculator" class="menu-item-link"
          ><span class="pi pi-calculator"></span> Trade Calculator</router-link
        ></a-menu-item
      >
      <a-menu-item key="2" @click="handleHeaderClick"
        ><router-link :to="leaguesUrl" class="menu-item-link"
          ><span class="pi pi-th-large"></span> Leagues</router-link
        ></a-menu-item
      >

      <a-menu-item key="4">
        <router-link to="/ranks" class="menu-item-link">
          <span class="pi pi-sort-amount-down"></span>
          <span>Ranks</span>
        </router-link>
      </a-menu-item>

      <a-menu-item key="5"
        ><router-link to="/about" class="menu-item-link"
          ><span class="pi pi-question-circle"></span> About</router-link
        ></a-menu-item
      >
    </a-menu>
  </a-layout-header>
</template>

<script setup>
import { computed, ref } from 'vue'
import logoImg from '@/assets/logo5.png'

import { useUserStore } from '@/stores/userStore'
import { CalculatorOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import 'primeicons/primeicons.css'

const store = useUserStore()
const leaguesUrl = computed(() => `/leagues/${store.leagueYear}/${store.userName}/${store.guid}`)
const showPrompt = ref(false)

const handleHeaderClick = () => {
  if (!store.userName) {
    message.warning('Please fill out your username.') // Show a warning message if username is not set
  }
}
</script>

<style scoped>
.logo {
  width: 50px;
  height: 50px;
  margin: 5px 0px 0px 0;
  float: left;
}
.site-layout .site-layout-background {
  background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
.menu-item-link {
  display: flex;
  align-items: center;
  justify-content: left;
}

.pi {
  margin-right: 5px;
}
</style>
