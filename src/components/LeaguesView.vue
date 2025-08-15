<template>
  <a-layout class="layout">
    <AppHeader />
    <theme-toggle-button />

    <a-layout-content class="responsive-padding" :style="{ marginTop: '12px' }">
      <a-breadcrumb style="padding-top: 10px">
        <a-breadcrumb-item
          ><a href="/"><home-outlined /></a
        ></a-breadcrumb-item>
        <a-breadcrumb-item>Leagues</a-breadcrumb-item>
        <a-breadcrumb-item>
          {{ leagueYear }}
          <template #overlay>
            <a-menu>
              <a-menu-item @click="getCurrentYear">
                <a>{{ leagueInfo.leagueYear }}</a>
              </a-menu-item>
              <a-menu-item @click="getPrevYear">
                <a>Change Year</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-breadcrumb-item>
        <a-breadcrumb-item>{{ leagueInfo.userName }}</a-breadcrumb-item>
      </a-breadcrumb>

      <div class="filters-section">
        <div class="filters-header">
          <h2>Filter Leagues</h2>
          <p>Customize your view by league and roster type</p>
        </div>
        <a-flex :gap="20" class="filters-container">
          <a-select
            placeholder="Select League Type"
            :options="leagueOptions"
            class="filter-select"
            @change="handleLeagueChange"
            v-model="selectedLeagueType"
            mode="multiple"
            :max-tag-count="3"
          >
          </a-select>
          <a-select
            placeholder="Select Roster Type"
            :options="rosterOptions"
            class="filter-select"
            @change="handleRosterChange"
            v-model="selectedRosterType"
            mode="multiple"
            :max-tag-count="3"
          >
          </a-select>
        </a-flex>
      </div>
      <a-spin :spinning="isLoading">
        <!-- Loading State Content -->
        <div v-if="isLoading" class="loading-content">
          <div class="loading-info">
            <h3>Analyzing Your Fantasy Football Leagues</h3>
            <p>We're fetching your league data from Sleeper and preparing detailed analytics...</p>
            <div class="loading-features">
              <div class="loading-feature">
                <strong>Power Rankings:</strong> Compare team strengths across multiple expert sources
              </div>
              <div class="loading-feature">
                <strong>Trade Analysis:</strong> Identify optimal trade opportunities with data-driven insights
              </div>
              <div class="loading-feature">
                <strong>Player Values:</strong> Real-time valuations from Keep Trade Cut, Fantasy Calc, and more
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State Content -->
        <div v-if="!isLoading && filteredData.length === 0" class="empty-state">
          <div class="empty-state-header">
            <h3>No Leagues Found for {{ leagueYear }}</h3>
            <p>Don't worry! Here are some things you can try:</p>
          </div>
          
          <div class="empty-state-suggestions">
            <div class="suggestion-card">
              <h4>Check Your Username</h4>
              <p>Make sure your Sleeper username is spelled correctly. Usernames are case-sensitive.</p>
            </div>
            <div class="suggestion-card">
              <h4>Try Different Year</h4>
              <p>Your leagues might be from a different season. Try changing the year filter above.</p>
            </div>
            <div class="suggestion-card">
              <h4>League Requirements</h4>
              <p>We only show completed leagues with at least 8 teams and standard scoring settings.</p>
            </div>
          </div>

          <div class="help-section">
            <h4>New to Fantasy Navigator?</h4>
            <p>Fantasy Navigator works with Sleeper leagues to provide:</p>
            <ul>
              <li>Comprehensive power rankings using multiple expert sources</li>
              <li>Advanced trade calculator with position scarcity factors</li>
              <li>Player value tracking across dynasty and redraft formats</li>
              <li>League-specific analytics tailored to your scoring settings</li>
            </ul>
          </div>
        </div>
        <div>
          <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
            <div
              class="leagues-container max-width-container"
              v-for="league in filteredData"
              :key="league.league_id"
            >
              <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col class="gutter-row" :span="24">
                  <div class="gutter-box-header">
                    <div class="league-header-content">
                      <img
                        class="league-logo"
                        :src="league.platform === 'fleaflicker' ? defaultimage : `https://sleepercdn.com/avatars/thumbs/${league.avatar}`"
                        @error="(event) => (event.target.src = defaultimage)"
                      />
                      <div class="league-title-section">
                        <span class="league-name">{{ league.league_name }}</span>
                        <span class="league-year">{{ league.league_year }} Season</span>
                      </div>
                    </div>
                  </div>
                </a-col>
              </a-row>
              <a-row justify="space-between" :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col class="gutter-row" :span="12">
                  <div class="gutter-box">
                    <a-tag> {{ league.roster_type }}</a-tag>
                    <a-tag
                      style="margin-left: 10px"
                      :color="
                        league.league_type === 'Dynasty'
                          ? 'cyan'
                          : league.league_type === 'Redraft'
                            ? 'green'
                            : 'red'
                      "
                    >
                      {{ league.league_type }}</a-tag
                    >
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="gutter-box-refresh">
                    <a-tooltip>
                      <template #title>View detailed power rankings and analysis</template>
                      <a-select
                        placeholder="📊 Power Ranks"
                        size="default"
                        class="power-ranks-select"
                        @change="(value) => handleSelectChange(value, league)"
                        :value="null"
                      >
                        <a-select-option
                          v-for="source in sources"
                          :key="source.key"
                          :value="source.key"
                        >
                          <span class="rank-option">
                            <img :src="source.logo" alt="source.name" class="rank-source-logo" />
                            {{ source.name }}
                          </span>
                        </a-select-option>
                        <a-select-option key="summary" value="summary">
                          <span class="rank-option">
                            <FileSearchOutlined class="summary-icon" />
                            League Summary
                          </span>
                        </a-select-option>
                      </a-select>
                    </a-tooltip>
                  </div>
                </a-col>
              </a-row>
              <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col class="gutter-row" :span="24">
                  <div class="gutter-box">
                    <span style="padding-right: 5px">League Size</span>
                    <a-tag class="standard-tag">{{ league.total_rosters }}</a-tag>
                    <span style="padding-right: 5px">Starters</span>
                    <a-tag class="standard-tag">{{ league.starter_cnt }}</a-tag>
                    <span style="padding-right: 5px">Roster Size</span>
                    <a-tag class="standard-tag">{{ league.total_roster_cnt }}</a-tag>
                  </div>
                </a-col>
              </a-row>
              <!-- Power Rankings Comparison for all leagues including Fleaflicker -->
              <div class="leagues-stats-container">
                <div class="stats-header">
                  <h3>Power Rankings Comparison</h3>
                  <p>Compare your team's rankings across multiple platforms</p>
                </div>
                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }" class="stats-table-header">
                  <a-col class="gutter-row" :span="8"> </a-col>
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats column-header">Overall</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats column-header">Starters</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats column-header">Bench</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats column-header">Picks</div></a-col
                  >
                </a-row>
                <a-row
                  :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }"
                  class="clickable-platform-row"
                  @click="handlePlatformClick('sf', league)"
                >
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header clickable-platform-header">
                      FantasyNavigator
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.sf_power_rank)">{{
                        addOrdinalSuffix(league.sf_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.sf_starters_rank))">{{
                        addOrdinalSuffix(league.sf_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.sf_bench_rank))">{{
                        addOrdinalSuffix(league.sf_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.sf_picks_rank))">{{
                        addOrdinalSuffix(league.sf_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
                <a-row
                  :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }"
                  class="clickable-platform-row"
                  @click="handlePlatformClick('ktc', league)"
                >
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header clickable-platform-header">
                      KeepTradeCut
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.ktc_power_rank)">{{
                        addOrdinalSuffix(league.ktc_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.ktc_starters_rank))">{{
                        addOrdinalSuffix(league.ktc_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.ktc_bench_rank))">{{
                        addOrdinalSuffix(league.ktc_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.ktc_picks_rank))">{{
                        addOrdinalSuffix(league.ktc_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
                <a-row
                  :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }"
                  class="clickable-platform-row"
                  @click="handlePlatformClick('dp', league)"
                >
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header clickable-platform-header">
                      DynastyProcess
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.dp_power_rank)">{{
                        addOrdinalSuffix(league.dp_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dp_starters_rank))">{{
                        addOrdinalSuffix(league.dp_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dp_bench_rank))">{{
                        addOrdinalSuffix(league.dp_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dp_picks_rank))">{{
                        addOrdinalSuffix(league.dp_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
                <a-row
                  :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }"
                  class="clickable-platform-row"
                  @click="handlePlatformClick('fc', league)"
                >
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header clickable-platform-header">
                      FantasyCalc
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.fc_power_rank)">{{
                        addOrdinalSuffix(league.fc_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.fc_starters_rank))">{{
                        addOrdinalSuffix(league.fc_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.fc_bench_rank))">{{
                        addOrdinalSuffix(league.fc_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.fc_picks_rank))">{{
                        addOrdinalSuffix(league.fc_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
                <a-row
                  :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }"
                  class="clickable-platform-row"
                  @click="handlePlatformClick('dd', league)"
                >
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header clickable-platform-header">
                      DynastyDaddy
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.dd_power_rank)">{{
                        addOrdinalSuffix(league.dd_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dd_starters_rank))">{{
                        addOrdinalSuffix(league.dd_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dd_bench_rank))">{{
                        addOrdinalSuffix(league.dd_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dd_picks_rank))">{{
                        addOrdinalSuffix(league.dd_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
              </div>
            </div>
          </a-row>
        </div>
      </a-spin>
    </a-layout-content>
    <!-- About Section for Google AdSense Approval -->
    <div class="about-site-section">
      <h1 class="about-site-title">About Fantasy Navigator</h1>
      <p>
        Welcome to the Leagues Overview! Here you can explore detailed rankings and statistics for
        your fantasy football leagues, powered by multiple trusted sources. Use the filters to find
        leagues by type and roster settings, and compare your teams' strengths across power,
        starters, bench, and draft picks. Our platform is dedicated to helping fantasy football
        managers make informed decisions and improve their league performance.
      </p>
      <p class="about-site-disclaimer">
        Fantasy Navigator is an independent project and is not affiliated with the NFL, Sleeper,
        ESPN, Yahoo, or any official fantasy sports provider.
      </p>
    </div>

    <AppFooter />
  </a-layout>
</template>
<script lang="ts" setup>
// Vue Imports
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// 3rd Party imports
import {
  HomeOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  DownOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import type { SelectProps, MenuProps } from 'ant-design-vue'

import 'primeicons/primeicons.css'

import axios from 'axios'
import { useUserStore } from '@/stores/userStore'
import { useLeaguesStore } from '@/stores/leaguesStore'

// Initialize stores
const userStore = useUserStore()
const leaguesStore = useLeaguesStore()

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'
import { getCellStyle } from '../utils/dynamicColorTable'

// Source image imports
import defaultimage from '@/assets/logo4.png'
import fnLogo from '@/assets/sourceLogos/fn.png'
import ktcLogo from '@/assets/sourceLogos/ktc.png'
import dpLogo from '@/assets/sourceLogos/dp.png'
import fcLogo from '@/assets/sourceLogos/fc.png'
import ddLogo from '@/assets/sourceLogos/dd.svg'

// configs
const route = useRoute()
// Use leagues store data and loading state
const leaguesData = computed(() => leaguesStore.leagues)
const isLoading = computed(() => leaguesStore.isLoading)
const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL

const userName = route.params.userName as string
const leagueYear = route.params.leagueYear as string
const guid = route.params.guid as string
const leagueName = route.params.leagueName as string

const selectedLeagueType = ref('')
const selectedRosterType = ref('')

const sources = [
  { key: 'sf', name: 'FantasyNavigator', logo: fnLogo },
  { key: 'ktc', name: 'KeepTradeCut', logo: ktcLogo },
  { key: 'dp', name: 'DynastyProcess', logo: dpLogo },
  { key: 'fc', name: 'FantasyCalc', logo: fcLogo },
  { key: 'dd', name: 'DynastyDaddy', logo: ddLogo }
]

const leagueInfo = reactive({
  userName: userName,
  leagueYear: leagueYear,
  guid: guid as string
})

onMounted(() => {
  // Scroll to top immediately when component mounts
  window.scrollTo(0, 0)
  
  // Check if we already have leagues data, if not fetch it
  if (leaguesStore.leagues.length === 0) {
    console.log('LeaguesView onMounted - No leagues in store, fetching...')
    const leagueYear = route.params.leagueYear as string
    const userName = route.params.userName as string
    const guid = route.params.guid as string
    
    if (leagueYear && userName && guid) {
      fetchData(leagueYear, userName, guid)
    }
  } else {
    console.log('LeaguesView onMounted - Using existing leagues from store:', leaguesStore.leagues.length)
  }
})

const filteredData = computed(() => {
  return leaguesData.value.filter((league) => {
    const matchesLeagueType =
      selectedLeagueType.value.length === 0 || selectedLeagueType.value.includes(league.league_type)
    const matchesRosterType =
      selectedRosterType.value.length === 0 || selectedRosterType.value.includes(league.roster_type)
    return matchesLeagueType && matchesRosterType
  })
})

// Watch for loading state changes and scroll to top
watch(isLoading, async (newVal) => {
  if (!newVal) {
    // When loading finishes, ensure we're at the top
    await nextTick()
    window.scrollTo(0, 0)
  }
})

const handleLeagueChange = (value: string) => {
  selectedLeagueType.value = value
}

const handleRosterChange = (value: string) => {
  selectedRosterType.value = value
}

const leagueOptions = ref<SelectProps['options']>([
  {
    value: 'Dynasty',
    label: 'Dynasty'
  },
  {
    value: 'Keeper',
    label: 'Keeper'
  },
  {
    value: 'Redraft',
    label: 'Redraft'
  }
])

const rosterOptions = ref<SelectProps['options']>([
  {
    value: 'Superflex',
    label: 'Superflex'
  },
  {
    value: 'Single QB',
    label: 'Single QB'
  }
])

async function fetchData(leagueYear: string, userName: string, guid: string) {
  // Use the leagues store to fetch data, which has the correct platform logic
  console.log('LeaguesView fetchData - userStore state:', {
    platform: userStore.platform,
    leagueId: userStore.leagueId,
    userName: userStore.userName,
    leagueYear: userStore.leagueYear
  })
  
  // Use leagues store fetchLeagues method which has correct platform handling
  await leaguesStore.fetchLeagues(
    leagueYear, 
    userName, 
    guid, 
    userStore.platform || 'sleeper', 
    userStore.leagueId || ''
  )
}

const handleMenuClick = (e, league) => {
  console.log('e', e)
  console.log('league', league)
  if (e.key === 'summary') {
    getLeagueSummary(league)
  } else {
    getLeagueDetail(e, league)
  }
}

const handleSelectChange = (value, league) => {
  console.log('Selected value:', value)
  console.log('league', league)
  if (value === 'summary') {
    getLeagueSummary(league)
  } else {
    const mockEvent = { key: value }
    getLeagueDetail(mockEvent, league)
  }
}

const handlePlatformClick = (platformKey, league) => {
  // Create an event object similar to the menu click event
  const mockEvent = { key: platformKey }
  getLeagueDetail(mockEvent, league)
}

const getLeagueDetail: MenuProps['onClick'] = (e, league) => {
  try {
    console.log('getLeagueDetail - league data:', league)
    console.log('getLeagueDetail - platform key:', e.key)
    
    const leagueId = league.league_id
    const guid = league.session_id || league.guid // Fallback to guid if session_id missing
    const leagueYear = league.league_year
    const userName = encodeURIComponent(league.user_name)
    const leagueName = encodeURIComponent(league.league_name)
    const userId = league.user_id
    const avatar = league.avatar || 'default' // Default to 'default' if missing to avoid empty URL segment
    
    // Fix rankType - convert numeric league_type to string if needed
    let rankType = league.league_type
    if (typeof rankType === 'number') {
      // league_type might be numeric (1=Dynasty, 2=Keeper, 3=Redraft)
      // But we need to check the actual mapping used
      rankType = 'Dynasty' // Default to Dynasty for now
    } else if (!rankType) {
      rankType = 'Dynasty'
    }
    
    const rosterType = league.roster_type
    const platform = league.platform || e.key  // Use league's actual platform, fallback to menu key
    const starterCnt = league.starter_cnt || league.starter_count || 0
    const totalRosters = league.total_rosters
    
    // Log all values before navigation
    console.log('Navigation params:', {
      leagueId,
      platform,
      rankType,
      guid,
      leagueYear,
      userName,
      leagueName,
      rosterType,
      userId,
      avatar,
      starterCnt,
      totalRosters
    })
    
    // Check for any undefined values
    const params = [leagueId, platform, rankType, guid, leagueYear, userName, leagueName, rosterType, userId, avatar, starterCnt, totalRosters]
    const hasUndefined = params.some(param => param === undefined || param === null)
    
    if (hasUndefined) {
      console.error('Missing required parameters for navigation:', {
        leagueId: leagueId === undefined ? 'MISSING' : leagueId,
        platform: platform === undefined ? 'MISSING' : platform,
        rankType: rankType === undefined ? 'MISSING' : rankType,
        guid: guid === undefined ? 'MISSING' : guid,
        leagueYear: leagueYear === undefined ? 'MISSING' : leagueYear,
        userName: userName === undefined ? 'MISSING' : userName,
        leagueName: leagueName === undefined ? 'MISSING' : leagueName,
        rosterType: rosterType === undefined ? 'MISSING' : rosterType,
        userId: userId === undefined ? 'MISSING' : userId,
        avatar: avatar === undefined ? 'MISSING' : avatar,
        starterCnt: starterCnt === undefined ? 'MISSING' : starterCnt,
        totalRosters: totalRosters === undefined ? 'MISSING' : totalRosters
      })
      return
    }
    
    const url = `/league/${leagueId}/${platform}/${rankType}/${guid}/${leagueYear}/${userName}/${leagueName}/${rosterType}/${userId}/${avatar}/${starterCnt}/${totalRosters}`
    console.log('Navigating to URL:', url)
    
    router.push(url)
    console.log('Sending to League details')
  } catch (error) {
    console.error('Failed to load league details:', error)
    console.error('Error stack:', error.stack)
    // Optionally, update leagueDetails to indicate an error or show an error message
  } finally {
    console.log('complete')
  }
}

// Function to handle click event
const getLeagueSummary = async (record) => {
  const leagueId = record.league_id
  const guid = record.session_id
  const leagueYear = record.league_year
  const userName = encodeURIComponent(record.user_name)
  const leagueName = encodeURIComponent(record.league_name)
  const rosterType = record.roster_type
  const userId = record.user_id
  const avatar = record.avatar
  const rankType = record.league_type

  const url = `/leaguesummary/${userName}/${userId}/${leagueId}/${leagueName}/${leagueYear}/${record.starter_cnt}/${record.total_rosters}/${record.league_type}/${guid}/${rosterType}/${avatar}/${rankType}`

  router.push(url)
}

const getPrevYear = async () => {
  router.push(`/`)
}

const getCurrentYear = async () => {
  isLoading.value = true
  const leagueYear = leagueInfo.leagueYear
  try {
    await axios.post(`${apiUrl}/user_details`, {
      league_year: `${leagueYear}`,
      user_name: `${userName}`,
      guid: `${guid}`
    })
  } catch (error) {
    console.error('Error performing the action:', error)
  } finally {
    fetchData(leagueYear, userName, guid)
  }
}
</script>
<style scoped>
/* Additional styles for layout */
.layout {
  min-height: 100vh;
  background-color: var(--color-background-soft); /* Use theme variable */
}

/* Loading State Styles */
.loading-content {
  padding: 40px 20px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.loading-info h3 {
  color: var(--color-text);
  margin-bottom: 16px;
  font-size: 1.5rem;
}

.loading-info p {
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  font-size: 1.1rem;
}

.loading-features {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.loading-feature {
  padding: 16px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-align: left;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.loading-feature strong {
  color: var(--color-primary);
}

/* Empty State Styles */
.empty-state {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.empty-state-header {
  text-align: center;
  margin-bottom: 32px;
}

.empty-state-header h3 {
  color: var(--color-text);
  margin-bottom: 12px;
  font-size: 1.5rem;
}

.empty-state-header p {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.empty-state-suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.suggestion-card {
  padding: 20px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.suggestion-card h4 {
  color: var(--color-text);
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.suggestion-card p {
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.help-section {
  padding: 24px;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.help-section h4 {
  color: var(--color-text);
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.help-section p {
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.help-section ul {
  color: var(--color-text-secondary);
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .loading-content,
  .empty-state {
    padding: 24px 16px;
  }
  
  .empty-state-suggestions {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
.table-section {
  display: flex;
  justify-content: left;
}
.league-logo {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid var(--color-border); /* Use theme variable */
  object-fit: cover; /* Ensures the logo fits well */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

@media (max-width: 440px) {
  .responsive-padding {
    padding: 0 12px; /* Slightly more padding */
  }
}

@media (min-width: 440px) {
  .responsive-padding {
    padding: 0 100px;
  }
}
.gutter-box {
  padding: 8px 0;
}
.gutter-box-search {
  padding: 8px 0;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  display: flex;
}

.leagues-container {
  border: 1px solid var(--ant-primary-color, rgb(39, 125, 161)); /* Use Ant Design primary or fallback */
  border-radius: 8px; /* Slightly rounder corners */
  margin-top: 15px;
  transition: all 0.3s ease;
  background-color: var(--color-background); /* Use theme variable */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08); /* Default subtle shadow */
  overflow: hidden; /* Ensures the rounded corners apply to children */
}

.leagues-container:hover {
  border-color: #43aa8b; /* This color could also be a theme variable if desired */
  transform: translateY(-2px); /* Slight lift effect */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Enhanced shadow on hover */
}

.leagues-stats-container {
  border-radius: 5px;
  margin: 5px 5px 10px; /* Added bottom margin */
  background-color: var(--color-background-soft); /* Use theme variable */
  padding: 5px;
}

.fleaflicker-info-section {
  border-radius: 8px;
  margin: 8px 8px 16px;
  background: var(--color-background-soft);
  padding: 16px;
  border: 1px solid rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.1);
  transition: all 0.3s ease;
}

.fleaflicker-info-header {
  text-align: center;
  margin-bottom: 16px;
}

.fleaflicker-info-header h3 {
  color: var(--ant-primary-color, rgb(39, 125, 161));
  margin-bottom: 8px;
  font-size: 1.2rem;
  font-weight: 600;
}

.fleaflicker-info-header p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.9rem;
}


.gutter-box {
  padding: 8px 5px;
}

.gutter-box-panel {
  padding: 8px 5px;
  padding-right: 45px;
}

.gutter-box-header {
  padding: 12px 10px; /* More padding */
  background: linear-gradient(
    to right,
    rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.1),
    transparent
  ); /* Use Ant Design primary with alpha or fallback */
  border-bottom: 1px solid rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.2); /* Use Ant Design primary with alpha or fallback */
  display: flex;
  align-items: center;
}

.gutter-box-detail {
  padding: 8px 5px;
  display: flex;
  justify-content: center;
}

.standard-tag {
  border: 1px solid var(--color-border); /* Use theme variable */
  border-radius: 4px;
  padding: 2px 8px;
  background-color: var(--color-background-mute); /* Use theme variable */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.gutter-box-stats {
  padding: 3px 2px;
  display: flex;
  justify-content: center;
}

.gutter-box-stats-header {
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.gutter-box-stats-top {
  padding: 1px 10px;
  font-size: 1em;
  display: flex;
  justify-content: center;
}

.gutter-box-stats-top-header {
  padding: 8px 10px; /* More top/bottom padding */
  font-size: 1.05em;
  font-weight: 600;
  color: var(--color-heading); /* Use theme variable */
  display: flex;
  justify-content: left;
  border-bottom: 1px solid var(--color-border); /* Use theme variable */
  margin-bottom: 5px;
}


.max-width-container {
  max-width: 380px; /* Slightly wider for better spacing */
  width: 100%;
  margin: 15px 10px; /* More top/bottom margin */
}

.no-leagues-card {
  padding: 30px;
  text-align: center;
  border: 1px solid var(--color-border); /* Use theme variable */
  border-radius: 8px;
  margin-top: 25px;
  background-color: var(--color-background-soft); /* Use theme variable */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-size: 1.1em;
  color: var(--color-text); /* Use theme variable */
}

.gutter-box-refresh {
  display: flex;
  justify-content: right;
  margin-right: 5px;
  margin-top: 8px;
  align-items: baseline;
}

/* New styles for better appearance */
a-tag {
  margin-bottom: 3px; /* Spacing between tags when they wrap */
  transition: all 0.2s ease;
}

a-tag:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

.a-breadcrumb {
  margin-bottom: 15px; /* Add space after breadcrumb */
}

/* Animation for league container appearance */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.leagues-container {
  animation: fadeIn 0.4s ease-out;
}

/* New Enhanced Styles */

/* Filters Section */
.filters-section {
  padding: 30px 0 40px;
  background: linear-gradient(
    135deg,
    rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.05),
    transparent
  );
  border-radius: 12px;
  margin-bottom: 20px;
}

.filters-header {
  text-align: center;
  margin-bottom: 24px;
}

.filters-header h2 {
  margin: 0 0 8px;
  font-size: 1.5em;
  font-weight: 600;
  color: var(--color-heading);
}

.filters-header p {
  margin: 0;
  color: var(--color-text-secondary, #666);
  font-size: 0.95em;
}

.filters-container {
  justify-content: center;
  flex-wrap: wrap;
}

.filter-select {
  width: 200px !important;
  min-width: 175px;
}

/* Enhanced League Header */
.league-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.league-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.league-name {
  font-size: 1.25em;
  font-weight: 600;
  color: var(--color-heading);
  line-height: 1.2;
}

.league-year {
  font-size: 0.85em;
  color: var(--color-text-secondary, #666);
  font-weight: 500;
}

/* Power Ranks Select - Using UsernameView.vue styling */
.power-ranks-select {
  width: 100%;
}

.power-ranks-select .ant-select-selector {
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.power-ranks-select:hover .ant-select-selector {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.1);
}

.power-ranks-select.ant-select-focused .ant-select-selector {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.15);
}

.rank-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-source-logo {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.summary-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Enhanced Stats Section */
.stats-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(
    135deg,
    rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.03),
    transparent
  );
  border-radius: 8px;
}

.stats-header h3 {
  margin: 0 0 6px;
  font-size: 1.2em;
  font-weight: 600;
  color: var(--color-heading);
}

.stats-header p {
  margin: 0;
  font-size: 0.9em;
  color: var(--color-text-secondary, #666);
}

.stats-table-header {
  background: rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.05);
  border-radius: 6px;
  margin-bottom: 8px;
  padding: 8px 0;
}

.column-header {
  font-weight: 600 !important;
  font-size: 0.9em !important;
  color: var(--color-heading) !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Enhanced League Container */
.leagues-container {
  border: 1px solid rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.2);
  border-radius: 12px;
  margin-top: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-background);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
}

.leagues-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--ant-primary-color, #277da1), #43aa8b);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.leagues-container:hover {
  border-color: rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.4);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.leagues-container:hover::before {
  opacity: 1;
}

/* Enhanced Stats Container */
.leagues-stats-container {
  border-radius: 8px;
  margin: 8px 8px 16px;
  background: var(--color-background-soft);
  padding: 16px 8px;
  border: 1px solid rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.1);
}

/* Enhanced Tags */
.standard-tag {
  border: 1px solid rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.2);
  border-radius: 6px;
  padding: 4px 12px;
  background: rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.05);
  box-shadow: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.standard-tag:hover {
  background: rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.1);
  transform: scale(1.02);
}

/* Enhanced League Logo */
.league-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.2);
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.league-logo:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Enhanced Rank Logos */
.rank-source-logo {
  transition: transform 0.2s ease;
}

.rank-source-logo:hover {
  transform: scale(1.05);
}

/* Clickable Platform Rows */
.clickable-platform-row {
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  border-radius: 6px;
  margin: 2px 0;
  padding: 4px 0;
}

.clickable-platform-row:hover {
  background: rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.08) !important;
  transform: translateX(4px);
}

.clickable-platform-header {
  position: relative;
  transition: all 0.2s ease;
}

.clickable-platform-row:active {
  transform: translateX(2px);
  background: rgba(var(--ant-primary-color-rgb, 39, 125, 161), 0.12) !important;
}

/* About Site Section */
.about-site-section {
  margin-bottom: 24px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 18px 20px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.about-site-title {
  font-size: 1.5em;
  margin-bottom: 8px;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.about-site-section p {
  color: var(--color-text);
  transition: color 0.3s ease;
}

.about-site-disclaimer {
  font-size: 0.95em;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

/* Enhanced Responsive Design */
@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: center;
    gap: 16px !important;
  }

  .filter-select {
    width: 100% !important;
    max-width: 300px;
  }

  .league-title-section {
    gap: 2px;
  }

  .league-name {
    font-size: 1.1em;
  }

  .stats-header h3 {
    font-size: 1.1em;
  }

  .column-header {
    font-size: 0.8em !important;
  }

  .clickable-platform-row:hover {
    transform: none;
  }
}
</style>
