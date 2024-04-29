<template>
  <a-float-button @click="toggleTheme">
    <template #icon>
      <FormatPainterOutlined />
    </template>
  </a-float-button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme.js' // Adjust the path as necessary
import { theme } from 'ant-design-vue'
import { FormatPainterOutlined } from '@ant-design/icons-vue'
const themeStore = useThemeStore()

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
/* Add button styling if needed */
</style>
