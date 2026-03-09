<template>
  <a-float-button @click="toggleTheme" :title="themeStore.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
    <template #icon>
      <div class="theme-icon" :class="{ 'dark-mode': themeStore.isDarkMode }">
        <!-- Sun Icon -->
        <svg v-if="!themeStore.isDarkMode" class="icon sun-icon" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <!-- Moon Icon -->
        <svg v-else class="icon moon-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>
    </template>
  </a-float-button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme.js'
const themeStore = useThemeStore()

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
/* Position the theme toggle button in the top-right corner */
:deep(.ant-float-btn) {
  right: 24px;
  top: 24px;
}

.theme-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
}

.icon {
  width: 1em;
  height: 1em;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: currentColor;
}

.sun-icon {
  animation: sunRotate 0.5s ease-out;
}

.moon-icon {
  animation: moonRotate 0.5s ease-out;
}

@keyframes sunRotate {
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

@keyframes moonRotate {
  from {
    opacity: 0;
    transform: rotate(180deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}
</style>
