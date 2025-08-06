import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false
  }),
  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      this.applyTheme()
    },
    initializeTheme() {
      // Check if user has saved preference
      const savedTheme = localStorage.getItem('my-theme')
      if (savedTheme) {
        try {
          const themeData = JSON.parse(savedTheme)
          this.isDarkMode = themeData.isDarkMode
        } catch (e) {
          // If parsing fails, check system preference
          this.checkSystemPreference()
        }
      } else {
        // No saved preference, check system preference
        this.checkSystemPreference()
      }

      // Apply initial theme
      this.applyTheme()
    },
    checkSystemPreference() {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.isDarkMode = prefersDark
    },
    applyTheme() {
      // Apply theme to document for CSS variables
      document.documentElement.classList.toggle('dark', this.isDarkMode)
      document.documentElement.classList.toggle('light', !this.isDarkMode)
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
