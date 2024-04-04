<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <RouterView />
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#577590',
        fontFamily: 'Titillium Web'
      }
    }"
  />
</template>

<style scoped></style>
