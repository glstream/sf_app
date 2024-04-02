// store/userStore.ts
import { defineStore } from 'pinia'
import { UserState } from '@/types/user.d.ts' // Adjust the path as necessary

export const useUserStore = defineStore('user', {
  state: () => ({
    leagueYear: '',
    userName: '',
    guid: ''
  }),
  actions: {
    setUserDetails(year, name, guid) {
      this.leagueYear = year
      this.userName = name
      this.guid = guid
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
