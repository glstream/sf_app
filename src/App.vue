<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#277DA1',
        fontFamily: 'Titillium Web'
      }
    }"
  />
</template>

<style scoped></style>
