// stores/theme.js
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false
  }),
  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('darkMode', this.isDarkMode.toString()) // Persist the theme state
    },
    initializeTheme() {
      const storedTheme = localStorage.getItem('darkMode')
      this.isDarkMode = storedTheme === 'true'
    }
  }
})
