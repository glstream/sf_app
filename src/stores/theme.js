import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false
  }),
  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
    },
    initializeTheme() {
      const storedTheme = localStorage.getItem('darkMode')
      this.isDarkMode = storedTheme === 'true'
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'my-theme',
        storage: localStorage,
        paths: ['isDarkMode']
      }
    ]
  }
})
