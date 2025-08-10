// store/userStore.ts
import { defineStore } from 'pinia'
import { UserState } from '@/types/user.d.ts' // Adjust the path as necessary

export const useUserStore = defineStore('user', {
  state: () => ({
    leagueYear: '',
    userName: '',
    guid: '',
    platform: 'sleeper', // Default to sleeper for backward compatibility
    leagueId: '' // For Fleaflicker league ID
  }),
  actions: {
    setUserDetails(year, name, guid, platform = 'sleeper', leagueId = '') {
      this.leagueYear = year
      this.userName = name
      this.guid = guid
      this.platform = platform
      this.leagueId = leagueId
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage // or sessionStorage
      }
    ]
  }
})
