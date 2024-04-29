<template>
  <RouterView />
  <a-config-provider :theme="currentTheme" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
import { theme } from 'ant-design-vue'
const { useToken } = theme
const isDarkMode = ref(false)
const currentTheme = computed(() => {
  return themeStore.isDarkMode
    ? {
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#277DA1',
          fontFamily: 'Titillium Web'
        }
      }
    : {
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#277DA1',
          fontFamily: 'Titillium Web'
        }
      }
})
</script>

<style></style>
