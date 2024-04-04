<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <RouterView />
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#277DA1'
      }
    }"
  />
</template>

<style scoped></style>
