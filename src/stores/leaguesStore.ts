// stores/leaguesStore.ts
import { defineStore } from 'pinia'
import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL

export const useLeaguesStore = defineStore('leagues', {
  state: () => ({
    leagues: [],
    isLoading: false
  }),
  actions: {
    async fetchLeagues(leagueYear: string, userName: string, guid: string) {
      this.isLoading = true
      try {
        const response = await axios.get(`${apiUrl}/leagues`, {
          params: {
            league_year: leagueYear,
            user_name: userName,
            guid: guid
          }
        })
        console.log('Leagues fetched:', response.data)
        this.leagues = response.data.map((league) => ({
          ...league,
          guid: guid // Adding guid to each league object
        }))
      } catch (error) {
        console.error('There was an error fetching the leagues:', error)
      } finally {
        this.isLoading = false
      }
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'leagues',
        storage: window.localStorage
      }
    ]
  }
})
