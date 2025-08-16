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
    async fetchLeagues(leagueYear: string, userName: string, guid: string, platform: string = 'sleeper', leagueId: string = '') {
      this.isLoading = true
      try {
        console.log('LeaguesStore.fetchLeagues - Called with params:', {
          leagueYear, userName, guid, platform, leagueId
        })
        
        const params: any = {
          league_year: leagueYear,
          user_name: userName,
          guid: guid,
          platform: platform
        }
        
        // Add leagueId only if provided (for Fleaflicker)
        if (leagueId) {
          params.league_id = leagueId
        }
        
        // Add cache busting for Fleaflicker to avoid stale cache
        if (platform === 'fleaflicker') {
          params.timestamp = Date.now().toString()
        }
        
        console.log('LeaguesStore.fetchLeagues - Final API params:', params)
        const response = await axios.get(`${apiUrl}/leagues`, { params })
        console.log('LeaguesStore.fetchLeagues - API response:', response.data)
        this.leagues = response.data.map((league) => ({
          ...league,
          guid: guid, // Adding guid to each league object
          platform: league.platform || platform // Ensure platform is included
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
