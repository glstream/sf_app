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
  // The toggleTheme method in the store now handles applying the theme
}
</script>

<style scoped>
/* Position the theme toggle button in the top-right corner */
:deep(.ant-float-btn) {
  right: 24px;
  top: 24px;
}
</style>
